#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json'), 'utf8'));

const FIRST_JOB = 'first_week_praksisfortellinger_lager_og_driftsmedarbeider_job';
const FIRST_PRIVATE = 'first_week_praksisfortellinger_lager_og_driftsmedarbeider_private';
const SECOND_JOB = 'second_week_praksisfortellinger_lager_og_driftsmedarbeider_job';
const SECOND_PRIVATE = 'second_week_praksisfortellinger_lager_og_driftsmedarbeider_private';

assert.strictEqual(plan.sequence.length, 20, 'lager plan should expose exactly two package weeks');
plan.sequence.slice(0, 20).forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const firstWeek = index < 10;
  const expectedFamily = firstWeek
    ? (expectedType === 'job' ? FIRST_JOB : FIRST_PRIVATE)
    : (expectedType === 'job' ? SECOND_JOB : SECOND_PRIVATE);
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep one-based ordering`);
  assert.strictEqual(step.type, expectedType, `step ${index + 1} should alternate job/people`);
  assert.strictEqual(step.phase, firstWeek ? 'intro' : 'mid', `step ${index + 1} should use the expected phase`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `step ${index + 1} should point at ${expectedFamily}`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should not use fallbacks`);
});

console.log('civication lager- og driftsmedarbeider two-week praksisfortellinger flow ok');
