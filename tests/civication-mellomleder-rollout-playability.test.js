'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));

const model = readJson('data/Civication/roleModels/naeringsliv/kapitalforvalter.json');
const mappings = readJson('data/Civication/badgeRoleMappings.json');
const matrix = readJson('data/Civication/careerGameplayMatrix.json');
const world = (matrix.worlds || []).find((row) => row.category === 'naeringsliv' && row.role_scope === 'mellomleder');

assert.equal(mappings.careers?.naeringsliv?.title_to_role_scope?.Kapitalforvalter, 'mellomleder');
assert.equal(mappings.careers?.naeringsliv?.roles?.mellomleder?.role_type, 'strategisk_ledelse_og_eierskap_fallback');
assert.ok((mappings.careers?.naeringsliv?.future_split_candidates || []).some((row) => row.role_scope === 'kapital_og_eierskap'));

assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_scope, 'kapitalforvalter');
assert.ok(Array.isArray(model.related_places));
assert.ok(model.related_places.length >= 4, 'Mellomleder fallback must expose at least four strategic work surfaces');

const requiredSurfaces = [
  'analyse_og_rapporteringsflate',
  'strategi_og_beslutningsrom',
  'drift_og_kapasitetsgjennomgang',
  'risiko_og_oppfolgingsbord'
];
const surfaceIds = new Set(model.related_places.map((place) => place.id));
for (const id of requiredSurfaces) assert.ok(surfaceIds.has(id), `Missing Mellomleder work surface: ${id}`);
for (const place of model.related_places) assert.ok(place.name && place.function, `Work surface ${place.id} must have name and function`);

assert.ok(world, 'Career Gameplay Matrix must contain naeringsliv/mellomleder');
assert.equal(world.audit?.components?.places?.level, 'complete');
assert.equal(world.audit?.runtime_gate, true);
assert.deepEqual(world.audit?.missing_components, []);
assert.equal(world.status, 'playable');

assert.equal(matrix.summary?.statuses?.reference_complete, 5);
assert.equal(matrix.summary?.statuses?.playable, 7, 'Second systematic rollout should raise playable count to seven');
assert.equal(matrix.summary?.statuses?.partial, 16, 'Mellomleder should leave the partial queue');
assert.equal(matrix.summary?.statuses?.architecture_only, 61);
assert.equal(matrix.summary?.component_debt?.places?.complete, 16);
assert.equal(matrix.summary?.component_debt?.places?.missing, 73);

console.log('✓ Mellomleder systematic rollout is playable without splitting the fallback scope');
