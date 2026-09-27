/**
 * Internationalization helper for WebExtension (i18n)
 * Wraps browser.i18n.getMessage with safe fallbacks and DOM auto-translation.
 */

/**
 * Retrieve translated message by key with optional placeholders and fallback.
 * @param {string} key - The i18n message key.
 * @param {string|string[]} [substitutions] - Substitution strings.
 * @param {string} [fallback] - Fallback text if translation is missing.
 * @returns {string} Translated string or fallback.
 */
export function getMessage(key, substitutions, fallback = '') {
  if (!key) return fallback;
  try {
    const api = globalThis.browser?.i18n || globalThis.chrome?.i18n;
    if (typeof api?.getMessage === 'function') {
      const msg = api.getMessage(key, substitutions);
      if (msg) return msg;
    }
  } catch {
    // Ignore context or API access errors in restricted scopes
  }
  return fallback || key;
}

/**
 * Apply i18n translations to DOM elements in a given container.
 * Supports:
 * - data-i18n: sets textContent
 * - data-i18n-html: sets innerHTML for safe static formatting (e.g. <code>, <strong>)
 * - data-i18n-placeholder: sets placeholder attribute
 * - data-i18n-title: sets title attribute
 * - data-i18n-aria-label: sets aria-label attribute
 *
 * @param {Document|HTMLElement} [root=document]
 */
export function applyI18n(root = globalThis.document) {
  if (!root || typeof root.querySelectorAll !== 'function') return;

  root.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      el.textContent = getMessage(key, null, el.textContent);
    }
  });

  root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key) {
      el.placeholder = getMessage(key, null, el.placeholder);
    }
  });

  root.querySelectorAll('[data-i18n-title]').forEach((el) => {
    const key = el.getAttribute('data-i18n-title');
    if (key) {
      el.title = getMessage(key, null, el.title);
    }
  });

  root.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria-label');
    if (key) {
      el.setAttribute('aria-label', getMessage(key, null, el.getAttribute('aria-label')));
    }
  });
}
