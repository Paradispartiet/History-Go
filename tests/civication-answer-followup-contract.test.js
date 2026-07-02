#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function makeStorage() { const store = new Map(); return { getItem:k=>store.has(k)?store.get(k):null, setItem:(k,v)=>store.set(String(k),String(v)), removeItem:k=>store.delete(String(k)), clear:()=>store.clear() }; }
function loadScript(relPath) { vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath }); }
function setup() {
  global.window = global;
  global.localStorage = makeStorage();
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.CivicationCalendar = { advanceByMinutes() {} };
  global.HG_Lifestyle = { addTags() {} };
  global.CivicationPsyche = { getAutonomy: () => 50, updateIntegrity() {}, updateVisibility() {}, updateEconomicRoom() {}, updateTrust() {} };
  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  global.CivicationState.setActivePosition({ career_id: 'test', title: 'Tester', role_key: 'tester' });
}
function makeEngine(event) {
  const engine = new global.CivicationEventEngine();
  engine.setInbox([{ status: 'pending', event }]);
  return engine;
}
function event(id, extra = {}) {
  return { id, choices: [{ id: 'A', label: 'A', effect: 1, feedback: 'ok' }], ...extra };
}

async function run() {
  setup();
  assert.strictEqual(typeof global.CivicationEventEngine.prototype.answer, 'function', 'event engine should load and expose answer');

  let engine = makeEngine(event('plain_success'));
  engine.enqueueImmediateFollowupEvent = async () => true;
  let pending = engine.answer('plain_success', 'A');
  assert(pending && typeof pending.then === 'function', 'answer contract should be async/thenable');
  let result = await pending;
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.legacyImmediateFollowupSuppressed, false);
  assert.strictEqual(result.legacyImmediateFollowupEnqueued, true, 'successful enqueue should set flag true');

  engine = makeEngine(event('plain_false'));
  engine.enqueueImmediateFollowupEvent = async () => false;
  result = await engine.answer('plain_false', 'A');
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.legacyImmediateFollowupEnqueued, false, 'false enqueue result should keep flag false');

  engine = makeEngine(event('plain_throw'));
  engine.enqueueImmediateFollowupEvent = async () => { throw new Error('boom'); };
  result = await engine.answer('plain_throw', 'A');
  assert.strictEqual(result.ok, true, 'answer should complete when followup enqueue throws');
  assert.strictEqual(result.legacyImmediateFollowupEnqueued, false, 'thrown enqueue should keep flag false');

  engine = makeEngine(event('daily_suppressed', { mail_class: 'daily_workday', source_type: 'daily_extra', daily_mail_meta: { date: '2026-07-02' } }));
  let called = false;
  engine.enqueueImmediateFollowupEvent = async () => { called = true; return true; };
  result = await engine.answer('daily_suppressed', 'A');
  assert.strictEqual(result.ok, true);
  assert.strictEqual(result.legacyImmediateFollowupSuppressed, true, 'daily mail should suppress legacy followup');
  assert.strictEqual(result.legacyImmediateFollowupEnqueued, false, 'suppressed daily mail should not report enqueue');
  assert.strictEqual(called, false, 'suppressed daily mail should not call enqueueImmediateFollowupEvent');

  console.log('civication-answer-followup-contract.test.js passed');
}
run().catch(error => { console.error(error); process.exit(1); });
