'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/naeringsliv/formann_arbeidsleder.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.category === 'naeringsliv' && row.role_scope === 'formann');

assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, 'formann_arbeidsleder');
assert.ok(Array.isArray(model.related_places));
assert.ok(model.related_places.length >= 4, 'Formann must expose at least four concrete work surfaces');

const requiredSurfaces = [
  'produksjons_og_arbeidsomrade',
  'arbeidslederpunkt',
  'hms_og_avvikspunkt',
  'skift_og_overleveringsrom'
];
const surfaceIds = new Set(model.related_places.map((place) => place.id));
for (const id of requiredSurfaces) assert.ok(surfaceIds.has(id), `Missing Formann work surface: ${id}`);
for (const place of model.related_places) {
  assert.ok(place.name && place.function, `Work surface ${place.id} must have name and function`);
}

assert.ok(world, 'Career Gameplay Matrix must contain naeringsliv/formann');
assert.equal(world.audit?.components?.places?.level, 'complete');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.statuses?.reference_complete, 5, 'Reference-role count must remain frozen');
assert.equal(matrix.summary?.statuses?.playable, 6, 'First systematic rollout should raise playable count to six');
assert.equal(matrix.summary?.statuses?.partial, 17, 'Formann should leave the partial queue');
assert.equal(matrix.summary?.statuses?.architecture_only, 61);

console.log('✓ Formann systematic rollout is playable with concrete work surfaces');
