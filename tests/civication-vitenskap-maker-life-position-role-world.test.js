#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const worldPath = 'data/Civication/roleWorlds/vitenskap/vitenskap_maker.json';
const narrativePath = 'data/Civication/narratives/leisure/vitenskap_maker.json';
const world = readJson(worldPath);
const stream = readJson(narrativePath);
const index = readJson('data/Civication/roleWorlds/index.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');

assert.equal(world.category, 'vitenskap');
assert.equal(world.role_scope, 'vitenskap_maker');
assert.equal(world.subject_type, 'life_position');
assert.deepEqual(world.life_position_ref, { badge_id: 'vitenskap', id: 'maker', label: 'Maker' });
assert.equal(world.status, 'role_world_complete');
assert.equal(world.materialization.no_new_runtime, true);
assert.match(world.sociological_core.description, /ingeniør|laboratorie|elektriker|maskinoperatør/i);

const phases = ['morning', 'lunch', 'afternoon', 'evening'];
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, phases);
assert.equal(world.season.coverage.length, 56);
const coverage = new Set(world.season.coverage.map((x) => x.day + '/' + x.phase));
assert.equal(coverage.size, 56);
for (let day = 1; day <= 14; day += 1) for (const phase of phases) assert.ok(coverage.has(day + '/' + phase));

const storyIds = new Set(stream.storylets.map((x) => x.id));
assert.equal(storyIds.size, 14);
assert.equal(world.materialization.source_refs.length, 14);
assert.equal(new Set(world.materialization.source_refs).size, 14);
for (const ref of world.materialization.source_refs) {
  assert.ok(ref.startsWith(narrativePath + '#'));
  assert.ok(storyIds.has(ref.slice((narrativePath + '#').length)));
}
for (const beat of world.season.coverage) {
  assert.ok(beat.thread_ids.length >= 1);
  assert.ok(beat.materialization_refs.length >= 1);
}

assert.ok(world.recurring_people_archetypes.length >= 5);
for (const person of world.recurring_people_archetypes) {
  for (const field of ['id','social_function','class_position','status','power_over_player','wants','conceals','speech_style','teaches_player']) {
    assert.ok(person[field], person.id + ' missing ' + field);
  }
}
assert.ok(world.recurring_people_archetypes.some((x) => x.id === 'verkstedsvert'));
assert.ok(world.recurring_people_archetypes.some((x) => x.id === 'erfaren_maker'));
assert.ok(world.recurring_people_archetypes.some((x) => x.id === 'ny_maker'));

const threadIds = new Set(world.primary_threads.map((x) => x.id));
assert.ok(threadIds.size >= 8);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  assert.ok(new Set(thread.beat_refs.map((ref) => Number(ref.split('/')[0]))).size >= 3);
  for (const ref of thread.beat_refs) assert.ok(coverage.has(ref));
}
for (const beat of world.season.coverage) for (const id of beat.thread_ids) assert.ok(threadIds.has(id));

assert.ok(world.private_aftermath.length >= 4);
assert.ok(world.delayed_consequences.length >= 6);
for (const delayed of world.delayed_consequences) {
  assert.ok(coverage.has(delayed.setup_ref));
  assert.ok(coverage.has(delayed.return_ref));
  assert.ok(Number(delayed.return_ref.split('/')[0]) > Number(delayed.setup_ref.split('/')[0]));
}

assert.deepEqual(themeBank.reference_profiles['vitenskap/vitenskap_maker'], world.theme_ids);
assert.ok(checklist.reference_worlds.includes(worldPath));

const entry = index.roles.find((x) => x.life_position_key === 'vitenskap/maker');
assert.ok(entry);
assert.equal(entry.path, worldPath);
assert.equal(entry.status, 'role_world_complete');
assert.equal(index.roles.filter((x) => x.subject_type !== 'life_position').length, 85);
assert.equal(index.roles.filter((x) => x.subject_type === 'life_position').length, 16);
assert.equal(index.roles.length, 101);
assert.equal(index.status, '102_role_worlds_materialized');
assert.deepEqual(index.summary, { role_worlds_total: 102, career_role_worlds: 85, life_position_role_worlds: 17 });

assert.ok(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes('vitenskap/maker'));
assert.equal(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.length, 16);
assert.equal(taxonomy.canonical_counts.life_position_role_worlds, 16);
assert.equal(taxonomy.canonical_counts.total_role_worlds, 101);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds, 17);

const electrical = stream.storylets.find((x) => x.id === 'batteriet_som_ikke_skal_improviseres');
assert.ok(electrical);
assert.match(electrical.situation.join(' '), /stopp|kvalifisert hjelp|kjent dokumentasjon/i);

const machine = stream.storylets.find((x) => x.id === 'maskinen_som_krever_opplaering');
assert.ok(machine);
assert.match(machine.situation.join(' '), /opplærings|godkjenningsrutine|ikke det samme som å være godkjent operatør/i);

console.log('civication Vitenskap Maker Role World ok: 56/56 / 14 anchors / 100 total / 16 life-position worlds');
