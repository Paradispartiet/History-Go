const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const groupDir = 'data/places/natur/oslo/places_oslo_natur_salamanderdammer';
const groupPlaces = [
  ['bygdoy_kongsgard_salamanderdam', `${groupDir}/bygdoy_kongsgard_salamanderdam.json`],
  ['bantjern_salamanderlokalitet', `${groupDir}/bantjern_salamanderlokalitet.json`],
  ['tjernsmyr_salamanderlokalitet', `${groupDir}/tjernsmyr_salamanderlokalitet.json`],
  ['blindern_forskningsparken_salamanderdam', `${groupDir}/blindern_forskningsparken_salamanderdam.json`]
];

const activePlaceIds = new Set(
  readJson('data/places/places_index.json')
    .map(place => String(place.id || '').trim())
    .filter(Boolean)
);

for (const [expectedId, file] of groupPlaces) {
  const place = readJson(file);
  assert.strictEqual(place.id, expectedId, `${file}: feil place-id`);
  assert(activePlaceIds.has(place.id), `${place.id}: mangler i aktiv places_index`);
  assert.strictEqual(place.category, 'natur', `${place.id}: skal være natursted`);
  assert.strictEqual(place.routeId, 'oslo_salamanderdammer', `${place.id}: feil rute`);

  assert(String(place.sourceHint || '').length >= 100, `${place.id}: kildegrunnlaget er for kort`);
  assert(/^https:\/\//.test(String(place.links?.website || '')), `${place.id}: mangler kilde-URL`);
  assert(Array.isArray(place.tags) && place.tags.includes('salamander'), `${place.id}: mangler salamander-tag`);
  assert(!Object.hasOwn(place, 'flora'), `${place.id}: skal ikke få inline flora uten artskart`);
  assert(!Object.hasOwn(place, 'fauna'), `${place.id}: skal ikke få inline fauna uten artskart`);

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

const bygdoy = readJson(`${groupDir}/bygdoy_kongsgard_salamanderdam.json`);
assert(/storsalamander/.test(bygdoy.popupDesc), 'Bygdøy: dokumentert storsalamander må beholdes');
assert(/småsalamander/.test(bygdoy.popupDesc), 'Bygdøy: dokumentert småsalamander må beholdes');

const bantjern = readJson(`${groupDir}/bantjern_salamanderlokalitet.json`);
assert(/padde/.test(bantjern.sourceHint), 'Båntjern: dokumentert paddeopplysning må beholdes');
assert(/privat/.test(bantjern.coordNote), 'Båntjern: privatlokalitetsvernet må beholdes');

const tjernsmyr = readJson(`${groupDir}/tjernsmyr_salamanderlokalitet.json`);
assert(/E18/.test(tjernsmyr.popupDesc), 'Tjernsmyr: samferdselskonteksten må beholdes');
assert(/storsalamander/.test(tjernsmyr.popupDesc), 'Tjernsmyr: dokumentert storsalamander må beholdes');

const blindern = readJson(`${groupDir}/blindern_forskningsparken_salamanderdam.json`);
assert(/Oslo kommune/.test(blindern.popupDesc), 'Blindern: kommunal kartlegging må beholdes');
assert(/kartlegg/.test(blindern.nature_profile.summary), 'Blindern: profilen må handle om kartlegging');

console.log('Oslo salamander pond Nature profiles batch 10 OK');
