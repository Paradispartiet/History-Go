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

const expectedFile = 'people/sport/vestland/etne/people_skanevik_discgolf_batch1.json';
const expectedId = 'solve_funderud';
const expectedName = 'Sølve Funderud';
const expectedPlaceId = 'skanevik_discgolf';
const requiredSources = [
  'https://www.instagram.com/p/DLnVuEgIm_2/',
  'https://skaanevikidrettslag.no/__static/jdj5jdewjhdoszkus0vbszqxmem2skza/Skanevik-Idrettslag-Sakliste-Arsmote-2026_komplett-med-sakspapirer.pdf',
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
assert.strictEqual(batch.length, 1, `${expectedFile} skal berre innehalde den dokumenterte initiativtakaren`);

const [person] = batch;
assert.strictEqual(person.id, expectedId, 'Batch 15 har feil canonical people-ID');
assert.strictEqual(person.name, expectedName, 'Batch 15 har feil canonical namn');
assert.strictEqual(person.placeId, expectedPlaceId, `${expectedId} har feil primæranker`);
assert.deepStrictEqual(person.places, [expectedPlaceId], `${expectedId} skal berre peike på den dokumenterte discgolfbana`);
assert.strictEqual(person.category, 'sport', `${expectedId} har feil kategori`);
assert.strictEqual(person.year, 2023, `${expectedId} skal vere knytt til etableringsåret 2023`);
assert(person.tags.includes('initiativtakar'), `${expectedId} manglar den dokumenterte initiativtakar-rolla`);
assert(person.tags.includes('primus_motor'), `${expectedId} manglar kommunen si rolleomtale`);
assert(person.popupDesc.includes('fysisk på bana'), `${expectedId} manglar den dokumenterte stadlege koplinga`);
assert(person.popupDesc.includes('bygd på dugnad'), `${expectedId} manglar kommunen si dokumenterte byggjekontekst`);
assert(person.popupDesc.includes('ikkje at Funderud åleine bygde bana'), `${expectedId} manglar nødvendig rolleavgrensing`);
assert(Array.isArray(person.source_urls), `${expectedId} manglar kjeldeliste`);
for (const source of requiredSources) {
  assert(person.source_urls.includes(source), `${expectedId} manglar kjelda ${source}`);
}
assert(person.source_urls.every((url) => url.startsWith('https://')), `${expectedId} har ugyldig kjelde-URL`);
assert.strictEqual(person.verifiedAt, '2026-07-18', `${expectedId} har feil verifiseringsdato`);

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
assert(activePlaces.has(expectedPlaceId), `${expectedId} peikar på eit inaktivt place`);

const aliases = [
  'solve_funderud',
  'Sølve Funderud',
  'Sølve W. Funderud',
  'Solve Funderud',
  'Solve W Funderud',
  'Soelve Funderud',
  'Sölve Funderud',
  'Solvi Funderud'
].map(normalize);
const canonicalHits = [];
const placeLinkHits = [];

for (const file of manifest.files) {
  const data = readJson(`data/${file}`);
  const people = Array.isArray(data) ? data : [data];
  for (const candidate of people) {
    const fields = [candidate.id, candidate.name, ...(candidate.aliases || [])].map(normalize);
    const aliasHit = fields.some((field) => aliases.includes(field));
    const tokenHit = fields.some((field) => field.includes('funderud') && (
      field.includes('solve')
      || field.includes('s lve')
      || field.includes('soelve')
      || field.includes('solvi')
    ));

    if (aliasHit || tokenHit) {
      canonicalHits.push({ file, id: candidate.id, name: candidate.name });
    }

    if (candidate.placeId === expectedPlaceId || (candidate.places || []).includes(expectedPlaceId)) {
      placeLinkHits.push({ file, id: candidate.id, name: candidate.name });
    }
  }
}

assert.deepStrictEqual(
  canonicalHits,
  [{ file: expectedFile, id: expectedId, name: expectedName }],
  'Sølve Funderud skal finnast nøyaktig ein gong på tvers av ID-, namn- og variantkontrollen'
);
assert.deepStrictEqual(
  placeLinkHits,
  [{ file: expectedFile, id: expectedId, name: expectedName }],
  'Skånevik discgolf skal få si første og einaste people-lenkje i batch 15'
);

console.log('Etne People of Places batch 15 OK (1 named initiator, 1 newly covered physical disc-golf course, 1 canonical identity)');
