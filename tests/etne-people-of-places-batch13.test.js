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

const expectedFile = 'people/sport/vestland/etne/people_sport_etne_batch2.json';
const expectedId = 'geir_arne_havreberg';
const expectedName = 'Geir Arne Havreberg';
const expectedPlaceId = 'etne_kyokushin_dojo';
const requiredSources = [
  'https://kyokushinworldfederation.org/kyokushin-winter-camp-in-etne-norway-26-29-january-2023/',
  'https://kyokushin-etne.net/wordpress/?page_id=2',
  'https://kyokushin-etne.net/wordpress/?page_id=16',
  'https://www.instagram.com/reel/DOZJg2-imW8/',
  'https://virksomhet.brreg.no/nb/oppslag/enheter/993454729'
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
assert.strictEqual(batch.length, 1, `${expectedFile} skal berre innehalde den strengt dokumenterte kandidaten`);

const [person] = batch;
assert.strictEqual(person.id, expectedId, 'Batch 13 har feil canonical person-ID');
assert.strictEqual(person.name, expectedName, 'Batch 13 har feil fullt namn');
assert.strictEqual(person.visual?.designCode, 'person_coach_miniature', `${expectedId} har feil designkode`);
assert.strictEqual(person.placeId, expectedPlaceId, `${expectedId} har feil primæranker`);
assert.deepStrictEqual(person.places, [expectedPlaceId], `${expectedId} skal berre peike på den dokumenterte dojoen`);
assert.strictEqual(person.category, 'sport', `${expectedId} har feil kategori`);
assert.strictEqual(person.year, null, `${expectedId} skal ikkje gi klubbåret ut for å vere opningsår for dojoen`);
assert(person.popupDesc.includes('Stadionvegen 38'), `${expectedId} manglar den eksakte fysiske adressa`);
assert(person.popupDesc.includes('ikkje at klubbens stiftingsår er opningsåret'), `${expectedId} manglar nødvendig årstalsavgrensing`);
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
    const tokens = new Set(normalize(candidate.name).split(' '));
    if (
      candidate.id === expectedId
      || normalize(candidate.name) === normalize(expectedName)
      || (tokens.has('geir') && tokens.has('havreberg'))
    ) {
      canonicalHits.push({ file, id: candidate.id, name: candidate.name });
    }
  }
}

assert.deepStrictEqual(
  canonicalHits,
  [{ file: expectedFile, id: expectedId, name: expectedName }],
  'Geir Arne Havreberg skal finnast nøyaktig ein gong på tvers av ID-, namn- og namnevariantkontrollen'
);

console.log('Etne People of Places batch 13 OK (1 founder/head coach, 1 newly covered physical dojo, 1 canonical identity)');
