const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const placeFile = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/akerselva_utlop_bjorvika.json';
const place = readJson(placeFile);
const activePlaceIds = new Set(
  readJson('data/places/places_index.json')
    .map(entry => String(entry.id || '').trim())
    .filter(Boolean)
);

assert.strictEqual(place.id, 'akerselva_utlop_bjorvika', 'feil place-id');
assert(activePlaceIds.has(place.id), 'utløpsstedet mangler i aktiv places_index');
assert.strictEqual(place.category, 'natur', 'utløpsstedet skal være natursted');
assert.strictEqual(place.routeId, 'akerselva_grontdrag', 'utløpsstedet skal ligge i Akerselva-ruten');
assert.strictEqual(place.primary_category, 'natur', 'natur skal være primærkategori');

const profile = place.nature_profile;
assert(profile && typeof profile === 'object', 'mangler nature_profile');
assert(String(profile.type || '').length >= 12, 'naturtype er for kort');
assert(String(profile.title || '').length >= 12, 'naturtittel er for kort');
assert(String(profile.summary || '').length >= 240, 'natursammendrag er for kort');
assert(Array.isArray(profile.themes), 'themes må være en liste');
assert(profile.themes.length >= 5, 'trenger minst fem naturtemaer');
assert.strictEqual(new Set(profile.themes).size, profile.themes.length, 'dupliserte naturtemaer');
assert(Array.isArray(profile.nearby_place_ids), 'nearby_place_ids må være en liste');
assert.strictEqual(profile.nearby_place_ids.length, 3, 'skal ha tre nærnaturkoblinger');
assert.strictEqual(new Set(profile.nearby_place_ids).size, 3, 'dupliserte nærnaturkoblinger');
for (const nearbyId of profile.nearby_place_ids) {
  assert.notStrictEqual(nearbyId, place.id, 'stedet kan ikke koble til seg selv');
  assert(activePlaceIds.has(nearbyId), `ukjent nærnatursted ${nearbyId}`);
}

assert(!Object.prototype.hasOwnProperty.call(place, 'flora'), 'flora skal ligge i naturkart, ikke inline');
assert(!Object.prototype.hasOwnProperty.call(place, 'fauna'), 'fauna skal ligge i naturkart, ikke inline');

const mapFiles = [
  'data/natur/nature_place_map.json',
  'data/natur/nature_bird_place_map.json',
  'data/natur/nature_oslo_expansion_place_map.json',
  'data/natur/nature_routes_place_map.json',
  'data/natur/nature_etne_place_map.json'
];

const flora = new Set();
const fauna = new Set();
for (const file of mapFiles) {
  const raw = readJson(file);
  const entry = (raw.places || raw)[place.id];
  if (!entry) continue;
  for (const id of Array.isArray(entry.flora) ? entry.flora : []) flora.add(id);
  for (const id of Array.isArray(entry.fauna) ? entry.fauna : []) fauna.add(id);
}

assert.deepStrictEqual([...flora].sort(), [
  'emne_flora_tiriltunge',
  'emne_ved_hestekastanje'
].sort(), 'det dokumenterte plantekartet for utløpet er endret');

assert.deepStrictEqual([...fauna].sort(), [
  'emne_fauna_blaameis',
  'emne_fauna_fiskemaake',
  'emne_fauna_graamaake',
  'emne_fauna_graaspurv',
  'emne_fauna_graagas',
  'emne_fauna_kjottmeis',
  'emne_fauna_kraake',
  'emne_fauna_ringdue',
  'emne_fauna_sildemaake',
  'emne_fauna_skjaere',
  'emne_fauna_svarttrost'
].sort(), 'det dokumenterte fuglekartet for utløpet er endret');

console.log('Akerselva outlet Nature profile batch 13 OK');
