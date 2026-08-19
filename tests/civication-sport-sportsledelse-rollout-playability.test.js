'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/sport/sportssjef.json');
const grammar = readJson('data/Civication/workGrammars/sport/sport_sportsledelse.json');
const people = readJson('data/Civication/mailFamilies/sport/people/sport_sportsledelse_people.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.key === 'sport/sport_sportsledelse');

assert.equal(model.category, 'sport');
assert.equal(model.role_scope, 'sport_sportsledelse');
assert.equal(model.role_id, 'sport_sportssjef');
assert.equal(grammar.category, 'sport');
assert.equal(grammar.role_scope, 'sport_sportsledelse');
assert.equal(people.category, 'sport');
assert.equal(people.role_scope, 'sport_sportsledelse');
assert.equal(people.mail_type, 'people');

const peopleIds = new Set((model.related_people || []).map((person) => person.id));
for (const id of ['styreleder_karin', 'daglig_leder_morten', 'speidersjef_jonas']) {
  assert.ok(peopleIds.has(id), `Missing Sportssjef work relation: ${id}`);
}
const placeIds = new Set((model.related_places || []).map((place) => place.id));
for (const id of ['sport_klubbkontor', 'sport_sportslig_styringsbord', 'sport_rekrutteringsflate', 'sport_trener_og_akademibro']) {
  assert.ok(placeIds.has(id), `Missing Sportssjef work surface: ${id}`);
}
for (const place of model.related_places) assert.ok(place.name && place.function, `${place.id} must have name and function`);

const peopleMails = (people.families || []).flatMap((family) => family.mails || []);
assert.ok(peopleMails.length >= 1);
for (const mail of peopleMails) {
  assert.equal(mail.role_scope, 'sport_sportsledelse');
  assert.equal(mail.mail_type, 'people');
  assert.ok(peopleIds.has(mail.person_id), `${mail.id} must use a declared work relation`);
  assert.ok(placeIds.has(mail.place_id), `${mail.id} must use a declared work surface`);
  assert.ok((mail.choices || []).length >= 2, `${mail.id} must offer a real decision`);
}

assert.ok(world, 'Career Gameplay Matrix must contain sport/sport_sportsledelse');
assert.equal(world.audit?.components?.entry?.level, 'complete');
assert.equal(world.audit?.components?.day_one?.level, 'complete');
assert.equal(world.audit?.components?.workday_loop?.level, 'complete');
assert.equal(world.audit?.components?.people?.level, 'complete');
assert.equal(world.audit?.components?.places?.level, 'complete');
assert.equal(world.audit?.components?.authority?.level, 'complete');
assert.equal(world.audit?.components?.performance?.level, 'complete');
assert.equal(world.audit?.components?.economy?.level, 'complete');
assert.equal(world.audit?.components?.progression?.level, 'complete');
assert.equal(world.audit?.components?.exit?.level, 'complete');
assert.equal(world.audit?.salary?.linked_titles, 1);
assert.equal(world.audit?.salary?.exact_titles, 1);
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

// This rollout is intentionally minimal: these non-gating surfaces may remain partial.
assert.equal(world.audit?.components?.practice_stories?.level, 'partial');
assert.equal(world.audit?.components?.mail?.level, 'partial');
assert.equal(world.audit?.components?.knowledge?.level, 'partial');
assert.equal(world.audit?.components?.consequences?.level, 'partial');

assert.equal(matrix.summary?.work_worlds, 88);
assert.equal(matrix.summary?.support_worlds, 1);
assert.equal(matrix.summary?.statuses?.reference_complete, 5);
assert.ok(matrix.summary?.statuses?.playable >= 15, 'Sportssjef must become the fifteenth playable canonical world');
assert.ok(matrix.summary?.statuses?.partial <= 7, 'Sportssjef must leave the canonical partial queue');
assert.ok(matrix.summary?.runtime_gate_pass >= 20, 'Sportssjef must add one runtime-gate pass');

console.log('✓ Sportssjef minimal systematic rollout is playable');
