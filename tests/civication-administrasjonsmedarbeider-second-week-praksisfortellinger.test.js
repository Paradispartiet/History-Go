#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/administrasjonsmedarbeider_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/administrasjonsmedarbeider_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json');

const JOB_FAMILY = 'second_week_praksisfortellinger_administrasjonsmedarbeider_job';
const PRIVATE_FAMILY = 'second_week_praksisfortellinger_administrasjonsmedarbeider_private';
const expectedOrder = [
  ['job_administrasjonsmedarbeider_week2_temporary_became_permanent', 'job'],
  ['personal_administrasjonsmedarbeider_week2_following_up_the_unsaid', 'people'],
  ['job_administrasjonsmedarbeider_week2_case_without_owner', 'job'],
  ['personal_administrasjonsmedarbeider_week2_friend_no_status_update', 'people'],
  ['job_administrasjonsmedarbeider_week2_template_everyone_misuses', 'job'],
  ['personal_administrasjonsmedarbeider_week2_love_as_routine', 'people'],
  ['job_administrasjonsmedarbeider_week2_documentation_hides_point', 'job'],
  ['personal_administrasjonsmedarbeider_week2_conversation_without_minutes', 'people'],
  ['job_administrasjonsmedarbeider_week2_business_memory_second_week', 'job'],
  ['personal_administrasjonsmedarbeider_week2_weekend_without_followup', 'people']
];

function readJson(filePath) {
  assert(fs.existsSync(filePath), `${path.relative(repoRoot, filePath)} should exist`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function statsFor(choice) {
  return choice.effects?.stats || choice.effects || {};
}

function assertPackageMail(mail, expected) {
  assert.strictEqual(mail.role_scope, 'administrasjonsmedarbeider', `${mail.id} should stay scoped to administrasjonsmedarbeider`);
  assert.strictEqual(mail.mail_type, expected.mailType, `${mail.id} should use ${expected.mailType}`);
  assert.strictEqual(mail.mail_family, expected.family, `${mail.id} should stay in ${expected.family}`);
  assert.strictEqual(mail.channel, expected.channel, `${mail.id} should use ${expected.channel}`);
  assert.strictEqual(mail.messageChannel, expected.channel, `${mail.id} should use ${expected.channel} messageChannel`);
  assert.strictEqual(mail.mail_class, expected.mailClass, `${mail.id} should use ${expected.mailClass}`);
  assert(Array.isArray(mail.situation) && mail.situation.length >= expected.minSituation, `${mail.id} should expose a multi-message situation`);
  assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should expose choices`);

  for (const choice of mail.choices) {
    assert.strictEqual(typeof choice.reply, 'string', `${mail.id}/${choice.id} should have reply text`);
    assert(choice.reply.trim(), `${mail.id}/${choice.id} reply should not be empty`);
    assert(choice.effects && typeof choice.effects === 'object' && !Array.isArray(choice.effects), `${mail.id}/${choice.id} should have effects`);
    assert(choice.next_bias?.set_flags?.length, `${mail.id}/${choice.id} should set a next_bias flag`);
    assert(choice.triggers_on_choice, `${mail.id}/${choice.id} should trigger a consequence thread`);
  }
}

const plan = readJson(planPath);
const secondWeek = plan.sequence.slice(10, 20);
assert.strictEqual(secondWeek.length, 10, 'administrasjonsmedarbeider second week should expose ten package steps');
secondWeek.forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 11, `step ${index + 11} should keep one-based ordering`);
  assert.strictEqual(step.phase, 'mid', `step ${index + 11} should be mid phase`);
  assert.strictEqual(step.type, expectedType, `step ${index + 11} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `step ${index + 11} should use ${expectedFamily}`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 11} should not use fallbacks`);
});

const jobCatalog = readJson(jobPath);
const peopleCatalog = readJson(peoplePath);
const jobFamily = jobCatalog.families.find(family => family.id === JOB_FAMILY);
const privateFamily = peopleCatalog.families.find(family => family.id === PRIVATE_FAMILY);
assert(jobFamily, 'second-week administrasjonsmedarbeider job family should exist');
assert(privateFamily, 'second-week administrasjonsmedarbeider private family should exist');
assert.strictEqual(jobFamily.mails.length, 5, 'package should include five job threads');
assert.strictEqual(privateFamily.mails.length, 5, 'package should include five private threads');

const jobIds = new Set(jobFamily.mails.map(mail => mail.id));
const privateIds = new Set(privateFamily.mails.map(mail => mail.id));
for (const [id, type] of expectedOrder) {
  assert(type === 'job' ? jobIds.has(id) : privateIds.has(id), `${id} should exist in the correct family`);
}

for (const mail of jobFamily.mails) {
  assertPackageMail(mail, { mailType: 'job', family: JOB_FAMILY, channel: 'job', mailClass: 'job_message', minSituation: 3 });
}
for (const mail of privateFamily.mails) {
  assertPackageMail(mail, { mailType: 'people', family: PRIVATE_FAMILY, channel: 'private', mailClass: 'private_message', minSituation: 2 });
}

const threadIds = new Set([...(jobFamily.threads || []), ...(privateFamily.threads || [])].map(thread => thread.id));
const allChoices = [...jobFamily.mails, ...privateFamily.mails].flatMap(mail => mail.choices || []);
for (const choice of allChoices) {
  assert(threadIds.has(choice.triggers_on_choice), `${choice.triggers_on_choice} should exist as a consequence thread`);
}

assert(allChoices.some(choice => Number(statsFor(choice).documentation_quality || 0) > 0 && Number(statsFor(choice).traceability || 0) > 0), 'choices should reward documentation quality and traceability');
assert(allChoices.some(choice => Number(statsFor(choice).future_risk || 0) > 0), 'choices should include future risk tradeoffs');
assert(allChoices.some(choice => Number(statsFor(choice).process_quality || 0) > 0), 'choices should include process quality gains');
assert(allChoices.some(choice => Number(statsFor(choice).relationship_private || 0) > 0 || Number(statsFor(choice).relationship_sara || 0) > 0), 'private choices should affect relationships');
assert(allChoices.some(choice => Number(statsFor(choice).energy_weekend || 0) !== 0), 'weekend choices should affect energy_weekend');
assert(allChoices.some(choice => Number(statsFor(choice).control || 0) < 0), 'private boundary choices should reduce control');

assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'memory_system_builder_week2'), 'job outcomes should include memory_system_builder_week2');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'system_improver_week2'), 'job outcomes should include system_improver_week2');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'overdocumenter_week2'), 'job outcomes should include overdocumenter_week2');
assert(Array.isArray(privateFamily.week_outcomes) && privateFamily.week_outcomes.some(outcome => outcome.id === 'private_admin_boundary_week2'), 'private outcomes should include private_admin_boundary_week2');

execFileSync(process.execPath, ['tests/civication-praksisfortellinger-registry-audit.test.js'], {
  cwd: repoRoot,
  stdio: 'pipe'
});

console.log('Administrasjonsmedarbeider second-week praksisfortellinger OK');
