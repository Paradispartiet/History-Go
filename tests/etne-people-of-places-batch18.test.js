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

const expectedFile = 'people/kunst/vestland/etne/people_skakke_kultursenter_batch1.json';
const expectedPlaceId = 'skakke_kultursenter_etne';
const expectedPeople = [
  {
    id: 'goril_eidhammer',
    name: 'Gøril Eidhammer',
    aliases: ['Gøril Eidhammer', 'Goril Eidhammer', 'Goeril Eidhammer'],
    year: 2019,
    requiredText: 'vende tilbake til Skakke'
  },
  {
    id: 'kurt_helgesen',
    name: 'Kurt Helgesen',
    aliases: ['Kurt Helgesen', 'K. Helgesen'],
    year: 2018,
    requiredText: 'tiltre som dagleg leiar 1. juli'
  }
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
assert.strictEqual(batch.length, 2, 'Batch 18 skal berre innehalde dei to dokumenterte Skakke-leiarane');

for (const expected of expectedPeople) {
  const person = batch.find((candidate) => candidate.id === expected.id);
  assert(person, `${expected.id} manglar frå batch 18`);
  assert.strictEqual(person.name, expected.name, `${expected.id} har feil canonical namn`);
  assert.strictEqual(person.placeId, expectedPlaceId, `${expected.id} har feil primæranker`);
  assert.deepStrictEqual(person.places, [expectedPlaceId], `${expected.id} skal berre peike på Skakke`);
  assert.strictEqual(person.category, 'kunst', `${expected.id} har feil kategori`);
  assert.strictEqual(person.year, expected.year, `${expected.id} har feil dokumentert rolleår`);
  assert(person.tags.includes('kulturleiing'), `${expected.id} manglar kulturleiing-tag`);
  assert(person.tags.includes('drift'), `${expected.id} manglar drift-tag`);
  assert(person.popupDesc.includes(expected.requiredText), `${expected.id} manglar dokumentert rolleformulering`);
  assert(Array.isArray(person.source_urls) && person.source_urls.length > 0, `${expected.id} manglar kjelder`);
  assert(person.source_urls.every((url) => url.startsWith('https://')), `${expected.id} har ugyldig kjelde-URL`);
  assert.strictEqual(person.verifiedAt, '2026-07-18', `${expected.id} har feil verifiseringsdato`);
}

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 18 peikar på eit inaktivt place');

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
    `${expected.name} skal finnast nøyaktig ein gong globalt ved normalisert ID-, namn- og variantkontroll`
  );
}
assert.deepStrictEqual(
  placeLinkHits,
  expectedPeople.map((expected) => ({ file: expectedFile, id: expected.id, name: expected.name })),
  'Skakke kultursenter skal få nøyaktig dei to intended people-lenkjene i batch 18'
);

console.log('Etne People of Places batch 18 OK (2 documented Skakke leaders, 1 newly covered culture center, 2 canonical identities)');
