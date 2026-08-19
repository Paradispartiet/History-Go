'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/sport/sportssjef.json');
const grammar = readJson('data/Civication/workGrammars/sport/sport_sportsledelse.json');
const policy = readJson('data/Civication/careerGameplayPolicy.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.key === 'sport/sport_sportsledelse');

assert.equal(model.category, 'sport');
assert.equal(model.role_scope, 'sport_sportsledelse');
assert.equal(model.role_id, 'sport_sportssjef');
assert.equal(grammar.category, 'sport');
assert.equal(grammar.role_scope, 'sport_sportsledelse');

const peopleIds = new Set((model.related_people || []).map((person) => person.id));
for (const id of ['styreleder_karin', 'daglig_leder_morten', 'speidersjef_jonas']) {
  assert.ok(peopleIds.has(id), `Missing Sportssjef work relation: ${id}`);
}
const placeIds = new Set((model.related_places || []).map((place) => place.id));
for (const id of ['sport_klubbkontor', 'sport_sportslig_styringsbord', 'sport_rekrutteringsflate', 'sport_trener_og_akademibro']) {
  assert.ok(placeIds.has(id), `Missing Sportssjef work surface: ${id}`);
}

for (const type of ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence']) {
  const rel = `data/Civication/mailFamilies/sport/${type}/sport_sportsledelse_${type}.json`;
  const catalog = readJson(rel);
  assert.equal(catalog.category, 'sport');
  assert.equal(catalog.role_scope, 'sport_sportsledelse');
  assert.equal(catalog.mail_type, type);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  assert.ok(mails.length >= 1, `${type} must contain authored Sportssjef mail`);
  for (const mail of mails) {
    assert.equal(mail.role_scope, 'sport_sportsledelse');
    assert.equal(mail.mail_type, type);
    assert.ok(mail.id && mail.subject && mail.summary, `${mail.id || type} must carry runtime narrative context`);
  }
}

const followup = readJson('data/Civication/mailFamilies/sport/followup/sport_sportsledelse_followup.json');
const consequence = readJson('data/Civication/mailFamilies/sport/consequence/sport_sportsledelse_consequence.json');
const followupThread = followup.families?.[0]?.mails?.[0]?.thread_key;
const consequenceThread = consequence.families?.[0]?.mails?.[0]?.thread_key;
assert.ok(followupThread, 'Sportssjef followup must own a delayed thread');
assert.equal(consequenceThread, followupThread, 'Sportssjef consequence must close the same delayed thread');

assert.ok(world, 'Career Gameplay Matrix must contain sport/sport_sportsledelse');
for (const component of policy.playable_requirements?.runtime_gate_components || []) {
  assert.equal(world.audit?.components?.[component]?.level, 'complete', `${component} must satisfy the canonical runtime gate`);
}
for (const component of policy.contract_components || []) {
  assert.notEqual(world.audit?.components?.[component]?.level, 'missing', `${component} must not be missing for a playable world`);
}
assert.equal(world.audit?.salary?.linked_titles, 1);
assert.equal(world.audit?.salary?.exact_titles, 1);
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.work_worlds, 88);
assert.equal(matrix.summary?.support_worlds, 1);
assert.equal(matrix.summary?.statuses?.reference_complete, 5);
assert.ok(matrix.summary?.statuses?.playable >= 15, 'Sportssjef must become the fifteenth playable canonical world');
assert.ok(matrix.summary?.statuses?.partial <= 7, 'Sportssjef must leave the canonical partial queue');
assert.ok(matrix.summary?.runtime_gate_pass >= 20, 'Sportssjef must add one runtime-gate pass');

console.log('✓ Sportssjef systematic rollout is playable under the canonical playable policy');
