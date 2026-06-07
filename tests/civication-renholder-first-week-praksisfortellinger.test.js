#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/renholder_plan.json'), 'utf8'));
const job = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/renholder_job.json'), 'utf8'));
const people = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/renholder_people.json'), 'utf8'));

const JOB_FAMILY = 'first_week_praksisfortellinger_renholder_job';
const PRIVATE_FAMILY = 'first_week_praksisfortellinger_renholder_private';
const expected = [
  ['job_renholder_week1_room_looked_clean', 'job'],
  ['personal_renholder_week1_sees_stains_at_home', 'people'],
  ['job_renholder_week1_touch_points_everyone_forgets', 'job'],
  ['personal_renholder_week1_friend_not_hygiene_checked', 'people'],
  ['job_renholder_week1_twelve_minutes_twenty_needed', 'job'],
  ['personal_renholder_week1_cleans_to_calm_head', 'people'],
  ['job_renholder_week1_wrong_chemical_surface', 'job'],
  ['personal_renholder_week1_body_after_cleaning', 'people'],
  ['job_renholder_week1_invisible_work', 'job'],
  ['personal_renholder_week1_weekend_without_cleaning_gaze', 'people']
];

const jobFamily = job.families.find(family => family.id === JOB_FAMILY);
const privateFamily = people.families.find(family => family.id === PRIVATE_FAMILY);
assert(jobFamily, 'renholder first-week job family should exist');
assert(privateFamily, 'renholder first-week private family should exist');
assert.strictEqual(jobFamily.mails.length, 5, 'package should include five job threads');
assert.strictEqual(privateFamily.mails.length, 5, 'package should include five private threads');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.length >= 6, 'job family should expose renholder week outcomes');
assert(jobFamily.week_outcomes.some(outcome => outcome.id === 'hygiene_practice_worker'), 'hygiene practice outcome should exist');
assert(jobFamily.week_outcomes.some(outcome => outcome.id === 'private_cleaning_leak_week1'), 'private cleaning leak outcome should exist');

for (const [index, step] of plan.sequence.slice(0, 10).entries()) {
  const type = index % 2 === 0 ? 'job' : 'people';
  const family = type === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep ordering`);
  assert.strictEqual(step.type, type, `step ${index + 1} should alternate job/people`);
  assert.deepStrictEqual(step.allowed_families, [family], `step ${index + 1} should use ${family}`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should not use fallbacks`);
  const catalog = type === 'job' ? jobFamily : privateFamily;
  assert(catalog.mails.some(mail => mail.id === expected[index][0]), `${expected[index][0]} should exist`);
}

const allMails = [...jobFamily.mails, ...privateFamily.mails];
const allChoices = allMails.flatMap(mail => mail.choices || []);
for (const mail of allMails) {
  assert.strictEqual(mail.role_scope, 'renholder', `${mail.id} should stay scoped`);
  assert(Array.isArray(mail.situation) && mail.situation.length >= (mail.mail_type === 'job' ? 3 : 2), `${mail.id} should keep multi-message situation`);
  assert(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} should expose choices`);
  for (const choice of mail.choices) {
    assert(choice.reply, `${mail.id}/${choice.id} should have reply`);
    assert(choice.effects && typeof choice.effects === 'object', `${mail.id}/${choice.id} should have effects`);
  }
}
assert(allChoices.some(choice => choice.next_bias), 'at least one choice should carry next_bias');
assert(allChoices.some(choice => choice.triggers_on_choice), 'at least one choice should trigger a consequence thread');

const stats = allChoices.map(choice => choice.effects?.stats || choice.effects || {});
assert(stats.some(row => Number(row.hygiene_quality || 0) > 0 && Number(row.room_standard || 0) > 0), 'package should reward hygiene and room standard');
assert(stats.some(row => Number(row.traceability || 0) > 0 && Number(row.manager_trust || 0) > 0), 'package should reward traceable time-avvik');
assert(stats.some(row => Number(row.hms_safety || 0) > 0 && Number(row.surface_quality || 0) > 0), 'package should include chemical/surface HMS');
assert(stats.some(row => Object.prototype.hasOwnProperty.call(row, 'body_awareness') || Object.prototype.hasOwnProperty.call(row, 'energy_weekend')), 'package should affect body/rest signals');
assert(stats.some(row => Object.prototype.hasOwnProperty.call(row, 'relationship_private') || Object.prototype.hasOwnProperty.call(row, 'relationship_sara')), 'package should affect private relationships');

console.log('Renholder first-week Praksisfortellinger package OK');
