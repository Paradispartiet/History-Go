'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const parseBeat = ref => { const [day, phase] = ref.split('/'); return { day: Number(day), phase }; };
const beatOrder = ref => { const { day, phase } = parseBeat(ref); return day * 10 + ({ morning:1, lunch:2, afternoon:3, evening:4 }[phase] || 0); };

const KEY = 'psykologi/psykologi_miljoarbeid';
const ROLE = 'psykologi_miljoarbeid';
const WORLD_PATH = 'data/Civication/roleWorlds/psykologi/psykologi_miljoarbeid.json';
const PLAN_PATH = 'data/Civication/mailPlans/psykologi/psykologi_miljoarbeid_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/psykologi/psykologi_miljoarbeid.json';
const MODEL_PATH = 'data/Civication/roleModels/psykologi/psykologi_miljoarbeid.json';
const SOURCES = {
  job:['data/Civication/mailFamilies/psykologi/job/psykologi_miljoarbeid_job.json','psykologi_miljoarbeid_vaktstart','psykologi_miljoarbeid_job_vaktstart'],
  people:['data/Civication/mailFamilies/psykologi/people/psykologi_miljoarbeid_people.json','psykologi_miljoarbeid_autonomi','psykologi_miljoarbeid_people_autonomi'],
  conflict:['data/Civication/mailFamilies/psykologi/conflict/psykologi_miljoarbeid_conflict.json','psykologi_miljoarbeid_fortrolighet','psykologi_miljoarbeid_conflict_fortrolighet'],
  event:['data/Civication/mailFamilies/psykologi/event/psykologi_miljoarbeid_event.json','psykologi_miljoarbeid_eskalering','psykologi_miljoarbeid_event_eskalering'],
  knowledge:['data/Civication/mailFamilies/psykologi/knowledge/psykologi_miljoarbeid_knowledge.json','psykologi_miljoarbeid_dokumentasjon','psykologi_miljoarbeid_knowledge_dokumentasjon'],
  followup:['data/Civication/mailFamilies/psykologi/followup/psykologi_miljoarbeid_followup.json','psykologi_miljoarbeid_faglig_oppfolging','psykologi_miljoarbeid_followup_fagkontakt'],
  consequence:['data/Civication/mailFamilies/psykologi/consequence/psykologi_miljoarbeid_consequence.json','psykologi_miljoarbeid_forsinket_konsekvens','psykologi_miljoarbeid_consequence_neste_vakt']
};

assert.ok(exists(WORLD_PATH), 'Miljoarbeid Role World must exist before strict rollout proof runs');
const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'psykologi');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const coverageKeys = new Set(world.season.coverage.map(beat => `${beat.day}/${beat.phase}`));
assert.equal(coverageKeys.size, 56);
for (let day = 1; day <= 14; day += 1) for (const phase of world.season.day_phases) assert.ok(coverageKeys.has(`${day}/${phase}`));
for (const beat of world.season.coverage) {
  assert.ok(String(beat.summary || '').length >= 120, `${beat.day}/${beat.phase}: substantive coverage required`);
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
}
assert.ok(world.recurring_people_archetypes.length >= 6);
assert.ok(world.slow_axes.length >= 8);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);
assert.deepEqual(world.materialization.authored_dimensions, ['persistent_work_object','situated_reputation']);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);

const object = world.persistent_work_object_model;
assert.equal(object.id, 'elias_observation_handoff_record');
assert.equal(object.runtime_binding, 'editorial_only_existing_pipeline');
assert.equal(object.new_runtime_state, false);
assert.equal(object.canonical_plan_id, 'psykologi_miljoarbeid_pilot_v1');
const fields = new Set(object.fields || []);
for (const field of ['observable_facts','person_voice','support_action','uncertainty','escalation_owner','next_shift_watch','repair_trace']) assert.ok(fields.has(field), `missing persistent work object field ${field}`);
assert.ok((object.lifecycle || []).length >= 7);
for (const stage of ['precise_handover','autonomy_support','boundary_disclosure','deescalation_and_escalation','neutral_documentation','professional_followup','next_shift_repair']) assert.ok((object.lifecycle || []).some(row => row.id === stage), `missing lifecycle stage ${stage}`);
assert.ok((object.ownership || []).length >= 4);
assert.ok(object.ownership.some(row => row.actor === 'miljoarbeider' && /observ|støtt|deeskal|dokument/i.test(row.owns)));
assert.ok(object.ownership.some(row => row.actor === 'service_user' && /valg|mål|opplev/i.test(row.owns)));
assert.ok(object.ownership.some(row => row.actor === 'psychologist_contact' && /klinisk|vurder/i.test(row.owns)));
assert.match(object.rule, /observasjon|observable/i);
assert.match(object.rule, /tolkning|diagnos/i);
assert.match(object.rule, /overlever|handoff/i);
assert.match(object.rule, /klinisk|myndighet/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
assert.ok(rep.audiences.length >= 6);
const requiredAudiences = ['service_user','experienced_colleague','team_lead','psychologist_contact','next_shift','relatives'];
const audienceIds = new Set(rep.audiences.map(row => row.id));
for (const id of requiredAudiences) assert.ok(audienceIds.has(id), `missing audience ${id}`);
const standingAxes = rep.audiences.map(row => row.standing_axis);
assert.equal(new Set(standingAxes).size, standingAxes.length);
for (const audience of rep.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.ok(String(audience.cannot_grant || '').length >= 30);
}
assert.ok(rep.divergence_examples.length >= 3);
assert.match(rep.rule, /audience|spesifikk|diverg/i);
assert.match(rep.authority_separation, /diagnos|psykoterapi|behandling|klinisk|myndighet|hemmelig/i);

const cross = world.cross_role_link;
assert.equal(cross.status, 'candidate_when_shared_work_is_real');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /shared work|delt arbeid|genuin/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 7, 'must reuse exactly seven existing canonical Miljoarbeid mail scenes');
for (const [type, [rel, familyId, mailId]] of Object.entries(SOURCES)) {
  const ref = `${rel}#${mailId}`;
  assert.ok(refs.includes(ref), `missing exact ${type} provenance ${ref}`);
  assert.ok(exists(rel), `missing source file ${rel}`);
  const doc = readJson(rel);
  assert.equal(doc.category, 'psykologi');
  assert.equal(doc.role_scope, ROLE);
  assert.equal(doc.mail_type, type);
  const family = (doc.families || []).find(row => row.id === familyId);
  assert.ok(family, `missing canonical family ${familyId}`);
  assert.ok((family.mails || []).some(row => row.id === mailId), `missing canonical scene ${mailId}`);
}
for (const ref of refs) {
  const [rel, id] = ref.split('#');
  assert.ok(rel && id && exists(rel));
  assert.ok(flattenMails(readJson(rel)).some(row => row.id === id), `missing provenance target ${ref}`);
}
for (const beat of world.season.coverage) for (const ref of beat.materialization_refs) assert.ok(refs.includes(ref), `${beat.day}/${beat.phase}: unknown source ref`);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, `${thread.id}: thread length`);
  for (const ref of thread.beat_refs) assert.ok(coverageKeys.has(ref), `${thread.id}: missing beat ${ref}`);
}
for (const delayed of world.delayed_consequences) {
  assert.ok(coverageKeys.has(delayed.setup_ref));
  assert.ok(coverageKeys.has(delayed.return_ref));
  assert.ok(beatOrder(delayed.return_ref) > beatOrder(delayed.setup_ref), `${delayed.id}: delayed consequence must return later`);
}

const plan = readJson(PLAN_PATH);
assert.equal(plan.id, 'psykologi_miljoarbeid_pilot_v1');
assert.equal(plan.sequence.length, 4, 'existing four-step human-work pilot must remain intact');
assert.deepEqual(plan.sequence.map(step => step.type), ['job','people','conflict','event']);
assert.deepEqual(plan.sequence.map(step => step.allowed_families[0]), [
  'psykologi_miljoarbeid_vaktstart',
  'psykologi_miljoarbeid_autonomi',
  'psykologi_miljoarbeid_fortrolighet',
  'psykologi_miljoarbeid_eskalering'
]);

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
assert.ok(grammar.authority_boundary?.may_not?.some(line => /stille diagnose/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /psykoterapi/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /endre medisinsk eller psykologisk behandling/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /kliniske vurderinger/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /love hemmelighold/.test(line)));
assert.ok(grammar.authority_boundary?.escalate_when?.some(line => /klinisk vurdering/.test(line)));

const model = readJson(MODEL_PATH);
assert.equal(model.source?.tier_threshold, 25);
assert.match((model.education_basis || []).join(' '), /ikke.*autorisert|ikke finnes.*offisiell utdanning/i);
assert.ok(model.scope_boundaries?.must_not_simulate_as_authority?.some(line => /diagnostisere/.test(line)));
assert.ok(model.scope_boundaries?.must_not_simulate_as_authority?.some(line => /psykoterapi/.test(line)));
assert.ok(model.scope_boundaries?.must_not_simulate_as_authority?.some(line => /endre behandling/.test(line)));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'psykologi' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_PSYKOLOGI_MILJOARBEID_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_PSYKOLOGI_MILJOARBEID_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 25);
assert.ok(readiness.summary?.rollout_queue_roles <= 60);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: psykologi/psykologi_miljoarbeid');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Psykologi Miljoarbeid Role World rollout proves persistent handoff work and situated standing without clinical role drift');
