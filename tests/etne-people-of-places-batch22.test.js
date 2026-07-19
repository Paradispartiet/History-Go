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

const expectedFile = 'people/sport/vestland/etne/people_etne_tennisanlegg_batch1.json';
const expectedPlaceId = 'etne_tennisanlegg';
const expectedPeople = [
  {
    id: 'morten_goa_aadnoy',
    name: 'Morten Goa Aadnøy',
    aliases: ['Morten Goa Aadnøy', 'Morten Goa Aadnoy', 'Morten G. Aadnøy']
  },
  {
    id: 'ole_storhaug',
    name: 'Ole Storhaug',
    aliases: ['Ole Storhaug', 'O. Storhaug']
  }
];
const requiredSources = [
  'https://norsktennis.no/entusiasme-i-etne/',
  'https://www.etneil.no/aktuelt/onsker-du-a-spille-tennis',
  'https://www.grannar.no/nyhende/stor-folkefest-pa-opninga-av-dei-nye-tennisbanane-i-etne/175247'
];
const expectedPlaceHits = [
  ...expectedPeople.map((expected) => ({ file: expectedFile, id: expected.id, name: expected.name })),
  {
    file: 'people/sport/vestland/etne/harald_ekornrud.json',
    id: 'harald_ekornrud',
    name: 'Harald Ekornrud'
  }
];

const manifest = readJson('data/people/manifest.json');
assert(Array.isArray(manifest.files), 'People manifest must expose a files array');
assert.strictEqual(
  manifest.files.filter((file) => file === expectedFile).length,
  1,
  'Batch 22 source must be registered exactly once'
);

const batch = readJson(`data/${expectedFile}`);
assert(Array.isArray(batch), 'Batch 22 source must be an array');
assert.strictEqual(batch.length, 2, 'Batch 22 must contain exactly the two documented rehabilitation initiators');

for (const expected of expectedPeople) {
  const person = batch.find((candidate) => candidate.id === expected.id);
  assert(person, `${expected.id} is missing from batch 22`);
  assert.strictEqual(person.name, expected.name);
  assert.strictEqual(person.placeId, expectedPlaceId);
  assert.deepStrictEqual(person.places, [expectedPlaceId]);
  assert.strictEqual(person.category, 'sport');
  assert.strictEqual(person.year, 2020);
  assert(person.tags.includes('tennis'));
  assert(person.tags.includes('initiativtakar'));
  assert(person.tags.includes('anleggsoppgradering'));
  assert(person.popupDesc.includes('sommaren 2020'));
  assert(person.popupDesc.includes('med maling'));
  assert(person.popupDesc.includes('ansiktsløft'));
  assert(person.popupDesc.includes('påstår ikkje at han bygde dei nye kunstgrusbanene'));
  for (const source of requiredSources) assert(person.source_urls.includes(source));
  assert.strictEqual(person.verifiedAt, '2026-07-18');
}

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 22 target place must be active');

const identityHits = new Map(expectedPeople.map((expected) => [expected.id, []]));
const placeHits = [];
for (const file of manifest.files) {
  const doc = readJson(`data/${file}`);
  const people = Array.isArray(doc) ? doc : [doc];
  for (const candidate of people) {
    const fields = [candidate.id, candidate.name, ...(candidate.aliases || [])].map(normalize);
    for (const expected of expectedPeople) {
      const aliases = [expected.id, ...expected.aliases].map(normalize);
      if (fields.some((field) => aliases.includes(field))) {
        identityHits.get(expected.id).push({ file, id: candidate.id, name: candidate.name });
      }
    }
    if (candidate.placeId === expectedPlaceId || (candidate.places || []).includes(expectedPlaceId)) {
      placeHits.push({ file, id: candidate.id, name: candidate.name });
    }
  }
}

for (const expected of expectedPeople) {
  assert.deepStrictEqual(
    identityHits.get(expected.id),
    [{ file: expectedFile, id: expected.id, name: expected.name }],
    `${expected.name} must be globally unique by normalized ID, name, and variants`
  );
}
assert.deepStrictEqual(
  placeHits,
  expectedPlaceHits,
  'Etne tennisanlegg must include the two rehabilitation initiators and the documented current tennis leader'
);

console.log('Etne People of Places batch 22 OK (2 rehabilitation initiators, 1 current tennis leader, 3 documented place links)');
