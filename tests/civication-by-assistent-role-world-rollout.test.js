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

const KEY = 'by/by_assistent';
const ROLE = 'by_assistent';
const WORLD_PATH = 'data/Civication/roleWorlds/by/by_assistent.json';
const PLAN_PATH = 'data/Civication/mailPlans/by/by_assistent_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/by/by_assistent.json';
const MODEL_PATH = 'data/Civication/roleModels/by/studentassistent.json';
const TYPES = ['job','people','conflict','event','micro','story','knowledge','followup','consequence'];
const expected = {
  job:'by_assistent_job_kart_001',
  people:'by_assistent_people_ingrid_001',
  conflict:'by_assistent_conflict_kart_befaring_001',
  event:'by_assistent_event_kveldsbefaring_001',
  micro:'by_assistent_micro_kildespor_001',
  story:'by_assistent_story_stedsnotat_001',
  knowledge:'by_assistent_knowledge_kart_sted_001',
  followup:'by_assistent_followup_kartavvik_001',
  consequence:'by_assistent_consequence_grunnlag_001'
};
const catalogPath = type => `data/Civication/mailFamilies/by/${type}/by_assistent_${type}.json`;

assert.ok(exists(WORLD_PATH), 'By Assistent Role World must exist before strict rollout proof runs');
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
  assert.ok(String(beat.summary || '').length >= 115, `${beat.day}/${beat.phase}: substantive coverage required`);
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
}
assert.ok(world.recurring_people_archetypes.length >= 6);
assert.ok(world.slow_axes.length >= 8);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);

// This is intentionally a one-gap rollout. Existing persistent work and rhythm must be preserved, not relabelled as new authored debt.
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.existing_persistent_work_preserved, true);
assert.equal(world.materialization.existing_rhythm_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);
assert.doesNotMatch(JSON.stringify(world.materialization.authored_dimensions), /persistent_work_object|rhythm_waiting_handoff_rework/);

const existing = world.existing_work_continuity;
assert.equal(existing.runtime_binding, 'existing_mail_and_work_grammar');
assert.equal(existing.thread_key, 'by_assistent.case.kartavvik_og_stedsbruk');
assert.equal(existing.new_runtime_state, false);
assert.ok(existing.work_loops.includes('sak_eller_prosjekt'));
assert.ok(existing.work_loops.includes('kvalitetssikring'));
assert.match(existing.rule, /sporbar|handoff|overlever|revis|avvik/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
const requiredAudiences = ['responsible_city_planner','architect_project_team','participation_team','project_work_environment','affected_users_residents','student_private_relations'];
const audienceIds = new Set((rep.audiences || []).map(row => row.id));
for (const id of requiredAudiences) assert.ok(audienceIds.has(id), `missing audience ${id}`);
const standingAxes = rep.audiences.map(row => row.standing_axis);
assert.equal(new Set(standingAxes).size, standingAxes.length);
for (const audience of rep.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.ok(String(audience.cannot_grant || '').length >= 35);
}
assert.ok(rep.divergence_examples.length >= 3);
assert.match(rep.rule, /audience|spesifikk|diverg|standing/i);
assert.match(rep.authority_separation, /plan|byggesak|lovtolkning|utfall|faglig/i);
for (const axis of world.slow_axes) {
  if (String(axis.id).includes('standing') || String(axis.id).includes('status') || String(axis.id).includes('mask')) {
    assert.equal(axis.runtime_binding, 'editorial_only_until_governed');
  }
}

const cross = world.cross_role_link;
assert.equal(cross.status, 'candidate_when_shared_work_is_real');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /shared|delt|genuin/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'must reuse exactly nine canonical By Assistent mail scenes');
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

// Existing canonical continuity is real and must survive untouched.
const followup = flattenMails(readJson(catalogPath('followup'))).find(row => row.id === expected.followup);
const consequence = flattenMails(readJson(catalogPath('consequence'))).find(row => row.id === expected.consequence);
assert.equal(followup.thread_key, 'by_assistent.case.kartavvik_og_stedsbruk');
assert.equal(consequence.thread_key, followup.thread_key);
assert.equal(followup.person_id, 'ingrid_byplan');
assert.equal(consequence.person_id, 'jonas_arkitekt');
assert.match(`${followup.summary} ${consequence.summary}`, /kart|grunnlag|avvik|revis|design/i);

const plan = readJson(PLAN_PATH);
assert.equal(plan.id, 'by_assistent_v1');
assert.equal(plan.sequence.length, 8);
assert.ok(plan.sequence.every(step => step.type === 'job'));
for (const family of ['kart_og_grunnlag','befaring_og_observasjon','medvirkning_og_innspill','rom_og_bruk']) {
  assert.ok(plan.sequence.some(step => step.allowed_families.includes(family)), `missing plan family ${family}`);
}

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
const loopIds = new Set((grammar.work_loops || []).map(row => row.id));
assert.ok(loopIds.has('sak_eller_prosjekt'));
assert.ok(loopIds.has('kvalitetssikring'));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /plan_eller_byggesaksvedtak/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /lovtolkning/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /tempo/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /utbyggingsutfall/.test(line)));

const model = readJson(MODEL_PATH);
assert.equal(model.category, 'by');
assert.equal(model.role_id, 'by_studentassistent');
assert.equal(model.role_scope, 'studentassistent');
assert.equal(model.source?.tier_threshold, 5);
for (const id of ['ingrid_byplan','jonas_arkitekt','maria_medvirkning']) assert.ok((model.related_people || []).some(row => row.id === id));
assert.ok(model.authority_boundary?.may_not?.some(line => /plan- eller byggesaksvedtak/.test(line)));
assert.ok(model.authority_boundary?.may_not?.some(line => /bindende lovtolkning/.test(line)));
assert.ok(model.authority_boundary?.may_not?.some(line => /egne observasjoner/.test(line)));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'by' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_BY_ASSISTENT_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_BY_ASSISTENT_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);
assert.ok((career.artifacts?.role_models || []).includes(MODEL_PATH));

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 28);
assert.ok(readiness.summary?.rollout_queue_roles <= 57);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: by/by_assistent');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ By Assistent Role World rollout closes situated-reputation debt fail-closed');
