#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/formann_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/formann_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/formann_people.json');

const JOB_FAMILY = 'first_week_praksisfortellinger_formann_job';
const PRIVATE_FAMILY = 'first_week_praksisfortellinger_formann_private';

function readJson(filePath) {
  assert(fs.existsSync(filePath), `${path.relative(repoRoot, filePath)} should exist`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function statsFor(choice) {
  return choice.effects?.stats || choice.effects || {};
}

function flattenChoiceStats(choices) {
  return choices.flatMap(choice => Object.entries(statsFor(choice)).map(([key, value]) => ({ key, value })));
}

function assertPackageMail(mail, expected) {
  assert.strictEqual(mail.role_scope, 'formann', `${mail.id} should stay scoped to formann`);
  assert.strictEqual(mail.mail_type, expected.mailType, `${mail.id} should use ${expected.mailType} mail_type`);
  assert.strictEqual(mail.mail_family, expected.family, `${mail.id} should stay in ${expected.family}`);
  assert.strictEqual(mail.channel, expected.channel, `${mail.id} should use ${expected.channel} channel`);
  assert.strictEqual(mail.messageChannel, expected.channel, `${mail.id} should use ${expected.channel} messageChannel`);
  assert.strictEqual(mail.mail_class, expected.mailClass, `${mail.id} should use ${expected.mailClass}`);
  assert(Array.isArray(mail.situation), `${mail.id} should expose a situation array`);
  assert(mail.situation.length >= expected.minSituation, `${mail.id} should have a long multi-message situation array`);
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
assert.strictEqual(firstWeek.length, 10, 'formann first week should exist as ten package steps');
firstWeek.forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep package ordering`);
  assert.strictEqual(step.phase, 'intro', `step ${index + 1} should stay in intro phase`);
  assert.strictEqual(step.type, expectedType, `step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `step ${index + 1} should point at the formann first-week family`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should keep fallback out of package progression`);
});
assert(plan.sequence.length > 10, 'existing formann progression should be preserved after the first package');
assert(plan.sequence.slice(10).some(step => (step.allowed_families || []).includes('fordeling_av_skift')), 'original formann content should remain after package steps');

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

const allMails = [...jobFamily.mails, ...privateFamily.mails];
const allChoices = allMails.flatMap(mail => mail.choices);
assert(allChoices.some(choice => choice.triggers_on_choice), 'at least one choice should trigger a consequence thread');
assert(allChoices.some(choice => choice.next_bias), 'at least one choice should carry next_bias');

const jobThreadIds = new Set((jobFamily.threads || []).map(thread => thread.id));
const privateThreadIds = new Set((privateFamily.threads || []).map(thread => thread.id));
for (const choice of allChoices.filter(choice => choice.triggers_on_choice)) {
  assert(jobThreadIds.has(choice.triggers_on_choice) || privateThreadIds.has(choice.triggers_on_choice), `${choice.triggers_on_choice} should exist as a consequence thread`);
}

for (const thread of jobFamily.threads || []) {
  assert.strictEqual(thread.mail_type, 'job', `${thread.id} consequence should use job mail_type`);
  assert.strictEqual(thread.channel, 'job', `${thread.id} consequence should use job channel`);
  assert.strictEqual(thread.messageChannel, 'job', `${thread.id} consequence should use job messageChannel`);
  assert.strictEqual(thread.mail_class, 'job_message', `${thread.id} consequence should use job_message mail_class`);
}
for (const thread of privateFamily.threads || []) {
  assert.strictEqual(thread.mail_type, 'people', `${thread.id} consequence should use people mail_type`);
  assert.strictEqual(thread.channel, 'private', `${thread.id} consequence should use private channel`);
  assert.strictEqual(thread.messageChannel, 'private', `${thread.id} consequence should use private messageChannel`);
  assert.strictEqual(thread.mail_class, 'private_message', `${thread.id} consequence should use private_message mail_class`);
}

const allStats = flattenChoiceStats(allChoices);
assert(allStats.some(({ key, value }) => ['team_trust', 'authority', 'safety'].includes(key) && value > 0), 'at least one choice should give team_trust/authority/safety');
assert(allChoices.some(choice => {
  const stats = statsFor(choice);
  return (Number(stats.flow || 0) > 0 || Number(stats.speed || 0) > 0)
    && (Number(stats.future_risk || 0) > 0 || Number(stats.body_strain_team || 0) > 0);
}), 'at least one choice should give flow/speed with future_risk/body_strain_team');
assert(allStats.some(({ key, value }) => key === 'conflict' && value !== 0) || allStats.some(({ key, value }) => key === 'authority' && value > 0), 'at least one choice should give conflict or hard authority');
assert(allStats.some(({ key }) => ['stagnation', 'stagnation_private'].includes(key)) || allChoices.some(choice => /avoided_authority/i.test(JSON.stringify(choice.next_bias || {}))), 'at least one choice should represent stagnation or avoided authority');

assert(jobFamily.mails.every(mail => mail.channel === 'job' && mail.mail_class === 'job_message'), 'jobmail should classify as job');
assert(privateFamily.mails.every(mail => mail.channel === 'private' && mail.mail_class === 'private_message'), 'private/personlige mails should classify as private');
assert(!JSON.stringify(jobCatalog).includes('ekspeditor'), 'formann job package should not touch ekspeditør content');
assert(!JSON.stringify(peopleCatalog).includes('ekspeditor'), 'formann private package should not touch ekspeditør content');

execFileSync(process.execPath, [path.join(repoRoot, 'tests/civication-praksisfortellinger-registry-audit.test.js')], { stdio: 'inherit' });
execFileSync(process.execPath, [path.join(repoRoot, 'tests/civication-praksisfortellinger-cross-role.test.js')], { stdio: 'inherit' });
execFileSync(process.execPath, [path.join(repoRoot, 'tests/civication-first-week-praksisfortellinger.test.js')], { stdio: 'inherit' });
execFileSync(process.execPath, [path.join(repoRoot, 'tests/civication-fagarbeider-first-week-praksisfortellinger.test.js')], { stdio: 'inherit' });

console.log('civication formann first week praksisfortellinger ok');
