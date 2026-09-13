#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const audit = readJson('data/Civication/lifePositionRoleWorldReadiness.json');
const streamPath = 'data/Civication/narratives/leisure/sport_klubbmenneske.json';
const stream = readJson(streamPath);
const row = audit.positions.find((item) => item.key === 'sport/klubbmenneske');

assert.ok(row);
assert.equal(stream.storylets.length, 14);
assert.equal(row.classification, 'ready');
assert.equal(row.role_world_status, 'role_world_complete');
assert.equal(row.role_world_path, 'data/Civication/roleWorlds/sport/sport_klubbmenneske.json');
assert.equal(row.authored_depth.max_narrative_depth, 14);
assert.deepEqual(row.evidence.exact_source_refs, [streamPath]);
assert.deepEqual(row.evidence.livelihood_templates, ['klubbmenneske_arrangementsvakt']);
assert.ok(!audit.queue.some((item) => item.key === 'sport/klubbmenneske'));
assert.equal(audit.summary.completed_life_position_role_worlds, 14);
assert.equal(audit.summary.life_position_role_world_complete, 14);
assert.equal(audit.summary.pending_ready_positions, 0);
assert.equal(audit.first_ready, null);

console.log('civication Sport Klubbmenneske readiness ok: governed depth 14 / completed / no pending-ready');
