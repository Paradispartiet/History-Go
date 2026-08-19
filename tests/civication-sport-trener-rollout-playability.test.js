'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/sport/trener.json');
const grammar = readJson('data/Civication/workGrammars/sport/sport_trener.json');
const people = readJson('data/Civication/mailFamilies/sport/people/sport_trener_people.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.key === 'sport/sport_trener');

assert.equal(model.category, 'sport');
assert.equal(model.role_scope, 'sport_trener');
assert.equal(model.role_id, 'sport_trener');
assert.equal(grammar.category, 'sport');
assert.equal(grammar.role_scope, 'sport_trener');

const peopleIds = new Set((model.related_people || []).map((person) => person.id));
for (const id of ['sportslig_koordinator_ida', 'assistenttrener_lina', 'analyseansvarlig_noah', 'spillerutvikler_amina']) {
  assert.ok(peopleIds.has(id), `Missing trainer work relation: ${id}`);
}
const placeIds = new Set((model.related_places || []).map((place) => place.id));
for (const id of ['sport_treningsfelt', 'sport_garderobe', 'sport_konkurransearena']) {
  assert.ok(placeIds.has(id), `Missing trainer work surface: ${id}`);
}

assert.equal(people.category, 'sport');
assert.equal(people.role_scope, 'sport_trener');
assert.equal(people.mail_type, 'people');
const peopleMails = (people.families || []).flatMap((family) => family.mails || []);
assert.ok(peopleMails.length >= 1, 'Trainer people layer must contain authored runtime mail');
for (const mail of peopleMails) {
  assert.equal(mail.role_scope, 'sport_trener');
  assert.equal(mail.mail_type, 'people');
  assert.ok(mail.person_id && mail.place_id, `${mail.id || 'people mail'} must bind a person and work surface`);
  assert.ok(peopleIds.has(mail.person_id), `${mail.id} must use a canonical trainer relationship`);
  assert.ok(placeIds.has(mail.place_id), `${mail.id} must use a canonical trainer work surface`);
}

assert.ok(world, 'Career Gameplay Matrix must contain sport/sport_trener');
for (const component of policy.playable_requirements?.runtime_gate_components || []) {
  assert.equal(world.audit?.components?.[component]?.level, 'complete', `${component} must satisfy the canonical runtime gate`);
}
for (const component of policy.contract_components || []) {
  assert.notEqual(world.audit?.components?.[component]?.level, 'missing', `${component} must not be missing for a playable world`);
}
assert.ok(world.audit?.salary?.linked_titles >= 1, 'Trainer world must retain at least one linked career title');
assert.equal(world.audit?.salary?.exact_titles, world.audit?.salary?.linked_titles, 'Every linked trainer title must retain exact salary coverage');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.work_worlds, 88);
assert.equal(matrix.summary?.support_worlds, 1);
assert.equal(matrix.summary?.statuses?.reference_complete, 5);
assert.ok(matrix.summary?.statuses?.playable >= 16, 'Trainer must become at least the sixteenth playable canonical world');
assert.ok(matrix.summary?.statuses?.partial <= 6, 'Trainer must leave the canonical partial queue');
assert.ok(matrix.summary?.runtime_gate_pass >= 21, 'Trainer must add one runtime-gate pass');

console.log('✓ Sport trainer systematic rollout is playable under the canonical playable policy');
