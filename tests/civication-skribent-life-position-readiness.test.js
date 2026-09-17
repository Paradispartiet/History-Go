#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const badge = read('data/badges/litteratur.json');
const audit = read('data/Civication/lifePositionRoleWorldReadiness.json');
const index = read('data/Civication/roleWorlds/index.json');
const streamPath = 'data/Civication/narratives/leisure/litteratur_skribent.json';
const worldPath = 'data/Civication/roleWorlds/litteratur/litteratur_skribent.json';
const stream = read(streamPath);

const tier = badge.tiers.find((entry) => entry.life_position?.id === 'skribent');
assert.ok(tier);
assert.equal(tier.threshold, 25);
assert.equal(tier.life_position.kind, 'professional_practice');
assert.equal(tier.life_position.employment_independent, true);

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'litteratur_skribent_stream');
assert.deepEqual(stream.applies_when.any_tags, ['litteratur:skribent']);
assert.equal(stream.storylets.length, 14);
assert.equal(new Set(stream.storylets.map((storylet) => storylet.id)).size, 14);
for (const storylet of stream.storylets) {
  assert.equal(storylet.choices.length, 2, `${storylet.id}: expected binary authored choice`);
  assert.deepEqual(storylet.choices.map((choice) => choice.effect), [1, -1], `${storylet.id}: expected +1/-1 effects`);
}

const row = audit.positions.find((entry) => entry.key === 'litteratur/skribent');
assert.ok(row);
assert.equal(row.classification, 'ready');
assert.equal(row.role_world_status, 'role_world_complete');
assert.equal(row.role_world_path, worldPath);
assert.equal(row.authored_depth.exact_source_ref_count, 1);
assert.equal(row.authored_depth.max_narrative_depth, 14);
assert.deepEqual(row.evidence.exact_source_refs, [streamPath]);
assert.ok(!audit.queue.some((entry) => entry.key === row.key));

const indexed = index.roles.find((entry) => entry.life_position_key === 'litteratur/skribent');
assert.ok(indexed);
assert.equal(indexed.role_scope, 'litteratur_skribent');
assert.equal(audit.first_ready, null);
assert.equal(audit.summary.pending_ready_positions, 0);

console.log('Skribent readiness gate ok: ready + role_world_complete');
