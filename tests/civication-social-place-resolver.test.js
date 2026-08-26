#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const ROOT = path.join(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
function placesFrom(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.places)) return data.places;
  if (data && typeof data.id === 'string') return [data];
  return [];
}
function loadManifestPlaces(predicate) {
  const out = [], seen = new Set();
  for (const rel of readJson('data/places/manifest.json').files || []) {
    const sourcePath = String(rel || '');
    if (!sourcePath.endsWith('.json') || !predicate(sourcePath)) continue;
    const abs = path.join(ROOT, 'data', sourcePath);
    if (!fs.existsSync(abs)) continue;
    let payload;
    try { payload = JSON.parse(fs.readFileSync(abs, 'utf8')); } catch { continue; }
    for (const place of placesFrom(payload)) {
      if (!place?.id || seen.has(place.id)) continue;
      seen.add(place.id);
      out.push(place);
    }
  }
  return out;
}
const loadPrefix = (prefix) => loadManifestPlaces((rel) => rel.startsWith(prefix));
const loadAllCanonicalPlaces = () => loadManifestPlaces(() => true);

const sentMails = [];
const sandboxWindow = {
  addEventListener() {}, dispatchEvent() { return true; },
  CustomEvent: function(type, init) { this.type = type; this.detail = init?.detail; },
  CivicationMailEngine: { sendMail(input) {
    const event = input?.event || input;
    sentMails.push(event);
    return { ok: true, mail: { id: event?.id, event } };
  } }
};
global.window = sandboxWindow;
global.document = {
  readyState: 'complete', baseURI: 'http://localhost/', getElementById: () => null,
  querySelector: () => null, addEventListener: () => {},
  createElement: () => ({ className: '', setAttribute() {}, appendChild() {}, querySelector: () => null })
};
global.requestAnimationFrame = () => 0;
global.fetch = () => Promise.reject(new Error('fetch not available in test'));
for (const rel of [
  'js/Civication/systems/civicationEventChannels.js',
  'js/Civication/systems/civicationFriendsEngine.js',
  'js/Civication/systems/civicationRelationshipEngine.js',
  'js/Civication/systems/civicationFriendMessages.js',
  'js/Civication/systems/CivicationSocialConversationEngine.js',
  'js/Civication/systems/CivicationSocialPlaceResolver.js'
]) vm.runInThisContext(fs.readFileSync(path.join(ROOT, rel), 'utf8'), { filename: rel });

const { CivicationEventChannels: channels, CivicationFriendsEngine: friendsEngine,
  CivicationFriendMessages: bridge, CivicationSocialConversationEngine: conversation,
  CivicationSocialPlaceResolver: resolver } = sandboxWindow;
for (const api of [channels, friendsEngine, bridge, conversation, resolver]) assert.ok(api);

const brandMaster = readJson('data/brands/brands_master.json');
const brandByPlace = readJson('data/brands/brands_by_place.json');
const by = loadPrefix('places/by/oslo/');
const litteratur = loadPrefix('places/litteratur/oslo/');
const subkultur = loadPrefix('places/subkultur/oslo/');
const sport = loadPrefix('places/sport/europa/norway/oslo_sport/');
const playgrounds = loadPrefix('places/sport/europa/norway/places_oslo_lekeplasser_trening/');
const places = [].concat(by, litteratur, subkultur, sport, playgrounds);
const canonicalPlaces = loadAllCanonicalPlaces();
const canonicalSourceIds = new Set(canonicalPlaces.map((p) => String(p.id)));
const opts = { brandMaster, brandByPlace, places };

assert.ok(by.length >= 90, `forventet minst 90 By-steder, fikk ${by.length}`);
assert.ok(litteratur.some((p) => p.id === 'alexander_kiellands_plass'));
assert.ok(subkultur.some((p) => p.id === 'bla'));
assert.ok(sport.length && playgrounds.length);
assert.ok(canonicalSourceIds.has('ekebergparken'), 'hele canonical manifestet skal inneholde Ekebergparken');

const pairs = (list) => list.map((m) => `${m.sourcePlaceId}->${m.brandId || '(place)'}`).sort();
const type = (id) => resolver.getSocialPlaceTypeForBrand(resolver.getBrandById(id, opts));
assert.strictEqual(type('java_kaffebar'), 'coffee');
assert.strictEqual(type('tronsmo_bokhandel'), 'book_library');
assert.strictEqual(type('mono'), 'culture');
assert.strictEqual(type('grand_cafe'), 'hospitality_food');
assert.strictEqual(type('retro_lykke'), 'retail_social');
assert.strictEqual(type('dior'), null);

assert.deepStrictEqual(pairs(resolver.getCoffeeSocialPlaces(opts)), [
  'bjorvika->talormade',
  'grunerlokka_helgesens_tm->supreme_roastworks',
  'grunerlokka_helgesens_tm->tim_wendelboe',
  'karl_johan->stockfleths',
  'majorstuen_tbanestasjon->kaffebrenneriet',
  'st_hanshaugen_park->java_kaffebar',
  'universitetsplassen->fuglen'
]);

const java = resolver.getSocialPlaceByLocationId('brand_place:st_hanshaugen_park:java_kaffebar', opts);
assert.strictEqual(java.placeFound, true);
assert.strictEqual(java.placeLabel, 'St. Hanshaugen park');
assert.strictEqual(java.lat, 59.9273);
assert.strictEqual(java.lon, 10.7414);

for (const [kind, wanted] of Object.entries({
  culture: ['youngstorget->mono', 'bla->bla', 'olaf_ryes_plass->parkteatret'],
  book_library: ['universitetsplassen->tronsmo_bokhandel', 'deichman_bjorvika->(place)'],
  hospitality_food: ['karl_johan->grand_cafe', 'bjorvika->maaemo'],
  retail_social: ['markveien->retro_lykke', 'grensen_kjopesenter->outland']
})) {
  const found = pairs(resolver.getSocialPlacesByType(kind, opts));
  for (const item of wanted) assert.ok(found.includes(item), `${kind} mangler ${item}`);
}
assert.ok(
  pairs(resolver.getSocialPlacesByType('culture', opts)).includes('olaf_ryes_plass->parkteatret'),
  'Parkteatrets kildebelagte venue-identitet skal være Brand ved Olaf Ryes plass'
);

for (const item of resolver.resolveCivicationSocialPlacesFromBrands(opts)) {
  assert.ok(canonicalSourceIds.has(item.sourcePlaceId), `ukjent brand-place ${item.sourcePlaceId}`);
  assert.ok((brandByPlace[item.sourcePlaceId] || []).map(String).includes(item.brandId),
    `brand ${item.brandId} er ikke koblet til ${item.sourcePlaceId}`);
}
for (const item of resolver.resolveCivicationSocialPlacesFromPlaces(opts)) {
  assert.ok(canonicalSourceIds.has(item.sourcePlaceId), `ukjent place-only ${item.sourcePlaceId}`);
  assert.strictEqual(item.brandId, null);
}

const all = resolver.resolveAllCivicationSocialPlaces(opts);
const locationIds = all.map((m) => m.locationId);
assert.strictEqual(locationIds.length, new Set(locationIds).size, 'social locationId skal være unik');

const LID = 'brand_place:st_hanshaugen_park:java_kaffebar';
const friends = [{ id: 'p1', name: 'Per En', role: 'Barista' }];
const snapshots = [{ friendId: 'p1', snapshots: { leisure: {
  phase: 'leisure', state: 'at_cafe', locationId: LID, activity: 'kaffe',
  visibleOnMap: true, socialAvailability: 'open_to_contact'
} } }];
const locations = resolver.mergeSocialPlacesIntoLocations([], resolver.getCoffeeSocialPlaces(opts));
const encounter = friendsEngine.getSocialEncountersForLocation('leisure', LID, { friends, snapshots, locations })[0];
assert.ok(encounter);
const bridged = bridge.handleCivicationFriendMessageAction({ ok: true, action: 'approach', model: encounter });
assert.strictEqual(bridged.channel, 'private');
assert.strictEqual(channels.isJobMail(sentMails[0]), false);
assert.strictEqual(channels.isPrivateMessage(sentMails[0]), true);
conversation.clearConversationsForTesting();

const html = resolver.buildSocialPlaceHeaderHtml(java, 'leisure');
for (const text of ['Java Kaffebar', 'Kaffe', 'St. Hanshaugen park', 'Fritidsfase']) assert.ok(html.includes(text));
console.log(`civication social-place resolver ok (${places.length} resolver-kilder, ${canonicalPlaces.length} canonical steder validert)`);
