#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const read = rel => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const policy = read('data/Civication/careerGameplayPolicy.json');
const matrix = read('data/Civication/careerGameplayMatrix.json');
const closure = policy.pilot_wave_completion;

assert.equal(policy.version, 2);
assert.ok(closure, 'pilot_wave_completion must exist');
assert.equal(closure.status, 'complete');
assert.equal(closure.completion_pr, 5105);
assert.equal(closure.completed_on_main, '612ffd3ad7a4cbf54429fb259abd58a9aa24b139');
assert.equal(closure.required_pilot_status, 'playable');
assert.equal(closure.freeze_pilot_set, true);
assert.equal(closure.next_phase, 'systematic_rollout');

const expectedWorkTypes = [
  'prosjektarbeid',
  'kunnskapsarbeid',
  'publikumsarbeid',
  'menneskearbeid',
  'ledelse'
];
assert.deepEqual(closure.required_work_types, expectedWorkTypes);
assert.equal(policy.pilot_worlds.length, 5, 'pilot set is closed at five canonical work types');
assert.deepEqual(policy.pilot_worlds.map(p => p.work_type), expectedWorkTypes);
assert.equal(new Set(policy.pilot_worlds.map(p => p.work_type)).size, 5);

for (const pilot of policy.pilot_worlds) {
  const key = `${pilot.category}/${pilot.role_scope}`;
  const world = matrix.worlds.find(candidate => candidate.key === key);
  assert.ok(world, `missing pilot world ${key}`);
  assert.equal(world.status, 'playable', `${key} must remain playable after pilot closure`);
  assert.equal(world.audit.runtime_gate, true, `${key} runtime gate must remain green`);
  assert.deepEqual(world.audit.missing_components, [], `${key} must have no missing components`);
}

const referenceKeys = [
  'naeringsliv/renholder',
  'naeringsliv/ekspeditor',
  'by/by_radgiver_plan',
  'naeringsliv/controller',
  'sport/sport_utover'
];
for (const key of referenceKeys) {
  const world = matrix.worlds.find(candidate => candidate.key === key);
  assert.ok(world, `missing reference world ${key}`);
  assert.equal(world.status, 'reference_complete', `${key} must remain reference_complete`);
}

assert.equal(matrix.summary.discovered_worlds, 89, 'Discovery inventory remains complete across canonical and support namespaces');
assert.equal(matrix.summary.work_worlds, 88, 'Only canonical runtime categories count as career work worlds');
assert.equal(matrix.summary.support_worlds, 1, 'Exactly one discovered legacy support world is excluded from career rollout');
const barnehageSupport = (matrix.support_worlds || []).find(candidate => candidate.key === 'sosial_laering/barnehageassistent');
assert.ok(barnehageSupport, 'Barnehageassistent remains discoverable as legacy support content');
assert.equal(barnehageSupport.career_status, 'not_applicable');
assert.equal(barnehageSupport.content_only_life_story, true);
assert.equal(matrix.summary.statuses.reference_complete, 5);
assert.ok(matrix.summary.statuses.partial > 0 || matrix.summary.statuses.architecture_only > 0,
  'systematic rollout must still have real remaining work; closure must not fake global completion');

console.log('civication-pilot-wave-closure.test.js: PASS');
