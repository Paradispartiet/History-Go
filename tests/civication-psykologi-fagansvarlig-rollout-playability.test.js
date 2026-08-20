'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const mailTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const workSurfaces = [
  'psykologi_fagansvarlig_kvalitetsrom',
  'psykologi_fagansvarlig_veiledningsrom',
  'psykologi_fagansvarlig_forbedringsrad'
];

const model = readJson('data/Civication/roleModels/psykologi/fagansvarlig.json');
const grammar = readJson('data/Civication/workGrammars/psykologi/fagansvarlig.json');
const plan = readJson('data/Civication/mailPlans/psykologi/fagansvarlig_plan.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');

assert.equal(model.schema, 'civication_role_model_v1');
assert.equal(model.version, 1, 'existing Psychology Fagansvarlig roleModel stays v1');
assert.equal(model.category, 'psykologi');
assert.equal(model.role_scope, 'fagansvarlig');
assert.ok(model.scope_boundary?.can?.length >= 3);
assert.ok(model.scope_boundary?.cannot?.some(line => /psykisk helsevernloven/.test(line)), 'legal role boundary remains explicit');
assert.ok(model.scope_boundary?.cannot?.some(line => /diagnostisere eller behandle/.test(line)), 'clinical authority boundary remains explicit');
assert.ok(model.career_path?.progression_to?.length >= 1);
assert.ok(model.career_path?.possible_exits?.length >= 1);

assert.equal(grammar.schema, 'civication_work_grammar_v1');
assert.equal(grammar.version, 1, 'existing Psychology Fagansvarlig FWG stays v1');
assert.equal(grammar.category, 'psykologi');
assert.equal(grammar.role_scope, 'fagansvarlig');
assert.deepEqual(grammar.badge_binding.badge_titles, ['Fagansvarlig']);
assert.equal(grammar.badge_binding.tier_threshold, 190);
assert.ok(grammar.authority_boundary.may_not.some(line => /psykisk helsevernloven/.test(line)));
assert.ok(grammar.work_loops.length >= 4);
assert.ok(grammar.practice_stories.length >= 4);
assert.ok(grammar.actor_grammar.length >= 4, 'role has explicit work relationships');
assert.equal(grammar.place_grammar.length, 3, 'role has three concrete functional work surfaces');
assert.ok(grammar.place_grammar.every(surface => surface.kind === 'fictionalized_work_surface'));
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, mailTypes);

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.version, 1);
assert.equal(plan.category, 'psykologi');
assert.equal(plan.role_scope, 'fagansvarlig');
assert.equal(plan.sequence.length, 8);
assert.ok(plan.outcome_rules?.promoted, 'positive runtime outcome exists');
assert.ok(plan.outcome_rules?.fired, 'negative runtime outcome exists');

const catalogs = new Map();
const mailIds = new Set();
for (const type of mailTypes) {
  const rel = `data/Civication/mailFamilies/psykologi/${type}/fagansvarlig_${type}.json`;
  const catalog = readJson(rel);
  catalogs.set(type, catalog);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1', `${type} schema`);
  assert.equal(catalog.version, 1, `${type} version`);
  assert.equal(catalog.category, 'psykologi', `${type} category`);
  assert.equal(catalog.role_scope, 'fagansvarlig', `${type} scope`);
  assert.equal(catalog.mail_type, type, `${type} mail type`);
  const mails = (catalog.families || []).flatMap(family => family.mails || []);
  assert.ok(mails.length >= 1, `${type} has authored mail`);
  for (const mail of mails) {
    assert.ok(!mailIds.has(mail.id), `${mail.id} is unique inside the role package`);
    mailIds.add(mail.id);
    assert.equal(mail.role_scope, 'fagansvarlig');
    assert.equal(mail.mail_type, type);
    assert.ok(workSurfaces.includes(mail.place_id), `${mail.id} uses an explicit fictionalized work surface`);
    assert.ok(mail.people_ref, `${mail.id} has a work-relationship owner`);
    assert.ok(mail.choice_axis && mail.consequence_axis && mail.narrative_arc, `${mail.id} binds decisions to consequences`);
    assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3, `${mail.id} is a concrete situation`);
    assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} exposes a meaningful decision`);
    assert.ok(mail.choices.every(choice => choice.feedback), `${mail.id} explains immediate feedback`);
    assert.ok(mail.choices.every(choice => choice.effects?.stats), `${mail.id} supplies Psychology runtime stat effects`);
  }
}

const followup = catalogs.get('followup').families.flatMap(family => family.mails)[0];
const consequence = catalogs.get('consequence').families.flatMap(family => family.mails)[0];
assert.equal(followup.thread_key, 'psykologi_fagansvarlig_avvik_001');
assert.equal(consequence.thread_key, followup.thread_key, 'follow-up and consequence continue one system-learning thread');

const knowledge = catalogs.get('knowledge').families.flatMap(family => family.mails)[0];
assert.match(knowledge.summary, /lovregulert myndighet/, 'knowledge scene teaches the legal authority boundary');
assert.ok(knowledge.choices.some(choice => choice.tags.includes('authority_overreach')), 'unsafe authority overreach is explicit');

const world = matrix.worlds.find(row => row.key === 'psykologi/fagansvarlig');
assert.ok(world, 'Psychology Fagansvarlig remains a canonical career world');
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

console.log('✓ Psykologi fagansvarlig is canonical playable with 14 complete components and one intentional practice-story partial');
