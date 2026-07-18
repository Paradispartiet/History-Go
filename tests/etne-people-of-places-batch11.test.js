const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedFile = 'people/naeringsliv/vestland/etne/people_naeringsliv_etne_batch2.json';
const expectedPeople = [
  { id: 'ove_wiland', name: 'Ove Wiland' },
  { id: 'paul_hovda', name: 'Paul Hovda' },
  { id: 'gudvin_hovda', name: 'Gudvin Hovda' }
];
const expectedPlaceId = 'norsk_motormuseum_skanevik';
const founderSource = 'https://www.etne.kyrkja.no/Portals/0/Kyrkjeposten%20sept%2021.pdf';

const manifest = readJson('data/people/manifest.json');
assert(Array.isArray(manifest.files), 'People-manifestet skal ha ei files-liste');
assert.strictEqual(
  manifest.files.filter((candidate) => candidate === expectedFile).length,
  1,
  `${expectedFile} skal vere registrert nøyaktig ein gong`
);

const batch = readJson(`data/${expectedFile}`);
assert(Array.isArray(batch), `${expectedFile} skal vere ei liste`);
assert.strictEqual(batch.length, expectedPeople.length, `${expectedFile} har feil tal personar`);
assert.strictEqual(new Set(batch.map((person) => person.id)).size, batch.length, 'Batch 11 har dupliserte ID-ar');

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
const expectedById = new Map(expectedPeople.map((person) => [person.id, person]));

for (const person of batch) {
  const expected = expectedById.get(person.id);
  assert(expected, `Uventa person i batch 11: ${person.id}`);
  assert.strictEqual(person.name, expected.name, `${person.id} har feil namn`);
  assert.strictEqual(person.placeId, expectedPlaceId, `${person.id} har feil primæranker`);
  assert.deepStrictEqual(person.places, [expectedPlaceId], `${person.id} skal ha ei presis place-lenkje`);
  assert.strictEqual(person.category, 'naeringsliv', `${person.id} har feil kategori`);
  assert.strictEqual(person.year, 1986, `${person.id} skal vere knytt til museumsstiftinga i 1986`);
  assert(activePlaces.has(person.placeId), `${person.id} peikar på eit inaktivt place`);
  assert(Array.isArray(person.source_urls) && person.source_urls.length >= 2, `${person.id} manglar kjelder`);
  assert(person.source_urls.includes(founderSource), `${person.id} manglar den direkte stiftarkjelda`);
  assert(person.source_urls.every((url) => url.startsWith('https://')), `${person.id} har ugyldig kjelde-URL`);
  assert.strictEqual(person.verifiedAt, '2026-07-18', `${person.id} har feil verifiseringsdato`);
}

const canonicalCounts = new Map();
for (const file of manifest.files) {
  const data = readJson(`data/${file}`);
  const people = Array.isArray(data) ? data : [data];
  for (const person of people) {
    if (expectedById.has(person.id)) {
      canonicalCounts.set(person.id, (canonicalCounts.get(person.id) || 0) + 1);
    }
  }
}

for (const id of expectedById.keys()) {
  assert.strictEqual(canonicalCounts.get(id), 1, `${id} skal finnast nøyaktig ein gong globalt`);
}

console.log('Etne People of Places batch 11 OK (3 museum founders, 1 direct physical-place anchor)');
