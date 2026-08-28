'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = rel => fs.existsSync(path.join(ROOT, rel));
const flattenMails = doc => (doc.families || []).flatMap(family => family.mails || []);
const parseBeat = ref => { const [day, phase] = ref.split('/'); return {day:Number(day), phase}; };
const beatOrder = ref => { const {day, phase} = parseBeat(ref); return day * 10 + ({morning:1,lunch:2,afternoon:3,evening:4}[phase] || 0); };

const KEY = 'psykologi/professor_psykologi';
const ROLE = 'professor_psykologi';
const WORLD_PATH = 'data/Civication/roleWorlds/psykologi/professor_psykologi.json';
const PLAN_PATH = 'data/Civication/mailPlans/psykologi/professor_psykologi_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/psykologi/professor_psykologi.json';
const MODEL_PATH = 'data/Civication/roleModels/psykologi/professor_psykologi.json';
const TYPES = ['job','people','conflict','knowledge','event','micro','followup','story','consequence'];
const PLAN_TYPES = ['job','people','conflict','knowledge','event','micro','followup','story'];
const catalogPath = type => `data/Civication/mailFamilies/psykologi/${type}/professor_psykologi_${type}.json`;
const expected = {
  job:['kreditering_for_soknad','psykologi_professor_psykologi_job_kreditering_001'],
  people:['veiledning_og_selvstendighet','psykologi_professor_psykologi_people_veiledning_001'],
  conflict:['kritikk_av_eget_program','psykologi_professor_psykologi_conflict_programkritikk_001'],
  knowledge:['akademisk_makt_og_kreditering','psykologi_professor_psykologi_knowledge_makt_001'],
  event:['soknadsfrist_og_utdanningskvalitet','psykologi_professor_psykologi_event_undervisning_001'],
  micro:['gjennomsnitt_og_skjult_laeringsgap','psykologi_professor_psykologi_micro_laeringsgap_001'],
  followup:['reanalyse_og_programendring','psykologi_professor_psykologi_followup_programkritikk_001'],
  story:['etterprovbar_fagmiljoprioritering','psykologi_professor_psykologi_story_prioritering_001'],
  consequence:['kritikkultur_som_senere_konsekvens','psykologi_professor_psykologi_consequence_programkritikk_001']
};

assert.ok(exists(WORLD_PATH), 'Professor Role World must exist before strict rollout proof runs');
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
assert.deepEqual(world.materialization.authored_dimensions, ['rhythm_waiting_handoff_rework','situated_reputation']);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);

const rhythm = world.work_rhythm_model;
assert.equal(rhythm.runtime_binding, 'editorial_only_existing_pipeline');
assert.equal(rhythm.continuity_thread_key, 'psykologi_professor_psykologi_programkritikk_001');
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
assert.match(rhythm.rule, /waiting|vent|handoff|rework|overlever/i);
assert.match(rhythm.rule, /senior|myndighet|eierskap|beslutning/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
assert.ok(rep.audiences.length >= 6);
const requiredAudiences = ['doctoral_candidates','junior_researchers','teaching_environment','department_leadership','academic_peers','private_relationships'];
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
assert.match(rep.authority_separation, /psykologautorisasjon|klinisk|eierskap|evidens|ressurs/i);
for (const axis of world.slow_axes) {
  if (String(axis.id).includes('standing') || String(axis.id).includes('mask')) assert.equal(axis.runtime_binding, 'editorial_only_until_governed');
}

const cross = world.cross_role_link;
assert.equal(cross.status, 'not_required_for_rollout');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /shared work|delt arbeid|genuin/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'must reuse exactly nine canonical Professor mail scenes');
for (const type of TYPES) {
  const [familyId, mailId] = expected[type];
  const ref = `${catalogPath(type)}#${mailId}`;
  assert.ok(refs.includes(ref), `missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
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

const conflict = flattenMails(readJson(catalogPath('conflict')))[0];
const followup = flattenMails(readJson(catalogPath('followup')))[0];
const consequence = flattenMails(readJson(catalogPath('consequence')))[0];
assert.equal(conflict.thread_key, 'psykologi_professor_psykologi_programkritikk_001');
assert.equal(followup.thread_key, conflict.thread_key);
assert.equal(consequence.thread_key, conflict.thread_key);

const plan = readJson(PLAN_PATH);
assert.equal(plan.sequence.length, 8);
assert.deepEqual(plan.sequence.map(step => step.type), PLAN_TYPES);
for (let i = 0; i < PLAN_TYPES.length; i += 1) assert.equal(plan.sequence[i].allowed_families[0], expected[PLAN_TYPES[i]][0]);

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
assert.ok(grammar.authority_boundary?.may_not?.some(line => /psykologautorisasjon/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /diagnostisere eller behandle/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /senioritet/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /studenters eller yngre forskeres ideer/.test(line)));
assert.ok(grammar.place_grammar.every(surface => surface.kind === 'fictionalized_work_surface'));
const model = readJson(MODEL_PATH);
assert.equal(model.source?.tier_threshold, 380);
assert.ok(model.scope_boundary?.cannot?.some(line => /psykologautorisasjon/.test(line)));
assert.ok(model.scope_boundary?.cannot?.some(line => /diagnostisere eller behandle/.test(line)));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'psykologi' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_PSYKOLOGI_PROFESSOR_PSYKOLOGI_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_PSYKOLOGI_PROFESSOR_PSYKOLOGI_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 23);
assert.ok(readiness.summary?.rollout_queue_roles <= 62);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: psykologi/professor_psykologi');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Psykologi Professor Role World rollout closes rhythm + situated-reputation debt fail-closed');
