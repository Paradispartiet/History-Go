#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailPlans/naeringsliv/lager_og_driftsmedarbeider_plan.json'), 'utf8'));
const job = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/job/lager_og_driftsmedarbeider_job.json'), 'utf8'));
const people = JSON.parse(fs.readFileSync(path.join(repoRoot, 'data/Civication/mailFamilies/naeringsliv/people/lager_og_driftsmedarbeider_people.json'), 'utf8'));

const JOB_FAMILY = 'first_week_praksisfortellinger_lager_og_driftsmedarbeider_job';
const PRIVATE_FAMILY = 'first_week_praksisfortellinger_lager_og_driftsmedarbeider_private';
const expected = [
  ['job_lager_og_driftsmedarbeider_week1_receiving_almost_matched', 'job'],
  ['personal_lager_og_driftsmedarbeider_week1_counting_bags_at_home', 'people'],
  ['job_lager_og_driftsmedarbeider_week1_pick_list_pressure', 'job'],
  ['personal_lager_og_driftsmedarbeider_week1_friend_not_shelf_location', 'people'],
  ['job_lager_og_driftsmedarbeider_week1_wrong_location', 'job'],
  ['personal_lager_og_driftsmedarbeider_week1_rearranging_home_for_flow', 'people'],
  ['job_lager_og_driftsmedarbeider_week1_pallet_in_the_way', 'job'],
  ['personal_lager_og_driftsmedarbeider_week1_body_after_warehouse', 'people'],
  ['job_lager_og_driftsmedarbeider_week1_between_stock_and_system', 'job'],
  ['personal_lager_og_driftsmedarbeider_week1_weekend_without_pallets', 'people']
];

const jobFamily = job.families.find(family => family.id === JOB_FAMILY);
const privateFamily = people.families.find(family => family.id === PRIVATE_FAMILY);
assert(jobFamily, 'lager first-week job family should exist');
assert(privateFamily, 'lager first-week private family should exist');
assert.strictEqual(jobFamily.mails.length, 5, 'package should include five job threads');
assert.strictEqual(privateFamily.mails.length, 5, 'package should include five private threads');
assert(Array.isArray(jobFamily.week_outcomes) && jobFamily.week_outcomes.length >= 6, 'job family should expose warehouse week outcomes');
assert(jobFamily.week_outcomes.some(outcome => outcome.id === 'reliable_stock_flow_worker'), 'reliable stock flow outcome should exist');
assert(jobFamily.week_outcomes.some(outcome => outcome.id === 'private_warehouse_leak'), 'private warehouse leak outcome should exist');

for (const [index, step] of plan.sequence.slice(0, 10).entries()) {
  const type = index % 2 === 0 ? 'job' : 'people';
  const family = type === 'job' ? JOB_FAMILY : PRIVATE_FAMILY;
  assert.strictEqual(step.step, index + 1, `step ${index + 1} should keep ordering`);
  assert.strictEqual(step.type, type, `step ${index + 1} should alternate job/people`);
  assert.strictEqual(step.phase, 'intro', `step ${index + 1} should stay intro`);
  assert.deepStrictEqual(step.allowed_families, [family], `step ${index + 1} should use ${family}`);
  assert.deepStrictEqual(step.fallback_types, [], `step ${index + 1} should not use fallbacks`);
  const catalog = type === 'job' ? jobFamily : privateFamily;
  assert(catalog.mails.some(mail => mail.id === expected[index][0]), `${expected[index][0]} should exist`);
}

const allMails = [...jobFamily.mails, ...privateFamily.mails];
const allChoices = allMails.flatMap(mail => mail.choices || []);
for (const mail of allMails) {
  assert.strictEqual(mail.role_scope, 'lager_og_driftsmedarbeider', `${mail.id} should stay scoped`);
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
assert(stats.some(row => Number(row.accuracy || 0) > 0 && Number(row.traceability || 0) > 0), 'package should reward accurate traceable work');
assert(stats.some(row => Number(row.hms_safety || 0) > 0), 'package should include HMS safety');
assert(stats.some(row => Number(row.flow_quality || 0) > 0 && Number(row.future_risk || 0) > 0), 'package should represent speed/future-risk tradeoff');
assert(stats.some(row => Object.prototype.hasOwnProperty.call(row, 'body_awareness') || Object.prototype.hasOwnProperty.call(row, 'energy_weekend')), 'package should affect body/rest signals');
assert(stats.some(row => Object.prototype.hasOwnProperty.call(row, 'relationship_private') || Object.prototype.hasOwnProperty.call(row, 'relationship_sara')), 'package should affect private relationships');

console.log('Lager- og driftsmedarbeider first-week Praksisfortellinger package OK');
