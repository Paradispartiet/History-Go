#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json');
const registryPath = path.join(repoRoot, 'data/Civication/praksisfortellinger_registry.json');

const JOB_FAMILY = 'second_week_praksisfortellinger_lager_og_driftsmedarbeider_job';
const PRIVATE_FAMILY = 'second_week_praksisfortellinger_lager_og_driftsmedarbeider_private';
const expectedOrder = [
  ['job_lager_og_driftsmedarbeider_week2_late_missing_colli', 'job'],
  ['personal_lager_og_driftsmedarbeider_week2_searching_for_missing_things', 'people'],
  ['job_lager_og_driftsmedarbeider_week2_store_waits_wrong_item', 'job'],
  ['personal_lager_og_driftsmedarbeider_week2_feeling_like_delay', 'people'],
  ['job_lager_og_driftsmedarbeider_week2_count_mismatch', 'job'],
  ['personal_lager_og_driftsmedarbeider_week2_counting_energy', 'people'],
  ['job_lager_og_driftsmedarbeider_week2_near_miss_everyone_passed', 'job'],
  ['personal_lager_og_driftsmedarbeider_week2_body_speaks_again', 'people'],
  ['job_lager_og_driftsmedarbeider_week2_flow_and_traceability', 'job'],
  ['personal_lager_og_driftsmedarbeider_week2_weekend_without_warehouse_responsibility', 'people']
];

function readJson(filePath) {
  assert(fs.existsSync(filePath), `${path.relative(repoRoot, filePath)} should exist`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function statsFor(choice) {
  return choice.effects?.stats || choice.effects || {};
}

function assertPackageMail(mail, expected) {
  assert.strictEqual(mail.role_scope, 'lager_og_driftsmedarbeider', `${mail.id} should stay scoped to lager_og_driftsmedarbeider`);
  assert.strictEqual(mail.mail_type, expected.mailType, `${mail.id} should use ${expected.mailType}`);
  assert.strictEqual(mail.mail_family, expected.family, `${mail.id} should stay in ${expected.family}`);
  assert.strictEqual(mail.phase, 'mid', `${mail.id} should be mid phase`);
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
assert.strictEqual(secondWeek.length, 10, 'lager second week should expose ten package steps');
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
assert(jobFamily, 'second-week lager job family should exist');
assert(privateFamily, 'second-week lager private family should exist');
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

assert(allChoices.some(choice => Number(statsFor(choice).traceability || 0) > 0 && Number(statsFor(choice).stock_reliability || 0) > 0), 'choices should reward traceable reliable stock flow');
assert(allChoices.some(choice => Number(statsFor(choice).trust_drift || 0) > 0), 'choices should affect drift/store trust');
assert(allChoices.some(choice => Number(statsFor(choice).hms_safety || 0) > 0), 'choices should include HMS safety learning');
assert(allChoices.some(choice => Number(statsFor(choice).process_quality || 0) > 0), 'choices should affect process quality');
assert(allChoices.some(choice => Number(statsFor(choice).future_risk || 0) > 0), 'choices should include future risk tradeoffs');
assert(allChoices.some(choice => Number(statsFor(choice).training_path || 0) > 0), 'choices should include guided training path');
assert(allChoices.some(choice => Number(statsFor(choice).physical_load || 0) > 0), 'private choices should affect physical load');
assert(allChoices.some(choice => Number(statsFor(choice).energy_weekend || 0) !== 0), 'weekend/private choices should affect energy_weekend');
assert(allChoices.some(choice => Number(statsFor(choice).relationship_private || 0) > 0 || Number(statsFor(choice).relationship_sara || 0) > 0), 'private choices should affect relationships');
assert(allChoices.some(choice => Number(statsFor(choice).control || 0) < 0), 'private boundary choices should reduce control');

assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'reliable_flow_responsibility_week2'), 'job outcomes should include reliable_flow_responsibility_week2');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'speed_without_trace_week2'), 'job outcomes should include speed_without_trace_week2');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'hms_learning_worker_week2'), 'job outcomes should include hms_learning_worker_week2');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.some(outcome => outcome.id === 'guided_training_path_week2'), 'job outcomes should include guided_training_path_week2');
assert(Array.isArray(privateFamily.week_outcomes) && privateFamily.week_outcomes.some(outcome => outcome.id === 'private_warehouse_boundary_week2'), 'private outcomes should include private_warehouse_boundary_week2');

const registry = readJson(registryPath);
const role = registry.roles.find(item => item.role_id === 'lager_og_driftsmedarbeider');
assert(role, 'registry should include lager_og_driftsmedarbeider');
const pkg = role.packages.find(item => item.package_id === 'lager_og_driftsmedarbeider_week_2');
assert(pkg, 'registry should include lager_og_driftsmedarbeider_week_2');
assert.strictEqual(pkg.job_family, JOB_FAMILY, 'registry package should point at second-week job family');
assert.strictEqual(pkg.private_family, PRIVATE_FAMILY, 'registry package should point at second-week private family');
assert.strictEqual(pkg.test_file, 'tests/civication-lager-og-driftsmedarbeider-second-week-praksisfortellinger.test.js', 'lager week 2 should point at this test file');

execFileSync(process.execPath, ['tests/civication-praksisfortellinger-registry-audit.test.js'], {
  cwd: repoRoot,
  stdio: 'pipe'
});

console.log('Lager- og driftsmedarbeider second-week praksisfortellinger OK');
