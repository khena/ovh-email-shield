#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const manifestPaths = [
  path.join(rootDir, 'manifest.json'),
  path.join(rootDir, 'manifest.firefox.json'),
  path.join(rootDir, 'manifest.chrome.json'),
];
const packagePath = path.join(rootDir, 'package.json');

const newVersion = process.argv[2];

function updateManifest(filePath, version) {
  if (fs.existsSync(filePath)) {
    const manifest = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    manifest.version = version;
    fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  }
}

if (!newVersion) {
  // Synchronise les manifests depuis package.json si aucun argument
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  manifestPaths.forEach(p => updateManifest(p, pkg.version));
  console.log(`✓ Synchronisé les manifests avec package.json (v${pkg.version})`);
  process.exit(0);
}

// Mise à jour explicite de tous les fichiers
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
pkg.version = newVersion;
fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
manifestPaths.forEach(p => updateManifest(p, newVersion));

console.log(`✓ Version mise à jour à v${newVersion} dans package.json et tous les manifests`);
