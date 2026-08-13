#!/usr/bin/env node
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const badge = readJson('data/badges/litteratur.json');
const evidence = readJson('data/Civication/literatureCareerLifeEvidence.json');
const careersRaw = readJson('data/Civication/hg_careers.json');

assert.strictEqual(badge.id, 'litteratur');
assert.strictEqual(badge.tiers.length, 17);
assert.strictEqual(evidence.canonical_decision.life_position_tiers.length, 15);
assert.deepStrictEqual(evidence.canonical_decision.formal_employer_job_tiers, ['Redaksjonsmedarbeider', 'Redaktør (bok)']);

const redaksjonsmedarbeider = badge.tiers.find((tier) => tier.label === 'Redaksjonsmedarbeider');
const redaktor = badge.tiers.find((tier) => tier.label === 'Redaktør (bok)');
assert.strictEqual(redaksjonsmedarbeider.career_offer.salary_tier, 1);
assert.strictEqual(redaktor.career_offer.salary_tier, 3);

const careers = Array.isArray(careersRaw) ? careersRaw : careersRaw.careers;
const literature = careers.find((career) => career.career_id === 'litteratur');
assert.strictEqual(literature.economy.salary_by_tier['1'], 4);
assert.strictEqual(literature.economy.salary_by_tier['3'], 14);

console.log('civication literature life-career split baseline ok');
