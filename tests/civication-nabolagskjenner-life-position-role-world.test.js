#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const worldPath = 'data/Civication/roleWorlds/by/by_nabolagskjenner.json';
const narrativePath = 'data/Civication/narratives/leisure/nabolagskjenner.json';

const world = readJson(worldPath);
const stream = readJson(narrativePath);
const index = readJson('data/Civication/roleWorlds/index.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'by');
assert.equal(world.role_scope, 'by_nabolagskjenner');
assert.equal(world.subject_type, 'life_position');
assert.deepEqual(world.life_position_ref, {
  badge_id: 'by',
  id: 'nabolagskjenner',
  label: 'Nabolagskjenner'
});
assert.equal(world.title, 'Nabolagskjenner');
assert.equal(world.status, 'role_world_complete');
assert.ok(world.sociological_core?.main_problem);
assert.ok(world.sociological_core?.description);
assert.ok(world.materialization?.no_new_runtime);

const phases = ['morning', 'lunch', 'afternoon', 'evening'];
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, phases);
assert.equal(world.season.coverage.length, 56);

const coverage = new Set(
  world.season.coverage.map((row) => String(row.day) + '/' + row.phase)
);
assert.equal(coverage.size, 56);
for (let day = 1; day <= 14; day += 1) {
  for (const phase of phases) {
    assert.ok(coverage.has(String(day) + '/' + phase),
      'missing Role World coverage ' + day + '/' + phase);
  }
}

const storyIds = new Set(stream.storylets.map((row) => row.id));
assert.equal(storyIds.size, 14);

function verifyNarrativeRef(reference) {
  const prefix = narrativePath + '#';
  assert.ok(reference.startsWith(prefix), 'unexpected materialization source ' + reference);
  const anchor = reference.slice(prefix.length);
  assert.ok(storyIds.has(anchor), 'missing Nabolagskjenner narrative anchor ' + anchor);
}

for (const beat of world.season.coverage) {
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
  beat.materialization_refs.forEach(verifyNarrativeRef);
}

for (const aftermath of world.private_aftermath) {
  assert.ok(aftermath.id);
  assert.ok(aftermath.description);
  assert.ok(Array.isArray(aftermath.materialization_refs) && aftermath.materialization_refs.length >= 1);
  aftermath.materialization_refs.forEach(verifyNarrativeRef);
}

assert.deepEqual(themeBank.reference_profiles['by/by_nabolagskjenner'], world.theme_ids,
  'Nabolagskjenner theme profile must match the completed Role World');
assert.ok(checklist.reference_worlds.includes(worldPath),
  'Nabolagskjenner Role World must be registered in the authoring checklist');

assert.equal(world.materialization.source_refs.length, 14);
assert.equal(new Set(world.materialization.source_refs).size, 14);
world.materialization.source_refs.forEach(verifyNarrativeRef);

const requiredPersonFields = [
  'id',
  'social_function',
  'class_position',
  'status',
  'power_over_player',
  'wants',
  'conceals',
  'speech_style',
  'teaches_player'
];
assert.ok(world.recurring_people_archetypes.length >= 5);
for (const person of world.recurring_people_archetypes) {
  for (const field of requiredPersonFields) {
    assert.ok(person[field], person.id + ' missing ' + field);
  }
}

const threadIds = new Set(world.primary_threads.map((thread) => thread.id));
assert.equal(threadIds.size, world.primary_threads.length);
assert.ok(world.primary_threads.length >= 4);

for (const thread of world.primary_threads) {
  assert.ok(thread.relationship);
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10,
    thread.id + ' must use 5-10 beats');
  assert.ok(new Set(thread.beat_refs.map((ref) => Number(ref.split('/')[0]))).size >= 3,
    thread.id + ' must span at least three days');
  for (const beatRef of thread.beat_refs) {
    assert.ok(coverage.has(beatRef), thread.id + ' missing coverage ref ' + beatRef);
  }
}

for (const beat of world.season.coverage) {
  assert.ok(Array.isArray(beat.thread_ids) && beat.thread_ids.length >= 1,
    String(beat.day) + '/' + beat.phase + ' missing thread binding');
  for (const threadId of beat.thread_ids) {
    assert.ok(threadIds.has(threadId), 'unknown thread id ' + threadId);
  }
}

assert.ok(world.delayed_consequences.length >= 1);
for (const delayed of world.delayed_consequences) {
  assert.ok(delayed.id);
  assert.ok(coverage.has(delayed.setup_ref), delayed.id + ' invalid setup ref');
  assert.ok(coverage.has(delayed.return_ref), delayed.id + ' invalid return ref');
  assert.ok(Array.isArray(delayed.domains) && delayed.domains.length >= 1);
}

const entry = index.roles.find((row) => row.life_position_key === 'by/nabolagskjenner');
assert.ok(entry, 'Nabolagskjenner Role World must be indexed');
assert.equal(entry.category, 'by');
assert.equal(entry.role_scope, 'by_nabolagskjenner');
assert.equal(entry.subject_type, 'life_position');
assert.deepEqual(entry.life_position_ref, world.life_position_ref);
assert.equal(entry.status, 'role_world_complete');
assert.equal(entry.path, worldPath);

assert.equal(index.roles.filter((row) => row.subject_type !== 'life_position').length, 85);
assert.equal(index.roles.filter((row) => row.subject_type === 'life_position').length, 4);
assert.deepEqual(index.summary, {
  role_worlds_total: 89,
  career_role_worlds: 85,
  life_position_role_worlds: 4
});
assert.equal(index.career_role_world_count, 85);
assert.equal(index.life_position_role_world_count, 4);

assert.deepEqual(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds, [
  'sport/supporter',
  'by/nabolagskjenner',
  'film_tv/filmklubbmenneske',
  'filosofi/sofafilosof'
]);
assert.equal(taxonomy.role_world_rollout_boundary.next_source_backed_candidate, 'historie/historievandrer');
assert.equal(taxonomy.canonical_counts.career_role_worlds, 85);
assert.equal(taxonomy.canonical_counts.life_position_role_worlds, 4);
assert.equal(taxonomy.canonical_counts.total_role_worlds, 89);

const readiness = audit.positions.find((row) => row.key === 'by/nabolagskjenner');
assert.ok(readiness);
assert.equal(readiness.classification, 'ready');
assert.equal(readiness.role_world_status, 'role_world_complete');
assert.equal(readiness.role_world_path, worldPath);
assert.equal(readiness.authored_depth.max_narrative_depth, 14);
assert.deepEqual(readiness.evidence.exact_source_refs, [narrativePath]);
assert.ok(!audit.queue.some((row) => row.key === 'by/nabolagskjenner'));
assert.equal(audit.summary.life_position_role_world_complete, 4);
assert.equal(audit.summary.pending_ready_positions, 1);
assert.equal(audit.first_ready?.key, 'historie/historievandrer');

execFileSync(process.execPath, ['tests/civication-role-world-contract.test.js'], {
  cwd: ROOT,
  stdio: 'pipe'
});
execFileSync(process.execPath, ['tests/civication-noncareer-role-taxonomy.test.js'], {
  cwd: ROOT,
  stdio: 'pipe'
});
execFileSync(process.execPath, ['tests/civication-life-position-role-world-readiness.test.js'], {
  cwd: ROOT,
  stdio: 'pipe'
});
execFileSync(process.execPath, ['tests/civication-nabolagskjenner-life-position-readiness.test.js'], {
  cwd: ROOT,
  stdio: 'pipe'
});

console.log('civication Nabolagskjenner Role World ok: 56/56 coverage / 14 governed anchors / 89 total worlds / no new runtime');
