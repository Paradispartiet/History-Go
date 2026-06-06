#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/controller_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/controller_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/controller_people.json');

assert(fs.existsSync(planPath), 'controller_plan.json should exist');
assert(fs.existsSync(jobPath), 'controller_job.json should exist');
assert(fs.existsSync(peoplePath), 'controller_people.json should exist');

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const job = JSON.parse(fs.readFileSync(jobPath, 'utf8'));
const people = JSON.parse(fs.readFileSync(peoplePath, 'utf8'));
const JOB_FAMILY = 'first_week_praksisfortellinger_controller_job';
const PRIVATE_FAMILY = 'first_week_praksisfortellinger_controller_private';
const expected = [
  ['job_controller_week1_month_report_before_explanation', 'job'],
  ['personal_controller_week1_counting_at_home', 'people'],
  ['job_controller_week1_reconciliation_almost_matches', 'job'],
  ['personal_controller_week1_friend_not_controlled', 'people'],
  ['job_controller_week1_operations_explains_variance', 'job'],
  ['personal_controller_week1_pattern_in_conversation', 'people'],
  ['job_controller_week1_forecast_everyone_wants_certain', 'job'],
  ['personal_controller_week1_dinner_as_spreadsheet', 'people'],
  ['job_controller_week1_numbers_as_responsibility', 'job'],
  ['personal_controller_week1_weekend_without_variance', 'people']
];

const jobFamily = job.families.find(family => family.id === JOB_FAMILY);
const privateFamily = people.families.find(family => family.id === PRIVATE_FAMILY);
assert(jobFamily, 'first-week Controller job family should exist');
assert(privateFamily, 'first-week Controller private family should exist');
assert.strictEqual(jobFamily.mails.length, 5, 'Controller week 1 should include five job threads');
assert.strictEqual(privateFamily.mails.length, 5, 'Controller week 1 should include five private threads');

for (const [index, step] of plan.sequence.slice(0, 10).entries()) {
  const type = index % 2 === 0 ? 'job' : 'people';
  const familyId = type === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  const family = type === 'job' ? jobFamily : privateFamily;
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep ordering`);
  assert.strictEqual(step.type, type, `step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [familyId], `step ${index + 1} should use ${familyId}`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should not use fallbacks`);
  assert(family.mails.some(mail => mail.id === expected[index][0]), `${expected[index][0]} should exist`);
}

function assertFamilyShape(family, expectedShape) {
  const consequenceIds = new Set((family.threads || []).map(thread => thread.id));
  const choices = family.mails.flatMap(mail => mail.choices || []);

  for (const mail of family.mails) {
    assert.strictEqual(mail.mail_type, expectedShape.mailType, `${mail.id} should use the correct mail_type`);
    assert.strictEqual(mail.mail_family, family.id, `${mail.id} should stay in its Controller family`);
    assert.strictEqual(mail.role_scope, 'controller', `${mail.id} should stay scoped to Controller`);
    assert.strictEqual(mail.channel, expectedShape.channel, `${mail.id} should use the correct channel`);
    assert.strictEqual(mail.messageChannel, expectedShape.channel, `${mail.id} should use the correct messageChannel`);
    assert.strictEqual(mail.mail_class, expectedShape.mailClass, `${mail.id} should use the correct mail_class`);
    assert(Array.isArray(mail.situation) && mail.situation.length >= expectedShape.minSituation, `${mail.id} should have a long multi-message situation`);
    assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should have choices`);

    for (const choice of mail.choices) {
      assert.strictEqual(typeof choice.reply, 'string', `${mail.id}/${choice.id} should have reply text`);
      assert(choice.reply.trim(), `${mail.id}/${choice.id} reply should not be empty`);
      assert(choice.effects && typeof choice.effects === 'object' && !Array.isArray(choice.effects), `${mail.id}/${choice.id} should have effects`);
      if (choice.triggers_on_choice) {
        assert(consequenceIds.has(choice.triggers_on_choice), `${mail.id}/${choice.id} should target an existing consequence thread`);
      }
    }
  }

  for (const thread of family.threads || []) {
    assert.strictEqual(thread.mail_family, family.id, `${thread.id} should stay in its Controller family`);
    assert.strictEqual(thread.role_scope, 'controller', `${thread.id} should stay scoped to Controller`);
    assert.strictEqual(thread.channel, expectedShape.channel, `${thread.id} should use the correct consequence channel`);
    assert.strictEqual(thread.messageChannel, expectedShape.channel, `${thread.id} should use the correct consequence messageChannel`);
    assert.strictEqual(thread.mail_class, expectedShape.mailClass, `${thread.id} should use the correct consequence mail_class`);
  }

  assert(choices.some(choice => choice.next_bias), `${family.id} should include at least one next_bias`);
  assert(choices.some(choice => choice.triggers_on_choice), `${family.id} should include at least one triggers_on_choice`);
}

assertFamilyShape(jobFamily, { mailType: 'job', channel: 'job', mailClass: 'job_message', minSituation: 3 });
assertFamilyShape(privateFamily, { mailType: 'people', channel: 'private', mailClass: 'private_message', minSituation: 2 });

for (const legacyFamilyId of ['avstemming_og_rapport', 'prognose_og_budsjett']) {
  const legacyFamily = job.families.find(family => family.id === legacyFamilyId);
  assert(legacyFamily, `${legacyFamilyId} should still be present`);
  assert(Array.isArray(legacyFamily.mails) && legacyFamily.mails.length > 0, `${legacyFamilyId} should retain its full non-placeholder content`);
  assert(legacyFamily.mails.every(mail => Array.isArray(mail.situation) && mail.situation.length > 1), `${legacyFamilyId} should retain substantive situations`);
  assert(legacyFamily.mails.every(mail => Array.isArray(mail.choices) && mail.choices.length > 1), `${legacyFamilyId} should retain substantive choices`);
}

execFileSync(process.execPath, ['tests/civication-praksisfortellinger-registry-audit.test.js'], {
  cwd: repoRoot,
  stdio: 'pipe'
});
execFileSync(process.execPath, ['tests/civication-praksisfortellinger-cross-role.test.js'], {
  cwd: repoRoot,
  stdio: 'pipe'
});

console.log('Controller first-week Praksisfortellinger package OK');
