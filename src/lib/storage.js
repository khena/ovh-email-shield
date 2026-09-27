/**
 * Storage helpers for OVH Email Shield
 */
export const STORAGE_KEYS = {
  CONFIG: 'ovh_config',
  HISTORY: 'alias_history',
};

const getStorageApi = () => (globalThis.browser || globalThis.chrome)?.storage?.local;

let mutationQueue = Promise.resolve();

/**
 * Executes a mutation function sequentially through an async queue.
 * Ensures read-modify-write operations on storage are atomic and never collide.
 */
function withMutationLock(fn) {
  const next = mutationQueue.then(fn, fn);
  // Absorb errors so the queue never deadlocks
  mutationQueue = next.catch(() => {});
  return next;
}

export async function getConfig() {
  const data = await getStorageApi().get(STORAGE_KEYS.CONFIG);
  const stored = data[STORAGE_KEYS.CONFIG] || {};
  return {
    endpoint: 'ovh-eu',
    appKey: '',
    appSecret: '',
    consumerKey: '',
    domain: '',
    destinationEmail: '',
    prefixPattern: 'shield.[site]-[rand]',
    ...stored,
  };
}

export function saveConfig(config) {
  return withMutationLock(async () => {
    await getStorageApi().set({ [STORAGE_KEYS.CONFIG]: config });
  });
}

export async function getHistory() {
  const data = await getStorageApi().get(STORAGE_KEYS.HISTORY);
  return data[STORAGE_KEYS.HISTORY] || [];
}

export function addHistoryEntry(entry) {
  return withMutationLock(async () => {
    const history = await getHistory();
    history.unshift(entry);
    // Keep max 50 items
    const trimmed = history.slice(0, 50);
    await getStorageApi().set({ [STORAGE_KEYS.HISTORY]: trimmed });
    return trimmed;
  });
}

export function removeHistoryEntry(aliasId) {
  return withMutationLock(async () => {
    const history = await getHistory();
    const updated = history.filter(item => item.id !== aliasId && item.alias !== aliasId);
    await getStorageApi().set({ [STORAGE_KEYS.HISTORY]: updated });
    return updated;
  });
}

export function updateHistoryEntry(idOrAlias, patch) {
  return withMutationLock(async () => {
    const history = await getHistory();
    const updated = history.map(item => {
      if (item.id === idOrAlias || item.alias === idOrAlias) {
        return { ...item, ...patch };
      }
      return item;
    });
    await getStorageApi().set({ [STORAGE_KEYS.HISTORY]: updated });
    return updated;
  });
}

