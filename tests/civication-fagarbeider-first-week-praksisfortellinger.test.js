#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/fagarbeider_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/fagarbeider_intro_v2.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/fagarbeider_people.json');

const JOB_FAMILY = 'first_week_praksisfortellinger_fagarbeider_job';
const PRIVATE_FAMILY = 'first_week_praksisfortellinger_fagarbeider_private';

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

const plan = readJson(planPath);
const firstWeek = plan.sequence.slice(0, 10);
assert.strictEqual(firstWeek.length, 10, 'fagarbeider first week should exist as ten package steps');
firstWeek.forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep package ordering`);
  assert.strictEqual(step.phase, 'intro', `step ${index + 1} should stay in intro phase`);
  assert.strictEqual(step.type, expectedType, `step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `step ${index + 1} should point at the fagarbeider first-week family`);
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

const allChoices = [...jobFamily.mails, ...privateFamily.mails].flatMap(mail => mail.choices);
assert(allChoices.some(choice => choice.triggers_on_choice), 'at least one choice should trigger a consequence thread');
assert(allChoices.some(choice => choice.next_bias), 'at least one choice should carry next_bias');

const jobThreadIds = new Set((jobFamily.threads || []).map(thread => thread.id));
const privateThreadIds = new Set((privateFamily.threads || []).map(thread => thread.id));
for (const choice of allChoices.filter(choice => choice.triggers_on_choice)) {
  assert(jobThreadIds.has(choice.triggers_on_choice) || privateThreadIds.has(choice.triggers_on_choice), `${choice.triggers_on_choice} should exist as a consequence thread`);
}

const allStats = flattenChoiceStats(allChoices);
assert(allStats.some(({ key, value }) => ['quality', 'safety'].includes(key) && value > 0), 'at least one choice should give quality/safety');
assert(allChoices.some(choice => {
  const stats = choice.effects?.stats || choice.effects || {};
  return Number(stats.speed || 0) > 0 && Number(stats.future_risk || 0) > 0;
}), 'at least one choice should give speed with future_risk');
assert(allStats.some(({ key }) => ['body_strain', 'energy', 'energy_weekend'].includes(key)), 'at least one choice should affect body_strain/energy');
assert(allStats.some(({ key }) => ['stagnation', 'stagnation_private'].includes(key)) || allChoices.some(choice => /open_loop/i.test(choice.triggers_on_choice || '')), 'at least one choice should represent stagnation or open loop');

assert(!JSON.stringify(jobCatalog).includes('ekspeditor'), 'fagarbeider job package should not touch ekspeditør content');
assert(!JSON.stringify(peopleCatalog).includes('ekspeditor'), 'fagarbeider people package should not touch ekspeditør content');

console.log('Fagarbeider first-week praksisfortellinger OK');
