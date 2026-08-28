'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const parseBeat = ref => { const [day, phase] = ref.split('/'); return { day:Number(day), phase }; };
const beatOrder = ref => { const {day, phase} = parseBeat(ref); return day * 10 + ({morning:1,lunch:2,afternoon:3,evening:4}[phase] || 0); };

const KEY = 'by/by_arkitekt';
const ROLE = 'by_arkitekt';
const WORLD_PATH = 'data/Civication/roleWorlds/by/by_arkitekt.json';
const PLAN_PATH = 'data/Civication/mailPlans/by/by_arkitekt_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/by/by_arkitekt.json';
const MODEL_PATH = 'data/Civication/roleModels/by/arkitekt.json';
const COMPAT_MODEL_PATH = 'data/Civication/roleModels/by/by_arkitekt.json';
const TYPES = ['job','people','conflict','event','micro','story','knowledge','followup','consequence'];
const expected = {
  job:'by_arkitekt_job_forste_001',
  people:'by_arkitekt_people_sara_001',
  conflict:'by_arkitekt_conflict_nora_001',
  event:'by_arkitekt_event_modell_001',
  micro:'by_arkitekt_micro_dor_001',
  story:'by_arkitekt_story_mikkel_001',
  knowledge:'by_arkitekt_knowledge_gateplan_001',
  followup:'by_arkitekt_followup_inngang_001',
  consequence:'by_arkitekt_consequence_gateplan_001'
};
const catalogPath = type => `data/Civication/mailFamilies/by/${type}/by_arkitekt_${type}.json`;

assert.ok(exists(WORLD_PATH), 'By Arkitekt Role World must exist before strict rollout proof runs');
const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'by');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverageKeys = new Set(world.season.coverage.map(beat => `${beat.day}/${beat.phase}`));
assert.equal(coverageKeys.size, 56);
for (let day = 1; day <= 14; day += 1) {
  for (const phase of world.season.day_phases) assert.ok(coverageKeys.has(`${day}/${phase}`));
}
for (const beat of world.season.coverage) {
  assert.ok(String(beat.summary || '').length >= 120, `${beat.day}/${beat.phase}: substantive coverage required`);
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
}
assert.ok(world.recurring_people_archetypes.length >= 6);
assert.ok(world.slow_axes.length >= 8);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);
assert.deepEqual(world.materialization.authored_dimensions, ['rhythm_waiting_handoff_rework','situated_reputation']);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);

const rhythm = world.work_rhythm_model;
assert.equal(rhythm.runtime_binding, 'editorial_only_existing_pipeline');
assert.equal(rhythm.continuity_anchor, 'by_arkitekt_people_sara_001');
assert.equal(rhythm.new_runtime_state, false);
for (const id of ['waiting','handoff','rework','interruption','delayed_consequence']) {
  const state = (rhythm.states || []).find(row => row.id === id);
  assert.ok(state, `missing rhythm state ${id}`);
  assert.ok(String(state.meaning || '').length >= 45);
  assert.ok(Array.isArray(state.guardrails) && state.guardrails.length >= 2);
}
assert.ok((rhythm.transitions || []).length >= 6);
assert.ok(rhythm.transitions.some(row => row.from === 'waiting' && row.to === 'handoff'));
assert.ok(rhythm.transitions.some(row => row.from === 'handoff' && row.to === 'rework'));
assert.ok(rhythm.transitions.some(row => row.to === 'delayed_consequence'));
assert.match(rhythm.rule, /waiting|vent|handoff|overlever|rework/i);
assert.match(rhythm.rule, /godkjenn|mandat|sikkerhet|tilgjengelig/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
const requiredAudiences = ['atelier_leadership','city_life_specialists','projecting_team','project_or_client_leadership','users_and_public','private_relationships'];
const audienceIds = new Set((rep.audiences || []).map(row => row.id));
for (const id of requiredAudiences) assert.ok(audienceIds.has(id), `missing audience ${id}`);
const standingAxes = rep.audiences.map(row => row.standing_axis);
assert.equal(new Set(standingAxes).size, standingAxes.length);
for (const audience of rep.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.ok(String(audience.cannot_grant || '').length >= 30);
}
assert.ok(rep.divergence_examples.length >= 3);
assert.match(rep.rule, /audience|spesifikk|diverg|standing/i);
assert.match(rep.authority_separation, /godkjenn|byggesak|plan|sikkerhet|tilgjengelig|myndighet/i);
for (const axis of world.slow_axes) {
  if (String(axis.id).includes('standing') || String(axis.id).includes('mask')) {
    assert.equal(axis.runtime_binding, 'editorial_only_until_governed');
  }
}

const cross = world.cross_role_link;
assert.equal(cross.status, 'not_required_for_rollout');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /shared work|delt arbeid|genuin/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'must reuse exactly nine canonical Arkitekt mail scenes');
for (const type of TYPES) {
  const ref = `${catalogPath(type)}#${expected[type]}`;
  assert.ok(refs.includes(ref), `missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'by');
  assert.equal(doc.role_scope, ROLE);
  assert.equal(doc.mail_type, type);
  assert.ok(flattenMails(doc).some(row => row.id === expected[type]), `missing canonical scene ${expected[type]}`);
}
for (const ref of refs) {
  const [rel, id] = ref.split('#');
  assert.ok(rel && id && exists(rel));
  assert.ok(flattenMails(readJson(rel)).some(row => row.id === id), `missing provenance target ${ref}`);
}
for (const beat of world.season.coverage) {
  for (const ref of beat.materialization_refs) assert.ok(refs.includes(ref), `${beat.day}/${beat.phase}: unknown source ref`);
}
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, `${thread.id}: thread length`);
  for (const ref of thread.beat_refs) assert.ok(coverageKeys.has(ref), `${thread.id}: missing beat ${ref}`);
}
for (const delayed of world.delayed_consequences) {
  assert.ok(coverageKeys.has(delayed.setup_ref));
  assert.ok(coverageKeys.has(delayed.return_ref));
  assert.ok(beatOrder(delayed.return_ref) > beatOrder(delayed.setup_ref), `${delayed.id}: delayed consequence must return later`);
}

for (const type of TYPES) {
  const scene = flattenMails(readJson(catalogPath(type))).find(row => row.id === expected[type]);
  assert.ok(scene, `missing locked Arkitekt ${type} scene`);
}
const peopleScene = flattenMails(readJson(catalogPath('people'))).find(row => row.id === expected.people);
const followupScene = flattenMails(readJson(catalogPath('followup'))).find(row => row.id === expected.followup);
const consequenceScene = flattenMails(readJson(catalogPath('consequence'))).find(row => row.id === expected.consequence);
assert.equal(peopleScene.person_id, 'bylivsansvarlig_sara');
assert.equal(followupScene.person_id, 'bylivsansvarlig_sara');
assert.equal(consequenceScene.person_id, 'atelierleder_nora');
assert.match(`${peopleScene.summary} ${followupScene.summary} ${consequenceScene.summary}`, /inngang|hjørn|gate|byliv/i);

const plan = readJson(PLAN_PATH);
assert.equal(plan.id, 'by_arkitekt_v1');
assert.equal(plan.sequence.length, 8);
assert.ok(plan.sequence.every(step => step.type === 'job'));
for (const family of ['volum_skala_og_sted','forsteetasje_program_og_byliv','materialitet_og_varighet','signatur_og_stedstilpasning']) {
  assert.ok(plan.sequence.some(step => step.allowed_families.includes(family)), `missing plan family ${family}`);
}

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
assert.ok(grammar.authority_boundary?.may_not?.some(line => /signere|godkjenne/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /sikkerhet|tilgjengelighet/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /plan|byggesak/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /interessekonflikter|forbehold/.test(line)));

const model = readJson(MODEL_PATH);
assert.equal(model.category, 'by');
assert.equal(model.role_id, 'by_arkitekt');
assert.equal(model.role_scope, 'arkitekt');
assert.equal(model.source?.tier_threshold, 270);
assert.ok((model.related_people || []).some(row => row.id === 'atelierleder_nora'));
assert.ok((model.related_people || []).some(row => row.id === 'bylivsansvarlig_sara'));
assert.ok((model.related_people || []).some(row => row.id === 'prosjekterende_mikkel'));
assert.ok(model.authority_boundary?.may_not?.some(line => /godkjenne myndighetsforhold/.test(line)));
assert.ok(model.authority_boundary?.may_not?.some(line => /sikkerhet eller tilgjengelighet/.test(line)));
assert.ok(model.authority_boundary?.may_not?.some(line => /plan- eller byggesaksutfall/.test(line)));
assert.ok(exists(COMPAT_MODEL_PATH), 'compatibility/shared by_arkitekt model must remain present');

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'by' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_BY_ARKITEKT_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_BY_ARKITEKT_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);
assert.ok((career.artifacts?.role_models || []).includes(MODEL_PATH));

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 27);
assert.ok(readiness.summary?.rollout_queue_roles <= 58);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: by/by_arkitekt');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ By Arkitekt Role World rollout closes rhythm + situated-reputation debt fail-closed');
