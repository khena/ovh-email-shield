/**
 * DOM Autofill utilities
 * Compatible with React, Vue, Angular, Svelte and Vanilla forms.
 */

export function setNativeValue(element, value) {
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

export function insertEmailIntoElement(target, email) {
  if (!target) return false;

  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    if (typeof target.focus === 'function') target.focus();
    setNativeValue(target, email);
    if (typeof target.dispatchEvent === 'function') {
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
    }
    return true;
  }

  if (target.isContentEditable) {
    if (typeof target.focus === 'function') target.focus();
    if (typeof document !== 'undefined' && typeof document.execCommand === 'function') {
      document.execCommand('insertText', false, email);
    } else {
      target.textContent = email;
    }
    return true;
  }

  return false;
}
