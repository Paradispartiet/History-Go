#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const worldPath = 'data/Civication/roleWorlds/media/media_medievaktbikkje.json';
const narrativePath = 'data/Civication/narratives/leisure/medievaktbikkje.json';

const world = readJson(worldPath);
const stream = readJson(narrativePath);
const index = readJson('data/Civication/roleWorlds/index.json');
const taxonomy = readJson('data/Civication/nonCareerRoleTaxonomy.json');
const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const checklist = readJson('data/Civication/roleWorldAuthoringChecklist.json');
const themeBank = readJson('data/Civication/roleWorldThemeBank.json');
const policy = readJson('data/Civication/roleWorldPolicy.json');

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.version, 1);
assert.equal(world.category, 'media');
assert.equal(world.role_scope, 'media_medievaktbikkje');
assert.equal(world.subject_type, 'life_position');
assert.deepEqual(world.life_position_ref, {
  badge_id: 'media',
  id: 'medievaktbikkje',
  label: 'Medievaktbikkje'
});
assert.equal(world.title, 'Medievaktbikkje');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.materialization?.no_new_runtime, true);
assert.match(world.sociological_core.description, /ikke.*ansatt journalist|ikke.*redaktør|publiserings-|redaksjonell beslutningsmyndighet/i);

const phases = ['morning', 'lunch', 'afternoon', 'evening'];
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, phases);
assert.equal(world.season.coverage.length, 56);
const coverage = new Set(world.season.coverage.map((row) => row.day + '/' + row.phase));
assert.equal(coverage.size, 56);
for (let day = 1; day <= 14; day += 1) {
  for (const phase of phases) assert.ok(coverage.has(day + '/' + phase), 'missing ' + day + '/' + phase);
}

const storyIds = new Set(stream.storylets.map((row) => row.id));
assert.equal(storyIds.size, 14);
function verifyNarrativeRef(reference) {
  const prefix = narrativePath + '#';
  assert.ok(reference.startsWith(prefix), 'unexpected materialization source ' + reference);
  assert.ok(storyIds.has(reference.slice(prefix.length)), 'missing Medievaktbikkje anchor ' + reference);
}
for (const beat of world.season.coverage) {
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
  beat.materialization_refs.forEach(verifyNarrativeRef);
}
for (const aftermath of world.private_aftermath) aftermath.materialization_refs.forEach(verifyNarrativeRef);
assert.equal(world.materialization.source_refs.length, 14);
assert.equal(new Set(world.materialization.source_refs).size, 14);
world.materialization.source_refs.forEach(verifyNarrativeRef);

assert.deepEqual(themeBank.reference_profiles['media/media_medievaktbikkje'], world.theme_ids);
assert.ok(checklist.reference_worlds.includes(worldPath));

const requiredPersonFields = [
  'id','social_function','class_position','status','power_over_player',
  'wants','conceals','speech_style','teaches_player'
];
assert.ok(world.recurring_people_archetypes.length >= 5);
for (const person of world.recurring_people_archetypes) {
  for (const field of requiredPersonFields) assert.ok(person[field], person.id + ' missing ' + field);
}
const client = world.recurring_people_archetypes.find((row) => row.id === 'researchnotat_oppdragsgiver');
assert.ok(client);
assert.match(client.class_position, /uten myndighet.*journalist|uten myndighet.*redaktør/i);
assert.match(client.power_over_player, /ikke.*publiserings|ikke.*redaksjonell beslutningsmyndighet/i);

const threadIds = new Set(world.primary_threads.map((row) => row.id));
assert.equal(threadIds.size, world.primary_threads.length);
assert.ok(world.primary_threads.length >= 6);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10,
    thread.id + ' must use 5-10 beats');
  assert.ok(new Set(thread.beat_refs.map((ref) => Number(ref.split('/')[0]))).size >= 3,
    thread.id + ' must span at least three days');
  for (const beatRef of thread.beat_refs) assert.ok(coverage.has(beatRef), thread.id + ' missing ' + beatRef);
}
for (const beat of world.season.coverage) {
  assert.ok(Array.isArray(beat.thread_ids) && beat.thread_ids.length >= 1);
  for (const id of beat.thread_ids) assert.ok(threadIds.has(id), 'unknown thread ' + id);
}

assert.ok(world.private_aftermath.length >= 4);
assert.ok(world.delayed_consequences.length >= 6);
for (const delayed of world.delayed_consequences) {
  assert.ok(coverage.has(delayed.setup_ref), delayed.id + ' invalid setup');
  assert.ok(coverage.has(delayed.return_ref), delayed.id + ' invalid return');
  assert.ok(Array.isArray(delayed.domains) && delayed.domains.length >= 1);
}

const entry = index.roles.find((row) => row.life_position_key === 'media/medievaktbikkje');
assert.ok(entry);
assert.equal(entry.category, 'media');
assert.equal(entry.role_scope, 'media_medievaktbikkje');
assert.equal(entry.subject_type, 'life_position');
assert.deepEqual(entry.life_position_ref, world.life_position_ref);
assert.equal(entry.status, 'role_world_complete');
assert.equal(entry.path, worldPath);

assert.equal(index.roles.filter((row) => row.subject_type !== 'life_position').length, 85);
assert.equal(index.roles.filter((row) => row.subject_type === 'life_position').length, 8);
assert.deepEqual(index.summary, {
  role_worlds_total: 93,
  career_role_worlds: 85,
  life_position_role_worlds: 8
});
assert.equal(index.career_role_world_count, 85);
assert.equal(index.life_position_role_world_count, 8);
assert.equal(index.status, '93_role_worlds_materialized');

assert.deepEqual(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds, [
  'sport/supporter',
  'by/nabolagskjenner',
  'film_tv/filmklubbmenneske',
  'filosofi/sofafilosof',
  'historie/historievandrer',
  'kunst/gallerivanker',
  'litteratur/skrivebordspoet',
  'media/medievaktbikkje'
]);
assert.equal(taxonomy.role_world_rollout_boundary.next_source_backed_candidate, 'musikk/scenehenger');
assert.equal(taxonomy.canonical_counts.career_role_worlds, 85);
assert.equal(taxonomy.canonical_counts.life_position_role_worlds, 8);
assert.equal(taxonomy.canonical_counts.total_role_worlds, 93);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.first_source_backed_candidate, 'musikk/scenehenger');
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds, 8);

const readiness = audit.positions.find((row) => row.key === 'media/medievaktbikkje');
assert.ok(readiness);
assert.equal(readiness.classification, 'ready');
assert.equal(readiness.role_world_status, 'role_world_complete');
assert.equal(readiness.role_world_path, worldPath);
assert.equal(readiness.authored_depth.max_narrative_depth, 14);
assert.deepEqual(readiness.evidence.exact_source_refs, [narrativePath]);
assert.deepEqual(readiness.evidence.livelihood_templates, ['medievaktbikkje_researchnotat']);
assert.ok(!audit.queue.some((row) => row.key === 'media/medievaktbikkje'));
assert.equal(audit.summary.life_position_role_world_complete, 8);
assert.equal(audit.summary.completed_life_position_role_worlds, 8);
assert.equal(audit.summary.pending_ready_positions, 1);
assert.equal(audit.first_ready?.key, 'musikk/scenehenger');

const livelihoodAnchor = stream.storylets.find((row) => row.id === 'researchnotatet_og_oppdragets_grense');
assert.ok(livelihoodAnchor);
assert.match(
  livelihoodAnchor.situation.join(' '),
  /ikke.*ansatt journalist|ikke.*redaktør|publiserings-|redaksjonell beslutningsmyndighet/i
);

execFileSync(process.execPath, ['tests/civication-role-world-contract.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-noncareer-role-taxonomy.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-life-position-role-world-readiness.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-medievaktbikkje-life-position-readiness.test.js'], { cwd: ROOT, stdio: 'pipe' });

console.log('civication Medievaktbikkje Role World ok: 56/56 coverage / 14 governed anchors / 93 total worlds / 8 completed life-position worlds / no new runtime');
