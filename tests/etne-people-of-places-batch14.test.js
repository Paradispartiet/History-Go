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

const expectedFile = 'people/kunst/vestland/etne/people_musikkpaviljongen_doktorhagen_batch1.json';
const expectedId = 'bygdafolket_og_lions_musikkpaviljongen';
const expectedName = 'Bygdafolket og Lions bak musikkpaviljongen';
const expectedPlaceId = 'musikkpaviljongen_doktorhagen';
const requiredSources = [
  'https://www.fjordhotellet.no/aktivitetar',
  'https://www.etne.kommune.no/_f/p1/iaed56af7-0455-47a7-9d42-e1ae9bcae881/stadanalyse-2025.pdf'
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
assert.strictEqual(batch.length, 1, `${expectedFile} skal berre innehalde det dokumenterte kollektive miljøankeret`);

const [person] = batch;
assert.strictEqual(person.id, expectedId, 'Batch 14 har feil canonical people-ID');
assert.strictEqual(person.name, expectedName, 'Batch 14 har feil kollektivnamn');
assert.strictEqual(person.placeId, expectedPlaceId, `${expectedId} har feil primæranker`);
assert.deepStrictEqual(person.places, [expectedPlaceId], `${expectedId} skal berre peike på den dokumenterte paviljongen`);
assert.strictEqual(person.category, 'kunst', `${expectedId} har feil kategori`);
assert.strictEqual(person.year, 2000, `${expectedId} skal vere knytt til innviinga og overleveringa i 2000`);
assert(person.tags.includes('kollektivt_miljoanker'), `${expectedId} skal vere tydeleg merka som kollektivt miljøanker`);
assert(person.popupDesc.includes('lotteri, innsamlingar og arrangement'), `${expectedId} manglar den dokumenterte finansieringa`);
assert(person.popupDesc.includes('3. juni 2000'), `${expectedId} manglar den dokumenterte overleveringsdatoen`);
assert(person.popupDesc.includes('ikkje at alle i bygda eller alle Lions-medlemmer deltok'), `${expectedId} manglar nødvendig kollektivavgrensing`);
assert(Array.isArray(person.source_urls), `${expectedId} manglar kjeldeliste`);
for (const source of requiredSources) {
  assert(person.source_urls.includes(source), `${expectedId} manglar kjelda ${source}`);
}
assert(person.source_urls.every((url) => url.startsWith('https://')), `${expectedId} har ugyldig kjelde-URL`);
assert.strictEqual(person.verifiedAt, '2026-07-18', `${expectedId} har feil verifiseringsdato`);

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), `${expectedId} peikar på eit inaktivt place`);

const canonicalHits = [];
for (const file of manifest.files) {
  const data = readJson(`data/${file}`);
  const people = Array.isArray(data) ? data : [data];
  for (const candidate of people) {
    const id = normalize(candidate.id);
    const name = normalize(candidate.name);
    const haystack = `${id} ${name}`;
    if (
      candidate.id === expectedId
      || name === normalize(expectedName)
      || (haystack.includes('lions') && haystack.includes('musikkpaviljong'))
    ) {
      canonicalHits.push({ file, id: candidate.id, name: candidate.name });
    }
  }
}

assert.deepStrictEqual(
  canonicalHits,
  [{ file: expectedFile, id: expectedId, name: expectedName }],
  'Det kollektive paviljongankeret skal finnast nøyaktig ein gong på tvers av ID-, namn- og variantkontrollen'
);

console.log('Etne People of Places batch 14 OK (1 bounded collective, 1 newly covered physical pavilion, 1 canonical identity)');
