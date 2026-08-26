#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const rel = value => path.join(ROOT, value);
const read = value => JSON.parse(fs.readFileSync(rel(value), 'utf8'));
const rhythm = require(path.join(ROOT, 'js/Civication/core/civicationWorkRhythm.js'));
const workWorldFactory = require(path.join(ROOT, 'js/Civication/core/civicationWorkWorld.js'));
const authority = require(path.join(ROOT, 'js/Civication/core/civicationInstitutionAuthority.js'));

const ROLE = 'kurator_film_tv';
const OBJECT = 'film_tv_kurator_program_case_001';
const world = read('data/Civication/roleWorlds/film_tv/kurator_film_tv.json');
const index = read('data/Civication/roleWorlds/index.json');
const bank = read('data/Civication/roleWorldThemeBank.json');
const policy = read('data/Civication/roleWorldPolicy.json');
const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const careerMatrix = read('data/Civication/careerGameplayMatrix.json');
const plan = read('data/Civication/mailPlans/film_tv/kurator_film_tv_plan.json');

assert.equal(policy.realism_matrix_gate.broad_rollout_allowed, true);
assert.equal(policy.broad_rollout_governance.mode, 'controlled_role_by_role');
assert.equal(policy.broad_rollout_governance.one_role_per_pr, true);
assert.equal(policy.broad_rollout_governance.existing_scene_pipeline_remains_canonical, true);
assert.equal(policy.broad_rollout_governance.parallel_scene_engine_allowed, false);
assert.equal(policy.broad_rollout_governance.authority_must_not_be_inferred, true);

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.category, 'film_tv');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.deepEqual(world.theme_ids, bank.reference_profiles['film_tv/kurator_film_tv']);
assert.equal(world.materialization.no_new_runtime, true);

const indexed = index.roles.find(row => row.category === 'film_tv' && row.role_scope === ROLE);
assert.deepEqual(indexed, {
  category: 'film_tv', role_scope: ROLE, status: 'role_world_complete',
  path: 'data/Civication/roleWorlds/film_tv/kurator_film_tv.json'
});
assert.equal(index.roles.indexOf(indexed), 6, 'Curator must be the seventh Role World after the six proof/reference worlds');

const coverage = new Map();
const summaries = new Set();
for (const beat of world.season.coverage) {
  const key = String(beat.day) + '/' + beat.phase;
  assert.equal(coverage.has(key), false, 'duplicate coverage ' + key);
  assert.ok(beat.summary.length >= 90, key + ' summary too thin');
  assert.equal(summaries.has(beat.summary), false, key + ' duplicates another summary');
  summaries.add(beat.summary);
  coverage.set(key, beat);
}
assert.equal(coverage.size, 56);
for (let day = 1; day <= 14; day += 1) {
  for (const phase of ['morning','lunch','afternoon','evening']) assert.ok(coverage.has(String(day) + '/' + phase));
}

const idFields = new Set(['id','mail_id','scene_id','scenario_id','story_id','thread_id','event_id','key','role_id','set_id','quiz_id']);
function collectIds(value, out = new Set()) {
  if (Array.isArray(value)) { for (const item of value) collectIds(item, out); return out; }
  if (!value || typeof value !== 'object') return out;
  for (const [key, item] of Object.entries(value)) {
    if (idFields.has(key) && (typeof item === 'string' || typeof item === 'number')) out.add(String(item));
    collectIds(item, out);
  }
  return out;
}
const idCache = new Map();
const provenanceUses = new Set();
function verifyRef(reference) {
  const marker = reference.indexOf('#');
  assert.ok(marker > 0, 'invalid materialization ref ' + reference);
  const file = reference.slice(0, marker);
  const id = reference.slice(marker + 1);
  assert.ok(fs.existsSync(rel(file)), 'missing provenance file ' + file);
  let ids = idCache.get(file);
  if (!ids) { ids = collectIds(read(file)); idCache.set(file, ids); }
  assert.ok(ids.has(id), 'missing provenance id ' + id + ' in ' + file);
  provenanceUses.add(reference);
}
for (const beat of world.season.coverage) beat.materialization_refs.forEach(verifyRef);
for (const aftermath of world.private_aftermath) aftermath.materialization_refs.forEach(verifyRef);
for (const reference of world.materialization.source_refs) verifyRef(reference);
assert.ok(provenanceUses.size >= 16, 'Curator rollout must materially reuse and extend authored provenance');

assert.ok(world.recurring_people_archetypes.length >= 8);
for (const id of ['film_tv_programansvarlig','film_tv_rettighetskoordinator','film_tv_arkivar','film_tv_formidler','film_tv_distributor_kontakt','film_tv_publikumsvert','venn','familie']) {
  assert.ok(world.recurring_people_archetypes.some(person => person.id === id), 'missing recurring person ' + id);
}
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, thread.id);
  assert.ok(new Set(thread.beat_refs.map(ref => Number(ref.split('/')[0]))).size >= 3, thread.id + ' must span multiple days');
  for (const beatRef of thread.beat_refs) assert.ok(coverage.has(beatRef), thread.id + ' missing ' + beatRef);
}
const phaseOrder = new Map([['morning',0],['lunch',1],['afternoon',2],['evening',3]]);
const beatNumber = ref => { const parts = ref.split('/'); return Number(parts[0]) * 10 + phaseOrder.get(parts[1]); };
assert.ok(world.delayed_consequences.length >= 7);
for (const item of world.delayed_consequences) assert.ok(beatNumber(item.return_ref) > beatNumber(item.setup_ref), item.id);

assert.equal(plan.sequence.length, 11);
assert.deepEqual(plan.sequence.slice(4).map(step => step.type), ['job','people','knowledge','conflict','followup','event','consequence']);
assert.ok(plan.sequence.slice(4).every(step => step.fallback_types.length === 0));

const catalogPaths = {
  job: 'data/Civication/mailFamilies/film_tv/job/kurator_film_tv_job.json',
  people: 'data/Civication/mailFamilies/film_tv/people/kurator_film_tv_people.json',
  knowledge: 'data/Civication/mailFamilies/film_tv/knowledge/kurator_film_tv_knowledge.json',
  conflict: 'data/Civication/mailFamilies/film_tv/conflict/kurator_film_tv_conflict.json',
  followup: 'data/Civication/mailFamilies/film_tv/followup/kurator_film_tv_followup.json',
  event: 'data/Civication/mailFamilies/film_tv/event/kurator_film_tv_event.json',
  consequence: 'data/Civication/mailFamilies/film_tv/consequence/kurator_film_tv_consequence.json'
};
const mails = new Map();
for (const [type, file] of Object.entries(catalogPaths)) {
  const catalog = read(file);
  for (const mail of catalog.families.flatMap(family => family.mails || [])) {
    if (mail.id.startsWith('film_tv_kurator_realism_')) {
      assert.equal(mail.mail_type, type);
      assert.equal(mail.role_scope, ROLE);
      mails.set(mail.id, mail);
    }
  }
}
assert.equal(mails.size, 7, 'Controlled curator rollout must materialize exactly seven realism scenes');

const open = mails.get('film_tv_kurator_realism_program_case_open_001');
const handoff = mails.get('film_tv_kurator_realism_rights_handoff_001');
const history = mails.get('film_tv_kurator_realism_history_go_cinemateket_001');
const response = mails.get('film_tv_kurator_realism_rights_response_001');
const rework = mails.get('film_tv_kurator_realism_program_rework_001');
const preview = mails.get('film_tv_kurator_realism_public_preview_001');
const close = mails.get('film_tv_kurator_realism_program_close_001');
for (const scene of [open,handoff,history,response,rework,preview,close]) assert.ok(scene, 'missing realism scene');

assert.ok(open.effects.work_object_ops.some(op => op.op === 'create' && op.work_object.work_object_id === OBJECT));
assert.equal(handoff.work_context.handoff_to_actor_id, 'film_tv_rettighetskoordinator');
assert.ok(handoff.choices.every(choice => choice.effects.social_standing_ops.some(op => op.audience_id === 'professional:film_tv_rettighetskoordinator')));
assert.equal(history.interaction_mode, 'task');
assert.equal(history.task_contract.completion_rule, 'history_go_payload_completed');
assert.deepEqual(history.task_contract.evidence_refs, ['data/places/film_tv/oslo/cinemateket_oslo.json']);
assert.equal(history.task_payload.place_id, 'cinemateket_oslo');
assert.equal(history.work_context.waiting_for_actor_id, 'film_tv_rettighetskoordinator');
assert.equal(response.work_context.waiting_for_actor_id, 'film_tv_rettighetskoordinator');
assert.equal(response.work_context.rework_of_scene_id, handoff.id);
assert.equal(rework.work_context.rework_of_scene_id, response.id);
assert.deepEqual(rework.choices[2].affordance.history_go.task_mail_ids, [history.id]);
assert.equal(preview.work_context.rework_of_scene_id, rework.id);
assert.ok(preview.choices.every(choice => choice.effects.social_standing_ops.some(op => op.audience_id === 'public:cinemateket_publikum')));
assert.equal(close.work_context.rework_of_scene_id, preview.id);
const rules = new Map(close.authority_context.authority_rules.map(rule => [rule.action_id, rule.authority]));
assert.equal(rules.get('recommend_program_lock'), 'influence_only');
assert.equal(rules.get('lock_public_program'), 'approval_required');
assert.equal(rules.get('promise_rights_without_agreement'), 'forbidden');
assert.ok(close.choices.every(choice => choice.authority_action.action_id === 'recommend_program_lock'));
assert.ok(close.choices.every(choice => choice.authority_action.intent === 'recommend'));

function stateApi(initial = {}) {
  let state = JSON.parse(JSON.stringify(initial));
  const merge = (left, right) => {
    const out = { ...(left || {}) };
    for (const [key, value] of Object.entries(right || {})) {
      out[key] = value && typeof value === 'object' && !Array.isArray(value) ? merge(out[key] || {}, value) : value;
    }
    return out;
  };
  return { getState() { return JSON.parse(JSON.stringify(state)); }, setState(patch) { state = merge(state, patch || {}); return this.getState(); } };
}
function applyScene(adapter, scene, choiceId, at) {
  const choice = scene.choices.find(candidate => candidate.id === choiceId);
  assert.ok(choice, scene.id + ' missing choice ' + choiceId);
  adapter.applyOperations(scene.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
  adapter.applyOperations(choice.effects?.work_object_ops || [], { scene_id: scene.id, choice_id: choiceId, at });
}

for (const openChoice of open.choices) {
  for (const handoffChoice of handoff.choices) {
    for (const historyChoice of history.choices) {
      for (const responseChoice of response.choices) {
        for (const reworkChoice of rework.choices) {
          for (const previewChoice of preview.choices) {
            for (const closeChoice of close.choices) {
              const api = stateApi();
              const adapter = workWorldFactory.createAdapter(api);
              applyScene(adapter, open, openChoice.id, '2026-08-25T08:00:00.000Z');
              assert.equal(rhythm.evaluateScene(handoff, api.getState()).eligible, true);
              applyScene(adapter, handoff, handoffChoice.id, '2026-08-25T12:00:00.000Z');
              assert.equal(adapter.getWorkObject(OBJECT).status, 'waiting');
              assert.equal(rhythm.evaluateScene(history, api.getState()).eligible, true);
              applyScene(adapter, history, historyChoice.id, '2026-08-25T18:00:00.000Z');
              assert.equal(rhythm.evaluateScene(response, api.getState()).eligible, true);
              applyScene(adapter, response, responseChoice.id, '2026-08-26T08:00:00.000Z');
              assert.equal(rhythm.evaluateScene(rework, api.getState()).eligible, true);
              applyScene(adapter, rework, reworkChoice.id, '2026-08-26T12:00:00.000Z');
              assert.equal(rhythm.evaluateScene(preview, api.getState()).eligible, true);
              applyScene(adapter, preview, previewChoice.id, '2026-08-27T18:00:00.000Z');
              assert.equal(rhythm.evaluateScene(close, api.getState()).eligible, true);
              const authorityResult = authority.evaluate(close.authority_context, closeChoice.authority_action, { role_scope: ROLE, work_world: adapter });
              assert.equal(authorityResult.allowed, true, 'authored recommendation must stay inside curator authority');
              const forbidden = authority.evaluate(close.authority_context, { action_id: 'promise_rights_without_agreement', intent: 'execute' }, { role_scope: ROLE, work_world: adapter });
              assert.equal(forbidden.allowed, false, 'curator can never manufacture rights authority');
              applyScene(adapter, close, closeChoice.id, '2026-08-28T12:00:00.000Z');
              assert.equal(adapter.getWorkObject(OBJECT).status, 'completed');
            }
          }
        }
      }
    }
  }
}

const career = careerMatrix.worlds.find(row => row.key === 'film_tv/kurator_film_tv');
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);
assert.equal(readiness.rollout_queue.some(row => row.key === 'film_tv/kurator_film_tv'), false, 'completed curator Role World must leave rollout queue');
assert.ok(readiness.roles.find(row => row.key === 'film_tv/kurator_film_tv').already_reference_or_pilot, 'readiness must recognize completed Role World');

execFileSync(process.execPath, ['tests/civication-film-tv-kurator-rollout-playability.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-role-world-contract.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-role-world-broad-rollout-policy.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['scripts/audit-civication-career-gameplay.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['scripts/audit-civication-role-world-rollout-readiness.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['scripts/build-civication-scene-registry.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' });

console.log('civication-film-tv-kurator-role-world-rollout.test.js: PASS');
