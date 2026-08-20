'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const mailTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];

const grammar = readJson('data/Civication/workGrammars/media/media_redaksjonell_ledelse.json');
const plan = readJson('data/Civication/mailPlans/media/media_redaksjonell_ledelse_plan.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');

assert.equal(grammar.schema, 'civication_work_grammar_v1');
assert.equal(grammar.version, 1, 'Media editorial leadership FWG version stays v1');
assert.equal(grammar.category, 'media');
assert.equal(grammar.role_scope, 'media_redaksjonell_ledelse');
assert.deepEqual(grammar.badge_binding.badge_titles, ['Redaktør', 'Sjefredaktør', 'Nyhetsleder']);
assert.ok(grammar.authority_boundary?.can?.length >= 3);
assert.ok(grammar.authority_boundary?.cannot?.length >= 3);
assert.ok(grammar.work_loops.length >= 5);
assert.ok(grammar.practice_stories.length >= 3);
assert.ok(grammar.actor_grammar.length >= 4, 'editorial leadership has structural work relationships');
assert.ok(grammar.place_grammar.length >= 3, 'editorial leadership uses concrete verified media work surfaces');
for (const place of ['vg_huset', 'nrk_huset_marienlyst', 'aftenposten_akersgata']) {
  assert.ok(grammar.place_grammar.some(row => row.place_id === place), `missing canonical media workplace ${place}`);
}

for (const rel of [
  'data/Civication/roleModels/media/redaktor.json',
  'data/Civication/roleModels/media/sjefredaktor.json',
  'data/Civication/roleModels/media/nyhetsleder.json'
]) {
  const model = readJson(rel);
  assert.equal(model.schema, 'civication_role_model_v1', `${rel} schema stays v1`);
  assert.equal(model.version, 1, `${rel} version stays 1`);
  assert.equal(model.category, 'media');
  assert.equal(model.role_scope, 'media_redaksjonell_ledelse');
  assert.ok(model.career_path?.progression_to?.length >= 1, `${rel} retains progression`);
  assert.ok(model.career_path?.possible_exits?.length >= 1, `${rel} retains exits`);
}

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.version, 1);
assert.equal(plan.category, 'media');
assert.equal(plan.role_scope, 'media_redaksjonell_ledelse');
assert.equal(plan.sequence.length, 8);
assert.ok(plan.outcome_rules?.promoted, 'positive runtime outcome exists');
assert.ok(plan.outcome_rules?.fired, 'negative runtime outcome exists');

const catalogs = new Map();
const mailIds = new Set();
for (const type of mailTypes) {
  const rel = `data/Civication/mailFamilies/media/${type}/media_redaksjonell_ledelse_${type}.json`;
  const catalog = readJson(rel);
  catalogs.set(type, catalog);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1', `${type} schema`);
  assert.equal(catalog.version, 1, `${type} version`);
  assert.equal(catalog.category, 'media', `${type} category`);
  assert.equal(catalog.role_scope, 'media_redaksjonell_ledelse', `${type} scope`);
  assert.equal(catalog.mail_type, type, `${type} mail type`);
  const mails = (catalog.families || []).flatMap(family => family.mails || []);
  assert.ok(mails.length >= 1, `${type} has authored mail`);
  for (const mail of mails) {
    assert.ok(!mailIds.has(mail.id), `${mail.id} is unique inside the editorial-leadership package`);
    mailIds.add(mail.id);
    assert.equal(mail.role_scope, 'media_redaksjonell_ledelse');
    assert.equal(mail.mail_type, type);
    assert.ok(['vg_huset', 'nrk_huset_marienlyst', 'aftenposten_akersgata'].includes(mail.place_id), `${mail.id} uses a canonical media work surface`);
    assert.ok(mail.people_ref, `${mail.id} has a work-relationship owner`);
    assert.ok(mail.choice_axis && mail.consequence_axis && mail.narrative_arc, `${mail.id} binds decisions to consequences`);
    assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3, `${mail.id} is a concrete situation`);
    assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} exposes a meaningful decision`);
    assert.ok(mail.choices.every(choice => choice.feedback), `${mail.id} explains immediate feedback`);
  }
}

const followup = catalogs.get('followup').families.flatMap(f => f.mails)[0];
const consequence = catalogs.get('consequence').families.flatMap(f => f.mails)[0];
assert.equal(followup.thread_key, 'media_redaksjonell_ledelse_publisering_001');
assert.equal(consequence.thread_key, followup.thread_key, 'follow-up and consequence continue one editorial-leadership thread');

const world = matrix.worlds.find(row => row.key === 'media/media_redaksjonell_ledelse');
assert.ok(world, 'Media editorial leadership remains a canonical career world');
assert.equal(world.status, 'playable');
assert.equal(world.audit.runtime_gate, true);
assert.deepEqual(world.audit.missing_components, []);
for (const component of policy.playable_requirements.runtime_gate_components) {
  assert.equal(world.audit.components[component].level, 'complete', `${component} satisfies canonical runtime gate`);
}
for (const component of policy.contract_components) {
  assert.notEqual(world.audit.components[component].level, 'missing', `${component} is not missing`);
}
const partialComponents = policy.contract_components.filter(component => world.audit.components[component].level === 'partial');
assert.deepEqual(partialComponents, ['practice_stories'], 'only practice-story depth remains partial');
assert.equal(world.audit.complete_components.length, 14);
assert.equal(world.audit.salary.linked_titles, 3, 'three formal editorial-leadership job titles stay linked');
assert.equal(world.audit.salary.exact_titles, 3, 'all linked editorial-leadership titles retain exact salary bands');

console.log('✓ Media editorial leadership is canonical playable with 14 complete components and one intentional practice-story partial');
