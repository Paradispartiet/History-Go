#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const repoRoot = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/avdelingsleder_plan.json'), 'utf8'));
const job = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/avdelingsleder_job.json'), 'utf8'));
const people = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/avdelingsleder_people.json'), 'utf8'));
const JOB_FAMILY = 'first_week_praksisfortellinger_avdelingsleder_job';
const PRIVATE_FAMILY = 'first_week_praksisfortellinger_avdelingsleder_private';
const expected = [
  ['job_avdelingsleder_week1_monday_everything_important', 'job'],
  ['personal_avdelingsleder_week1_role_sounds_bigger', 'people'],
  ['job_avdelingsleder_week1_budget_already_spent', 'job'],
  ['personal_avdelingsleder_week1_family_thinks_power', 'people'],
  ['job_avdelingsleder_week1_sick_leave_not_number', 'job'],
  ['personal_avdelingsleder_week1_prioritizes_home', 'people'],
  ['job_avdelingsleder_week1_employee_everyone_protects', 'job'],
  ['personal_avdelingsleder_week1_reads_private_as_hr', 'people'],
  ['job_avdelingsleder_week1_first_week_department_responsibility', 'job'],
  ['personal_avdelingsleder_week1_weekend_without_leadership_meeting', 'people']
];
const jobFamily = job.families.find(f => f.id === JOB_FAMILY);
const privateFamily = people.families.find(f => f.id === PRIVATE_FAMILY);
assert(jobFamily, 'first-week avdelingsleder job family should exist');
assert(privateFamily, 'first-week avdelingsleder private family should exist');
assert.strictEqual(jobFamily.mails.length, 5, 'first package should include five job threads');
assert.strictEqual(privateFamily.mails.length, 5, 'first package should include five private threads');
for (const [index, step] of plan.sequence.slice(0, 10).entries()) {
  const type = index % 2 === 0 ? 'job' : 'people';
  const family = type === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep ordering`);
  assert.strictEqual(step.type, type, `step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [family], `step ${index + 1} should use ${family}`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should not use fallbacks`);
  const catalog = type === 'job' ? jobFamily : privateFamily;
  assert(catalog.mails.some(mail => mail.id === expected[index][0]), `${expected[index][0]} should exist`);
}
const choices = [...jobFamily.mails, ...privateFamily.mails].flatMap(mail => mail.choices || []);
for (const choice of choices) {
  assert(choice.reply, `${choice.id} should have reply text`);
  assert(choice.effects && typeof choice.effects === 'object', `${choice.id} should carry effects`);
}
console.log('Avdelingsleder first-week Praksisfortellinger package OK');
