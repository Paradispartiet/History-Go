'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const mailTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const workSurfaces = ['litteratur_manusdesk', 'litteratur_versjonsarkiv', 'litteratur_produksjonsmote'];

const model = readJson('data/Civication/roleModels/litteratur/redaksjonsmedarbeider.json');
const grammar = readJson('data/Civication/workGrammars/litteratur/redaksjonsmedarbeider.json');
const plan = readJson('data/Civication/mailPlans/litteratur/redaksjonsmedarbeider_plan.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');

assert.equal(model.schema, 'civication_role_model_v1');
assert.equal(model.version, 2, 'existing Litteratur roleModel version stays 2');
assert.equal(model.category, 'litteratur');
assert.equal(model.role_scope, 'redaksjonsmedarbeider');
assert.ok(model.authority_boundaries?.can?.length >= 3);
assert.ok(model.authority_boundaries?.cannot?.length >= 3);
assert.ok(model.career_path?.progression_to?.some(value => value.startsWith('Redaktør (bok)')));
assert.ok(model.career_path?.possible_exits?.length >= 1);

assert.equal(grammar.schema, 'civication_work_grammar_v1');
assert.equal(grammar.version, 1, 'existing Litteratur FWG version stays 1');
assert.equal(grammar.category, 'litteratur');
assert.equal(grammar.role_scope, 'redaksjonsmedarbeider');
assert.deepEqual(grammar.badge_binding.badge_titles, ['Redaksjonsmedarbeider']);
assert.ok(grammar.work_loops.length >= 4);
assert.ok(grammar.practice_stories.length >= 5);
assert.ok(grammar.actor_grammar.length >= 4, 'role has explicit work relationships');
assert.equal(grammar.place_grammar.length, 3, 'role has three concrete functional work surfaces');
assert.ok(grammar.place_grammar.every(surface => surface.kind === 'fictionalized_work_surface'), 'work surfaces do not make claims about specific employers');
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, mailTypes);

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.version, 1);
assert.equal(plan.category, 'litteratur');
assert.equal(plan.role_scope, 'redaksjonsmedarbeider');
assert.equal(plan.sequence.length, 8);
assert.ok(plan.outcome_rules?.promoted, 'positive runtime outcome exists');
assert.ok(plan.outcome_rules?.fired, 'negative runtime outcome exists');

const catalogs = new Map();
const mailIds = new Set();
for (const type of mailTypes) {
  const rel = `data/Civication/mailFamilies/litteratur/${type}/redaksjonsmedarbeider_${type}.json`;
  const catalog = readJson(rel);
  catalogs.set(type, catalog);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1', `${type} schema`);
  assert.equal(catalog.version, 1, `${type} version`);
  assert.equal(catalog.category, 'litteratur', `${type} category`);
  assert.equal(catalog.role_scope, 'redaksjonsmedarbeider', `${type} scope`);
  assert.equal(catalog.mail_type, type, `${type} mail type`);
  const mails = (catalog.families || []).flatMap(family => family.mails || []);
  assert.ok(mails.length >= 1, `${type} has authored mail`);
  for (const mail of mails) {
    assert.ok(!mailIds.has(mail.id), `${mail.id} is unique inside the role package`);
    mailIds.add(mail.id);
    assert.equal(mail.role_scope, 'redaksjonsmedarbeider');
    assert.equal(mail.mail_type, type);
    assert.ok(workSurfaces.includes(mail.place_id), `${mail.id} uses an explicit fictionalized work surface`);
    assert.ok(mail.people_ref, `${mail.id} has a work-relationship owner`);
    assert.ok(mail.choice_axis && mail.consequence_axis && mail.narrative_arc, `${mail.id} binds decisions to consequences`);
    assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3, `${mail.id} is a concrete situation`);
    assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} exposes a meaningful decision`);
    assert.ok(mail.choices.every(choice => choice.feedback), `${mail.id} explains immediate feedback`);
  }
}

const followup = catalogs.get('followup').families.flatMap(family => family.mails)[0];
const consequence = catalogs.get('consequence').families.flatMap(family => family.mails)[0];
assert.equal(followup.thread_key, 'litteratur_redaksjonsmedarbeider_versjon_001');
assert.equal(consequence.thread_key, followup.thread_key, 'follow-up and consequence continue one manuscript-version thread');

const world = matrix.worlds.find(row => row.key === 'litteratur/redaksjonsmedarbeider');
assert.ok(world, 'Litteratur editorial assistant remains a canonical career world');
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
assert.equal(world.audit.salary.linked_titles, 1);
assert.equal(world.audit.salary.exact_titles, 1);

console.log('✓ Litteratur redaksjonsmedarbeider is canonical playable with 14 complete components and one intentional practice-story partial');
