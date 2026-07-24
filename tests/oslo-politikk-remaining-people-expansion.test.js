const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/people/manifest.json'), 'utf8'));

const batchPaths = {
  city: 'people/by/oslo/people_by_oslo_politics_places_batch_03.json',
  art: 'people/kunst/oslo/people_kunst_oslo_politics_places_batch_03.json',
  business: 'people/naeringsliv/oslo/people_naeringsliv_oslo_politics_places_batch_03.json',
  politics: 'people/politikk/oslo/people_politikk_oslo_place_expansion_batch_03.json',
  history: 'people/historie/oslo/people_historie_oslo_politics_places_batch_03.json'
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
    for (const placeId of person.places) if (typeof placeId === 'string' && placeId) ids.add(placeId);
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

const newPeople = {
  emil_victor_langlet: { file: batchPaths.city, places: ['stortinget'] },
  hans_ditlev_franciscus_linstow: { file: batchPaths.city, places: ['slottet'] },
  oscar_wergeland: { file: batchPaths.art, places: ['stortinget'] },
  brynjulf_bergslien: { file: batchPaths.art, places: ['eidsvolls_plass'] },
  arne_vigeland: { file: batchPaths.art, places: ['eidsvolls_plass'] },
  arne_durban: { file: batchPaths.art, places: ['eidsvolls_plass'] },
  jorgen_young: { file: batchPaths.business, places: ['youngstorget'] },
  rolf_stranger: { file: batchPaths.politics, places: ['oslo_radhus'] },
  jorgen_knudsen: { file: batchPaths.politics, places: ['folkets_hus_oslo'] },
  dronning_maud: { file: batchPaths.history, places: ['slottet'] }
};

for (const [personId, expected] of Object.entries(newPeople)) {
  const person = byId.get(personId);
  assert(person, `Ny person mangler: ${personId}`);
  assert.strictEqual(person.__file, expected.file, `${personId} ligger i feil fagfil`);
  assert(Array.isArray(person.source_urls) && person.source_urls.length > 0, `${personId} mangler kilder`);
  const actual = placeIdsFor(person);
  for (const placeId of expected.places) assert(actual.has(placeId), `${personId} mangler kobling til ${placeId}`);
}

const reusedPeople = {
  henrik_wergeland: ['eidsvolls_plass'],
  arnstein_arneberg: ['eidsvolls_plass'],
  sverre_jystad: ['regjeringskvartalet'],
  jens_stoltenberg: ['regjeringskvartalet'],
  kai_fjell: ['regjeringskvartalet'],
  tore_haaland: ['regjeringskvartalet'],
  inger_sitter: ['regjeringskvartalet'],
  odd_tandberg: ['regjeringskvartalet']
};

for (const [personId, expectedPlaces] of Object.entries(reusedPeople)) {
  const person = byId.get(personId);
  assert(person, `Eksisterende person mangler: ${personId}`);
  const actual = placeIdsFor(person);
  for (const placeId of expectedPlaces) assert(actual.has(placeId), `${personId} mangler ny kobling til ${placeId}`);
}

const minimumCoverage = {
  stortinget: 32,
  youngstorget: 22,
  oslo_radhus: 17,
  eidsvolls_plass: 13,
  regjeringskvartalet: 10,
  folkets_hus_oslo: 3,
  slottet: 7,
  bla_skilt_christopher_hornsrud_mogens_thorsens_gate_5: 1
};

for (const [placeId, minimum] of Object.entries(minimumCoverage)) {
  const count = (peopleByPlace.get(placeId) || []).length;
  assert(count >= minimum, `${placeId} har ${count} People-koblinger, forventet minst ${minimum}`);
}

console.log(`Resterende Oslo-politikksteder utvidet: ${Object.keys(minimumCoverage).length}/8 kontrollert`);
console.log(`Nye personer: ${Object.keys(newPeople).length}; gjenbrukte personer: ${Object.keys(reusedPeople).length}`);
