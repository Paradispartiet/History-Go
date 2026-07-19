const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const placeDir = 'data/places/natur/oslo/places_oslo_alna';
const places = [
  ['alnaelva', `${placeDir}/alnaelva.json`],
  ['alnaelvstien', `${placeDir}/alnaelvstien.json`],
  ['loelva_historisk', `${placeDir}/loelva_historisk.json`],
  ['trosterud_friomrade', `${placeDir}/trosterud_friomrade.json`],
  ['furuset_haugerud_skogbelte', `${placeDir}/furuset_haugerud_skogbelte.json`]
];

const activePlaceIds = new Set(
  readJson('data/places/places_index.json')
    .map(place => String(place.id || '').trim())
    .filter(Boolean)
);

for (const [expectedId, file] of places) {
  const place = readJson(file);
  assert.strictEqual(place.id, expectedId, `${file}: feil place-id`);
  assert(activePlaceIds.has(place.id), `${place.id}: mangler i aktiv places_index`);
  assert.strictEqual(place.category, 'natur', `${place.id}: skal være natursted`);

  const profile = place.nature_profile;
  assert(profile && typeof profile === 'object', `${place.id}: mangler nature_profile`);
  assert(String(profile.type || '').length >= 12, `${place.id}: naturtype er for kort`);
  assert(String(profile.title || '').length >= 12, `${place.id}: naturtittel er for kort`);
  assert(String(profile.summary || '').length >= 240, `${place.id}: natursammendrag er for kort`);

  assert(Array.isArray(profile.themes), `${place.id}: themes må være en liste`);
  assert(profile.themes.length >= 5, `${place.id}: trenger minst fem naturtemaer`);
  assert.strictEqual(new Set(profile.themes).size, profile.themes.length, `${place.id}: dupliserte naturtemaer`);

  assert(Array.isArray(profile.nearby_place_ids), `${place.id}: nearby_place_ids må være en liste`);
  assert.strictEqual(profile.nearby_place_ids.length, 3, `${place.id}: skal ha tre nærnaturkoblinger`);
  assert.strictEqual(new Set(profile.nearby_place_ids).size, 3, `${place.id}: dupliserte nærnaturkoblinger`);
  for (const nearbyId of profile.nearby_place_ids) {
    assert.notStrictEqual(nearbyId, place.id, `${place.id}: kan ikke koble til seg selv`);
    assert(activePlaceIds.has(nearbyId), `${place.id}: ukjent nærnatursted ${nearbyId}`);
  }

  assert(!Object.prototype.hasOwnProperty.call(place, 'flora'), `${place.id}: flora skal ligge i naturkartet`);
  assert(!Object.prototype.hasOwnProperty.call(place, 'fauna'), `${place.id}: fauna skal ligge i naturkartet`);
}

const mapFiles = [
  'data/natur/nature_place_map.json',
  'data/natur/nature_bird_place_map.json',
  'data/natur/nature_oslo_expansion_place_map.json',
  'data/natur/nature_routes_place_map.json',
  'data/natur/nature_etne_place_map.json'
];

const mergedNatureMap = {};
for (const file of mapFiles) {
  const raw = readJson(file);
  const mappedPlaces = raw.places || raw;
  for (const [placeId, entry] of Object.entries(mappedPlaces)) {
    const target = mergedNatureMap[placeId] ||= { flora: new Set(), fauna: new Set() };
    for (const speciesId of Array.isArray(entry.flora) ? entry.flora : []) target.flora.add(speciesId);
    for (const speciesId of Array.isArray(entry.fauna) ? entry.fauna : []) target.fauna.add(speciesId);
  }
}

const documentedSpecies = {
  alnaelva: {
    flora: ['emne_flora_kanadagullris'],
    fauna: []
  },
  loelva_historisk: {
    flora: ['emne_ved_smabladlind', 'emne_flora_kanadagullris'],
    fauna: ['emne_fauna_kraake', 'emne_fauna_graamaake', 'emne_fauna_kaie', 'emne_fauna_skjaere']
  }
};

for (const [placeId, expected] of Object.entries(documentedSpecies)) {
  const entry = mergedNatureMap[placeId];
  assert(entry, `${placeId}: dokumentert artskart mangler`);
  assert.deepStrictEqual([...entry.flora].sort(), [...expected.flora].sort(), `${placeId}: flora er endret`);
  assert.deepStrictEqual([...entry.fauna].sort(), [...expected.fauna].sort(), `${placeId}: fauna er endret`);
}

for (const placeId of ['alnaelvstien', 'trosterud_friomrade', 'furuset_haugerud_skogbelte']) {
  const entry = mergedNatureMap[placeId];
  assert(!entry || entry.flora.size + entry.fauna.size === 0, `${placeId}: skal ikke få gjettede arter`);
}

console.log('Legacy Alna Nature profiles batch 14 OK');
