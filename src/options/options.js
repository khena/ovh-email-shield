import { getConfig, saveConfig } from '../lib/storage.js';
import { OvhClient } from '../lib/ovh.js';
import { isValidEmail, isValidDomain, sanitizeDomain, isValidPrefixPattern } from '../lib/validation.js';

const form = document.getElementById('config-form');
const endpointInput = document.getElementById('endpoint');
const appKeyInput = document.getElementById('appKey');
const appSecretInput = document.getElementById('appSecret');
const consumerKeyInput = document.getElementById('consumerKey');
const domainInput = document.getElementById('domain');
const destinationEmailInput = document.getElementById('destinationEmail');
const prefixPatternInput = document.getElementById('prefixPattern');
const btnTest = document.getElementById('btn-test');
const statusBox = document.getElementById('status-message');

function showStatus(message, type = 'success') {
  statusBox.textContent = message;
  statusBox.className = `status-box ${type}`;
  statusBox.classList.remove('hidden');
}

function getFormData() {
  const domain = sanitizeDomain(domainInput.value);
  domainInput.value = domain;

  return {
    endpoint: endpointInput.value.trim(),
    appKey: appKeyInput.value.trim(),
    appSecret: appSecretInput.value.trim(),
    consumerKey: consumerKeyInput.value.trim(),
    domain,
    destinationEmail: destinationEmailInput.value.trim().toLowerCase(),
    prefixPattern: prefixPatternInput.value.trim() || 'shield.[site]-[rand]',
  };
}

async function loadSettings() {
  const config = await getConfig();
  endpointInput.value = config.endpoint || 'ovh-eu';
  appKeyInput.value = config.appKey || '';
  appSecretInput.value = config.appSecret || '';
  consumerKeyInput.value = config.consumerKey || '';
  domainInput.value = config.domain || '';
  destinationEmailInput.value = config.destinationEmail || '';
  prefixPatternInput.value = config.prefixPattern || 'shield.[site]-[rand]';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = getFormData();

  if (data.destinationEmail && !isValidEmail(data.destinationEmail)) {
    showStatus('Format d\'adresse email de destination invalide.', 'error');
    destinationEmailInput.focus();
    return;
  }

  if (data.domain && !isValidDomain(data.domain)) {
    showStatus('Nom de domaine OVH invalide (ex: mondomaine.fr).', 'error');
    domainInput.focus();
    return;
  }

  if (data.prefixPattern && !isValidPrefixPattern(data.prefixPattern)) {
    showStatus('Modèle de préfixe invalide. Utilisez uniquement lettres, chiffres, tirets, points et [site]/[rand].', 'error');
    prefixPatternInput.focus();
    return;
  }

  await saveConfig(data);
  showStatus('✓ Configuration enregistrée avec succès.', 'success');
});

btnTest.addEventListener('click', async () => {
  const data = getFormData();
  if (!data.appKey || !data.appSecret || !data.consumerKey) {
    showStatus('Veuillez renseigner AK, AS et CK avant de tester.', 'error');
    return;
  }

  if (data.domain && !isValidDomain(data.domain)) {
    showStatus('Nom de domaine OVH invalide (ex: mondomaine.fr).', 'error');
    domainInput.focus();
    return;
  }

  btnTest.disabled = true;
  btnTest.textContent = 'Test en cours...';

  try {
    const client = new OvhClient(data);
    const authRes = await client.testAuth();

    if (data.domain) {
      await client.listRedirections();
      showStatus(`✓ Connexion réussie ! Identifié OVH (crédential #${authRes?.credentialId || 'OK'}) et domaine "${data.domain}" accessible.`, 'success');
    } else {
      showStatus(`✓ Connexion API OVH valide ! (Pensez à spécifier le domaine cible).`, 'success');
    }
  } catch (err) {
    showStatus(`✗ Échec de connexion OVH : ${err.message}`, 'error');
  } finally {
    btnTest.disabled = false;
    btnTest.textContent = 'Tester la connexion';
  }
});

document.addEventListener('DOMContentLoaded', loadSettings);
