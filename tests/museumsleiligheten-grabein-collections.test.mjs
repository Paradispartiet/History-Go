import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = JSON.parse(fs.readFileSync('data/places/historie/oslo/places_historie/museumsleiligheten_grabein.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/runtime/place-open/museumsleiligheten_grabein.json', 'utf8'));
const lesespor = JSON.parse(fs.readFileSync('data/lesespor/oslo/lesespor_oslo_historie.json', 'utf8'));

test('Gråbein owns a source-backed historical event, not a legacy production', () => {
  for (const place of [source, runtime.place]) {
    assert.equal(place.id, 'museumsleiligheten_grabein');
    assert.deepEqual(place.place_card_profile.collection_ids, ['historical_events']);
    assert.equal(Object.hasOwn(place, 'productions'), false);
    assert.equal(place.historical_events.length, 1);
    const event = place.historical_events[0];
    assert.equal(event.type, 'historical_event');
    assert.equal(event.year, 1888);
    assert.match(event.desc, /Tøyengata 38B/);
    assert.match(event.image, /museumsleiligheten_grabein\.webp$/);
    assert.equal(event.imageMeta.date, '2022');
    assert.match(event.imageMeta.note, /2022/);
  }
});

test('Gråbein Lesespor references open read-only sources and does not claim fiction occurred at the apartment', () => {
  const items = lesespor.items.filter(item => item.place_ids.includes('museumsleiligheten_grabein'));
  assert.equal(items.length, 2);
  assert.deepEqual(items.map(item => item.id), runtime.lesespor.map(item => item.id));
  assert.ok(items.every(item => item.access === 'open' && item.rights === 'link_only' && item.url.startsWith('https://')));
  const roman = items.find(item => item.id.includes('ulvehiet'));
  assert.ok(roman);
  assert.match(roman.relevance, /ikke som dokumentasjon/i);
  assert.equal(source.module_audit.reading_tracks.status, 'produced');
});
