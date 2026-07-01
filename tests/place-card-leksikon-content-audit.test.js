const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const json = (p) => JSON.parse(read(p));
const norm = (v) => String(v ?? '').trim();
const rows = (data) => Array.isArray(data) ? data : (Array.isArray(data?.places) ? data.places : (Array.isArray(data?.items) ? data.items : []));

const appJs = read('js/app.js');
const loaderJs = read('js/leksikon/leksikon_loader.js');
const placeCardJs = read('js/ui/place-card.js');

assert(loaderJs.includes('window.HGLeksikon ='), 'HGLeksikon skal eksponeres');
assert(/openPlace\s*,/.test(loaderJs), 'HGLeksikon.openPlace skal eksponeres');
assert(/renderPlaceList\s*,/.test(loaderJs), 'HGLeksikon.renderPlaceList skal eksponeres');
assert(loaderJs.includes('function renderOverview'), 'Leksikon skal kunne rendere hub/overview');
for (const needle of ['content.stories.length', 'content.lesesporItems.length', 'content.wonderkammerEntries.length', 'groups.objects.length', 'groups.sprak.length', 'groups.links.length']) {
  assert(loaderJs.includes(needle), `Hub uten hovedartikkel skal vise ${needle}`);
}

assert(loaderJs.includes('data-wonderkammer-entry'), 'renderWonderkammerSection skal lage data-wonderkammer-entry-knapper');
assert(loaderJs.includes('closest("[data-wonderkammer-entry]")'), 'Delegert click-handler for data-wonderkammer-entry skal finnes');
assert(appJs.includes('loadScriptOnce("js/ui/wonderkammer-entry.js")'), 'app-entry skal laste js/ui/wonderkammer-entry.js');
assert(appJs.indexOf('js/ui/popup-utils.js') < appJs.indexOf('js/ui/wonderkammer-entry.js'), 'wonderkammer-entry skal lastes etter popup-utils');
assert(appJs.indexOf('js/ui/wonderkammer-entry.js') < appJs.indexOf('js/leksikon/leksikon_loader.js'), 'wonderkammer-entry skal lastes før leksikon_loader');
assert(loaderJs.includes('Wonderkammer-handler ikke lastet for ${id}'), 'Fallback skal vise tydelig Wonderkammer-feil med entry id');
assert(loaderJs.includes('hg:wonderkammer-ready'), 'Leksikon skal håndtere at Wonderkammer-data kommer fra background load');
assert(loaderJs.includes('refreshPlace'), 'HGLeksikon.refreshPlace skal finnes for bakgrunnsrefresh');
assert(!/id:\s*["']wonderkammer["']/.test(placeCardJs), 'Wonderkammer skal ikke være egen canonical PlaceCard-runding');
assert(/id:\s*["']leksikon["'][\s\S]*aliases:\s*\[[^\]]*["']wonderkammer["']/.test(placeCardJs), 'Wonderkammer skal fortsatt rutes under Leksikon');
assert(/Legacy[\s\S]{0,140}pcWonderkammerIcon|Legacy[\s\S]{0,140}Wonderkammer/.test(placeCardJs), 'Legacy pcWonderkammer-hook skal være dokumentert/isolert');
assert(/Legacy[\s\S]{0,140}pcObservationsIcon|Legacy[\s\S]{0,140}observations/.test(placeCardJs), 'Legacy pcObservations-hook skal være dokumentert/isolert');
assert(placeCardJs.includes('window.HGLeksikon.openPlace(currentPlaceId)'), 'Leksikon-rundingen skal åpne HGLeksikon runtime-hub');
assert(placeCardJs.includes('window.HGLeksikon.renderPlaceList(placeId, 0)'), 'PlaceCard skal bruke runtime Leksikon-list når HGLeksikon finnes');

const manifest = json('data/leksikon/manifest.json');
const leksikonByPlace = new Map();
for (const file of manifest.files || []) {
  for (const row of rows(json(file))) {
    const id = norm(row.place_id || row.place || row.id);
    if (!id) continue;
    if (!leksikonByPlace.has(id)) leksikonByPlace.set(id, []);
    leksikonByPlace.get(id).push(row);
  }
}

const places = rows(json('data/places/places_index.json')).filter((p) => norm(p.id) && p.active !== false && p.hidden !== true);
const profileMatch = placeCardJs.match(/const CATEGORY_ROUND_PROFILES = Object\.freeze\((\{[\s\S]*?\})\);/);
assert(profileMatch, 'CATEGORY_ROUND_PROFILES skal kunne leses statisk');
const profiles = Function(`return (${profileMatch[1]});`)();
const defaultProfile = profiles.by || [];
const getsLeksikonRound = (place) => (profiles[norm(place.category)] || defaultProfile).includes('leksikon') || (Array.isArray(place.rounds) && place.rounds.includes('leksikon')) || (Array.isArray(place.rundinger) && place.rundinger.includes('leksikon'));

const wkManifest = json('data/wonderkammer/index.json');
const wkByPlace = new Map();
for (const file of wkManifest.files || []) {
  if (!fs.existsSync(path.join(root, file))) continue;
  for (const row of rows(json(file))) {
    const id = norm(row.place_id || row.place);
    if (!id) continue;
    const count = Array.isArray(row.chambers) ? row.chambers.length : 0;
    wkByPlace.set(id, (wkByPlace.get(id) || 0) + count);
  }
}

const knownContentCount = (place) => (leksikonByPlace.get(place.id)?.length || 0) + (wkByPlace.get(place.id) || 0);
const activeWithArticle = places.filter((p) => leksikonByPlace.has(p.id)).length;
const activeWithoutArticle = places.length - activeWithArticle;
const roundNoKnown = places.filter((p) => getsLeksikonRound(p) && knownContentCount(p) === 0).length;
const wkPlaces = [...wkByPlace.keys()];
const wkMissingRound = wkPlaces.filter((id) => {
  const place = places.find((p) => p.id === id);
  return place && !getsLeksikonRound(place);
});
assert.strictEqual(wkMissingRound.length, 0, `Steder med Wonderkammer-data skal ha Leksikon-runding: ${wkMissingRound.slice(0, 20).join(', ')}`);
assert(/wonderkammerEntries\.length[\s\S]*\+ groups\.objects/.test(loaderJs), 'Wonderkammer-data skal telle med i Leksikon total');

console.log(JSON.stringify({
  activePlaces: places.length,
  placesWithLeksikonArticle: activeWithArticle,
  placesWithoutLeksikonArticle: activeWithoutArticle,
  leksikonRoundWithNoKnownLeksikonContent: roundNoKnown,
  placesWithWonderkammerData: wkPlaces.length,
  wonderkammerEntries: [...wkByPlace.values()].reduce((a, b) => a + b, 0)
}, null, 2));
console.log('PlaceCard Leksikon content audit OK');
