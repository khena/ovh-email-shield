import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { setNativeValue, insertEmailIntoElement } from '../src/lib/dom-autofill.js';

describe('DOM Autofill', () => {
  beforeEach(() => {
    globalThis.Event = class Event {
      constructor(type, options = {}) {
        this.type = type;
        this.bubbles = options.bubbles || false;
      }
    };
  });

  test('setNativeValue() sets value when no overridden descriptor exists', () => {
    const el = { value: '' };
    setNativeValue(el, 'test@example.com');
    assert.equal(el.value, 'test@example.com');
  });

  test('setNativeValue() calls prototype setter when property is overridden (React pattern)', () => {
    let prototypeValue = '';
    const proto = {};
    Object.defineProperty(proto, 'value', {
      get() { return prototypeValue; },
      set(v) { prototypeValue = v; },
      configurable: true,
    });

    const el = Object.create(proto);
    // Simulate React property descriptor shadow
    let ownValue = '';
    Object.defineProperty(el, 'value', {
      get() { return ownValue; },
      set(v) { ownValue = v; },
      configurable: true,
    });

    setNativeValue(el, 'react@example.com');
    assert.equal(prototypeValue, 'react@example.com');
  });

  test('insertEmailIntoElement() inserts email into INPUT element and dispatches events', () => {
    const dispatchedEvents = [];
    let focused = false;

    const input = {
      tagName: 'INPUT',
      value: '',
      focus() { focused = true; },
      dispatchEvent(evt) { dispatchedEvents.push(evt.type); },
    };

    const ok = insertEmailIntoElement(input, 'input@example.com');
    assert.equal(ok, true);
    assert.equal(focused, true);
    assert.equal(input.value, 'input@example.com');
    assert.deepEqual(dispatchedEvents, ['input', 'change']);
  });

  test('insertEmailIntoElement() inserts email into TEXTAREA element', () => {
    const dispatchedEvents = [];
    const textarea = {
      tagName: 'TEXTAREA',
      value: '',
      focus() {},
      dispatchEvent(evt) { dispatchedEvents.push(evt.type); },
    };

    const ok = insertEmailIntoElement(textarea, 'textarea@example.com');
    assert.equal(ok, true);
    assert.equal(textarea.value, 'textarea@example.com');
    assert.deepEqual(dispatchedEvents, ['input', 'change']);
  });

  test('insertEmailIntoElement() handles contentEditable with document.execCommand', () => {
    let focused = false;
    let commandUsed = '';
    let insertedText = '';

    globalThis.document = {
      execCommand(cmd, showUI, value) {
        commandUsed = cmd;
        insertedText = value;
      },
    };

    const editable = {
      isContentEditable: true,
      focus() { focused = true; },
    };

    const ok = insertEmailIntoElement(editable, 'content@example.com');
    assert.equal(ok, true);
    assert.equal(focused, true);
    assert.equal(commandUsed, 'insertText');
    assert.equal(insertedText, 'content@example.com');
  });

  test('insertEmailIntoElement() returns false when target is null or uneditable', () => {
    assert.equal(insertEmailIntoElement(null, 'test@example.com'), false);
    assert.equal(insertEmailIntoElement({ tagName: 'DIV' }, 'test@example.com'), false);
  });
});
