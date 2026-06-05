#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/mellomleder_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/mellomleder_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/mellomleder_people.json');
const registryPath = path.join(repoRoot, 'data/Civication/praksisfortellinger_registry.json');

const FIRST_JOB_FAMILY = 'first_week_praksisfortellinger_mellomleder_job';
const FIRST_PRIVATE_FAMILY = 'first_week_praksisfortellinger_mellomleder_private';
const JOB_FAMILY = 'second_week_praksisfortellinger_mellomleder_job';
const PRIVATE_FAMILY = 'second_week_praksisfortellinger_mellomleder_private';

const EXPECTED_SEQUENCE = [
  ['job_mellomleder_week2_action_plan_sounds_simple', 'job'],
  ['personal_mellomleder_week2_after_promising_action', 'people'],
  ['job_mellomleder_week2_team_asks_what_changes', 'job'],
  ['personal_mellomleder_week2_friend_not_a_followup_case', 'people'],
  ['job_mellomleder_week2_numbers_become_politics', 'job'],
  ['personal_mellomleder_week2_meeting_words_at_home', 'people'],
  ['job_mellomleder_week2_thomas_followup_aftershock', 'job'],
  ['personal_mellomleder_week2_private_talk_delayed', 'people'],
  ['job_mellomleder_week2_second_week_in_the_middle', 'job'],
  ['personal_mellomleder_week2_weekend_without_buffering', 'people']
];

function readJson(filePath) {
  assert(fs.existsSync(filePath), `${path.relative(repoRoot, filePath)} should exist`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function statsFor(choice) {
  return choice.effects?.stats || choice.effects || {};
}

function assertPackageMail(mail, expected) {
  assert.strictEqual(mail.role_scope, 'mellomleder', `${mail.id} should stay scoped to mellomleder`);
  assert.strictEqual(mail.mail_type, expected.mailType, `${mail.id} should use ${expected.mailType} mail_type`);
  assert.strictEqual(mail.mail_family, expected.family, `${mail.id} should stay in ${expected.family}`);
  assert.strictEqual(mail.channel, expected.channel, `${mail.id} should use ${expected.channel} channel`);
  assert.strictEqual(mail.messageChannel, expected.channel, `${mail.id} should use ${expected.channel} messageChannel`);
  assert.strictEqual(mail.mail_class, expected.mailClass, `${mail.id} should use ${expected.mailClass}`);
  assert(Array.isArray(mail.situation), `${mail.id} should expose a situation array`);
  assert(mail.situation.length >= expected.minSituation, `${mail.id} should have enough situation messages`);
  assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should expose choices`);

  const localIds = new Set();
  for (const choice of mail.choices) {
    assert(choice.id && !localIds.has(choice.id), `${mail.id} should not duplicate local choice id ${choice.id}`);
    localIds.add(choice.id);
    assert.strictEqual(typeof choice.reply, 'string', `${mail.id} choice ${choice.id} should have reply`);
    assert(choice.reply.trim().length > 0, `${mail.id} choice ${choice.id} reply should not be empty`);
    assert(choice.effects && typeof choice.effects === 'object' && !Array.isArray(choice.effects), `${mail.id} choice ${choice.id} should have effects`);
    assert(choice.triggers_on_choice, `${mail.id} choice ${choice.id} should trigger its consequence thread`);
    assert(choice.next_bias, `${mail.id} choice ${choice.id} should carry next_bias for package continuity`);
  }
}

const plan = readJson(planPath);
const firstWeek = plan.sequence.slice(0, 10);
assert.strictEqual(firstWeek.length, 10, 'mellomleder first week should still exist as ten package steps');
firstWeek.forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? FIRST_JOB_FAMILY : FIRST_PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 1, `first-week step ${index + 1} should keep package ordering`);
  assert.strictEqual(step.type, expectedType, `first-week step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `first-week step ${index + 1} should point at the mellomleder first-week family`);
  assert.deepStrictEqual(step.fallback_types, [], `first-week step ${index + 1} should keep fallback out of package progression`);
});

const secondWeek = plan.sequence.slice(10, 20);
assert.strictEqual(secondWeek.length, 10, 'mellomleder second week should exist directly after first week as ten package steps');
secondWeek.forEach((step, index) => {
  const expectedStep = index + 11;
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, expectedStep, `week 2 step ${expectedStep} should keep package ordering`);
  assert.strictEqual(step.phase, 'intro', `week 2 step ${expectedStep} should stay in intro phase`);
  assert.strictEqual(step.type, expectedType, `week 2 step ${expectedStep} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `week 2 step ${expectedStep} should point at the mellomleder second-week family`);
  assert.deepStrictEqual(step.fallback_types, [], `week 2 step ${expectedStep} should keep fallback out of package progression`);
});

const jobCatalog = readJson(jobPath);
const peopleCatalog = readJson(peoplePath);
const jobFamily = jobCatalog.families.find(family => family.id === JOB_FAMILY);
const privateFamily = peopleCatalog.families.find(family => family.id === PRIVATE_FAMILY);
assert(jobFamily, 'job family should exist');
assert(privateFamily, 'private family should exist');
assert.strictEqual(jobFamily.mails.length, 5, 'second package should include five job threads');
assert.strictEqual(privateFamily.mails.length, 5, 'second package should include five private/personlige threads');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.length === 5, 'job family should document five job-facing week outcomes');
assert(Array.isArray(privateFamily.week_outcomes) && privateFamily.week_outcomes.some(outcome => outcome.id === 'boundary_learner_private'), 'private family should document the boundary learner outcome');

for (const mail of jobFamily.mails) {
  assertPackageMail(mail, {
    mailType: 'job',
    family: JOB_FAMILY,
    channel: 'job',
    mailClass: 'job_message',
    minSituation: 3
  });
}

for (const mail of privateFamily.mails) {
  assertPackageMail(mail, {
    mailType: 'people',
    family: PRIVATE_FAMILY,
    channel: 'private',
    mailClass: 'private_message',
    minSituation: 2
  });
}

const orderedMails = secondWeek.map((step, index) => {
  const expectedId = EXPECTED_SEQUENCE[index][0];
  const expectedType = EXPECTED_SEQUENCE[index][1];
  const family = expectedType === 'job' ? jobFamily : privateFamily;
  assert.strictEqual(step.type, expectedType, `step ${step.step} should match expected mail type for ${expectedId}`);
  return family.mails.find(mail => mail.id === expectedId);
});
assert(orderedMails.every(Boolean), 'all named second-week mails should exist');

const allChoices = [...jobFamily.mails, ...privateFamily.mails].flatMap(mail => mail.choices);
const consequenceIds = new Set([...(jobFamily.threads || []), ...(privateFamily.threads || [])].map(thread => thread.id));
for (const choice of allChoices) {
  assert(consequenceIds.has(choice.triggers_on_choice), `${choice.triggers_on_choice} should exist as a consequence thread`);
}

for (const thread of jobFamily.threads || []) {
  assert.strictEqual(thread.mail_type, 'job', `${thread.id} consequence should use job mail_type`);
  assert.strictEqual(thread.mail_family, JOB_FAMILY, `${thread.id} consequence should stay in job family`);
  assert.strictEqual(thread.channel, 'job', `${thread.id} consequence should use job channel`);
  assert.strictEqual(thread.messageChannel, 'job', `${thread.id} consequence should use job messageChannel`);
  assert.strictEqual(thread.mail_class, 'job_message', `${thread.id} consequence should use job_message mail_class`);
}
for (const thread of privateFamily.threads || []) {
  assert.strictEqual(thread.mail_type, 'people', `${thread.id} consequence should use people mail_type`);
  assert.strictEqual(thread.mail_family, PRIVATE_FAMILY, `${thread.id} consequence should stay in private family`);
  assert.strictEqual(thread.channel, 'private', `${thread.id} consequence should use private channel`);
  assert.strictEqual(thread.messageChannel, 'private', `${thread.id} consequence should use private messageChannel`);
  assert.strictEqual(thread.mail_class, 'private_message', `${thread.id} consequence should use private_message mail_class`);
}

const statKeys = new Set(allChoices.flatMap(choice => Object.keys(statsFor(choice))));
for (const expected of ['clarity', 'trust_team', 'trust_manager', 'manager_pressure', 'stress', 'quality', 'flow', 'speed', 'future_risk', 'stagnation', 'conflict', 'authority', 'energy', 'self_awareness', 'relationship_private', 'energy_weekend', 'autonomy_private']) {
  assert(statKeys.has(expected), `mellomleder week 2 package should include ${expected} as an effect signal`);
}

const registry = readJson(registryPath);
const role = registry.roles.find(item => item.role_id === 'mellomleder');
assert(role, 'registry should include mellomleder role');
const pkg = role.packages.find(item => item.package_id === 'mellomleder_week_2');
assert(pkg, 'registry should include mellomleder_week_2 package');
assert.strictEqual(pkg.step_start, 11, 'mellomleder_week_2 should start at step 11');
assert.strictEqual(pkg.step_end, 20, 'mellomleder_week_2 should end at step 20');
assert.strictEqual(pkg.job_family, JOB_FAMILY, 'mellomleder_week_2 should point at second-week job family');
assert.strictEqual(pkg.private_family, PRIVATE_FAMILY, 'mellomleder_week_2 should point at second-week private family');
assert.strictEqual(pkg.test_file, 'tests/civication-mellomleder-second-week-praksisfortellinger.test.js', 'mellomleder_week_2 should point at this test file');
assert.deepStrictEqual(role.flow_tests, ['tests/civication-mellomleder-two-week-flow.test.js'], 'mellomleder should declare the two-week-flow test after week 2');

console.log('Mellomleder second-week Praksisfortellinger package OK');
