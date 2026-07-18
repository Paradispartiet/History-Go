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

const expectedFile = 'people/sport/vestland/etne/people_osnes_discgolfbane_batch1.json';
const expectedPlaceId = 'osnes_discgolfbane';
const expectedPeople = [
  { id: 'erling_bjarte_rullestad', name: 'Erling Bjarte Rullestad', aliases: ['Erling Bjarte Rullestad', 'Erling B. Rullestad'] },
  { id: 'bjornar_aastvedt', name: 'Bjørnar Aastvedt', aliases: ['Bjørnar Aastvedt', 'Bjornar Aastvedt'] },
  { id: 'lars_kristian_aastvedt', name: 'Lars Kristian Aastvedt', aliases: ['Lars Kristian Aastvedt', 'Lars K. Aastvedt'] }
];
const requiredSource = 'https://www.grannar.no/nyhende/stort-trykk-for-veksande-sport/173496';

const manifest = readJson('data/people/manifest.json');
assert(Array.isArray(manifest.files), 'People-manifestet skal ha ei files-liste');
assert.strictEqual(
  manifest.files.filter((candidate) => candidate === expectedFile).length,
  1,
  `${expectedFile} skal vere registrert nøyaktig ein gong`
);

const batch = readJson(`data/${expectedFile}`);
assert(Array.isArray(batch), `${expectedFile} skal vere ei liste`);
assert.strictEqual(batch.length, 3, 'Batch 20 skal berre innehalde dei tre dokumenterte initiativtakarane');

for (const expected of expectedPeople) {
  const person = batch.find((candidate) => candidate.id === expected.id);
  assert(person, `${expected.id} manglar frå batch 20`);
  assert.strictEqual(person.name, expected.name, `${expected.id} har feil canonical namn`);
  assert.strictEqual(person.placeId, expectedPlaceId, `${expected.id} har feil primæranker`);
  assert.deepStrictEqual(person.places, [expectedPlaceId], `${expected.id} skal berre peike på Osnes discgolfbane`);
  assert.strictEqual(person.category, 'sport', `${expected.id} har feil kategori`);
  assert.strictEqual(person.year, 2022, `${expected.id} skal vere knytt til den dokumenterte fysiske banebygginga i 2022`);
  assert(person.tags.includes('discgolf'), `${expected.id} manglar discgolf-tag`);
  assert(person.tags.includes('initiativtakar'), `${expected.id} manglar initiativtakar-tag`);
  assert(person.tags.includes('banebygging'), `${expected.id} manglar banebygging-tag`);
  assert(person.popupDesc.includes('2021'), `${expected.id} manglar den dokumenterte idéfasen i 2021`);
  assert(person.popupDesc.includes('2022'), `${expected.id} manglar den dokumenterte banebygginga i 2022`);
  assert(person.popupDesc.includes('dugnad') || person.popupDesc.includes('dugnadsfolk'), `${expected.id} manglar nødvendig avgrensing mot breiare dugnadsinnsats`);
  assert(Array.isArray(person.source_urls) && person.source_urls.includes(requiredSource), `${expected.id} manglar Grannar-kjelda`);
  assert.strictEqual(person.verifiedAt, '2026-07-18', `${expected.id} har feil verifiseringsdato`);
}

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 20 peikar på eit inaktivt place');

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
  'Osnes discgolfbane skal få nøyaktig dei tre intended people-lenkjene i batch 20'
);

console.log('Etne People of Places batch 20 OK (3 documented initiators/builders, 1 newly covered disc golf course, 3 canonical identities)');
