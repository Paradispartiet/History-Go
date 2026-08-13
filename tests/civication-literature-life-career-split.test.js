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
assert.strictEqual(evidence.canonical_decision.life_position_tiers.length, 15);
assert.deepStrictEqual(evidence.canonical_decision.formal_employer_job_tiers, ['Redaksjonsmedarbeider', 'Redaktør (bok)']);

console.log('civication literature life-career split baseline ok');
