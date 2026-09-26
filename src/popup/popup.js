import { getConfig, getHistory, removeHistoryEntry } from '../lib/storage.js';
import { OvhClient } from '../lib/ovh.js';

let elements = null;

function initElements() {
  elements = {
    domainBadge: document.getElementById('active-domain-badge'),
    btnOpenOptions: document.getElementById('btn-open-options'),
    btnGoOptions: document.getElementById('btn-go-options'),
    unconfiguredWarning: document.getElementById('unconfigured-warning'),
    btnGenerate: document.getElementById('btn-generate'),
    resultBox: document.getElementById('result-box'),
    generatedEmailInput: document.getElementById('generated-email-input'),
    btnCopyResult: document.getElementById('btn-copy-result'),
    btnInsertPage: document.getElementById('btn-insert-page'),
    historyList: document.getElementById('history-list'),
    historyCount: document.getElementById('history-count'),
    toast: document.getElementById('toast'),
  };
}

let currentConfig = null;

function showToast(text, duration = 2000) {
  elements.toast.textContent = text;
  elements.toast.classList.remove('hidden');
  setTimeout(() => elements.toast.classList.add('hidden'), duration);
}

function setBtnLoading(isLoading) {
  elements.btnGenerate.disabled = isLoading;
  elements.btnGenerate.replaceChildren();

  if (isLoading) {
    const textSpan = document.createElement('span');
    textSpan.className = 'btn-text';
    textSpan.textContent = 'Création chez OVH...';
    elements.btnGenerate.appendChild(textSpan);
  } else {
    const iconSpan = document.createElement('span');
    iconSpan.className = 'btn-icon';
    iconSpan.textContent = '🛡️';
    const textSpan = document.createElement('span');
    textSpan.className = 'btn-text';
    textSpan.textContent = 'Générer un alias';
    elements.btnGenerate.appendChild(iconSpan);
    elements.btnGenerate.appendChild(textSpan);
  }
}

function renderHistory(items) {
  elements.historyCount.textContent = items.length;
  elements.historyList.replaceChildren();

  if (!items.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.textContent = 'Aucun alias récent';
    elements.historyList.appendChild(emptyState);
    return;
  }

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'history-item';

    const dateFormatted = new Date(item.createdAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

    const infoDiv = document.createElement('div');
    infoDiv.className = 'history-info';

    const headerRow = document.createElement('div');
    headerRow.style.display = 'flex';
    headerRow.style.alignItems = 'center';
    headerRow.style.gap = '6px';

    const emailSpan = document.createElement('span');
    emailSpan.className = 'history-email';
    emailSpan.title = item.alias;
    emailSpan.textContent = item.alias;

    const statusBadge = document.createElement('span');
    const status = item.status || 'active';
    statusBadge.className = `status-pill status-${status}`;
    if (status === 'pending') {
      statusBadge.textContent = '⏳ Sync...';
      statusBadge.title = 'Création en cours chez OVH...';
    } else if (status === 'error') {
      statusBadge.textContent = '⚠️ Erreur';
      statusBadge.title = item.errorMessage || 'Échec synchronisation OVH';
    } else {
      statusBadge.textContent = '✓ Actif';
      statusBadge.title = 'Redirection active chez OVH';
    }

    headerRow.appendChild(emailSpan);
    headerRow.appendChild(statusBadge);

    const itemDomain = item.domain || (item.alias.includes('@') ? item.alias.split('@')[1] : currentConfig?.domain || '');

    const metaRow = document.createElement('div');
    metaRow.className = 'history-meta';

    if (item.site) {
      const siteBadge = document.createElement('span');
      siteBadge.className = 'history-site-badge';
      siteBadge.textContent = item.site;
      siteBadge.title = `Site web : ${item.site}`;
      metaRow.appendChild(siteBadge);
    }

    const domainBadge = document.createElement('span');
    domainBadge.className = 'history-domain-badge';
    domainBadge.textContent = `@${itemDomain}`;
    domainBadge.title = `Domaine OVH : ${itemDomain}`;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'history-date';
    dateSpan.textContent = `${dateFormatted} ➔ ${item.destination}`;

    metaRow.appendChild(domainBadge);
    metaRow.appendChild(dateSpan);

    infoDiv.appendChild(headerRow);
    infoDiv.appendChild(metaRow);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'item-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-copy';
    copyBtn.title = 'Copier';
    copyBtn.setAttribute('aria-label', `Copier ${item.alias}`);
    copyBtn.textContent = '📋';
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(item.alias);
        showToast('Copié !');
      } catch {
        showToast('Erreur copie presse-papier', 2000);
      }
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.title = 'Supprimer';
    deleteBtn.setAttribute('aria-label', `Supprimer ${item.alias}`);
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', async () => {
      if (confirm(`Supprimer la redirection OVH pour ${item.alias} (domaine ${itemDomain}) ?`)) {
        await handleDeleteRedirection(item.id, item.alias, itemDomain);
      }
    });

    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(deleteBtn);

    el.appendChild(infoDiv);
    el.appendChild(actionsDiv);

    elements.historyList.appendChild(el);
  });
}

async function handleDeleteRedirection(id, email, itemDomain = null) {
  try {
    const domain = itemDomain || currentConfig?.domain;
    const client = new OvhClient({ ...currentConfig, domain });
    await client.deleteRedirection(id, email);

    let updated = await removeHistoryEntry(id);
    if (email && email !== id) {
      updated = await removeHistoryEntry(email);
    }
    renderHistory(updated);
    showToast('Redirection supprimée');
  } catch (err) {
    showToast(`Erreur suppression: ${err.message}`, 3000);
  }
}

async function init() {
  initElements();
  currentConfig = await getConfig();
  const isConfigured = Boolean(
    currentConfig.appKey &&
    currentConfig.appSecret &&
    currentConfig.consumerKey &&
    currentConfig.domain
  );

  if (isConfigured) {
    elements.domainBadge.textContent = `@${currentConfig.domain}`;
    elements.domainBadge.style.color = '#38ef7d';
    elements.unconfiguredWarning.classList.add('hidden');
    elements.btnGenerate.disabled = false;
  } else {
    elements.domainBadge.textContent = 'Configuration requise';
    elements.domainBadge.style.color = '#f59e0b';
    elements.unconfiguredWarning.classList.remove('hidden');
    elements.btnGenerate.disabled = true;
  }

  const history = await getHistory();
  renderHistory(history);

  // Écouter les changements en arrière-plan (mise à jour statut pending -> active / error)
  if (browser?.storage?.onChanged) {
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.alias_history) {
        renderHistory(changes.alias_history.newValue || []);
      }
    });
  }

  // Event handlers
  const openSettings = () => browser.runtime.openOptionsPage();
  elements.btnOpenOptions.addEventListener('click', openSettings);
  elements.btnGoOptions.addEventListener('click', openSettings);

  elements.btnGenerate.addEventListener('click', async () => {
    setBtnLoading(true);

    try {
      let activeUrl = null;
      try {
        const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
        activeUrl = activeTab?.url || null;
      } catch {
        // pas d'accès aux onglets
      }

      const res = await browser.runtime.sendMessage({
        type: 'GENERATE_ALIAS',
        source: 'popup',
        url: activeUrl,
      });
      if (!res.success) {
        throw new Error(res.error);
      }

      elements.generatedEmailInput.value = res.entry.alias;
      elements.resultBox.classList.remove('hidden');
      try {
        await navigator.clipboard.writeText(res.entry.alias);
        showToast('Alias créé et copié !');
      } catch {
        showToast('Alias créé !');
      }

      const updatedHistory = await getHistory();
      renderHistory(updatedHistory);
    } catch (err) {
      showToast(`Erreur: ${err.message}`, 4000);
    } finally {
      setBtnLoading(false);
    }
  });

  elements.btnCopyResult.addEventListener('click', async () => {
    const email = elements.generatedEmailInput.value;
    if (email) {
      try {
        await navigator.clipboard.writeText(email);
        showToast('Copié !');
      } catch {
        elements.generatedEmailInput.select();
        document.execCommand('copy');
        showToast('Copié !');
      }
    }
  });

  elements.btnInsertPage.addEventListener('click', async () => {
    const email = elements.generatedEmailInput.value;
    if (!email) return;

    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      try {
        await browser.tabs.sendMessage(tab.id, {
          type: 'INSERT_ALIAS',
          email,
        });
        showToast('Inséré dans la page !');
      } catch (err) {
        showToast('Impossible d\'insérer sur cette page', 3000);
      }
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
