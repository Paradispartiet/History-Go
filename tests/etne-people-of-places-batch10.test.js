const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedFiles = new Map([
  [
    'people/naeringsliv/vestland/etne/people_naeringsliv_etne_batch1.json',
    [{ id: 'christian_bjelland_industrimann', placeId: 'skanevik_hermetikkfabrikk', category: 'naeringsliv' }]
  ],
  [
    'people/sport/vestland/etne/people_sport_etne_batch1.json',
    [
      { id: 'christine_gjermo', placeId: 'skakkeringen_etne', category: 'sport' },
      { id: 'ellen_reitan', placeId: 'skakkeringen_etne', category: 'sport' }
    ]
  ]
]);

const manifest = readJson('data/people/manifest.json');
assert(Array.isArray(manifest.files), 'People-manifestet skal ha ei files-liste');

for (const file of expectedFiles.keys()) {
  assert.strictEqual(
    manifest.files.filter((candidate) => candidate === file).length,
    1,
    `${file} skal vere registrert nøyaktig ein gong`
  );
}

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
const expectedById = new Map([...expectedFiles.values()].flat().map((person) => [person.id, person]));

for (const [file, expectedPeople] of expectedFiles) {
  const batch = readJson(`data/${file}`);
  assert(Array.isArray(batch), `${file} skal vere ei liste`);
  assert.strictEqual(batch.length, expectedPeople.length, `${file} har feil tal personar`);
  assert.strictEqual(new Set(batch.map((person) => person.id)).size, batch.length, `${file} har dupliserte ID-ar`);

  for (const person of batch) {
    const expected = expectedById.get(person.id);
    assert(expected, `Uventa person i batch 10: ${person.id}`);
    assert.strictEqual(person.placeId, expected.placeId, `${person.id} har feil primæranker`);
    assert.deepStrictEqual(person.places, [expected.placeId], `${person.id} skal ha ei presis place-lenkje`);
    assert.strictEqual(person.category, expected.category, `${person.id} har feil kategori`);
    assert(activePlaces.has(expected.placeId), `${person.id} peikar på eit inaktivt place: ${expected.placeId}`);
    assert(Array.isArray(person.source_urls) && person.source_urls.length >= 2, `${person.id} manglar kjelder`);
    assert(person.source_urls.every((url) => url.startsWith('https://')), `${person.id} har ugyldig kjelde-URL`);
    assert.strictEqual(person.verifiedAt, '2026-07-18', `${person.id} har feil verifiseringsdato`);
  }
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

console.log('Etne People of Places batch 10 OK (3 people, 2 direct physical-place anchors)');
