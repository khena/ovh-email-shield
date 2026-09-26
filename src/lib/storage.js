/**
 * Storage helpers for OVH Email Shield
 */
export const STORAGE_KEYS = {
  CONFIG: 'ovh_config',
  HISTORY: 'alias_history',
};

export async function getConfig() {
  const data = await browser.storage.local.get(STORAGE_KEYS.CONFIG);
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

export async function saveConfig(config) {
  await browser.storage.local.set({ [STORAGE_KEYS.CONFIG]: config });
}

export async function getHistory() {
  const data = await browser.storage.local.get(STORAGE_KEYS.HISTORY);
  return data[STORAGE_KEYS.HISTORY] || [];
}

export async function addHistoryEntry(entry) {
  const history = await getHistory();
  history.unshift(entry);
  // Keep max 50 items
  const trimmed = history.slice(0, 50);
  await browser.storage.local.set({ [STORAGE_KEYS.HISTORY]: trimmed });
  return trimmed;
}

export async function removeHistoryEntry(aliasId) {
  const history = await getHistory();
  const updated = history.filter(item => item.id !== aliasId && item.alias !== aliasId);
  await browser.storage.local.set({ [STORAGE_KEYS.HISTORY]: updated });
  return updated;
}

export async function updateHistoryEntry(idOrAlias, patch) {
  const history = await getHistory();
  const updated = history.map(item => {
    if (item.id === idOrAlias || item.alias === idOrAlias) {
      return { ...item, ...patch };
    }
    return item;
  });
  await browser.storage.local.set({ [STORAGE_KEYS.HISTORY]: updated });
  return updated;
}

