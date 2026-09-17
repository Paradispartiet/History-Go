#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const badge = read('data/badges/media.json');
const audit = read('data/Civication/lifePositionRoleWorldReadiness.json');
const index = read('data/Civication/roleWorlds/index.json');
const streamPath = 'data/Civication/narratives/leisure/media_folger.json';
const worldPath = 'data/Civication/roleWorlds/media/media_folger.json';
const stream = read(streamPath);

const tier = badge.tiers.find((entry) => entry.life_position?.id === 'folger');
assert.ok(tier);
assert.equal(tier.threshold, 10);
assert.equal(tier.life_position.kind, 'audience_practice');
assert.equal(tier.life_position.employment_independent, true);

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'media_folger_stream');
assert.deepEqual(stream.applies_when.any_tags, ['media:folger']);
assert.equal(stream.storylets.length, 14);
assert.equal(new Set(stream.storylets.map((storylet) => storylet.id)).size, 14);
for (const storylet of stream.storylets) {
  assert.equal(storylet.choices.length, 2, `${storylet.id}: expected binary authored choice`);
  assert.deepEqual(storylet.choices.map((choice) => choice.effect), [1, -1], `${storylet.id}: expected +1/-1 effects`);
}

const row = audit.positions.find((entry) => entry.key === 'media/folger');
assert.ok(row);
assert.equal(row.classification, 'ready');
assert.equal(row.role_world_status, fs.existsSync(path.join(ROOT, worldPath)) ? 'role_world_complete' : 'role_world_not_started');
assert.equal(row.authored_depth.exact_source_ref_count, 1);
assert.equal(row.authored_depth.max_narrative_depth, 14);
assert.deepEqual(row.evidence.exact_source_refs, [streamPath]);

if (row.role_world_status === 'role_world_not_started') {
  assert.equal(row.role_world_path, null);
  assert.equal(audit.first_ready?.key, 'media/folger');
  assert.ok(audit.queue.some((entry) => entry.key === row.key && entry.classification === 'ready'));
  assert.ok(audit.summary.pending_ready_positions >= 1);
} else {
  assert.equal(row.role_world_path, worldPath);
  const indexed = index.roles.find((entry) => entry.life_position_key === 'media/folger');
  assert.ok(indexed);
  assert.equal(indexed.role_scope, 'media_folger');
}

const serialized = JSON.stringify(stream);
for (const forbidden of ['career_offer', 'fixed_salary', 'editorial_authority']) {
  assert.ok(!serialized.includes(forbidden), `Følger stream must not claim ${forbidden}`);
}

console.log(`Følger readiness gate ok: ready + ${row.role_world_status}`);
