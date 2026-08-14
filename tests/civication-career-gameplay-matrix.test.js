#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'data/Civication/careerGameplayPolicy.json'), 'utf8'));
const matrix = JSON.parse(fs.readFileSync(path.join(root, 'data/Civication/careerGameplayMatrix.json'), 'utf8'));

execFileSync(process.execPath, ['scripts/audit-civication-career-gameplay.mjs', '--check'], { cwd: root, stdio: 'pipe' });

assert.strictEqual(matrix.schema, 'civication_career_gameplay_matrix_v1');
assert.deepStrictEqual(Object.keys(matrix.summary.statuses), policy.status_order, 'matrix exposes the four canonical statuses in policy order');
assert(matrix.summary.work_worlds >= 80, 'global matrix covers work worlds, not a small hand-picked sample');
assert.strictEqual(matrix.worlds.length, matrix.summary.work_worlds, 'summary count matches work-world rows');
assert.strictEqual(new Set(matrix.worlds.map((world) => world.key)).size, matrix.worlds.length, 'one row per category/role_scope');

for (const world of matrix.worlds) {
  assert.deepStrictEqual(Object.keys(world.audit.components), policy.contract_components, `${world.key} has the full 15-component contract`);
  if (world.status === 'playable' || world.status === 'reference_complete') {
    assert(world.audit.runtime_gate, `${world.key} cannot be ${world.status} without runtime gate`);
    assert.strictEqual(world.audit.missing_components.length, 0, `${world.key} cannot be ${world.status} with missing components`);
  }
  if (world.status === 'reference_complete') {
    assert(world.audit.life_story_complete, `${world.key} reference requires Life Story`);
    assert(world.audit.practice_weeks.includes('1') && world.audit.practice_weeks.includes('2'), `${world.key} reference requires two practice weeks`);
    assert.strictEqual(world.audit.complete_components.length, policy.contract_components.length, `${world.key} reference requires every component complete`);
  }
}

for (const declared of [...policy.reference_roles, ...policy.pilot_worlds]) {
  assert(matrix.worlds.some((world) => world.key === `${declared.category}/${declared.role_scope}`), `declared work world exists: ${declared.category}/${declared.role_scope}`);
}

assert(matrix.worlds.some((world) => world.key === 'by/by_radgiver_plan'), 'shared By role_scope is canonical');
assert(!matrix.worlds.some((world) => world.key === 'by/arealplanlegger'), 'tier/roleModel slug does not duplicate shared By work world');
assert(!matrix.worlds.some((world) => /populaerkultur/.test(world.key)), 'removed legacy roleModel namespace does not become a work world');

const renholder = matrix.worlds.find((world) => world.key === 'naeringsliv/renholder');
assert(renholder, 'Renholder reference work world exists');
assert.strictEqual(renholder.status, 'reference_complete', 'Renholder is the first complete gameplay reference');
assert.strictEqual(renholder.audit.components.authority.level, 'complete', 'Renholder authority boundary is machine-auditable');
assert.strictEqual(renholder.audit.complete_components.length, policy.contract_components.length, 'Renholder completes all 15 contract components');

console.log(`PASS: Career Gameplay Matrix v1 covers ${matrix.worlds.length} canonical work worlds with a deterministic 15-component gate.`);
