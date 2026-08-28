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

const KEY = 'psykologi/fagansvarlig';
const ROLE = 'fagansvarlig';
const WORLD_PATH = 'data/Civication/roleWorlds/psykologi/fagansvarlig.json';
const PLAN_PATH = 'data/Civication/mailPlans/psykologi/fagansvarlig_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/psykologi/fagansvarlig.json';
const TYPES = ['job','people','conflict','knowledge','event','micro','followup','story','consequence'];
const PLAN_TYPES = ['job','people','conflict','knowledge','event','micro','followup','story'];
const catalogPath = type => `data/Civication/mailFamilies/psykologi/${type}/fagansvarlig_${type}.json`;
const expected = {
  job:['gjentatt_avvik_og_arbeidsflyt','psykologi_fagansvarlig_job_avvik_001'],
  people:['prosedyre_og_klinisk_skjonn','psykologi_fagansvarlig_people_skjonn_001'],
  conflict:['veiledning_og_kontrollpress','psykologi_fagansvarlig_conflict_veiledning_001'],
  knowledge:['rolle_og_myndighetsgrense','psykologi_fagansvarlig_knowledge_myndighet_001'],
  event:['anbefaling_og_implementeringskapasitet','psykologi_fagansvarlig_event_implementering_001'],
  micro:['gronn_indikator_og_skjult_forsinkelse','psykologi_fagansvarlig_micro_indikator_001'],
  followup:['avvikstiltak_og_systemlaering','psykologi_fagansvarlig_followup_avvik_001'],
  story:['begrunnet_kvalitetsretning','psykologi_fagansvarlig_story_retning_001'],
  consequence:['avvikstiltak_og_systemlaering','psykologi_fagansvarlig_consequence_avvik_001']
};

assert.ok(exists(WORLD_PATH), 'Role World must be materialized before rollout proof runs');
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
  assert.ok(String(beat.summary || '').length >= 120, `${beat.day}/${beat.phase}: coverage summary must stay substantive`);
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
}
assert.ok(world.recurring_people_archetypes.length >= 6);
assert.ok(world.slow_axes.length >= 8);
assert.ok(world.primary_threads.length >= 5);
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);
assert.equal(world.materialization.no_new_runtime, true);
assert.deepEqual(world.materialization.authored_dimensions, ['rhythm_waiting_handoff_rework','situated_reputation']);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);

const rhythm = world.work_rhythm_model;
assert.equal(rhythm.runtime_binding, 'editorial_only_existing_pipeline');
assert.equal(rhythm.continuity_thread_key, 'psykologi_fagansvarlig_avvik_001');
assert.equal(rhythm.new_runtime_state, false);
for (const id of ['waiting','handoff','rework','interruption','delayed_consequence']) {
  const state = (rhythm.states || []).find(row => row.id === id);
  assert.ok(state, `Missing role-specific rhythm state ${id}`);
  assert.ok(String(state.meaning || '').length >= 40, `${id}: rhythm meaning must be explicit`);
  assert.ok(Array.isArray(state.guardrails) && state.guardrails.length >= 2, `${id}: rhythm guardrails required`);
}
assert.ok((rhythm.transitions || []).length >= 6);
assert.ok(rhythm.transitions.some(row => row.from === 'waiting' && row.to === 'handoff'));
assert.ok(rhythm.transitions.some(row => row.from === 'handoff' && row.to === 'rework'));
assert.ok(rhythm.transitions.some(row => row.to === 'delayed_consequence'));
assert.match(rhythm.rule, /vent|waiting|handoff|rework|overlever/i);
assert.match(rhythm.rule, /ikke|never|ingen/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
assert.ok(rep.audiences.length >= 6);
const audienceIds = new Set(rep.audiences.map(row => row.id));
for (const id of ['clinicians','organizational_leadership','quality_improvement_partners','supervision_environment','implementation_teams','private_relationships']) assert.ok(audienceIds.has(id), `Missing situated audience ${id}`);
const axes = rep.audiences.map(row => row.standing_axis);
assert.equal(new Set(axes).size, axes.length, 'each audience needs its own standing axis');
for (const audience of rep.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.ok(String(audience.cannot_grant || '').trim());
}
assert.ok(rep.divergence_examples.length >= 3);
assert.match(rep.authority_separation, /diagnos|behand|vedtak|myndighet|authority/i);
assert.match(rep.rule, /audience|spesifikk|diverg/i);
for (const axis of world.slow_axes) {
  if (String(axis.id).includes('standing') || String(axis.id).includes('mask')) assert.equal(axis.runtime_binding, 'editorial_only_until_governed');
}

const cross = world.cross_role_link;
assert.equal(cross.status, 'not_required_for_rollout');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /shared work|delt arbeid|genuin/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'rollout must reuse exactly the nine canonical Fagansvarlig mail scenes');
for (const type of TYPES) {
  const [familyId, mailId] = expected[type];
  const ref = `${catalogPath(type)}#${mailId}`;
  assert.ok(refs.includes(ref), `Missing exact ${type} provenance ${ref}`);
  const doc = readJson(catalogPath(type));
  assert.equal(doc.category, 'psykologi');
  assert.equal(doc.role_scope, ROLE);
  assert.equal(doc.mail_type, type);
  const family = (doc.families || []).find(row => row.id === familyId);
  assert.ok(family, `Missing canonical ${type} family ${familyId}`);
  assert.ok((family.mails || []).some(row => row.id === mailId), `Missing canonical ${type} scene ${mailId}`);
}
for (const ref of refs) {
  const [rel, id] = ref.split('#');
  assert.ok(rel && id && exists(rel));
  assert.ok(flattenMails(readJson(rel)).some(row => row.id === id), `Missing provenance target ${ref}`);
}
for (const beat of world.season.coverage) for (const ref of beat.materialization_refs) assert.ok(refs.includes(ref), `${beat.day}/${beat.phase}: unknown materialization ref`);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, `${thread.id}: thread length`);
  for (const ref of thread.beat_refs) assert.ok(coverageKeys.has(ref), `${thread.id}: missing beat ${ref}`);
}
for (const delayed of world.delayed_consequences) {
  assert.ok(coverageKeys.has(delayed.setup_ref));
  assert.ok(coverageKeys.has(delayed.return_ref));
  assert.ok(beatOrder(delayed.return_ref) > beatOrder(delayed.setup_ref), `${delayed.id}: consequence must return later`);
}

const followup = flattenMails(readJson(catalogPath('followup')))[0];
const consequence = flattenMails(readJson(catalogPath('consequence')))[0];
assert.equal(followup.thread_key, 'psykologi_fagansvarlig_avvik_001');
assert.equal(consequence.thread_key, followup.thread_key, 'existing system-learning continuity must remain intact');

const plan = readJson(PLAN_PATH);
assert.equal(plan.sequence.length, 8, 'existing Fagansvarlig mail plan must remain exactly eight steps');
assert.deepEqual(plan.sequence.map(step => step.type), PLAN_TYPES);
for (let i = 0; i < PLAN_TYPES.length; i += 1) assert.equal(plan.sequence[i].allowed_families[0], expected[PLAN_TYPES[i]][0]);

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
assert.ok(grammar.authority_boundary?.may_not?.some(line => /psykisk helsevernloven/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /diagnostisere eller behandle/.test(line)));
assert.ok(grammar.place_grammar.every(surface => surface.kind === 'fictionalized_work_surface'));
assert.ok(grammar.work_loops.length >= 4);

const model = readJson('data/Civication/roleModels/psykologi/fagansvarlig.json');
assert.ok(model.scope_boundary?.cannot?.some(line => /psykisk helsevernloven/.test(line)));
assert.ok(model.scope_boundary?.cannot?.some(line => /diagnostisere eller behandle/.test(line)));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'psykologi' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_PSYKOLOGI_FAGANSVARLIG_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_PSYKOLOGI_FAGANSVARLIG_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 21);
assert.ok(readiness.summary?.rollout_queue_roles <= 64);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: psykologi/fagansvarlig');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Psykologi Fagansvarlig Role World rollout closes rhythm + situated-reputation debt fail-closed');
