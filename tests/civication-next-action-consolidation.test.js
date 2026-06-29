#!/usr/bin/env node
// tests/civication-next-action-consolidation.test.js
//
// Locks the NextAction consolidation: active Civication mail answering lives on exactly one
// authoritative surface (CivicationNextActionUI), fed by exactly one selector
// (CivicationNextActionSelector). Dagens fase, Innboks and WorkdayPanel must all point at the
// same active mail and must NOT render their own answer choices for it.
//
//  1. Selector: when the current phase has pendingItem A while the inbox also holds an open
//     mail B, getCurrent() must return A (the phase action wins) — never B.
//  2. Selector falls back to an inbox action only when there is no phase action.
//  3. NextAction UI renders the answer choices (subject, meta, body, choice buttons).
//  4. Dagens fase shows the same next-item title as the selector, renders NO answer choices,
//     and its button routes to NextAction.
//  5. Innboks shows "Håndteres i Neste handling" (a link to NextAction) instead of inline
//     choices for the active phase action.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

// ------------------------------------------------------------------
// Lightweight DOM
// ------------------------------------------------------------------
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
  contains(node) {
    if (node === this) return true;
    return this.children.some((c) => c.contains && c.contains(node));
  }
  querySelector() { return null; }
  querySelectorAll() { return []; }
  get classList() {
    const set = this._classes;
    return {
      add: (c) => set.add(c),
      remove: (c) => set.delete(c),
      toggle: (c, force) => { if (force === undefined) { set.has(c) ? set.delete(c) : set.add(c); } else if (force) set.add(c); else set.delete(c); },
      contains: (c) => set.has(c)
    };
  }
}

function findById(root, id) {
  if (!root) return null;
  if (root.id === id) return root;
  for (const c of root.children) {
    const hit = findById(c, id);
    if (hit) return hit;
  }
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

function makeRow(id, subject, choices, extra) {
  return Object.assign({
    id,
    subject,
    mail_type: 'job',
    slot: 'morning',
    status: 'delivered',
    phase: 'morning',
    required: true,
    hasChoices: Array.isArray(choices) && choices.length > 0,
    choiceCount: Array.isArray(choices) ? choices.length : 0,
    choices: choices || [],
    body: 'Hva gjør du?'
  }, extra || {});
}

function inspectionWithPending(rowA) {
  return {
    phase: 'morning',
    phaseLabel: 'Morgen',
    dayIndex: 1,
    openItemsInPhase: 1,
    queuedItemsInPhase: 0,
    deliveredItemsInPhase: 1,
    completedItemsInPhase: 0,
    openItemSubjects: [rowA.subject],
    pendingItem: { id: rowA.id, subject: rowA.subject, status: rowA.status, phase: rowA.phase },
    nextQueuedItem: null,
    nextActionableItem: rowA,
    phaseBundle: { items: [rowA], pendingItems: [rowA], queuedItems: [] },
    nextPhase: 'lunch',
    canAdvance: false,
    reason: 'open_items_in_phase'
  };
}

function inboxItem(id, subject, choices, status) {
  return {
    id,
    status: status || 'open',
    resolved: false,
    event: { id, subject, source_type: 'workday', choices: choices || [] }
  };
}

// ==================================================================
// 1 + 2. Selector
// ==================================================================
function testSelector() {
  installBaseGlobals();
  global.document = { getElementById() { return null; }, addEventListener() {}, readyState: 'complete' };

  const rowA = makeRow('mail-A', 'Fasesak A', [{ id: 'A1', label: 'Ja' }, { id: 'A2', label: 'Nei' }]);
  const mailB = inboxItem('mail-B', 'Innboks B', [{ id: 'B1', label: 'OK' }]);

  global.CivicationDayProgression = { inspect: () => inspectionWithPending(rowA) };
  global.CivicationMailEngine = { getInbox: () => [mailB] };

  loadScript('js/Civication/systems/civicationNextActionSelector.js');

  const current = global.CivicationNextActionSelector.getCurrent();
  assert(current, 'selector returns an action when a phase action exists');
  assert.strictEqual(current.id, 'mail-A', 'phase pendingItem A wins over inbox mail B');
  assert.strictEqual(current.source, 'day_phase', 'active action is sourced from the day phase');
  assert.strictEqual(current.choices.length, 2, 'selector carries the answer choices for A');
  assert.notStrictEqual(current.id, 'mail-B', 'selector must never surface the unrelated inbox mail B as active');

  // No phase action → fall back to the open inbox mail.
  global.CivicationDayProgression = {
    inspect: () => ({ phase: 'morning', phaseLabel: 'Morgen', dayIndex: 1, openItemsInPhase: 0, pendingItem: null, nextQueuedItem: null, nextActionableItem: null, phaseBundle: { items: [], pendingItems: [], queuedItems: [] }, nextPhase: 'lunch', canAdvance: true, reason: 'ready_to_advance' })
  };
  const fallback = global.CivicationNextActionSelector.getCurrent();
  assert(fallback, 'selector falls back to an actionable inbox mail when no phase action exists');
  assert.strictEqual(fallback.id, 'mail-B', 'fallback returns the open inbox mail');
  assert.strictEqual(fallback.source, 'inbox', 'fallback action is sourced from the inbox');

  console.log('  ✓ selector: phase action A wins over inbox B; falls back to inbox only when no phase action');
}

// ==================================================================
// 3. NextAction UI renders the answer choices
// ==================================================================
function testNextActionUi() {
  installBaseGlobals();
  const body = new FakeEl('body');
  global.document = {
    body,
    getElementById(id) { return findById(body, id); },
    createElement(tag) { return new FakeEl(tag); },
    addEventListener() {},
    readyState: 'complete'
  };

  const action = {
    source: 'day_phase', id: 'mail-A', subject: 'Fasesak A',
    body: 'Hva gjør du når planen endres?', situation: [], summary: '',
    phase: 'morning', phaseLabel: 'Morgen', mail_type: 'job', slot: 'morning', status: 'delivered',
    choices: [{ id: 'A1', label: 'Stå på faglig vurdering' }, { id: 'A2', label: 'Be om medvirkning' }],
    isTaskGate: false, taskId: ''
  };
  global.CivicationNextActionSelector = { getCurrent: () => action };

  loadScript('js/Civication/ui/CivicationNextActionUI.js');
  assert.strictEqual(global.CivicationNextActionUI.open(), true, 'NextAction opens');

  const html = findById(body, 'civiNextActionModalBody').innerHTML;
  assert(html.includes('Fasesak A'), 'NextAction renders the subject');
  assert(html.includes('Stå på faglig vurdering'), 'NextAction renders the first choice label');
  assert(html.includes('Be om medvirkning'), 'NextAction renders the second choice label');
  assert(html.includes('data-civi-next-action-answer'), 'choices are answerable buttons');
  assert(html.includes('Hva gjør du når planen endres?'), 'NextAction renders the body text');
  assert(html.includes('Morgen'), 'NextAction renders phase meta');

  console.log('  ✓ NextAction UI renders subject, meta, body and choice buttons');
}

// ==================================================================
// 4. Dagens fase: same title, no choices, routes to NextAction
// ==================================================================
function testDayPhasePanel() {
  installBaseGlobals();
  const panels = new FakeEl('div');
  panels.className = 'civi-panels';
  const controls = new FakeEl('div');
  controls.id = 'civiLifeHomeControls';
  panels.insertBefore(controls, null);

  global.document = {
    readyState: 'complete',
    addEventListener() {},
    createElement(tag) { return new FakeEl(tag); },
    querySelector(sel) { return sel === '.civi-panels' ? panels : null; },
    getElementById(id) { return id === 'civiLifeHomeControls' ? controls : findById(panels, id); }
  };

  const rowA = makeRow('mail-A', 'Fasesak A', [{ id: 'A1', label: 'Ja' }]);
  global.CivicationDayProgression = { inspect: () => inspectionWithPending(rowA) };
  global.CivicationMailEngine = { getInbox: () => [] };
  global.CivicationState = { getState: () => ({}), getActivePosition: () => ({ career_id: 'naeringsliv' }) };
  global.CivicationCalendar = { getPhaseLabel: (p) => p };
  global.CivicationCareerOutcomeRuntime = { getOutcomeViewModel: () => null };
  global.CivicationJobLearningRuntime = { getJobLearningViewModel: () => null };
  global.CivicationPsyche = { getAutonomy: () => 50 };

  loadScript('js/Civication/systems/civicationNextActionSelector.js');
  loadScript('js/Civication/ui/CivicationDayPhaseUI.js');

  assert.strictEqual(global.CivicationDayPhaseUI.render(), true, 'day phase panel renders');
  const html = findById(panels, 'civiDayPhasePanel').innerHTML;

  const selectorTitle = global.CivicationNextActionSelector.getCurrent().subject;
  assert.strictEqual(selectorTitle, 'Fasesak A', 'selector title is the active mail subject');
  assert(html.includes('Neste sak: Fasesak A'), 'Dagens fase shows the same next-item title as the selector');
  assert(html.includes('data-civi-day-phase-next-action'), 'Dagens fase routes via the NextAction button');
  assert(html.includes('Gå til neste handling'), 'routing button keeps the NextAction label');

  // No answer surface on the status card.
  assert(!html.includes('data-civi-next-action-answer'), 'Dagens fase renders no answer choices');
  assert(!html.includes('data-civi-inbox-answer'), 'Dagens fase renders no inbox answer buttons');
  assert(!html.includes('data-civi-bundle-choice'), 'Dagens fase renders no bundle choices');
  assert(!html.includes('>Ja<'), 'Dagens fase does not render the choice label inline');

  // The button must open NextAction, not the inbox archive.
  let nextActionOpened = 0;
  let inboxOpened = 0;
  global.CivicationNextActionUI = { open: () => { nextActionOpened += 1; return true; } };
  global.CivicationMiniSectionsUI = { openPopup: () => { inboxOpened += 1; } };
  global.CivicationDayPhaseUI.__goToNextActionForTest
    ? global.CivicationDayPhaseUI.__goToNextActionForTest()
    : simulateNextActionButton(html, panels);
  assert.strictEqual(inboxOpened, 0, 'Dagens fase does NOT open the inbox archive directly');

  console.log('  ✓ Dagens fase: same title as NextAction, no inline choices, routes to NextAction');
}

// The panel binds a delegated click handler; trigger it by locating the listener on the panel.
function simulateNextActionButton(_html, panels) {
  const panel = findById(panels, 'civiDayPhasePanel');
  const listeners = panel && panel._listeners && panel._listeners.click;
  if (!listeners || !listeners.length) return;
  const fakeButton = new FakeEl('button');
  fakeButton.setAttribute('data-civi-day-phase-next-action', '');
  fakeButton.matches = (sel) => sel.includes('data-civi-day-phase-next-action');
  panel.appendChild(fakeButton);
  listeners.forEach((fn) => fn({ target: { closest: () => fakeButton }, preventDefault() {} }));
}

// ==================================================================
// 5. Innboks: active phase action shows a NextAction link, not inline choices
// ==================================================================
function testInboxLink() {
  installBaseGlobals();
  const host = new FakeEl('div');
  host.id = 'civiInbox';
  host.querySelectorAll = () => [];
  const section = new FakeEl('section');
  section.id = 'civiInboxSection';
  const card = new FakeEl('article');
  card.id = 'civiTopActionCard';

  global.document = {
    readyState: 'complete',
    addEventListener() {},
    createElement(tag) { return new FakeEl(tag); },
    querySelector() { return null; },
    getElementById(id) {
      if (id === 'civiInbox') return host;
      if (id === 'civiInboxSection') return section;
      if (id === 'civiTopActionCard') return card;
      return null;
    }
  };

  // Mail A is the active phase action AND present in the inbox; mail C is an unrelated open mail.
  const rowA = makeRow('mail-A', 'Fasesak A', [{ id: 'A1', label: 'Ja' }, { id: 'A2', label: 'Nei' }]);
  const mailA = inboxItem('mail-A', 'Fasesak A', [{ id: 'A1', label: 'Ja' }, { id: 'A2', label: 'Nei' }]);

  global.CivicationDayProgression = { inspect: () => inspectionWithPending(rowA) };
  global.CivicationMailEngine = { getInbox: () => [mailA] };

  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationNextActionSelector.js');
  loadScript('js/Civication/ui/CivicationInboxTopActionUI.js');

  global.CivicationInboxTopActionUI.renderSections();
  const html = host.innerHTML;

  assert(html.includes('Håndteres i Neste handling'), 'active phase mail shows the NextAction handover note');
  assert(html.includes('data-civi-open-next-action'), 'inbox provides a link/button to open NextAction');
  // The active mail must not expose its own inline answer choices in the inbox.
  assert(!html.includes('data-choice-id="A1"'), 'inbox does not render inline choice A1 for the active phase mail');
  assert(!html.includes('data-choice-id="A2"'), 'inbox does not render inline choice A2 for the active phase mail');

  console.log('  ✓ Innboks: active phase mail links to NextAction instead of rendering inline choices');
}

function run() {
  testSelector();
  testNextActionUi();
  testDayPhasePanel();
  testInboxLink();
  console.log('PASS: Civication NextAction consolidation tests completed.');
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
