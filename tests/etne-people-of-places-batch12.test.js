const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedFiles = new Map([
  [
    'people/vitenskap/vestland/etne/etneelva_forskningsplattform_people_batch1.json',
    [
      {
        id: 'per_tommy_fjeldheim',
        primaryPlaceId: 'etneelva_forskningsplattform',
        places: ['etneelva_forskningsplattform', 'etneelva'],
        popupAnchor: 'selve Etneelva',
        requiredSource: 'https://www.hi.no/hi/nyheter/2024/august/etneelva-den-storste-og-eldste-laksen-er-vekke-i-ar'
      },
      {
        id: 'oystein_skaala',
        primaryPlaceId: 'etneelva_forskningsplattform',
        places: ['etneelva_forskningsplattform', 'etneelva'],
        popupAnchor: 'selve Etneelva',
        requiredSource: 'https://www.hi.no/hi/nyheter/2024/april/direkte-fra-etneelva'
      }
    ]
  ],
  [
    'people/naeringsliv/vestland/etne/people_naeringsliv_etne_batch2.json',
    [
      {
        id: 'paul_hovda',
        primaryPlaceId: 'norsk_motormuseum_skanevik',
        places: ['norsk_motormuseum_skanevik', 'sunnhordland_mek_verkstad_leknestangen'],
        popupAnchor: 'Leknestangen',
        requiredSource: 'https://search.patentstyret.no/tidende/patent/2005/patenttidende-nr04-2005.pdf'
      }
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
  const people = readJson(`data/${file}`);
  assert(Array.isArray(people), `${file} skal vere ei liste`);

  for (const expected of expectedPeople) {
    const person = people.find((candidate) => candidate.id === expected.id);
    assert(person, `${expected.id} manglar i ${file}`);
    assert.strictEqual(person.placeId, expected.primaryPlaceId, `${expected.id} har fått endra primæranker`);
    assert.deepStrictEqual(person.places, expected.places, `${expected.id} har feil canonical place-lenkjer`);
    assert(person.places.every((placeId) => activePlaces.has(placeId)), `${expected.id} peikar på inaktivt place`);
    assert(person.popupDesc.includes(expected.popupAnchor), `${expected.id} forklarer ikkje den nye fysiske lenkja`);
    assert(Array.isArray(person.source_urls), `${expected.id} manglar kjeldeliste`);
    assert(person.source_urls.includes(expected.requiredSource), `${expected.id} manglar direkte stadskjelde`);
    assert(person.source_urls.every((url) => url.startsWith('https://')), `${expected.id} har ugyldig kjelde-URL`);
    assert.strictEqual(person.verifiedAt, '2026-07-18', `${expected.id} har feil verifiseringsdato`);
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

console.log('Etne People of Places batch 12 OK (3 canonical people, 2 newly covered physical places, 0 new people IDs)');
