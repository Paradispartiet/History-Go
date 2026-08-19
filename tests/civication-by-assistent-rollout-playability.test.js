'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/by/studentassistent.json');
const grammar = readJson('data/Civication/workGrammars/by/by_assistent.json');
const plan = readJson('data/Civication/mailPlans/by/by_assistent_plan.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.key === 'by/by_assistent');

assert.equal(model.category, 'by');
assert.equal(model.role_id, 'by_studentassistent');
assert.equal(grammar.category, 'by');
assert.equal(grammar.role_scope, 'by_assistent');
assert.equal(plan.category, 'by');
assert.equal(plan.role_scope, 'by_assistent');

const peopleIds = new Set((model.related_people || []).map((person) => person.id));
for (const id of ['ingrid_byplan', 'jonas_arkitekt', 'maria_medvirkning']) {
  assert.ok(peopleIds.has(id), `Missing By Assistent project actor: ${id}`);
}
const placeIds = new Set((model.related_places || []).map((place) => place.id));
for (const id of ['oslo_sentrum_byrom', 'kart_og_grunnlagsbord', 'befaring_og_observasjonsflate', 'medvirknings_og_notatbord']) {
  assert.ok(placeIds.has(id), `Missing By Assistent work surface: ${id}`);
}
for (const place of model.related_places) assert.ok(place.name && place.function, `${place.id} must have name and function`);
assert.ok(model.authority_boundary?.may?.length >= 3);
assert.ok(model.authority_boundary?.may_not?.length >= 3);
assert.ok((model.competence_axes || []).includes('grunnlagskontroll'));
assert.ok((model.competence_axes || []).includes('sporbarhet'));

for (const type of ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence']) {
  const rel = `data/Civication/mailFamilies/by/${type}/by_assistent_${type}.json`;
  const catalog = readJson(rel);
  assert.equal(catalog.category, 'by');
  assert.equal(catalog.role_scope, 'by_assistent');
  assert.equal(catalog.mail_type, type);
  const mails = (catalog.families || []).flatMap((family) => family.mails || []);
  assert.ok(mails.length >= 1, `${type} must contain authored By Assistent mail`);
  for (const mail of mails) {
    assert.equal(mail.role_scope, 'by_assistent');
    assert.equal(mail.mail_type, type);
    assert.ok(mail.subject && mail.summary && mail.purpose && mail.stakes, `${mail.id} must carry narrative context`);
    assert.ok((mail.choices || []).length >= 2, `${mail.id} must offer a real decision`);
  }
}

assert.ok(world, 'Career Gameplay Matrix must contain by/by_assistent');
assert.equal(world.audit?.components?.entry?.level, 'complete');
assert.equal(world.audit?.components?.people?.level, 'complete');
assert.equal(world.audit?.components?.places?.level, 'complete');
assert.equal(world.audit?.components?.mail?.level, 'complete');
assert.equal(world.audit?.components?.authority?.level, 'complete');
assert.equal(world.audit?.components?.consequences?.level, 'complete');
assert.equal(world.audit?.components?.economy?.level, 'complete');
assert.equal(world.audit?.salary?.linked_titles, 3, 'By Assistent retains three canonical Badge-linked titles');
assert.equal(world.audit?.salary?.exact_titles, 3, 'By Assistent retains exact salary coverage for all linked titles');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.work_worlds, 88);
assert.equal(matrix.summary?.support_worlds, 1);
assert.equal(matrix.summary?.statuses?.reference_complete, 5);
assert.ok(matrix.summary?.statuses?.playable >= 12, 'By Assistent must become the twelfth playable canonical world');
assert.ok(matrix.summary?.statuses?.partial <= 10, 'By Assistent must leave the canonical partial queue');
assert.ok(matrix.summary?.runtime_gate_pass >= 17, 'By Assistent must add one runtime-gate pass');

console.log('✓ By Assistent systematic rollout is playable');
