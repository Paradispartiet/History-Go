#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/controller_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/controller_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/controller_people.json');

const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
const job = JSON.parse(fs.readFileSync(jobPath, 'utf8'));
const people = JSON.parse(fs.readFileSync(peoplePath, 'utf8'));

const JOB_FAMILY = 'second_week_praksisfortellinger_controller_job';
const PRIVATE_FAMILY = 'second_week_praksisfortellinger_controller_private';
const expected = [
  ['job_controller_week2_variance_did_not_disappear', 'job'],
  ['personal_controller_week2_documenting_a_feeling', 'people'],
  ['job_controller_week2_operations_stop_explaining', 'job'],
  ['personal_controller_week2_friend_says_you_do_not_believe_me', 'people'],
  ['job_controller_week2_periodization_or_polishing', 'job'],
  ['personal_controller_week2_auditing_own_words', 'people'],
  ['job_controller_week2_audit_trail', 'job'],
  ['personal_controller_week2_conversation_without_evidence', 'people'],
  ['job_controller_week2_numbers_as_governance', 'job'],
  ['personal_controller_week2_weekend_without_audit_trail', 'people']
];

const jobFamily = job.families.find(family => family.id === JOB_FAMILY);
const privateFamily = people.families.find(family => family.id === PRIVATE_FAMILY);
assert(jobFamily, 'second-week Controller job family should exist');
assert(privateFamily, 'second-week Controller private family should exist');
assert.strictEqual(jobFamily.mails.length, 5, 'Controller week 2 should include five job threads');
assert.strictEqual(privateFamily.mails.length, 5, 'Controller week 2 should include five private threads');

for (const [offset, step] of plan.sequence.slice(10, 20).entries()) {
  const type = offset % 2 === 0 ? 'job' : 'people';
  const familyId = type === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  const family = type === 'job' ? jobFamily : privateFamily;
  assert.strictEqual(step.step, offset + 11, `step ${offset + 11} should keep ordering`);
  assert.strictEqual(step.type, type, `step ${offset + 11} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [familyId], `step ${offset + 11} should use ${familyId}`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${offset + 11} should not use fallbacks`);
  assert(family.mails.some(mail => mail.id === expected[offset][0]), `${expected[offset][0]} should exist`);
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
      assert(choice.next_bias?.set_flags?.length, `${mail.id}/${choice.id} should set a branch flag`);
      assert(choice.triggers_on_choice, `${mail.id}/${choice.id} should trigger a consequence thread`);
      assert(consequenceIds.has(choice.triggers_on_choice), `${mail.id}/${choice.id} should target an existing consequence thread`);
    }
  }

  for (const thread of family.threads || []) {
    assert.strictEqual(thread.mail_family, family.id, `${thread.id} should stay in its Controller family`);
    assert.strictEqual(thread.role_scope, 'controller', `${thread.id} should stay scoped to Controller`);
    assert.strictEqual(thread.channel, expectedShape.channel, `${thread.id} should use the correct consequence channel`);
    assert.strictEqual(thread.messageChannel, expectedShape.channel, `${thread.id} should use the correct consequence messageChannel`);
    assert.strictEqual(thread.mail_class, expectedShape.mailClass, `${thread.id} should use the correct consequence mail_class`);
  }

  assert(choices.some(choice => Object.values(choice.effects).some(value => Number(value) > 0)), `${family.id} should include a positive effect tradeoff`);
  assert(choices.some(choice => Object.values(choice.effects).some(value => Number(value) < 0)), `${family.id} should include a negative effect tradeoff`);
}

assertFamilyShape(jobFamily, { mailType: 'job', channel: 'job', mailClass: 'job_message', minSituation: 3 });
assertFamilyShape(privateFamily, { mailType: 'people', channel: 'private', mailClass: 'private_message', minSituation: 2 });

assert(jobFamily.week_outcomes.some(outcome => outcome.id === 'precise_governance_controller_week2'), 'job week outcomes should include precise governance');
assert(privateFamily.week_outcomes.some(outcome => outcome.id === 'private_control_boundary_week2'), 'private week outcomes should include private control boundary');

execFileSync(process.execPath, ['tests/civication-praksisfortellinger-registry-audit.test.js'], {
  cwd: repoRoot,
  stdio: 'pipe'
});
execFileSync(process.execPath, ['tests/civication-praksisfortellinger-cross-role.test.js'], {
  cwd: repoRoot,
  stdio: 'pipe'
});

console.log('Controller second-week Praksisfortellinger package OK');
