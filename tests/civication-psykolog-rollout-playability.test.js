'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const mailTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const canonicalPlaceId = 'psykologisk_institutt_uio';
const realPeopleNames = new Set(['Harald Schjelderup', 'Ragnar Rommetveit', 'Åse Gruda Skard', 'Nic Waal']);

const model = readJson('data/Civication/roleModels/psykologi/psykolog.json');
const grammar = readJson('data/Civication/workGrammars/psykologi/psykolog.json');
const plan = readJson('data/Civication/mailPlans/psykologi/psykolog_plan.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const scenarioPeople = readJson('data/Civication/scenarioPeople/generated/psykologi.json');
const canonicalPeople = readJson('data/people/psykologi/oslo/people_psykologi_oslo.json');
const placeManifest = readJson('data/places/manifest.json');

assert.equal(model.schema, 'civication_role_model_v1');
assert.equal(model.category, 'psykologi');
assert.equal(model.role_scope, 'psykolog');
assert.ok(model.scope_boundary?.cannot?.some(line => /autorisasjon eller lisens/.test(line)), 'protected-title gate remains explicit');
assert.ok(model.scope_boundary?.cannot?.some(line => /spesialistgodkjenning/.test(line)), 'authorization is not misrepresented as specialist approval');
assert.ok(model.career_path?.possible_exits?.length >= 1);
assert.deepEqual(model.mail_integration.can_feed_mail_types, mailTypes, 'roleModel exposes every authored mail family');

assert.equal(grammar.schema, 'civication_work_grammar_v1');
assert.equal(grammar.role_scope, 'psykolog');
assert.deepEqual(grammar.badge_binding.badge_titles, ['Psykolog']);
assert.equal(grammar.badge_binding.tier_threshold, 115);
assert.ok(grammar.work_loops.length >= 5, 'repeatable clinical work loop is explicit');
assert.ok(grammar.actor_grammar.length >= 4, 'fictional work relationships are explicit');
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, mailTypes);
assert.deepEqual(grammar.place_grammar.map(place => place.place_id), [canonicalPlaceId], 'only the canonical psychology place is declared');
assert.ok(grammar.place_grammar.every(place => place.kind === 'canonical_history_go_place'));
assert.ok(placeManifest.files.includes(`places/psykologi/oslo/places_psykologi/${canonicalPlaceId}.json`), 'place exists in canonical manifest');

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.version, 1);
assert.equal(plan.category, 'psykologi');
assert.equal(plan.role_scope, 'psykolog');
assert.equal(plan.sequence.length, 9);
assert.ok(plan.outcome_rules?.promoted, 'positive runtime outcome exists');
assert.ok(plan.outcome_rules?.fired, 'negative runtime outcome exists');

const catalogs = new Map();
const mailIds = new Set();
for (const type of mailTypes) {
  const rel = `data/Civication/mailFamilies/psykologi/${type}/psykolog_${type}.json`;
  const catalog = readJson(rel);
  catalogs.set(type, catalog);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1', `${type} schema`);
  assert.equal(catalog.version, 1, `${type} version`);
  assert.equal(catalog.category, 'psykologi', `${type} category`);
  assert.equal(catalog.role_scope, 'psykolog', `${type} scope`);
  assert.equal(catalog.mail_type, type, `${type} mail type`);
  const mails = (catalog.families || []).flatMap(family => family.mails || []);
  assert.ok(mails.length >= 1, `${type} has authored mail`);
  for (const mail of mails) {
    assert.ok(!mailIds.has(mail.id), `${mail.id} is unique inside the role package`);
    mailIds.add(mail.id);
    assert.equal(mail.role_scope, 'psykolog');
    assert.equal(mail.mail_type, type);
    assert.ok(mail.people_ref, `${mail.id} has a fictional work-relationship owner`);
    assert.ok(!realPeopleNames.has(mail.from), `${mail.id} does not impersonate a real person`);
    assert.ok(mail.place_id == null || mail.place_id === canonicalPlaceId, `${mail.id} never invents a History Go place id`);
    assert.ok(mail.choice_axis && mail.consequence_axis && mail.narrative_arc, `${mail.id} binds decisions to consequences`);
    assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3, `${mail.id} is a concrete situation`);
    assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} exposes a meaningful decision`);
    assert.ok(mail.choices.every(choice => choice.feedback), `${mail.id} explains immediate feedback`);
    assert.ok(mail.choices.every(choice => choice.effects?.stats), `${mail.id} supplies Psychology runtime stat effects`);
  }
}

const peopleRole = scenarioPeople.roles.find(role => role.role_scope === 'psykolog');
assert.ok(peopleRole, 'scenario People catalog contains the psychologist role');
assert.deepEqual(peopleRole.resolution.direct_person_ids, ['ase_gruda_skard', 'harald_schjelderup', 'ragnar_rommetveit']);
assert.ok(peopleRole.resolution.excluded_people.some(row => row.person_id === 'nic_waal' && /psykiater/.test(row.reason)), 'Nic Waal remains correctly excluded as a direct psychologist example');

const knowledge = catalogs.get('knowledge').families.flatMap(family => family.mails)[0];
assert.equal(knowledge.task_payload.task_kind, 'history_go_person');
assert.equal(knowledge.task_payload.target_type, 'person');
assert.equal(knowledge.task_payload.completion_mode, 'read_profile');
assert.ok(peopleRole.resolution.direct_person_ids.includes(knowledge.task_payload.person_id), 'History Go target is direct for the psychologist role');
assert.ok(canonicalPeople.some(person => person.id === knowledge.task_payload.person_id && person.placeId === canonicalPlaceId), 'target person and place are canonical');
assert.match(knowledge.summary, /kliniske? beslutningsgrunnlag/, 'historical source is not presented as clinical authority');

global.window = global;
global.document = undefined;
global.localStorage = {getItem() { return null; }, setItem() {}, removeItem() {}};
vm.runInThisContext(fs.readFileSync(path.join(root, 'js/Civication/core/civicationTaskEngine.js'), 'utf8'));
const normalizedPayload = global.CivicationTaskEngine.normalizeHistoryGoTaskPayload(knowledge.task_payload);
assert.equal(global.CivicationTaskEngine.isHistoryGoTaskPayload(normalizedPayload), true, 'authored task is recognized as a History Go task');
assert.equal(normalizedPayload.target_id, 'harald_schjelderup');
assert.equal(normalizedPayload.return_context.mail_id, knowledge.id);

const registry = readJson('data/Civication/compiledSceneRegistryV1.json');
const compiledKnowledge = registry.entries.find(entry => entry.id === knowledge.id);
assert.ok(compiledKnowledge, 'knowledge mail is compiled into the canonical Scene Pipeline');
assert.equal(compiledKnowledge.scene.interaction_mode, 'task');
assert.equal(compiledKnowledge.scene.task_contract.task_id, 'psykolog_history_go_schjelderup');
assert.equal(compiledKnowledge.compatibility_projection.task_payload.person_id, 'harald_schjelderup', 'runtime compatibility projection retains the History Go payload');
assert.deepEqual(registry.role_index['psykologi/psykolog'].sort(), [...mailIds].sort(), 'all authored psychologist mails are runtime-reachable');

const followup = catalogs.get('followup').families.flatMap(family => family.mails)[0];
const consequence = catalogs.get('consequence').families.flatMap(family => family.mails)[0];
assert.equal(followup.thread_key, 'psykolog_plan_001');
assert.equal(consequence.thread_key, followup.thread_key, 'follow-up and consequence continue the same clinical learning thread');

const world = matrix.worlds.find(row => row.key === 'psykologi/psykolog');
assert.ok(world, 'psychologist remains a canonical career world');
assert.equal(world.status, 'playable');
assert.equal(world.audit.runtime_gate, true);
assert.deepEqual(world.audit.missing_components, []);
for (const component of policy.playable_requirements.runtime_gate_components) {
  assert.equal(world.audit.components[component].level, 'complete', `${component} satisfies canonical runtime gate`);
}
for (const component of policy.contract_components) {
  assert.notEqual(world.audit.components[component].level, 'missing', `${component} is not missing`);
}
assert.deepEqual(policy.contract_components.filter(component => world.audit.components[component].level === 'partial'), ['practice_stories']);
assert.equal(world.audit.complete_components.length, 14);
assert.equal(world.audit.salary.linked_titles, 1);
assert.equal(world.audit.salary.exact_titles, 1);

console.log('✓ Psykolog is canonical playable with a source-bounded History Go People task and 14 complete components');
