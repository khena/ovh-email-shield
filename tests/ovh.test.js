import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { OvhClient } from '../src/lib/ovh.js';

describe('OvhClient', () => {
  const config = {
    endpoint: 'ovh-eu',
    appKey: 'test-app-key',
    appSecret: 'test-app-secret',
    consumerKey: 'test-consumer-key',
    domain: 'example.com',
  };

  let originalFetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('isConfigured() returns true when all keys and domain are present', () => {
    const client = new OvhClient(config);
    assert.equal(client.isConfigured(), true);
  });

  test('isConfigured() returns false when any required key is missing', () => {
    const incomplete = new OvhClient({ ...config, consumerKey: '' });
    assert.equal(incomplete.isConfigured(), false);
  });

  test('sign() computes valid OVH SHA-1 signature', async () => {
    const client = new OvhClient(config);
    const method = 'GET';
    const url = 'https://eu.api.ovh.com/1.0/auth/currentCredential';
    const body = '';
    const timestamp = 1700000000;

    const signature = await client.sign(method, url, body, timestamp);

    // Compute expected hash independently with node:crypto
    const rawToSign = [
      config.appSecret,
      config.consumerKey,
      method,
      url,
      body,
      timestamp,
    ].join('+');
    const expectedHash = crypto.createHash('sha1').update(rawToSign).digest('hex');
    const expectedSignature = `$1$${expectedHash}`;

    assert.equal(signature, expectedSignature);
  });

  test('syncTime() adjusts timeDelta based on OVH server time', async () => {
    const serverTimestamp = 1710000050;
    globalThis.fetch = async (url) => {
      assert.equal(url, 'https://eu.api.ovh.com/1.0/auth/time');
      return {
        ok: true,
        text: async () => serverTimestamp.toString(),
      };
    };

    const client = new OvhClient(config);
    await client.syncTime();

    const expectedDelta = serverTimestamp - Math.round(Date.now() / 1000);
    // Allow +/- 2 seconds tolerance for test execution time
    assert.ok(Math.abs(client.timeDelta - expectedDelta) <= 2);
  });

  test('request() throws if client is not configured', async () => {
    const client = new OvhClient({});
    await assert.rejects(
      () => client.request('GET', '/auth/currentCredential'),
      /API OVH non configurée/
    );
  });

  test('request() adds required OVH headers and returns JSON data', async () => {
    let capturedUrl = '';
    let capturedOptions = {};

    globalThis.fetch = async (url, options) => {
      capturedUrl = url;
      capturedOptions = options;
      return {
        ok: true,
        text: async () => JSON.stringify({ credentialId: 12345 }),
      };
    };

    const client = new OvhClient(config);
    const result = await client.request('GET', '/auth/currentCredential');

    assert.equal(capturedUrl, 'https://eu.api.ovh.com/1.0/auth/currentCredential');
    assert.equal(capturedOptions.method, 'GET');
    assert.equal(capturedOptions.headers['X-Ovh-Application'], config.appKey);
    assert.equal(capturedOptions.headers['X-Ovh-Consumer'], config.consumerKey);
    assert.ok(capturedOptions.headers['X-Ovh-Signature'].startsWith('$1$'));
    assert.deepEqual(result, { credentialId: 12345 });
  });

  test('request() throws formatted error message on API failure', async () => {
    globalThis.fetch = async () => ({
      ok: false,
      status: 403,
      text: async () => JSON.stringify({ message: 'Invalid consumer key' }),
    });

    const client = new OvhClient(config);
    await assert.rejects(
      () => client.request('GET', '/auth/currentCredential'),
      /Invalid consumer key/
    );
  });

  test('listRedirections() calls correct endpoint for domain', async () => {
    let requestedUrl = '';
    globalThis.fetch = async (url) => {
      requestedUrl = url;
      return {
        ok: true,
        text: async () => JSON.stringify(['red-123', 'red-456']),
      };
    };

    const client = new OvhClient(config);
    const list = await client.listRedirections();

    assert.equal(requestedUrl, 'https://eu.api.ovh.com/1.0/email/domain/example.com/redirection');
    assert.deepEqual(list, ['red-123', 'red-456']);
  });

  test('createRedirection() posts redirection payload with localCopy', async () => {
    let capturedBody = null;
    let syncTimeCalled = false;

    globalThis.fetch = async (url, options) => {
      if (url.endsWith('/auth/time')) {
        syncTimeCalled = true;
        return { ok: true, text: async () => Math.round(Date.now() / 1000).toString() };
      }
      capturedBody = JSON.parse(options.body);
      return {
        ok: true,
        text: async () => JSON.stringify({ id: 'redir-999' }),
      };
    };

    const client = new OvhClient(config);
    const res = await client.createRedirection('alias@example.com', 'dest@target.com', false);

    assert.ok(syncTimeCalled);
    assert.deepEqual(capturedBody, {
      from: 'alias@example.com',
      to: 'dest@target.com',
      localCopy: false,
    });
    assert.deepEqual(res, { id: 'redir-999' });
  });

  test('deleteRedirection() sends DELETE request for redirection id', async () => {
    let capturedMethod = '';
    let capturedUrl = '';

    globalThis.fetch = async (url, options) => {
      if (url.endsWith('/auth/time')) {
        return { ok: true, text: async () => Math.round(Date.now() / 1000).toString() };
      }
      capturedMethod = options?.method;
      capturedUrl = url;
      return {
        ok: true,
        text: async () => '',
      };
    };

    const client = new OvhClient(config);
    await client.deleteRedirection('redir-999');

    assert.equal(capturedMethod, 'DELETE');
    assert.equal(capturedUrl, 'https://eu.api.ovh.com/1.0/email/domain/example.com/redirection/redir-999');
  });

  test('findRedirectionId() queries redirection endpoint with from filter', async () => {
    let capturedFilterUrl = '';
    globalThis.fetch = async (url) => {
      if (url.endsWith('/auth/time')) {
        return { ok: true, text: async () => Math.round(Date.now() / 1000).toString() };
      }
      if (url.includes('/redirection?from=')) {
        capturedFilterUrl = url;
        return {
          ok: true,
          text: async () => JSON.stringify(['real-id-456']),
        };
      }
      if (url.endsWith('/redirection/real-id-456')) {
        return {
          ok: true,
          text: async () => JSON.stringify({ id: 'real-id-456', from: 'alias@example.com' }),
        };
      }
      return { ok: true, text: async () => '' };
    };

    const client = new OvhClient(config);
    const id = await client.findRedirectionId('alias@example.com');

    assert.equal(id, 'real-id-456');
    assert.ok(capturedFilterUrl.includes('from=alias%40example.com'));
  });

  test('deleteRedirection() resolves real ID by email when id is 0 or pending', async () => {
    let deletedUrl = '';
    globalThis.fetch = async (url, options) => {
      if (url.endsWith('/auth/time')) {
        return { ok: true, text: async () => Math.round(Date.now() / 1000).toString() };
      }
      if (options?.method === 'GET' && url.includes('?from=')) {
        return { ok: true, text: async () => JSON.stringify(['resolved-id-789']) };
      }
      if (options?.method === 'GET' && url.endsWith('/redirection/resolved-id-789')) {
        return { ok: true, text: async () => JSON.stringify({ id: 'resolved-id-789', from: 'alias@example.com' }) };
      }
      if (options?.method === 'DELETE') {
        deletedUrl = url;
        return { ok: true, text: async () => '' };
      }
      return { ok: true, text: async () => '' };
    };

    const client = new OvhClient(config);
    await client.deleteRedirection(0, 'alias@example.com');

    assert.equal(deletedUrl, 'https://eu.api.ovh.com/1.0/email/domain/example.com/redirection/resolved-id-789');
  });

  test('deleteRedirection() returns notFound gracefully if redirection does not exist on OVH', async () => {
    globalThis.fetch = async (url, options) => {
      if (url.endsWith('/auth/time')) {
        return { ok: true, text: async () => Math.round(Date.now() / 1000).toString() };
      }
      if (options?.method === 'GET' && url.includes('?from=')) {
        return { ok: true, text: async () => JSON.stringify([]) };
      }
      return { ok: true, text: async () => '' };
    };

    const client = new OvhClient(config);
    const result = await client.deleteRedirection(0, 'missing@example.com');

    assert.deepEqual(result, { success: true, notFound: true });
  });

  test('findRedirectionId() strictly verifies details.from and ignores mismatched IDs', async () => {
    globalThis.fetch = async (url) => {
      if (url.endsWith('/auth/time')) {
        return { ok: true, text: async () => Math.round(Date.now() / 1000).toString() };
      }
      if (url.includes('/redirection?from=')) {
        return {
          ok: true,
          text: async () => JSON.stringify(['partial-match-1', 'exact-match-2']),
        };
      }
      if (url.endsWith('/redirection/partial-match-1')) {
        return {
          ok: true,
          text: async () => JSON.stringify({ id: 'partial-match-1', from: 'other-alias@example.com' }),
        };
      }
      if (url.endsWith('/redirection/exact-match-2')) {
        return {
          ok: true,
          text: async () => JSON.stringify({ id: 'exact-match-2', from: 'target-alias@example.com' }),
        };
      }
      return { ok: true, text: async () => '' };
    };

    const client = new OvhClient(config);
    const id = await client.findRedirectionId('target-alias@example.com');
    assert.equal(id, 'exact-match-2');
  });

  test('findRedirectionId() returns null when all candidate IDs mismatch target email', async () => {
    globalThis.fetch = async (url) => {
      if (url.endsWith('/auth/time')) {
        return { ok: true, text: async () => Math.round(Date.now() / 1000).toString() };
      }
      if (url.includes('/redirection?from=')) {
        return {
          ok: true,
          text: async () => JSON.stringify(['id-mismatch-1']),
        };
      }
      if (url.endsWith('/redirection/id-mismatch-1')) {
        return {
          ok: true,
          text: async () => JSON.stringify({ id: 'id-mismatch-1', from: 'unrelated@example.com' }),
        };
      }
      return { ok: true, text: async () => '' };
    };

    const client = new OvhClient(config);
    const id = await client.findRedirectionId('my-alias@example.com');
    assert.equal(id, null);
  });
});
