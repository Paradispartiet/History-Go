#!/usr/bin/env node
// tests/civication-social-place-resolver.test.js
//
// Ende-til-ende-test av den datadrevne broen mellom ekte brand-/place-data og
// Civications sosiale steder. By-stedene lastes fra canonical
// data/places/manifest.json; den gamle places_by.json-monolitten er ikke lenger
// en gyldig kilde.

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

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
    try {
      payload = JSON.parse(fs.readFileSync(abs, "utf8"));
    } catch {
      continue;
    }
    for (const place of placesFromFileData(payload)) {
      if (!place || !place.id || seen.has(String(place.id))) continue;
      seen.add(String(place.id));
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
  const code = fs.readFileSync(path.join(repoRoot, rel), "utf8");
  vm.runInThisContext(code, { filename: rel });
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
const placesSport = readJSON("data/places/sport/europa/norway/oslo_sport.json");
const placesPlaygrounds = readJSON("data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json");
const allPlaces = [].concat(placesBy, placesSport, placesPlaygrounds);
const baseOpts = { brandMaster, brandByPlace, places: placesBy };
const placeOpts = { brandMaster, brandByPlace, places: allPlaces };

assert.ok(placesBy.length > 100, `forventet 100+ canonical By-steder, fikk ${placesBy.length}`);
assert.ok(placesBy.some((p) => p.id === "st_hanshaugen_park"), "manifest-loaderen mangler St. Hanshaugen park");

let failures = 0;
function check(name, fn) {
  sentMails.length = 0;
  try {
    fn();
    console.log("  ok  -", name);
  } catch (error) {
    failures += 1;
    console.error("FAIL  -", name);
    console.error("       ", error && error.message);
  }
}
function pairs(list) {
  return list.map((m) => m.sourcePlaceId + "->" + (m.brandId || "(place)")).sort();
}

console.log("Civication social-place resolver – canonical splittede place-kilder");

check("brandklassifisering dekker kaffe, bøker, kultur, servering og sosial retail", () => {
  const t = (id) => resolver.getSocialPlaceTypeForBrand(resolver.getBrandById(id, baseOpts));
  assert.strictEqual(t("java_kaffebar"), "coffee");
  assert.strictEqual(t("fuglen"), "coffee");
  assert.strictEqual(t("tronsmo_bokhandel"), "book_library");
  assert.strictEqual(t("mono"), "culture");
  assert.strictEqual(t("den_norske_opera"), "culture");
  assert.strictEqual(t("grand_cafe"), "hospitality_food");
  assert.strictEqual(t("maaemo"), "hospitality_food");
  assert.strictEqual(t("retro_lykke"), "retail_social");
  assert.strictEqual(t("yme_universe"), "retail_social");
  for (const id of ["dior", "gucci", "rolex", "thune_jewelry", "haavind", "wiersholm", "snohetta"]) {
    assert.strictEqual(t(id), null, `${id} skal ikke være sosialt brand`);
  }
});

check("coffee fra PR #1200 består med de samme syv ekte stedskoblingene", () => {
  const coffee = resolver.getCoffeeSocialPlaces(baseOpts);
  assert.deepStrictEqual(pairs(coffee), [
    "bjorvika->talormade",
    "grunerlokka_helgesens_tm->supreme_roastworks",
    "grunerlokka_helgesens_tm->tim_wendelboe",
    "karl_johan->stockfleths",
    "majorstuen_tbanestasjon->kaffebrenneriet",
    "st_hanshaugen_park->java_kaffebar",
    "universitetsplassen->fuglen"
  ]);
  assert.ok(coffee.every((m) => m.socialPlaceType === "coffee" && m.type === "cafe"));
});

check("brand-place henter metadata fra canonical split place", () => {
  const sp = resolver.getSocialPlaceByLocationId("brand_place:st_hanshaugen_park:java_kaffebar", baseOpts);
  assert.ok(sp);
  assert.strictEqual(sp.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(sp.brandId, "java_kaffebar");
  assert.strictEqual(sp.label, "Java Kaffebar");
  assert.strictEqual(sp.placeLabel, "St. Hanshaugen park");
  assert.strictEqual(sp.placeFound, true);
  assert.strictEqual(sp.lat, 59.9273);
  assert.strictEqual(sp.lon, 10.7414);
  assert.strictEqual(sp.category, "by");
  assert.deepStrictEqual(sp.conversationTone, ["rolig", "uformell", "åpen"]);
});

check("culture/book/servering/retail bruker ekte placeId-er", () => {
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

check("place-only parker, byvandring og sport kommer fra ekte place-kilder", () => {
  const parks = resolver.getSocialPlacesByType("park_public_space", placeOpts);
  const parkIds = parks.map((m) => m.sourcePlaceId);
  for (const id of ["birkelunden", "botsparken", "slottsparken", "st_hanshaugen_park", "stensparken", "vigelandsparken"]) {
    assert.ok(parkIds.includes(id), `mangler park ${id}`);
  }
  assert.ok(parks.every((m) => m.brandId === null && m.locationId === "place:" + m.sourcePlaceId));

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

check("locationId-er er stabile og samlet resolver dedupliserer", () => {
  const brand = resolver.buildSocialPlaceFromBrandPlace(
    "st_hanshaugen_park",
    { id: "java_kaffebar", name: "Java Kaffebar", brand_type: "coffee_brand", sector: "coffee" },
    null
  );
  assert.strictEqual(brand.locationId, "brand_place:st_hanshaugen_park:java_kaffebar");
  const parkSource = placesBy.find((p) => p.id === "st_hanshaugen_park");
  const park = resolver.buildSocialPlaceFromPlace(parkSource);
  assert.strictEqual(park.locationId, "place:st_hanshaugen_park");

  const all = resolver.resolveAllCivicationSocialPlaces(placeOpts);
  const ids = all.map((m) => m.locationId);
  assert.strictEqual(ids.length, new Set(ids).size, "ingen duplikate social locationId");
  assert.ok(ids.includes(brand.locationId));
  assert.ok(ids.includes(park.locationId));
});

check("brand/place-integritet: alle genererte steder finnes i source-data", () => {
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

check("typekonfig og fasefiltrering er stabile", () => {
  assert.deepStrictEqual(resolver.getSocialPhaseAffinityForType("coffee"), ["morning", "leisure", "evening"]);
  assert.deepStrictEqual(resolver.getSocialToneForType("park_public_space"), ["åpen", "tilfeldig", "rolig"]);
  assert.deepStrictEqual(resolver.getSocialActivitiesForType("book_library"), ["read", "browse", "meet_people"]);
  assert.strictEqual(resolver.getSocialPlaceTypeLabel("coffee"), "kaffe");
  assert.strictEqual(resolver.getSocialPlaceTypeLabel("park_public_space"), "park / byrom");
  const morning = resolver.getSocialPlacesForPhase("morning", placeOpts);
  assert.ok(morning.some((m) => m.socialPlaceType === "coffee"));
  assert.ok(!morning.some((m) => m.socialPlaceType === "park_public_space"));
});

const LID = "brand_place:st_hanshaugen_park:java_kaffebar";
const PARK_LID = "place:slottsparken";

check("samme fase + samme locationId gir møte; annet sted gjør ikke", () => {
  const LID2 = "brand_place:universitetsplassen:fuglen";
  const friends = [
    { id: "p1", name: "Per En", role: "Barista" },
    { id: "p2", name: "Pia To", role: "Barista" }
  ];
  const snapshots = [
    { friendId: "p1", snapshots: { leisure: { phase: "leisure", state: "at_cafe", locationId: LID, activity: "kaffe", visibleOnMap: true, socialAvailability: "open_to_contact" } } },
    { friendId: "p2", snapshots: { leisure: { phase: "leisure", state: "at_cafe", locationId: LID2, activity: "kaffe", visibleOnMap: true, socialAvailability: "open_to_contact" } } }
  ];
  const locations = resolver.mergeSocialPlacesIntoLocations([], resolver.getCoffeeSocialPlaces(baseOpts));
  const encounters = eng.getSocialEncountersForLocation("leisure", LID, { friends, snapshots, locations });
  assert.deepStrictEqual(encounters.map((e) => e.friendId), ["p1"]);
  assert.strictEqual(encounters[0].sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(encounters[0].brandId, "java_kaffebar");
  assert.strictEqual(encounters[0].socialPlaceType, "coffee");
  assert.strictEqual(eng.getSocialEncountersForLocation("morning", LID, { friends, snapshots, locations }).length, 0);
});

check("place-only park kan være sosial møtearena", () => {
  const friends = [{ id: "f_park_01", name: "Liv Berg", role: "Student" }];
  const snapshots = [{ friendId: "f_park_01", snapshots: { evening: {
    phase: "evening", state: "at_park", locationId: PARK_LID, activity: "setter seg i parken",
    mood: "rolig", visibleOnMap: true, socialAvailability: "open_to_contact"
  } } }];
  const locations = resolver.mergeSocialPlacesIntoLocations([], resolver.getSocialPlacesByType("park_public_space", placeOpts));
  const enc = eng.getSocialEncountersForLocation("evening", PARK_LID, { friends, snapshots, locations });
  assert.strictEqual(enc.length, 1);
  assert.strictEqual(enc[0].sourcePlaceId, "slottsparken");
  assert.strictEqual(enc[0].brandId, null);
});

check("player snapshot bærer ekte stedskobling", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const sp = resolver.getSocialPlaceByLocationId(LID, baseOpts);
  const snap = eng.capturePlayerPhaseSnapshotAtLocation(sp, "leisure");
  assert.strictEqual(snap.locationId, LID);
  assert.strictEqual(snap.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(snap.brandId, "java_kaffebar");
  assert.strictEqual(snap.socialPlaceType, "coffee");
  eng.clearPlayerPhaseSnapshotsForTesting();
});

check("sosial approach og samtale forblir privat, aldri jobbmail", () => {
  const friends = [{ id: "f_brand_02", name: "Ola Nord", role: "Barista" }];
  const snapshots = [{ friendId: "f_brand_02", snapshots: { leisure: {
    phase: "leisure", state: "at_cafe", locationId: LID, activity: "brygger kaffe",
    mood: "blid", visibleOnMap: true, socialAvailability: "open_to_contact"
  } } }];
  const locations = resolver.mergeSocialPlacesIntoLocations([], resolver.getCoffeeSocialPlaces(baseOpts));
  const encounter = eng.getSocialEncountersForLocation("leisure", LID, { friends, snapshots, locations })[0];
  const bridged = bridge.handleCivicationFriendMessageAction({ ok: true, action: "approach", model: encounter });
  assert.strictEqual(bridged.channel, "private");
  assert.strictEqual(bridged.message.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(bridged.message.brandId, "java_kaffebar");
  assert.strictEqual(channels.isJobMail(sentMails[0]), false);
  assert.strictEqual(channels.isPrivateMessage(sentMails[0]), true);

  convo.clearConversationsForTesting();
  const conversation = convo.createSocialConversationFromResponse({
    responseId: "reply", friendId: "f_brand_02", friendName: "Ola Nord", phase: "leisure",
    locationId: LID, sourcePlaceId: "st_hanshaugen_park", brandId: "java_kaffebar",
    socialPlaceType: "coffee", placeLabel: "St. Hanshaugen park"
  }, {});
  assert.strictEqual(conversation.channel, "private");
  assert.strictEqual(conversation.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(conversation.brandId, "java_kaffebar");
  convo.clearConversationsForTesting();
});

check("UI-header viser ekte brand, type, sted og fase", () => {
  const sp = resolver.getSocialPlaceByLocationId(LID, baseOpts);
  const html = resolver.buildSocialPlaceHeaderHtml(sp, "leisure");
  assert.ok(html.includes("Java Kaffebar"));
  assert.ok(html.includes("Kaffe"));
  assert.ok(html.includes("St. Hanshaugen park"));
  assert.ok(html.includes("Fritidsfase"));
  assert.strictEqual(resolver.buildBrandPlaceHeaderHtml(sp, "leisure"), html);

  const park = resolver.getSocialPlaceByLocationId(PARK_LID, placeOpts);
  const parkHtml = resolver.buildSocialPlaceHeaderHtml(park, "evening");
  assert.ok(parkHtml.includes("Slottsparken"));
  assert.ok(parkHtml.includes("Park / byrom"));
  assert.strictEqual(resolver.isBrandSocialPlace(sp), true);
  assert.strictEqual(resolver.isPlaceSocialPlace(park), true);
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
