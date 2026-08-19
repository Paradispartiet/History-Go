'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/naeringsliv/fagarbeider.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.category === 'naeringsliv' && row.role_scope === 'fagarbeider');

assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, 'fagarbeider');
assert.ok(Array.isArray(model.related_places));
assert.ok(model.related_places.length >= 4, 'Fagarbeider must expose at least four concrete work surfaces');

const requiredSurfaces = [
  'oppdrags_og_befaringsflate',
  'fag_og_utstyrsplass',
  'kvalitets_og_avvikspunkt',
  'overleverings_og_opplaeringsflate'
];
const surfaceIds = new Set(model.related_places.map((place) => place.id));
for (const id of requiredSurfaces) assert.ok(surfaceIds.has(id), `Missing Fagarbeider work surface: ${id}`);
for (const place of model.related_places) assert.ok(place.name && place.function, `Work surface ${place.id} must have name and function`);

assert.ok(model.authority_boundary?.may?.length >= 3);
assert.ok(model.authority_boundary?.may_not?.length >= 3);
assert.ok((model.competence_axes || []).includes('HMS'));
assert.ok((model.competence_axes || []).includes('kvalitet'));

assert.ok(world, 'Career Gameplay Matrix must contain naeringsliv/fagarbeider');
assert.equal(world.audit?.components?.places?.level, 'complete');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.statuses?.reference_complete, 5, 'Reference-role count must remain frozen');
assert.ok(matrix.summary?.statuses?.playable >= 8, 'Systematic rollout must never regress below eight playable worlds after Fagarbeider');
assert.ok(matrix.summary?.statuses?.partial <= 15, 'Systematic rollout must not restore Fagarbeider to the partial queue');
assert.ok(matrix.summary?.component_debt?.places?.complete >= 17);
assert.ok(matrix.summary?.component_debt?.places?.missing <= 72);

console.log('✓ Fagarbeider systematic rollout is playable with concrete work surfaces');
