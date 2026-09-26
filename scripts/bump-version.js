#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const manifestPath = path.join(rootDir, 'manifest.json');
const packagePath = path.join(rootDir, 'package.json');

const newVersion = process.argv[2];

if (!newVersion) {
  // Synchronise manifest.json depuis package.json si aucun argument
  const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.version = pkg.version;
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  console.log(`✓ Synchronisé manifest.json avec package.json (v${pkg.version})`);
  process.exit(0);
}

// Mise à jour explicite des deux fichiers
const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

pkg.version = newVersion;
manifest.version = newVersion;

fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log(`✓ Version mise à jour à v${newVersion} dans package.json et manifest.json`);
