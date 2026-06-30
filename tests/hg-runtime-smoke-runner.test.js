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
    this.listeners = {};
    this.attributes = {};
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
    if (selector === '.hg-rhp-body') return this.bodyEl || (this.bodyEl = new Element('div', this.ownerDocument));
    if (selector === '[data-hg-rhp-refresh]') return this.refreshButton || (this.refreshButton = new Element('button', this.ownerDocument));
    if (selector === '[data-hg-rhp-hide]') return this.hideButton || (this.hideButton = new Element('button', this.ownerDocument));
    if (selector === '[data-hg-rhp-smoke]') {
      if (!this.innerHTML.includes('data-hg-rhp-smoke')) return null;
      return this.smokeButton || (this.smokeButton = new Element('button', this.ownerDocument));
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
    getElementById(id) { return document.byId[id] || (id === 'spotmeeting-inbox' ? new Element('div', document) : null); },
    querySelector(selector) { return String(selector).includes('socialmeet') ? new Element('button', document) : null; },
    addEventListener(type, fn) { document.listeners[type] = document.listeners[type] || []; (document.listeners[type]).push(fn); }
  };
  document.head = new Element('head', document);
  document.body = new Element('body', document);
  return document;
}

function boot({ testMode = true } = {}) {
  global.window = global;
  global.document = installDocument();
  global.localStorage = installStorage(testMode ? { HG_TEST_MODE: '1' } : {});
  global.console = { log() {}, info() {}, warn() {}, error() {}, table() {} };
  global.setTimeout = (fn) => { fn(); return 1; };
  global.clearTimeout = () => {};
  global.addEventListener = () => {};
  for (const key of ['HG_RuntimeSmokeRunner', 'HG_RuntimeHealth', 'HG_RuntimeHealthPanel', 'HG_CiviDebug', 'HG_SocialDebug', 'HGLearningLog', 'PLACES', 'PEOPLE', 'TAGS_REGISTRY', 'HG_CiviProfileSnapshot', 'openPlaceCard', 'HGMapView']) delete global[key];
  global.renderSpotmeetingInbox = () => {};
  vm.runInThisContext(fs.readFileSync('js/social/HGPublicProfileReadModel.js', 'utf8'), { filename: 'HGPublicProfileReadModel.js' });
  vm.runInThisContext(fs.readFileSync('js/social/HGSpotmeeting.js', 'utf8'), { filename: 'HGSpotmeeting.js' });
  vm.runInThisContext(fs.readFileSync('js/social/HGSpotmeetingPlaceCardDemo.js', 'utf8'), { filename: 'HGSpotmeetingPlaceCardDemo.js' });
  vm.runInThisContext(fs.readFileSync('js/debug/HGRuntimeSmokeRunner.js', 'utf8'), { filename: 'HGRuntimeSmokeRunner.js' });
  return { runner: global.HG_RuntimeSmokeRunner, storage: global.localStorage, document: global.document };
}

(async () => {
  let env = boot({ testMode: false });
  global.PLACES = [{ id: 'should-not-read' }];
  const skipped = await env.runner.run();
  assert.deepStrictEqual(skipped, { ok: false, skipped: true, reason: 'test_mode_disabled' }, 'run skips outside test mode');

  env = boot();
  let healthCalls = 0;
  global.HG_RuntimeHealth = { health: async () => { healthCalls += 1; return { ok: true, score: 100, blockers: [], warnings: [], summary: 'OK' }; } };
  global.PLACES = [{ id: 'p1', title: 'Place' }];
  global.PEOPLE = [];
  global.HGLearningLog = { getQuizHistory: () => [], getVisitHistory: () => [] };
  const result = await env.runner.run();
  assert.strictEqual(healthCalls, 1, 'run calls HG_RuntimeHealth.health in TEST_MODE');
  assert(result.warnings.some((item) => item.key === 'people_empty'), 'empty PEOPLE is a warning');
  assert(!result.blockers.some((item) => item.key === 'people_empty'), 'empty PEOPLE is not a blocker');

  env = boot();
  global.HG_RuntimeHealth = { health: async () => ({ blockers: [], warnings: [] }) };
  global.PEOPLE = [];
  global.HGLearningLog = { getQuizHistory: () => [], getVisitHistory: () => [] };
  const missingPlaces = await env.runner.run();
  assert(missingPlaces.blockers.some((item) => item.key === 'places_missing'), 'missing PLACES creates blocker');

  env = boot();
  global.HG_RuntimeHealth = { health: async () => ({ blockers: [], warnings: [] }) };
  global.HG_SocialDebug = { health: async () => ({ blockers: [], warnings: [], snapshot: { user: { latitude: 59.9 } } }) };
  global.PLACES = [{ id: 'p1' }];
  global.HGLearningLog = { getQuizHistory: () => [], getVisitHistory: () => [] };
  const privacy = await env.runner.run();
  assert(privacy.blockers.some((item) => item.key === 'privacy_forbidden_field'), 'social privacy violation propagates as blocker');

  env = boot();
  global.HG_RuntimeHealth = { health: async () => ({ blockers: [], warnings: [] }) };
  global.PLACES = [{ id: 'p1' }];
  global.HGLearningLog = { getQuizHistory: () => [], getVisitHistory: () => [] };
  global.HG_CiviProfileSnapshot = () => { throw new Error('profile boom'); };
  const profile = await env.runner.run();
  assert(profile.warnings.some((item) => item.key === 'profile_snapshot_failed'), 'profile snapshot throwing creates warning');
  assert(!profile.blockers.some((item) => item.key === 'profile_snapshot_failed'), 'profile snapshot throwing is not a blocker');

  env = boot();
  global.HG_RuntimeHealth = { health: async () => ({ score: 90, summary: 'OK', blockers: [], warnings: [] }) };
  vm.runInThisContext(fs.readFileSync('js/debug/HGRuntimeHealthPanel.js', 'utf8'), { filename: 'HGRuntimeHealthPanel.js' });
  await global.HG_RuntimeHealthPanel.render();
  assert(env.document.getElementById('hgRuntimeHealthPanel').smokeButton, 'smoke button is present in TEST_MODE');

  env = boot({ testMode: false });
  global.HG_RuntimeHealth = { health: async () => ({ score: 90, summary: 'OK', blockers: [], warnings: [] }) };
  vm.runInThisContext(fs.readFileSync('js/debug/HGRuntimeHealthPanel.js', 'utf8'), { filename: 'HGRuntimeHealthPanel.js' });
  await global.HG_RuntimeHealthPanel.render();
  assert.strictEqual(env.document.getElementById('hgRuntimeHealthPanel'), null, 'smoke button/panel absent outside TEST_MODE');

  const mutations = env.storage.calls.filter(([name]) => name !== 'getItem');
  assert.deepStrictEqual(mutations, [], 'no localStorage mutation except reading HG_TEST_MODE');

  realConsole.log('HG runtime smoke runner tests passed');
})().catch((error) => {
  process.stderr.write(String(error && error.stack || error));
  process.exit(1);
});
