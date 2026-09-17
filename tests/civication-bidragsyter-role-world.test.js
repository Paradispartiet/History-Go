#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));

const world = read('data/Civication/roleWorlds/media/media_bidragsyter.json');
const stream = read('data/Civication/narratives/leisure/media_bidragsyter.json');

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.category, 'media');
assert.equal(world.role_scope, 'media_bidragsyter');
assert.equal(world.subject_type, 'life_position');
assert.deepEqual(world.life_position_ref, { badge_id: 'media', id: 'bidragsyter', label: 'Bidragsyter' });
assert.equal(world.status, 'role_world_complete');
assert.equal(world.materialization.no_new_runtime, true);
assert.deepEqual(stream.applies_when.any_tags, ['media:bidragsyter']);
assert.equal(stream.storylets.length, 14);
assert.equal(new Set(stream.storylets.map((x) => x.id)).size, 14);
assert.equal(world.season.days, 14);
assert.equal(world.season.coverage.length, 56);
assert.equal(new Set(world.season.coverage.map((x) => `${x.day}/${x.phase}`)).size, 56);
assert.equal(world.primary_threads.length, 14);
assert.equal(world.recurring_people_archetypes.length, 6);
assert.equal(world.private_aftermath.length, 5);
assert.equal(world.delayed_consequences.length, 6);
assert.equal(world.materialization.source_refs.length, 14);

const ids = new Set(stream.storylets.map((x) => x.id));
const prefix = 'data/Civication/narratives/leisure/media_bidragsyter.json#';
for (const beat of world.season.coverage) {
  assert.ok(beat.thread_ids.length >= 1);
  for (const ref of beat.materialization_refs) {
    assert.ok(ref.startsWith(prefix));
    assert.ok(ids.has(ref.slice(prefix.length)));
  }
}
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  assert.ok(new Set(thread.beat_refs.map((ref) => Number(ref.split('/')[0]))).size >= 3);
  for (const ref of thread.beat_refs) {
    const beat = world.season.coverage.find((entry) => `${entry.day}/${entry.phase}` === ref);
    assert.ok(beat && beat.thread_ids.includes(thread.id));
  }
}

const required = ['id', 'social_function', 'class_position', 'status', 'power_over_player', 'wants', 'conceals', 'speech_style', 'teaches_player'];
for (const person of world.recurring_people_archetypes) {
  for (const field of required) assert.ok(String(person[field] || '').trim(), `${person.id}: missing ${field}`);
}

const description = world.sociological_core.description;
const normalized = description.toLowerCase();
assert.match(description, /employment-independent contributor_practice/i);
for (const term of ['pitch', 'kilde', 'samtykke', 'redigering', 'kreditering', 'interessekonflikt', 'frist', 'avslag', 'retting', 'gjenbruk', 'samarbeid']) {
  assert.ok(normalized.includes(term), `Bidragsyter description missing practice marker: ${term}`);
}
for (const boundary of ['journalist', 'reporter', 'jobb', 'lønn', 'honorar', 'redaksjonell myndighet']) {
  assert.ok(normalized.includes(boundary), `Bidragsyter description missing boundary marker: ${boundary}`);
}
assert.match(description, /ingen ny runtime/i);

console.log('Bidragsyter Role World gate ok: 14 storylets / 56 beats / 14 threads / 6 people / 5 aftermath / 6 delayed');
