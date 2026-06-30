#!/usr/bin/env node
// NextAction eier det ene eksplisitte "Start ny dag"-valget ved day_end. Når dagen er ferdig
// besvart (reason=at_last_phase, phase=day_end, ingen åpne saker) skal:
//  1. CivicationNextActionSelector.getCurrent() returnere en day_phase_advance-handling med
//     canStartNewDay=true (i stedet for å falle tilbake til innboks/ingenting).
//  2. CivicationNextActionUI rendre én "Start ny dag"-knapp som gjenbruker advance-handleren
//     (data-civi-next-action-advance) → CivicationDayProgression.advancePhaseIfReady.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

class FakeEl {
  constructor(tag) {
    this.tagName = String(tag || 'div').toUpperCase();
    this.children = [];
    this.parentElement = null;
    this._id = '';
    this.className = '';
    this._innerHTML = '';
    this._attrs = {};
    this._classes = new Set();
    this._listeners = {};
    this.disabled = false;
  }
  set id(v) { this._id = String(v || ''); }
  get id() { return this._id; }
  set innerHTML(v) { this._innerHTML = String(v || ''); this.children = []; }
  get innerHTML() { return this._innerHTML; }
  get firstElementChild() { return this.children[0] || null; }
  appendChild(child) { child.parentElement = this; this.children.push(child); return child; }
  insertBefore(child, anchor) {
    child.parentElement = this;
    const i = anchor ? this.children.indexOf(anchor) : -1;
    if (i >= 0) this.children.splice(i, 0, child); else this.children.push(child);
    return child;
  }
  setAttribute(k, v) { this._attrs[k] = String(v); }
  getAttribute(k) { return k in this._attrs ? this._attrs[k] : null; }
  addEventListener(type, fn) { (this._listeners[type] = this._listeners[type] || []).push(fn); }
  contains(node) { return node === this || this.children.some((c) => c.contains && c.contains(node)); }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  get classList() {
    const set = this._classes;
    return {
      add: (c) => set.add(c), remove: (c) => set.delete(c),
      toggle: (c, force) => { if (force === undefined) { set.has(c) ? set.delete(c) : set.add(c); } else if (force) set.add(c); else set.delete(c); },
      contains: (c) => set.has(c)
    };
  }
}

function findById(root, id) {
  if (!root) return null;
  if (root.id === id) return root;
  for (const c of root.children) { const hit = findById(c, id); if (hit) return hit; }
  return null;
}

function installBaseGlobals() {
  global.window = global;
  global.Event = function Event(type) { this.type = type; };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.setTimeout = (fn) => { fn(); return 0; };
  global.localStorage = { getItem() { return '[]'; }, setItem() {}, removeItem() {} };
}

// Day_end, alt besvart: ingen pending/queued/actionable items, kan ikke avansere (ingen neste fase).
function dayEndCompleteInspection() {
  return {
    phase: 'day_end',
    phaseLabel: 'Dagslutt',
    dayIndex: 3,
    openItemsInPhase: 0,
    queuedItemsInPhase: 0,
    deliveredItemsInPhase: 0,
    completedItemsInPhase: 5,
    openItemSubjects: [],
    pendingItem: null,
    nextQueuedItem: null,
    nextActionableItem: null,
    phaseBundle: { items: [], pendingItems: [], queuedItems: [] },
    nextPhase: null,
    canAdvance: false,
    reason: 'at_last_phase'
  };
}

function testSelectorStartNewDay() {
  installBaseGlobals();
  global.document = { getElementById() { return null; }, addEventListener() {}, readyState: 'complete' };

  // En åpen innboks-mail finnes også — men day_end-handlingen skal vinne, ikke innboks-fallback.
  global.CivicationDayProgression = { inspect: () => dayEndCompleteInspection() };
  global.CivicationMailEngine = { getInbox: () => [{ id: 'inbox-x', status: 'open', resolved: false, event: { id: 'inbox-x', subject: 'Tilfeldig', choices: [{ id: 'z', label: 'OK' }] } }] };

  loadScript('js/Civication/systems/civicationNextActionSelector.js');
  const current = global.CivicationNextActionSelector.getCurrent();
  assert(current, 'selector returns an action at day_end-complete');
  assert.strictEqual(current.source, 'day_phase_advance', 'day_end action is a phase advance, not an inbox fallback');
  assert.strictEqual(current.canStartNewDay, true, 'action is flagged as start-new-day');
  assert.strictEqual(current.canAdvancePhase, true, 'start-new-day reuses the advance button/handler');
  assert.strictEqual(current.subject, 'Start ny dag', 'action subject is Start ny dag');
  assert.notStrictEqual(current.id, 'inbox-x', 'day_end action wins over the open inbox mail');

  console.log('  ✓ selector surfaces a Start ny dag action at day_end (wins over inbox fallback)');
}

function testUiRendersStartNewDay() {
  installBaseGlobals();
  const body = new FakeEl('body');
  global.document = {
    body,
    getElementById(id) { return findById(body, id); },
    createElement(tag) { return new FakeEl(tag); },
    addEventListener() {},
    readyState: 'complete'
  };

  let advanceCalls = 0;
  global.CivicationDayProgression = {
    inspect: () => dayEndCompleteInspection(),
    async advancePhaseIfReady() { advanceCalls += 1; return { advanced: true, fromPhase: 'day_end', toPhase: 'morning' }; }
  };
  global.CivicationMailEngine = { getInbox: () => [] };

  loadScript('js/Civication/systems/civicationNextActionSelector.js');
  loadScript('js/Civication/ui/CivicationNextActionUI.js');

  assert.strictEqual(global.CivicationNextActionUI.open(), true, 'NextAction opens at day_end');
  const html = findById(body, 'civiNextActionModalBody').innerHTML;
  assert(html.includes('Start ny dag'), 'NextAction renders the Start ny dag button');
  assert(html.includes('data-civi-next-action-advance'), 'Start ny dag reuses the advance action hook');
  assert(!html.includes('data-civi-next-action-answer'), 'day_end action renders no mail answer buttons');

  // Klikk skal rulle dagen via advancePhaseIfReady.
  const modal = findById(body, 'civiNextActionModal');
  const listeners = modal && modal._listeners && modal._listeners.click;
  assert(listeners && listeners.length, 'NextAction modal has a delegated click handler');
  const btn = new FakeEl('button');
  btn.setAttribute('data-civi-next-action-advance', '1');
  btn.closest = (sel) => (String(sel).includes('data-civi-next-action-advance') ? btn : null);
  modal.appendChild(btn);
  listeners.forEach((fn) => fn({ target: { closest: (sel) => btn.closest(sel) }, preventDefault() {} }));
  assert.strictEqual(advanceCalls, 1, 'clicking Start ny dag calls advancePhaseIfReady');

  console.log('  ✓ NextAction UI renders Start ny dag and rolls the day on click');
}

function run() {
  testSelectorStartNewDay();
  testUiRendersStartNewDay();
  console.log('PASS: Civication NextAction start-new-day tests completed.');
}

try { run(); } catch (error) { console.error(error); process.exit(1); }
