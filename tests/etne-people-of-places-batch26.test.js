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

const expectedFile = 'people/natur/vestland/etne/people_stordalsvatnet_batch1.json';
const expectedPlaceId = 'stordalsvatnet_etne';
const expected = {
  id: 'oyvind_gvein',
  name: 'Øyvind Gvein',
  aliases: ['Øyvind Gvein', 'Oyvind Gvein', 'Ø. Gvein']
};
const requiredSources = [
  'https://www.ngu.no/publikasjon/geologisk-undersokelse-av-gabbro-etne-hordaland-fylke',
  'https://www.nve.no/vann-og-vassdrag/vassdragsforvaltning/verneplan-for-vassdrag/vestland/041-1-etnevassdraget/'
];

const manifest = readJson('data/people/manifest.json');
assert.strictEqual(manifest.files.filter((file) => file === expectedFile).length, 1, 'Batch 26 source must be registered exactly once');

const batch = readJson(`data/${expectedFile}`);
assert(Array.isArray(batch) && batch.length === 1, 'Batch 26 must contain exactly one person');
const person = batch[0];
assert.strictEqual(person.id, expected.id);
assert.strictEqual(person.name, expected.name);
assert.strictEqual(person.placeId, expectedPlaceId);
assert.deepStrictEqual(person.places, [expectedPlaceId]);
assert.strictEqual(person.category, 'natur');
assert.strictEqual(person.year, 1965);
assert(person.tags.includes('geologi'));
assert(person.tags.includes('feltarbeid'));
assert(person.popupDesc.includes('Ramsvik i vestenden av Stordalsvatnet'));
assert(person.popupDesc.includes('ikkje at Gvein kartla heile Stordalsvatnet'));
for (const source of requiredSources) assert(person.source_urls.includes(source));
assert.strictEqual(person.verifiedAt, '2026-07-18');

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 26 target place must be active');

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
assert.deepStrictEqual(identityHits, expectedHit, 'Øyvind Gvein must be globally unique');
assert.deepStrictEqual(placeHits, expectedHit, 'Stordalsvatnet must have exactly the intended batch 26 link');

console.log('Etne People of Places batch 26 OK (1 documented geologist, 1 newly covered lake, 1 canonical identity)');
