#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/ekspeditor_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/ekspeditor_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/ekspeditor_people.json');
const registryPath = path.join(repoRoot, 'data/Civication/praksisfortellinger_registry.json');

const JOB_FAMILY = 'first_week_praksisfortellinger_ekspeditor_job';
const PRIVATE_FAMILY = 'first_week_praksisfortellinger_ekspeditor_private';

const expectedOrder = [
  ['job_ekspeditor_week1_price_error_in_queue', 'job'],
  ['personal_ekspeditor_week1_reading_faces_at_home', 'people'],
  ['job_ekspeditor_week1_customer_thinks_you_decide', 'job'],
  ['personal_ekspeditor_week1_friend_not_customer', 'people'],
  ['job_ekspeditor_week1_item_not_available', 'job'],
  ['personal_ekspeditor_week1_everyone_asks_for_something', 'people'],
  ['job_ekspeditor_week1_register_mistake', 'job'],
  ['personal_ekspeditor_week1_customer_service_dinner', 'people'],
  ['job_ekspeditor_week1_first_week_behind_counter', 'job'],
  ['personal_ekspeditor_week1_weekend_without_queue', 'people']
];

function readJson(filePath) {
  assert(fs.existsSync(filePath), `${path.relative(repoRoot, filePath)} should exist`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function statsFor(choice) {
  return choice.effects?.stats || choice.effects || {};
}

function assertPackageMail(mail, expected) {
  assert.strictEqual(mail.role_scope, 'ekspeditor', `${mail.id} should stay scoped to ekspeditor`);
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
const firstWeek = plan.sequence.slice(0, 10);
assert.strictEqual(firstWeek.length, 10, 'ekspeditor first week should expose ten package steps');
firstWeek.forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep one-based ordering`);
  assert.strictEqual(step.phase, 'intro', `step ${index + 1} should be intro phase`);
  assert.strictEqual(step.type, expectedType, `step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `step ${index + 1} should use ${expectedFamily}`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should not use fallbacks`);
});
assert(plan.sequence.slice(10).some(step => (step.allowed_families || []).includes('kasse_og_pris')), 'ekspeditor plan should keep later retail progression after the package');

const jobCatalog = readJson(jobPath);
const peopleCatalog = readJson(peoplePath);
const jobFamily = jobCatalog.families.find(family => family.id === JOB_FAMILY);
const privateFamily = peopleCatalog.families.find(family => family.id === PRIVATE_FAMILY);
assert(jobFamily, 'first-week ekspeditor job family should exist');
assert(privateFamily, 'first-week ekspeditor private family should exist');
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

assert(allChoices.some(choice => Number(statsFor(choice).accuracy || 0) > 0 && Number(statsFor(choice).customer_trust || 0) > 0), 'choices should reward accurate customer-facing correction');
assert(allChoices.some(choice => Number(statsFor(choice).queue_flow || 0) > 0), 'choices should include queue-flow tradeoffs');
assert(allChoices.some(choice => Number(statsFor(choice).boundary || 0) > 0), 'choices should include service boundary gains');
assert(allChoices.some(choice => Number(statsFor(choice).future_risk || 0) > 0), 'choices should include future risk tradeoffs');
assert(allChoices.some(choice => Number(statsFor(choice).service_mask || 0) !== 0), 'private choices should affect service_mask');
assert(allChoices.some(choice => Number(statsFor(choice).relationship_private || 0) > 0 || Number(statsFor(choice).relationship_sara || 0) > 0), 'private choices should affect relationships');
assert(allChoices.some(choice => Number(statsFor(choice).energy_weekend || 0) !== 0), 'weekend choices should affect energy_weekend');

assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'trusted_frontline_worker'), 'job outcomes should include trusted_frontline_worker');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'queue_speed_worker'), 'job outcomes should include queue_speed_worker');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'honest_guide'), 'job outcomes should include honest_guide');
assert(Array.isArray(privateFamily.week_outcomes) && privateFamily.week_outcomes.some(outcome => outcome.id === 'private_service_mask'), 'private outcomes should include private_service_mask');

const registry = readJson(registryPath);
const role = registry.roles.find(item => item.role_id === 'ekspeditor');
assert(role, 'registry should include ekspeditor');
const pkg = role.packages.find(item => item.package_id === 'ekspeditor_week_1');
assert(pkg, 'registry should include ekspeditor_week_1');
assert.strictEqual(pkg.job_family, JOB_FAMILY, 'registry package should point at job family');
assert.strictEqual(pkg.private_family, PRIVATE_FAMILY, 'registry package should point at private family');
assert.strictEqual(pkg.test_file, 'tests/civication-ekspeditor-first-week-praksisfortellinger.test.js', 'ekspeditor_week_1 should point at this test file');

execFileSync(process.execPath, ['tests/civication-praksisfortellinger-registry-audit.test.js'], {
  cwd: repoRoot,
  stdio: 'pipe'
});

console.log('Ekspeditor first-week praksisfortellinger OK');
