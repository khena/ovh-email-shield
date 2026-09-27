import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  isValidDomain,
  sanitizeDomain,
  isValidPrefixPattern,
} from '../src/lib/validation.js';

describe('Validation Helpers (SEC-06)', () => {
  describe('isValidEmail', () => {
    test('accepts valid email addresses', () => {
      assert.equal(isValidEmail('user@example.com'), true);
      assert.equal(isValidEmail('firstname.lastname@domain.co.uk'), true);
      assert.equal(isValidEmail('user+tag@sub.domain.org'), true);
      assert.equal(isValidEmail('my_email-123@domain.fr'), true);
    });

    test('rejects invalid email addresses', () => {
      assert.equal(isValidEmail(''), false);
      assert.equal(isValidEmail('plainaddress'), false);
      assert.equal(isValidEmail('@missinguser.com'), false);
      assert.equal(isValidEmail('user@.com'), false);
      assert.equal(isValidEmail('user@domain'), false);
      assert.equal(isValidEmail('user with spaces@domain.com'), false);
      assert.equal(isValidEmail(null), false);
      assert.equal(isValidEmail(undefined), false);
    });
  });

  describe('isValidDomain', () => {
    test('accepts valid domain names', () => {
      assert.equal(isValidDomain('example.com'), true);
      assert.equal(isValidDomain('sub.domain.fr'), true);
      assert.equal(isValidDomain('my-site.co.uk'), true);
    });

    test('rejects invalid domain names', () => {
      assert.equal(isValidDomain(''), false);
      assert.equal(isValidDomain('nodot'), false);
      assert.equal(isValidDomain('-invalid.com'), false);
      assert.equal(isValidDomain('domain..com'), false);
      assert.equal(isValidDomain('domain.com/path'), false);
      assert.equal(isValidDomain('domain.com?query=1'), false);
      assert.equal(isValidDomain(null), false);
    });
  });

  describe('sanitizeDomain', () => {
    test('cleans protocol, slashes, and leading @', () => {
      assert.equal(sanitizeDomain('https://example.com/some/path'), 'example.com');
      assert.equal(sanitizeDomain('http://sub.domain.fr/'), 'sub.domain.fr');
      assert.equal(sanitizeDomain('@domain.com'), 'domain.com');
      assert.equal(sanitizeDomain('   Example.Org   '), 'example.org');
    });
  });

  describe('isValidPrefixPattern', () => {
    test('accepts valid prefix patterns', () => {
      assert.equal(isValidPrefixPattern('shield.[site]-[rand]'), true);
      assert.equal(isValidPrefixPattern('shield-[rand]'), true);
      assert.equal(isValidPrefixPattern('[site].[rand]'), true);
      assert.equal(isValidPrefixPattern('my_alias-[rand]'), true);
      assert.equal(isValidPrefixPattern('[rand]'), true);
    });

    test('rejects patterns with invalid email characters or syntax', () => {
      assert.equal(isValidPrefixPattern(''), false);
      assert.equal(isValidPrefixPattern('shield [rand]'), false); // contains space
      assert.equal(isValidPrefixPattern('shield/[rand]'), false); // contains slash
      assert.equal(isValidPrefixPattern('shield@[rand]'), false); // contains @
      assert.equal(isValidPrefixPattern('.shield-[rand]'), false); // starts with dot
      assert.equal(isValidPrefixPattern('shield-[rand].'), false); // ends with dot
      assert.equal(isValidPrefixPattern('shield..[rand]'), false); // consecutive dots
      assert.equal(isValidPrefixPattern('shield;[rand]'), false); // semicolon
      assert.equal(isValidPrefixPattern(null), false);
    });
  });
});
