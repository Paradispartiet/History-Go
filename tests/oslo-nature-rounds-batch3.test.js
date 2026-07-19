const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const targets = [
  ['karl_johan', 'data/places/by/oslo/places/karl_johan.json'],
  ['radhusplassen', 'data/places/by/oslo/places/radhusplassen.json'],
  ['bjorvika', 'data/places/by/oslo/places/bjorvika.json'],
  ['oslo_s', 'data/places/by/oslo/places/oslo_s.json'],
  ['jernbanetorget', 'data/places/by/oslo/places/jernbanetorget.json']
];

const activePlaceIds = new Set(readJson('data/places/places_index.json').map(place => String(place.id || '').trim()).filter(Boolean));

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
  const places = raw.places || raw;
  for (const [placeId, entry] of Object.entries(places)) {
    const current = mergedNatureMap[placeId] || { flora: [], fauna: [] };
    mergedNatureMap[placeId] = {
      flora: [...new Set([...current.flora, ...(entry.flora || [])])],
      fauna: [...new Set([...current.fauna, ...(entry.fauna || [])])]
    };
  }
}

for (const [placeId, file] of targets) {
  const place = readJson(file);
  assert.strictEqual(place.id, placeId, `${file} har feil place-id`);
  assert(activePlaceIds.has(placeId), `${placeId} mangler i aktiv places_index`);

  const profile = place.nature_profile;
  assert(profile && typeof profile === 'object', `${placeId} mangler nature_profile`);
  assert(String(profile.type || '').length >= 20, `${placeId} mangler stedsspesifikk naturtype`);
  assert(String(profile.title || '').length >= 12, `${placeId} mangler naturtittel`);
  assert(String(profile.summary || '').length >= 180, `${placeId} har for kort natursammendrag`);
  assert(Array.isArray(profile.themes) && profile.themes.length >= 5, `${placeId} trenger minst fem naturtemaer`);
  assert.strictEqual(new Set(profile.themes).size, profile.themes.length, `${placeId} har dupliserte naturtemaer`);

  assert(Array.isArray(profile.nearby_place_ids) && profile.nearby_place_ids.length >= 3, `${placeId} mangler nærnatur-koblinger`);
  assert.strictEqual(new Set(profile.nearby_place_ids).size, profile.nearby_place_ids.length, `${placeId} har dupliserte nærkoblinger`);
  for (const nearbyId of profile.nearby_place_ids) {
    assert(activePlaceIds.has(nearbyId), `${placeId} peker til inaktivt nærsted ${nearbyId}`);
  }

  const mapEntry = mergedNatureMap[placeId];
  assert(mapEntry, `${placeId} mangler artskartoppføring`);
  assert(mapEntry.flora.length + mapEntry.fauna.length > 0, `${placeId} mangler kartlagte arter`);
}

console.log('Oslo Nature round batch 3 OK');
