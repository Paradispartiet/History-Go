'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/naeringsliv/okonomi_og_administrasjonsmedarbeider.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.category === 'naeringsliv' && row.role_scope === 'administrasjonsmedarbeider');

assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, 'okonomi_og_administrasjonsmedarbeider');
assert.ok(Array.isArray(model.related_places));

const requiredSurfaces = [
  'innboks_og_mottaksflate',
  'registrerings_og_kontrollflate',
  'arkiv_og_versjonsflate',
  'frist_og_oppfolgingsbord'
];
const surfaceIds = new Set(model.related_places.map((place) => place.id));
for (const id of requiredSurfaces) assert.ok(surfaceIds.has(id), `Missing Administrasjonsmedarbeider work surface: ${id}`);
for (const place of model.related_places) assert.ok(place.name && place.function, `Work surface ${place.id} must have name and function`);

assert.ok(model.authority_boundary?.may?.length >= 3);
assert.ok(model.authority_boundary?.may_not?.length >= 3);

for (const type of ['job', 'people', 'conflict', 'story', 'event']) {
  const rel = `data/Civication/mailFamilies/naeringsliv/${type}/administrasjonsmedarbeider_${type}.json`;
  const catalog = readJson(rel);
  assert.equal(catalog.role_scope, 'administrasjonsmedarbeider');
  assert.equal(catalog.mail_type, type);
  assert.ok((catalog.families || []).length >= 1, `${type} catalog must contain a family`);
  const mails = catalog.families.flatMap((family) => family.mails || []);
  assert.ok(mails.length >= 1, `${type} catalog must contain a mail`);
  for (const mail of mails) {
    assert.equal(mail.role_scope, 'administrasjonsmedarbeider');
    assert.equal(mail.mail_type, type);
    assert.ok((mail.choices || []).length >= 2, `${mail.id} must offer a real choice`);
  }
}

assert.ok(world, 'Career Gameplay Matrix must contain naeringsliv/administrasjonsmedarbeider');
assert.equal(world.audit?.components?.places?.level, 'complete');
assert.equal(world.audit?.components?.mail?.level, 'complete');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.statuses?.reference_complete, 5, 'Reference-role count must remain frozen');
assert.ok(matrix.summary?.statuses?.playable >= 9, 'Rollout must never regress below nine playable worlds after Administrasjonsmedarbeider');
assert.ok(matrix.summary?.statuses?.partial <= 14, 'Administrasjonsmedarbeider must leave the partial queue');
assert.ok(matrix.summary?.runtime_gate_pass >= 14);
assert.ok(matrix.summary?.component_debt?.places?.complete >= 18);
assert.ok(matrix.summary?.component_debt?.places?.missing <= 71);
assert.ok(matrix.summary?.component_debt?.mail?.complete >= 16);

console.log('✓ Administrasjonsmedarbeider systematic rollout is playable');
