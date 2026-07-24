const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'data/people/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const batchPaths = {
  first: 'people/politikk/oslo/people_politikk_oslo_uncovered_places_batch_01.json',
  politics: 'people/politikk/oslo/people_politikk_oslo_place_expansion_batch_02.json',
  city: 'people/by/oslo/people_by_oslo_politics_places_batch_02.json',
  art: 'people/kunst/oslo/people_kunst_oslo_politics_places_batch_02.json',
  literature: 'people/litteratur/oslo/people_litteratur_oslo_politics_places_batch_02.json'
};

assert(Array.isArray(manifest.files), 'People-manifestet må ha files-array');
for (const batchPath of Object.values(batchPaths)) {
  assert(manifest.files.includes(batchPath), `${batchPath} mangler i People-manifestet`);
  assert.strictEqual(manifest.files.filter((item) => item === batchPath).length, 1, `${batchPath} er registrert mer enn én gang`);
}

const allPeople = [];
for (const relative of manifest.files) {
  const file = path.join(root, 'data', relative);
  assert(fs.existsSync(file), `Manifestfil mangler: ${relative}`);
  const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  for (const entry of entries) allPeople.push({ ...entry, __file: relative });
}

const byId = new Map();
for (const person of allPeople) {
  assert(person && typeof person.id === 'string' && person.id, `Ugyldig person i ${person.__file}`);
  assert(!byId.has(person.id), `Duplikat person-id: ${person.id}`);
  byId.set(person.id, person);
}

const placeIdsFor = (person) => {
  const ids = new Set();
  if (typeof person.placeId === 'string' && person.placeId) ids.add(person.placeId);
  if (Array.isArray(person.places)) {
    for (const placeId of person.places) {
      if (typeof placeId === 'string' && placeId) ids.add(placeId);
    }
  }
  return ids;
};

const peopleByPlace = new Map();
for (const person of allPeople) {
  for (const placeId of placeIdsFor(person)) {
    if (!peopleByPlace.has(placeId)) peopleByPlace.set(placeId, []);
    peopleByPlace.get(placeId).push(person);
  }
}

const primaryOsloPoliticsPlaces = [
  'stortinget',
  'youngstorget',
  'oslo_radhus',
  'eidsvolls_plass',
  'tinghuset',
  'regjeringskvartalet',
  'hoyesteretts_hus',
  'politihuset_gronland',
  'folkets_hus_oslo',
  '22_juli_senteret',
  'hoyblokka',
  'y_blokka',
  'victoria_terrasse',
  'statsministerboligen',
  'hoyres_hus',
  'arbeidersamfunnets_plass',
  'slottet',
  'bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5'
];

for (const placeId of primaryOsloPoliticsPlaces) {
  const people = peopleByPlace.get(placeId) || [];
  assert(people.length > 0, `Politikksted mangler People-kobling: ${placeId}`);
}

const firstBatchPeople = {
  ole_lislerud: ['tinghuset'],
  hans_jakob_sparre: ['hoyesteretts_hus'],
  are_telje: ['politihuset_gronland'],
  lena_fahre: ['22_juli_senteret'],
  sverre_jystad: ['hoyblokka', 'y_blokka'],
  jorgen_lovland: ['victoria_terrasse'],
  henry_bucher: ['statsministerboligen']
};

const expansionPeople = {
  toril_marie_oie: { file: batchPaths.politics, places: ['hoyesteretts_hus'] },
  carsten_smith: { file: batchPaths.politics, places: ['hoyesteretts_hus'] },
  paal_berg: { file: batchPaths.politics, places: ['hoyesteretts_hus'] },
  alexandra_europa_perez_seoane: { file: batchPaths.politics, places: ['22_juli_senteret'] },
  thor_von_ditten: { file: batchPaths.politics, places: ['victoria_terrasse'] },
  halvdan_koht: { file: batchPaths.politics, places: ['victoria_terrasse'] },
  erna_solberg: { file: batchPaths.politics, places: ['statsministerboligen', 'hoyres_hus'] },
  knut_aasen: { file: batchPaths.city, places: ['politihuset_gronland'] },
  anne_bjorndal: { file: batchPaths.city, places: ['22_juli_senteret'] },
  oivind_astein: { file: batchPaths.art, places: ['tinghuset'] },
  torstein_bakke: { file: batchPaths.art, places: ['22_juli_senteret'] },
  lars_halvor_mageroy: { file: batchPaths.art, places: ['22_juli_senteret'] },
  kai_fjell: { file: batchPaths.art, places: ['hoyblokka'] },
  tore_haaland: { file: batchPaths.art, places: ['hoyblokka'] },
  inger_sitter: { file: batchPaths.art, places: ['hoyblokka'] },
  odd_tandberg: { file: batchPaths.art, places: ['hoyblokka'] },
  olaf_bull: { file: batchPaths.literature, places: ['arbeidersamfunnets_plass'] }
};

for (const [personId, expectedPlaces] of Object.entries(firstBatchPeople)) {
  const person = byId.get(personId);
  assert(person, `Første batch-person mangler: ${personId}`);
  assert.strictEqual(person.__file, batchPaths.first, `${personId} ligger ikke i første låste batchfil`);
  assert(Array.isArray(person.source_urls) && person.source_urls.length > 0, `${personId} mangler kilder`);
  const actual = placeIdsFor(person);
  for (const placeId of expectedPlaces) {
    assert(actual.has(placeId), `${personId} mangler kobling til ${placeId}`);
  }
}

for (const [personId, expected] of Object.entries(expansionPeople)) {
  const person = byId.get(personId);
  assert(person, `Utvidelsesperson mangler: ${personId}`);
  assert.strictEqual(person.__file, expected.file, `${personId} ligger i feil fagfil`);
  assert(Array.isArray(person.source_urls) && person.source_urls.length > 0, `${personId} mangler kilder`);
  const actual = placeIdsFor(person);
  for (const placeId of expected.places) {
    assert(actual.has(placeId), `${personId} mangler kobling til ${placeId}`);
  }
}

const reusedPeople = {
  fredrik_a_s_torp: ['politihuset_gronland'],
  erling_viksjo: ['hoyblokka', 'y_blokka'],
  carl_nesjar: ['hoyblokka', 'y_blokka'],
  pablo_picasso: ['hoyblokka', 'y_blokka'],
  jens_stoltenberg: ['statsministerboligen'],
  magnus_poulsson: ['hoyres_hus'],
  eilert_sundt: ['arbeidersamfunnets_plass'],
  ove_bang: ['arbeidersamfunnets_plass']
};

for (const [personId, expectedPlaces] of Object.entries(reusedPeople)) {
  const person = byId.get(personId);
  assert(person, `Eksisterende person mangler: ${personId}`);
  const actual = placeIdsFor(person);
  for (const placeId of expectedPlaces) {
    assert(actual.has(placeId), `${personId} mangler ny kobling til ${placeId}`);
  }
}

const minimumCoverage = {
  tinghuset: 2,
  hoyesteretts_hus: 4,
  politihuset_gronland: 3,
  '22_juli_senteret': 5,
  hoyblokka: 8,
  y_blokka: 4,
  victoria_terrasse: 3,
  statsministerboligen: 3,
  hoyres_hus: 2,
  arbeidersamfunnets_plass: 3
};

for (const [placeId, minimum] of Object.entries(minimumCoverage)) {
  const count = (peopleByPlace.get(placeId) || []).length;
  assert(count >= minimum, `${placeId} har ${count} People-koblinger, forventet minst ${minimum}`);
}

console.log(`Oslo politikk People-dekning OK: ${primaryOsloPoliticsPlaces.length}/${primaryOsloPoliticsPlaces.length} steder`);
console.log(`Nye personer totalt: ${Object.keys(firstBatchPeople).length + Object.keys(expansionPeople).length}; gjenbrukte personer: ${Object.keys(reusedPeople).length}`);
console.log(`Utvidelsesbatch: ${Object.keys(expansionPeople).length} personer fordelt på politikk, by, kunst og litteratur`);
