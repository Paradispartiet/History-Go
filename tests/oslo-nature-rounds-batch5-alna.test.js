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

const routePlaces = [
  ['alnsjoen_alna_kilde', 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alnsjoen_alna_kilde.json'],
  ['groruddammen', 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/groruddammen.json'],
  ['alna_smalvoll', 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_smalvoll.json'],
  ['alna_bryn', 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_bryn.json'],
  ['kvaernerbyen_alna', 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/kvaernerbyen_alna.json'],
  ['alna_utlop_bjorvika', 'data/places/natur/oslo/places_oslo_natur_alnaelva_rute/alna_utlop_bjorvika.json']
];

for (const [placeId, file] of routePlaces) {
  const place = readJson(file);
  assert.strictEqual(place.id, placeId, `${file} har feil place-id`);
  assert(activePlaceIds.has(placeId), `${placeId} mangler i aktiv places_index`);
  assert.strictEqual(place.category, 'natur', `${placeId} skal være et Natur-sted`);
  assert.strictEqual(place.routeId, 'alnaelva_grontdrag', `${placeId} skal høre til Alna-ruta`);

  const profile = place.nature_profile;
  assert(profile && typeof profile === 'object', `${placeId} mangler nature_profile`);
  assert(String(profile.type || '').length >= 12, `${placeId} har for generell naturtype`);
  assert(String(profile.title || '').length >= 12, `${placeId} mangler stedsspesifikk naturtittel`);
  assert(String(profile.summary || '').length >= 180, `${placeId} har for kort natursammendrag`);

  const themes = Array.isArray(profile.themes) ? profile.themes : [];
  assert(themes.length >= 5, `${placeId} trenger minst fem naturtemaer`);
  assert.strictEqual(new Set(themes).size, themes.length, `${placeId} har dupliserte naturtemaer`);

  const nearby = Array.isArray(profile.nearby_place_ids) ? profile.nearby_place_ids : [];
  assert.strictEqual(nearby.length, 3, `${placeId} skal ha tre nærnaturkoblinger`);
  assert.strictEqual(new Set(nearby).size, nearby.length, `${placeId} har dupliserte nærnaturkoblinger`);
  for (const nearbyId of nearby) {
    assert(activePlaceIds.has(nearbyId), `${placeId} peker til inaktivt nærsted ${nearbyId}`);
  }

  const mapped = mergedNatureMap[placeId];
  assert(mapped, `${placeId} mangler i sammenslått naturkart`);
  assert(mapped.flora.length + mapped.fauna.length > 0, `${placeId} mangler kartlagte arter`);
}

console.log('Oslo Nature round batch 5 Alna route OK');
