const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const KEY = 'kunst/kunst_kunstnerisk_ledelse';
const ROLE = 'kunst_kunstnerisk_ledelse';
const WORLD_PATH = 'data/Civication/roleWorlds/kunst/kunst_kunstnerisk_ledelse.json';
const PLAN = 'data/Civication/mailPlans/kunst/kunst_kunstnerisk_ledelse_plan.json';
const MODEL = 'data/Civication/roleModels/kunst/kunst_kunstnerisk_ledelse.json';
const GRAMMAR = 'data/Civication/workGrammars/kunst/kunst_kunstnerisk_ledelse.json';
const family = (type) => `data/Civication/mailFamilies/kunst/${type}/${ROLE}_${type}.json`;

assert.ok(fs.existsSync(path.join(ROOT, WORLD_PATH)));
const world = read(WORLD_PATH);
assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.category, 'kunst');
assert.equal(world.role_scope, ROLE);
assert.equal(world.status, 'role_world_complete');
assert.deepEqual(world.materialization.authored_dimensions, ['situated_reputation']);
for (const key of ['no_new_runtime','existing_plan_preserved','existing_role_model_preserved','existing_people_foundation_preserved','existing_work_grammar_preserved','existing_persistent_work_preserved','existing_rhythm_preserved']) assert.equal(world.materialization[key], true, key);
assert.equal(world.materialization.cross_role_link_materialized, false);

const grammar = read(GRAMMAR);
assert.deepEqual(world.existing_work_continuity.work_loops, grammar.work_loops);
assert.equal(world.existing_work_continuity.persistent_work_object, 'kunstnerisk_programportefolje');
assert.equal(world.existing_work_continuity.new_runtime_state, false);
assert.equal(read(PLAN).sequence.length, 16);
const actors = read(MODEL).related_people;
assert.deepEqual(actors.map((p) => p.id), ['liv_institusjonsdirektor_kunstledelse','amina_seniorkurator_kunstledelse','eirik_produksjonsleder_kunstledelse','sara_kunstnerkontakt_kunstledelse']);
for (const p of actors) { assert.equal(p.fictional, true); assert.equal(p.fictional_scenario_actor, true); assert.equal(p.canonical_person_ref, null); }

const refs = world.materialization.source_refs;
assert.equal(refs.length, 15);
for (const ref of refs) { const [rel,id] = ref.split('#'); const mails = read(rel).families.flatMap((f) => f.mails || []); assert.ok(mails.some((m) => m.id === id), ref); }
assert.equal(world.situated_reputation_model.global_score_allowed, false);
const audiences = ['director_and_board','curatorial_team','production_delivery','artists_and_project_teams','funders_and_partners','public_and_critics','private_relations'];
assert.deepEqual(world.situated_reputation_model.audiences.map((a) => a.id), audiences);
for (const a of world.situated_reputation_model.audiences) { assert.ok(a.standing_axis.length >= 12); assert.ok(a.cares_about.length >= 2); assert.match(a.cannot_grant, /ikke|kan ikke/i); }
assert.match(world.situated_reputation_model.authority_separation, /myndighet|mandat|fullmakt/i);
assert.equal(world.history_go_affordance.source_ref, refs[13]);
assert.ok(world.history_go_affordance.better_question.length >= 160);
assert.match(world.history_go_affordance.authority_boundary, /ikke|kan ikke/i);
assert.equal(world.cross_role_link.status, 'candidate_when_shared_work_is_real');
assert.equal(world.cross_role_link.materialized, false);
assert.equal(world.cross_role_link.new_runtime, false);
assert.equal('shared_work_object' in world.cross_role_link, false);

assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
const keys = new Set(world.season.coverage.map((b) => `${b.day}/${b.phase}`));
assert.equal(keys.size, 56);
assert.equal(new Set(world.season.coverage.map((b) => b.summary)).size, 56);
assert.equal(new Set(world.season.coverage.map((b) => b.standing_consequence)).size, 56);
const uses = new Map(refs.map((r) => [r,0]));
for (const b of world.season.coverage) {
  assert.ok(b.summary.length >= 240, `${b.day}/${b.phase} shallow summary`);
  assert.ok(b.standing_consequence.length >= 220, `${b.day}/${b.phase} shallow consequence`);
  assert.ok(audiences.includes(b.standing_audience));
  assert.deepEqual(b.materialization_refs.length, 1);
  assert.ok(refs.includes(b.materialization_refs[0]));
  uses.set(b.materialization_refs[0], uses.get(b.materialization_refs[0]) + 1);
}
for (const [ref,count] of uses) assert.ok(count >= 2, `${ref} underused`);
assert.ok(world.primary_threads.length >= 7);
for (const thread of world.primary_threads) { assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10); for (const ref of thread.beat_refs) assert.ok(keys.has(ref), ref); }
assert.ok(world.private_aftermath.length >= 5);
assert.ok(world.delayed_consequences.length >= 7);

const index = read('data/Civication/roleWorlds/index.json');
assert.deepEqual(index.roles.find((r) => r.category === 'kunst' && r.role_scope === ROLE), {category:'kunst',role_scope:ROLE,status:'role_world_complete',path:WORLD_PATH});
assert.match(index.status, /_role_worlds_materialized$/);
assert.ok(read('data/Civication/roleWorldAuthoringChecklist.json').reference_worlds.includes(WORLD_PATH));
assert.deepEqual(read('data/Civication/roleWorldThemeBank.json').reference_profiles[KEY], world.theme_ids);
const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
assert.ok(!(readiness.rollout_queue || []).some((r) => r.key === KEY));
assert.ok(readiness.summary.role_world_complete_or_pilot >= 40);
assert.equal(readiness.gate.gate_pass, true);
const career = read('data/Civication/careerGameplayMatrix.json').worlds.find((r) => r.key === KEY);
assert.equal(career.status, 'playable'); assert.equal(career.audit.runtime_gate, true); assert.deepEqual(career.audit.missing_components, []);
const sourceFirst = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_KUNST_KUNSTNERISK_LEDELSE_ROLE_WORLD_ROLLOUT_SOURCE_FIRST.md'), 'utf8');
assert.match(sourceFirst, /editorial uniqueness/i); assert.match(sourceFirst, /shared boilerplate/i); assert.match(sourceFirst, /global reputation score/i); assert.match(sourceFirst, /candidate_when_shared_work_is_real/);
console.log('Civication Kunstnerisk ledelse Role World rollout: OK');
