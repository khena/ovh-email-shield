import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEYS,
  getConfig,
  saveConfig,
  getHistory,
  addHistoryEntry,
  removeHistoryEntry,
  updateHistoryEntry,
} from '../src/lib/storage.js';

describe('Storage Helpers', () => {
  let mockStore = {};

  beforeEach(() => {
    mockStore = {};
    globalThis.browser = {
      storage: {
        local: {
          get: async (key) => {
            if (typeof key === 'string') {
              return { [key]: mockStore[key] };
            }
            if (Array.isArray(key)) {
              const res = {};
              key.forEach((k) => { res[k] = mockStore[k]; });
              return res;
            }
            return { ...mockStore };
          },
          set: async (items) => {
            Object.assign(mockStore, items);
          },
        },
      },
    };
  });

  test('getConfig() returns defaults when storage is empty', async () => {
    const config = await getConfig();
    assert.deepEqual(config, {
      endpoint: 'ovh-eu',
      appKey: '',
      appSecret: '',
      consumerKey: '',
      domain: '',
      destinationEmail: '',
      prefixPattern: 'shield.[site]-[rand]',
    });
  });

  test('saveConfig() stores configuration and getConfig() retrieves it', async () => {
    const customConfig = {
      endpoint: 'ovh-ca',
      appKey: 'ak-123',
      appSecret: 'as-456',
      consumerKey: 'ck-789',
      domain: 'mondomaine.ca',
      destinationEmail: 'me@target.com',
      prefixPattern: 'custom-[rand]',
    };

    await saveConfig(customConfig);
    const retrieved = await getConfig();
    assert.deepEqual(retrieved, customConfig);
  });

  test('getHistory() returns empty list by default', async () => {
    const history = await getHistory();
    assert.deepEqual(history, []);
  });

  test('addHistoryEntry() prepends entry to history', async () => {
    const entry1 = { id: '1', alias: 'alias1@dom.fr', destination: 'me@dom.fr', createdAt: '2026-09-26T10:00:00Z' };
    const entry2 = { id: '2', alias: 'alias2@dom.fr', destination: 'me@dom.fr', createdAt: '2026-09-26T10:05:00Z' };

    await addHistoryEntry(entry1);
    const history1 = await getHistory();
    assert.equal(history1.length, 1);
    assert.deepEqual(history1[0], entry1);

    await addHistoryEntry(entry2);
    const history2 = await getHistory();
    assert.equal(history2.length, 2);
    assert.deepEqual(history2[0], entry2);
    assert.deepEqual(history2[1], entry1);
  });

  test('addHistoryEntry() caps history length to 50 items', async () => {
    for (let i = 1; i <= 55; i++) {
      await addHistoryEntry({
        id: `id-${i}`,
        alias: `alias${i}@dom.fr`,
        destination: 'me@dom.fr',
        createdAt: new Date().toISOString(),
      });
    }

    const history = await getHistory();
    assert.equal(history.length, 50);
    assert.equal(history[0].id, 'id-55');
    assert.equal(history[49].id, 'id-6');
  });

  test('removeHistoryEntry() removes entry by ID or alias', async () => {
    await addHistoryEntry({ id: 'red-10', alias: 'first@dom.fr', destination: 'me@dom.fr' });
    await addHistoryEntry({ id: 'red-20', alias: 'second@dom.fr', destination: 'me@dom.fr' });

    await removeHistoryEntry('red-10');
    let history = await getHistory();
    assert.equal(history.length, 1);
    assert.equal(history[0].id, 'red-20');

    // Remove by alias
    await removeHistoryEntry('second@dom.fr');
    history = await getHistory();
    assert.equal(history.length, 0);
  });

  test('updateHistoryEntry() updates matching entry by alias or id', async () => {
    await addHistoryEntry({ id: 'pending-123', alias: 'opt@dom.fr', status: 'pending' });
    await addHistoryEntry({ id: 'active-456', alias: 'other@dom.fr', status: 'active' });

    await updateHistoryEntry('opt@dom.fr', { id: 'ovh-999', status: 'active' });
    const history = await getHistory();
    const updated = history.find(item => item.alias === 'opt@dom.fr');

    assert.equal(updated.id, 'ovh-999');
    assert.equal(updated.status, 'active');

    // Update by ID
    await updateHistoryEntry('ovh-999', { status: 'error', errorMessage: 'Quota exceeded' });
    const history2 = await getHistory();
    const updated2 = history2.find(item => item.id === 'ovh-999');
    assert.equal(updated2.status, 'error');
    assert.equal(updated2.errorMessage, 'Quota exceeded');
  });

  test('addHistoryEntry() handles concurrent asynchronous writes without dropping entries (SEC-07)', async () => {
    const originalGet = globalThis.browser.storage.local.get;
    const originalSet = globalThis.browser.storage.local.set;

    globalThis.browser.storage.local.get = async (key) => {
      await new Promise(resolve => setTimeout(resolve, 5));
      return originalGet(key);
    };
    globalThis.browser.storage.local.set = async (items) => {
      await new Promise(resolve => setTimeout(resolve, 5));
      return originalSet(items);
    };

    await Promise.all([
      addHistoryEntry({ id: 'c-1', alias: 'c1@dom.fr', destination: 'me@dom.fr' }),
      addHistoryEntry({ id: 'c-2', alias: 'c2@dom.fr', destination: 'me@dom.fr' }),
      addHistoryEntry({ id: 'c-3', alias: 'c3@dom.fr', destination: 'me@dom.fr' }),
      addHistoryEntry({ id: 'c-4', alias: 'c4@dom.fr', destination: 'me@dom.fr' }),
      addHistoryEntry({ id: 'c-5', alias: 'c5@dom.fr', destination: 'me@dom.fr' }),
    ]);

    const history = await getHistory();
    assert.equal(history.length, 5, 'All concurrent entries must be preserved');
  });
});
