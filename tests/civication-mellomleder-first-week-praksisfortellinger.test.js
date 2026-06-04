#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/mellomleder_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/mellomleder_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/mellomleder_people.json');

const JOB_FAMILY = 'first_week_praksisfortellinger_mellomleder_job';
const PRIVATE_FAMILY = 'first_week_praksisfortellinger_mellomleder_private';

const EXPECTED_SEQUENCE = [
  ['job_mellomleder_week1_first_monday_report', 'job'],
  ['personal_mellomleder_week1_role_hard_to_explain', 'people'],
  ['job_mellomleder_week1_capacity_not_in_sheet', 'job'],
  ['personal_mellomleder_week1_friend_needs_clear_answer', 'people'],
  ['job_mellomleder_week1_peace_below_speed_above', 'job'],
  ['personal_mellomleder_week1_dinner_as_status_meeting', 'people'],
  ['job_mellomleder_week1_difficult_feedback', 'job'],
  ['personal_mellomleder_week1_too_polished_message', 'people'],
  ['job_mellomleder_week1_first_week_in_the_middle', 'job'],
  ['personal_mellomleder_week1_weekend_without_report', 'people']
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
  }
}

const plan = readJson(planPath);
const firstWeek = plan.sequence.slice(0, 10);
assert.strictEqual(firstWeek.length, 10, 'mellomleder first week should exist as ten package steps');
firstWeek.forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep package ordering`);
  assert.strictEqual(step.phase, 'intro', `step ${index + 1} should stay in intro phase`);
  assert.strictEqual(step.type, expectedType, `step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `step ${index + 1} should point at the mellomleder first-week family`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should keep fallback out of package progression`);
});

const jobCatalog = readJson(jobPath);
const peopleCatalog = readJson(peoplePath);
const jobFamily = jobCatalog.families.find(family => family.id === JOB_FAMILY);
const privateFamily = peopleCatalog.families.find(family => family.id === PRIVATE_FAMILY);
assert(jobFamily, 'job family should exist');
assert(privateFamily, 'private family should exist');
assert.strictEqual(jobFamily.mails.length, 5, 'package should include five job threads');
assert.strictEqual(privateFamily.mails.length, 5, 'package should include five private/personlige threads');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.length === 5, 'job family should document five week outcomes');
assert(Array.isArray(privateFamily.week_outcomes) && privateFamily.week_outcomes.length === 5, 'private family should document five week outcomes');

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

const orderedMails = firstWeek.map((step, index) => {
  const expectedType = EXPECTED_SEQUENCE[index][1];
  const family = expectedType === 'job' ? jobFamily : privateFamily;
  return family.mails.find(mail => mail.id === EXPECTED_SEQUENCE[index][0]);
});
assert(orderedMails.every(Boolean), 'all named first-week mails should exist');

const allChoices = [...jobFamily.mails, ...privateFamily.mails].flatMap(mail => mail.choices);
assert(allChoices.some(choice => choice.triggers_on_choice), 'at least one choice should trigger a consequence thread');
assert(allChoices.some(choice => choice.next_bias), 'at least one choice should carry next_bias');

const jobThreadIds = new Set((jobFamily.threads || []).map(thread => thread.id));
const privateThreadIds = new Set((privateFamily.threads || []).map(thread => thread.id));
for (const choice of allChoices.filter(choice => choice.triggers_on_choice)) {
  assert(jobThreadIds.has(choice.triggers_on_choice) || privateThreadIds.has(choice.triggers_on_choice), `${choice.triggers_on_choice} should exist as a consequence thread`);
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
for (const expected of ['clarity', 'trust_team', 'trust_manager', 'team_trust', 'manager_pressure', 'stress', 'quality', 'flow', 'speed', 'future_risk', 'stagnation', 'conflict', 'authority', 'decision_fatigue', 'energy']) {
  assert(statKeys.has(expected), `mellomleder package should include ${expected} as an effect signal`);
}

console.log('Mellomleder first-week Praksisfortellinger package OK');
