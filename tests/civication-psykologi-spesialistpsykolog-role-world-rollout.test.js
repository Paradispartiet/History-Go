const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
const KEY = 'psykologi/spesialistpsykolog';
const ROLE = 'spesialistpsykolog';
const WORLD = `data/Civication/roleWorlds/psykologi/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/psykologi/${ROLE}_plan.json`;
const MODEL = `data/Civication/roleModels/psykologi/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/psykologi/${ROLE}.json`;

const world = read(WORLD);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.status, 'role_world_complete');
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
for (const key of [
  'no_new_runtime',
  'existing_plan_preserved',
  'existing_role_model_preserved',
  'existing_people_foundation_preserved',
  'existing_work_grammar_preserved',
  'existing_persistent_work_preserved',
  'existing_rhythm_preserved'
]) assert.equal(world.materialization[key], true, key);
assert.equal(world.materialization.cross_role_link_materialized, false);

assert.deepEqual(world.existing_work_continuity.work_loops, read(GRAMMAR).work_loops);
assert.equal(world.existing_work_continuity.persistent_work_object, 'spesialistforlopets_hypotese_tiltak_og_veiledningslogg');
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.equal(read(PLAN).sequence.length, 16);
for (const person of read(MODEL).related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
}

const refs = world.materialization.source_refs;
assert.equal(refs.length, 15);
assert.equal(new Set(refs).size, 15);
for (const ref of refs) {
  const [relativePath, id] = ref.split('#');
  assert.ok(read(relativePath).families.flatMap((family) => family.mails || []).some((mail) => mail.id === id), ref);
}

const audienceIds = ['patients', 'supervised_psychologists', 'peer_specialists', 'clinical_team', 'service_leadership', 'quality_and_oversight', 'private_relations'];
assert.equal(world.situated_reputation_model.global_score_allowed, false);
assert.deepEqual(world.situated_reputation_model.audiences.map((audience) => audience.id), audienceIds);
for (const audience of world.situated_reputation_model.audiences) {
  assert.ok(audience.cares_about.length >= 2);
  assert.match(audience.cannot_grant, /ikke|kan ikke/i);
}
assert.match(world.situated_reputation_model.authority_separation, /spesialistgodkjenning/);
assert.match(world.situated_reputation_model.authority_separation, /faglig ansvarlig/);
assert.match(world.situated_reputation_model.authority_separation, /ansvarsovertakelse/);

assert.ok(refs.includes(world.history_go_affordance.source_ref));
assert.ok(world.history_go_affordance.better_question.length >= 180);
assert.match(world.history_go_affordance.authority_boundary, /ikke|kan ikke/i);
assert.equal(world.cross_role_link.status, 'candidate_when_shared_work_is_real');
assert.equal(world.cross_role_link.materialized, false);
assert.equal(world.cross_role_link.new_runtime, false);
assert.equal('shared_work_object' in world.cross_role_link, false);
assert.match(world.cross_role_link.rule, /not_required_for_rollout/);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning', 'lunch', 'afternoon', 'evening']);
assert.equal(world.season.coverage.length, 56);
const beatKeys = new Set(world.season.coverage.map((beat) => `${beat.day}/${beat.phase}`));
assert.equal(beatKeys.size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.summary)).size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.standing_consequence)).size, 56);
const uses = new Map(refs.map((ref) => [ref, 0]));
for (const beat of world.season.coverage) {
  assert.ok(beat.summary.length >= 300, `${beat.day}/${beat.phase} summary`);
  assert.ok(beat.standing_consequence.length >= 260, `${beat.day}/${beat.phase} consequence`);
  assert.ok(audienceIds.includes(beat.standing_audience));
  assert.equal(beat.materialization_refs.length, 1);
  assert.ok(refs.includes(beat.materialization_refs[0]));
  uses.set(beat.materialization_refs[0], uses.get(beat.materialization_refs[0]) + 1);
}
for (const [ref, count] of uses) assert.ok(count >= 3, `${ref} underused`);

assert.equal(world.primary_threads.length, 7);
for (const thread of world.primary_threads) {
  assert.ok(thread.relationship.length >= 120);
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  assert.ok(new Set(thread.beat_refs.map((ref) => ref.split('/')[0])).size >= 3);
  for (const ref of thread.beat_refs) assert.ok(beatKeys.has(ref), ref);
}
assert.equal(world.private_aftermath.length, 5);
for (const item of world.private_aftermath) {
  assert.equal(new Set(item.beat_refs).size, item.beat_refs.length);
  for (const ref of item.beat_refs) assert.ok(beatKeys.has(ref), ref);
}
assert.equal(world.delayed_consequences.length, 8);
for (const item of world.delayed_consequences) {
  assert.ok(beatKeys.has(item.setup_ref));
  assert.ok(beatKeys.has(item.return_ref));
  assert.notEqual(item.setup_ref, item.return_ref);
  assert.ok(Number(item.return_ref.split('/')[0]) > Number(item.setup_ref.split('/')[0]));
}

const index = read('data/Civication/roleWorlds/index.json');
assert.deepEqual(index.roles.find((entry) => entry.category === 'psykologi' && entry.role_scope === ROLE), {
  category: 'psykologi', role_scope: ROLE, status: 'role_world_complete', path: WORLD
});
assert.match(index.status, /_role_worlds_materialized$/);
assert.ok(read('data/Civication/roleWorldAuthoringChecklist.json').reference_worlds.includes(WORLD));
assert.deepEqual(read('data/Civication/roleWorldThemeBank.json').reference_profiles[KEY], world.theme_ids);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(!(readiness.rollout_queue || []).some((entry) => entry.key === KEY));
assert.equal(readiness.roles.find((entry) => entry.key === KEY).role_world_status, 'role_world_complete');
assert.ok(readiness.summary.role_world_complete_or_pilot >= 45);
assert.equal(readiness.gate.gate_pass, true);
const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((entry) => entry.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);

const source = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_PSYKOLOGI_SPESIALISTPSYKOLOG_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'), 'utf8');
assert.match(source, /Editorial uniqueness/i);
assert.match(source, /global reputation score/i);
assert.match(source, /not_required_for_rollout/);
assert.match(source, /29\/30/);
console.log('Civication Spesialistpsykolog Role World rollout: OK');
