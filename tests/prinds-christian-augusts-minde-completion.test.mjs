import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

const root = process.cwd();
const id = 'prinds_christian_augusts_minde';
const removed = 'prindsen_mottakssenter';
const brandId = 'prindsen_mottakssenter_service';
const json = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const exists = (file) => fs.existsSync(path.join(root, file));
const placeFile = `data/places/historie/oslo/places_historie_added_batch_01/${id}.json`;

test('Prindsen has one canonical Place marker and preserves coordinates', () => {
  assert.equal(exists('data/places/subkultur/oslo/places_subkultur/prindsen_mottakssenter.json'), false);
  assert.equal(exists(`data/runtime/place-open/${removed}.json`), false);
  const manifest = JSON.stringify(json('data/places/manifest.json'));
  assert.equal(manifest.includes(removed), false);
  const place = json(placeFile);
  assert.equal(place.lat, 59.9150905);
  assert.equal(place.lon, 10.7569061);
  assert.equal(place.coordSourceId, 'osm-way:112236667');
  assert.equal(Object.hasOwn(place, 'cardImage'), false);
  assert.equal(place.production_status, 'complete');
});

test('Prindsen uses the canonical four History collections', () => {
  const place = json(placeFile);
  assert.deepEqual(place.place_card_profile.collection_ids, ['people', 'objects', 'brands', 'historical_events']);
  assert.deepEqual(place.related_people_ids, ['fredrik_ferdinand_hausmann', 'christian_heinrich_grosch']);
  assert.equal(place.objects.length >= 1, true);
  assert.equal(place.historical_events.length >= 1, true);
  assert.equal(place.fagverk?.status, 'curated');
  assert.equal(place.fagverk?.lenses?.length >= 5, true);
  assert.equal(place.fagverk?.guiding_questions?.length >= 4, true);
});

test('current Prindsen mottakssenter is a bounded Brand/current-use layer', () => {
  const brands = json('data/brands/brands_master.json');
  const brand = brands.find((entry) => entry.id === brandId);
  assert.ok(brand);
  assert.deepEqual(brand.place_ids, [id]);
  assert.match(brand.popupdesc, /Hausmanns gate 11/);
  assert.match(brand.popupdesc, /ved siden av det fredede anlegget/);
  assert.match(brand.popupdesc, /ikke.*samme historiske bygningen/);
  const byPlace = json('data/brands/brands_by_place.json');
  assert.equal(byPlace[id].includes(brandId), true);
  assert.equal(Object.hasOwn(byPlace, removed), false);
});

test('Grosch reverse relation and all media assets exist', () => {
  const people = json('data/people/by/oslo/people_by_oslo.json');
  const grosch = people.find((entry) => entry.id === 'christian_heinrich_grosch');
  assert.ok(grosch?.places?.includes(id));
  for (const file of [
    `bilder/places/${id}.webp`,
    `bilder/kort/places/${id}.webp`,
    `bilder/places/${id}_front_portrait.webp`,
    `bilder/kort/objects/${id}_mangelsgarden_blaaskilt.webp`,
    `bilder/kort/historical_events/${id}_tvangsarbeid_avvikles_1915.webp`,
    `bilder/kort/brands/${brandId}.webp`,
    'bilder/QuizCards/Prinds Christian Augusts Minde.webp'
  ]) assert.equal(exists(file), true, `missing ${file}`);
});

test('quiz is canonical 4x7 and language/leksikon/history production are materialized', () => {
  const quiz = json(`data/quiz/historie/${id}_sets.json`);
  assert.equal(quiz.sets.length, 4);
  assert.deepEqual(quiz.sets.map((set) => set.questions.length), [7, 7, 7, 7]);
  assert.ok(quiz.production_context);
  assert.equal(exists(`data/quiz/production_briefs/historie/${id}.json`), true);
  assert.equal(exists(`data/quiz/production_context/historie/${id}.json`), true);
  assert.equal(exists(`data/leksikon/sprak/places/europe/norway/oslo/${id}.json`), true);
  assert.equal(exists(`data/leksikon/places/oslo/historie/leksikon_${id}.json`), true);
  assert.equal(exists(`data/places/production/${id}.json`), true);
  assert.equal(exists(`data/places/historie-production/${id}.json`), true);
});

test('active live relations no longer point to removed Place ID', () => {
  for (const file of [
    'data/places/subkultur/oslo/places_subkultur/motestedet_tollbugata.json',
    'data/places/subkultur/oslo/places_subkultur/huset_oslo.json',
    'data/places/subkultur/oslo/places_subkultur/fyrlyset_oslo.json',
    'data/places/subkultur/oslo/places_subkultur/plata_oslo.json',
    'data/places/subkultur/troms/kafe_x_tromso/kafe_x_tromso.json',
    'data/places/production/brugata_storgata_rusmiljo.json',
    'reports/place-production/brugata_storgata_rusmiljo-workcard-current.json'
  ]) {
    assert.equal(fs.readFileSync(path.join(root, file), 'utf8').includes(removed), false, `stale live ref in ${file}`);
  }
});

test('runtime contains canonical Prindsen and no duplicate runtime payload', () => {
  assert.equal(exists(`data/runtime/place-open/${id}.json`), true);
  assert.equal(exists(`data/runtime/place-open/${removed}.json`), false);
  const runtime = json(`data/runtime/place-open/${id}.json`);
  assert.equal(Array.isArray(runtime.brands), true);
  assert.equal(runtime.brands.some((entry) => entry.id === brandId), true);
});
