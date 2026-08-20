#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const policy = JSON.parse(fs.readFileSync(path.join(root, 'data/Civication/careerGameplayPolicy.json'), 'utf8'));
const categoryContract = JSON.parse(fs.readFileSync(path.join(root, 'data/categories/category_contract.json'), 'utf8'));
const matrix = JSON.parse(fs.readFileSync(path.join(root, 'data/Civication/careerGameplayMatrix.json'), 'utf8'));

execFileSync(process.execPath, ['scripts/audit-civication-career-gameplay.mjs', '--check'], { cwd: root, stdio: 'pipe' });

assert.strictEqual(matrix.schema, 'civication_career_gameplay_matrix_v1');
assert.deepStrictEqual(Object.keys(matrix.summary.statuses), policy.status_order, 'matrix exposes the four canonical statuses in policy order');
assert(matrix.summary.work_worlds >= 80, 'global matrix covers work worlds, not a small hand-picked sample');
assert.strictEqual(matrix.worlds.length, matrix.summary.work_worlds, 'summary count matches work-world rows');
assert.strictEqual(new Set(matrix.worlds.map((world) => world.key)).size, matrix.worlds.length, 'one row per category/role_scope');

const canonicalCategories = new Set(categoryContract.runtimeCategories || []);
assert(matrix.worlds.every((world) => canonicalCategories.has(world.category)), 'career matrix contains only canonical runtime categories');
assert(Array.isArray(matrix.support_worlds), 'matrix exposes noncanonical support worlds separately');
assert.strictEqual(matrix.summary.support_worlds, matrix.support_worlds.length, 'support-world summary matches support rows');
assert(Array.isArray(matrix.noncareer_worlds), 'matrix exposes canonical non-career worlds separately');
assert.strictEqual(matrix.summary.noncareer_worlds, matrix.noncareer_worlds.length, 'noncareer summary matches noncareer rows');
assert.strictEqual(matrix.summary.career_worlds, matrix.summary.work_worlds - matrix.summary.noncareer_worlds, 'career-world count excludes only explicit canonical non-career worlds');
assert.strictEqual(Object.values(matrix.summary.statuses).reduce((sum, value) => sum + value, 0), matrix.summary.career_worlds, 'career status counts cover exactly the rollout-eligible career worlds');
assert(!matrix.worlds.some((world) => world.key === 'sosial_laering/barnehageassistent'), 'legacy sosial_laering is excluded from canonical career rollout');
const barnehageSupport = matrix.support_worlds.find((world) => world.key === 'sosial_laering/barnehageassistent');
assert(barnehageSupport, 'Barnehageassistent remains visible as support content');
assert.strictEqual(barnehageSupport.career_status, 'not_applicable', 'Barnehageassistent does not receive a fabricated career status');
assert.strictEqual(barnehageSupport.reason, 'content_only_legacy_namespace', 'Barnehageassistent authority follows its content-only Life Story binding');
assert.strictEqual(barnehageSupport.content_only_life_story, true, 'Barnehageassistent remains content-only');

for (const [key, classification] of [
  ['naeringsliv/arbeider', 'unbound_legacy_role'],
  ['sport/sport_kaptein', 'life_position_not_job'],
  ['sport/sport_legende', 'life_position_not_job']
]) {
  const world = matrix.worlds.find((candidate) => candidate.key === key);
  const excluded = matrix.noncareer_worlds.find((candidate) => candidate.key === key);
  assert(world, `${key} remains in the canonical-category discovery inventory`);
  assert(excluded, `${key} is explicit canonical non-career content`);
  assert.strictEqual(world.status, 'not_applicable', `${key} must not receive a fabricated career status`);
  assert.strictEqual(excluded.career_status, 'not_applicable');
  assert.strictEqual(excluded.classification, classification);
}

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

console.log(`PASS: Career Gameplay Matrix v1 covers ${matrix.worlds.length} canonical career worlds and ${matrix.support_worlds.length} support worlds with a deterministic 15-component gate.`);
