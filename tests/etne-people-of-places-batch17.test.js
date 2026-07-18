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

const expectedFile = 'people/kunst/vestland/etne/people_skanevik_kultur_og_idrettshall_batch1.json';
const expectedPlaceId = 'skanevik_kultur_og_idrettshall';
const expectedPeople = [
  {
    id: 'jan_henning_jespersen',
    name: 'Jan Henning Jespersen',
    aliases: ['Jan Henning Jespersen', 'Jan H. Jespersen', 'J. H. Jespersen', 'Jan Jespersen'],
    roleTag: 'byggjeleiing',
    roleText: 'byggjeleiar under reisinga av bygget',
    scopeLimit: 'ikkje at han var eineansvarleg for heile prosjektet'
  },
  {
    id: 'leif_jonny_johansen',
    name: 'Leif Jonny Johansen',
    aliases: ['Leif Jonny Johansen', 'Leif J. Johansen', 'L. J. Johansen'],
    roleTag: 'innreiingsleiing',
    roleText: 'innredningsleiar',
    scopeLimit: 'ikkje at han stod for all innreiing eller alle tekniske installasjonar'
  }
];
const requiredSources = [
  'https://skaanevikidrettshall.no/historie/',
  'https://virksomhet.brreg.no/nb/oppslag/enheter/970972285'
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
assert.strictEqual(batch.length, 2, `${expectedFile} skal berre innehalde dei to dokumenterte byggeleiarrollene`);

for (const expected of expectedPeople) {
  const person = batch.find((candidate) => candidate.id === expected.id);
  assert(person, `${expected.id} manglar frå batch 17`);
  assert.strictEqual(person.name, expected.name, `${expected.id} har feil canonical namn`);
  assert.strictEqual(person.placeId, expectedPlaceId, `${expected.id} har feil primæranker`);
  assert.deepStrictEqual(person.places, [expectedPlaceId], `${expected.id} skal berre peike på den dokumenterte hallen`);
  assert.strictEqual(person.category, 'kunst', `${expected.id} har feil kategori`);
  assert.strictEqual(person.year, null, `${expected.id} skal ikkje få ein oppdikta eksakt rolledato`);
  assert(person.tags.includes('dugnad'), `${expected.id} manglar dugnadskonteksten`);
  assert(person.tags.includes(expected.roleTag), `${expected.id} manglar den dokumenterte rolletypen`);
  assert(person.popupDesc.includes(expected.roleText), `${expected.id} manglar den dokumenterte rolleordlyden`);
  assert(person.popupDesc.includes(expected.scopeLimit), `${expected.id} manglar nødvendig rolleavgrensing`);
  assert(person.popupDesc.includes('year` er medvite null'), `${expected.id} manglar forklaring på null-år`);
  assert(Array.isArray(person.source_urls), `${expected.id} manglar kjeldeliste`);
  for (const source of requiredSources) {
    assert(person.source_urls.includes(source), `${expected.id} manglar kjelda ${source}`);
  }
  assert(person.source_urls.every((url) => url.startsWith('https://')), `${expected.id} har ugyldig kjelde-URL`);
  assert.strictEqual(person.verifiedAt, '2026-07-18', `${expected.id} har feil verifiseringsdato`);
}

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 17 peikar på eit inaktivt place');

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
  'Skånevik kultur- og idrettshall skal få sine første people-lenkjer i batch 17'
);

console.log('Etne People of Places batch 17 OK (2 named physical construction leaders, 1 newly covered culture hall, 2 canonical identities)');
