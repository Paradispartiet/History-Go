'use strict';
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));

const KEY = 'litteratur/redaksjonsmedarbeider';
const WORLD_PATH = 'data/Civication/roleWorlds/litteratur/redaksjonsmedarbeider.json';
const PLAN_PATH = 'data/Civication/mailPlans/litteratur/redaksjonsmedarbeider_plan.json';
const TYPES = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const PLAN_TYPES = ['job','people','conflict','knowledge','event','micro','followup','story'];
const catalogPath = type => `data/Civication/mailFamilies/litteratur/${type}/redaksjonsmedarbeider_${type}.json`;
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const parseRef = ref => { const [rel,id] = ref.split('#'); return {rel,id}; };
const parseBeat = ref => { const [day, phase] = ref.split('/'); return {day:Number(day),phase}; };
const beatOrder = ref => { const {day,phase}=parseBeat(ref); return day*10+({morning:1,lunch:2,afternoon:3,evening:4}[phase]||0); };

const expected = {
  job:['manusmottak_og_versjonsgrunnlag','litteratur_redaksjonsmedarbeider_job_versjon_001'],
  people:['rolleavklaring_og_felles_status','litteratur_redaksjonsmedarbeider_people_status_001'],
  conflict:['sen_endring_og_mandat','litteratur_redaksjonsmedarbeider_conflict_endring_001'],
  story:['sporbarhet_som_redaksjonell_praksis','litteratur_redaksjonsmedarbeider_story_arbeidsdag_001'],
  event:['produksjonsavvik_og_replanlegging','litteratur_redaksjonsmedarbeider_event_avvik_001'],
  micro:['siste_sporbarhetskontroll','litteratur_redaksjonsmedarbeider_micro_undertittel_001'],
  followup:['feilversjon_korrigering_og_laring','litteratur_redaksjonsmedarbeider_followup_versjon_001'],
  knowledge:['rettighetsspor_og_eskalering','litteratur_redaksjonsmedarbeider_knowledge_rettighet_001'],
  consequence:['feilversjon_korrigering_og_laring','litteratur_redaksjonsmedarbeider_consequence_versjon_001']
};

const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'litteratur');
assert.equal(world.role_scope, 'redaksjonsmedarbeider');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverageKeys = new Set(world.season.coverage.map(beat => `${beat.day}/${beat.phase}`));
assert.equal(coverageKeys.size, 56);
for (let day=1; day<=14; day+=1) for (const phase of world.season.day_phases) assert.ok(coverageKeys.has(`${day}/${phase}`));
assert.ok(world.recurring_people_archetypes.length >= 5);
assert.ok(world.slow_axes.length >= 8);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);
assert.equal(world.materialization.no_new_runtime, true);
assert.deepEqual(world.materialization.authored_dimensions, ['persistent_work_object']);

const object = world.persistent_work_object;
assert.equal(object.id, 'manuspakke_versjonsspor_001');
assert.equal(object.object_type, 'editorial_manuscript_package');
assert.ok(object.canonical_fields.length >= 8);
assert.ok(object.state_history.length >= 10);
assert.ok(object.state_history.every(state => state.day >= 1 && state.day <= 14));
assert.ok(object.state_history.every(state => state.object_id === object.id));
assert.ok(object.state_history.every(state => String(state.state || '').trim()));
assert.ok(object.handoff_contract.required_fields.includes('canonical_version'));
assert.ok(object.handoff_contract.required_fields.includes('decision_owner'));
assert.ok(object.handoff_contract.required_fields.includes('dependencies'));
assert.ok(object.handoff_contract.required_fields.includes('recipient_acknowledgement'));
assert.match(object.identity_rule, /samme|same/i);
assert.match(object.identity_rule, /scene|mail|beat/i);
assert.equal(object.continuity_proof.spans_all_14_days, true);
assert.equal(object.continuity_proof.reuses_existing_scene_pipeline, true);
assert.equal(object.continuity_proof.new_runtime_state, false);

const worldText = JSON.stringify(world);
assert.match(worldText, /manuspakke|arbeidsobjekt|work object/i);
assert.match(worldText, /versjon/i);
assert.match(worldText, /beslutningseier|decision_owner/i);
assert.match(worldText, /rettighet/i);
assert.match(worldText, /mottaker/i);
assert.match(worldText, /avledet|derived/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'Redaksjonsmedarbeider rollout must reuse exactly the existing 9 authored mail scenes');
for (const type of TYPES) {
  const [familyId,mailId] = expected[type];
  const ref = `${catalogPath(type)}#${mailId}`;
  assert.ok(refs.includes(ref), `Missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'litteratur');
  assert.equal(doc.role_scope, 'redaksjonsmedarbeider');
  assert.equal(doc.mail_type, type);
  const family = (doc.families || []).find(row => row.id === familyId);
  assert.ok(family, `Missing planned ${type} family ${familyId}`);
  assert.ok((family.mails || []).some(row => row.id === mailId), `Missing planned ${type} scene ${mailId}`);
}
for (const ref of refs) {
  const {rel,id} = parseRef(ref);
  assert.ok(rel && id && exists(rel));
  assert.ok(flattenMails(readJson(rel)).some(row => row.id === id));
}
for (const beat of world.season.coverage) {
  assert.ok(beat.summary.length >= 100, `${beat.day}/${beat.phase}: summary must remain substantive`);
  assert.ok(beat.materialization_refs.length >= 1);
  for (const ref of beat.materialization_refs) assert.ok(refs.includes(ref));
}
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const ref of thread.beat_refs) assert.ok(coverageKeys.has(ref));
}
for (const delayed of world.delayed_consequences) {
  assert.ok(coverageKeys.has(delayed.setup_ref));
  assert.ok(coverageKeys.has(delayed.return_ref));
  assert.ok(beatOrder(delayed.return_ref) > beatOrder(delayed.setup_ref));
}

const plan = readJson(PLAN_PATH);
assert.equal(plan.sequence.length, 8, 'Redaksjonsmedarbeider keeps the exact existing 8-step plan');
assert.deepEqual(plan.sequence.map(step => step.type), PLAN_TYPES);
assert.deepEqual(plan.sequence.map(step => step.allowed_families[0]), PLAN_TYPES.map(type => expected[type][0]));

const roleModel = readJson('data/Civication/roleModels/litteratur/redaksjonsmedarbeider.json');
for (const boundary of [
  'love en utgivelse eller avtale uten mandat',
  'endre forfatterens tekst i det skjulte',
  'overstyre rettigheter, kontrakter eller endelig redaksjonell myndighet'
]) assert.ok((roleModel.authority_boundaries?.cannot || []).includes(boundary), `Missing authority boundary: ${boundary}`);
for (const type of TYPES) for (const scene of flattenMails(readJson(catalogPath(type)))) for (const option of scene.choices || []) assert.equal(option.authority_action, undefined, `${scene.id}: rollout must not manufacture authority actions`);

const followup = flattenMails(readJson(catalogPath('followup'))).find(row => row.id === expected.followup[1]);
const consequence = flattenMails(readJson(catalogPath('consequence'))).find(row => row.id === expected.consequence[1]);
assert.equal(followup.thread_key, 'litteratur_redaksjonsmedarbeider_versjon_001');
assert.equal(consequence.thread_key, followup.thread_key, 'existing correction thread must remain intact');

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'litteratur' && row.role_scope === 'redaksjonsmedarbeider' && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_LITTERATUR_REDAKSJONSMEDARBEIDER_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_LITTERATUR_REDAKSJONSMEDARBEIDER_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);
for (const type of TYPES) {
  const family = career.artifacts?.mail_families?.[type];
  assert.equal(family?.path, catalogPath(type));
  assert.ok(Number(family?.count || 0) >= 1);
}

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 18);
assert.ok(readiness.summary?.rollout_queue_roles <= 67);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: litteratur/redaksjonsmedarbeider');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Litteratur Redaksjonsmedarbeider Role World rollout closes persistent-work-object debt fail-closed');
