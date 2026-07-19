const assert = require('assert');
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '..');
const readJson = relativePath => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));

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

const bjorvika = readJson('data/places/by/oslo/places/bjorvika.json');
assert.strictEqual(bjorvika.id, 'bjorvika');
assert(activePlaceIds.has('bjorvika'), 'bjorvika mangler i aktiv places_index');
assert(bjorvika.nature_profile && typeof bjorvika.nature_profile === 'object', 'Bjørvika skal beholde nature_profile');
assert(String(bjorvika.nature_profile.summary || '').length >= 180, 'Bjørvika har for kort natursammendrag');
assert(Array.isArray(bjorvika.nature_profile.themes) && bjorvika.nature_profile.themes.length >= 5, 'Bjørvika trenger minst fem naturtemaer');
assert(Array.isArray(bjorvika.nature_profile.nearby_place_ids) && bjorvika.nature_profile.nearby_place_ids.length >= 3, 'Bjørvika mangler nærnatur-koblinger');
assert(mergedNatureMap.bjorvika && mergedNatureMap.bjorvika.flora.length + mergedNatureMap.bjorvika.fauna.length > 0, 'Bjørvika mangler kartlagte arter');

const excluded = [
  ['torggata', 'data/places/by/oslo/places/torggata.json'],
  ['karl_johan', 'data/places/by/oslo/places/karl_johan.json'],
  ['radhusplassen', 'data/places/by/oslo/places/radhusplassen.json'],
  ['oslo_s', 'data/places/by/oslo/places/oslo_s.json'],
  ['jernbanetorget', 'data/places/by/oslo/places/jernbanetorget.json']
];

for (const [placeId, file] of excluded) {
  const place = readJson(file);
  assert.strictEqual(place.id, placeId, `${file} har feil place-id`);
  assert(!place.nature_profile, `${placeId} skal ikke ha nature_profile`);
  assert(Array.isArray(place.rounds) && place.rounds.length === 9, `${placeId} skal ha nøyaktig ni kuraterte rundinger`);
  assert(!place.rounds.includes('nature'), `${placeId} skal ikke ha Natur-runding`);
  assert(place.rounds.includes('tasks'), `${placeId} skal bruke Oppgaver i stedet for Natur`);
  assert(Array.isArray(place.tasks_profile?.tasks) && place.tasks_profile.tasks.length >= 3, `${placeId} skal ha konkrete stedsoppgaver`);
}

console.log('Oslo Nature round batch 3 eligibility OK');
