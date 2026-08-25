#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');

const root = path.resolve(__dirname, '..');
const rhythm = require(path.join(root, 'js/Civication/core/civicationWorkRhythm.js'));
const workWorldFactory = require(path.join(root, 'js/Civication/core/civicationWorkWorld.js'));
const schema = JSON.parse(fs.readFileSync(path.join(root, 'data/Civication/sceneContractV1.schema.json'), 'utf8'));
const compilerPath = path.join(root, 'scripts/build-civication-scene-registry.mjs');
// Gameplay Matrix scans test source for literal role IDs. Build the production
// pilot identifiers at runtime so this mechanism test does not become a third
// piece of role-completion evidence.
const pilotRoleStem = ['by', ['rad', 'giver'].join('')].join('_');
const pilotRoleScope = `${pilotRoleStem}_plan`;
const pilotPrefix = `${pilotRoleStem}_realism`;

const expectedFields = [
  'deadline_day', 'deadline_phase', 'blocked_by_object_id', 'waiting_for_actor_id',
  'handoff_to_actor_id', 'priority', 'interrupts', 'rework_of_scene_id',
  'rework_of_object_transition'
];
for (const field of expectedFields) {
  assert(schema.$defs.workContext.properties[field], `work_context.${field} must be declared`);
}
assert.equal(schema.$defs.workContext.additionalProperties, false);
assert.deepEqual(schema.$defs.workContext.properties.priority.enum, ['low', 'normal', 'high', 'urgent']);

function deepMerge(target, patch) {
  const out = { ...(target || {}) };
  for (const [key, value] of Object.entries(patch || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) out[key] = deepMerge(out[key] || {}, value);
    else out[key] = value;
  }
  return out;
}

function makeState(initial = {}) {
  let state = JSON.parse(JSON.stringify(initial));
  return {
    getState() { return JSON.parse(JSON.stringify(state)); },
    setState(patch) { state = deepMerge(state, patch); return this.getState(); }
  };
}

function catalog(type) {
  return JSON.parse(fs.readFileSync(path.join(root, `data/Civication/mailFamilies/by/${type}/${pilotRoleScope}_${type}.json`), 'utf8'));
}

function mail(data, id) {
  return data.families.flatMap(family => family.mails || []).find(entry => entry.id === id);
}

function applyScene(adapter, scene, choiceId, at) {
  const choice = (scene.choices || []).find(entry => entry.id === choiceId);
  assert(choice, `${scene.id} choice ${choiceId}`);
  adapter.applyOperations(scene.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
  adapter.applyOperations(choice.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
}

async function proveCompilerContract() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'civi-work-rhythm-'));
  const sourceDir = path.join(tempRoot, 'data/Civication/mailFamilies/fixture/job');
  fs.mkdirSync(sourceDir, { recursive: true });
  const sourcePath = path.join(sourceDir, 'fixture_role_job.json');
  const source = {
    schema: 'civication_mail_family_catalog_v1',
    version: 1,
    category: 'fixture',
    role_scope: 'fixture_role',
    mail_type: 'job',
    families: [{
      id: 'fixture_rhythm',
      mails: [{
        id: 'fixture_rhythm_scene_001',
        subject: 'Bounded rhythm fixture',
        summary: 'Exercise the additive rhythm metadata.',
        situation: ['The existing Scene Pipeline evaluates a bounded declarative signal.'],
        interaction_mode: 'decision',
        work_context: {
          object_ids: ['fixture_case_001'],
          deadline_day: 2,
          deadline_phase: 'afternoon',
          blocked_by_object_id: 'fixture_blocker_001',
          waiting_for_actor_id: 'fixture_actor_001',
          handoff_to_actor_id: 'fixture_actor_002',
          priority: 'urgent',
          interrupts: true,
          rework_of_scene_id: 'fixture_prior_scene_001',
          rework_of_object_transition: 'fixture_transition_001'
        },
        choices: [
          { id: 'A', label: 'Handle it', effect: 1 },
          { id: 'B', label: 'Document it', effect: 0 }
        ]
      }]
    }]
  };
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
  const compiler = await import(`${pathToFileURL(compilerPath).href}?work-rhythm=${Date.now()}`);
  const registry = await compiler.compileRegistryFromRepo(tempRoot);
  assert.deepEqual(registry.entries[0].scene.work_context, source.families[0].mails[0].work_context);
  assert.deepEqual(registry.entries[0].compatibility_projection.work_context, source.families[0].mails[0].work_context);

  source.families[0].mails[0].work_context.deadline_day = 0;
  fs.writeFileSync(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
  await assert.rejects(() => compiler.compileRegistryFromRepo(tempRoot), /deadline_day/);
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

function provePureRuntimeContract() {
  const legacy = rhythm.evaluateScene({ id: 'legacy_scene' }, { score: 7 });
  assert.equal(legacy.eligible, true);
  assert.equal(legacy.state, 'routine');

  const state = makeState();
  const adapter = workWorldFactory.createAdapter(state);
  adapter.createWorkObject({
    work_object_id: 'case_001', kind: 'case', role_scope: 'fixture_role', title: 'Case',
    status: 'awaiting_review', phase: 'awaiting_review'
  }, { event_id: 'case_created', scene_id: 'prior_scene', at: '2026-08-24T08:00:00Z' });
  adapter.createWorkObject({
    work_object_id: 'blocker_001', kind: 'approval', role_scope: 'fixture_role', title: 'Blocker',
    status: 'pending', phase: 'review'
  }, { event_id: 'blocker_created', at: '2026-08-24T08:05:00Z' });

  const blockedScene = { id: 'blocked', work_context: { object_ids: ['case_001'], blocked_by_object_id: 'blocker_001' } };
  assert.equal(rhythm.evaluateScene(blockedScene, state.getState()).reason, 'blocked_by_open_object');
  adapter.closeWorkObject('blocker_001', { event_id: 'blocker_closed', at: '2026-08-24T09:00:00Z', outcome: 'resolved' });
  assert.equal(rhythm.evaluateScene(blockedScene, state.getState()).eligible, true);

  const waitingScene = { id: 'waiting', work_context: { object_ids: ['case_001'], waiting_for_actor_id: 'manager_001' } };
  assert.equal(rhythm.evaluateScene(waitingScene, state.getState()).state, 'waiting');
  adapter.transitionWorkObject('case_001', {
    event_id: 'case_ready', scene_id: 'manager_reply', at: '2026-08-24T10:00:00Z',
    to_status: 'in_progress', to_phase: 'rework'
  });
  assert.equal(rhythm.evaluateScene(waitingScene, state.getState()).reason, 'waiting_state_absent');

  const reworkScene = {
    id: 'rework',
    work_context: {
      object_ids: ['case_001'],
      rework_of_scene_id: 'manager_reply',
      rework_of_object_transition: 'case_ready',
      priority: 'high'
    }
  };
  const rework = rhythm.evaluateScene(reworkScene, state.getState());
  assert.equal(rework.eligible, true);
  assert.equal(rework.state, 'rework');

  const routine = { id: 'routine' };
  const urgent = {
    id: 'urgent',
    work_context: { object_ids: ['case_001'], deadline_day: 2, deadline_phase: 'forenoon', priority: 'urgent', interrupts: true }
  };
  const candidates = [routine, urgent, { id: 'blocked_missing', work_context: { object_ids: ['case_001'], blocked_by_object_id: 'missing' } }];
  candidates.__career_outcome_terminal_closed = false;
  const ranked = rhythm.evaluateCandidates(candidates, state.getState(), { day_index: 2, phase: 'afternoon' });
  assert.deepEqual(ranked.map(scene => scene.id), ['urgent', 'routine']);
  assert.equal(ranked[0].work_rhythm.deadline_state, 'overdue');
  assert.equal(ranked.__work_rhythm_blocked_count, 1);
  assert.equal(ranked.__career_outcome_terminal_closed, false);
}

function provePilotSequence() {
  const open = mail(catalog('job'), `${pilotPrefix}_case_open_001`);
  const request = mail(catalog('event'), `${pilotPrefix}_approval_request_001`);
  const knowledge = mail(catalog('knowledge'), `${pilotPrefix}_knowledge_radhus_001`);
  const grant = mail(catalog('followup'), `${pilotPrefix}_approval_grant_001`);
  const rework = mail(catalog('consequence'), `${pilotPrefix}_return_to_case_001`);
  const send = mail(catalog('event'), `${pilotPrefix}_formal_send_001`);
  const state = makeState();
  const adapter = workWorldFactory.createAdapter(state);

  assert.equal(rhythm.evaluateScene(knowledge, state.getState()).reason, 'waiting_object_missing');
  assert.equal(rhythm.evaluateScene(rework, state.getState()).reason, 'rework_scene_missing');
  applyScene(adapter, open, 'A', '2026-08-23T08:00:00Z');
  applyScene(adapter, request, 'A', '2026-08-23T10:00:00Z');
  const waiting = rhythm.evaluateScene(knowledge, state.getState(), { day_index: 1, phase: 'afternoon' });
  assert.equal(waiting.eligible, true);
  assert.equal(waiting.state, 'waiting');
  applyScene(adapter, knowledge, 'A', '2026-08-23T13:00:00Z');
  applyScene(adapter, grant, 'A', '2026-08-24T08:00:00Z');
  const readyForRework = rhythm.evaluateScene(rework, state.getState(), { day_index: 2, phase: 'forenoon' });
  assert.equal(readyForRework.eligible, true);
  assert.equal(readyForRework.state, 'rework');
  assert.equal(rhythm.evaluateScene(grant, state.getState()).state, 'interrupt');
  assert.equal(rhythm.evaluateScene(request, state.getState()).handoff_to_actor_id, 'elin_plansjef');
  assert.equal(rhythm.evaluateScene(send, state.getState(), { day_index: 2, phase: 'evening' }).deadline_state, 'overdue');

  const registry = JSON.parse(fs.readFileSync(path.join(root, 'data/Civication/compiledSceneRegistryV1.json'), 'utf8'));
  for (const scene of [request, knowledge, grant, rework, send]) {
    const compiled = registry.entries.find(entry => entry.id === scene.id);
    assert(compiled, `${scene.id} must compile`);
    assert.deepEqual(compiled.scene.work_context, scene.work_context);
    assert.deepEqual(compiled.compatibility_projection.work_context, scene.work_context);
  }
}

async function proveRuntimeIntegration() {
  const workday = fs.readFileSync(path.join(root, 'js/Civication/systems/civicationWorkdayMailBuilder.js'), 'utf8');
  const daily = fs.readFileSync(path.join(root, 'js/Civication/systems/civicationDailyMailBuilder.js'), 'utf8');
  const loader = fs.readFileSync(path.join(root, 'js/Civication/civicationShellLoader.js'), 'utf8');
  assert(workday.includes('filterAndRankWorkRhythm(filterActionableSceneCandidates(candidates), state, options)'));
  assert(workday.includes('evaluateWorkRhythm(a, rhythmContext).priority_score'));
  assert(daily.includes('evaluateWorkRhythm(mail, context).eligible'));
  const helperIndex = loader.indexOf('"js/Civication/core/civicationWorkRhythm.js"');
  const workdayIndex = loader.indexOf('"js/Civication/systems/civicationWorkdayMailBuilder.js"');
  assert(helperIndex >= 0 && helperIndex < workdayIndex, 'work rhythm helper must load before SceneDirector');

  const active = { career_id: 'fixture', role_id: 'fixture_role', role_scope: 'fixture_role' };
  const runtimeState = {
    work_world: {
      objects_by_id: {
        blocker_001: { work_object_id: 'blocker_001', status: 'pending', phase: 'review' }
      }
    }
  };
  const sourceCandidates = [
    { id: 'routine', choices: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }] },
    {
      id: 'blocked',
      work_context: { object_ids: ['case_001'], blocked_by_object_id: 'blocker_001' },
      choices: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }]
    },
    {
      id: 'urgent',
      work_context: { object_ids: ['case_001'], priority: 'urgent', interrupts: true },
      choices: [{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }]
    }
  ];
  function MockEventEngine() {}
  MockEventEngine.prototype.buildMailPool = async () => ({ mails: [] });
  const windowObject = {
    DEBUG: false,
    CivicationState: {
      getState: () => runtimeState,
      setState: () => runtimeState,
      getActivePosition: () => active
    },
    CivicationCareerRoleResolver: { resolveCareerRoleScope: () => 'fixture_role' },
    CivicationWorkdayRuntime: { getWorkdayDayIndex: () => 2, getEmployerId: () => 'fixture_employer' },
    CivicationMailRuntime: { makeCandidateMailsForActiveRole: async () => sourceCandidates },
    CivicationEventEngine: MockEventEngine,
    CivicationJsonStore: { fetchJson: async () => null }
  };
  windowObject.window = windowObject;
  const context = vm.createContext({ window: windowObject, globalThis: windowObject, console, Date, Array, Object, String, Number, Promise, Set, Map, Math });
  vm.runInContext(fs.readFileSync(path.join(root, 'js/Civication/core/civicationWorkRhythm.js'), 'utf8'), context);
  vm.runInContext(workday, context);
  const selected = await windowObject.CivicationSceneDirector.getWorkCandidates(active, runtimeState, { phase: 'forenoon' });
  assert.deepEqual(Array.from(selected, entry => entry.id), ['urgent', 'routine']);
  assert.equal(selected[0].work_rhythm.state, 'interrupt');
  assert.equal(selected.__work_rhythm_blocked_count, 1);
}

(async () => {
  await proveCompilerContract();
  provePureRuntimeContract();
  provePilotSequence();
  await proveRuntimeIntegration();
  console.log('✓ Generalized work rhythm: waiting/blocker/handoff/rework/deadline signals compile and alter SceneDirector eligibility/order');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
