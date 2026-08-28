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

const KEY = 'psykologi/psykolog';
const ROLE = 'psykolog';
const WORLD_PATH = 'data/Civication/roleWorlds/psykologi/psykolog.json';
const PLAN_PATH = 'data/Civication/mailPlans/psykologi/psykolog_plan.json';
const GRAMMAR_PATH = 'data/Civication/workGrammars/psykologi/psykolog.json';
const MODEL_PATH = 'data/Civication/roleModels/psykologi/psykolog.json';
const TYPES = ['job','people','conflict','event','micro','story','knowledge','followup','consequence'];
const catalogPath = type => `data/Civication/mailFamilies/psykologi/${type}/psykolog_${type}.json`;
const expected = {
  job:['psykolog_formulering_under_usikkerhet','psykolog_job_formulering_001'],
  people:['psykolog_felles_prioritet','psykolog_people_prioritet_001'],
  conflict:['psykolog_nodvendig_informasjon','psykolog_conflict_informasjon_001'],
  event:['psykolog_endret_risikobilde','psykolog_event_risiko_001'],
  micro:['psykolog_kort_mellomrom','psykolog_micro_verifisering_001'],
  story:['psykolog_journalens_sikkerhet','psykolog_story_journal_001'],
  knowledge:['psykolog_profesjonshistorie','psykolog_knowledge_schjelderup_001'],
  followup:['psykolog_planoppfolging','psykolog_followup_plan_001'],
  consequence:['psykolog_formuleringskonsekvens','psykolog_consequence_formulering_001']
};

assert.ok(exists(WORLD_PATH), 'Psykolog Role World must exist before strict rollout proof runs');
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
assert.deepEqual(world.materialization.authored_dimensions, []);
assert.deepEqual(world.materialization.foundation_dimensions_bound, [
  'persistent_work_object',
  'institution_authority',
  'rhythm_waiting_handoff_rework',
  'history_go_affordance',
  'situated_reputation',
  'people_places_integrity',
  'provenance'
]);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);

const rhythm = world.work_rhythm_model;
assert.equal(rhythm.runtime_binding, 'editorial_only_existing_pipeline');
assert.equal(rhythm.continuity_thread_key, 'psykolog_plan_001');
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
assert.match(rhythm.rule, /autorisasjon|taushet|risiko|kompetanse|myndighet/i);

const rep = world.situated_reputation_model;
assert.equal(rep.global_score_allowed, false);
assert.ok(rep.audiences.length >= 6);
const requiredAudiences = ['patients','interdisciplinary_team','psychologist_supervision','section_leadership','future_clinicians','private_relationships'];
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
assert.match(rep.authority_separation, /autorisasjon|spesialist|taushet|klinisk|myndighet|evidens/i);

const cross = world.cross_role_link;
assert.equal(cross.status, 'not_required_for_rollout');
assert.equal(cross.materialized, false);
assert.equal(cross.new_runtime, false);
assert.match(cross.rule, /shared work|delt arbeid|genuin/i);

const refs = world.materialization.source_refs || [];
assert.equal(refs.length, 9, 'must reuse exactly nine canonical Psykolog mail scenes');
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

const people = flattenMails(readJson(catalogPath('people')))[0];
const followup = flattenMails(readJson(catalogPath('followup')))[0];
const consequence = flattenMails(readJson(catalogPath('consequence')))[0];
assert.equal(people.thread_key, 'psykolog_plan_001');
assert.equal(followup.thread_key, people.thread_key);
assert.equal(consequence.thread_key, people.thread_key);

const plan = readJson(PLAN_PATH);
assert.equal(plan.sequence.length, 9);
assert.deepEqual(plan.sequence.map(step => step.type), TYPES);
for (let i = 0; i < TYPES.length; i += 1) assert.equal(plan.sequence[i].allowed_families[0], expected[TYPES[i]][0]);

const grammar = readJson(GRAMMAR_PATH);
assert.equal(grammar.role_scope, ROLE);
assert.ok(grammar.authority_boundary?.may_not?.some(line => /autorisasjon eller lisens/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /spesialistgodkjenning/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /utenfor egen kompetanse/.test(line)));
assert.ok(grammar.authority_boundary?.may_not?.some(line => /taushetsbelagte opplysninger/.test(line)));
assert.deepEqual(grammar.place_grammar.map(row => row.place_id), ['psykologisk_institutt_uio']);
assert.ok(grammar.place_grammar.every(row => row.kind === 'canonical_history_go_place'));
const model = readJson(MODEL_PATH);
assert.equal(model.source?.tier_threshold, 115);
assert.ok(model.scope_boundary?.cannot?.some(line => /autorisasjon eller lisens/.test(line)));
assert.ok(model.scope_boundary?.cannot?.some(line => /spesialistgodkjenning/.test(line)));

const index = readJson('data/Civication/roleWorlds/index.json');
assert.ok((index.roles || []).some(row => row.category === 'psykologi' && row.role_scope === ROLE && row.status === 'role_world_complete' && row.path === WORLD_PATH));
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok((checklist.reference_worlds || []).includes(WORLD_PATH));
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles?.[KEY], world.theme_ids);
assert.ok(exists('reports/CIVICATION_PSYKOLOGI_PSYKOLOG_ROLE_WORLD_ROLLOUT.md'));
assert.ok(exists('reports/CIVICATION_PSYKOLOGI_PSYKOLOG_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'));

const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const career = (matrix.worlds || []).find(row => row.key === KEY);
assert.ok(career);
assert.equal(career.status, 'playable');
assert.equal(career.audit?.runtime_gate, true);
assert.deepEqual(career.audit?.missing_components, []);

const readiness = readJson('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(readiness.summary?.role_world_complete_or_pilot >= 24);
assert.ok(readiness.summary?.rollout_queue_roles <= 61);
assert.ok(!(readiness.rollout_queue || []).some(row => row.key === KEY));
assert.notEqual(readiness.gate?.next_required_pr, 'Role World rollout: psykologi/psykolog');
assert.equal(readiness.gate?.gate_pass, true);
assert.equal(readiness.gate?.broad_rollout_allowed_now, true);
const readinessRole = (readiness.roles || []).find(row => row.key === KEY);
assert.ok(readinessRole?.already_reference_or_pilot);

console.log('✓ Psykologi Psykolog Role World rollout binds the already-ready clinical world fail-closed');
