'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/naeringsliv/okonomi_og_finanssjef.json');
const grammar = readJson('data/Civication/workGrammars/naeringsliv/okonomi_og_finanssjef.json');
const plan = readJson('data/Civication/mailPlans/naeringsliv/okonomi_og_finanssjef_plan.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.key === 'naeringsliv/okonomi_og_finanssjef');

assert.equal(model.schema, 'civication_role_model_v1');
assert.equal(model.version, 2);
assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, 'okonomi_og_finanssjef');
assert.equal(grammar.category, 'naeringsliv');
assert.equal(grammar.role_scope, 'okonomi_og_finanssjef');
assert.ok((grammar.work_loops || []).length >= 1, 'Finance chief needs a repeatable work loop');
assert.ok((grammar.practice_stories || []).length >= 1, 'Finance chief needs structured practice stories');
assert.ok(grammar.authority_boundary && Object.keys(grammar.authority_boundary).length, 'Finance chief authority must be explicit');

for (const type of ['job','people','conflict','story','event','micro','followup','knowledge','consequence']) {
  const rel = `data/Civication/mailFamilies/naeringsliv/${type}/okonomi_og_finanssjef_${type}.json`;
  const catalog = readJson(rel);
  assert.equal(catalog.category, 'naeringsliv', `${type} catalog category`);
  assert.equal(catalog.role_scope, 'okonomi_og_finanssjef', `${type} catalog role scope`);
  assert.equal(catalog.mail_type, type, `${type} catalog type`);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  assert.ok(mails.length >= 1, `${type} catalog needs authored runtime mail`);
}

const followup = readJson('data/Civication/mailFamilies/naeringsliv/followup/okonomi_og_finanssjef_followup.json');
const consequence = readJson('data/Civication/mailFamilies/naeringsliv/consequence/okonomi_og_finanssjef_consequence.json');
assert.equal(followup.families[0].mails[0].thread_key, consequence.families[0].mails[0].thread_key, 'Follow-up and consequence must share the same decision thread');
assert.ok(plan.outcome_rules?.promoted, 'Finance chief needs a positive runtime outcome');
assert.ok(plan.outcome_rules?.fired, 'Finance chief needs a negative runtime outcome');

assert.ok(world, 'Career Gameplay Matrix must contain naeringsliv/okonomi_og_finanssjef');
for (const component of policy.playable_requirements?.runtime_gate_components || []) {
  assert.equal(world.audit?.components?.[component]?.level, 'complete', `${component} must satisfy the canonical runtime gate`);
}
for (const component of policy.contract_components || []) {
  assert.notEqual(world.audit?.components?.[component]?.level, 'missing', `${component} must not be missing for a playable world`);
}
assert.ok(world.audit?.salary?.linked_titles >= 1, 'Finance chief must retain a linked canonical career title');
assert.equal(world.audit?.salary?.exact_titles, world.audit?.salary?.linked_titles, 'Every linked finance-chief title must retain exact salary coverage');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.work_worlds, 88);
assert.equal(matrix.summary?.support_worlds, 1);
assert.equal(matrix.summary?.statuses?.reference_complete, 5);
assert.ok(matrix.summary?.statuses?.playable >= 18, 'Finance chief must become at least the eighteenth playable canonical world');
assert.ok(matrix.summary?.statuses?.partial <= 4, 'Finance chief must leave the canonical partial queue');
assert.ok(matrix.summary?.runtime_gate_pass >= 23, 'Finance chief must add one runtime-gate pass');

console.log('✓ Finance chief systematic rollout is playable under the canonical playable policy');
