#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const badge = readJson('data/badges/litteratur.json');
const evidence = readJson('data/Civication/literatureCareerLifeEvidence.json');
const policy = readJson('data/Civication/badgeCareerAuditPolicy.json');

assert.strictEqual(badge.id, 'litteratur');
assert.strictEqual(badge.tiers.length, 17);
assert.strictEqual(badge.career_life_evidence, 'data/Civication/literatureCareerLifeEvidence.json');

const lifeOnly = [
  'Leser',
  'Aktiv leser',
  'Litteraturinteressert',
  'Etablert forfatter',
  'Prisvinnende forfatter',
  'Bestselgerforfatter',
  'Kanonisert forfatter'
];
const professionalTitles = [
  'Skribent',
  'Essayist',
  'Anmelder',
  'Litteraturkritiker',
  'Redaksjonsmedarbeider',
  'Redaktør (bok)',
  'Forfatter',
  'Poet',
  'Dramatiker'
];

assert.deepStrictEqual(evidence.canonical_decision.life_only_tiers, lifeOnly);
assert.deepStrictEqual(evidence.canonical_decision.professional_titles_not_reclassified, professionalTitles);
assert.deepStrictEqual(evidence.canonical_decision.editorial_review_left_open, ['Skald']);
assert.ok(evidence.sources.length >= 5);

for (const label of lifeOnly) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier, `${label}: canonical tier mangler`);
  assert.ok(tier.life_position, `${label}: skal være life_position`);
  assert.strictEqual(tier.life_position.employment_independent, true);
  assert.ok(tier.life_position.id);
  assert.ok(tier.life_position.description);
  assert.ok(Array.isArray(tier.life_position.hooks) && tier.life_position.hooks.length >= 3);
  assert.strictEqual(tier.career_offer, undefined);
  assert.strictEqual(tier.career_unlock, undefined);
}

for (const label of professionalTitles) {
  const tier = badge.tiers.find((candidate) => candidate.label === label);
  assert.ok(tier, `${label}: canonical profesjonstittel mangler`);
  assert.strictEqual(tier.life_position, undefined, `${label}: profesjonstittel skal ikke omklassifiseres`);
}

const skald = badge.tiers.find((tier) => tier.label === 'Skald');
assert.ok(skald);
assert.strictEqual(skald.life_position, undefined, 'Skald skal fortsatt stå åpent for editorial review');

const policyByTitle = new Map((policy.badges.litteratur || []).map((row) => [row[0], row]));
for (const label of lifeOnly) {
  const row = policyByTitle.get(label);
  assert.ok(row);
  assert.strictEqual(row[2], 'not_job');
  assert.strictEqual(row[3], 'replace');
}
for (const label of professionalTitles) {
  const row = policyByTitle.get(label);
  assert.ok(row);
  assert.strictEqual(row[2], 'direct');
  assert.strictEqual(row[3], 'keep');
}
const skaldPolicy = policyByTitle.get('Skald');
assert.ok(skaldPolicy);
assert.strictEqual(skaldPolicy[2], 'review_required');
assert.strictEqual(skaldPolicy[3], 'review');

console.log('civication literature life-status split ok: 7 life-only tiers / 9 professional titles preserved / Skald review remains explicit');
