import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const categories = JSON.parse(fs.readFileSync('data/categories/category_contract.json', 'utf8'));
const onsite = JSON.parse(fs.readFileSync('data/categories/place_onsite_contract.json', 'utf8'));
const runtime = fs.readFileSync('js/ui/place-onsite-surface.js', 'utf8');

test('På stedet-policy dekker alle canonical runtime-kategorier', () => {
  assert.equal(onsite.status, 'canonical');
  for (const category of categories.runtimeCategories) {
    assert.ok(onsite.categoryPolicy[category], `Mangler På stedet-policy for ${category}`);
  }
});

test('Lek er stedstype-styrt og ikke generell kategori-handling', () => {
  for (const [category, policy] of Object.entries(onsite.categoryPolicy)) {
    assert.equal(policy.play, 'never', `Lek skal ikke være generell kategori-handling i ${category}`);
  }
  assert.equal(onsite.placeTypeOverrides.lekeplass.play, 'always');
  assert.equal(onsite.placeTypeOverrides.lekepark.play, 'always');
  assert.equal(onsite.placeTypeOverrides.playground.play, 'always');
});

test('Oppgaver og trening er eksplisitt ute av På stedet', () => {
  assert.ok(onsite.excludedConcepts.tasks);
  assert.ok(onsite.excludedConcepts.training);
  assert.doesNotMatch(runtime, /label:\s*['\"]Oppgaver['\"]/);
  assert.doesNotMatch(runtime, /label:\s*['\"]Trening['\"]/);
});

test('runtime leser canonical På stedet-kontrakt', () => {
  assert.match(runtime, /data\/categories\/place_onsite_contract\.json/);
  assert.match(runtime, /placeTypeOverrides/);
  assert.match(runtime, /categoryPolicy/);
});
