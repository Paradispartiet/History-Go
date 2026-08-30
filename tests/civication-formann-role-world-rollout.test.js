const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const KEY = 'naeringsliv/formann';
const ROLE = 'formann';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/formann.json';

assert.ok(exists(WORLD_PATH), 'Formann Role World must be materialized');
const world = read(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'naeringsliv');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');

const plan = read('data/Civication/mailPlans/naeringsliv/formann_plan.json');
assert.equal(plan.id, 'formann_naeringsliv_v1');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 31, 'existing Formann plan must remain exactly 31 steps');
for (let i = 0; i < 20; i += 1) {
  assert.equal(plan.sequence[i].step, i + 1);
  assert.equal(plan.sequence[i].type, i % 2 === 0 ? 'job' : 'people');
  assert.deepEqual(plan.sequence[i].fallback_types, []);
}
assert.equal(plan.sequence[20].step, 21);
assert.equal(plan.sequence[20].type, 'job');
assert.equal(plan.sequence[30].step, 31);
assert.equal(plan.sequence[30].type, 'story');

const model = read('data/Civication/roleModels/naeringsliv/formann_arbeidsleder.json');
assert.equal(model.role_scope, 'formann_arbeidsleder');
assert.deepEqual(model.related_people.map((p) => p.id), [
  'arvid_erfaren_fagarbeider_formann',
  'noor_nyansatt_fagarbeider_formann',
  'selma_hms_kvalitetskontakt_formann',
  'maja_neste_skiftleder_formann'
]);
for (const person of model.related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
}
assert.deepEqual(model.work_life.workplaces, [
  'produksjons_og_arbeidsomrade',
  'arbeidslederpunkt',
  'hms_og_avvikspunkt',
  'skift_og_overleveringsrom'
]);

const grammar = read('data/Civication/workGrammars/naeringsliv/naeringsliv_operativ_ledelse.json');
assert.deepEqual(grammar.work_loops, [
  'mål -> kapasitet -> bemanning -> gjennomføring -> kontroll -> oppfølging',
  'hendelse -> sikre -> fakta -> ansvar -> tiltak -> læring'
]);
assert.deepEqual(grammar.authority_boundary.may, [
  'prioritere drift innen fullmakt',
  'fordele arbeid',
  'eskalere kapasitets- og sikkerhetskonflikter'
]);
assert.deepEqual(grammar.authority_boundary.may_not, [
  'omgå arbeids- eller sikkerhetsrutiner',
  'skjule hendelser',
  'bruke utilbørlig press',
  'ta beslutninger uten fullmakt'
]);

const expectedSourceRefs = [
  'data/Civication/mailFamilies/naeringsliv/job/formann_job.json#job_formann_week1_first_shift_board',
  'data/Civication/mailFamilies/naeringsliv/people/formann_people.json#formann_people_arvid_fordeling_001',
  'data/Civication/mailFamilies/naeringsliv/people/formann_people.json#formann_people_noor_mandat_001',
  'data/Civication/mailFamilies/naeringsliv/people/formann_people.json#formann_people_selma_avvik_001',
  'data/Civication/mailFamilies/naeringsliv/people/formann_people.json#formann_people_maja_overlevering_001',
  'data/Civication/mailFamilies/naeringsliv/conflict/formann_conflict.json#formann_conflict_tempo_early_001',
  'data/Civication/mailFamilies/naeringsliv/conflict/formann_conflict.json#formann_conflict_lojalitet_early_001',
  'data/Civication/mailFamilies/naeringsliv/story/formann_story.json#formann_story_ansvar_001',
  'data/Civication/mailFamilies/naeringsliv/people/formann_people.json#personal_formann_week2_sleep_after_near_miss'
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
  const catalog = read(rel);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  assert.ok(mails.some((mail) => mail.id === id), `missing canonical source ${ref}`);
}

assert.equal(world.situated_reputation_model.global_score_allowed, false);
const expectedAudiences = [
  'operations_management',
  'work_crew',
  'quality_hms',
  'new_workers_learning',
  'peer_shift_leadership',
  'planning_delivery_pressure',
  'private_relations'
];
assert.deepEqual(world.situated_reputation_model.audiences.map((a) => a.id), expectedAudiences);
for (const audience of world.situated_reputation_model.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.match(audience.cannot_grant, /(ikke|kan ikke|cannot)/i);
}
assert.match(world.situated_reputation_model.authority_separation, /fullmakt|myndighet/i);
assert.match(world.situated_reputation_model.authority_separation, /sikkerhet|HMS/i);

assert.equal(world.cross_role_link.status, 'candidate_when_shared_work_is_real');
assert.equal(world.cross_role_link.materialized, false);
assert.equal(world.cross_role_link.new_runtime, false);
assert.equal('shared_work_object' in world.cross_role_link, false);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning', 'lunch', 'afternoon', 'evening']);
assert.equal(world.season.coverage.length, 56);
const beatKeys = new Set(world.season.coverage.map((beat) => `${beat.day}/${beat.phase}`));
assert.equal(beatKeys.size, 56);
const summaries = new Set(world.season.coverage.map((beat) => beat.summary));
assert.equal(summaries.size, 56, 'every Formann beat summary must be individually distinct');
for (let day = 1; day <= 14; day += 1) {
  for (const phase of world.season.day_phases) assert.ok(beatKeys.has(`${day}/${phase}`));
}
for (const beat of world.season.coverage) {
  assert.ok(String(beat.summary || '').includes('Standing'));
  assert.ok(String(beat.summary || '').length >= 220, `${beat.day}/${beat.phase}: beat is too shallow`);
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length === 1);
  assert.ok(expectedSourceRefs.includes(beat.materialization_refs[0]));
}
assert.ok(world.primary_threads.length >= 5);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const beatRef of thread.beat_refs) assert.ok(beatKeys.has(beatRef));
}
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 6);

assert.deepEqual(world.existing_work_continuity.work_loops, grammar.work_loops);
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.match(world.existing_work_continuity.rule, /31-stegs|31 steg/i);

const index = read('data/Civication/roleWorlds/index.json');
const indexEntry = index.roles.find((entry) => entry.category === 'naeringsliv' && entry.role_scope === ROLE);
assert.deepEqual(indexEntry, { category: 'naeringsliv', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH });
assert.match(index.status, /_role_worlds_materialized$/);

const checklist = read('data/Civication/roleWorldAuthoringChecklist.json');
assert.ok(checklist.reference_worlds.includes(WORLD_PATH));
const themeBank = read('data/Civication/roleWorldThemeBank.json');
assert.deepEqual(themeBank.reference_profiles[KEY], world.theme_ids);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(!(readiness.rollout_queue || []).some((row) => row.key === KEY), 'completed Role World must leave rollout queue');
assert.ok(!(readiness.first_wave_candidates || []).some((row) => row.key === KEY));
assert.ok(readiness.summary.role_world_complete_or_pilot >= 38);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);

const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((row) => row.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);

console.log('Civication Formann Role World rollout: OK');
