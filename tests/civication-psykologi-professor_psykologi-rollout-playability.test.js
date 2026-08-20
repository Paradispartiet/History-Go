'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const mailTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const workSurfaces = [
  'psykologi_professor_psykologi_fagmiljo',
  'psykologi_professor_psykologi_veiledningsrom',
  'psykologi_professor_psykologi_undervisningsverksted'
];

const model = readJson('data/Civication/roleModels/psykologi/professor_psykologi.json');
const grammar = readJson('data/Civication/workGrammars/psykologi/professor_psykologi.json');
const plan = readJson('data/Civication/mailPlans/psykologi/professor_psykologi_plan.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');

assert.equal(model.schema, 'civication_role_model_v1');
assert.equal(model.version, 1, 'existing Psychology professor roleModel stays v1');
assert.equal(model.category, 'psykologi');
assert.equal(model.role_scope, 'professor_psykologi');
assert.equal(model.title, 'Professor (psykologi)');
assert.equal(model.source?.tier_threshold, 380, 'canonical professor threshold stays 380');
assert.ok(model.scope_boundary?.cannot?.some(line => /psykologautorisasjon/.test(line)), 'professor title never implies psychologist authorization');
assert.ok(model.scope_boundary?.cannot?.some(line => /diagnostisere eller behandle/.test(line)), 'clinical authority boundary remains explicit');
assert.ok(model.scope_boundary?.cannot?.some(line => /studenters eller yngre forskeres ideer/.test(line)), 'credit and ownership boundary remains explicit');
assert.ok(model.career_path?.possible_promotions?.length >= 1);
assert.ok(model.career_path?.possible_exits?.length >= 1);

assert.equal(grammar.schema, 'civication_work_grammar_v1');
assert.equal(grammar.version, 1, 'existing Psychology professor FWG stays v1');
assert.equal(grammar.category, 'psykologi');
assert.equal(grammar.role_scope, 'professor_psykologi');
assert.deepEqual(grammar.badge_binding.badge_titles, ['Professor (psykologi)']);
assert.equal(grammar.badge_binding.tier_threshold, 380);
assert.ok(grammar.authority_boundary.may_not.some(line => /psykologautorisasjon/.test(line)));
assert.ok(grammar.authority_boundary.may_not.some(line => /diagnostisere eller behandle/.test(line)));
assert.ok(grammar.work_loops.length >= 5);
assert.ok(grammar.practice_stories.length >= 4);
assert.ok(grammar.actor_grammar.length >= 4, 'role has explicit academic work relationships');
assert.equal(grammar.place_grammar.length, 3, 'role has three concrete functional academic work surfaces');
assert.ok(grammar.place_grammar.every(surface => surface.kind === 'fictionalized_work_surface'));
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, mailTypes);

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.version, 1);
assert.equal(plan.category, 'psykologi');
assert.equal(plan.role_scope, 'professor_psykologi');
assert.equal(plan.sequence.length, 8);
assert.ok(plan.outcome_rules?.promoted, 'positive runtime outcome exists');
assert.ok(plan.outcome_rules?.fired, 'negative runtime outcome exists');

const catalogs = new Map();
const mailIds = new Set();
for (const type of mailTypes) {
  const rel = `data/Civication/mailFamilies/psykologi/${type}/professor_psykologi_${type}.json`;
  const catalog = readJson(rel);
  catalogs.set(type, catalog);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1', `${type} schema`);
  assert.equal(catalog.version, 1, `${type} version`);
  assert.equal(catalog.category, 'psykologi', `${type} category`);
  assert.equal(catalog.role_scope, 'professor_psykologi', `${type} scope`);
  assert.equal(catalog.mail_type, type, `${type} mail type`);
  const mails = (catalog.families || []).flatMap(family => family.mails || []);
  assert.ok(mails.length >= 1, `${type} has authored mail`);
  for (const mail of mails) {
    assert.ok(!mailIds.has(mail.id), `${mail.id} is unique inside the role package`);
    mailIds.add(mail.id);
    assert.equal(mail.role_scope, 'professor_psykologi');
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

const conflict = catalogs.get('conflict').families.flatMap(family => family.mails)[0];
const followup = catalogs.get('followup').families.flatMap(family => family.mails)[0];
const consequence = catalogs.get('consequence').families.flatMap(family => family.mails)[0];
assert.equal(conflict.thread_key, 'psykologi_professor_psykologi_programkritikk_001');
assert.equal(followup.thread_key, conflict.thread_key, 'follow-up continues the program-critique thread');
assert.equal(consequence.thread_key, conflict.thread_key, 'consequence continues the program-critique thread');

const job = catalogs.get('job').families.flatMap(family => family.mails)[0];
assert.ok(job.choices.some(choice => choice.tags.includes('credit_capture')), 'unsafe hierarchical credit capture is explicit');
const knowledge = catalogs.get('knowledge').families.flatMap(family => family.mails)[0];
assert.match(knowledge.summary, /veileder- og prosjektlederrolle/, 'knowledge scene teaches role versus intellectual contribution');
assert.ok(knowledge.choices.some(choice => choice.tags.includes('power_abuse')), 'unsafe status-based credit is explicit');
const event = catalogs.get('event').families.flatMap(family => family.mails)[0];
assert.ok(event.choices.some(choice => choice.tags.includes('teaching_as_residual')), 'unsafe teaching-as-residual choice is explicit');

const world = matrix.worlds.find(row => row.key === 'psykologi/professor_psykologi');
assert.ok(world, 'Psychology professor remains a canonical career world');
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

console.log('✓ Psykologi professor_psykologi is canonical playable with 14 complete components and one intentional practice-story partial');
