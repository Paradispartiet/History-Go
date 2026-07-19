const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const activePlaceIds = new Set(
  readJson('data/places/places_index.json')
    .map(place => String(place.id || '').trim())
    .filter(Boolean)
);

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

const cases = [
  ['akerselva', 'data/places/by/oslo/places/akerselva.json', true],
  ['alnaparken', 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alnaparken.json', true],
  ['svartdalen', 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/svartdalen.json', true],
  ['middelalder_oslo', 'data/places/historie/oslo/places_historie/middelalder_oslo.json', false],
  ['var_frelsers_gravlund', 'data/places/historie/oslo/places_historie/var_frelsers_gravlund.json', false]
];

for (const [placeId, file, requiresMappedSpecies] of cases) {
  const place = readJson(file);
  assert.strictEqual(place.id, placeId, `${file} har feil place-id`);
  assert(activePlaceIds.has(placeId), `${placeId} mangler i aktiv places_index`);

  const profile = place.nature_profile;
  assert(profile && typeof profile === 'object', `${placeId} mangler nature_profile`);
  assert(String(profile.type || '').length >= 12, `${placeId} mangler stedsspesifikk naturtype`);
  assert(String(profile.title || '').length >= 12, `${placeId} mangler naturtittel`);
  assert(String(profile.summary || '').length >= 180, `${placeId} har for kort natursammendrag`);
  assert(Array.isArray(profile.themes) && profile.themes.length >= 5, `${placeId} trenger minst fem naturtemaer`);
  assert.strictEqual(new Set(profile.themes).size, profile.themes.length, `${placeId} har dupliserte naturtemaer`);
  assert(Array.isArray(profile.nearby_place_ids) && profile.nearby_place_ids.length >= 3, `${placeId} mangler nærnatur-koblinger`);
  assert.strictEqual(new Set(profile.nearby_place_ids).size, profile.nearby_place_ids.length, `${placeId} har dupliserte nærnatur-koblinger`);

  for (const nearbyId of profile.nearby_place_ids) {
    assert(activePlaceIds.has(nearbyId), `${placeId} peker til inaktivt nærnatursted ${nearbyId}`);
  }

  if (requiresMappedSpecies) {
    const entry = mergedNatureMap[placeId];
    assert(entry && entry.flora.length + entry.fauna.length > 0, `${placeId} mangler kartlagte arter`);
  }
}

assert(readJson('data/places/historie/oslo/places_historie/middelalder_oslo.json').rounds.includes('nature'), 'Middelalderparken skal beholde Natur-rundingen');
assert(readJson('data/places/historie/oslo/places_historie/var_frelsers_gravlund.json').rounds.includes('nature'), 'Vår Frelsers gravlund skal beholde Natur-rundingen');

console.log('Oslo Nature round batch 4 profiles OK');
