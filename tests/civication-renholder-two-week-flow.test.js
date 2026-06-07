#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const planPath = path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/renholder_plan.json');
const jobPath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/renholder_job.json');
const peoplePath = path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/renholder_people.json');
const registryPath = path.join(repoRoot, 'data/Civication/praksisfortellinger_registry.json');

const WEEK_1_JOB = 'first_week_praksisfortellinger_renholder_job';
const WEEK_1_PRIVATE = 'first_week_praksisfortellinger_renholder_private';
const WEEK_2_JOB = 'second_week_praksisfortellinger_renholder_job';
const WEEK_2_PRIVATE = 'second_week_praksisfortellinger_renholder_private';
const TWO_WEEK_TEST = 'tests/civication-renholder-two-week-flow.test.js';

const expectedFlow = [
  { id: 'job_renholder_week1_room_looked_clean', type: 'job', family: WEEK_1_JOB, week: 1, minSituation: 3 },
  { id: 'personal_renholder_week1_sees_stains_at_home', type: 'people', family: WEEK_1_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_renholder_week1_touch_points_everyone_forgets', type: 'job', family: WEEK_1_JOB, week: 1, minSituation: 3 },
  { id: 'personal_renholder_week1_friend_not_hygiene_checked', type: 'people', family: WEEK_1_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_renholder_week1_twelve_minutes_twenty_needed', type: 'job', family: WEEK_1_JOB, week: 1, minSituation: 3 },
  { id: 'personal_renholder_week1_cleans_to_calm_head', type: 'people', family: WEEK_1_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_renholder_week1_wrong_chemical_surface', type: 'job', family: WEEK_1_JOB, week: 1, minSituation: 3 },
  { id: 'personal_renholder_week1_body_after_cleaning', type: 'people', family: WEEK_1_PRIVATE, week: 1, minSituation: 2 },
  { id: 'job_renholder_week1_invisible_work', type: 'job', family: WEEK_1_JOB, week: 1, minSituation: 3 },
  { id: 'personal_renholder_week1_weekend_without_cleaning_gaze', type: 'people', family: WEEK_1_PRIVATE, week: 1, minSituation: 3 },
  { id: 'job_renholder_week2_room_used_before_done', type: 'job', family: WEEK_2_JOB, week: 2, minSituation: 3 },
  { id: 'personal_renholder_week2_cannot_leave_half_done', type: 'people', family: WEEK_2_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_renholder_week2_spill_becomes_deviation', type: 'job', family: WEEK_2_JOB, week: 2, minSituation: 3 },
  { id: 'personal_renholder_week2_clutter_feels_like_hazard', type: 'people', family: WEEK_2_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_renholder_week2_invisible_cleaner', type: 'job', family: WEEK_2_JOB, week: 2, minSituation: 3 },
  { id: 'personal_renholder_week2_friend_not_work_area', type: 'people', family: WEEK_2_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_renholder_week2_body_as_hms', type: 'job', family: WEEK_2_JOB, week: 2, minSituation: 3 },
  { id: 'personal_renholder_week2_rest_without_cleaning_first', type: 'people', family: WEEK_2_PRIVATE, week: 2, minSituation: 2 },
  { id: 'job_renholder_week2_room_standard_and_dignity', type: 'job', family: WEEK_2_JOB, week: 2, minSituation: 3 },
  { id: 'personal_renholder_week2_weekend_without_standard_control', type: 'people', family: WEEK_2_PRIVATE, week: 2, minSituation: 3 }
];

const trackedSignals = [
  'hygiene_quality',
  'room_standard',
  'hms_safety',
  'body_awareness',
  'dignity',
  'manager_trust',
  'training_path',
  'time_flow',
  'time_pressure',
  'traceability',
  'future_risk',
  'stress',
  'control',
  'relationship_private',
  'energy_weekend',
  'stagnation',
  'physical_load',
  'self_awareness'
];

const styles = [
  {
    name: 'Hygienefaglig renholder',
    pick: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
    assert: stats => {
      assert(stats.hygiene_quality > 25, 'hygiene style should strongly increase hygiene_quality');
      assert(stats.room_standard > 5, 'hygiene style should improve room_standard');
      assert(stats.hms_safety > 20, 'hygiene style should improve hms_safety');
      assert(stats.manager_trust > 20, 'hygiene style should improve manager_trust');
      assert(stats.dignity > 5, 'hygiene style should strengthen dignity');
      assert(stats.traceability > 5, 'hygiene style should improve traceability');
      assert(stats.training_path > 5, 'hygiene style should open training_path');
      assert(stats.energy_weekend > 5, 'hygiene style should protect energy_weekend');
      assert(stats.relationship_private > 0, 'hygiene style should protect private relationships');
    }
  },
  {
    name: 'Overflate-/tempo-renholder',
    pick: ['B', 'B', 'B', 'C', 'B', 'B', 'B', 'C', 'B', 'C', 'C', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'C'],
    assert: stats => {
      assert(stats.time_flow > 10, 'tempo style should increase time_flow');
      assert(stats.future_risk > 15, 'tempo style should increase future_risk');
      assert(stats.hygiene_quality < 0, 'tempo style should reduce hygiene_quality');
      assert(stats.stagnation > 5, 'tempo style should increase stagnation');
      assert(stats.traceability < 0, 'tempo style should weaken traceability');
      assert(stats.training_path < 0, 'tempo style should weaken training_path');
    }
  },
  {
    name: 'Overrenholder/perfeksjonist',
    pick: ['C', 'C', 'C', 'B', 'C', 'C', 'A', 'C', 'A', 'D', 'A', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'A', 'D'],
    assert: stats => {
      assert(stats.time_pressure > 10, 'perfectionist style should raise time_pressure');
      assert(stats.stress > 20, 'perfectionist style should raise stress');
      assert(stats.control > 10, 'perfectionist style should raise control');
      assert(stats.physical_load > 10, 'perfectionist style should raise physical_load');
      assert(stats.energy_weekend < -10, 'perfectionist style should drain energy_weekend');
      assert(stats.future_risk > 5, 'perfectionist style should keep future_risk visible');
    }
  },
  {
    name: 'HMS- og kroppsbevisst renholder',
    pick: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'D', 'B', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'D', 'B'],
    assert: stats => {
      assert(stats.hms_safety > 20, 'HMS style should raise hms_safety');
      assert(stats.body_awareness > 20, 'HMS style should raise body_awareness');
      assert(stats.future_risk < 0, 'HMS style should reduce future_risk');
      assert(stats.training_path >= 10, 'HMS style should improve training_path');
      assert(stats.self_awareness > 10, 'HMS style should improve self_awareness');
      assert(stats.physical_load < 0, 'HMS style should reduce physical_load');
    }
  },
  {
    name: 'Bruker-/systemskyld-renholder',
    pick: ['B', 'B', 'B', 'C', 'B', 'B', 'C', 'C', 'C', 'C', 'B', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'],
    assert: stats => {
      assert(stats.future_risk > 10, 'blame style should increase future_risk');
      assert(stats.conflict > 5, 'blame style should increase conflict');
      assert(stats.manager_trust < 0, 'blame style should reduce manager_trust');
      assert(stats.stress > 10, 'blame style should increase stress');
      assert(stats.stagnation > 5, 'blame style should increase stagnation');
      assert(stats.hms_safety < 0, 'blame style should reduce hms_safety');
    }
  },
  {
    name: 'Privat grensesetter',
    pick: ['A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A', 'A'],
    assert: stats => {
      assert(stats.relationship_private > 0, 'boundary style should improve relationship_private');
      assert(stats.energy_weekend > 10, 'boundary style should improve energy_weekend');
      assert(stats.control < -5, 'boundary style should reduce control pressure');
      assert(stats.stress < 0, 'boundary style should reduce stress across private choices despite job pressure');
      assert(stats.body_awareness > 10, 'boundary style should improve body_awareness');
      assert(stats.self_awareness > 10, 'boundary style should improve self_awareness');
    }
  }
];

function readJson(filePath) {
  assert(fs.existsSync(filePath), `${path.relative(repoRoot, filePath)} should exist`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function statsFor(choice) {
  return choice.effects?.stats || choice.effects || {};
}

function addStats(target, source) {
  for (const [key, value] of Object.entries(source || {})) {
    if (typeof value === 'number') target[key] = (target[key] || 0) + value;
  }
}

function familyById(catalog, id) {
  const family = catalog.families.find(item => item.id === id);
  assert(family, `${id} should exist`);
  return family;
}

function assertChoiceShape(mail) {
  assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should expose choices`);
  for (const choice of mail.choices) {
    assert.strictEqual(typeof choice.reply, 'string', `${mail.id}/${choice.id} should have reply text`);
    assert(choice.reply.trim(), `${mail.id}/${choice.id} reply should not be empty`);
    assert(choice.effects && typeof choice.effects === 'object' && !Array.isArray(choice.effects), `${mail.id}/${choice.id} should have effects`);
  }
}

function assertChannel(mail, expectedType, expectedFamily) {
  const expectedChannel = expectedType === 'job' ? 'job' : 'private';
  const expectedClass = expectedType === 'job' ? 'job_message' : 'private_message';
  assert.strictEqual(mail.mail_type, expectedType, `${mail.id} should use ${expectedType} mail_type`);
  assert.strictEqual(mail.mail_family, expectedFamily, `${mail.id} should stay in ${expectedFamily}`);
  assert.strictEqual(mail.channel, expectedChannel, `${mail.id} should use ${expectedChannel} channel`);
  assert.strictEqual(mail.messageChannel, expectedChannel, `${mail.id} should use ${expectedChannel} messageChannel`);
  assert.strictEqual(mail.mail_class, expectedClass, `${mail.id} should use ${expectedClass}`);
}

function simulateStyle(style, mailById) {
  const totals = Object.fromEntries(trackedSignals.map(signal => [signal, 0]));
  for (const [index, expected] of expectedFlow.entries()) {
    const mail = mailById.get(expected.id);
    const choiceId = style.pick[index];
    const choice = (mail.choices || []).find(item => item.id === choiceId);
    assert(choice, `${style.name} should be able to choose ${choiceId} for ${expected.id}`);
    addStats(totals, statsFor(choice));
  }
  style.assert(totals);
}

const registry = readJson(registryPath);
const plan = readJson(planPath);
const jobCatalog = readJson(jobPath);
const peopleCatalog = readJson(peoplePath);

const role = registry.roles.find(item => item.role_id === 'renholder');
assert(role, 'registry should include renholder');
const week1 = role.packages.find(item => item.package_id === 'renholder_week_1');
const week2 = role.packages.find(item => item.package_id === 'renholder_week_2');
assert(week1, 'renholder should register renholder_week_1');
assert(week2, 'renholder should register renholder_week_2');
assert((role.flow_tests || []).includes(TWO_WEEK_TEST), 'renholder flow_tests should include two-week flow test');

assert.strictEqual(week1.job_family, WEEK_1_JOB, 'week 1 should point at first-week job family');
assert.strictEqual(week1.private_family, WEEK_1_PRIVATE, 'week 1 should point at first-week private family');
assert.strictEqual(week1.step_start, 1, 'week 1 should start at step 1');
assert.strictEqual(week1.step_end, 10, 'week 1 should end at step 10');
assert.strictEqual(week2.job_family, WEEK_2_JOB, 'week 2 should point at second-week job family');
assert.strictEqual(week2.private_family, WEEK_2_PRIVATE, 'week 2 should point at second-week private family');
assert.strictEqual(week2.step_start, 11, 'week 2 should start at step 11');
assert.strictEqual(week2.step_end, 20, 'week 2 should end at step 20');

const firstTwenty = plan.sequence.slice(0, 20);
assert.strictEqual(firstTwenty.length, 20, 'renholder plan should have at least 20 Praksisfortellinger steps');
firstTwenty.forEach((step, index) => {
  const expected = expectedFlow[index];
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep one-based ordering`);
  assert.strictEqual(step.type, expected.type, `step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [expected.family], `step ${index + 1} should use ${expected.family}`);
  if (Object.prototype.hasOwnProperty.call(step, 'fallback_types')) {
    assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should not use fallbacks`);
  }
});

const families = {
  [WEEK_1_JOB]: familyById(jobCatalog, WEEK_1_JOB),
  [WEEK_1_PRIVATE]: familyById(peopleCatalog, WEEK_1_PRIVATE),
  [WEEK_2_JOB]: familyById(jobCatalog, WEEK_2_JOB),
  [WEEK_2_PRIVATE]: familyById(peopleCatalog, WEEK_2_PRIVATE)
};
assert.strictEqual(families[WEEK_1_JOB].mails.length, 5, 'week 1 should have five job threads');
assert.strictEqual(families[WEEK_1_PRIVATE].mails.length, 5, 'week 1 should have five private threads');
assert.strictEqual(families[WEEK_2_JOB].mails.length, 5, 'week 2 should have five job threads');
assert.strictEqual(families[WEEK_2_PRIVATE].mails.length, 5, 'week 2 should have five private threads');

const mailById = new Map();
const consequenceIds = new Set();
for (const family of Object.values(families)) {
  for (const mail of family.mails || []) mailById.set(mail.id, mail);
  for (const thread of family.threads || []) consequenceIds.add(thread.id);
}

for (const expected of expectedFlow) {
  const mail = mailById.get(expected.id);
  assert(mail, `${expected.id} should exist in the two-week flow`);
  assert.strictEqual(mail.role_scope, 'renholder', `${mail.id} should stay scoped to renholder`);
  assertChannel(mail, expected.type, expected.family);
  assert(Array.isArray(mail.situation) && mail.situation.length >= expected.minSituation, `${mail.id} should expose a multi-message situation`);
  assertChoiceShape(mail);
}

const week1Choices = expectedFlow.filter(item => item.week === 1).flatMap(item => mailById.get(item.id).choices || []);
const week2Choices = expectedFlow.filter(item => item.week === 2).flatMap(item => mailById.get(item.id).choices || []);
assert(week1Choices.some(choice => choice.next_bias), 'at least one week 1 choice should carry next_bias');
assert(week2Choices.some(choice => choice.next_bias), 'at least one week 2 choice should carry next_bias');

const triggeredChoices = [...week1Choices, ...week2Choices].filter(choice => choice.triggers_on_choice);
if (consequenceIds.size > 0) {
  assert(week1Choices.some(choice => choice.triggers_on_choice), 'week 1 should trigger a consequence when consequence threads exist');
  if ([...families[WEEK_2_JOB].threads || [], ...families[WEEK_2_PRIVATE].threads || []].length > 0) {
    assert(week2Choices.some(choice => choice.triggers_on_choice), 'week 2 should trigger a consequence when week 2 consequence threads exist');
  }
}
for (const choice of triggeredChoices) {
  assert(consequenceIds.has(choice.triggers_on_choice), `${choice.triggers_on_choice} should point to an existing thread`);
}

for (const expected of expectedFlow) {
  const mail = mailById.get(expected.id);
  if (expected.type === 'job') {
    assert.strictEqual(mail.channel, 'job', `${mail.id} should stay in job channel`);
    assert(!mail.id.startsWith('personal_'), `${mail.id} should not mix private ID prefixes into job channel`);
  } else {
    assert.strictEqual(mail.channel, 'private', `${mail.id} should stay in private channel`);
    assert(mail.id.startsWith('personal_'), `${mail.id} should keep private ID prefix`);
  }
}

const week1Text = expectedFlow.filter(item => item.week === 1).map(item => `${item.id} ${mailById.get(item.id).title || ''} ${JSON.stringify((mailById.get(item.id).choices || []).map(choice => [choice.effects, choice.next_bias]))}`).join(' ').toLowerCase();
const week2Text = expectedFlow.filter(item => item.week === 2).map(item => `${item.id} ${mailById.get(item.id).title || ''} ${JSON.stringify((mailById.get(item.id).choices || []).map(choice => [choice.effects, choice.next_bias]))}`).join(' ').toLowerCase();
for (const needle of ['hygiene', 'touch_points', 'time_pressure', 'chemical', 'body']) {
  assert(week1Text.includes(needle), `week 1 should preserve theme marker ${needle}`);
}
for (const needle of ['interrupted', 'spill', 'invisible', 'body', 'dignity']) {
  assert(week2Text.includes(needle), `week 2 should build with theme marker ${needle}`);
}

for (const style of styles) simulateStyle(style, mailById);

const allFamilyIds = Object.keys(families);
assert(allFamilyIds.every(id => id.includes('renholder')), 'two-week flow should only use renholder families');
assert([...mailById.keys()].every(id => id.includes('renholder')), 'two-week flow should only use renholder thread ids');

console.log('Renholder two-week Praksisfortellinger flow OK');
