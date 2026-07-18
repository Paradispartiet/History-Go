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

const expectedFile = 'people/politikk/vestland/etne/people_etne_tinghus_batch1.json';
const expectedPlaceId = 'etne_tinghus';
const expected = {
  id: 'anna_molden',
  name: 'Anna Molden',
  aliases: ['Anna Molden', 'Anna Grønstad Molden', 'Anna Gronstad Molden']
};
const requiredSources = [
  'https://snl.no/Anna_Molden',
  'https://nkl.snl.no/Anna_Molden',
  'https://www.etne.kommune.no/aktuelt/oppgradering-av-tinghuset.15354.aspx',
  'https://virksomhet.brreg.no/nb/oppslag/enheter/959435375'
];

const manifest = readJson('data/people/manifest.json');
assert.strictEqual(manifest.files.filter((file) => file === expectedFile).length, 1, 'Batch 23 source must be registered exactly once');

const batch = readJson(`data/${expectedFile}`);
assert(Array.isArray(batch) && batch.length === 1, 'Batch 23 must contain exactly one person');
const person = batch[0];
assert.strictEqual(person.id, expected.id);
assert.strictEqual(person.name, expected.name);
assert.strictEqual(person.placeId, expectedPlaceId);
assert.deepStrictEqual(person.places, [expectedPlaceId]);
assert.strictEqual(person.category, 'politikk');
assert.strictEqual(person.year, 1968);
assert(person.tags.includes('arkitektur'));
assert(person.tags.includes('arkitekt'));
assert(person.popupDesc.includes('Etne rådhus, Etne (1968)'));
assert(person.popupDesc.includes('gir ikkje Molden æra for rehabiliteringa i 2025–2026'));
assert(person.popupDesc.includes('kjeldekombinasjon'));
for (const source of requiredSources) assert(person.source_urls.includes(source));
assert.strictEqual(person.verifiedAt, '2026-07-18');

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 23 target place must be active');

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

const expectedHit = [{ file: expectedFile, id: expected.id, name: expected.name }];
assert.deepStrictEqual(identityHits, expectedHit, 'Anna Molden must be globally unique');
assert.deepStrictEqual(placeHits, expectedHit, 'Etne Tinghus must have exactly the intended batch 23 link');

console.log('Etne People of Places batch 23 OK (1 documented architect, 1 newly covered municipal building, 1 canonical identity)');
