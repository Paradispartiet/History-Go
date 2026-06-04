#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json');

const FIRST_JOB = 'first_week_praksisfortellinger_fagarbeider_job';
const FIRST_PRIVATE = 'first_week_praksisfortellinger_fagarbeider_private';
const WEEK2_JOB = 'second_week_praksisfortellinger_fagarbeider_job';
const WEEK2_PRIVATE = 'second_week_praksisfortellinger_fagarbeider_private';

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function flattenChoiceStats(choices) {
  return choices.flatMap(choice => {
    const stats = choice.effects?.stats || choice.effects || {};
    return Object.entries(stats).map(([key, value]) => ({ key, value }));
  });
}

function assertPackageMail(mail, expected) {
  assert.strictEqual(mail.role_scope, 'fagarbeider', `${mail.id} should stay scoped to fagarbeider`);
  assert.strictEqual(mail.mail_type, expected.mailType, `${mail.id} should use ${expected.mailType} mail_type`);
  assert.strictEqual(mail.mail_family, expected.family, `${mail.id} should stay in ${expected.family}`);
  assert.strictEqual(mail.channel, expected.channel, `${mail.id} should use ${expected.channel} channel`);
  assert.strictEqual(mail.messageChannel, expected.channel, `${mail.id} should use ${expected.channel} messageChannel`);
  assert.strictEqual(mail.mail_class, expected.mailClass, `${mail.id} should use ${expected.mailClass}`);
  assert(Array.isArray(mail.situation), `${mail.id} should expose a situation array`);
  assert(mail.situation.length >= expected.minSituation, `${mail.id} should have a long multi-message situation array`);
  assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should expose choices`);

  for (const choice of mail.choices) {
    assert.strictEqual(typeof choice.reply, 'string', `${mail.id} choice ${choice.id} should have reply`);
    assert(choice.reply.trim().length > 0, `${mail.id} choice ${choice.id} reply should not be empty`);
    assert(choice.effects && typeof choice.effects === 'object', `${mail.id} choice ${choice.id} should have effects`);
  }
}

function assertConsequenceThread(thread, expected) {
  assert.strictEqual(thread.role_scope, 'fagarbeider', `${thread.id} consequence should stay scoped to fagarbeider`);
  assert.strictEqual(thread.mail_type, expected.mailType, `${thread.id} consequence should use ${expected.mailType} mail_type`);
  assert.strictEqual(thread.mail_family, expected.family, `${thread.id} consequence should stay in ${expected.family}`);
  assert.strictEqual(thread.channel, expected.channel, `${thread.id} consequence should use ${expected.channel} channel`);
  assert.strictEqual(thread.messageChannel, expected.channel, `${thread.id} consequence should use ${expected.channel} messageChannel`);
  assert.strictEqual(thread.mail_class, expected.mailClass, `${thread.id} consequence should use ${expected.mailClass}`);
}

const plan = readJson(planPath);
const firstWeek = plan.sequence.slice(0, 10);
const secondWeek = plan.sequence.slice(10, 20);

assert.strictEqual(firstWeek.length, 10, 'fagarbeider first week should still exist as ten package steps');
assert.strictEqual(secondWeek.length, 10, 'fagarbeider second week should exist as ten package steps directly after week one');

firstWeek.forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? FIRST_JOB : FIRST_PRIVATE;
  assert.strictEqual(step.step, index + 1, `first-week step ${index + 1} should keep ordering`);
  assert.strictEqual(step.phase, 'intro', `first-week step ${index + 1} should stay intro`);
  assert.strictEqual(step.type, expectedType, `first-week step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `first-week step ${index + 1} should point at the first-week family`);
  assert.deepStrictEqual(step.fallback_types, [], `first-week step ${index + 1} should keep fallback out`);
});

secondWeek.forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? WEEK2_JOB : WEEK2_PRIVATE;
  assert.strictEqual(step.step, index + 11, `second-week step ${index + 11} should follow directly after week one`);
  assert.strictEqual(step.phase, 'intro', `second-week step ${index + 11} should stay intro`);
  assert.strictEqual(step.type, expectedType, `second-week step ${index + 11} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `second-week step ${index + 11} should point at the week-two family`);
  assert.deepStrictEqual(step.fallback_types, [], `second-week step ${index + 11} should keep fallback out`);
});

const jobCatalog = readJson(jobPath);
const peopleCatalog = readJson(peoplePath);
const firstJobFamily = jobCatalog.families.find(family => family.id === FIRST_JOB);
const firstPrivateFamily = peopleCatalog.families.find(family => family.id === FIRST_PRIVATE);
const jobFamily = jobCatalog.families.find(family => family.id === WEEK2_JOB);
const privateFamily = peopleCatalog.families.find(family => family.id === WEEK2_PRIVATE);

assert(firstJobFamily, 'fagarbeider first-week job family should still exist');
assert(firstPrivateFamily, 'fagarbeider first-week private family should still exist');
assert.strictEqual(firstJobFamily.mails.length, 5, 'fagarbeider first-week job family should remain intact');
assert.strictEqual(firstPrivateFamily.mails.length, 5, 'fagarbeider first-week private family should remain intact');
assert(jobFamily, 'fagarbeider week-two job family should exist');
assert(privateFamily, 'fagarbeider week-two private family should exist');
assert.strictEqual(jobFamily.mails.length, 5, 'week two should include five job threads');
assert.strictEqual(privateFamily.mails.length, 5, 'week two should include five private/personlige threads');

for (const mail of jobFamily.mails) {
  assertPackageMail(mail, { mailType: 'job', family: WEEK2_JOB, channel: 'job', mailClass: 'job_message', minSituation: 3 });
}
for (const mail of privateFamily.mails) {
  assertPackageMail(mail, { mailType: 'people', family: WEEK2_PRIVATE, channel: 'private', mailClass: 'private_message', minSituation: 2 });
}

const allChoices = [...jobFamily.mails, ...privateFamily.mails].flatMap(mail => mail.choices);
assert(allChoices.some(choice => choice.triggers_on_choice), 'at least one week-two choice should trigger a consequence thread');
assert(allChoices.some(choice => choice.next_bias?.set_flags?.length), 'at least one week-two choice should carry next_bias branch flags');

const jobThreads = new Map((jobFamily.threads || []).map(thread => [thread.id, thread]));
const privateThreads = new Map((privateFamily.threads || []).map(thread => [thread.id, thread]));
for (const choice of allChoices.filter(choice => choice.triggers_on_choice)) {
  const jobThread = jobThreads.get(choice.triggers_on_choice);
  const privateThread = privateThreads.get(choice.triggers_on_choice);
  assert(jobThread || privateThread, `${choice.triggers_on_choice} should exist as a consequence thread`);
  if (jobThread) assertConsequenceThread(jobThread, { mailType: 'job', family: WEEK2_JOB, channel: 'job', mailClass: 'job_message' });
  if (privateThread) assertConsequenceThread(privateThread, { mailType: 'people', family: WEEK2_PRIVATE, channel: 'private', mailClass: 'private_message' });
}

const allStats = flattenChoiceStats(allChoices);
assert(allStats.some(({ key, value }) => ['safety', 'quality', 'learning_progress'].includes(key) && value > 0), 'at least one choice should give safety/quality/learning_progress');
assert(allChoices.some(choice => {
  const stats = choice.effects?.stats || choice.effects || {};
  return Number(stats.speed || 0) > 0 && Number(stats.future_risk || 0) > 0;
}), 'at least one choice should give speed with future_risk');
assert(allStats.some(({ key }) => ['body_strain', 'energy', 'energy_weekend', 'overload_risk'].includes(key)), 'at least one choice should affect body_strain/energy/overload_risk');
assert(
  allStats.some(({ key }) => ['stagnation', 'stagnation_private'].includes(key)) ||
    allChoices.some(choice => /low_visibility|open_loop/i.test(JSON.stringify(choice.next_bias || {}) + String(choice.triggers_on_choice || ''))),
  'at least one choice should represent stagnation, low visibility or open loop'
);

assert(!JSON.stringify(jobFamily).includes('ekspeditor'), 'fagarbeider week-two job package should not touch ekspeditør content');
assert(!JSON.stringify(privateFamily).includes('ekspeditor'), 'fagarbeider week-two private package should not touch ekspeditør content');

console.log('Fagarbeider second-week Praksisfortellinger package checks passed.');
