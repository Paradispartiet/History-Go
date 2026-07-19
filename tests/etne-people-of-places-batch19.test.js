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

const expectedFile = 'people/naeringsliv/vestland/etne/people_litledalen_kraftverk_batch1.json';
const expectedPlaceId = 'litledalen_kraftverk';
const expected = {
  id: 'halfdan_greve',
  name: 'Halfdan Greve',
  aliases: ['Halfdan Greve', 'H. Greve', 'Halfdan G. Greve']
};
const requiredSources = [
  'https://www.grannar.no/nyhende/i-mal-med-omfattande-oppgradering/516543',
  'https://www.nve.no/energi/energisystem/vannkraft/vannkraftdatabase/vannkraftverk/?id=248'
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
assert.strictEqual(batch.length, 1, 'Batch 19 skal berre innehalde den dokumenterte byggeleiar-kandidaten');

const person = batch[0];
assert.strictEqual(person.id, expected.id, 'Batch 19 har feil canonical people-id');
assert.strictEqual(person.name, expected.name, 'Batch 19 har feil canonical namn');
assert.strictEqual(person.placeId, expectedPlaceId, 'Halfdan Greve har feil primæranker');
assert.deepStrictEqual(person.places, [expectedPlaceId], 'Halfdan Greve skal berre peike på Litledalen kraftverk');
assert.strictEqual(person.category, 'naeringsliv', 'Halfdan Greve har feil kategori');
assert.strictEqual(person.year, 1916, 'Halfdan Greve skal vere knytt til den dokumenterte byggjestarten i 1916');
assert(person.tags.includes('vasskraft'), 'Halfdan Greve manglar vasskraft-tag');
assert(person.tags.includes('byggjeleiing'), 'Halfdan Greve manglar byggjeleiing-tag');
assert(person.popupDesc.includes('byggeleiar Halfdan Greve'), 'Popupen manglar den eksplisitte dokumenterte rolleformuleringa');
assert(person.popupDesc.includes('påstår ikkje at han åleine'), 'Popupen manglar nødvendig rolleavgrensing');
assert(Array.isArray(person.source_urls), 'Halfdan Greve manglar kjeldeliste');
for (const source of requiredSources) {
  assert(person.source_urls.includes(source), `Halfdan Greve manglar kjelda ${source}`);
}
assert(person.source_urls.every((url) => url.startsWith('https://')), 'Halfdan Greve har ugyldig kjelde-URL');
assert.strictEqual(person.verifiedAt, '2026-07-18', 'Halfdan Greve har feil verifiseringsdato');

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), 'Batch 19 peikar på eit inaktivt place');

const identityHits = [];
const primaryPlaceHits = [];
const aliases = [expected.id, ...expected.aliases].map(normalize);
for (const file of manifest.files) {
  const data = readJson(`data/${file}`);
  const people = Array.isArray(data) ? data : [data];
  for (const candidate of people) {
    const fields = [candidate.id, candidate.name, ...(candidate.aliases || [])].map(normalize);
    if (fields.some((field) => aliases.includes(field))) {
      identityHits.push({ file, id: candidate.id, name: candidate.name });
    }
    if (candidate.placeId === expectedPlaceId) {
      primaryPlaceHits.push({ file, id: candidate.id, name: candidate.name });
    }
  }
}

assert.deepStrictEqual(
  identityHits,
  [{ file: expectedFile, id: expected.id, name: expected.name }],
  'Halfdan Greve skal finnast nøyaktig ein gong globalt ved normalisert ID-, namn- og variantkontroll'
);
assert.deepStrictEqual(
  primaryPlaceHits,
  [{ file: expectedFile, id: expected.id, name: expected.name }],
  'Litledalen kraftverk skal få nøyaktig Halfdan Greve som første primære people-lenkje i batch 19'
);

console.log('Etne People of Places batch 19 OK (1 documented construction leader, 1 newly covered power plant, 1 canonical identity)');
