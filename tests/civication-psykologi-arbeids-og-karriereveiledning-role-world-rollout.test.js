const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const KEY = 'psykologi/psykologi_arbeids_og_karriereveiledning';
const ROLE = 'psykologi_arbeids_og_karriereveiledning';
const WORLD = `data/Civication/roleWorlds/psykologi/${ROLE}.json`;
const PLAN = `data/Civication/mailPlans/psykologi/${ROLE}_plan.json`;
const MODEL = `data/Civication/roleModels/psykologi/${ROLE}.json`;
const GRAMMAR = `data/Civication/workGrammars/psykologi/${ROLE}.json`;

const world = read(WORLD);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.status, 'role_world_complete');
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
for (const key of ['no_new_runtime', 'existing_plan_preserved', 'existing_role_model_preserved', 'existing_people_foundation_preserved', 'existing_work_grammar_preserved', 'existing_persistent_work_preserved', 'existing_rhythm_preserved']) assert.equal(world.materialization[key], true, key);
assert.equal(world.materialization.cross_role_link_materialized, false);

assert.deepEqual(world.existing_work_continuity.work_loops, read(GRAMMAR).work_loops);
assert.equal(world.existing_work_continuity.persistent_work_object, 'samtykkebundet_valg_og_overgangsplan');
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.equal(read(PLAN).sequence.length, 16);
for (const person of read(MODEL).related_people) {
  assert.equal(person.fictional, true);
  assert.equal(person.fictional_scenario_actor, true);
  assert.equal(person.canonical_person_ref, null);
}

const refs = world.materialization.source_refs;
assert.equal(refs.length, 15);
for (const ref of refs) {
  const [file, id] = ref.split('#');
  assert.ok(read(file).families.flatMap((family) => family.mails || []).some((mail) => mail.id === id), ref);
}

const audienceIds = ['seekers', 'guidance_colleagues', 'team_leadership', 'employers', 'public_service_partners', 'education_and_training_partners', 'private_relations'];
assert.equal(world.situated_reputation_model.global_score_allowed, false);
assert.deepEqual(world.situated_reputation_model.audiences.map((audience) => audience.id), audienceIds);
for (const audience of world.situated_reputation_model.audiences) {
  assert.ok(audience.cares_about.length >= 2);
  assert.match(audience.cannot_grant, /ikke|kan ikke/i);
}
assert.match(world.situated_reputation_model.authority_separation, /myndighet|beslutningsrett|tilgang/i);

assert.ok(refs.includes(world.history_go_affordance.source_ref));
assert.ok(world.history_go_affordance.better_question.length >= 180);
assert.match(world.history_go_affordance.authority_boundary, /ikke|kan ikke/i);
assert.equal(world.cross_role_link.status, 'candidate_when_shared_work_is_real');
assert.equal(world.cross_role_link.materialized, false);
assert.equal(world.cross_role_link.new_runtime, false);
assert.equal('shared_work_object' in world.cross_role_link, false);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning', 'lunch', 'afternoon', 'evening']);
assert.equal(world.season.coverage.length, 56);
const keys = new Set(world.season.coverage.map((beat) => `${beat.day}/${beat.phase}`));
assert.equal(keys.size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.summary)).size, 56);
assert.equal(new Set(world.season.coverage.map((beat) => beat.standing_consequence)).size, 56);
const uses = new Map(refs.map((ref) => [ref, 0]));
for (const beat of world.season.coverage) {
  assert.ok(beat.summary.length >= 240);
  assert.ok(beat.standing_consequence.length >= 220);
  assert.ok(audienceIds.includes(beat.standing_audience));
  assert.equal(beat.materialization_refs.length, 1);
  assert.ok(refs.includes(beat.materialization_refs[0]));
  uses.set(beat.materialization_refs[0], uses.get(beat.materialization_refs[0]) + 1);
}
for (const [ref, count] of uses) assert.ok(count >= 2, `${ref} underused`);

assert.equal(world.primary_threads.length, 7);
for (const thread of world.primary_threads) {
  assert.ok(thread.relationship.length >= 120);
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  assert.ok(new Set(thread.beat_refs.map((ref) => ref.split('/')[0])).size >= 3);
  for (const ref of thread.beat_refs) assert.ok(keys.has(ref), ref);
}
assert.ok(world.private_aftermath.length >= 5);
for (const item of world.private_aftermath) {
  assert.equal(new Set(item.beat_refs).size, item.beat_refs.length);
  for (const ref of item.beat_refs) assert.ok(keys.has(ref), ref);
}
assert.ok(world.delayed_consequences.length >= 8);
for (const item of world.delayed_consequences) {
  assert.ok(keys.has(item.setup_ref));
  assert.ok(keys.has(item.return_ref));
  const [setupDay] = item.setup_ref.split('/').map(Number);
  const [returnDay] = item.return_ref.split('/').map(Number);
  assert.ok(returnDay > setupDay, `${item.id} must return later`);
}

const index = read('data/Civication/roleWorlds/index.json');
assert.deepEqual(index.roles.find((entry) => entry.category === 'psykologi' && entry.role_scope === ROLE), { category: 'psykologi', role_scope: ROLE, status: 'role_world_complete', path: WORLD });
assert.match(index.status, /_role_worlds_materialized$/);
assert.ok(read('data/Civication/roleWorldAuthoringChecklist.json').reference_worlds.includes(WORLD));
assert.deepEqual(read('data/Civication/roleWorldThemeBank.json').reference_profiles[KEY], world.theme_ids);

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(!(readiness.rollout_queue || []).some((row) => row.key === KEY));
const readinessRole = readiness.roles.find((row) => row.key === KEY);
assert.equal(readinessRole.role_world_status, 'role_world_complete');
assert.deepEqual(readinessRole.authored_work_required, []);
assert.ok(readiness.summary.role_world_complete_or_pilot >= 44);
assert.equal(readiness.gate.gate_pass, true);
const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((row) => row.key === KEY);
assert.equal(career.status, 'playable');
assert.equal(career.audit.runtime_gate, true);
assert.deepEqual(career.audit.missing_components, []);

const source = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_PSYKOLOGI_ARBEIDS_OG_KARRIEREVEILEDNING_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'), 'utf8');
assert.match(source, /Editorial uniqueness/i);
assert.match(source, /global reputation score/i);
assert.match(source, /candidate_when_shared_work_is_real/);
assert.match(source, /29\/30/);
console.log('Civication arbeids- og karriereveiledning Role World rollout: OK');
