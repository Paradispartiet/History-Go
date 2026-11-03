import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const load = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const id = 'trikk_17_18';
test('Trikk 17/18 is fully retired as a canonical History Go place', () => {
  assert.equal(fs.existsSync('data/places/by/oslo/places/trikk_17_18.json'), false);
  assert.equal(fs.existsSync('data/quiz/by/trikk_17_18_sets.json'), false);
  assert.equal(fs.existsSync('data/runtime/place-open/trikk_17_18.json'), false);
  assert.equal(load('data/places/manifest.json').files.some(x => x.endsWith('/trikk_17_18.json')), false);
  assert.equal(load('data/places/places_index.json').some(x => x.id === id), false);
  assert.equal(load('data/quiz/manifest.json').sets.some(x => x.targetId === id), false);
  assert.equal(load('data/quizcards/by/topp10_by_kort_batch2.json').cards.some(x => x.targetId === id), false);
  assert.equal(Object.hasOwn(load('data/fagverk/fagverk_registry.json').placeLinks, id), false);
  assert.equal(load('data/places/place_exclusions.json').disabledPlaceIds.includes(id), true);
});
