const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const KEY = 'naeringsliv/mellomleder';
const ROLE = 'mellomleder';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/mellomleder.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/mellomleder_plan.json';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/kapitalforvalter.json';
const JOB_PATH = 'data/Civication/mailFamilies/naeringsliv/job/mellomleder_job.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/mellomleder_people.json';
const CONFLICT_PATH = 'data/Civication/mailFamilies/naeringsliv/conflict/mellomleder_conflict.json';
const STORY_PATH = 'data/Civication/mailFamilies/naeringsliv/story/mellomleder_story.json';
const CAPITAL_GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_finans_og_kapitalforvaltning.json';
const LEADERSHIP_GRAMMAR_PATH = 'data/Civication/workGrammars/naeringsliv/naeringsliv_virksomhetsledelse.json';

assert.ok(fs.existsSync(path.join(ROOT, WORLD_PATH)), 'Mellomleder Role World must exist');
const world = read(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'naeringsliv');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');

const plan = read(PLAN_PATH);
assert.equal(plan.id, 'mellomleder_naeringsliv_v2');
assert.equal(plan.sequence.length, 25);
for (let i = 0; i < 20; i += 1) {
  assert.equal(plan.sequence[i].step, i + 1);
  assert.equal(plan.sequence[i].type, i % 2 === 0 ? 'job' : 'people');
  assert.deepEqual(plan.sequence[i].fallback_types, []);
}
assert.deepEqual(plan.sequence.slice(20).map((step) => step.type), ['conflict', 'people', 'job', 'story', 'event']);

const model = read(MODEL_PATH);
assert.equal(model.role_scope, 'kapitalforvalter');
assert.deepEqual(model.related_people.map((person) => person.id), [
  'ingrid_omradesjef_mellomleder',
  'mads_sidestilt_leder_mellomleder',
  'rana_teamkoordinator_mellomleder',
  'thomas_medarbeider_oppfolging_mellomleder'
]);
for (const person of model.related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
}

const capital = read(CAPITAL_GRAMMAR_PATH);
const leadership = read(LEADERSHIP_GRAMMAR_PATH);
const expectedLoops = [
  ...capital.work_loops,
  ...leadership.work_loops
];
assert.deepEqual(world.existing_work_continuity.work_loops, expectedLoops);
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.match(world.existing_work_continuity.rule, /25-stegs|25 steg/i);

const expectedSourceRefs = [
  `${JOB_PATH}#job_mellomleder_week1_first_monday_report`,
  `${PEOPLE_PATH}#mellomleder_people_ingrid_rapport_001`,
  `${PEOPLE_PATH}#mellomleder_people_mads_styringspolitikk_001`,
  `${PEOPLE_PATH}#mellomleder_people_rana_kapasitet_001`,
  `${PEOPLE_PATH}#mellomleder_people_thomas_oppfolging_001`,
  `${CONFLICT_PATH}#ml_core_008`,
  `${CONFLICT_PATH}#ml_core_009`,
  `${STORY_PATH}#ml_core_007`,
  `${PEOPLE_PATH}#personal_mellomleder_week2_meeting_words_at_home`,
  `${PEOPLE_PATH}#ml_people_jahn_001`
];
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
assert.equal(world.materialization.no_new_runtime, true);
assert.equal(world.materialization.existing_plan_preserved, true);
assert.equal(world.materialization.existing_role_model_preserved, true);
assert.equal(world.materialization.existing_people_foundation_preserved, true);
assert.equal(world.materialization.existing_work_grammar_preserved, true);
assert.equal(world.materialization.existing_persistent_work_preserved, true);
assert.equal(world.materialization.existing_rhythm_preserved, true);
assert.equal(world.materialization.cross_role_link_materialized, false);
assert.deepEqual(world.materialization.source_refs, expectedSourceRefs);
for (const ref of expectedSourceRefs) {
  const [rel, id] = ref.split('#');
  const mails = (read(rel).families || []).flatMap((family) => family.mails || []);
  assert.ok(mails.some((mail) => mail.id === id), `missing source ${ref}`);
}

const expectedAudiences = [
  'executive_management',
  'peer_leadership',
  'work_team',
  'employee_followup',
  'governance_and_control',
  'owners_and_decision_forums',
  'private_relations'
];
assert.equal(world.situated_reputation_model.global_score_allowed, false);
assert.deepEqual(world.situated_reputation_model.audiences.map((audience) => audience.id), expectedAudiences);
for (const audience of world.situated_reputation_model.audiences) {
  assert.ok(String(audience.standing_axis || '').length >= 12);
  assert.ok(audience.cares_about.length >= 2);
  assert.match(audience.cannot_grant, /(ikke|kan ikke|cannot)/i);
}
assert.match(world.situated_reputation_model.authority_separation, /myndighet|mandat|fullmakt/i);
assert.match(world.situated_reputation_model.authority_separation, /personvern|personal|rapport/i);

assert.equal(world.history_go_affordance.source_ref, expectedSourceRefs[9]);
assert.ok(world.history_go_affordance.better_question.length >= 160);
assert.match(world.history_go_affordance.authority_boundary, /ikke|kan ikke/i);

assert.equal(world.cross_role_link.status, 'candidate_when_shared_work_is_real');
assert.equal(world.cross_role_link.materialized, false);
assert.equal(world.cross_role_link.new_runtime, false);
assert.equal('shared_work_object' in world.cross_role_link, false);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning', 'lunch', 'afternoon', 'evening']);
assert.equal(world.season.coverage.length, 56);
const beatKeys = new Set(world.season.coverage.map((beat) => `${beat.day}/${beat.phase}`));
const summaries = new Set(world.season.coverage.map((beat) => beat.summary));
const consequences = new Set(world.season.coverage.map((beat) => beat.standing_consequence));
assert.equal(beatKeys.size, 56);
assert.equal(summaries.size, 56, 'every summary must be independently authored');
assert.equal(consequences.size, 56, 'every standing consequence must be independently authored');
const sourceUses = new Map(expectedSourceRefs.map((ref) => [ref, 0]));
for (let day = 1; day <= 14; day += 1) {
  for (const phase of world.season.day_phases) assert.ok(beatKeys.has(`${day}/${phase}`));
}
for (const beat of world.season.coverage) {
  assert.ok(beat.summary.length >= 160, `${beat.day}/${beat.phase}: summary too shallow`);
  assert.ok(beat.standing_consequence.length >= 140, `${beat.day}/${beat.phase}: consequence too shallow`);
  assert.ok(expectedAudiences.includes(beat.standing_audience));
  assert.deepEqual(beat.materialization_refs.length, 1);
  assert.ok(expectedSourceRefs.includes(beat.materialization_refs[0]));
  sourceUses.set(beat.materialization_refs[0], sourceUses.get(beat.materialization_refs[0]) + 1);
}
for (const [ref, uses] of sourceUses) assert.ok(uses >= 2, `${ref} must ground at least two beats`);
assert.ok(world.primary_threads.length >= 6);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const ref of thread.beat_refs) assert.ok(beatKeys.has(ref));
}
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 7);

const index = read('data/Civication/roleWorlds/index.json');
assert.deepEqual(index.roles.find((entry) => entry.category === 'naeringsliv' && entry.role_scope === ROLE), {
  category: 'naeringsliv', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH
});
assert.match(index.status, /_role_worlds_materialized$/);
assert.ok(read('data/Civication/roleWorldAuthoringChecklist.json').reference_worlds.includes(WORLD_PATH));
assert.deepEqual(read('data/Civication/roleWorldThemeBank.json').reference_profiles[KEY], world.theme_ids);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(!(readiness.rollout_queue || []).some((row) => row.key === KEY));
assert.ok(!(readiness.first_wave_candidates || []).some((row) => row.key === KEY));
assert.ok(readiness.summary.role_world_complete_or_pilot >= 40);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);
const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((row) => row.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);

const sourceFirst = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_NAERINGSLIV_MELLOMLEDER_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'), 'utf8');
assert.match(sourceFirst, /editorial uniqueness/i);
assert.match(sourceFirst, /shared boilerplate/i);
assert.match(sourceFirst, /candidate_when_shared_work_is_real/);
assert.match(sourceFirst, /global reputation score/i);

console.log('Civication Mellomleder Role World rollout: OK');
