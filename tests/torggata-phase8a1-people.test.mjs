import assert from 'node:assert/strict';
import fs from 'node:fs';

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const hasHttpsSource = person => {
  const urls = [
    ...(Array.isArray(person.source_urls) ? person.source_urls : []),
    ...(Array.isArray(person.externalLinks) ? person.externalLinks.map(link => link?.url) : [])
  ].filter(Boolean);
  return urls.some(url => String(url).startsWith('https://'));
};

const manifest = readJson('data/people/manifest.json');
const history = readJson('data/people/historie/oslo/people_historie_oslo.json');
const byPeople = readJson('data/people/by/oslo/people_by_oslo.json');

const splitFiles = [
  'data/people/by/oslo/folketeateret/christian_morgenstierne.json',
  'data/people/by/oslo/folketeateret/arne_eide.json',
  'data/people/by/oslo/torggata/thoger_binneballe.json',
  'data/people/by/oslo/torggata/harald_olsen.json',
  'data/people/litteratur/oslo/torggata/alma_fahlstrom.json',
  'data/people/litteratur/oslo/torggata/johan_fahlstrom.json'
];
const splitPeople = splitFiles.map(readJson);

const thorvald = history.find(person => person.id === 'thorvald_meyer');
const bull = byPeople.find(person => person.id === 'henrik_bull');
assert.ok(thorvald, 'thorvald_meyer må fortsatt finnes i historie-aggregatet');
assert.ok(bull, 'henrik_bull må fortsatt finnes i By-aggregatet');

const people = [thorvald, bull, ...splitPeople];
const expectedIds = [
  'thorvald_meyer',
  'henrik_bull',
  'christian_morgenstierne',
  'arne_eide',
  'thoger_binneballe',
  'harald_olsen',
  'alma_fahlstrom',
  'johan_fahlstrom'
];

assert.deepEqual(people.map(person => person.id).sort(), [...expectedIds].sort());
assert.equal(new Set(people.map(person => person.id)).size, expectedIds.length, '8A1 skal ikke introdusere duplikate person-ID-er');

assert.equal(thorvald.placeId, 'birkelunden', 'Thorvald Meyers eksisterende primæranker skal beholdes');
assert.equal(bull.placeId, 'nationaltheatret', 'Henrik Bulls eksisterende primæranker skal beholdes');
assert.equal(splitPeople.find(person => person.id === 'christian_morgenstierne').placeId, 'folketeateret');
assert.equal(splitPeople.find(person => person.id === 'arne_eide').placeId, 'folketeateret');

for (const person of people) {
  assert.ok(Array.isArray(person.places) && person.places.includes('torggata'), `${person.id} må være canonical koblet til torggata`);
  assert.ok(hasHttpsSource(person), `${person.id} må ha inspectable HTTPS-evidens`);
}

for (const id of ['thoger_binneballe', 'harald_olsen', 'alma_fahlstrom', 'johan_fahlstrom']) {
  const person = people.find(candidate => candidate.id === id);
  assert.equal(person.placeId, 'torggata', `${id} skal ha Torggata som primæranker`);
  assert.equal(person.image, '', `${id} skal ikke få oppdiktet bildepath`);
  assert.equal(person.cardImage, '', `${id} skal ikke få oppdiktet cardImage-path`);
}

const expectedManifestEntries = [
  'people/by/oslo/torggata/thoger_binneballe.json',
  'people/by/oslo/torggata/harald_olsen.json',
  'people/litteratur/oslo/torggata/alma_fahlstrom.json',
  'people/litteratur/oslo/torggata/johan_fahlstrom.json'
];
for (const entry of expectedManifestEntries) {
  assert.ok(manifest.files.includes(entry), `People-manifestet må laste ${entry}`);
  assert.equal(manifest.files.filter(value => value === entry).length, 1, `${entry} skal stå nøyaktig én gang i manifestet`);
}

assert.ok(bull.works?.some(work => work.id === 'fahlstroms_theater_henrik_bull' && work.year === 1903));
assert.ok(String(thorvald.popupDesc).includes('Torggata 16'));

console.log('Torggata phase 8A1 People regression: PASS');
