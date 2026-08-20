'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const mappings = readJson('data/Civication/badgeRoleMappings.json');
const sportBadge = readJson('data/badges/sport.json');

const expected = new Map([
  ['naeringsliv/arbeider', 'unbound_legacy_role'],
  ['sport/sport_kaptein', 'life_position_not_job'],
  ['sport/sport_legende', 'life_position_not_job']
]);
assert.equal(policy.version, 2, 'reconciliation must not bump the career gameplay policy version');
assert.equal((policy.career_exclusions || []).length, expected.size);
assert.equal(matrix.summary.work_worlds, 88, 'canonical-category discovery inventory stays stable');
assert.equal(matrix.summary.noncareer_worlds, expected.size);
assert.equal(matrix.summary.career_worlds, matrix.summary.work_worlds - expected.size);
assert.equal(Object.values(matrix.summary.statuses).reduce((sum, value) => sum + value, 0), matrix.summary.career_worlds, 'career statuses must exclude non-career worlds');
assert.equal(matrix.summary.statuses.partial, 0, 'false non-job partial debt must be absent from career rollout');

for (const [key, classification] of expected) {
  const policyRow = policy.career_exclusions.find((row) => `${row.category}/${row.role_scope}` === key);
  const world = matrix.worlds.find((row) => row.key === key);
  const excluded = matrix.noncareer_worlds.find((row) => row.key === key);
  assert.ok(policyRow, `${key}: policy exclusion missing`);
  assert.ok(world, `${key}: discovery row missing`);
  assert.ok(excluded, `${key}: materialized noncareer row missing`);
  assert.equal(world.status, 'not_applicable');
  assert.equal(excluded.career_status, 'not_applicable');
  assert.equal(excluded.classification, classification);
  assert.ok(policyRow.authority_refs.length >= 2);
}

const arbeider = matrix.worlds.find((row) => row.key === 'naeringsliv/arbeider');
assert.deepEqual(arbeider.badge_titles, [], 'Arbeider must stay detached from Fagarbeider Badge ownership');
assert.deepEqual(arbeider.artifacts.role_models, [], 'Arbeider must stay detached from Fagarbeider roleModel ownership');
assert.deepEqual(mappings.careers.naeringsliv.roles.arbeider.badge_titles, [], 'Arbeider mapping must remain without a fabricated Badge career title');
assert.equal(mappings.careers.naeringsliv.title_to_role_scope.Fagarbeider, 'fagarbeider');

for (const label of ['Kaptein', 'Olympisk Mester', 'Idrettsstjerne', 'Idrettslegende']) {
  const tier = sportBadge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier?.life_position, `${label}: canonical life_position missing`);
  assert.equal(tier.life_position.employment_independent, true, `${label}: must remain employment-independent`);
  assert.equal(tier.career_offer, undefined, `${label}: must not gain career_offer`);
  assert.equal(tier.career_unlock, undefined, `${label}: must not gain career_unlock`);
}

console.log('✓ Career Gameplay Matrix excludes explicit non-jobs without fabricating Badge, offer or salary authority');
