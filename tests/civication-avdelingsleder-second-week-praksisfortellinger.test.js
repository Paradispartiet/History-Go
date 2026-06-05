#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/avdelingsleder_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/avdelingsleder_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/avdelingsleder_people.json');
const registryPath = path.join(repoRoot, 'data/Civication/praksisfortellinger_registry.json');

const FIRST_JOB_FAMILY = 'first_week_praksisfortellinger_avdelingsleder_job';
const FIRST_PRIVATE_FAMILY = 'first_week_praksisfortellinger_avdelingsleder_private';
const JOB_FAMILY = 'second_week_praksisfortellinger_avdelingsleder_job';
const PRIVATE_FAMILY = 'second_week_praksisfortellinger_avdelingsleder_private';

const EXPECTED_SEQUENCE = [
  ['job_avdelingsleder_week2_measures_must_mean_something', 'job'],
  ['personal_avdelingsleder_week2_after_priorities', 'people'],
  ['job_avdelingsleder_week2_budget_cut_moves_cost', 'job'],
  ['personal_avdelingsleder_week2_home_resource_meeting', 'people'],
  ['job_avdelingsleder_week2_ida_says_it', 'job'],
  ['personal_avdelingsleder_week2_friend_not_key_person', 'people'],
  ['job_avdelingsleder_week2_region_demands_steering', 'job'],
  ['personal_avdelingsleder_week2_everything_needs_alignment', 'people'],
  ['job_avdelingsleder_week2_second_week_department_responsibility', 'job'],
  ['personal_avdelingsleder_week2_weekend_without_department', 'people']
];

function readJson(filePath) {
  assert(fs.existsSync(filePath), `${path.relative(repoRoot, filePath)} should exist`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function statsFor(choice) {
  return choice.effects?.stats || choice.effects || {};
}

function assertPackageMail(mail, expected) {
  assert.strictEqual(mail.role_scope, 'avdelingsleder', `${mail.id} should stay scoped to avdelingsleder`);
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
assert.strictEqual(firstWeek.length, 10, 'avdelingsleder first week should still exist as ten package steps');
firstWeek.forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? FIRST_JOB_FAMILY : FIRST_PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 1, `first-week step ${index + 1} should keep package ordering`);
  assert.strictEqual(step.type, expectedType, `first-week step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `first-week step ${index + 1} should point at the avdelingsleder first-week family`);
  assert.deepStrictEqual(step.fallback_types, [], `first-week step ${index + 1} should keep fallback out of package progression`);
});

const secondWeek = plan.sequence.slice(10, 20);
assert.strictEqual(secondWeek.length, 10, 'avdelingsleder second week should exist directly after first week as ten package steps');
secondWeek.forEach((step, index) => {
  const expectedStep = index + 11;
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, expectedStep, `week 2 step ${expectedStep} should keep package ordering`);
  assert.strictEqual(step.phase, 'intro', `week 2 step ${expectedStep} should stay in intro phase`);
  assert.strictEqual(step.type, expectedType, `week 2 step ${expectedStep} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `week 2 step ${expectedStep} should point at the avdelingsleder second-week family`);
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
assert(Array.isArray(privateFamily.week_outcomes) && privateFamily.week_outcomes.some(outcome => outcome.id === 'private_leadership_boundary_week2'), 'private family should document the private boundary outcome');

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
for (const expected of ['clarity', 'team_trust', 'manager_trust', 'manager_pressure', 'budget_clarity', 'budget_control', 'sickness_risk', 'quality', 'future_risk', 'stagnation', 'authority', 'conflict', 'delivery', 'fairness', 'stress', 'relationship_sara', 'relationship_jonas', 'relationship_private', 'energy_weekend', 'autonomy_private', 'decision_fatigue']) {
  assert(statKeys.has(expected), `avdelingsleder week 2 package should include ${expected} as an effect signal`);
}

const registry = readJson(registryPath);
const role = registry.roles.find(item => item.role_id === 'avdelingsleder');
assert(role, 'registry should include avdelingsleder role');
const pkg = role.packages.find(item => item.package_id === 'avdelingsleder_week_2');
assert(pkg, 'registry should include avdelingsleder_week_2 package');
assert.strictEqual(pkg.step_start, 11, 'avdelingsleder_week_2 should start at step 11');
assert.strictEqual(pkg.step_end, 20, 'avdelingsleder_week_2 should end at step 20');
assert.strictEqual(pkg.job_family, JOB_FAMILY, 'avdelingsleder_week_2 should point at second-week job family');
assert.strictEqual(pkg.private_family, PRIVATE_FAMILY, 'avdelingsleder_week_2 should point at second-week private family');
assert.strictEqual(pkg.test_file, 'tests/civication-avdelingsleder-second-week-praksisfortellinger.test.js', 'avdelingsleder_week_2 should point at this test file');
assert.deepStrictEqual(role.flow_tests, ['tests/civication-avdelingsleder-two-week-flow.test.js'], 'avdelingsleder should declare the two-week-flow test after week 2');

console.log('Avdelingsleder second-week Praksisfortellinger package OK');
