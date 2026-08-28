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

const KEY = 'sport/sport_sportsledelse';
const ROLE = 'sport_sportsledelse';
const WORLD_PATH = 'data/Civication/roleWorlds/sport/sport_sportsledelse.json';
const PLAN_PATH = 'data/Civication/mailPlans/sport/sport_sportsledelse_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/sport/sport_sportsledelse.json';
const MODEL_PATH = 'data/Civication/roleModels/sport/sportssjef.json';
const TYPES = ['job','people','conflict','event','micro','story','knowledge','followup','consequence'];
const expected = {
  job:'sport_sports_job_log_001',
  people:'sport_sports_people_karin_001',
  conflict:'sport_sports_conflict_trener_001',
  event:'sport_sports_event_vindu_001',
  micro:'sport_sports_micro_fullmakt_001',
  story:'sport_sports_story_halvaar_001',
  knowledge:'sport_sports_knowledge_alternativkostnad_001',
  followup:'sport_sports_followup_profil_001',
  consequence:'sport_sports_consequence_profil_001'
};
const catalogPath = type => `data/Civication/mailFamilies/sport/${type}/sport_sportsledelse_${type}.json`;

assert.ok(exists(WORLD_PATH), 'Sportsledelse Role World must exist before strict rollout proof runs');
const world = readJson(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'sport');
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
assert.deepEqual(world.materialization.authored_dimensions, ['persistent_work_object','rhythm_waiting_handoff_rework','situated_reputation']);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);

const persistent = world.persistent_work_object_model;
assert.equal(persistent.id, 'sportslig_beslutningsspor');
assert.equal(persistent.runtime_binding, 'editorial_only_existing_pipeline');
assert.equal(persistent.new_runtime_state, false);
for (const field of ['club_strategy','coach_evaluation','squad_and_recruitment','budget_and_wage_room','academy_pathway','authority_owner','pending_evidence','next_decision']) {
  assert.ok(persistent.fields.includes(field), `missing persistent field ${field}`);
}
assert.ok((persistent.lifecycle || []).length >= 6);
assert.ok((persistent.ownership || []).some(row => row.actor === 'sportssjef'));
assert.ok((persistent.ownership || []).some(row => row.actor === 'board'));
assert.ok((persistent.ownership || []).some(row => row.actor === 'managing_director'));
assert.match(persistent.rule, /fullmakt|mandat|beslutning|kontrakt/i);

const rhythm = world.work_rhythm_model;
assert.equal(rhythm.runtime_binding, 'editorial_only_existing_pipeline');
assert.equal(rhythm.continuity_thread_key, 'sport_sportsledelse.case.profilrekruttering_og_klubbmodell');
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
assert.match(rhythm.rule, /fullmakt|mandat|budsjett|kontrakt/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
const requiredAudiences = ['board','managing_director','coach_and_staff','scouting_and_recruitment','academy','players','supporters'];
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
assert.match(rep.authority_separation, /fullmakt|budsjett|kontrakt|medisinsk|arbeidsgiver/i);
for (const axis of world.slow_axes) {
  if (String(axis.id).includes('standing')) assert.equal(axis.runtime_binding, 'editorial_only_until_governed');
}

const cross = world.cross_role_link;
assert.equal(cross.status, 'candidate_when_shared_work_is_real');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /shared work|delt arbeid|genuin/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'must reuse exactly nine canonical Sportsledelse mail scenes');
for (const type of TYPES) {
  const ref = `${catalogPath(type)}#${expected[type]}`;
  assert.ok(refs.includes(ref), `missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'sport');
  assert.equal(doc.role_scope, ROLE);
  assert.equal(doc.mail_type, type);
  assert.ok(flattenMails(doc).some(row => row.id === expected[type]), `missing canonical scene ${expected[type]}`);
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

const followup = flattenMails(readJson(catalogPath('followup')))[0];
const consequence = flattenMails(readJson(catalogPath('consequence')))[0];
assert.equal(followup.thread_key, 'sport_sportsledelse.case.profilrekruttering_og_klubbmodell');
assert.equal(consequence.thread_key, followup.thread_key);

const plan = readJson(PLAN_PATH);
assert.equal(plan.id, 'sport_sportsledelse_v1');
assert.equal(plan.sequence.length, 8);
assert.ok(plan.sequence.every(step => step.type === 'job'));
assert.equal(plan.sequence[0].allowed_families[0], 'klubbstrategi_og_sportslig_retning');
assert.ok(plan.sequence.some(step => step.allowed_families.includes('trener_stab_og_evaluering')));
assert.ok(plan.sequence.some(step => step.allowed_families.includes('spillerlogistikk_rekruttering_og_okonomi')));
assert.ok(plan.sequence.some(step => step.allowed_families.includes('akademi_prestasjonskultur_og_bro')));

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
assert.ok(grammar.authority_boundary?.cannot?.some(line => /kontrakt/.test(line)));
assert.ok(grammar.authority_boundary?.cannot?.some(line => /budsjett|mandat/.test(line)));
assert.ok(grammar.authority_boundary?.cannot?.some(line => /andre fag- eller styringsrollers myndighet/.test(line)));
const model = readJson(MODEL_PATH);
assert.equal(model.source?.tier_threshold, 240);
assert.ok(model.authority_boundaries?.cannot?.some(line => /kontrakter/.test(line)));
assert.ok(model.authority_boundaries?.cannot?.some(line => /medisinsk fagansvar/.test(line)));
assert.ok(model.authority_boundaries?.cannot?.some(line => /budsjett|mandat/.test(line)));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'sport' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_SPORT_SPORTSLEDELSE_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_SPORT_SPORTSLEDELSE_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 26);
assert.ok(readiness.summary?.rollout_queue_roles <= 59);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: sport/sport_sportsledelse');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Sport Sportsledelse Role World rollout closes persistent work object + rhythm + situated-reputation debt fail-closed');
