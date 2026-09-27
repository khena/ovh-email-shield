import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTarget } from '../scripts/build.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

describe('Manifests and Cross-Browser Targets', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  const ffManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.firefox.json'), 'utf8'));
  const chromeManifest = JSON.parse(fs.readFileSync(path.join(rootDir, 'manifest.chrome.json'), 'utf8'));

  test('Both manifests declare Manifest V3 and align with package.json version', () => {
    assert.equal(ffManifest.manifest_version, 3);
    assert.equal(chromeManifest.manifest_version, 3);
    assert.equal(ffManifest.version, pkg.version);
    assert.equal(chromeManifest.version, pkg.version);
  });

  test('Both manifests specify required permissions and OVH host permissions', () => {
    const requiredPerms = ['storage', 'contextMenus', 'activeTab', 'scripting', 'clipboardWrite'];
    for (const perm of requiredPerms) {
      assert.ok(ffManifest.permissions.includes(perm), `Firefox manifest missing ${perm}`);
      assert.ok(chromeManifest.permissions.includes(perm), `Chrome manifest missing ${perm}`);
    }

    assert.ok(ffManifest.host_permissions.includes('https://eu.api.ovh.com/*'));
    assert.ok(ffManifest.host_permissions.includes('https://ca.api.ovh.com/*'));
    assert.ok(chromeManifest.host_permissions.includes('https://eu.api.ovh.com/*'));
    assert.ok(chromeManifest.host_permissions.includes('https://ca.api.ovh.com/*'));
  });

  test('Firefox manifest complies with Gecko MV3 requirements', () => {
    assert.ok(ffManifest.browser_specific_settings?.gecko?.id, 'Missing gecko ID');
    assert.equal(ffManifest.background.scripts[0], 'src/background/background.js');
    assert.equal(ffManifest.background.type, 'module');
    assert.equal(ffManifest.action.default_popup, 'src/popup/popup.html');
  });

  test('Chrome manifest complies with Chromium MV3 Service Worker requirements', () => {
    assert.equal(chromeManifest.browser_specific_settings, undefined, 'Chrome manifest must not include browser_specific_settings');
    assert.equal(chromeManifest.background.service_worker, 'src/background/background.js');
    assert.equal(chromeManifest.background.type, 'module');
    assert.equal(chromeManifest.action.default_popup, 'src/popup/popup.html');

    // Chrome icons should refer to PNGs, not SVGs
    for (const iconPath of Object.values(chromeManifest.icons)) {
      assert.ok(iconPath.endsWith('.png'), `Icon should be PNG in Chrome: ${iconPath}`);
    }
  });

  test('All files referenced in manifests exist on filesystem', () => {
    const checkFiles = (manifest) => {
      const pathsToCheck = [
        manifest.action?.default_popup,
        manifest.options_ui?.page,
        ...(manifest.content_scripts?.[0]?.js || []),
        manifest.background?.service_worker,
        ...(manifest.background?.scripts || []),
        ...Object.values(manifest.icons || {}),
        ...Object.values(manifest.action?.default_icon || {}),
      ].filter(Boolean);

      for (const relPath of pathsToCheck) {
        const fullPath = path.join(rootDir, relPath);
        assert.ok(fs.existsSync(fullPath), `Referenced file does not exist: ${relPath}`);
      }
    };

    checkFiles(ffManifest);
    checkFiles(chromeManifest);
  });

  test('buildTarget builds both distributions with valid manifests and files', () => {
    const ffBuild = buildTarget('firefox');
    assert.ok(fs.existsSync(ffBuild.targetDir));
    assert.ok(fs.existsSync(path.join(ffBuild.targetDir, 'manifest.json')));
    assert.ok(fs.existsSync(ffBuild.zipPath));

    const chromeBuild = buildTarget('chrome');
    assert.ok(fs.existsSync(chromeBuild.targetDir));
    const distChromeManifest = JSON.parse(fs.readFileSync(path.join(chromeBuild.targetDir, 'manifest.json'), 'utf8'));
    assert.equal(distChromeManifest.background.service_worker, 'src/background/background.js');
    assert.ok(fs.existsSync(chromeBuild.zipPath));
  });
});
