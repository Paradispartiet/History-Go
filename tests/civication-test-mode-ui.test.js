#!/usr/bin/env node
// Verifiserer Civication testmodus-UI:
// - bygger rolleliste datadrevet fra roleModels-manifest
// - Controller finnes i rollelisten
// - kan starte rolle via eksisterende CivicationRoleStarter
// - inspect() returnerer status uten DOM-feil
// - panel/knapp rendres bare når testmodus er aktiv

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); }
  };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    const fullPath = path.resolve(rootDir, clean);
    if (!fullPath.startsWith(rootDir)) return { ok: false, status: 400, async json() { return null; } };
    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return { ok: true, status: 200, async json() { return JSON.parse(body); } };
    } catch {
      return { ok: false, status: 404, async json() { return null; } };
    }
  };
}

// Minimal DOM-mock: nok til at toppnivå-element (knapp/panel) kan opprettes og
// finnes via getElementById. innerHTML-barn parses ikke, så testene rører dem ikke.
function makeDom() {
  const byId = new Map();
  function register(node) {
    if (node && node.id) byId.set(node.id, node);
    (node.children || []).forEach(register);
  }
  function makeNode(tag) {
    const node = {
      tagName: String(tag || '').toUpperCase(),
      _id: '',
      className: '',
      _html: '',
      type: '',
      title: '',
      textContent: '',
      value: '',
      dataset: {},
      style: {},
      children: [],
      classList: {
        _set: new Set(),
        add(c) { this._set.add(c); },
        remove(c) { this._set.delete(c); },
        toggle(c) { this._set.has(c) ? this._set.delete(c) : this._set.add(c); },
        contains(c) { return this._set.has(c); }
      },
      get id() { return this._id; },
      set id(v) { this._id = v; if (v) byId.set(v, node); },
      get innerHTML() { return this._html; },
      set innerHTML(v) { this._html = String(v); },
      get firstChild() { return this.children[0] || null; },
      addEventListener() {},
      appendChild(child) { this.children.push(child); register(child); return child; },
      insertBefore(child) { this.children.unshift(child); register(child); return child; },
      remove() { if (this._id) byId.delete(this._id); },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      closest() { return null; }
    };
    return node;
  }
  const body = makeNode('body');
  return {
    readyState: 'complete',
    body,
    addEventListener() {},
    createElement(tag) { return makeNode(tag); },
    getElementById(id) { return byId.get(id) || null; },
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
}

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html', search: '' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = makeDom();
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);
  global.CivicationCalendar = { getPhase: () => 'morning', setPhase() {}, advanceByMinutes() {} };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationRoleStarter.js');
  loadScript('js/Civication/ui/CivicationTestModeUI.js');

  const TM = global.CivicationTestMode;
  assert(TM, 'CivicationTestMode global skal eksponeres');

  // Panel/knapp skal IKKE rendres når testmodus er av.
  assert.strictEqual(TM.isEnabled(), false, 'testmodus skal være av uten flagg/param');
  assert.strictEqual(global.document.getElementById('civicationTestButton'), null, 'ingen testknapp når av');
  assert.strictEqual(global.document.getElementById('civicationTestModePanel'), null, 'ingen testpanel når av');

  // Rolleliste bygges datadrevet fra manifest.
  const roles = await TM.listRoles();
  assert(Array.isArray(roles) && roles.length > 50, `rolleliste skal bygges fra data (fikk ${roles.length})`);

  // Controller finnes i rollelisten.
  const controller = roles.find(r => r.role_key === 'controller' && r.career_id === 'naeringsliv');
  assert(controller, 'Controller skal finnes i rollelisten');
  assert.strictEqual(controller.role_id, 'naer_controller', 'Controller skal ha riktig role_id');

  // inspect() uten DOM-feil før noe er startet.
  const before = TM.inspect();
  assert.strictEqual(before.enabled, false, 'inspect skal rapportere enabled=false');
  assert.strictEqual(before.roleCount, roles.length, 'inspect skal telle lastede roller');
  assert.deepStrictEqual(before.byPhase, {}, 'inspect byPhase skal være tomt før dagstart');

  // Start rolle via eksisterende RoleStarter.
  const started = TM.startRole('controller');
  assert(started, 'startRole skal returnere startet rolle');
  const active = global.CivicationState.getActivePosition();
  assert.strictEqual(active.career_id, 'naeringsliv', 'aktiv rolle career_id');
  assert.strictEqual(active.title, 'Controller', 'aktiv rolle title');
  assert.strictEqual(active.role_key, 'controller', 'aktiv rolle role_key');
  assert.strictEqual(active.role_id, 'naer_controller', 'aktiv rolle role_id');

  const afterStart = TM.inspect();
  assert(afterStart.selectedRole && afterStart.selectedRole.role_key === 'controller', 'inspect skal vise valgt rolle');
  assert.strictEqual(afterStart.active.role_key, 'controller', 'inspect skal vise aktiv rolle');

  // Panel/knapp skal rendres når testmodus aktiveres.
  TM.enable();
  assert.strictEqual(TM.isEnabled(), true, 'enable skal slå på testmodus');
  assert(global.document.getElementById('civicationTestButton'), 'testknapp skal opprettes når aktiv');

  TM.open();
  assert(global.document.getElementById('civicationTestModePanel'), 'testpanel skal opprettes når åpnet');
  assert.strictEqual(TM.inspect().panelOpen, true, 'inspect skal vise at panelet er åpent');

  // disable rydder opp uten DOM-feil.
  TM.disable();
  assert.strictEqual(TM.isEnabled(), false, 'disable skal slå av testmodus');
  assert.strictEqual(global.document.getElementById('civicationTestButton'), null, 'knapp fjernes ved disable');

  console.log('civication-test-mode-ui.test.js passed');
}

function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
