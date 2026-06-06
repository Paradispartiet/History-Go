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

const JOB_FAMILY = 'second_week_praksisfortellinger_ekspeditor_job';
const PRIVATE_FAMILY = 'second_week_praksisfortellinger_ekspeditor_private';
const expectedOrder = [
  ['job_ekspeditor_week2_customer_returns_after_error', 'job'],
  ['personal_ekspeditor_week2_remembering_small_complaints', 'people'],
  ['job_ekspeditor_week2_queue_before_closing', 'job'],
  ['personal_ekspeditor_week2_living_room_as_store', 'people'],
  ['job_ekspeditor_week2_forgotten_order', 'job'],
  ['personal_ekspeditor_week2_friend_not_complaint', 'people'],
  ['job_ekspeditor_week2_first_closing_responsibility', 'job'],
  ['personal_ekspeditor_week2_day_as_register_close', 'people'],
  ['job_ekspeditor_week2_second_week_behind_counter', 'job'],
  ['personal_ekspeditor_week2_weekend_without_shop_floor', 'people']
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
const secondWeek = plan.sequence.slice(10, 20);
assert.strictEqual(secondWeek.length, 10, 'ekspeditor second week should expose ten package steps');
secondWeek.forEach((step, index) => {
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 11, `step ${index + 11} should keep one-based ordering`);
  assert.strictEqual(step.phase, 'mid', `step ${index + 11} should be mid phase`);
  assert.strictEqual(step.type, expectedType, `step ${index + 11} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `step ${index + 11} should use ${expectedFamily}`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 11} should not use fallbacks`);
});
assert(plan.sequence.slice(20).some(step => (step.allowed_families || []).includes('kasse_og_pris')), 'ekspeditor plan should keep later retail progression after the two-week package');

const jobCatalog = readJson(jobPath);
const peopleCatalog = readJson(peoplePath);
const jobFamily = jobCatalog.families.find(family => family.id === JOB_FAMILY);
const privateFamily = peopleCatalog.families.find(family => family.id === PRIVATE_FAMILY);
assert(jobFamily, 'second-week ekspeditor job family should exist');
assert(privateFamily, 'second-week ekspeditor private family should exist');
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

assert(allChoices.some(choice => Number(statsFor(choice).accuracy || 0) > 0 && Number(statsFor(choice).customer_trust || 0) > 0), 'choices should reward accurate customer trust work');
assert(allChoices.some(choice => Number(statsFor(choice).boundary || 0) > 0 && Number(statsFor(choice).queue_flow || 0) > 0), 'choices should reward clear closing boundaries and queue flow');
assert(allChoices.some(choice => Number(statsFor(choice).closing_quality || 0) > 0), 'choices should affect closing quality');
assert(allChoices.some(choice => Number(statsFor(choice).stock_reliability || 0) > 0 || Number(statsFor(choice).process_quality || 0) > 0), 'choices should affect stock/process reliability');
assert(allChoices.some(choice => Number(statsFor(choice).future_risk || 0) > 0), 'choices should include future risk tradeoffs');
assert(allChoices.some(choice => Number(statsFor(choice).service_mask || 0) !== 0), 'private choices should affect service_mask');
assert(allChoices.some(choice => Number(statsFor(choice).relationship_private || 0) > 0 || Number(statsFor(choice).relationship_sara || 0) > 0), 'private choices should affect relationships');
assert(allChoices.some(choice => Number(statsFor(choice).energy_weekend || 0) !== 0), 'weekend choices should affect energy_weekend');
assert(allChoices.some(choice => Number(statsFor(choice).control || 0) < 0), 'private boundary choices should reduce control');

assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'trusted_frontline_responsibility_week2'), 'job outcomes should include trusted_frontline_responsibility_week2');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'speed_over_trust_week2'), 'job outcomes should include speed_over_trust_week2');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'honest_store_learner_week2'), 'job outcomes should include honest_store_learner_week2');
assert(Array.isArray(privateFamily.week_outcomes) && privateFamily.week_outcomes.some(outcome => outcome.id === 'private_shopfloor_boundary_week2'), 'private outcomes should include private_shopfloor_boundary_week2');

const registry = readJson(registryPath);
const role = registry.roles.find(item => item.role_id === 'ekspeditor');
assert(role, 'registry should include ekspeditor');
const pkg = role.packages.find(item => item.package_id === 'ekspeditor_week_2');
assert(pkg, 'registry should include ekspeditor_week_2');
assert.strictEqual(pkg.job_family, JOB_FAMILY, 'registry package should point at second-week job family');
assert.strictEqual(pkg.private_family, PRIVATE_FAMILY, 'registry package should point at second-week private family');
assert.strictEqual(pkg.test_file, 'tests/civication-ekspeditor-second-week-praksisfortellinger.test.js', 'ekspeditor_week_2 should point at this test file');

execFileSync(process.execPath, ['tests/civication-praksisfortellinger-registry-audit.test.js'], {
  cwd: repoRoot,
  stdio: 'pipe'
});
execFileSync(process.execPath, ['tests/civication-praksisfortellinger-cross-role.test.js'], {
  cwd: repoRoot,
  stdio: 'pipe'
});

console.log('Ekspeditor second-week praksisfortellinger OK');
