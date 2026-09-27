import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

describe('Background Script - Message Routing (SEC-02)', () => {
  let listeners = [];
  let registeredHandler = null;

  beforeEach(() => {
    listeners = [];
    globalThis.browser = {
      runtime: {
        id: 'test-extension-id',
        onInstalled: { addListener: () => {} },
        onMessage: {
          addListener: (fn) => {
            registeredHandler = fn;
            listeners.push(fn);
          },
        },
      },
      contextMenus: {
        create: () => {},
        onClicked: { addListener: () => {} },
      },
      storage: {
        local: {
          get: async () => ({}),
          set: async () => {},
        },
      },
    };
  });

  test('handleRuntimeMessage rejects messages originating from a web tab (content script)', async () => {
    const { handleRuntimeMessage } = await import(`../src/background/background.js?t=${Date.now()}`);
    assert.equal(typeof handleRuntimeMessage, 'function', 'handleRuntimeMessage should be exported');

    let responded = false;
    const sendResponse = () => { responded = true; };

    const tabSender = {
      id: 'test-extension-id',
      tab: { id: 123, url: 'https://malicious-site.com' },
    };

    const isHandled = handleRuntimeMessage(
      { type: 'GENERATE_ALIAS', url: 'https://malicious-site.com' },
      tabSender,
      sendResponse
    );

    assert.equal(isHandled, false, 'Should reject message from sender.tab');
    assert.equal(responded, false, 'Should not respond to untrusted tab caller');
  });

  test('handleRuntimeMessage accepts messages originating from internal extension pages', async () => {
    const { handleRuntimeMessage } = await import(`../src/background/background.js?t=${Date.now() + 1}`);

    const internalSender = {
      id: 'test-extension-id',
      // No tab property for internal pages (popup, options)
    };

    const isHandled = handleRuntimeMessage(
      { type: 'GENERATE_ALIAS', url: 'https://example.com' },
      internalSender,
      () => {}
    );

    assert.equal(isHandled, true, 'Should accept message from internal extension page');
  });
});
