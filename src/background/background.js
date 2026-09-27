/**
 * Background Service Worker / Script for OVH Email Shield
 */
import { getConfig, getHistory, addHistoryEntry, updateHistoryEntry } from '../lib/storage.js';
import { OvhClient } from '../lib/ovh.js';
import { generateUniqueAliasAddress, extractSiteTag } from '../lib/alias.js';

// Setup Context Menu for input fields
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: 'ovh-shield-generate-email',
    title: 'Bouclier OVH : Générer & insérer alias email',
    contexts: ['editable'],
  });
});

/**
 * Background sync with OVH REST API
 */
async function syncRedirectionWithOvh(entry, config, tabId = null) {
  const client = new OvhClient(config);
  try {
    // 1. Déclencher la tâche de création chez OVH
    await client.createRedirection(entry.alias, config.destinationEmail, false);

    // 2. Résoudre le véritable identifiant de redirection auprès d'OVH
    let realId = null;
    try {
      realId = await client.waitForRedirectionId(entry.alias, 4, 1500);
    } catch (e) {
      console.warn('[OVH Email Shield] Attente ID redirection ignorée:', e);
    }

    const finalId = realId || entry.alias;
    await updateHistoryEntry(entry.alias, {
      id: finalId,
      status: 'active',
    });
    console.log(`[OVH Email Shield] Redirection confirmée chez OVH : ${entry.alias} (id: ${finalId})`);
  } catch (err) {
    console.error(`[OVH Email Shield] Échec création OVH pour ${entry.alias}:`, err);
    await updateHistoryEntry(entry.alias, {
      status: 'error',
      errorMessage: err.message,
    });

    if (tabId) {
      try {
        await browser.tabs.sendMessage(tabId, {
          type: 'SHOW_NOTIFICATION',
          error: true,
          message: `⚠️ Échec création OVH (${entry.alias}) : ${err.message}`,
        });
      } catch {
        // Tab fermé ou restreint
      }
    }
  }
}

/**
 * Optimistic alias generation:
 * 1. Checks configuration
 * 2. Generates unique alias checking local history (with optional site tag)
 * 3. Saves provisional entry and returns IMMEDIATELY (0ms)
 * 4. Triggers background OVH API sync asynchronously
 */
export async function createAndRegisterAlias(source = 'manual', tabId = null, urlOrHost = null) {
  const config = await getConfig();
  if (!config.domain || !config.destinationEmail) {
    throw new Error('Configuration incomplète : domaine ou email cible manquant.');
  }

  const history = await getHistory();
  const existingAliases = history.map(item => item.alias);

  // Extract site tag from URL if provided
  const siteTag = urlOrHost ? extractSiteTag(urlOrHost) : '';

  // Generate unique alias without collision
  const aliasEmail = generateUniqueAliasAddress(config.prefixPattern, config.domain, existingAliases, siteTag);

  const entry = {
    id: `pending-${Date.now()}`,
    alias: aliasEmail,
    destination: config.destinationEmail,
    domain: config.domain,
    createdAt: new Date().toISOString(),
    source,
    site: siteTag || undefined,
    status: 'pending',
  };

  await addHistoryEntry(entry);

  // Run OVH sync in background without awaiting
  syncRedirectionWithOvh(entry, config, tabId);

  return entry;
}

// Handle Context Menu click
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'ovh-shield-generate-email' && tab?.id) {
    try {
      // Optimistic generation: immediate return with current tab URL
      const entry = await createAndRegisterAlias('context_menu', tab.id, tab.url);

      // Inject email into the active focused element immediately
      try {
        await browser.tabs.sendMessage(tab.id, {
          type: 'INSERT_ALIAS',
          email: entry.alias,
        });
      } catch {
        // Fallback: If content script was not injected on this tab (e.g. opened before extension load)
        try {
          await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: (email) => {
              const active = document.activeElement;
              if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
                active.focus();
                active.value = email;
                active.dispatchEvent(new Event('input', { bubbles: true }));
                active.dispatchEvent(new Event('change', { bubbles: true }));
              }
            },
            args: [entry.alias],
          });
        } catch {
          // Tab does not allow script execution (e.g. restricted url)
        }
      }
    } catch (err) {
      console.error('Failed to create/insert alias:', err);
      try {
        await browser.tabs.sendMessage(tab.id, {
          type: 'SHOW_NOTIFICATION',
          error: true,
          message: `Erreur OVH : ${err.message}`,
        });
      } catch {
        // Tab might not have content script ready
      }
    }
  }
});

/**
 * Handle runtime messages with sender boundary validation (SEC-02).
 * Rejects messages originating from untrusted web page tabs (content scripts).
 */
export function handleRuntimeMessage(message, sender, sendResponse) {
  if (sender && sender.tab) {
    // Reject calls originating from content scripts
    return false;
  }

  if (message && message.type === 'GENERATE_ALIAS') {
    createAndRegisterAlias(message.source || 'popup', null, message.url)
      .then(entry => sendResponse({ success: true, entry }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // async reply
  }

  return false;
}

// Handle messages from internal extension pages (popup / options)
browser.runtime.onMessage.addListener(handleRuntimeMessage);

