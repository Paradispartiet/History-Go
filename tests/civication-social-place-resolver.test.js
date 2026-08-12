#!/usr/bin/env node
// Ende-til-ende-test av den datadrevne broen mellom ekte brand-/place-data og
// Civications sosiale steder. Alle place-kilder lastes fra canonical
// data/places/manifest.json; gamle monolittiske place-filer er ikke gyldige.

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const readJSON = (rel) => JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));

function placesFromFileData(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data && data.places)) return data.places;
  if (data && typeof data === "object" && typeof data.id === "string") return [data];
  return [];
}

function loadManifestPlaces(prefix) {
  const manifest = readJSON("data/places/manifest.json");
  const seen = new Set();
  const out = [];
  for (const rel of manifest.files || []) {
    const sourcePath = String(rel || "");
    if (!sourcePath.startsWith(prefix) || !sourcePath.endsWith(".json")) continue;
    const abs = path.join(repoRoot, "data", sourcePath);
    if (!fs.existsSync(abs)) continue;
    let payload;
    try { payload = JSON.parse(fs.readFileSync(abs, "utf8")); } catch { continue; }
    for (const place of placesFromFileData(payload)) {
      const id = String(place && place.id || "");
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(place);
    }
  }
  return out;
}

const sentMails = [];
const sandboxWindow = {
  addEventListener() {},
  CustomEvent: function (type, init) { this.type = type; this.detail = init && init.detail; },
  dispatchEvent() { return true; },
  CivicationMailEngine: {
    sendMail(input) {
      const event = (input && input.event) || input;
      sentMails.push(event);
      return { ok: true, mail: { id: event && event.id, event } };
    }
  }
};

global.window = sandboxWindow;
global.document = {
  readyState: "complete",
  baseURI: "http://localhost/",
  getElementById: () => null,
  querySelector: () => null,
  addEventListener: () => {},
  createElement: () => ({ className: "", setAttribute() {}, appendChild() {}, querySelector: () => null })
};
global.requestAnimationFrame = () => 0;
global.fetch = () => Promise.reject(new Error("fetch not available in test"));

function loadScript(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, rel), "utf8"), { filename: rel });
}

loadScript("js/Civication/systems/civicationEventChannels.js");
loadScript("js/Civication/systems/civicationFriendsEngine.js");
loadScript("js/Civication/systems/civicationRelationshipEngine.js");
loadScript("js/Civication/systems/civicationFriendMessages.js");
loadScript("js/Civication/systems/CivicationSocialConversationEngine.js");
loadScript("js/Civication/systems/CivicationSocialPlaceResolver.js");

const channels = sandboxWindow.CivicationEventChannels;
const eng = sandboxWindow.CivicationFriendsEngine;
const bridge = sandboxWindow.CivicationFriendMessages;
const convo = sandboxWindow.CivicationSocialConversationEngine;
const resolver = sandboxWindow.CivicationSocialPlaceResolver;
for (const [name, api] of Object.entries({ channels, eng, bridge, convo, resolver })) {
  assert.ok(api, `${name} skal være lastet`);
}

const brandMaster = readJSON("data/brands/brands_master.json");
const brandByPlace = readJSON("data/brands/brands_by_place.json");
const placesBy = loadManifestPlaces("places/by/oslo/");
const placesSport = loadManifestPlaces("places/sport/europa/norway/oslo_sport/");
const placesPlaygrounds = loadManifestPlaces("places/sport/europa/norway/places_oslo_lekeplasser_trening/");
const allPlaces = [].concat(placesBy, placesSport, placesPlaygrounds);
const baseOpts = { brandMaster, brandByPlace, places: placesBy };
const placeOpts = { brandMaster, brandByPlace, places: allPlaces };

assert.ok(placesBy.length >= 90, `forventet minst 90 canonical By-steder, fikk ${placesBy.length}`);
assert.ok(placesSport.length > 0, "manifest-loaderen mangler splittede Oslo-sportsteder");
assert.ok(placesPlaygrounds.length > 0, "manifest-loaderen mangler splittede lekeplass-/treningssteder");
assert.ok(placesBy.some((p) => p.id === "st_hanshaugen_park"), "manifest-loaderen mangler St. Hanshaugen park");

let failures = 0;
function check(name, fn) {
  sentMails.length = 0;
  try { fn(); console.log("  ok  -", name); }
  catch (error) { failures += 1; console.error("FAIL  -", name); console.error("       ", error && error.message); }
}
const pairs = (list) => list.map((m) => m.sourcePlaceId + "->" + (m.brandId || "(place)")).sort();

console.log("Civication social-place resolver – canonical splittede place-kilder");

check("brandklassifisering dekker sentrale sosiale stedstyper", () => {
  const t = (id) => resolver.getSocialPlaceTypeForBrand(resolver.getBrandById(id, baseOpts));
  assert.strictEqual(t("java_kaffebar"), "coffee");
  assert.strictEqual(t("fuglen"), "coffee");
  assert.strictEqual(t("tronsmo_bokhandel"), "book_library");
  assert.strictEqual(t("mono"), "culture");
  assert.strictEqual(t("grand_cafe"), "hospitality_food");
  assert.strictEqual(t("retro_lykke"), "retail_social");
  for (const id of ["dior", "gucci", "rolex", "haavind", "wiersholm", "snohetta"]) {
    assert.strictEqual(t(id), null, `${id} skal ikke være sosialt brand`);
  }
});

check("coffee-beholdningen har de syv etablerte ekte stedskoblingene", () => {
  assert.deepStrictEqual(pairs(resolver.getCoffeeSocialPlaces(baseOpts)), [
    "bjorvika->talormade",
    "grunerlokka_helgesens_tm->supreme_roastworks",
    "grunerlokka_helgesens_tm->tim_wendelboe",
    "karl_johan->stockfleths",
    "majorstuen_tbanestasjon->kaffebrenneriet",
    "st_hanshaugen_park->java_kaffebar",
    "universitetsplassen->fuglen"
  ]);
});

check("brand-place henter metadata fra canonical split place", () => {
  const sp = resolver.getSocialPlaceByLocationId("brand_place:st_hanshaugen_park:java_kaffebar", baseOpts);
  assert.ok(sp);
  assert.strictEqual(sp.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(sp.brandId, "java_kaffebar");
  assert.strictEqual(sp.placeLabel, "St. Hanshaugen park");
  assert.strictEqual(sp.placeFound, true);
  assert.strictEqual(sp.lat, 59.9273);
  assert.strictEqual(sp.lon, 10.7414);
});

check("brandbaserte typer bruker ekte placeId-er", () => {
  const expected = {
    culture: ["youngstorget->mono", "olaf_ryes_plass->parkteatret", "operahuset->den_norske_opera", "bla->bla"],
    book_library: ["universitetsplassen->tronsmo_bokhandel", "karl_johan->tanum_karl_johan", "deichman_bjorvika->(place)"],
    hospitality_food: ["karl_johan->grand_cafe", "christiania_torv->statholdergaarden", "bjorvika->maaemo"],
    retail_social: ["markveien->retro_lykke", "grensen_kjopesenter->outland", "karl_johan->norway_designs"]
  };
  for (const [type, wanted] of Object.entries(expected)) {
    const found = pairs(resolver.getSocialPlacesByType(type, placeOpts));
    for (const item of wanted) assert.ok(found.includes(item), `${type} mangler ${item}`);
  }
});

check("place-only parker, byvandring og sport kommer fra splittede canonical kilder", () => {
  const parkIds = resolver.getSocialPlacesByType("park_public_space", placeOpts).map((m) => m.sourcePlaceId);
  for (const id of ["birkelunden", "botsparken", "slottsparken", "st_hanshaugen_park", "stensparken", "vigelandsparken"]) {
    assert.ok(parkIds.includes(id), `mangler park ${id}`);
  }
  const walkIds = resolver.getSocialPlacesByType("city_walk", placeOpts).map((m) => m.sourcePlaceId);
  for (const id of ["karl_johan", "torggata", "universitetsplassen", "christiania_torv", "bankplassen"]) {
    assert.ok(walkIds.includes(id), `mangler byrom ${id}`);
  }
  assert.ok(!walkIds.includes("ring_3"));
  const sportIds = resolver.getSocialPlacesByType("sport_football", placeOpts).map((m) => m.sourcePlaceId);
  for (const id of ["bislett_stadion", "ullevaal_stadion", "intility_arena", "frogner_stadion", "daelenenga_idrettspark"]) {
    assert.ok(sportIds.includes(id), `mangler idrettssted ${id}`);
  }
  assert.ok(!sportIds.some((id) => id.startsWith("lekeplass_") || id.startsWith("treningssted_")));
});

check("samlet resolver dedupliserer stabile locationId-er", () => {
  const all = resolver.resolveAllCivicationSocialPlaces(placeOpts);
  const ids = all.map((m) => m.locationId);
  assert.strictEqual(ids.length, new Set(ids).size, "ingen duplikate social locationId");
  assert.ok(ids.includes("brand_place:st_hanshaugen_park:java_kaffebar"));
  assert.ok(ids.includes("place:slottsparken"));
});

check("alle genererte steder finnes i canonical source-data", () => {
  const sourceIds = new Set(allPlaces.map((p) => String(p.id)));
  for (const item of resolver.resolveCivicationSocialPlacesFromBrands(baseOpts)) {
    assert.ok(sourceIds.has(item.sourcePlaceId), `ukjent brand-place ${item.sourcePlaceId}`);
    assert.ok((brandByPlace[item.sourcePlaceId] || []).map(String).includes(item.brandId),
      `brand ${item.brandId} er ikke koblet til ${item.sourcePlaceId}`);
  }
  for (const item of resolver.resolveCivicationSocialPlacesFromPlaces(placeOpts)) {
    assert.ok(sourceIds.has(item.sourcePlaceId), `ukjent place-only ${item.sourcePlaceId}`);
    assert.strictEqual(item.brandId, null);
  }
});

const LID = "brand_place:st_hanshaugen_park:java_kaffebar";
check("samme fase + samme locationId gir møte og privat samtale", () => {
  const friends = [{ id: "p1", name: "Per En", role: "Barista" }];
  const snapshots = [{ friendId: "p1", snapshots: { leisure: {
    phase: "leisure", state: "at_cafe", locationId: LID, activity: "kaffe",
    visibleOnMap: true, socialAvailability: "open_to_contact"
  } } }];
  const locations = resolver.mergeSocialPlacesIntoLocations([], resolver.getCoffeeSocialPlaces(baseOpts));
  const encounter = eng.getSocialEncountersForLocation("leisure", LID, { friends, snapshots, locations })[0];
  assert.ok(encounter);
  assert.strictEqual(encounter.sourcePlaceId, "st_hanshaugen_park");
  const bridged = bridge.handleCivicationFriendMessageAction({ ok: true, action: "approach", model: encounter });
  assert.strictEqual(bridged.channel, "private");
  assert.strictEqual(channels.isJobMail(sentMails[0]), false);
  assert.strictEqual(channels.isPrivateMessage(sentMails[0]), true);
  convo.clearConversationsForTesting();
});

check("UI-header viser ekte brand, type, sted og fase", () => {
  const sp = resolver.getSocialPlaceByLocationId(LID, baseOpts);
  const html = resolver.buildSocialPlaceHeaderHtml(sp, "leisure");
  assert.ok(html.includes("Java Kaffebar"));
  assert.ok(html.includes("Kaffe"));
  assert.ok(html.includes("St. Hanshaugen park"));
  assert.ok(html.includes("Fritidsfase"));
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");