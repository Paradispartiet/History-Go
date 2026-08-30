const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));
const KEY = 'naeringsliv/lager_og_driftsmedarbeider';
const ROLE = 'lager_og_driftsmedarbeider';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/lager_og_driftsmedarbeider.json';

assert.ok(exists(WORLD_PATH), 'Lager og driftsmedarbeider Role World must be materialized');
const world = read(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'naeringsliv');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');

const plan = read('data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json');
assert.equal(plan.id, 'naeringsliv_lager_og_driftsmedarbeider_plan');
assert.equal(plan.role_scope, ROLE);
assert.equal(plan.sequence.length, 20, 'existing practice plan must remain exactly 20 steps');
for (let i = 0; i < 20; i += 1) {
  assert.equal(plan.sequence[i].step, i + 1);
  assert.equal(plan.sequence[i].type, i % 2 === 0 ? 'job' : 'people');
  assert.deepEqual(plan.sequence[i].fallback_types, []);
}

const model = read('data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json');
assert.equal(model.role_scope, ROLE);
assert.deepEqual(model.related_people.map((person) => person.id), [
  'ragnhild_driftsleder_lager',
  'pavel_erfaren_lagermedarbeider',
  'marius_okonomikontakt_lager',
  'helle_hms_og_skiftkontakt_lager'
]);
for (const person of model.related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
}
assert.deepEqual(model.work_life.workplaces, [
  'varemottak_og_kollikontroll',
  'plukk_pakk_og_systemflate',
  'telling_og_avvikspunkt',
  'hms_og_overleveringsflate'
]);

const grammar = read('data/Civication/workGrammars/naeringsliv/naeringsliv_logistikk_og_drift.json');
assert.deepEqual(grammar.work_loops, [
  'mottak -> kontroll -> registrering -> lokasjon -> plukk -> utlevering',
  'avvik -> isolering -> telling/fakta -> korrigering -> godkjenning -> læring'
]);
assert.deepEqual(grammar.authority_boundary.may, [
  'håndtere varer innen rutine',
  'registrere avvik',
  'isolere usikkert gods'
]);
assert.deepEqual(grammar.authority_boundary.may_not, [
  'forfalske lagerstatus',
  'sende skadet gods uten avklaring',
  'omgå sikkerhetsrutiner',
  'skjule lageravvik'
]);

const expectedSourceRefs = [
  'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week1_receiving_almost_matched',
  'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week1_pick_list_pressure',
  'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week1_wrong_location',
  'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week1_pallet_in_the_way',
  'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week2_late_missing_colli',
  'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week2_store_waits_wrong_item',
  'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week2_count_mismatch',
  'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json#job_lager_og_driftsmedarbeider_week2_near_miss_everyone_passed',
  'data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json#lager_people_ragnhild_mottak_001',
  'data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json#lager_people_pavel_sporbarhet_001',
  'data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json#lager_people_marius_avstemming_001',
  'data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json#lager_people_helle_hms_handoff_001'
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
  'warehouse_team',
  'inventory_finance_control',
  'quality_hms',
  'downstream_store_operations',
  'transport_supplier_interface',
  'private_relations'
];
assert.deepEqual(world.situated_reputation_model.audiences.map((audience) => audience.id), expectedAudiences);
for (const audience of world.situated_reputation_model.audiences) {
  assert.ok(String(audience.standing_axis || '').trim());
  assert.ok(Array.isArray(audience.cares_about) && audience.cares_about.length >= 2);
  assert.match(audience.cannot_grant, /(ikke|kan ikke|cannot)/i);
}
assert.match(world.situated_reputation_model.authority_separation, /myndighet/i);
assert.match(world.situated_reputation_model.authority_separation, /sikkerhet|HMS/i);

assert.equal(world.cross_role_link.status, 'not_required_for_rollout');
assert.equal(world.cross_role_link.materialized, false);
assert.equal(world.cross_role_link.new_runtime, false);
assert.deepEqual(world.cross_role_link.companion_keys, []);
assert.equal('shared_work_object' in world.cross_role_link, false);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning', 'lunch', 'afternoon', 'evening']);
assert.equal(world.season.coverage.length, 56);
const beatKeys = new Set(world.season.coverage.map((beat) => `${beat.day}/${beat.phase}`));
assert.equal(beatKeys.size, 56);
const summaries = new Set(world.season.coverage.map((beat) => beat.summary));
const standingConsequences = new Set(world.season.coverage.map((beat) => beat.standing_consequence));
assert.equal(summaries.size, 56, 'every summary must be independently authored');
assert.equal(standingConsequences.size, 56, 'every standing consequence must be independently authored');
const sourceUses = new Map(expectedSourceRefs.map((ref) => [ref, 0]));
for (let day = 1; day <= 14; day += 1) {
  for (const phase of world.season.day_phases) assert.ok(beatKeys.has(`${day}/${phase}`));
}
for (const beat of world.season.coverage) {
  assert.ok(String(beat.summary || '').length >= 140, `${beat.day}/${beat.phase}: summary is too shallow`);
  assert.ok(String(beat.standing_consequence || '').length >= 120, `${beat.day}/${beat.phase}: standing consequence is too shallow`);
  assert.ok(expectedAudiences.includes(beat.standing_audience));
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length === 1);
  assert.ok(expectedSourceRefs.includes(beat.materialization_refs[0]));
  sourceUses.set(beat.materialization_refs[0], sourceUses.get(beat.materialization_refs[0]) + 1);
}
for (const [ref, uses] of sourceUses) assert.ok(uses >= 2, `${ref} must ground at least two beats`);
assert.ok(world.primary_threads.length >= 6);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  for (const beatRef of thread.beat_refs) assert.ok(beatKeys.has(beatRef));
}
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 7);

assert.deepEqual(world.existing_work_continuity.work_loops, grammar.work_loops);
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.match(world.existing_work_continuity.rule, /20-stegs|20 steg/i);

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
assert.ok(readiness.summary.role_world_complete_or_pilot >= 39);
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);

const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((row) => row.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);

const sourceFirst = fs.readFileSync(
  path.join(ROOT, 'reports/CIVICATION_NAERINGSLIV_LAGER_OG_DRIFTSMEDARBEIDER_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'),
  'utf8'
);
assert.match(sourceFirst, /editorial uniqueness/i);
assert.match(sourceFirst, /shared boilerplate/i);
assert.match(sourceFirst, /not_required_for_rollout/);
assert.match(sourceFirst, /global score/i);

console.log('Civication Lager og driftsmedarbeider Role World rollout: OK');
