#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const realConsole = console;

function installStorage(seed = {}) {
  const store = { ...seed };
  const calls = [];
  return {
    getItem(key) { calls.push(['getItem', key]); return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { calls.push(['setItem', key, String(value)]); store[key] = String(value); },
    removeItem(key) { calls.push(['removeItem', key]); delete store[key]; },
    clear() { calls.push(['clear']); Object.keys(store).forEach((key) => delete store[key]); },
    calls,
    dump() { return { ...store }; }
  };
}

class Element {
  constructor(tagName, document) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = document;
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.parentNode = null;
    this._id = '';
    this._innerHTML = '';
    this.textContent = '';
  }
  set id(value) { this._id = String(value); this.ownerDocument.byId[this._id] = this; }
  get id() { return this._id; }
  setAttribute(name, value) { this.attributes[name] = String(value); if (name === 'id') this.id = value; }
  appendChild(child) { child.parentNode = this; this.children.push(child); if (child.id) this.ownerDocument.byId[child.id] = child; return child; }
  remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter((child) => child !== this); if (this.id) delete this.ownerDocument.byId[this.id]; }
  addEventListener(type, fn) { this.listeners[type] = this.listeners[type] || []; this.listeners[type].push(fn); }
  click() { (this.listeners.click || []).forEach((fn) => fn({ type: 'click' })); }
  set innerHTML(value) { this._innerHTML = String(value); }
  get innerHTML() { return this._innerHTML; }
  querySelector(selector) {
    if (selector === '.hg-rhp-body') {
      if (!this.bodyEl) this.bodyEl = new Element('div', this.ownerDocument);
      return this.bodyEl;
    }
    if (selector === '[data-hg-rhp-refresh]') {
      if (!this.refreshButton) this.refreshButton = new Element('button', this.ownerDocument);
      return this.refreshButton;
    }
    if (selector === '[data-hg-rhp-hide]') {
      if (!this.hideButton) this.hideButton = new Element('button', this.ownerDocument);
      return this.hideButton;
    }
    return null;
  }
}

function installDocument() {
  const document = {
    byId: {},
    readyState: 'complete',
    listeners: {},
    createElement(tagName) { return new Element(tagName, document); },
    getElementById(id) { return document.byId[id] || null; },
    addEventListener(type, fn) { document.listeners[type] = document.listeners[type] || []; document.listeners[type].push(fn); }
  };
  document.head = new Element('head', document);
  document.body = new Element('body', document);
  return document;
}

function boot({ testMode = false, health } = {}) {
  global.window = global;
  global.document = installDocument();
  global.localStorage = installStorage(testMode ? { HG_TEST_MODE: '1' } : {});
  global.console = { log() {}, warn() {}, error() {} };
  global.setTimeout = (fn) => { fn(); return 1; };
  global.clearTimeout = () => {};
  global.addEventListener = () => {};
  delete global.HG_TEST_MODE;
  delete global.TEST_MODE;
  delete global.HGTestMode;
  delete global.HG_TestMode;
  delete global.HG_RuntimeHealthPanel;
  let calls = 0;
  global.HG_RuntimeHealth = {
    health: async () => {
      calls += 1;
      return health || { score: 91, summary: 'Alt klart', blockers: [], warnings: [] };
    }
  };
  vm.runInThisContext(fs.readFileSync('js/debug/HGRuntimeHealthPanel.js', 'utf8'), { filename: 'HGRuntimeHealthPanel.js' });
  return { panel: global.HG_RuntimeHealthPanel, document: global.document, storage: global.localStorage, calls: () => calls };
}

(async () => {
  let env = boot({ testMode: false });
  await env.panel.render();
  assert.strictEqual(env.document.getElementById('hgRuntimeHealthPanel'), null, 'panel does not render outside test mode');

  env = boot({ testMode: true, health: { score: 77, summary: 'To advarsler', blockers: [], warnings: [{ key: 'w1', message: 'Mangler valgfri data' }] } });
  await env.panel.render();
  let el = env.document.getElementById('hgRuntimeHealthPanel');
  assert(el, 'panel renders in test mode');
  assert.match(el.bodyEl.innerHTML, /77/, 'panel shows score');
  assert.match(el.bodyEl.innerHTML, /To advarsler/, 'panel shows summary');
  assert.match(el.bodyEl.innerHTML, /Advarsler/, 'score 60-84 shows warning label');

  env = boot({ testMode: true, health: { score: 95, summary: 'Privacy issue', blockers: [{ key: 'privacy_leak', message: 'privacy leak' }], warnings: [] } });
  await env.panel.render();
  assert.match(env.document.getElementById('hgRuntimeHealthPanel').bodyEl.innerHTML, /Personvernblokkere/, 'privacy blocker changes status label');

  env = boot({ testMode: true });
  await env.panel.render();
  const beforeClick = env.calls();
  env.document.getElementById('hgRuntimeHealthPanel').refreshButton.click();
  await Promise.resolve();
  assert.strictEqual(env.calls(), beforeClick + 1, 'refresh button calls health again');

  env.panel.remove();
  assert.strictEqual(env.document.getElementById('hgRuntimeHealthPanel'), null, 'remove removes panel element');

  const mutations = env.storage.calls.filter(([name]) => name !== 'getItem');
  assert.deepStrictEqual(mutations, [], 'panel does not mutate localStorage');

  realConsole.log('HG runtime health panel tests passed');
})().catch((error) => {
  process.stderr.write(String(error && error.stack || error));
  process.exit(1);
});
