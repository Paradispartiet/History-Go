'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const mailTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];

const grammar = readJson('data/Civication/workGrammars/media/media_redaksjon.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const plan = readJson('data/Civication/mailPlans/media/media_redaksjon_plan.json');

assert.equal(grammar.schema, 'civication_work_grammar_v1');
assert.equal(grammar.version, 1, 'Media newsroom FWG version must remain v1');
assert.equal(grammar.category, 'media');
assert.equal(grammar.role_scope, 'media_redaksjon');
assert.deepEqual(grammar.badge_binding.badge_titles, ['Journalist', 'Reporter', 'Redaksjonsmedarbeider']);
assert.ok(grammar.authority_boundary?.can?.length >= 3);
assert.ok(grammar.authority_boundary?.cannot?.length >= 3);
assert.ok(grammar.work_loops.length >= 5);
assert.ok(grammar.practice_stories.length >= 4);
assert.ok(grammar.actor_grammar.length >= 4, 'newsroom has structural work relationships');
assert.ok(grammar.place_grammar.length >= 3, 'newsroom uses concrete verified media work surfaces');
for (const place of ['vg_huset', 'nrk_huset_marienlyst', 'aftenposten_akersgata']) {
  assert.ok(grammar.place_grammar.some(row => row.place_id === place), `missing canonical media workplace ${place}`);
}

for (const rel of [
  'data/Civication/roleModels/media/journalist.json',
  'data/Civication/roleModels/media/reporter.json',
  'data/Civication/roleModels/media/redaksjonsmedarbeider.json'
]) {
  const model = readJson(rel);
  assert.equal(model.schema, 'civication_role_model_v1', `${rel} schema stays v1`);
  assert.equal(model.version, 1, `${rel} version stays 1`);
  assert.equal(model.category, 'media');
  assert.equal(model.role_scope, 'media_redaksjon');
}

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.version, 1);
assert.equal(plan.category, 'media');
assert.equal(plan.role_scope, 'media_redaksjon');
assert.equal(plan.sequence.length, 16);
assert.deepEqual(plan.sequence.slice(8).map(step => step.step), [9, 10, 11, 12, 13, 14, 15, 16]);
assert.ok(plan.sequence.slice(8).every(step => step.fallback_types.length === 0), 'Role World pilot steps cannot use fallback content');
assert.ok(plan.outcome_rules?.promoted, 'positive runtime outcome exists');
assert.ok(plan.outcome_rules?.fired, 'negative runtime outcome exists');

const catalogs = new Map();
for (const type of mailTypes) {
  const rel = `data/Civication/mailFamilies/media/${type}/media_redaksjon_${type}.json`;
  const catalog = readJson(rel);
  catalogs.set(type, catalog);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1', `${type} schema`);
  assert.equal(catalog.version, 1, `${type} version`);
  assert.equal(catalog.category, 'media', `${type} category`);
  assert.equal(catalog.role_scope, 'media_redaksjon', `${type} scope`);
  assert.equal(catalog.mail_type, type, `${type} mail type`);
  const mails = (catalog.families || []).flatMap(family => family.mails || []);
  assert.ok(mails.length >= 1, `${type} has authored mail`);
  assert.ok(mails.every(mail => mail.role_scope === 'media_redaksjon' && mail.mail_type === type), `${type} mails stay in scope`);
  assert.ok(mails.every(mail => Array.isArray(mail.choices) && mail.choices.length >= 2), `${type} mails expose decisions`);
}

const followup = catalogs.get('followup').families.flatMap(f => f.mails)[0];
const consequence = catalogs.get('consequence').families.flatMap(f => f.mails)[0];
assert.equal(followup.thread_key, 'media_redaksjon_verifikasjon_001');
assert.equal(consequence.thread_key, followup.thread_key, 'follow-up and consequence are one continuing newsroom thread');

const world = matrix.worlds.find(row => row.key === 'media/media_redaksjon');
assert.ok(world, 'Media newsroom remains a canonical career world');
assert.equal(world.status, 'playable');
assert.equal(world.audit.runtime_gate, true);
assert.deepEqual(world.audit.missing_components, []);
for (const component of policy.playable_requirements.runtime_gate_components) {
  assert.equal(world.audit.components[component].level, 'complete', `${component} satisfies canonical runtime gate`);
}
for (const component of policy.contract_components) {
  assert.notEqual(world.audit.components[component].level, 'missing', `${component} is not missing`);
}
assert.equal(world.audit.salary.linked_titles, 3, 'three formal newsroom job titles stay linked');
assert.equal(world.audit.salary.exact_titles, 3, 'all linked newsroom titles retain exact salary bands');

console.log('✓ Media newsroom is canonical playable without changing role-model or FWG versions');
