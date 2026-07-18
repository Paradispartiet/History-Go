const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const expectedFiles = new Map([
  [
    'people/media/vestland/etne/ann_margit_gronstad.json',
    [{ id: 'ann_margit_gronstad', placeId: 'grannar_redaksjon_etne' }]
  ],
  [
    'people/sport/vestland/etne/geir_havreberg.json',
    [{ id: 'geir_havreberg', placeId: 'etne_kyokushin_dojo' }]
  ],
  [
    'people/sport/vestland/etne/havard_matre.json',
    [{ id: 'havard_matre', placeId: 'etne_idrettsanlegg' }]
  ],
  [
    'people/sport/vestland/etne/harald_ekornrud.json',
    [{ id: 'harald_ekornrud', placeId: 'etne_tennisanlegg' }]
  ],
  [
    'people/vitenskap/vestland/etne/etneelva_forskningsplattform_people_batch1.json',
    [
      { id: 'per_tommy_fjeldheim', placeId: 'etneelva_forskningsplattform' },
      { id: 'oystein_skaala', placeId: 'etneelva_forskningsplattform' }
    ]
  ],
  [
    'people/musikk/vestland/etne/old_river_saloon/people_old_river_saloon_batch1.json',
    [
      { id: 'aslaug_olden_mala', placeId: 'old_river_saloon_etne' },
      { id: 'rune_kringlebotten', placeId: 'old_river_saloon_etne' },
      { id: 'amalie_kringlebotten', placeId: 'old_river_saloon_etne' }
    ]
  ],
  [
    'people/kunst/vestland/etne/fugl_fonix/people_fugl_fonix_batch1.json',
    [
      { id: 'audun_stene', placeId: 'fugl_fonix_etne' },
      { id: 'jan_terje_rafdal', placeId: 'fugl_fonix_etne' },
      { id: 'vidar_lund', placeId: 'fugl_fonix_etne' },
      { id: 'asbjorn_moe', placeId: 'fugl_fonix_etne' },
      { id: 'carina_vevang', placeId: 'fugl_fonix_etne' }
    ]
  ],
  [
    'people/kunst/vestland/etne/pippifestivalen/people_pippifestivalen_batch1.json',
    [
      { id: 'inger_karin_larsen', placeId: 'skanevik_fjordhotel_pippifestivalen' },
      { id: 'bard_henrik_tungesvik_hereide', placeId: 'skanevik_fjordhotel_pippifestivalen' },
      { id: 'theresa_tungesvik_hereide', placeId: 'skanevik_fjordhotel_pippifestivalen' }
    ]
  ]
]);

const manifest = readJson('data/people/manifest.json');
assert(Array.isArray(manifest.files), 'People-manifestet skal ha ei files-liste');

const manifestCounts = new Map();
for (const file of manifest.files) {
  manifestCounts.set(file, (manifestCounts.get(file) || 0) + 1);
}

for (const [file] of expectedFiles) {
  assert.strictEqual(manifestCounts.get(file), 1, `${file} skal vere registrert nøyaktig éin gong`);
}

for (const roundBatch of [8, 9]) {
  const file = `people/historie/vestland/etne/people_historie_etne_rounds_batch${roundBatch}.json`;
  assert.strictEqual(manifestCounts.get(file), 1, `${file} skal vere bevart nøyaktig éin gong`);
}

const activePlaces = new Set(readJson('data/places/places_index.json').map((place) => place.id));
const allPeople = [];
const targetPeople = new Map();

for (const file of manifest.files) {
  const data = readJson(`data/${file}`);
  const people = Array.isArray(data) ? data : [data];
  for (const person of people) {
    allPeople.push({ ...person, sourceFile: file });
    if (expectedFiles.has(file)) targetPeople.set(person.id, person);
  }
}

const seenIds = new Map();
for (const person of allPeople) {
  assert(!seenIds.has(person.id), `${person.id} er duplisert i ${seenIds.get(person.id)} og ${person.sourceFile}`);
  seenIds.set(person.id, person.sourceFile);
}

const expectedPeople = [...expectedFiles.values()].flat();
assert.strictEqual(targetPeople.size, expectedPeople.length, 'Integrasjonen skal aktivere alle planlagde Etne-personar');

for (const expected of expectedPeople) {
  const person = targetPeople.get(expected.id);
  assert(person, `Mangler aktiv people-ID ${expected.id}`);
  assert.strictEqual(person.placeId, expected.placeId, `${expected.id} har feil primæranker`);
  assert(activePlaces.has(expected.placeId), `${expected.id} peiker på eit inaktivt place ${expected.placeId}`);
  assert(Array.isArray(person.places), `${expected.id} skal ha ei places-liste`);
  assert.strictEqual(
    person.places.filter((placeId) => placeId === expected.placeId).length,
    1,
    `${expected.id} skal ha nøyaktig éi lenkje til ${expected.placeId}`
  );
}

const stig = allPeople.find((person) => person.id === 'stig_morten_sorheim');
assert(stig, 'Eksisterande canonical stig_morten_sorheim skal vere aktiv');
assert.strictEqual(stig.placeId, 'abc_studio_etne', 'Stig Morten Sørheim skal behalde ABC Studio som primæranker');
assert.strictEqual(
  stig.places.filter((placeId) => placeId === 'fugl_fonix_etne').length,
  1,
  'Stig Morten Sørheim skal behalde nøyaktig éi sekundær Fugl Fønix-lenkje'
);

console.log(`Etne people manifest integration OK (${expectedPeople.length} recovered people, ${allPeople.length} active people)`);
