#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/ekspeditor_plan.json'), 'utf8'));

const FIRST_JOB = 'first_week_praksisfortellinger_ekspeditor_job';
const FIRST_PRIVATE = 'first_week_praksisfortellinger_ekspeditor_private';
const SECOND_JOB = 'second_week_praksisfortellinger_ekspeditor_job';
const SECOND_PRIVATE = 'second_week_praksisfortellinger_ekspeditor_private';

assert(plan.sequence.length > 20, 'ekspeditor plan should retain retail progression after two package weeks');
plan.sequence.slice(0, 20).forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const firstWeek = index < 10;
  const expectedFamily = firstWeek
    ? (expectedType === 'job' ? FIRST_JOB : FIRST_PRIVATE)
    : (expectedType === 'job' ? SECOND_JOB : SECOND_PRIVATE);
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep one-based ordering`);
  assert.strictEqual(step.type, expectedType, `step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `step ${index + 1} should point at ${expectedFamily}`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should not use fallbacks`);
});

assert(plan.sequence.slice(20).some(step => (step.allowed_families || []).includes('kasse_og_pris')), 'retail kasse_og_pris progression should follow the two-week package');
assert(plan.sequence.slice(20).some(step => (step.allowed_families || []).includes('apning_og_lukking')), 'opening/closing progression should still exist after the packages');

console.log('civication ekspeditor two-week praksisfortellinger flow ok');
