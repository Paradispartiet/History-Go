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

const expectedFile = 'people/natur/vestland/etne/people_langfoss_batch1.json';
const expectedPlaceId = 'langfoss_etne';
const expected = {
  id: 'leif_grindheim',
  name: 'Leif Grindheim',
  aliases: ['Leif Grindheim', 'L. Grindheim']
};
const requiredSources = [
  'https://www.legria.no/2024/05/opprusting-av-langfosstien/',
  'https://www.legria.no/2025/08/nyhende-fra-legria-august-2025/',
  'https://www.etne.kommune.no/Organisasjon/OrganisasjonVis.aspx?MId1=3694&OrganisasjonId=210'
];

const manifest = readJson('data/people/manifest.json');
assert.strictEqual(manifest.files.filter((file) => file === expectedFile).length, 1, 'Batch 25 source must be registered exactly once');

const batch = readJson(`data/${expectedFile}`);
assert(Array.isArray(batch) && batch.length === 1, 'Batch 25 must contain exactly one person');
const person = batch[0];
assert.strictEqual(person.id, expected.id);
assert.strictEqual(person.name, expected.name);
assert.strictEqual(person.placeId, expectedPlaceId);
assert.deepStrictEqual(person.places, [expectedPlaceId]);
assert.strictEqual(person.category, 'natur');
assert.strictEqual(person.year, 2024);
assert(person.tags.includes('stirehabilitering'));
assert(person.tags.includes('prosjektleiing'));
assert(person.popupDesc.includes('prosjektleiar for Åkrafjorden Oppleving'));
assert(person.popupDesc.includes('gjer ikkje Grindheim til opphavsperson for fossen'));
for (const source of requiredSources) assert(person.source_urls.includes(source));
assert.strictEqual(person.verifiedAt, '2026-07-18');

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 25 target place must be active');

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
assert.deepStrictEqual(identityHits, expectedHit, 'Leif Grindheim must be globally unique');
assert.deepStrictEqual(placeHits, expectedHit, 'Langfoss must have exactly the intended batch 25 link');

console.log('Etne People of Places batch 25 OK (1 documented Langfoss project leader, 1 newly covered nature place, 1 canonical identity)');
