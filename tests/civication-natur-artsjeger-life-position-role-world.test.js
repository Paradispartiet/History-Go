#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const worldPath = 'data/Civication/roleWorlds/natur/natur_artsjeger.json';
const narrativePath = 'data/Civication/narratives/leisure/natur_artsjeger.json';

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
assert.equal(world.category, 'natur');
assert.equal(world.role_scope, 'natur_artsjeger');
assert.equal(world.subject_type, 'life_position');
assert.deepEqual(world.life_position_ref, { badge_id: 'natur', id: 'artsjeger', label: 'Artsjeger' });
assert.equal(world.status, 'role_world_complete');
assert.equal(world.materialization?.no_new_runtime, true);
assert.match(
  world.sociological_core.description,
  /profesjonell|biolog|forvaltning|myndighet|konsekvensutredning|faglig godkjenning/i
);

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
  assert.ok(storyIds.has(reference.slice(prefix.length)), 'missing Natur Artsjeger anchor ' + reference);
}
for (const beat of world.season.coverage) {
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length >= 1);
  beat.materialization_refs.forEach(verifyNarrativeRef);
}
for (const aftermath of world.private_aftermath) aftermath.materialization_refs.forEach(verifyNarrativeRef);
assert.equal(world.materialization.source_refs.length, 14);
assert.equal(new Set(world.materialization.source_refs).size, 14);
world.materialization.source_refs.forEach(verifyNarrativeRef);

assert.deepEqual(themeBank.reference_profiles['natur/natur_artsjeger'], world.theme_ids);
assert.ok(checklist.reference_worlds.includes(worldPath));

const requiredPersonFields = [
  'id','social_function','class_position','status','power_over_player',
  'wants','conceals','speech_style','teaches_player'
];
assert.ok(world.recurring_people_archetypes.length >= 5);
for (const person of world.recurring_people_archetypes) {
  for (const field of requiredPersonFields) assert.ok(person[field], person.id + ' missing ' + field);
}
assert.ok(world.recurring_people_archetypes.some((row) => row.id === 'faglig_biologkontakt'));
assert.ok(world.recurring_people_archetypes.some((row) => row.id === 'naturprosjekt_oppdragsgiver'));
assert.ok(world.recurring_people_archetypes.some((row) => row.id === 'dyrevelferdskontakt'));

const threadIds = new Set(world.primary_threads.map((row) => row.id));
assert.equal(threadIds.size, world.primary_threads.length);
assert.ok(world.primary_threads.length >= 6);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, thread.id + ' must use 5-10 beats');
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

const entry = index.roles.find((row) => row.life_position_key === 'natur/artsjeger');
assert.ok(entry);
assert.equal(entry.category, 'natur');
assert.equal(entry.role_scope, 'natur_artsjeger');
assert.equal(entry.subject_type, 'life_position');
assert.deepEqual(entry.life_position_ref, world.life_position_ref);
assert.equal(entry.status, 'role_world_complete');
assert.equal(entry.path, worldPath);

assert.equal(index.roles.filter((row) => row.subject_type !== 'life_position').length, 85);
assert.equal(index.roles.filter((row) => row.subject_type === 'life_position').length, 14);
assert.deepEqual(index.summary, {
  role_worlds_total: 99,
  career_role_worlds: 85,
  life_position_role_worlds: 14
});
assert.equal(index.career_role_world_count, 85);
assert.equal(index.life_position_role_world_count, 14);
assert.equal(index.status, '99_role_worlds_materialized');

assert.ok(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.includes('natur/artsjeger'));
assert.equal(taxonomy.role_world_rollout_boundary.completed_life_position_role_worlds.length, 14);
assert.equal(taxonomy.role_world_rollout_boundary.next_source_backed_candidate, null);
assert.equal(taxonomy.canonical_counts.career_role_worlds, 85);
assert.equal(taxonomy.canonical_counts.life_position_role_worlds, 14);
assert.equal(taxonomy.canonical_counts.total_role_worlds, 99);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.first_source_backed_candidate, null);
assert.equal(policy.noncareer_subject_boundary.life_position_readiness.completed_life_position_role_worlds, 14);

const readiness = audit.positions.find((row) => row.key === 'natur/artsjeger');
assert.ok(readiness);
assert.equal(readiness.classification, 'ready');
assert.equal(readiness.role_world_status, 'role_world_complete');
assert.equal(readiness.role_world_path, worldPath);
assert.equal(readiness.authored_depth.max_narrative_depth, 14);
assert.deepEqual(readiness.evidence.exact_source_refs, [narrativePath]);
assert.deepEqual(readiness.evidence.livelihood_templates, ['artsjeger_feltregistrering']);
assert.ok(!audit.queue.some((row) => row.key === 'natur/artsjeger'));
assert.equal(audit.summary.life_position_role_world_complete, 14);
assert.equal(audit.summary.completed_life_position_role_worlds, 14);
assert.equal(audit.summary.pending_ready_positions, 0);
assert.equal(audit.first_ready, null);

assert.ok(!audit.queue.some((row) => row.key === 'scenekunst/scenehenger'));
assert.ok((audit.queue || []).every((row) => row.classification !== 'ready'));

const paidAnchor = stream.storylets.find((row) => row.id === 'feltregistreringsoppdraget');
assert.ok(paidAnchor);
assert.match(
  paidAnchor.situation.join(' '),
  /ikke ansvar for artsforvaltning|konsekvensutredning|offentlig vedtak|faglig godkjenning/i
);

execFileSync(process.execPath, ['tests/civication-role-world-contract.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-noncareer-role-taxonomy.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-life-position-role-world-readiness.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['tests/civication-natur-artsjeger-life-position-readiness.test.js'], { cwd: ROOT, stdio: 'pipe' });

console.log('civication Natur Artsjeger Role World ok: 56/56 coverage / 14 governed anchors / 96 total worlds / 11 completed life-position worlds');
