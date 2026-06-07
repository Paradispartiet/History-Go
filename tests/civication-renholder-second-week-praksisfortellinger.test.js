#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { execFileSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/renholder_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/renholder_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/renholder_people.json');
const registryPath = path.join(repoRoot, 'data/Civication/praksisfortellinger_registry.json');

const JOB_FAMILY = 'second_week_praksisfortellinger_renholder_job';
const PRIVATE_FAMILY = 'second_week_praksisfortellinger_renholder_private';
const expectedOrder = [
  ['job_renholder_week2_room_used_before_done', 'job'],
  ['personal_renholder_week2_cannot_leave_half_done', 'people'],
  ['job_renholder_week2_spill_becomes_deviation', 'job'],
  ['personal_renholder_week2_clutter_feels_like_hazard', 'people'],
  ['job_renholder_week2_invisible_cleaner', 'job'],
  ['personal_renholder_week2_friend_not_work_area', 'people'],
  ['job_renholder_week2_body_as_hms', 'job'],
  ['personal_renholder_week2_rest_without_cleaning_first', 'people'],
  ['job_renholder_week2_room_standard_and_dignity', 'job'],
  ['personal_renholder_week2_weekend_without_standard_control', 'people']
];
const expectedOutcomes = [
  'hygiene_and_dignity_worker_week2',
  'surface_flow_cleaner_week2',
  'silent_extra_work_cleaner_week2',
  'hms_body_guardian_week2',
  'user_blame_cleaner_week2',
  'private_standard_boundary_week2'
];

function readJson(filePath) {
  assert(fs.existsSync(filePath), `${path.relative(repoRoot, filePath)} should exist`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function statsFor(choice) {
  return choice.effects?.stats || choice.effects || {};
}

function assertPackageMail(mail, expected) {
  assert.strictEqual(mail.role_scope, 'renholder', `${mail.id} should stay scoped to renholder`);
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
  }
}

const plan = readJson(planPath);
const jobCatalog = readJson(jobPath);
const peopleCatalog = readJson(peoplePath);
const registry = readJson(registryPath);

const secondWeek = plan.sequence.slice(10, 20);
assert.strictEqual(secondWeek.length, 10, 'renholder second week should expose ten package steps');
secondWeek.forEach((step, index) => {
  const stepNumber = index + 11;
  const expectedType = index % 2 === 0 ? 'job' : 'people';
  const expectedFamily = expectedType === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, stepNumber, `step ${stepNumber} should keep one-based ordering`);
  assert.strictEqual(step.type, expectedType, `step ${stepNumber} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expectedFamily], `step ${stepNumber} should use ${expectedFamily}`);
  if (Object.prototype.hasOwnProperty.call(step, 'fallback_types')) {
    assert.deepStrictEqual(step.fallback_types, [], `step ${stepNumber} should not use fallbacks`);
  }
});

const jobFamily = jobCatalog.families.find(family => family.id === JOB_FAMILY);
const privateFamily = peopleCatalog.families.find(family => family.id === PRIVATE_FAMILY);
assert(jobFamily, 'second-week renholder job family should exist');
assert(privateFamily, 'second-week renholder private family should exist');
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

const allMails = [...jobFamily.mails, ...privateFamily.mails];
const allChoices = allMails.flatMap(mail => mail.choices || []);
assert(allChoices.some(choice => choice.next_bias), 'at least one choice should carry next_bias');

const consequenceIds = new Set([...(jobFamily.threads || []), ...(privateFamily.threads || [])].map(thread => thread.id));
const triggeredChoices = allChoices.filter(choice => choice.triggers_on_choice);
if (consequenceIds.size > 0) {
  assert(triggeredChoices.length > 0, 'at least one choice should trigger a consequence thread when consequence threads exist');
}
for (const choice of triggeredChoices) {
  assert(consequenceIds.has(choice.triggers_on_choice), `${choice.triggers_on_choice} should exist as a consequence/follow-up thread`);
}

const allStats = allChoices.map(statsFor);
assert(allStats.some(row => Number(row.hygiene_quality || 0) > 0 && Number(row.room_standard || 0) > 0), 'choices should reward hygiene quality and room standard');
assert(allStats.some(row => Number(row.hms_safety || 0) > 0 && Number(row.body_awareness || 0) > 0), 'choices should connect HMS and body awareness');
assert(allStats.some(row => Number(row.dignity || row.dignity_private || 0) > 0), 'choices should include dignity effects');
assert(allStats.some(row => Number(row.traceability || 0) > 0 && Number(row.manager_trust || 0) > 0), 'choices should reward traceable deviations');
assert(allStats.some(row => Number(row.time_flow || 0) > 0 || Number(row.time_pressure || 0) > 0), 'choices should include flow/time pressure tradeoffs');
assert(allStats.some(row => Object.prototype.hasOwnProperty.call(row, 'relationship_private') || Object.prototype.hasOwnProperty.call(row, 'relationship_sara')), 'private choices should affect relationships');

assert(Array.isArray(jobFamily.week_outcomes), 'job family should expose week_outcomes');
for (const outcomeId of expectedOutcomes) {
  assert(jobFamily.week_outcomes.some(outcome => outcome.id === outcomeId), `week_outcomes should include ${outcomeId}`);
}

const role = registry.roles.find(item => item.role_id === 'renholder');
assert(role, 'registry should include renholder');
const pkg = role.packages.find(item => item.package_id === 'renholder_week_2');
assert(pkg, 'registry should include renholder_week_2');
assert.strictEqual(pkg.week, 2, 'renholder_week_2 should be week 2');
assert.strictEqual(pkg.step_start, 11, 'renholder_week_2 should start at step 11');
assert.strictEqual(pkg.step_end, 20, 'renholder_week_2 should end at step 20');
assert.strictEqual(pkg.job_family, JOB_FAMILY, 'registry package should point at second-week job family');
assert.strictEqual(pkg.private_family, PRIVATE_FAMILY, 'registry package should point at second-week private family');
assert.strictEqual(pkg.expected_job_threads, 5, 'registry package should expect five job threads');
assert.strictEqual(pkg.expected_private_threads, 5, 'registry package should expect five private threads');
assert.strictEqual(pkg.test_file, 'tests/civication-renholder-second-week-praksisfortellinger.test.js', 'renholder_week_2 should point at this test file');

execFileSync(process.execPath, ['tests/civication-praksisfortellinger-registry-audit.test.js'], {
  cwd: repoRoot,
  stdio: 'pipe'
});

console.log('Renholder second-week Praksisfortellinger package OK');
