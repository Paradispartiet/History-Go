#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const repoRoot = path.resolve(__dirname, '..');
function read(rel) { return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), 'utf8')); }
const plan = read('data/Civication/mailPlans/naeringsliv/avdelingsleder_plan.json');
const job = read('data/Civication/mailFamilies/naeringsliv/job/avdelingsleder_job.json');
const people = read('data/Civication/mailFamilies/naeringsliv/people/avdelingsleder_people.json');
const families = [...job.families, ...people.families].filter(family => family.id.includes('praksisfortellinger_avdelingsleder'));
assert.strictEqual(plan.sequence.slice(0, 20).length, 20, 'two avdelingsleder package weeks should occupy steps 1-20');
plan.sequence.slice(0, 20).forEach((step, index) => {
  assert.strictEqual(step.step, index + 1, `package step ${index + 1} should be ordered`);
  assert.strictEqual(step.type, index % 2 === 0 ? 'job' : 'people', `package step ${index + 1} should alternate job/people`);
  assert.strictEqual(step.fallback_types.length, 0, `package step ${index + 1} should not fall back`);
});
const allMails = families.flatMap(family => (family.mails || []).map(mail => ({ ...mail, __family: family.id })));
assert.strictEqual(allMails.length, 20, 'two-week avdelingsleder flow should expose twenty package mails');
const allChoices = allMails.flatMap(mail => (mail.choices || []).map(choice => ({ ...choice, __mail: mail })));
const flags = new Set(allChoices.flatMap(choice => choice.next_bias?.set_flags || []));
for (const expected of ['job_avdelingsleder_week2_responsible_department_leader', 'job_avdelingsleder_week2_budget_delivery_leader', 'personal_avdelingsleder_week2_leader_free_day']) {
  assert(flags.has(expected.replace(/^job_/, '').replace(/^personal_/, '')) || flags.has(expected), `${expected} should be represented as a flow flag`);
}
console.log('Avdelingsleder two-week Praksisfortellinger flow OK');
