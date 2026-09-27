/**
 * Content script for OVH Email Shield
 * Listens for insertion events and manages notification toasts on web pages.
 */

let lastActiveElement = null;

// Track the last focused input/textarea
document.addEventListener('focusin', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
    lastActiveElement = e.target;
  }
});

// Track contextmenu target as fallback
document.addEventListener('contextmenu', (e) => {
  if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable)) {
    lastActiveElement = e.target;
  }
});

function setNativeValue(element, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (prototypeSetter && valueSetter !== prototypeSetter) {
    prototypeSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
}

function showToast(message, isError = false) {
  const existing = document.getElementById('ovh-shield-toast-host');
  if (existing) existing.remove();

  const host = document.createElement('div');
  host.id = 'ovh-shield-toast-host';
  Object.assign(host.style, {
    all: 'initial',
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483647',
    pointerEvents: 'none',
  });

  // Attach closed Shadow Root: host.shadowRoot is null to host scripts
  const shadow = host.attachShadow({ mode: 'closed' });

  const toast = document.createElement('div');
  toast.textContent = message;
  Object.assign(toast.style, {
    all: 'initial',
    display: 'block',
    padding: '12px 18px',
    borderRadius: '8px',
    color: '#ffffff',
    backgroundColor: isError ? '#e53e3e' : '#0050d7',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.4',
    boxSizing: 'border-box',
    transition: 'opacity 0.3s ease, transform 0.3s ease',
    opacity: '0',
    transform: 'translateY(10px)',
    pointerEvents: 'auto',
  });

  shadow.appendChild(toast);
  (document.body || document.documentElement).appendChild(host);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => host.remove(), 300);
  }, 4000);
}

function insertEmail(email) {
  const target = lastActiveElement || document.activeElement;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    target.focus();
    setNativeValue(target, email);
    // Dispatch input & change events for reactive frameworks (React, Vue, Angular)
    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
    showToast(`✓ Alias OVH inséré : ${email}`);
  } else if (target && target.isContentEditable) {
    target.focus();
    document.execCommand('insertText', false, email);
    showToast(`✓ Alias OVH inséré : ${email}`);
  } else {
    // Fallback clipboard
    navigator.clipboard.writeText(email).then(() => {
      showToast(`✓ Alias copié dans presse-papier : ${email}`);
    }).catch(() => {
      showToast(`✓ Alias OVH : ${email}`);
    });
  }
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === 'INSERT_ALIAS' && message.email) {
    insertEmail(message.email);
  } else if (message.type === 'SHOW_NOTIFICATION') {
    showToast(message.message, message.error);
  }
});
