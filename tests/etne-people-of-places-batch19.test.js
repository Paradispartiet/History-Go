const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(repo, rel), 'utf8'));
const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const expectedFile = 'people/naeringsliv/vestland/etne/people_litledalen_kraftverk_batch1.json';
const placeId = 'litledalen_kraftverk';
const expected = {
  id: 'halfdan_greve',
  name: 'Halfdan Greve',
  aliases: ['Halfdan Greve', 'H. Greve'],
  year: 1916
};
const requiredSources = [
  'https://www.grannar.no/nyhende/i-mal-med-omfattande-oppgradering/516543',
  'https://skl.as/historia-var/'
];

const manifest = readJson('data/people/manifest.json');
assert.strictEqual(manifest.files.filter((file) => file === expectedFile).length, 1, 'Batch 19-fila skal stå nøyaktig éin gong i manifestet');

const batch = readJson(`data/${expectedFile}`);
assert(Array.isArray(batch), 'Batch 19-fila skal vere ei liste');
assert.strictEqual(batch.length, 1, 'Batch 19 skal berre ha den dokumenterte byggeleiarrolla');

const person = batch[0];
assert.strictEqual(person.id, expected.id);
assert.strictEqual(person.name, expected.name);
assert.strictEqual(person.placeId, placeId);
assert.deepStrictEqual(person.places, [placeId]);
assert.strictEqual(person.category, 'naeringsliv');
assert.strictEqual(person.year, expected.year);
assert(person.tags.includes('byggeleiing'));
assert(person.popupDesc.includes('Haugesund kommune ved byggeleiar Halfdan Greve'));
assert(person.popupDesc.includes('stod kraftverket ferdig i 1920'));
assert(person.popupDesc.includes('ikkje at han finansierte, teikna eller åleine bygde kraftverket'));
for (const source of requiredSources) assert(person.source_urls.includes(source));
assert.strictEqual(person.verifiedAt, '2026-07-18');

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(placeId), 'Batch 19 peikar på eit inaktivt place');

const identityHits = [];
const placeHits = [];
const aliases = [expected.id, ...expected.aliases].map(normalize);
for (const file of manifest.files) {
  const raw = readJson(`data/${file}`);
  const entries = Array.isArray(raw) ? raw : [raw];
  for (const candidate of entries) {
    const fields = [candidate.id, candidate.name, ...(candidate.aliases || [])].map(normalize);
    if (fields.some((field) => aliases.includes(field))) identityHits.push({ file, id: candidate.id, name: candidate.name });
    if (candidate.placeId === placeId || (candidate.places || []).includes(placeId)) placeHits.push({ file, id: candidate.id, name: candidate.name });
  }
}

assert.deepStrictEqual(identityHits, [{ file: expectedFile, id: expected.id, name: expected.name }], 'Halfdan Greve skal finnast nøyaktig éin gong globalt');
assert.deepStrictEqual(placeHits, [{ file: expectedFile, id: expected.id, name: expected.name }], 'Litledalen kraftverk skal få nøyaktig den eine dokumenterte people-lenkja');

console.log('Etne People of Places batch 19 OK (1 historical construction leader, 1 newly covered power station, 1 canonical identity)');
