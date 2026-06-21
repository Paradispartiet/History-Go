#!/usr/bin/env node
// Verifiserer Civication testmodus-UI:
// - bygger rolleliste datadrevet fra roleModels-manifest
// - Controller finnes i rollelisten
// - kan starte rolle via eksisterende CivicationRoleStarter
// - inspect() returnerer status uten DOM-feil
// - Test-knappen rendres alltid uten query-param

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
  const dispatchedEvents = [];
  global.addEventListener = () => {};
  global.dispatchEvent = (event) => { dispatchedEvents.push(event?.type); return true; };
  global.fetch = makeFetch(repoRoot);
  global.CivicationCalendar = { getPhase: () => 'morning', setPhase() {}, advanceByMinutes() {} };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/civicationRoleStarter.js');
  loadScript('js/Civication/ui/CivicationTestModeUI.js');

  const TM = global.CivicationTestMode;
  assert(TM, 'CivicationTestMode global skal eksponeres');

  // Testknappen skal rendres permanent uten query-param/localStorage-flagg.
  assert.strictEqual(TM.isEnabled(), true, 'testmodus-UI skal være permanent tilgjengelig');
  assert(global.document.getElementById('civicationTestButton'), 'testknapp skal opprettes uten flagg');
  assert.strictEqual(global.document.getElementById('civicationTestModePanel'), null, 'testpanel opprettes først når det åpnes');

  // Rolleliste bygges datadrevet fra manifest. loadRoles() venter på async
  // datahenting, mens listRoles() er det synkrone konsoll-API-et.
  await TM.loadRoles();
  const roles = TM.listRoles();
  assert(Array.isArray(roles), 'listRoles skal returnere en Array');
  assert(roles.length > 50, `rolleliste skal bygges fra data (fikk ${roles.length})`);

  // Controller finnes i rollelisten.
  const controller = roles.find(r => r.role_key === 'controller' && r.career_id === 'naeringsliv');
  assert(controller, 'Controller skal finnes i rollelisten');
  assert.strictEqual(controller.role_id, 'naer_controller', 'Controller skal ha riktig role_id');

  // inspect() uten DOM-feil før noe er startet.
  const before = TM.inspect();
  assert.strictEqual(before.enabled, true, 'inspect skal rapportere enabled=true');
  assert.strictEqual(before.roleCount, roles.length, 'inspect skal telle lastede roller');
  assert.deepStrictEqual(before.byPhase, {}, 'inspect byPhase skal være tomt før dagstart');

  // Start Dag uten aktiv rolle skal gi tydelig status og ikke kalle dagmotoren.
  let startTodayCalls = 0;
  global.CivicationDailyMailBuilder = {
    async startToday() { startTodayCalls += 1; return { ok: true }; },
    inspect() { return { runtime: null, item_count: 0, by_phase: {}, by_status: {}, pending: null }; }
  };
  const noRoleDay = await TM.startDay();
  assert.strictEqual(noRoleDay.ok, false, 'startDay uten aktiv rolle skal feile kontrollert');
  assert.strictEqual(noRoleDay.reason, 'no_active_role', 'startDay uten aktiv rolle skal be om rolle først');
  assert.strictEqual(startTodayCalls, 0, 'startDay uten aktiv rolle skal ikke starte dagmotoren');

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

  // Start Dag skal await-e eksisterende DailyMailBuilder.startToday og deretter vise oppdatert runtime-status.
  let resolved = false;
  let receivedOptions = null;
  const runtime = { items: [{ status: 'queued', phase: 'morning' }, { status: 'pending', phase: 'lunch' }] };
  global.CivicationDailyMailBuilder = {
    async startToday(options) {
      startTodayCalls += 1;
      receivedOptions = options;
      await Promise.resolve();
      resolved = true;
      return { ok: true, runtime };
    },
    inspect() {
      return {
        runtime: resolved ? runtime : null,
        item_count: resolved ? 2 : 0,
        by_phase: resolved ? { morning: 1, lunch: 1 } : {},
        by_status: resolved ? { queued: 1, pending: 1 } : {},
        pending: resolved ? { id: 'm2', subject: 'Lunsjrapport', phase_tag: 'lunch' } : null
      };
    }
  };

  const dayResult = await TM.startDay();
  assert.strictEqual(dayResult.ok, true, 'startDay skal returnere vellykket dagmotor-resultat');
  assert.deepStrictEqual(receivedOptions, { forceNew: true, ignorePending: true }, 'startDay skal kalle DailyMailBuilder.startToday med testmodus-flagg');
  assert.strictEqual(startTodayCalls, 1, 'startDay skal starte dagmotoren én gang etter aktiv rolle');
  assert(dispatchedEvents.includes('civi:inboxChanged'), 'startDay skal dispatch-e civi:inboxChanged etter dagstart');
  assert(dispatchedEvents.includes('updateProfile'), 'startDay skal dispatch-e updateProfile etter dagstart');

  const afterDay = TM.inspect();
  assert.strictEqual(afterDay.runtimeExists, true, 'inspect skal vise at runtime finnes etter dagstart');
  assert.strictEqual(afterDay.itemCount, 2, 'inspect skal vise item_count etter dagstart');
  assert.deepStrictEqual(afterDay.byPhase, { morning: 1, lunch: 1 }, 'inspect skal vise byPhase etter dagstart');
  assert.deepStrictEqual(afterDay.byStatus, { queued: 1, pending: 1 }, 'inspect skal vise byStatus etter dagstart');
  assert.strictEqual(afterDay.pending.subject, 'Lunsjrapport', 'inspect skal vise pending subject etter dagstart');

  // Panel skal åpnes via permanent API.
  TM.openPanel();
  assert(global.document.getElementById('civicationTestModePanel'), 'testpanel skal opprettes når åpnet');
  assert.strictEqual(TM.inspect().panelOpen, true, 'inspect skal vise at panelet er åpent');

  // closePanel rydder panelstatus uten DOM-feil, men knappen blir liggende permanent.
  TM.closePanel();
  assert.strictEqual(TM.inspect().panelOpen, false, 'closePanel skal lukke panelet');
  assert(global.document.getElementById('civicationTestButton'), 'testknapp skal fortsatt være synlig');

  console.log('civication-test-mode-ui.test.js passed');
}

function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
