#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const badge = readJson('data/badges/litteratur.json');
const evidence = readJson('data/Civication/literatureCareerLifeEvidence.json');

assert.strictEqual(badge.id, 'litteratur');
assert.strictEqual(badge.tiers.length, 17);
assert.strictEqual(badge.career_life_evidence, 'data/Civication/literatureCareerLifeEvidence.json');

const lifePositions = [
  'Leser',
  'Aktiv leser',
  'Litteraturinteressert',
  'Skribent',
  'Essayist',
  'Anmelder',
  'Litteraturkritiker',
  'Forfatter',
  'Etablert forfatter',
  'Poet',
  'Dramatiker',
  'Prisvinnende forfatter',
  'Bestselgerforfatter',
  'Kanonisert forfatter',
  'Skald'
];
const employerJobs = ['Redaksjonsmedarbeider', 'Redaktør (bok)'];
const professionalPractices = [
  'Skribent', 'Essayist', 'Anmelder', 'Litteraturkritiker', 'Forfatter', 'Poet', 'Dramatiker'
];

assert.deepStrictEqual(evidence.canonical_decision.life_position_tiers, lifePositions);
assert.deepStrictEqual(evidence.canonical_decision.professional_practice_life_positions, professionalPractices);
assert.deepStrictEqual(evidence.canonical_decision.formal_employer_job_tiers, employerJobs);
assert.deepStrictEqual(evidence.canonical_decision.editorial_review_left_open, []);
assert.ok(evidence.sources.length >= 5);

for (const label of lifePositions) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier, `${label}: canonical tier mangler`);
  assert.ok(tier.life_position, `${label}: skal være life_position`);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.ok(tier.life_position.id);
  assert.strictEqual(tier.career_offer, undefined);
  assert.strictEqual(tier.career_unlock, undefined);
}

for (const label of professionalPractices) {
  const bindings = evidence.livelihood_bindings.by_life_position[label];
  assert.ok(Array.isArray(bindings) && bindings.length, `${label}: levevei-kobling mangler`);
}

for (const label of employerJobs) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier, `${label}: canonical jobb-tier mangler`);
  assert.strictEqual(tier.life_position, undefined);
  assert.strictEqual(tier.career_offer?.policy, 'direct');
  assert.ok(Number.isInteger(tier.career_offer?.salary_tier));
}

const skald = badge.tiers.find((tier) => tier.label === 'Skald');
assert.strictEqual(skald.life_position.kind, 'historical_stylistic_identity');

console.log('civication literature life-status split ok: 15 life positions / 2 employer jobs / no editorial review debt');
