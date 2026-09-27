#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = pkg.version;

const targets = ['firefox', 'chrome'];
const targetArg = process.argv[2] || 'all';

const activeTargets = targetArg === 'all'
  ? targets
  : targets.filter(t => t === targetArg.toLowerCase());

if (activeTargets.length === 0) {
  console.error(`Cible inconnue "${targetArg}". Choisissez parmi: all, firefox, chrome`);
  process.exit(1);
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

export function buildTarget(target) {
  const targetDir = path.join(distDir, target);
  console.log(`\n📦 Construction pour ${target} (v${version})...`);

  // Nettoyage du répertoire cible
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // 1. Copier les dossiers sources
  copyRecursive(path.join(rootDir, 'src'), path.join(targetDir, 'src'));
  copyRecursive(path.join(rootDir, 'icons'), path.join(targetDir, 'icons'));
  copyRecursive(path.join(rootDir, '_locales'), path.join(targetDir, '_locales'));

  // 2. Injecter le manifest spécifique
  const manifestSource = path.join(rootDir, `manifest.${target}.json`);
  if (!fs.existsSync(manifestSource)) {
    throw new Error(`Manifest source introuvable : ${manifestSource}`);
  }
  const manifestData = JSON.parse(fs.readFileSync(manifestSource, 'utf8'));
  manifestData.version = version;
  fs.writeFileSync(
    path.join(targetDir, 'manifest.json'),
    JSON.stringify(manifestData, null, 2) + '\n',
    'utf8'
  );

  console.log(`  ✓ Fichiers et manifest copiés dans dist/${target}`);

  // 3. Créer l'archive zip
  const zipName = `ovh-email-shield-${target}-v${version}.zip`;
  const zipPath = path.join(distDir, zipName);
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  try {
    execFileSync('zip', ['-r', '-q', zipPath, '.'], {
      cwd: targetDir,
      stdio: 'pipe',
    });
    const stats = fs.statSync(zipPath);
    const sizeKb = (stats.size / 1024).toFixed(1);
    console.log(`  ✓ Archive zip générée : dist/${zipName} (${sizeKb} Ko)`);
  } catch (err) {
    console.warn(`  ⚠️ Impossible de créer le zip via "zip" : ${err.message}`);
  }

  return { target, targetDir, zipPath };
}

// Si exécuté directement
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  fs.mkdirSync(distDir, { recursive: true });
  for (const target of activeTargets) {
    buildTarget(target);
  }
  console.log('\n✨ Build terminé avec succès !');
}
