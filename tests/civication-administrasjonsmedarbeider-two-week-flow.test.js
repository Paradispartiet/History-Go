#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/administrasjonsmedarbeider_plan.json'), 'utf8'));
const job = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/administrasjonsmedarbeider_job.json'), 'utf8'));
const people = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json'), 'utf8'));

const WEEK_1_JOB = 'first_week_praksisfortellinger_administrasjonsmedarbeider_job';
const WEEK_1_PRIVATE = 'first_week_praksisfortellinger_administrasjonsmedarbeider_private';
const WEEK_2_JOB = 'second_week_praksisfortellinger_administrasjonsmedarbeider_job';
const WEEK_2_PRIVATE = 'second_week_praksisfortellinger_administrasjonsmedarbeider_private';

const firstTwenty = plan.sequence.slice(0, 20);
assert.strictEqual(firstTwenty.length, 20, 'administrasjonsmedarbeider plan should expose a two-week package arc');

for (const [index, step] of firstTwenty.entries()) {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep continuous order`);
  assert.strictEqual(step.type, expectedType, `step ${index + 1} should alternate job and private threads`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should not rely on fallback mail types`);
}

const expectedFamilies = [
  WEEK_1_JOB,
  WEEK_1_PRIVATE,
  WEEK_2_JOB,
  WEEK_2_PRIVATE
];
for (const familyId of expectedFamilies) {
  const catalog = familyId.includes('_private') ? people : job;
  const family = catalog.families.find(item => item.id === familyId);
  assert(family, `${familyId} should exist`);
  assert.strictEqual(family.mails.length, 5, `${familyId} should expose five main mails`);
}

assert.deepStrictEqual(plan.sequence.slice(0, 10).map(step => step.allowed_families[0]), [
  WEEK_1_JOB,
  WEEK_1_PRIVATE,
  WEEK_1_JOB,
  WEEK_1_PRIVATE,
  WEEK_1_JOB,
  WEEK_1_PRIVATE,
  WEEK_1_JOB,
  WEEK_1_PRIVATE,
  WEEK_1_JOB,
  WEEK_1_PRIVATE
], 'week one should keep the first-week administrasjonsmedarbeider families');

assert.deepStrictEqual(plan.sequence.slice(10, 20).map(step => step.allowed_families[0]), [
  WEEK_2_JOB,
  WEEK_2_PRIVATE,
  WEEK_2_JOB,
  WEEK_2_PRIVATE,
  WEEK_2_JOB,
  WEEK_2_PRIVATE,
  WEEK_2_JOB,
  WEEK_2_PRIVATE,
  WEEK_2_JOB,
  WEEK_2_PRIVATE
], 'week two should use the second-week administrasjonsmedarbeider families');

console.log('Administrasjonsmedarbeider two-week Praksisfortellinger flow OK');
