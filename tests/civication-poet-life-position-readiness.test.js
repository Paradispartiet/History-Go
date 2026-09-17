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
const streamPath = 'data/Civication/narratives/leisure/litteratur_poet.json';
const stream = read(streamPath);

const tier = badge.tiers.find((entry) => entry.life_position?.id === 'poet');
assert.ok(tier);
assert.equal(tier.threshold, 300);
assert.equal(tier.life_position.kind, 'professional_practice');
assert.equal(tier.life_position.employment_independent, true);

assert.equal(stream.schema, 'civication_narrative_stream_v1');
assert.equal(stream.id, 'litteratur_poet_stream');
assert.deepEqual(stream.applies_when.any_tags, ['litteratur:poet']);
assert.equal(stream.storylets.length, 14);
assert.equal(new Set(stream.storylets.map((storylet) => storylet.id)).size, 14);
for (const storylet of stream.storylets) {
  assert.equal(storylet.choices.length, 2, `${storylet.id}: expected binary authored choice`);
  assert.deepEqual(storylet.choices.map((choice) => choice.effect), [1, -1], `${storylet.id}: expected +1/-1 effects`);
}

const row = audit.positions.find((entry) => entry.key === 'litteratur/poet');
assert.ok(row);
assert.equal(row.classification, 'ready');
assert.equal(row.role_world_status, 'role_world_not_started');
assert.equal(row.role_world_path, null);
assert.equal(row.authored_depth.exact_source_ref_count, 1);
assert.equal(row.authored_depth.max_narrative_depth, 14);
assert.deepEqual(row.evidence.exact_source_refs, [streamPath]);

const queueRow = audit.queue.find((entry) => entry.key === 'litteratur/poet');
assert.ok(queueRow);
assert.equal(queueRow.rank, 1);
assert.equal(queueRow.classification, 'ready');
assert.equal(queueRow.exact_source_ref_count, 1);
assert.equal(queueRow.max_narrative_depth, 14);
assert.equal(audit.first_ready?.key, 'litteratur/poet');
assert.equal(audit.summary.pending_ready_positions, 1);
assert.equal(index.roles.some((entry) => entry.life_position_key === 'litteratur/poet'), false);

console.log('Poet authored-depth readiness gate ok: ready for 14x4 Role World materialization');
