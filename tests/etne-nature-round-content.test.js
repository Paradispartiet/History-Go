const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

const targetPaths = [
  'data/places/natur/vestland/langfoss_etne.json',
  'data/places/natur/vestland/akrafjorden.json',
  'data/places/natur/vestland/jettegrytene_rullestad.json',
  'data/places/natur/vestland/etneelva.json',
  'data/places/natur/vestland/stordalsvatnet_etne.json',
  'data/places/natur/vestland/langebudalen_naturreservat.json'
];

const manifest = readJson('data/places/manifest.json');
const allPlaceIds = new Set();

for (const manifestPath of manifest.files) {
  const rows = readJson(`data/${manifestPath}`);
  const places = Array.isArray(rows) ? rows : [rows];
  for (const place of places) {
    if (place && place.id) allPlaceIds.add(String(place.id));
  }
}

for (const relativePath of targetPaths) {
  const rows = readJson(relativePath);
  assert(Array.isArray(rows) && rows.length === 1, `${relativePath} skal inneholde nøyaktig ett sted`);

  const place = rows[0];
  const profile = place.nature_profile;
  assert(profile && typeof profile === 'object', `${place.id} mangler nature_profile`);
  assert(String(profile.type || '').trim(), `${place.id} mangler naturtype`);
  assert(String(profile.title || '').trim(), `${place.id} mangler naturtittel`);
  assert(String(profile.summary || '').trim().length >= 180, `${place.id} trenger et stedsspesifikt natursammendrag`);
  assert(!/ikke fylt ut ennå/i.test(profile.summary), `${place.id} bruker fortsatt fallbacktekst`);

  assert(Array.isArray(profile.themes) && profile.themes.length >= 5, `${place.id} skal ha minst fem naturtemaer`);
  assert.strictEqual(new Set(profile.themes).size, profile.themes.length, `${place.id} har dupliserte naturtemaer`);

  assert(Array.isArray(profile.nearby_place_ids) && profile.nearby_place_ids.length >= 2, `${place.id} skal ha nærnatur-koblinger`);
  assert.strictEqual(new Set(profile.nearby_place_ids).size, profile.nearby_place_ids.length, `${place.id} har dupliserte nærnatur-koblinger`);
  for (const nearbyId of profile.nearby_place_ids) {
    assert(allPlaceIds.has(nearbyId), `${place.id} peker til ukjent nærnatur-sted ${nearbyId}`);
  }
}

console.log('Etne nature round content OK');
