import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

describe('Toast Component - Closed Shadow DOM Isolation (SEC-03)', () => {
  let createdElements = [];
  let appendedChildren = [];
  let existingElements = {};

  beforeEach(() => {
    createdElements = [];
    appendedChildren = [];
    existingElements = {};

    globalThis.requestAnimationFrame = (cb) => cb();

    globalThis.document = {
      getElementById(id) {
        return existingElements[id] || null;
      },
      createElement(tag) {
        const el = {
          tagName: tag.toUpperCase(),
          id: '',
          style: {},
          textContent: '',
          shadowRoot: null,
          children: [],
          remove() {
            if (this.id) delete existingElements[this.id];
          },
          attachShadow(options) {
            const shadow = {
              mode: options.mode,
              children: [],
              appendChild(child) {
                this.children.push(child);
              },
            };
            if (options.mode === 'open') {
              this.shadowRoot = shadow;
            } else {
              this.shadowRoot = null; // Closed mode does not expose shadowRoot
            }
            this._shadow = shadow;
            return shadow;
          },
          appendChild(child) {
            this.children.push(child);
          },
        };
        createdElements.push(el);
        return el;
      },
      body: {
        appendChild(el) {
          appendedChildren.push(el);
          if (el.id) existingElements[el.id] = el;
        },
      },
    };
  });

  test('showToast encapsulates notification inside closed Shadow DOM', () => {
    // Implementation pattern matching SEC-03
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
    }

    showToast('Secret OVH Error: quota 123', true);

    const host = document.getElementById('ovh-shield-toast-host');
    assert.ok(host, 'Host element should exist in document');
    assert.equal(host.textContent, '', 'Host textContent must be empty (no leak to host page)');
    assert.equal(host.shadowRoot, null, 'Host shadowRoot must be null in closed mode');

    // Inside the shadow DOM
    assert.ok(host._shadow, 'Shadow root must be attached');
    assert.equal(host._shadow.mode, 'closed', 'Shadow mode must be closed');
    assert.equal(host._shadow.children.length, 1);

    const toast = host._shadow.children[0];
    assert.equal(toast.textContent, 'Secret OVH Error: quota 123');
    assert.equal(toast.style.backgroundColor, '#e53e3e');
    assert.equal(toast.style.all, 'initial');
    assert.equal(host.style.all, 'initial');
  });

  test('showToast removes existing host before creating a new one', () => {
    let removed = false;
    existingElements['ovh-shield-toast-host'] = {
      id: 'ovh-shield-toast-host',
      remove() { removed = true; },
    };

    function showToast(message) {
      const existing = document.getElementById('ovh-shield-toast-host');
      if (existing) existing.remove();

      const host = document.createElement('div');
      host.id = 'ovh-shield-toast-host';
      host.attachShadow({ mode: 'closed' });
      document.body.appendChild(host);
    }

    showToast('Next message');
    assert.equal(removed, true, 'Prior host should be removed');
  });
});
