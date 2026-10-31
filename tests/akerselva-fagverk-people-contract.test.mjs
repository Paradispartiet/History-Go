import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const load = path => JSON.parse(readFileSync(new URL('../' + path, import.meta.url), 'utf8'));

test('Akerselva Fagverk keeps canonical registry, chapters and place-specific evidence', () => {
  const place = load('data/places/by/oslo/places/akerselva.json');
  const registry = load('data/fagverk/fagverk_registry.json');
  const link = registry.placeLinks.akerselva;
  assert.equal(place.id, 'akerselva');
  assert.equal(link.sourceFile, 'places/by/oslo/places/akerselva.json');
  assert.equal(link.status, 'curated');
  assert.equal(place.fagverk.status, 'curated');
  assert.equal(place.fagverk.schema, link.schema);
  assert.equal(place.fagverk.level, link.level);
  assert.ok(place.fagverk.article.length >= 3);
  assert.ok(place.fagverk.chapter_ids.length >= 2);
  assert.ok(place.fagverk.source_urls.length >= 2);
  assert.ok(place.fagverk.source_urls.every(url => url.startsWith('https://')));
  for (const lens of place.fagverk.lenses) {
    assert.ok(lens.title && lens.prompt && lens.evidence);
    assert.ok(place.fagverk.emne_ids.includes(lens.emne_id));
  }
  assert.equal(place.anchors.length, 3);
  assert.ok(place.anchors.every(anchor => anchor.type === 'route_point'));
});

test('Akerselva People keep their evidence-based primary sites, not the whole river', () => {
  const grunerRows = load('data/people/historie/oslo/akerselva/friedrich_gruner.json');
  const hausmannRows = load('data/people/historie/oslo/akerselva/fredrik_ferdinand_hausmann.json');
  assert.equal(grunerRows.length, 1);
  assert.equal(hausmannRows.length, 1);
  const [gruner] = grunerRows;
  const [hausmann] = hausmannRows;
  assert.equal(gruner.placeId, 'nedre_foss');
  assert.ok(gruner.places.includes('nedre_foss'));
  assert.equal(hausmann.placeId, 'prinds_christian_augusts_minde');
  assert.ok(hausmann.places.includes('hausmannsbrua'));
  assert.ok(!gruner.places.includes('akerselva'));
  assert.ok(!hausmann.places.includes('akerselva'));
});

test('Akerselva excludes undocumented industrial People from canonical and generated data', () => {
  const people = load('data/people/naeringsliv/oslo/people_naeringsliv_oslo.json');
  const runtime = load('data/runtime/place-open/akerselva.json');
  const ids = ['sam_eyde_industriutbygger', 'kristian_birkeland_teknologi_og_industri'];
  for (const id of ids) {
    const person = people.find(row => row.id === id);
    assert.ok(person, 'Person profile must be preserved: ' + id);
    assert.notEqual(person.placeId, 'akerselva');
    assert.ok(!person.places?.includes('akerselva'));
    assert.ok(!runtime.people?.some(row => row.id === id));
  }
});
