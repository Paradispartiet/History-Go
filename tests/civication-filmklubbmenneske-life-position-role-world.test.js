#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const worldPath = 'data/Civication/roleWorlds/film_tv/film_tv_filmklubbmenneske.json';
const narrativePath = 'data/Civication/narratives/leisure/filmklubbmenneske.json';

const world = readJson(worldPath);
const stream = readJson(narrativePath);
const index = readJson('data/Civication/roleWorlds/index.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'film_tv');
assert.equal(world.role_scope, 'film_tv_filmklubbmenneske');
assert.equal(world.subject_type, 'life_position');
assert.deepEqual(world.life_position_ref, {
  badge_id: 'film_tv',
  id: 'filmklubbmenneske',
  label: 'Filmklubbmenneske'
});
assert.equal(world.title, 'Filmklubbmenneske');
assert.equal(world.status, 'role_world_complete');
assert.ok(world.sociological_core?.main_problem);
assert.ok(world.sociological_core?.description);
assert.equal(world.materialization?.no_new_runtime, true);

const phases = ['morning', 'lunch', 'afternoon', 'evening'];
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, phases);
assert.equal(world.season.coverage.length, 56);
assert.equal(new Set(world.season.coverage.map((row) => row.day + '/' + row.phase)).size, 56);

const storyIds = new Set(stream.storylets.map((row) => row.id));
assert.equal(storyIds.size, 14);
function verifyNarrativeRef(reference) {
  const prefix = narrativePath + '#';
  assert.ok(reference.startsWith(prefix), 'unexpected materialization source ' + reference);
  assert.ok(storyIds.has(reference.slice(prefix.length)), 'missing Filmklubbmenneske anchor ' + reference);
}
for (const beat of world.season.coverage) beat.materialization_refs.forEach(verifyNarrativeRef);
for (const aftermath of world.private_aftermath) aftermath.materialization_refs.forEach(verifyNarrativeRef);

assert.equal(world.materialization.source_refs.length, 14);
assert.equal(new Set(world.materialization.source_refs).size, 14);
world.materialization.source_refs.forEach(verifyNarrativeRef);

assert.deepEqual(
  themeBank.reference_profiles['film_tv/film_tv_filmklubbmenneske'],
  world.theme_ids
);
assert.ok(checklist.reference_worlds.includes(worldPath));

const requiredPersonFields = [
  'id','social_function','class_position','status','power_over_player',
  'wants','conceals','speech_style','teaches_player'
];
assert.ok(world.recurring_people_archetypes.length >= 5);
for (const person of world.recurring_people_archetypes) {
  for (const field of requiredPersonFields) assert.ok(person[field], person.id + ' missing ' + field);
}

const coverage = new Set(world.season.coverage.map((row) => row.day + '/' + row.phase));
const threadIds = new Set(world.primary_threads.map((row) => row.id));
assert.ok(world.primary_threads.length >= 4);
assert.equal(threadIds.size, world.primary_threads.length);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  assert.ok(new Set(thread.beat_refs.map((ref) => Number(ref.split('/')[0]))).size >= 3);
  for (const ref of thread.beat_refs) assert.ok(coverage.has(ref), thread.id + ' missing beat ' + ref);
}
for (const beat of world.season.coverage) {
  assert.ok(Array.isArray(beat.thread_ids) && beat.thread_ids.length >= 1);
  for (const id of beat.thread_ids) assert.ok(threadIds.has(id), 'unknown thread ' + id);
}

assert.ok(world.delayed_consequences.length >= 6);
for (const delayed of world.delayed_consequences) {
  assert.ok(coverage.has(delayed.setup_ref));
  assert.ok(coverage.has(delayed.return_ref));
  assert.ok(delayed.domains.length >= 1);
}

const entry = index.roles.find((row) => row.life_position_key === 'film_tv/filmklubbmenneske');
assert.ok(entry);
assert.equal(entry.category, 'film_tv');
assert.equal(entry.role_scope, 'film_tv_filmklubbmenneske');
assert.equal(entry.subject_type, 'life_position');
assert.deepEqual(entry.life_position_ref, world.life_position_ref);
assert.equal(entry.status, 'role_world_complete');
assert.equal(entry.path, worldPath);

assert.equal(index.roles.filter((row) => row.subject_type !== 'life_position').length, 85);
assert.equal(index.roles.filter((row) => row.subject_type === 'life_position').length, 3);
assert.deepEqual(index.summary, {
  role_worlds_total: 88,
  career_role_worlds: 85,
  life_position_role_worlds: 3
});
assert.equal(index.career_role_world_count, 85);
assert.equal(index.life_position_role_world_count, 3);

assert.deepEqual(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds, [
  'sport/supporter',
  'by/nabolagskjenner',
  'film_tv/filmklubbmenneske'
]);
assert.equal(taxonomy.role_world_rollout_boundary.next_source_backed_candidate, 'filosofi/sofafilosof');
assert.equal(taxonomy.canonical_counts.career_role_worlds, 85);
assert.equal(taxonomy.canonical_counts.life_position_role_worlds, 3);
assert.equal(taxonomy.canonical_counts.total_role_worlds, 88);

const readiness = audit.positions.find((row) => row.key === 'film_tv/filmklubbmenneske');
assert.ok(readiness);
assert.equal(readiness.classification, 'ready');
assert.equal(readiness.role_world_status, 'role_world_complete');
assert.equal(readiness.role_world_path, worldPath);
assert.equal(readiness.authored_depth.max_narrative_depth, 14);
assert.deepEqual(readiness.evidence.exact_source_refs, [narrativePath]);
assert.deepEqual(readiness.evidence.livelihood_templates, ['filmklubbmenneske_visningshjelp']);
assert.ok(!audit.queue.some((row) => row.key === 'film_tv/filmklubbmenneske'));
assert.equal(audit.summary.life_position_role_world_complete, 3);
assert.equal(audit.summary.completed_life_position_role_worlds, 3);
assert.equal(audit.summary.pending_ready_positions, 1);
assert.equal(audit.first_ready?.key, 'filosofi/sofafilosof');

execFileSync(process.execPath, ['tests/civication-role-world-contract.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-noncareer-role-taxonomy.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-life-position-role-world-readiness.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-filmklubbmenneske-life-position-readiness.test.js'], { cwd: ROOT, stdio: 'pipe' });

console.log('civication Filmklubbmenneske Role World ok: 56/56 coverage / 14 governed anchors / 88 total worlds / no new runtime');
