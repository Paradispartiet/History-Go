#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const repoRoot = path.resolve(__dirname, '..');
const registry = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/compiledSceneRegistryV1.json'), 'utf8'));
const rawReads = [];

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8'));
}
function load(rel, context) {
  vm.runInContext(fs.readFileSync(path.join(repoRoot, rel), 'utf8'), context, { filename: rel });
}
function clone(value) { return JSON.parse(JSON.stringify(value)); }

let active = null;
let state = {};
let inbox = [];
const storage = new Map();
function reset(nextActive) {
  active = clone(nextActive);
  state = {
    stability: 'STABLE', warning_used: false, strikes: 0, score: 0,
    active_role_key: active.role_key, consumed: {}, identity_tags: [], tracks: [], track_progress: {},
    mail_runtime_v1: { version: 1, role_plan_id: null, role_scope: null, career_id: null, step_index: 0, consumed_ids: [], history: [] }
  };
  inbox = [];
}

const windowObject = {
  DEBUG: false,
  localStorage: {
    getItem(key) { return storage.has(key) ? storage.get(key) : null; },
    setItem(key, value) { storage.set(String(key), String(value)); },
    removeItem(key) { storage.delete(key); }
  },
  document: { readyState: 'complete', addEventListener() {} },
  addEventListener() {}, dispatchEvent() {},
  CivicationState: {
    getState: () => state,
    setState(patch) { state = { ...state, ...(patch || {}) }; return state; },
    getActivePosition: () => active,
    setActivePosition(next) { active = next; return active; },
    getInbox: () => inbox,
    setInbox(next) { inbox = Array.isArray(next) ? next : []; return inbox; },
    getPulse: () => ({ date: '2026-08-17', seen: {} }),
    setPulse() {}, appendJobHistoryEnded() {}
  },
  CivicationCareerRoleResolver: {
    resolveCareerRoleScope(pos) { return String(pos?.role_scope || pos?.role_key || '').trim(); },
    resolveCareerRole(pos) { return { role_scope: pos?.role_scope, role_key: pos?.role_key, role_id: pos?.role_id }; }
  },
  CivicationJsonStore: {
    async fetchJson(rel) {
      const p = String(rel || '');
      if (p.startsWith('data/Civication/mailFamilies/')) {
        rawReads.push(p);
        throw new Error(`4H-D forbids raw gameplay catalog read: ${p}`);
      }
      const full = path.join(repoRoot, p);
      if (!fs.existsSync(full)) return null;
      return readJson(p);
    }
  },
  CivicationWorkdayRuntime: { getEmployerId: () => 'semantic_fixture', getWorkdayDayIndex: () => 1 },
  CivicationCareerKnowledgeBridge: { decorateMail: async (mail) => mail }
};
windowObject.window = windowObject;
windowObject.globalThis = windowObject;
windowObject.Event = class Event { constructor(type) { this.type = type; } };
const context = vm.createContext({
  window: windowObject, globalThis: windowObject, document: windowObject.document,
  localStorage: windowObject.localStorage, Event: windowObject.Event,
  console, Date, Promise, Map, Set, Object, Array, String, Number, Boolean, JSON, Math
});

load('js/Civication/core/civicationEventEngine.js', context);
load('js/Civication/systems/civicationSceneInteraction.js', context);
load('js/Civication/systems/civicationMailRuntime.js', context);
load('js/Civication/systems/civicationWorkdayMailBuilder.js', context);
load('js/Civication/systems/day/dayChoiceDirector.js', context);

const engine = new windowObject.CivicationEventEngine();
engine.__civiSuppressImmediateFollowup = true;

async function proveRole(fixture) {
  reset(fixture.active);
  const roleKey = `${fixture.active.career_id}/${fixture.active.role_scope}`;
  const registryIds = new Set(registry.role_index[roleKey] || []);
  assert(registryIds.size > 0, `${fixture.name}: compiled role_index missing`);

  const plan = await windowObject.CivicationSceneCatalog.getRolePlan(fixture.active);
  assert.equal(plan.role_scope, fixture.active.role_scope, `${fixture.name}: plan role_scope`);
  const firstPlanStep = plan.sequence[0];
  const first = await windowObject.CivicationSceneDirector.getPrimaryWorkScene(fixture.active, state, { consumer: '4hd_semantic_gate_first' });
  assert(first, `${fixture.name}: first planned scene missing`);
  assert(registryIds.has(first.id), `${fixture.name}: first scene must come from compiled role_index`);
  assert.equal(first.source_type, 'planned', `${fixture.name}: first scene must be planned`);
  assert.equal(first.mail_plan_meta?.step_index, 0, `${fixture.name}: first scene must bind plan step 0`);
  assert.equal(first.mail_type, firstPlanStep.type, `${fixture.name}: first scene must match step type`);
  assert(firstPlanStep.allowed_families.includes(first.mail_family), `${fixture.name}: first scene must match allowed family`);
  const interaction = windowObject.CivicationSceneInteraction.classify(first);
  assert.equal(interaction.valid, true, `${fixture.name}: first interaction valid`);
  assert.equal(interaction.actionable, true, `${fixture.name}: first interaction actionable`);
  assert(first.choices.length > 0, `${fixture.name}: proof scene needs a real response`);

  engine.enqueueEvent(first);
  const pending = engine.getPendingEvent();
  assert.equal(pending?.event?.id, first.id, `${fixture.name}: planned scene delivered to EventEngine`);
  const chosen = first.choices.find((choice) => !choice.triggers_on_choice) || first.choices[0];
  const scoreBefore = Number(state.score || 0);
  const result = await engine.answer(first.id, chosen.id);
  assert.equal(result?.ok, true, `${fixture.name}: ChoiceDirector answer should succeed`);
  assert.equal(result?.choice_director?.blocked, false, `${fixture.name}: ChoiceDirector owns successful boundary`);
  assert.equal(result?.choice_director?.choice_id, chosen.id, `${fixture.name}: ChoiceDirector records choice`);
  assert.equal(state.mail_runtime_v1?.step_index, 1, `${fixture.name}: MailRuntime must advance plan step`);
  assert.equal(state.consumed?.[first.id], true, `${fixture.name}: answered scene consumed`);
  assert.equal(state.mail_runtime_v1?.history?.at(-1)?.id, first.id, `${fixture.name}: progression history records scene`);
  assert.equal(Number(state.score || 0), Math.max(-5, Math.min(2, scoreBefore + Number(chosen.effect || 0))), `${fixture.name}: EventEngine consequence applied`);

  inbox = [];
  const secondPlanStep = plan.sequence[1];
  const second = await windowObject.CivicationSceneDirector.getPrimaryWorkScene(fixture.active, state, { consumer: '4hd_semantic_gate_next' });
  assert(second, `${fixture.name}: next planned scene missing after answer`);
  assert(registryIds.has(second.id), `${fixture.name}: next scene must come from compiled role_index`);
  assert.notEqual(second.id, first.id, `${fixture.name}: consumed scene must not repeat`);
  assert.equal(second.mail_plan_meta?.step_index, 1, `${fixture.name}: next scene must bind plan step 1`);
  assert.equal(second.mail_type, secondPlanStep.type, `${fixture.name}: next scene must match next step type`);
  assert(secondPlanStep.allowed_families.includes(second.mail_family), `${fixture.name}: next scene must match next allowed family`);

  return { name: fixture.name, first: first.id, choice: chosen.id, next: second.id };
}

(async () => {
  assert.equal(windowObject.CivicationMailRuntime.inspect().answer_middleware_registered, true, 'MailRuntime middleware must be registered in ChoiceDirector');
  const proofs = [];
  proofs.push(await proveRole({
    name: 'Renholder',
    active: { career_id: 'naeringsliv', role_scope: 'renholder', role_key: 'renholder', role_id: 'naer_renholder', title: 'Renholder' }
  }));
  proofs.push(await proveRole({
    name: 'Arealplanlegger',
    active: { career_id: 'by', role_scope: 'by_radgiver_plan', role_key: 'by_radgiver_plan', role_id: 'by_radgiver_plan', title: 'Arealplanlegger' }
  }));

  assert.deepEqual(rawReads, [], `4H-D primary playthrough must not read raw mailFamilies: ${rawReads.join(', ')}`);
  const inspect = windowObject.CivicationSceneDirector.inspect();
  assert.equal(inspect.scene_catalog?.source_format, 'compiled_scene_registry_v1');
  assert.equal(inspect.scene_catalog?.compiled_registry_loaded, true);
  console.log(`Civication 4H-D semantic playthrough gate OK: ${JSON.stringify(proofs)}`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
