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

const expectedFile = 'people/sport/vestland/etne/people_etne_pumptrack_batch1.json';
const expectedPlaceId = 'etne_pumptrack';
const expected = {
  id: 'dzintrs_vitols',
  name: 'Dzintrs Vitols',
  aliases: ['Dzintrs Vitols', 'D. Vitols']
};
const requiredSources = [
  'https://www.grannar.no/nyhende/flyg-hogt-pa-bmx-sykkel/153573',
  'https://www.shapers.no/prosjekter/etne-pumptrack'
];
const expectedPlaceHits = [
  { file: expectedFile, id: expected.id, name: expected.name },
  {
    file: 'people/politikk/vestland/etne/mette_heidi_ekrheim_bergsvaag.json',
    id: 'mette_heidi_ekrheim_bergsvaag',
    name: 'Mette Heidi Ekrheim Bergsvåg'
  }
];

const manifest = readJson('data/people/manifest.json');
assert.strictEqual(manifest.files.filter((file) => file === expectedFile).length, 1, 'Batch 21 source must be registered exactly once');

const batch = readJson(`data/${expectedFile}`);
assert(Array.isArray(batch) && batch.length === 1, 'Batch 21 must contain exactly one person');
const person = batch[0];
assert.strictEqual(person.id, expected.id);
assert.strictEqual(person.name, expected.name);
assert.strictEqual(person.placeId, expectedPlaceId);
assert.deepStrictEqual(person.places, [expectedPlaceId]);
assert.strictEqual(person.category, 'sport');
assert.strictEqual(person.year, 2024);
assert(person.tags.includes('pumptrack'));
assert(person.tags.includes('banebygging'));
assert(person.popupDesc.includes('vore med og bygd banen i Etne'));
assert(person.popupDesc.includes('påstår ikkje at Vitols åleine'));
for (const source of requiredSources) assert(person.source_urls.includes(source));
assert.strictEqual(person.verifiedAt, '2026-07-18');

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 21 target place must be active');

const aliases = [expected.id, ...expected.aliases].map(normalize);
const identityHits = [];
const placeHits = [];
for (const file of manifest.files) {
  const doc = readJson(`data/${file}`);
  const people = Array.isArray(doc) ? doc : [doc];
  for (const candidate of people) {
    const fields = [candidate.id, candidate.name, ...(candidate.aliases || [])].map(normalize);
    if (fields.some((field) => aliases.includes(field))) identityHits.push({ file, id: candidate.id, name: candidate.name });
    if (candidate.placeId === expectedPlaceId || (candidate.places || []).includes(expectedPlaceId)) placeHits.push({ file, id: candidate.id, name: candidate.name });
  }
}

const expectedIdentityHit = [{ file: expectedFile, id: expected.id, name: expected.name }];
assert.deepStrictEqual(identityHits, expectedIdentityHit, 'Dzintrs Vitols must be globally unique');
assert.deepStrictEqual(placeHits, expectedPlaceHits, 'Etne pumptrack must include the documented builder and opening-role links');

console.log('Etne People of Places batch 21 OK (1 documented builder identity, 2 documented pumptrack people links)');
