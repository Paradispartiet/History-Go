const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));
const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const expectedFile = 'people/sport/vestland/etne/people_skanevik_idrettsanlegg_batch1.json';
const expectedPlaceId = 'skanevik_idrettsanlegg';
const expectedPeople = [
  {
    id: 'leif_bjornar_larsen',
    name: 'Leif Bjørnar Larsen',
    aliases: ['Leif Bjørnar Larsen', 'Leif Bjornar Larsen', 'Leif B. Larsen', 'Leif Bj. Larsen'],
    scopeLimit: 'ikkje at Larsen leidde åleine'
  },
  {
    id: 'torleiv_sydnes',
    name: 'Torleiv Sydnes',
    aliases: ['Torleiv Sydnes', 'T. Sydnes'],
    scopeLimit: 'ikkje at Sydnes leidde åleine'
  }
];
const requiredSources = [
  'https://skaanevikidrettslag.no/__static/jdj5jdewjhdoszkus0vbszqxmem2skza/Skanevik-Idrettslag-Sakliste-Arsmote-2026_komplett-med-sakspapirer.pdf',
  'https://www.instagram.com/p/DLQWXocs2s1/',
  'https://www.fotball.no/fotballdata/klubb/hjem/?fiksId=820'
];

const manifest = readJson('data/people/manifest.json');
assert(Array.isArray(manifest.files), 'People-manifestet skal ha ei files-liste');
assert.strictEqual(
  manifest.files.filter((candidate) => candidate === expectedFile).length,
  1,
  `${expectedFile} skal vere registrert nøyaktig ein gong`
);

const batch = readJson(`data/${expectedFile}`);
assert(Array.isArray(batch), `${expectedFile} skal vere ei liste`);
assert.strictEqual(batch.length, 2, `${expectedFile} skal berre innehalde dei to dokumenterte arbeidsleiarane`);

for (const expected of expectedPeople) {
  const person = batch.find((candidate) => candidate.id === expected.id);
  assert(person, `${expected.id} manglar frå batch 16`);
  assert.strictEqual(person.name, expected.name, `${expected.id} har feil canonical namn`);
  assert.strictEqual(person.placeId, expectedPlaceId, `${expected.id} har feil primæranker`);
  assert.deepStrictEqual(person.places, [expectedPlaceId], `${expected.id} skal berre peike på det dokumenterte uteanlegget`);
  assert.strictEqual(person.category, 'sport', `${expected.id} har feil kategori`);
  assert.strictEqual(person.year, 2025, `${expected.id} skal vere knytt til opningsåret 2025`);
  assert(person.tags.includes('arbeidsleiing'), `${expected.id} manglar den dokumenterte arbeidsleiinga`);
  assert(person.popupDesc.includes('som leidde arbeidet'), `${expected.id} manglar ordlyden frå idrettslaget`);
  assert(person.popupDesc.includes('Skånevik Kunstgras og Skånevik stadion'), `${expected.id} manglar canonical anleggsavgrensing`);
  assert(person.popupDesc.includes(expected.scopeLimit), `${expected.id} manglar nødvendig rolleavgrensing`);
  assert(Array.isArray(person.source_urls), `${expected.id} manglar kjeldeliste`);
  for (const source of requiredSources) {
    assert(person.source_urls.includes(source), `${expected.id} manglar kjelda ${source}`);
  }
  assert(person.source_urls.every((url) => url.startsWith('https://')), `${expected.id} har ugyldig kjelde-URL`);
  assert.strictEqual(person.verifiedAt, '2026-07-18', `${expected.id} har feil verifiseringsdato`);
}

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 16 peikar på eit inaktivt place');

const identityHits = new Map(expectedPeople.map((expected) => [expected.id, []]));
const placeLinkHits = [];
for (const file of manifest.files) {
  const data = readJson(`data/${file}`);
  const people = Array.isArray(data) ? data : [data];
  for (const candidate of people) {
    const fields = [candidate.id, candidate.name, ...(candidate.aliases || [])].map(normalize);
    for (const expected of expectedPeople) {
      const aliases = [expected.id, ...expected.aliases].map(normalize);
      if (fields.some((field) => aliases.includes(field))) {
        identityHits.get(expected.id).push({ file, id: candidate.id, name: candidate.name });
      }
    }

    if (candidate.placeId === expectedPlaceId || (candidate.places || []).includes(expectedPlaceId)) {
      placeLinkHits.push({ file, id: candidate.id, name: candidate.name });
    }
  }
}

for (const expected of expectedPeople) {
  assert.deepStrictEqual(
    identityHits.get(expected.id),
    [{ file: expectedFile, id: expected.id, name: expected.name }],
    `${expected.name} skal finnast nøyaktig ein gong på tvers av ID-, namn- og variantkontrollen`
  );
}
assert.deepStrictEqual(
  placeLinkHits,
  expectedPeople.map((expected) => ({ file: expectedFile, id: expected.id, name: expected.name })),
  'Skånevik idrettsanlegg skal få sine første people-lenkjer i batch 16'
);

console.log('Etne People of Places batch 16 OK (2 named work leaders, 1 newly covered outdoor sports facility, 2 canonical identities)');
