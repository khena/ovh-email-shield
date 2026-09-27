import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateRandomSuffix, buildAliasAddress, generateUniqueAliasAddress, extractSiteTag } from '../src/lib/alias.js';

describe('Alias Generator', () => {
  test('generateRandomSuffix() generates alphanumeric string of requested length', () => {
    const s6 = generateRandomSuffix(6);
    assert.equal(s6.length, 6);
    assert.match(s6, /^[a-z0-9]+$/);

    const s10 = generateRandomSuffix(10);
    assert.equal(s10.length, 10);
    assert.match(s10, /^[a-z0-9]+$/);
  });

  test('generateRandomSuffix() generates distinct random strings', () => {
    const s1 = generateRandomSuffix(8);
    const s2 = generateRandomSuffix(8);
    assert.notEqual(s1, s2);
  });

  test('generateRandomSuffix() handles zero or negative length', () => {
    assert.equal(generateRandomSuffix(0), '');
    assert.equal(generateRandomSuffix(-1), '');
  });

  test('generateRandomSuffix() discards biased bytes >= 248 (rejection sampling)', () => {
    const originalGetRandomValues = crypto.getRandomValues;
    try {
      let callCount = 0;
      crypto.getRandomValues = (buffer) => {
        callCount++;
        // First inject biased bytes (248, 255) followed by valid bytes (0 -> 'a', 1 -> 'b')
        if (buffer.length >= 4) {
          buffer[0] = 248; // Should be rejected (>= 248)
          buffer[1] = 255; // Should be rejected (>= 248)
          buffer[2] = 0;   // chars[0] -> 'a'
          buffer[3] = 1;   // chars[1] -> 'b'
          for (let i = 4; i < buffer.length; i++) {
            buffer[i] = 2; // chars[2] -> 'c'
          }
        }
        return buffer;
      };

      const res = generateRandomSuffix(2);
      // Biased bytes 248 and 255 must be rejected, yielding chars[0] ('a') and chars[1] ('b')
      assert.equal(res, 'ab');
    } finally {
      crypto.getRandomValues = originalGetRandomValues;
    }
  });

  test('buildAliasAddress() replaces [rand] with random suffix', () => {
    const email = buildAliasAddress('priv-[rand]', 'example.org');
    assert.match(email, /^priv-[a-z0-9]{6}@example\.org$/);
  });

  test('buildAliasAddress() falls back to shield-[rand] when pattern lacks [rand]', () => {
    const email = buildAliasAddress('no-pattern', 'example.org');
    assert.match(email, /^shield-[a-z0-9]{6}@example\.org$/);
  });

  test('buildAliasAddress() handles null/empty pattern gracefully', () => {
    const emailEmpty = buildAliasAddress('', 'example.org');
    assert.match(emailEmpty, /^shield-[a-z0-9]{6}@example\.org$/);

    const emailNull = buildAliasAddress(null, 'example.org');
    assert.match(emailNull, /^shield-[a-z0-9]{6}@example\.org$/);
  });

  test('generateUniqueAliasAddress() avoids collisions with existing aliases', () => {
    // Generate one and put it in existing
    const first = generateUniqueAliasAddress('shield-[rand]', 'example.org', []);
    assert.match(first, /^shield-[a-z0-9]{6}@example\.org$/);

    // Ensure generateUniqueAliasAddress doesn't pick any alias in existing list
    const existing = [first, 'shield-111111@example.org', 'shield-222222@example.org'];
    for (let i = 0; i < 20; i++) {
      const generated = generateUniqueAliasAddress('shield-[rand]', 'example.org', existing);
      assert.equal(existing.includes(generated), false);
    }
  });

  test('extractSiteTag() extracts clean site name from URLs and hosts', () => {
    assert.equal(extractSiteTag('https://www.amazon.fr/gp/buy'), 'amazon');
    assert.equal(extractSiteTag('https://github.com/settings'), 'github');
    assert.equal(extractSiteTag('https://store.steampowered.com/app/123'), 'steampowered');
    assert.equal(extractSiteTag('https://amazon.co.uk/cart'), 'amazon');
    assert.equal(extractSiteTag('https://service-public.gouv.fr/'), 'service-public');
    assert.equal(extractSiteTag('about:blank'), '');
    assert.equal(extractSiteTag('moz-extension://uuid/page.html'), '');
    assert.equal(extractSiteTag(''), '');
    assert.equal(extractSiteTag(null), '');
  });

  test('buildAliasAddress() formats alias with site tag only when [site] is present', () => {
    // Default pattern shield.[site]-[rand] with site tag
    const emailDefault = buildAliasAddress('shield.[site]-[rand]', 'example.org', 'amazon');
    assert.match(emailDefault, /^shield\.amazon-[a-z0-9]{6}@example\.org$/);

    // Default pattern when siteTag is empty falls back cleanly without dot/dash artefacts
    const emailDefaultNoSite = buildAliasAddress('shield.[site]-[rand]', 'example.org', '');
    assert.match(emailDefaultNoSite, /^shield-[a-z0-9]{6}@example\.org$/);

    // Custom pattern using [site]
    const emailCustom = buildAliasAddress('shield-[site]-[rand]', 'example.org', 'github');
    assert.match(emailCustom, /^shield-github-[a-z0-9]{6}@example\.org$/);

    // Custom pattern using [site] when siteTag is empty
    const emailNoSite = buildAliasAddress('shield-[site]-[rand]', 'example.org', '');
    assert.match(emailNoSite, /^shield-[a-z0-9]{6}@example\.org$/);

    // Pattern WITHOUT [site] ignores site tag (e.g. user wants simple random alias)
    const emailIgnoreSite = buildAliasAddress('shield-[rand]', 'example.org', 'amazon');
    assert.match(emailIgnoreSite, /^shield-[a-z0-9]{6}@example\.org$/);
  });
});
