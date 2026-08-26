#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const readJson = rel => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
const category = 'film_tv';
const roleScope = 'manusmedarbeider';
const roleId = 'film_tv_manusmedarbeider';
const mailTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence'];
const planSequenceTypes = ['job', 'people', 'conflict', 'story', 'event', 'micro', 'knowledge', 'followup', 'consequence', 'job', 'people', 'knowledge', 'conflict', 'followup', 'event', 'consequence'];
const fictionalPeople = new Set([
  'nora_manusredaktor',
  'elias_manusforfatter',
  'selma_scriptkoordinator',
  'maja_researchansvarlig'
]);
const fictionalWorkSurfaces = new Set([
  'manusrommet_produksjon',
  'versjonsarkiv_manus',
  'researchbord_film_tv'
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
assert.deepEqual(roleModel.badge_titles, ['Manusmedarbeider']);
assert.deepEqual(new Set(roleModel.related_people.map(person => person.id)), fictionalPeople);
assert.ok(roleModel.related_people.every(person => person.fictional === true), 'current production actors are machine-readable as fictional');
assert.ok(roleModel.related_people.every(person => /Fiktiv/.test(person.function)), 'current production cast is explicitly fictional');
assert.ok(roleModel.required_knowledge?.concepts?.length >= 5, 'functional manuscript knowledge is explicit');
assert.ok(roleModel.authority_boundaries?.cannot?.includes('overta_forfatterens_kreditering_eller_eierskap'));
assert.ok(roleModel.career_path?.possible_promotions?.length >= 2);
assert.ok(roleModel.career_path?.possible_exits?.length >= 4);
assert.deepEqual(roleModel.mail_integration.can_feed_mail_types, mailTypes);

assert.equal(grammar.schema, 'civication_work_grammar_v2');
assert.equal(grammar.version, 2);
assert.equal(grammar.category, category);
assert.equal(grammar.role_scope, roleScope);
assert.deepEqual(grammar.badge_binding.badge_titles, ['Manusmedarbeider']);
assert.deepEqual(grammar.mail_generation_contract.required_mail_types, mailTypes);
assert.ok(grammar.work_loops.length >= 2);
assert.ok(grammar.task_grammar.length >= 3, 'role-specific work tasks are explicit');
assert.deepEqual(new Set(grammar.actor_grammar.map(actor => actor.example_id)), fictionalPeople);
assert.deepEqual(
  new Set(grammar.place_grammar.filter(place => place.kind === 'fictional_work_surface').map(place => place.place_id)),
  fictionalWorkSurfaces
);
assert.deepEqual(
  grammar.place_grammar.filter(place => place.kind === 'canonical_history_go_place').map(place => place.place_id),
  [canonicalPlaceId]
);
assert.ok(
  placeManifest.files.includes(`places/film_tv/oslo/${canonicalPlaceId}.json`),
  'History Go place is canonical and manifest-loaded'
);
assert.ok(grammar.authority_boundary.must_escalate_when.length >= 3);

assert.equal(plan.schema, 'civication_mail_plan_v1');
assert.equal(plan.version, 1);
assert.equal(plan.category, category);
assert.equal(plan.role_scope, roleScope);
assert.equal(plan.sequence.length, 16);
assert.deepEqual(plan.sequence.map(step => step.type), planSequenceTypes);
assert.ok(plan.outcome_rules?.promoted, 'positive career outcome exists');
assert.ok(plan.outcome_rules?.fired, 'negative career outcome exists');

const catalogs = new Map();
const mailIds = new Set();
for (const type of mailTypes) {
  const rel = `data/Civication/mailFamilies/${category}/${type}/${roleScope}_${type}.json`;
  const catalog = readJson(rel);
  catalogs.set(type, catalog);
  assert.equal(catalog.schema, 'civication_mail_family_catalog_v1', `${type} schema`);
  assert.equal(catalog.version, 1, `${type} version`);
  assert.equal(catalog.category, category, `${type} category`);
  assert.equal(catalog.role_scope, roleScope, `${type} scope`);
  assert.equal(catalog.mail_type, type, `${type} mail type`);
  const mails = (catalog.families || []).flatMap(family => family.mails || []);
  assert.ok(mails.length >= 1, `${type} has authored content`);
  for (const mail of mails) {
    assert.ok(!mailIds.has(mail.id), `${mail.id} is unique in the role package`);
    mailIds.add(mail.id);
    assert.equal(mail.role_scope, roleScope);
    assert.equal(mail.mail_type, type);
    assert.ok(fictionalPeople.has(mail.people_ref), `${mail.id} is owned by a fictional current-production actor`);
    assert.ok(
      fictionalWorkSurfaces.has(mail.place_id) || mail.place_id === canonicalPlaceId,
      `${mail.id} uses a declared work surface or canonical History Go place`
    );
    assert.ok(mail.choice_axis && mail.consequence_axis && mail.narrative_arc, `${mail.id} binds decisions to consequences`);
    assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3, `${mail.id} is a concrete work situation`);
    assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id} exposes a real choice`);
    assert.ok(mail.choices.every(choice => choice.feedback), `${mail.id} explains immediate feedback`);
    assert.ok(mail.choices.every(choice => choice.effects?.stats), `${mail.id} updates gameplay state`);
  }
}

const peopleRole = scenarioPeople.roles.find(role => role.role_scope === roleScope);
assert.ok(peopleRole, 'Scenario People catalog contains the manuscript role');
assert.equal(peopleRole.resolution.direct_person_ids.length, 0, 'context does not overclaim a direct role example');
const falsePeopleCandidates = new Set([
  ...fictionalPeople,
  'amir_innspillingsleder',
  'sara_lokasjonsansvarlig',
  'line_produksjonskoordinator',
  'ida_personvernkontakt',
  'film_tv_programansvarlig',
  'film_tv_rettighetskoordinator',
  'film_tv_arkivar',
  'film_tv_formidler'
]);
assert.ok(
  scenarioPeople.missing_people_candidates.every(person => !falsePeopleCandidates.has(person.id)),
  'fictional Film/TV work actors never leak into the canonical People backlog'
);
assert.ok(
  scenarioPeople.people_pool.existing_place_people.some(person => (
    person.person_id === 'arne_skouen' && person.place_id === canonicalPlaceId
  )),
  'canonical person and read-only place relation exist in the Film/TV pool'
);

const canonicalTarget = canonicalPeople.find(person => person.id === 'arne_skouen');
assert.ok(canonicalTarget, 'History Go target exists in canonical People data');
assert.equal(canonicalTarget.placeId, canonicalPlaceId);
assert.match(canonicalTarget.desc, /manusforfatter/, 'canonical profile itself supports manuscript relevance');

const knowledge = catalogs.get('knowledge').families.flatMap(family => family.mails)[0];
assert.equal(knowledge.from, 'Maja, researchansvarlig', 'the real person is never the fictional sender');
assert.equal(knowledge.task_payload.task_kind, 'history_go_person');
assert.equal(knowledge.task_payload.target_type, 'person');
assert.equal(knowledge.task_payload.person_id, 'arne_skouen');
assert.equal(knowledge.task_payload.completion_mode, 'read_profile');
assert.equal(knowledge.place_id, canonicalPlaceId);
assert.match(knowledge.summary, /adskilt fra beslutningene/, 'historical context is not current decision authority');

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
assert.ok(compiledKnowledge, 'History Go knowledge task is compiled into the canonical Scene Pipeline');
assert.equal(compiledKnowledge.scene.interaction_mode, 'task');
assert.equal(compiledKnowledge.scene.task_contract.task_id, 'film_tv_manus_history_go_skouen');
assert.equal(compiledKnowledge.compatibility_projection.task_payload.person_id, 'arne_skouen');
assert.deepEqual(
  [...registry.role_index[`${category}/${roleScope}`]].sort(),
  [...mailIds].sort(),
  'all authored manuscript scenes are runtime-reachable'
);

const peopleMail = catalogs.get('people').families.flatMap(family => family.mails)[0];
const conflictMail = catalogs.get('conflict').families.flatMap(family => family.mails)[0];
const followup = catalogs.get('followup').families.flatMap(family => family.mails)[0];
assert.equal(peopleMail.thread_key, conflictMail.thread_key);
assert.equal(followup.thread_key, peopleMail.thread_key, 'author relationship develops across three beats');
const story = catalogs.get('story').families.flatMap(family => family.mails)[0];
const consequence = catalogs.get('consequence').families.flatMap(family => family.mails)[0];
assert.equal(consequence.thread_key, story.thread_key, 'continuity decision returns as a delayed consequence');

const world = matrix.worlds.find(row => row.key === `${category}/${roleScope}`);
assert.ok(world, 'Manusmedarbeider remains a canonical career world');
assert.equal(world.status, 'playable');
assert.equal(world.audit.runtime_gate, true);
assert.deepEqual(world.audit.missing_components, []);
for (const component of policy.playable_requirements.runtime_gate_components) {
  assert.equal(world.audit.components[component].level, 'complete', `${component} satisfies the canonical runtime gate`);
}
for (const component of policy.contract_components) {
  assert.notEqual(world.audit.components[component].level, 'missing', `${component} is not missing`);
}
assert.deepEqual(
  policy.contract_components.filter(component => world.audit.components[component].level === 'partial'),
  ['practice_stories'],
  'only intentional practice-story depth remains partial'
);
assert.equal(world.audit.complete_components.length, 14);
assert.equal(world.audit.salary.linked_titles, 1);
assert.equal(world.audit.salary.exact_titles, 1);

console.log('✓ Film/TV Manusmedarbeider is canonical playable with fictional work actors, concrete tasks, declared places and a source-bounded History Go People task');
