import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(file, 'utf8');
const readJson = file => JSON.parse(read(file));
const place = readJson('data/places/politikk/oslo/places_politikk/youngstorget.json');
const popupRuntime = read('js/ui/place-popup-v2.js');
const manifest = readJson('data/leksikon/manifest.json');

assert.ok(place.popupDesc.length > 1500, 'Youngstorget Om må beholde den substansielle fase-5-artikkelen');
assert.equal(place.spatial_profile.place_form, 'offentlig_torg');
assert.ok(place.spatial_profile.boundary_description.includes('Torggata'));
assert.equal(place.spatial_profile.area_m2, undefined, 'gameplay-radius må ikke restemples som fysisk areal');

assert.match(popupRuntime, /<h3>Om stedet<\/h3>/, 'popupen må rendre hovedartikkelen under Om stedet');
assert.match(popupRuntime, /function renderSpatialSection\(place, routeLength\)/, 'popupen må ha canonical spatialrenderer');
assert.match(popupRuntime, /\$\{renderSpatialSection\(place, routeLength\)\}/, 'spatialseksjonen må være koblet til popupflaten');
assert.doesNotMatch(popupRuntime, /function renderTemporalSection\(/, '7A skal ikke lage en parallell temporalrenderer i Om');

const ownedArticles = [];
for (const file of manifest.files || []) {
  if (!fs.existsSync(file)) continue;
  const value = readJson(file);
  const rows = Array.isArray(value) ? value : [value];
  for (const row of rows) {
    if (String(row?.place_id || row?.placeId || '') === 'youngstorget') ownedArticles.push({ file, row });
  }
}
assert.equal(ownedArticles.length, 0, 'ingen manifest-lastet Leksikonpost skal konkurrere med Youngstorgets godkjente popupDesc');

console.log('Youngstorget phase 7A about regression: PASS');
