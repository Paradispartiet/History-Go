'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/naeringsliv/finansdirektor.json');
const grammar = readJson('data/Civication/workGrammars/naeringsliv/finansdirektor.json');
const plan = readJson('data/Civication/mailPlans/naeringsliv/finansdirektor_plan.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.key === 'naeringsliv/finansdirektor');

assert.equal(model.schema, 'civication_role_model_v1');
assert.equal(model.version, 2);
assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, 'finansdirektor');
assert.equal(grammar.category, 'naeringsliv');
assert.equal(grammar.role_scope, 'finansdirektor');
assert.ok((grammar.work_loops || []).length >= 1, 'Finance director needs a repeatable work loop');
assert.ok((grammar.practice_stories || []).length >= 1, 'Finance director needs structured practice stories');
assert.ok(grammar.authority_boundary && Object.keys(grammar.authority_boundary).length, 'Finance director authority must be explicit');

for (const type of ['job','people','conflict','story','event','micro','followup','knowledge','consequence']) {
  const rel = `data/Civication/mailFamilies/naeringsliv/${type}/finansdirektor_${type}.json`;
  const catalog = readJson(rel);
  assert.equal(catalog.category, 'naeringsliv', `${type} catalog category`);
  assert.equal(catalog.role_scope, 'finansdirektor', `${type} catalog role scope`);
  assert.equal(catalog.mail_type, type, `${type} catalog type`);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  assert.ok(mails.length >= 1, `${type} catalog needs authored runtime mail`);
}

const followup = readJson('data/Civication/mailFamilies/naeringsliv/followup/finansdirektor_followup.json');
const consequence = readJson('data/Civication/mailFamilies/naeringsliv/consequence/finansdirektor_consequence.json');
assert.equal(followup.families[0].mails[0].thread_key, consequence.families[0].mails[0].thread_key, 'Follow-up and consequence must share the same decision thread');
assert.ok(plan.outcome_rules?.promoted, 'Finance director needs a positive runtime outcome');
assert.ok(plan.outcome_rules?.fired, 'Finance director needs a negative runtime outcome');

assert.ok(world, 'Career Gameplay Matrix must contain naeringsliv/finansdirektor');
for (const component of policy.playable_requirements?.runtime_gate_components || []) {
  assert.equal(world.audit?.components?.[component]?.level, 'complete', `${component} must satisfy the canonical runtime gate`);
}
for (const component of policy.contract_components || []) {
  assert.notEqual(world.audit?.components?.[component]?.level, 'missing', `${component} must not be missing for a playable world`);
}
assert.ok(world.audit?.salary?.linked_titles >= 1, 'Finance director must retain a linked canonical career title');
assert.equal(world.audit?.salary?.exact_titles, world.audit?.salary?.linked_titles, 'Every linked Finance director title must retain exact salary coverage');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.work_worlds, 88);
assert.equal(matrix.summary?.support_worlds, 1);
assert.equal(matrix.summary?.statuses?.reference_complete, 5);
assert.ok(matrix.summary?.statuses?.playable >= 19, 'Finance director must become at least the nineteenth playable canonical world');
assert.ok(matrix.summary?.statuses?.partial <= 3, 'Finance director must leave the canonical partial queue');
assert.ok(matrix.summary?.runtime_gate_pass >= 24, 'Finance director must add one runtime-gate pass');

console.log('✓ Finance director systematic rollout is playable under the canonical playable policy');
