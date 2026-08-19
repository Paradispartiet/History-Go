'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/naeringsliv/lager_og_driftsmedarbeider.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.category === 'naeringsliv' && row.role_scope === 'lager_og_driftsmedarbeider');

assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, 'lager_og_driftsmedarbeider');
assert.ok(Array.isArray(model.related_places));

const requiredSurfaces = [
  'varemottak_og_kollikontroll',
  'plukk_pakk_og_systemflate',
  'telling_og_avvikspunkt',
  'hms_og_overleveringsflate'
];
const surfaceIds = new Set(model.related_places.map((place) => place.id));
for (const id of requiredSurfaces) assert.ok(surfaceIds.has(id), `Missing Lager/drift work surface: ${id}`);
for (const place of model.related_places) assert.ok(place.name && place.function, `Work surface ${place.id} must have name and function`);

assert.ok(model.authority_boundary?.may?.length >= 3);
assert.ok(model.authority_boundary?.may_not?.length >= 3);
assert.ok((model.competence_axes || []).includes('HMS'));
assert.ok((model.competence_axes || []).includes('vareflyt'));

for (const type of ['job', 'people', 'conflict', 'story', 'event']) {
  const rel = `data/Civication/mailFamilies/naeringsliv/${type}/lager_og_driftsmedarbeider_${type}.json`;
  const catalog = readJson(rel);
  assert.equal(catalog.role_scope, 'lager_og_driftsmedarbeider');
  assert.equal(catalog.mail_type, type);
  assert.ok((catalog.families || []).length >= 1, `${type} catalog must contain a family`);
  const mails = catalog.families.flatMap((family) => family.mails || []);
  assert.ok(mails.length >= 1, `${type} catalog must contain a mail`);
  for (const mail of mails) {
    assert.equal(mail.role_scope, 'lager_og_driftsmedarbeider');
    assert.equal(mail.mail_type, type);
    assert.ok((mail.choices || []).length >= 2, `${mail.id} must offer a real choice`);
  }
}

assert.ok(world, 'Career Gameplay Matrix must contain naeringsliv/lager_og_driftsmedarbeider');
assert.equal(world.audit?.components?.places?.level, 'complete');
assert.equal(world.audit?.components?.mail?.level, 'complete');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.statuses?.reference_complete, 5, 'Reference-role count must remain frozen');
assert.ok(matrix.summary?.statuses?.playable >= 10, 'Rollout must never regress below ten playable worlds after Lager/drift');
assert.ok(matrix.summary?.statuses?.partial <= 13, 'Lager/drift must leave the partial queue');
assert.ok(matrix.summary?.runtime_gate_pass >= 15, 'Runtime-gate coverage must not regress after Lager/drift');
assert.ok(matrix.summary?.component_debt?.places?.complete >= 19);
assert.ok(matrix.summary?.component_debt?.places?.missing <= 70);
assert.ok(matrix.summary?.component_debt?.mail?.complete >= 17);

console.log('✓ Lager- og driftsmedarbeider systematic rollout is playable');
