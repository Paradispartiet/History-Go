'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const mailTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];

const roleModel = readJson('data/Civication/roleModels/film_tv/kurator_film_tv.json');
const grammar = readJson('data/Civication/workGrammars/film_tv/kurator_film_tv.json');
const plan = readJson('data/Civication/mailPlans/film_tv/kurator_film_tv_plan.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');

assert.equal(roleModel.schema, 'civication_role_model_v2');
assert.equal(roleModel.version, 2, 'Film/TV curator roleModel version stays v2');
assert.equal(roleModel.category, 'film_tv');
assert.equal(roleModel.role_scope, 'kurator_film_tv');
assert.equal(roleModel.role_id, 'film_tv_kurator_film_tv');
assert.deepEqual(roleModel.badge_titles, ['Kurator (film/TV)']);
assert.ok(roleModel.required_knowledge?.concepts?.length >= 4, 'curator has functional knowledge');
assert.ok(roleModel.related_people?.length >= 4, 'curator has a typed work relationship layer');
assert.ok(roleModel.related_places?.some(place => place.id === 'cinemateket_oslo'), 'curator uses the canonical Cinemateket Oslo place');
assert.ok(roleModel.career_path?.possible_promotions?.length >= 2, 'curator has a real progression path');
assert.ok(roleModel.career_path?.possible_exits?.length >= 4, 'curator has voluntary and involuntary exits');

assert.equal(grammar.schema, 'civication_work_grammar_v2');
assert.equal(grammar.version, 2, 'Film/TV curator FWG version stays v2');
assert.equal(grammar.category, 'film_tv');
assert.equal(grammar.role_scope, 'kurator_film_tv');
assert.deepEqual(grammar.badge_binding.badge_titles, ['Kurator (film/TV)']);
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, mailTypes);
assert.ok(grammar.authority_boundary?.may?.length >= 4);
assert.ok(grammar.authority_boundary?.must_escalate_when?.length >= 3);
assert.ok(grammar.authority_boundary?.may_not?.length >= 4);
assert.ok(grammar.work_loops?.length >= 2);
assert.ok(grammar.practice_stories?.length >= 5);

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.category, 'film_tv');
assert.equal(plan.role_scope, 'kurator_film_tv');
assert.equal(plan.sequence.length, 11, 'Role World rollout preserves the starter arc and adds the complete curator work cycle');
assert.deepEqual(
  plan.sequence.map(step => step.type),
  ['job', 'people', 'conflict', 'event', 'job', 'people', 'knowledge', 'conflict', 'followup', 'event', 'consequence'],
);
assert.ok(plan.outcome_rules?.promoted, 'positive runtime outcome exists');
assert.ok(plan.outcome_rules?.fired, 'negative runtime outcome exists');

const catalogs = new Map();
const mailIds = new Set();
for (const type of mailTypes) {
  const rel = `data/Civication/mailFamilies/film_tv/${type}/kurator_film_tv_${type}.json`;
  const catalog = readJson(rel);
  catalogs.set(type, catalog);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1', `${type} schema`);
  assert.equal(catalog.version, 1, `${type} version`);
  assert.equal(catalog.category, 'film_tv', `${type} category`);
  assert.equal(catalog.role_scope, 'kurator_film_tv', `${type} scope`);
  assert.equal(catalog.mail_type, type, `${type} mail type`);
  const mails = (catalog.families || []).flatMap(family => family.mails || []);
  assert.ok(mails.length >= 1, `${type} has authored mail`);
  for (const mail of mails) {
    assert.ok(!mailIds.has(mail.id), `${mail.id} is unique inside the curator package`);
    mailIds.add(mail.id);
    assert.equal(mail.role_scope, 'kurator_film_tv');
    assert.equal(mail.mail_type, type);
    assert.equal(mail.place_id, 'cinemateket_oslo', `${mail.id} stays anchored to the canonical Film/TV venue`);
    assert.ok(mail.people_ref, `${mail.id} has a work-relationship owner`);
    assert.ok(mail.choice_axis && mail.consequence_axis && mail.narrative_arc, `${mail.id} binds decisions to consequences`);
    assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3, `${mail.id} is a concrete situation`);
    assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} exposes a meaningful decision`);
    assert.ok(mail.choices.every(choice => choice.feedback), `${mail.id} explains immediate feedback`);
  }
}

const followup = catalogs.get('followup').families.flatMap(f => f.mails)[0];
const consequence = catalogs.get('consequence').families.flatMap(f => f.mails)[0];
assert.equal(followup.thread_key, 'film_tv_kurator_rettigheter_001');
assert.equal(consequence.thread_key, followup.thread_key, 'follow-up and consequence continue one rights thread');

const world = matrix.worlds.find(row => row.key === 'film_tv/kurator_film_tv');
assert.ok(world, 'Film/TV curator remains a canonical career world');
assert.equal(world.status, 'playable');
assert.equal(world.audit.runtime_gate, true);
assert.deepEqual(world.audit.missing_components, []);
for (const component of policy.playable_requirements.runtime_gate_components) {
  assert.equal(world.audit.components[component].level, 'complete', `${component} satisfies the canonical runtime gate`);
}
for (const component of policy.contract_components) {
  assert.notEqual(world.audit.components[component].level, 'missing', `${component} is not missing`);
}
const partialComponents = policy.contract_components.filter(component => world.audit.components[component].level === 'partial');
assert.deepEqual(partialComponents, ['practice_stories'], 'only practice-story depth remains partial');
assert.equal(world.audit.complete_components.length, 14);
assert.equal(world.audit.salary.linked_titles, 1);
assert.equal(world.audit.salary.exact_titles, 1);

console.log('✓ Film/TV curator is canonical playable with 14 complete components and one intentional practice-story partial');
