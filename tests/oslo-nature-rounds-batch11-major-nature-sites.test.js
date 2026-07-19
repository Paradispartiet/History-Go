const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const placeDir = 'data/places/natur/oslo/places_oslo_natur_hovedsteder';
const places = [
  ['hovedoya', `${placeDir}/hovedoya.json`],
  ['gressholmen', `${placeDir}/gressholmen.json`],
  ['maerradalen', `${placeDir}/maerradalen.json`],
  ['maridalsvannet', `${placeDir}/maridalsvannet.json`],
  ['noklevann', `${placeDir}/noklevann.json`]
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
    const target = mergedNatureMap[placeId] ||= { flora: [], fauna: [] };
    target.flora.push(...(Array.isArray(entry.flora) ? entry.flora : []));
    target.fauna.push(...(Array.isArray(entry.fauna) ? entry.fauna : []));
  }
}

for (const placeId of ['hovedoya', 'maerradalen', 'noklevann']) {
  const entry = mergedNatureMap[placeId];
  assert(entry, `${placeId}: dokumentert artskart mangler`);
  assert(entry.flora.length + entry.fauna.length > 0, `${placeId}: dokumenterte arter må beholdes`);
}

console.log('Major Oslo Nature site profiles batch 11 OK');
