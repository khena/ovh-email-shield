import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getMessage, applyI18n } from '../src/lib/i18n.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('i18n Helper & Locales Catalog', () => {
  const originalBrowser = globalThis.browser;
  const originalChrome = globalThis.chrome;
  const originalDocument = globalThis.document;

  afterEach(() => {
    globalThis.browser = originalBrowser;
    globalThis.chrome = originalChrome;
    globalThis.document = originalDocument;
  });

  test('getMessage returns translated text from browser.i18n', () => {
    globalThis.browser = {
      i18n: {
        getMessage: (key, subs) => {
          if (key === 'hello') return `Hello ${subs?.[0] || 'world'}`;
          return '';
        },
      },
    };

    assert.equal(getMessage('hello', ['Alice']), 'Hello Alice');
    assert.equal(getMessage('missing', null, 'Fallback'), 'Fallback');
  });

  test('getMessage falls back safely when i18n API throws or is absent', () => {
    delete globalThis.browser;
    delete globalThis.chrome;

    assert.equal(getMessage('any_key', null, 'Default Text'), 'Default Text');
    assert.equal(getMessage('any_key'), 'any_key');
    assert.equal(getMessage(''), '');
  });

  test('applyI18n updates textContent, placeholder, title, and aria-label', () => {
    const mockDict = {
      btnLabel: 'Bouton Traduit',
      searchPlaceholder: 'Rechercher...',
      helpTitle: 'Aide en ligne',
      btnAria: 'Bouton d\'aide',
    };

    globalThis.browser = {
      i18n: {
        getMessage: (key) => mockDict[key] || '',
      },
    };

    const elements = [
      {
        attrs: { 'data-i18n': 'btnLabel' },
        textContent: 'Original',
        getAttribute(name) { return this.attrs[name]; },
      },
      {
        attrs: { 'data-i18n-placeholder': 'searchPlaceholder' },
        placeholder: 'Orig Search',
        getAttribute(name) { return this.attrs[name]; },
      },
      {
        attrs: { 'data-i18n-title': 'helpTitle' },
        title: 'Orig Title',
        getAttribute(name) { return this.attrs[name]; },
      },
      {
        attrs: { 'data-i18n-aria-label': 'btnAria' },
        ariaAttrs: {},
        setAttribute(name, val) { this.ariaAttrs[name] = val; },
        getAttribute(name) { return this.attrs[name] || this.ariaAttrs[name]; },
      },
    ];

    const mockRoot = {
      querySelectorAll(selector) {
        if (selector === '[data-i18n]') return [elements[0]];
        if (selector === '[data-i18n-placeholder]') return [elements[1]];
        if (selector === '[data-i18n-title]') return [elements[2]];
        if (selector === '[data-i18n-aria-label]') return [elements[3]];
        return [];
      },
    };

    applyI18n(mockRoot);

    assert.equal(elements[0].textContent, 'Bouton Traduit');
    assert.equal(elements[1].placeholder, 'Rechercher...');
    assert.equal(elements[2].title, 'Aide en ligne');
    assert.equal(elements[3].ariaAttrs['aria-label'], 'Bouton d\'aide');
  });

  test('Locales catalog integrity: FR and EN have identical key sets', () => {
    const frPath = resolve(__dirname, '../_locales/fr/messages.json');
    const enPath = resolve(__dirname, '../_locales/en/messages.json');

    const frCatalog = JSON.parse(readFileSync(frPath, 'utf8'));
    const enCatalog = JSON.parse(readFileSync(enPath, 'utf8'));

    const frKeys = Object.keys(frCatalog).sort();
    const enKeys = Object.keys(enCatalog).sort();

    assert.deepEqual(
      frKeys,
      enKeys,
      `Keys in fr and en locales must match perfectly.\nFR missing: ${enKeys.filter(k => !frCatalog[k])}\nEN missing: ${frKeys.filter(k => !enCatalog[k])}`
    );

    // Each entry must follow WebExtension messages.json schema
    for (const [key, val] of Object.entries(frCatalog)) {
      assert.ok(typeof val.message === 'string', `fr:${key} must have a message property`);
      assert.ok(val.message.length > 0, `fr:${key} message must not be empty`);
    }

    for (const [key, val] of Object.entries(enCatalog)) {
      assert.ok(typeof val.message === 'string', `en:${key} must have a message property`);
      assert.ok(val.message.length > 0, `en:${key} message must not be empty`);
    }
  });
});
