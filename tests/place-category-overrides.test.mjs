import assert from 'node:assert/strict';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { applyCategoryOverride, readCategoryOverrides } from '../tools/lib/placeCategoryOverrides.mjs';

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'hg-category-overrides-'));
const placesDir = path.join(root, 'data/places');
const overridesDir = path.join(placesDir, 'category_overrides');

try {
  await fs.mkdir(overridesDir, { recursive: true });
  await fs.writeFile(path.join(placesDir, 'category_overrides.json'), JSON.stringify([
    { id: 'place_a', category: 'historie' },
  ]));
  await fs.writeFile(path.join(overridesDir, 'batch1.json'), JSON.stringify([
    { id: 'place_a', category: 'religion' },
    { id: 'place_b', category: 'kunst' },
  ]));
  await fs.writeFile(path.join(overridesDir, 'batch2.json'), JSON.stringify([
    { id: 'place_b', category: 'religion' },
  ]));
  await fs.writeFile(path.join(overridesDir, 'index.json'), JSON.stringify({
    version: 1,
    files: ['batch1.json', 'batch2.json'],
  }));

  const overrides = await readCategoryOverrides(root);
  assert.equal(overrides.get('place_a')?.category, 'religion', 'manifest batch should override base layer');
  assert.equal(overrides.get('place_b')?.category, 'religion', 'later manifest batch should win');
  assert.equal(overrides.get('place_b')?.sourceFile, 'data/places/category_overrides/batch2.json');

  const original = { id: 'place_a', category: 'historie', name: 'A' };
  const patched = applyCategoryOverride(original, overrides);
  assert.deepEqual(patched, { id: 'place_a', category: 'religion', name: 'A' });
  assert.equal(original.category, 'historie', 'applying an override must not mutate source place data');

  await fs.writeFile(path.join(overridesDir, 'batch2.json'), JSON.stringify([
    { id: 'duplicate_place', category: 'religion' },
    { id: 'duplicate_place', category: 'kunst' },
  ]));
  await assert.rejects(
    () => readCategoryOverrides(root),
    /duplicate place id "duplicate_place"/,
    'duplicate ids inside one layer must fail fast',
  );

  await fs.writeFile(path.join(overridesDir, 'index.json'), JSON.stringify({
    version: 1,
    files: ['../outside.json'],
  }));
  await assert.rejects(
    () => readCategoryOverrides(root),
    /escapes category_overrides/,
    'manifest entries must not escape the override directory',
  );

  console.log('place-category-overrides: PASS');
} finally {
  await fs.rm(root, { recursive: true, force: true });
}
