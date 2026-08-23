#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const category = 'filosofi';
const roleScope = 'filosofi_undervisning_og_akademia';
const roleId = roleScope;
const mailTypes = ['job','people','conflict','story','event','micro','followup','knowledge','consequence'];
const planSequenceTypes = ['job','people','conflict','story','event','micro','knowledge','followup','consequence'];
const fictionalPeople = new Set([
  'sigrid_studieleder_filosofi',
  'emil_seminarleder_filosofi',
  'amal_sensorpartner_filosofi',
  'nora_studiekonsulent_filosofi'
]);
const fictionalPlaces = new Set([
  'forelesningsrom_filosofi',
  'seminarrom_filosofi',
  'vurderingsrom_filosofi',
  'veiledningsrom_filosofi'
]);
const canonicalPersonId = 'arne_naess';
const canonicalPlaceId = 'maerradalen';

const roleModel = readJson(`data/Civication/roleModels/${category}/${roleScope}.json`);
const grammar = readJson(`data/Civication/workGrammars/${category}/${roleScope}.json`);
const plan = readJson(`data/Civication/mailPlans/${category}/${roleScope}_plan.json`);
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const badge = readJson('data/badges/filosofi.json');
const canonicalPeople = readJson('data/people/natur/oslo/people_natur_oslo.json');

assert.equal(roleModel.schema, 'civication_role_model_v2');
assert.equal(roleModel.version, 2);
assert.equal(roleModel.category, category);
assert.equal(roleModel.role_scope, roleScope);
assert.equal(roleModel.role_id, roleId);
assert.deepEqual(roleModel.badge_titles, ['Foreleser', 'Professor']);
assert.deepEqual(new Set(roleModel.related_people.map(person => person.id)), fictionalPeople);
assert.ok(roleModel.related_people.every(person => person.fictional === true));
assert.ok(roleModel.related_people.every(person => /Fiktiv/.test(person.function)));
assert.ok(roleModel.required_knowledge?.concepts?.length >= 8);
assert.ok(roleModel.authority_boundaries.cannot.includes('gjore_personlig_enighet_til_vurderingskriterium'));
assert.ok(roleModel.authority_boundaries.cannot.includes('avgjore_formell_fuskesak_eller_sanksjon_alene'));
assert.ok(roleModel.authority_boundaries.cannot.includes('late_som_badge_poeng_eller_Professor_tier_er_akademisk_kvalifikasjon_eller_ansettelse'));
assert.ok(roleModel.career_path.possible_promotions.some(item => /Professor.*separat faglig kvalifikasjon og ansettelse/.test(item)));
assert.ok(roleModel.career_path.possible_exits.length >= 4);
assert.deepEqual(roleModel.mail_integration.can_feed_mail_types, mailTypes);

assert.equal(grammar.schema, 'civication_work_grammar_v2');
assert.equal(grammar.version, 2);
assert.equal(grammar.category, category);
assert.equal(grammar.role_scope, roleScope);
assert.deepEqual(grammar.badge_binding.badge_titles, ['Foreleser', 'Professor']);
assert.deepEqual(grammar.badge_binding.tier_thresholds, [240, 300]);
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, mailTypes);
assert.equal(grammar.mail_generation_contract.forbid_generic_runtime_fallbacks, true);
assert.ok(grammar.work_loops.length >= 2);
assert.ok(grammar.practice_stories.length >= 10);
assert.ok(grammar.task_grammar.length >= 4);
assert.deepEqual(new Set(grammar.actor_grammar.map(actor => actor.example_id)), fictionalPeople);
assert.ok(grammar.actor_grammar.every(actor => actor.fictional === true));
assert.deepEqual(new Set(grammar.place_grammar.filter(place => place.kind === 'fictional_work_surface').map(place => place.place_id)), fictionalPlaces);
assert.deepEqual(grammar.place_grammar.filter(place => place.kind === 'canonical_history_go_place').map(place => place.place_id), [canonicalPlaceId]);
assert.ok(grammar.authority_boundary.must_escalate_when.length >= 5);
assert.ok(grammar.authority_boundary.may_not.includes('bruke_historiske_filosofer_som_fiktive_radgivere_eller_normativ_fasit'));
assert.ok(grammar.authority_boundary.may_not.includes('late_som_badge_poeng_er_akademisk_kvalifikasjon_eller_ansettelse'));
assert.ok(fs.existsSync(path.join(root, 'data/places/natur/oslo/places_oslo_natur_hovedsteder/maerradalen.json')));

const foreleser = badge.tiers.find(tier => tier.label === 'Foreleser');
const professor = badge.tiers.find(tier => tier.label === 'Professor');
assert.equal(foreleser.threshold, 240);
assert.equal(foreleser.career_offer.role_scope, roleScope);
assert.equal(foreleser.career_offer.policy, 'appointment_required');
assert.deepEqual(foreleser.career_offer.qualification_ids, ['employer_appointment']);
assert.equal(professor.threshold, 300);
assert.equal(professor.career_offer.role_scope, roleScope);
assert.equal(professor.career_offer.policy, 'qualification_required');
assert.deepEqual(professor.career_offer.qualification_ids, ['academic_qualification_and_employment']);

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.version, 1);
assert.equal(plan.category, category);
assert.equal(plan.role_scope, roleScope);
assert.equal(plan.sequence.length, 9);
assert.deepEqual(plan.sequence.map(step => step.type), planSequenceTypes);
assert.ok(plan.outcome_rules.promoted);
assert.ok(plan.outcome_rules.fired);
assert.ok(plan.sequence.every(step => Array.isArray(step.fallback_types) && step.fallback_types.length === 0));

const catalogs = new Map();
const mailIds = new Set();
for (const type of mailTypes) {
  const catalog = readJson(`data/Civication/mailFamilies/${category}/${type}/${roleScope}_${type}.json`);
  catalogs.set(type, catalog);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1', `${type} schema`);
  assert.equal(catalog.version, 1, `${type} version`);
  assert.equal(catalog.category, category, `${type} category`);
  assert.equal(catalog.role_scope, roleScope, `${type} scope`);
  assert.equal(catalog.mail_type, type, `${type} mail type`);
  const authored = catalog.families.flatMap(family => family.mails || []);
  assert.ok(authored.length >= 1, `${type} authored`);
  for (const mail of authored) {
    assert.ok(!mailIds.has(mail.id), `${mail.id} unique`);
    mailIds.add(mail.id);
    assert.equal(mail.role_scope, roleScope);
    assert.equal(mail.mail_type, type);
    assert.ok(fictionalPeople.has(mail.people_ref), `${mail.id} current actor must be fictional`);
    assert.ok(fictionalPlaces.has(mail.place_id) || mail.place_id === canonicalPlaceId, `${mail.id} place boundary`);
    assert.ok(mail.choice_axis && mail.consequence_axis && mail.narrative_arc);
    assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3);
    assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2);
    assert.ok(mail.choices.every(choice => choice.feedback));
    assert.ok(mail.choices.every(choice => choice.effects?.stats));
  }
}

const scenarioDir = path.join(root, 'data/Civication/scenarioPeople/generated');
for (const filename of fs.readdirSync(scenarioDir).filter(name => name.endsWith('.json'))) {
  const generated = readJson(`data/Civication/scenarioPeople/generated/${filename}`);
  for (const candidate of generated.missing_people_candidates || []) {
    assert.ok(!fictionalPeople.has(candidate.id), `${candidate.id} must not leak to canonical People backlog`);
  }
}

const canonicalTarget = canonicalPeople.find(person => person.id === canonicalPersonId);
assert.ok(canonicalTarget);
assert.equal(canonicalTarget.placeId, canonicalPlaceId);
assert.match(canonicalTarget.desc, /Filosof/i);

const knowledge = catalogs.get('knowledge').families.flatMap(family => family.mails)[0];
assert.equal(knowledge.from, 'Emil, seminarleder');
assert.equal(knowledge.task_payload.task_kind, 'history_go_person');
assert.equal(knowledge.task_payload.target_type, 'person');
assert.equal(knowledge.task_payload.person_id, canonicalPersonId);
assert.equal(knowledge.task_payload.completion_mode, 'read_profile');
assert.equal(knowledge.place_id, canonicalPlaceId);
assert.match(knowledge.summary, /filosofi|historisk/i);
assert.match(knowledge.summary, /skille|ikke.*autoritet|uten.*autoritet/i);

global.window = global;
global.document = undefined;
global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
vm.runInThisContext(fs.readFileSync(path.join(root, 'js/Civication/core/civicationTaskEngine.js'), 'utf8'));
const normalizedPayload = global.CivicationTaskEngine.normalizeHistoryGoTaskPayload(knowledge.task_payload);
assert.equal(global.CivicationTaskEngine.isHistoryGoTaskPayload(normalizedPayload), true);
assert.equal(normalizedPayload.target_id, canonicalPersonId);
assert.equal(normalizedPayload.return_context.mail_id, knowledge.id);

const registry = readJson('data/Civication/compiledSceneRegistryV1.json');
const compiledKnowledge = registry.entries.find(entry => entry.id === knowledge.id);
assert.ok(compiledKnowledge);
assert.equal(compiledKnowledge.scene.interaction_mode, 'task');
assert.equal(compiledKnowledge.scene.task_contract.task_id, 'filosofi_undervisning_history_go_arne_naess');
assert.equal(compiledKnowledge.compatibility_projection.task_payload.person_id, canonicalPersonId);
assert.deepEqual([...registry.role_index[`${category}/${roleScope}`]].sort(), [...mailIds].sort());

const job = catalogs.get('job').families.flatMap(family => family.mails)[0];
const conflict = catalogs.get('conflict').families.flatMap(family => family.mails)[0];
const micro = catalogs.get('micro').families.flatMap(family => family.mails)[0];
const followup = catalogs.get('followup').families.flatMap(family => family.mails)[0];
const consequence = catalogs.get('consequence').families.flatMap(family => family.mails)[0];
assert.equal(micro.thread_key, conflict.thread_key);
assert.equal(followup.thread_key, conflict.thread_key);
assert.equal(micro.narrative_arc, conflict.narrative_arc);
assert.equal(followup.narrative_arc, conflict.narrative_arc);
assert.equal(consequence.thread_key, job.thread_key);
assert.equal(consequence.narrative_arc, job.narrative_arc);

const world = matrix.worlds.find(row => row.key === `${category}/${roleScope}`);
assert.ok(world);
assert.equal(world.status, 'playable');
assert.equal(world.audit.runtime_gate, true);
assert.deepEqual(world.audit.missing_components, []);
for (const component of policy.playable_requirements.runtime_gate_components) {
  assert.equal(world.audit.components[component].level, 'complete', `${component} runtime gate`);
}
for (const component of policy.contract_components) {
  assert.notEqual(world.audit.components[component].level, 'missing', `${component} not missing`);
}
assert.deepEqual(policy.contract_components.filter(component => world.audit.components[component].level === 'partial'), ['practice_stories']);
assert.equal(world.audit.complete_components.length, 14);
assert.equal(world.audit.salary.linked_titles, 2);
assert.equal(world.audit.salary.exact_titles, 2);

console.log('✓ Philosophy teaching and academia is canonical playable with fictional work actors, transparent assessment threads, source-bounded Arne Næss context, and separate Foreleser/Professor appointment gates');
