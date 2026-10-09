import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = JSON.parse(fs.readFileSync('data/places/historie/oslo/places_historie/museumsleiligheten_grabein.json', 'utf8'));
const runtime = JSON.parse(fs.readFileSync('data/runtime/place-open/museumsleiligheten_grabein.json', 'utf8'));
const lesespor = JSON.parse(fs.readFileSync('data/lesespor/oslo/lesespor_oslo_historie.json', 'utf8'));

test('Gråbein owns a source-backed historical event, not a legacy production', () => {
  for (const place of [source, runtime.place]) {
    assert.equal(place.id, 'museumsleiligheten_grabein');
    assert.deepEqual(place.place_card_profile.collection_ids, ['brands', 'historical_events']);
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

test('Gråbein includes only the source-backed Oslo Museum Brand with authentic wordmark', () => {
  const master = JSON.parse(fs.readFileSync('data/brands/brands_master.json','utf8'));
  const mapping = JSON.parse(fs.readFileSync('data/brands/brands_by_place.json','utf8'));
  const brand = master.find(item=>item.id==='oslo_museum');
  assert.ok(brand);
  assert.deepEqual(mapping.museumsleiligheten_grabein, ['oslo_museum']);
  assert.deepEqual(runtime.brands.map(item=>item.id), ['oslo_museum']);
  assert.equal(brand.logo, 'bilder/kort/brands/oslo_museum.svg');
  assert.equal(brand.image, 'bilder/kort/brands/oslo_museum.webp');
  assert.equal(brand.cardImage, 'bilder/kort/brands/oslo_museum.webp');
  assert.equal(brand.imageMeta.previewSha256, 'b1eebb84250f2b0acf946ae7d9affaed62e30811cc7be10effa10ba9184dbb62');
  assert.ok(fs.statSync(brand.image).size > 1000);
  assert.equal(brand.imageMeta.sourceSha256, '233b047cf217e90fa233372ebcc1518c432f8d9af7646bd65ab80f248d7b4dc0');
  const asset = fs.readFileSync(brand.logo,'utf8');
  assert.match(asset, /<svg/);
  assert.doesNotMatch(asset, /<script|javascript:|<foreignObject/i);
  assert.ok(brand.source_urls.includes('https://www.oslomuseum.no/besok-oss/museumsleiligheten-grabein/'));
  assert.equal(brand.imageMeta.generated, false);
  assert.equal(brand.imageMeta.noEndorsement, true);
});
