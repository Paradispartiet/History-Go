#!/usr/bin/env node
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
    removeItem(key) { store.delete(String(key)); },
    clear() { store.clear(); }
  };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    const fullPath = path.resolve(rootDir, clean);
    if (!fullPath.startsWith(rootDir)) {
      return { ok: false, status: 400, async json() { return null; }, async text() { return ''; } };
    }
    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return { ok: true, status: 200, async json() { return JSON.parse(body); }, async text() { return body; } };
    } catch {
      return { ok: false, status: 404, async json() { return null; }, async text() { return ''; } };
    }
  };
}

function loadScript(relPath) {
  const fullPath = path.join(repoRoot, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function getPendingEvent() {
  const inbox = global.window.CivicationState.getInbox();
  const pending = Array.isArray(inbox) ? inbox.find(item => item && item.status === 'pending') : null;
  return pending ? pending.event : null;
}

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.CustomEvent = class CustomEvent { constructor(type, init) { this.type = type; this.detail = init && init.detail; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);
  global.showToast = () => {};

  global.CivicationCalendar = { getPhase() { return 'morning'; } };
  global.getNextDayCarryover = () => ({ visibilityBias: 0, processBias: 0 });
  global.applyMorningCarryoverEffects = () => {};
  global.getMorningModeFromCarryover = () => 'balanced';
  global.applyMorningModeToEvent = event => event;
  global.setNextDayCarryover = () => {};
  global.appendDayChoiceLog = () => {};
  global.applyPhaseChoiceEffects = () => {};
  global.maybeCreateContactFromChoice = () => {};
  global.HG_CapitalMaintenance = { maintain: () => null };

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/day/dayPatches.js');
  loadScript('js/Civication/mailPlanBridge.js');
  loadScript('js/Civication/systems/civicationMailRuntime.js');

  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;

  const position = {
    career_id: 'naeringsliv',
    career_name: 'Næringsliv & industri',
    title: 'Ekspeditør / butikkmedarbeider',
    role_key: 'ekspeditor',
    role_id: 'naer_ekspeditor'
  };

  global.CivicationState.setActivePosition(position);

  const inspect = global.CivicationMailRuntime.inspect();
  assert.strictEqual(inspect.patched, true, 'CivicationMailRuntime should be patched');
  assert.strictEqual(inspect.role_scope, 'ekspeditor', 'role_scope should resolve to ekspeditor when role_key is ekspeditor');
  assert.strictEqual(inspect.plan_path, 'data/Civication/mailPlans/naeringsliv/ekspeditor_plan.json');

  const candidates = await global.CivicationMailRuntime.debugCandidates();
  assert(candidates.length > 0, 'Expected ekspeditor candidates');

  const first = candidates[0];
  assert.strictEqual(first.source_type, 'planned');
  assert.strictEqual(first.mail_type, 'job');
  assert.strictEqual(first.mail_family, 'kasse_og_pris');
  assert.strictEqual(first.task_domain, 'kasse');
  assert.strictEqual(first.competency, 'noyaktighet');
  assert(first.mail_plan_meta && first.mail_plan_meta.role_scope === 'ekspeditor');
  assert(Array.isArray(first.choices) && first.choices.length >= 2, 'Expected real choices on ekspeditor mail');

  const openResult = await engine.onAppOpen({ force: true });
  assert.strictEqual(openResult.enqueued, true, 'onAppOpen should enqueue ekspeditor planned mail');

  const pending = getPendingEvent();
  assert(pending, 'Expected pending ekspeditor mail');
  assert.strictEqual(pending.source_type, 'planned');
  assert.strictEqual(pending.mail_family, 'kasse_og_pris');
  assert.strictEqual(pending.task_domain, 'kasse');

  const firstChoice = pending.choices[0];
  await engine.answer(pending.id, firstChoice.id);

  const state = global.CivicationState.getState();
  assert.strictEqual(state.consumed[pending.id], true, 'Answered ekspeditor mail should be consumed');
  assert(state.mail_runtime_v1.step_index >= 1, 'Runtime step should advance');
  assert(state.mail_runtime_v1.consumed_ids.includes(pending.id), 'Runtime consumed ids should include answered mail');

  console.log('PASS: ekspeditor work-model mail test completed.');
  console.log(`first_mail=${first.id}`);
  console.log(`pending_mail=${pending.id}`);
  console.log(`runtime_step_index=${state.mail_runtime_v1.step_index}`);
}

run().catch(error => {
  console.error('FAIL: ekspeditor work-model mail test failed.');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
