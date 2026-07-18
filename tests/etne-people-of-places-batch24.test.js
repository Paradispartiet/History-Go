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

const expectedFile = 'people/sport/vestland/etne/people_fikse_skytebane_batch1.json';
const expectedPlaceId = 'fikse_skytebane';
const expected = {
  id: 'johannes_hundseid',
  name: 'Johannes Hundseid',
  aliases: ['Johannes Hundseid', 'J. Hundseid']
};
const requiredSource = 'https://www.grannar.no/sport/johannes-hundseid-til-topps/132188';

const manifest = readJson('data/people/manifest.json');
assert.strictEqual(manifest.files.filter((file) => file === expectedFile).length, 1, 'Batch 24 source must be registered exactly once');

const batch = readJson(`data/${expectedFile}`);
assert(Array.isArray(batch) && batch.length === 1, 'Batch 24 must contain exactly one person');
const person = batch[0];
assert.strictEqual(person.id, expected.id);
assert.strictEqual(person.name, expected.name);
assert.strictEqual(person.placeId, expectedPlaceId);
assert.deepStrictEqual(person.places, [expectedPlaceId]);
assert.strictEqual(person.category, 'sport');
assert.strictEqual(person.year, 2013);
assert(person.tags.includes('skytesport'));
assert(person.tags.includes('konkurranse'));
assert(person.popupDesc.includes('vann klasse 3–5 på Fiksestemnet i 2013 med 345 poeng'));
assert(person.popupDesc.includes('ikkje berre eit generelt medlemskap'));
assert(Array.isArray(person.source_urls) && person.source_urls.includes(requiredSource));
assert.strictEqual(person.verifiedAt, '2026-07-18');

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 24 target place must be active');

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
assert.deepStrictEqual(identityHits, expectedHit, 'Johannes Hundseid must be globally unique');
assert.deepStrictEqual(placeHits, expectedHit, 'Fikse skytebane must have exactly the intended batch 24 link');

console.log('Etne People of Places batch 24 OK (1 documented Fikse winner, 1 newly covered shooting range, 1 canonical identity)');
