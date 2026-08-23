#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const category = 'film_tv';
const roleScope = 'serieskaper';
const roleId = 'film_tv_serieskaper';
const mailTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const planSequenceTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'knowledge', 'followup', 'consequence'];
const fictionalPeople = new Set([
  'ingrid_executive_producer_series',
  'jonas_hovedforfatter_series',
  'amina_manusredaktor_series',
  'henrik_produksjonsprodusent_series'
]);
const fictionalWorkSurfaces = new Set([
  'writers_room_serieskaper_film_tv',
  'seriebibel_serieskaper_film_tv',
  'utviklingsmote_serieskaper_film_tv',
  'produksjonsmote_serieskaper_film_tv'
]);
const canonicalPlaceId = 'cinemateket_oslo';

const roleModel = readJson(`data/Civication/roleModels/${category}/${roleScope}.json`);
const grammar = readJson(`data/Civication/workGrammars/${category}/${roleScope}.json`);
const plan = readJson(`data/Civication/mailPlans/${category}/${roleScope}_plan.json`);
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const scenarioPeople = readJson('data/Civication/scenarioPeople/generated/film_tv.json');
const canonicalPeople = readJson('data/people/film_tv/oslo/people_film_tv_oslo.json');
const placeManifest = readJson('data/places/manifest.json');

assert.equal(roleModel.schema, 'civication_role_model_v2');
assert.equal(roleModel.version, 2);
assert.equal(roleModel.category, category);
assert.equal(roleModel.role_scope, roleScope);
assert.equal(roleModel.role_id, roleId);
assert.deepEqual(roleModel.badge_titles, ['Serieskaper']);
assert.deepEqual(new Set(roleModel.related_people.map(person => person.id)), fictionalPeople);
assert.ok(roleModel.related_people.every(person => person.fictional === true));
assert.ok(roleModel.related_people.every(person => /Fiktiv/.test(person.function)));
assert.ok(roleModel.required_knowledge?.concepts?.length >= 7);
assert.ok(roleModel.authority_boundaries?.cannot?.includes('love_forlengelse_bestilling_eller_budsjett'));
assert.ok(roleModel.authority_boundaries?.cannot?.includes('bruke_historiske_filmskapere_som_fasit_for_moderne_serieskaping'));
assert.ok(roleModel.career_path?.possible_promotions?.length >= 2);
assert.ok(roleModel.career_path?.possible_exits?.length >= 4);
assert.deepEqual(roleModel.mail_integration.can_feed_mail_types, mailTypes);

assert.equal(grammar.schema, 'civication_work_grammar_v2');
assert.equal(grammar.version, 2);
assert.equal(grammar.category, category);
assert.equal(grammar.role_scope, roleScope);
assert.deepEqual(grammar.badge_binding.badge_titles, ['Serieskaper']);
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, mailTypes);
assert.equal(grammar.mail_generation_contract.forbid_generic_runtime_fallbacks, true);
assert.ok(grammar.work_loops.length >= 2);
assert.ok(grammar.practice_stories.length >= 10);
assert.ok(grammar.task_grammar.length >= 4);
assert.deepEqual(new Set(grammar.actor_grammar.map(actor => actor.example_id)), fictionalPeople);
assert.deepEqual(
  new Set(grammar.place_grammar.filter(place => place.kind === 'fictional_work_surface').map(place => place.place_id)),
  fictionalWorkSurfaces
);
assert.deepEqual(
  grammar.place_grammar.filter(place => place.kind === 'canonical_history_go_place').map(place => place.place_id),
  [canonicalPlaceId]
);
assert.ok(placeManifest.files.includes(`places/film_tv/oslo/${canonicalPlaceId}.json`));
assert.ok(grammar.authority_boundary.must_escalate_when.length >= 5);
assert.ok(grammar.authority_boundary.may_not.includes('bruke_historiske_filmskapere_som_fiktive_radgivere_eller_normativ_fasit'));

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.version, 1);
assert.equal(plan.category, category);
assert.equal(plan.role_scope, roleScope);
assert.equal(plan.sequence.length, 9);
assert.deepEqual(plan.sequence.map(step => step.type), planSequenceTypes);
assert.ok(plan.outcome_rules?.promoted);
assert.ok(plan.outcome_rules?.fired);
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
  const authored = (catalog.families || []).flatMap(family => family.mails || []);
  assert.ok(authored.length >= 1, `${type} has authored content`);
  for (const mail of authored) {
    assert.ok(!mailIds.has(mail.id), `${mail.id} is unique`);
    mailIds.add(mail.id);
    assert.equal(mail.role_scope, roleScope);
    assert.equal(mail.mail_type, type);
    assert.ok(fictionalPeople.has(mail.people_ref), `${mail.id} has a fictional current-production actor`);
    assert.ok(fictionalWorkSurfaces.has(mail.place_id) || mail.place_id === canonicalPlaceId);
    assert.ok(mail.choice_axis && mail.consequence_axis && mail.narrative_arc);
    assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3);
    assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2);
    assert.ok(mail.choices.every(choice => choice.feedback));
    assert.ok(mail.choices.every(choice => choice.effects?.stats));
  }
}

const peopleRole = scenarioPeople.roles.find(role => role.role_scope === roleScope);
assert.ok(peopleRole);
assert.ok(
  scenarioPeople.missing_people_candidates.every(person => !fictionalPeople.has(person.id)),
  'fictional Serieskaper actors never leak into the canonical People backlog'
);
assert.ok(
  scenarioPeople.people_pool.existing_place_people.some(person => (
    person.person_id === 'arne_skouen' && person.place_id === canonicalPlaceId
  ))
);

const canonicalTarget = canonicalPeople.find(person => person.id === 'arne_skouen');
assert.ok(canonicalTarget);
assert.equal(canonicalTarget.placeId, canonicalPlaceId);
assert.match(canonicalTarget.desc, /manusforfatter/);

const knowledge = catalogs.get('knowledge').families.flatMap(family => family.mails)[0];
assert.equal(knowledge.from, 'Amina, manusredaktør');
assert.equal(knowledge.task_payload.task_kind, 'history_go_person');
assert.equal(knowledge.task_payload.target_type, 'person');
assert.equal(knowledge.task_payload.person_id, 'arne_skouen');
assert.equal(knowledge.task_payload.completion_mode, 'read_profile');
assert.equal(knowledge.place_id, canonicalPlaceId);
assert.match(knowledge.summary, /moderne serieforfatterskap/);
assert.match(knowledge.summary, /filmhistorisk/);

global.window = global;
global.document = undefined;
global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
vm.runInThisContext(fs.readFileSync(path.join(root, 'js/Civication/core/civicationTaskEngine.js'), 'utf8'));
const normalizedPayload = global.CivicationTaskEngine.normalizeHistoryGoTaskPayload(knowledge.task_payload);
assert.equal(global.CivicationTaskEngine.isHistoryGoTaskPayload(normalizedPayload), true);
assert.equal(normalizedPayload.target_id, 'arne_skouen');
assert.equal(normalizedPayload.return_context.mail_id, knowledge.id);

const registry = readJson('data/Civication/compiledSceneRegistryV1.json');
const compiledKnowledge = registry.entries.find(entry => entry.id === knowledge.id);
assert.ok(compiledKnowledge);
assert.equal(compiledKnowledge.scene.interaction_mode, 'task');
assert.equal(compiledKnowledge.scene.task_contract.task_id, 'film_tv_series_history_go_arne_skouen');
assert.equal(compiledKnowledge.compatibility_projection.task_payload.person_id, 'arne_skouen');
assert.deepEqual([...registry.role_index[`${category}/${roleScope}`]].sort(), [...mailIds].sort());

const story = catalogs.get('story').families.flatMap(family => family.mails)[0];
const followup = catalogs.get('followup').families.flatMap(family => family.mails)[0];
assert.equal(followup.thread_key, story.thread_key);
assert.equal(followup.narrative_arc, story.narrative_arc);
const jobMail = catalogs.get('job').families.flatMap(family => family.mails)[0];
const micro = catalogs.get('micro').families.flatMap(family => family.mails)[0];
const consequence = catalogs.get('consequence').families.flatMap(family => family.mails)[0];
assert.equal(micro.thread_key, jobMail.thread_key);
assert.equal(consequence.thread_key, jobMail.thread_key);
assert.equal(consequence.narrative_arc, jobMail.narrative_arc);

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
assert.deepEqual(
  policy.contract_components.filter(component => world.audit.components[component].level === 'partial'),
  ['practice_stories']
);
assert.equal(world.audit.complete_components.length, 14);
assert.equal(world.audit.salary.linked_titles, 1);
assert.equal(world.audit.salary.exact_titles, 1);

console.log('✓ Film/TV Serieskaper is canonical playable with fictional production actors, two returning story threads, explicit authority boundaries and a source-bounded History Go film-history task');
