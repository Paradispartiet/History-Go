#!/usr/bin/env node
// tests/civication-social-place-resolver.test.js
//
// Validerer den datadrevne broen mellom ekte brand-/place-data og Civications
// sosiale steder (CivicationSocialPlaceResolver). Sosiale kafésteder skal IKKE
// være generiske ("cafe"/"park"), men koblet til ekte placeId-er og brand-data.
//
// Bekrefter:
//   - coffee_brand / sector coffee filtreres ut riktig (Fuglen/coffee_design med,
//     hospitality-kaféer ikke i kaffesettet)
//   - brands_by_place kobles til brands_master riktig
//   - ekte placeId bevares (sourcePlaceId) + place-metadata fra source-data
//   - sosial locationId blir stabil ("brand_place:{placeId}:{brandId}")
//   - brands uten brand/place-kobling, og ikke-sosiale brands, ignoreres
//   - duplikater (samme place+brand) unngås
//   - Civication social encounter kan bruke brand-place locationId
//   - player snapshot kan lagres med ekte brand-place locationId (open_to_contact)
//   - samme phase + samme brand-place locationId gir et sosialt møte
//   - henvendelse + samtaletråd på brand-place blir PRIVAT (jobbmail påvirkes ikke)
//
// Kjør:  node tests/civication-social-place-resolver.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

// Headless oppsett (samme mønster som de andre Civication-testene). Vi fanger
// mail-engine-kall for å bekrefte at en henvendelse/samtale havner under
// PERSONLIGE meldinger (privat kanal), aldri jobbmail.
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
// Resolveren faller tilbake til eksplisitt data i testene – fetch skal aldri brukes.
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

assert.ok(channels, "CivicationEventChannels skal være lastet");
assert.ok(eng, "CivicationFriendsEngine skal være lastet");
assert.ok(bridge, "CivicationFriendMessages skal være lastet");
assert.ok(convo, "CivicationSocialConversationEngine skal være lastet");
assert.ok(resolver, "CivicationSocialPlaceResolver skal være lastet");

// Ekte kildedata (source-data, IKKE build-output, IKKE places_index.json).
const brandMaster = readJSON("data/brands/brands_master.json");
const brandByPlace = readJSON("data/brands/brands_by_place.json");
const places = readJSON("data/places/by/oslo/places_by.json");
const baseOpts = { brandMaster, brandByPlace, places };

let failures = 0;
function check(name, fn) {
  sentMails.length = 0;
  try {
    fn();
    console.log("  ok  -", name);
  } catch (e) {
    failures += 1;
    console.error("FAIL  -", name);
    console.error("       ", e && e.message);
  }
}

// ---------------------------------------------------------------------------
console.log("Brand-klassifisering: coffee_brand / sector coffee");

check("isCoffeeBrand fanger coffee_brand og sector coffee/coffee_design", () => {
  assert.strictEqual(resolver.isCoffeeBrand({ brand_type: "coffee_brand", sector: "coffee" }), true);
  assert.strictEqual(resolver.isCoffeeBrand({ brand_type: "design_brand", sector: "coffee_design" }), true); // Fuglen
  assert.strictEqual(resolver.isCoffeeBrand({ brand_type: "fashion_brand", sector: "fashion" }), false);
  assert.strictEqual(resolver.isCoffeeBrand({ brand_type: "legendary_venue", sector: "hospitality" }), false);
});

check("isCafeVenueBrand fanger café-/kaffe-navngitte serveringssteder (sekundært)", () => {
  assert.strictEqual(resolver.isCafeVenueBrand({ name: "Grand Café", sector: "hospitality" }), true);
  assert.strictEqual(resolver.isCafeVenueBrand({ name: "Café Sara", sector: "nightlife" }), true);
  assert.strictEqual(resolver.isCafeVenueBrand({ name: "Majorstuen Te & Kaffe", sector: "food_and_drink" }), true);
  // Ikke et café-navn, og ikke kaffe -> ikke et sosialt sted.
  assert.strictEqual(resolver.isCafeVenueBrand({ name: "Maaemo", sector: "hospitality" }), false);
  // Café-navn men feil sektor (butikk) -> ikke serveringssted.
  assert.strictEqual(resolver.isCafeVenueBrand({ name: "Cafe Shop", sector: "retail" }), false);
});

check("getCoffeeSocialPlaces gir nøyaktig de 7 ekte kaffestedene", () => {
  const coffee = resolver.getCoffeeSocialPlaces(baseOpts);
  const pairs = coffee.map((m) => m.sourcePlaceId + "->" + m.brandId).sort();
  assert.deepStrictEqual(pairs, [
    "bjorvika->talormade",
    "grunerlokka_helgesens_tm->supreme_roastworks",
    "grunerlokka_helgesens_tm->tim_wendelboe",
    "karl_johan->stockfleths",
    "majorstuen_tbanestasjon->kaffebrenneriet",
    "st_hanshaugen_park->java_kaffebar",
    "universitetsplassen->fuglen"
  ]);
  // Alle er typet som kaffe.
  assert.ok(coffee.every((m) => m.socialPlaceType === "coffee"), "alle skal være socialPlaceType coffee");
  // Hospitality-kaféer skal IKKE være i kaffesettet.
  assert.ok(!pairs.includes("karl_johan->grand_cafe"), "grand_cafe er hospitality, ikke kaffe");
});

check("getHospitalitySocialPlaces inkluderer de prioriterte café-serveringsstedene", () => {
  const hosp = resolver.getHospitalitySocialPlaces(baseOpts);
  const pairs = hosp.map((m) => m.sourcePlaceId + "->" + m.brandId);
  ["karl_johan->grand_cafe", "bankplassen->engebret_cafe",
   "storgata->cafe_sara", "majorstuen_tbanestasjon->majorstuen_te_og_kaffe"].forEach((p) => {
    assert.ok(pairs.includes(p), "mangler hospitality-sted: " + p);
  });
  assert.ok(hosp.every((m) => m.socialPlaceType === "hospitality"), "alle skal være hospitality");
});

// ---------------------------------------------------------------------------
console.log("Kobling brands_by_place <-> brands_master + ekte placeId");

check("getBrandsForPlace + getBrandById kobler riktig", () => {
  const ids = resolver.getBrandsForPlace("st_hanshaugen_park", baseOpts);
  assert.ok(ids.includes("java_kaffebar"), "java_kaffebar skal være koblet til st_hanshaugen_park");
  const brand = resolver.getBrandById("java_kaffebar", baseOpts);
  assert.strictEqual(brand.name, "Java Kaffebar");
  assert.strictEqual(brand.brand_type, "coffee_brand");
});

check("getSocialBrandsForPlace filtrerer bort ikke-sosiale brands på samme sted", () => {
  // karl_johan har dior/gucci/rolex (mote/smykker) + grand_cafe + stockfleths.
  const social = resolver.getSocialBrandsForPlace("karl_johan", baseOpts).map((b) => b.id).sort();
  assert.deepStrictEqual(social, ["grand_cafe", "stockfleths", "theatercafeen"]);
});

check("ekte placeId bevares + place-metadata hentes fra source-data", () => {
  const sp = resolver.getSocialPlaceByLocationId("brand_place:st_hanshaugen_park:java_kaffebar", baseOpts);
  assert.ok(sp, "stedet skal finnes");
  assert.strictEqual(sp.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(sp.brandId, "java_kaffebar");
  assert.strictEqual(sp.label, "Java Kaffebar");
  assert.strictEqual(sp.placeLabel, "St. Hanshaugen park");
  assert.strictEqual(sp.placeFound, true);
  assert.strictEqual(sp.lat, 59.9234);
  assert.strictEqual(sp.lon, 10.7463);
  assert.strictEqual(sp.category, "by");
  assert.strictEqual(sp.type, "cafe");
  assert.strictEqual(sp.channel, "social");
});

check("sosial locationId er stabil og deterministisk", () => {
  const a = resolver.buildSocialPlaceFromBrandPlace("st_hanshaugen_park",
    { id: "java_kaffebar", name: "Java Kaffebar", brand_type: "coffee_brand", sector: "coffee" }, null);
  assert.strictEqual(a.locationId, "brand_place:st_hanshaugen_park:java_kaffebar");
  assert.strictEqual(a.id, a.locationId);
  // Uten place-data faller label tilbake til brandnavn, placeId bevares som kilde.
  assert.strictEqual(a.placeFound, false);
  assert.strictEqual(a.sourcePlaceId, "st_hanshaugen_park");
  const b = resolver.buildSocialPlaceFromBrandPlace("st_hanshaugen_park",
    { id: "java_kaffebar", name: "Java Kaffebar", brand_type: "coffee_brand", sector: "coffee" }, null);
  assert.deepStrictEqual(a, b);
});

// ---------------------------------------------------------------------------
console.log("Filtrering: ingen løse brands, ingen duplikater");

check("brands uten place-kobling lager ingen sosiale steder", () => {
  const all = resolver.resolveCivicationSocialPlacesFromBrands(baseOpts);
  // Hvert sted har en sourcePlaceId som faktisk finnes i brands_by_place.
  all.forEach((m) => {
    assert.ok(Object.prototype.hasOwnProperty.call(brandByPlace, m.sourcePlaceId),
      "sted uten ekte placeId: " + m.sourcePlaceId);
    const ids = brandByPlace[m.sourcePlaceId].map(String);
    assert.ok(ids.includes(m.brandId), "brand ikke koblet til placeId: " + m.brandId);
  });
});

check("ikke-sosiale brands (mote/smykker/restaurant) genererer ingen steder", () => {
  const all = resolver.resolveCivicationSocialPlacesFromBrands(baseOpts).map((m) => m.brandId);
  ["dior", "gucci", "rolex", "maaemo", "cos"].forEach((id) => {
    assert.ok(!all.includes(id), id + " skal ikke bli et sosialt sted");
  });
});

check("duplikater (samme place+brand) unngås", () => {
  // theatercafeen finnes på to ulike placeId -> to ULIKE locationId, ingen dup.
  const dupOpts = {
    brandMaster,
    brandByPlace: { ...brandByPlace, st_hanshaugen_park: ["java_kaffebar", "java_kaffebar"] },
    places
  };
  const all = resolver.resolveCivicationSocialPlacesFromBrands(dupOpts);
  const ids = all.map((m) => m.locationId);
  const uniq = new Set(ids);
  assert.strictEqual(ids.length, uniq.size, "ingen duplikate locationId");
  const java = all.filter((m) => m.locationId === "brand_place:st_hanshaugen_park:java_kaffebar");
  assert.strictEqual(java.length, 1, "java_kaffebar skal kun finnes én gang");
});

check("kaffe prioriteres først i resolve-rekkefølgen", () => {
  const all = resolver.resolveCivicationSocialPlacesFromBrands(baseOpts);
  const firstHospIdx = all.findIndex((m) => m.socialPlaceType === "hospitality");
  const lastCoffeeIdx = all.map((m) => m.socialPlaceType).lastIndexOf("coffee");
  assert.ok(lastCoffeeIdx < firstHospIdx, "alle kaffesteder skal komme før hospitality");
});

// ---------------------------------------------------------------------------
console.log("Integrasjon: Civication social encounter på brand-place locationId");

const LID = "brand_place:st_hanshaugen_park:java_kaffebar";

check("merge gjør brand-stedet tilgjengelig for den sosiale motoren", () => {
  const baseLocations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
  const socialPlaces = resolver.getCoffeeSocialPlaces(baseOpts);
  const merged = resolver.mergeSocialPlacesIntoLocations(baseLocations, socialPlaces);
  const loc = eng.locationById(merged, LID);
  assert.ok(loc, "brand-stedet skal finnes blant locations");
  assert.strictEqual(loc.label, "Java Kaffebar");
  assert.strictEqual(loc.type, "cafe");
  // Eksisterende generiske steder er fortsatt der (ingen overstyring).
  assert.ok(eng.locationById(merged, "cafe"), "generisk cafe skal fortsatt finnes");
  assert.ok(eng.locationById(merged, "home"), "home skal fortsatt finnes");
});

check("samme phase + samme brand-place locationId gir et sosialt møte", () => {
  const friends = [{ id: "f_brand_01", name: "Ada Lin", role: "Designer" }];
  const snapshots = [{ friendId: "f_brand_01", snapshots: { leisure: {
    phase: "leisure", state: "at_cafe", locationId: LID, activity: "tar en kaffe",
    mood: "rolig", visibleOnMap: true, socialAvailability: "open_to_contact" } } }];
  const socialPlaces = resolver.getCoffeeSocialPlaces(baseOpts);
  const locations = resolver.mergeSocialPlacesIntoLocations([], socialPlaces);

  const enc = eng.getSocialEncountersForLocation("leisure", LID, { friends, snapshots, locations, dayIndex: 1 });
  assert.strictEqual(enc.length, 1);
  assert.strictEqual(enc[0].friendId, "f_brand_01");
  assert.strictEqual(enc[0].locationId, LID);
  assert.strictEqual(enc[0].locationLabel, "Java Kaffebar");
  assert.strictEqual(enc[0].phase, "leisure");
  assert.strictEqual(enc[0].action, "approach");

  // Annen fase / annet sted gir ingen møter.
  assert.strictEqual(eng.getSocialEncountersForLocation("morning", LID, { friends, snapshots, locations }).length, 0);
  assert.strictEqual(eng.getSocialEncountersForLocation("leisure", "cafe", { friends, snapshots, locations }).length, 0);
});

check("player snapshot kan lagres med ekte brand-place locationId (open_to_contact)", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const sp = resolver.getSocialPlaceByLocationId(LID, baseOpts);
  const snap = eng.capturePlayerPhaseSnapshotAtLocation(sp, "leisure");
  assert.strictEqual(snap.phase, "leisure");
  assert.strictEqual(snap.locationId, LID);
  assert.strictEqual(snap.socialAvailability, "open_to_contact");
  assert.strictEqual(snap.visibleOnMap, true);
  assert.strictEqual(snap.channel, "social");
  assert.strictEqual(eng.getPlayerSnapshotForPhase("leisure").locationId, LID);
  eng.clearPlayerPhaseSnapshotsForTesting();
});

// ---------------------------------------------------------------------------
console.log("Henvendelse + samtaletråd er PRIVAT (jobbmail påvirkes ikke)");

check("approach på brand-place blir en PERSONLIG melding, aldri jobbmail", () => {
  const friends = [{ id: "f_brand_02", name: "Ola Nord", role: "Barista" }];
  const snapshots = [{ friendId: "f_brand_02", snapshots: { leisure: {
    phase: "leisure", state: "at_cafe", locationId: LID, activity: "brygger kaffe",
    mood: "blid", visibleOnMap: true, socialAvailability: "open_to_contact" } } }];
  const locations = resolver.mergeSocialPlacesIntoLocations([], resolver.getCoffeeSocialPlaces(baseOpts));

  const enc = eng.getSocialEncountersForLocation("leisure", LID, { friends, snapshots, locations })[0];
  const bridged = bridge.handleCivicationFriendMessageAction({ ok: true, action: "approach", model: enc });
  assert.strictEqual(bridged.ok, true);
  assert.strictEqual(bridged.channel, "private");
  const m = bridged.message;
  assert.strictEqual(m.channel, "private");
  assert.strictEqual(m.locationId, LID);
  assert.strictEqual(m.actionId, "approach");
  // Aldri jobb-/karrierefelt.
  assert.strictEqual(m.career_id, undefined);
  assert.strictEqual(m.role_key, undefined);
  assert.strictEqual(m.brand_id, undefined);
  // Registrert i innkommende som privat, ikke jobbmail.
  assert.strictEqual(sentMails.length, 1);
  assert.strictEqual(channels.isJobMail(sentMails[0]), false);
  assert.strictEqual(channels.isPrivateMessage(sentMails[0]), true);
});

check("positiv respons (reply) lager samtaletråd som beholder brand-place locationId", () => {
  convo.clearConversationsForTesting();
  const conversation = convo.createSocialConversationFromResponse(
    { responseId: "reply", friendId: "f_brand_02", friendName: "Ola Nord", phase: "leisure", locationId: LID },
    {}
  );
  assert.ok(conversation, "samtale skal opprettes");
  assert.strictEqual(conversation.locationId, LID);
  assert.strictEqual(conversation.channel, "private");
  assert.strictEqual(conversation.mail_class, "private_message");
  assert.strictEqual(conversation.phase, "leisure");
  // Samtale-mailen er privat, aldri jobbmail.
  assert.ok(sentMails.length >= 1);
  assert.strictEqual(channels.isJobMail(sentMails[sentMails.length - 1]), false);
  convo.clearConversationsForTesting();
});

// ---------------------------------------------------------------------------
console.log("UI: stedskort-header for brand-kafésted");

check("buildBrandPlaceHeaderHtml viser brandnavn, tilknyttet sted og fase", () => {
  const sp = resolver.getSocialPlaceByLocationId(LID, baseOpts);
  const html = resolver.buildBrandPlaceHeaderHtml(sp, "leisure");
  assert.ok(html.includes("Java Kaffebar"), "brandnavn mangler");
  assert.ok(html.includes("Tilknyttet: St. Hanshaugen park"), "tilknyttet ekte sted mangler");
  assert.ok(html.includes("Fritidsfase"), "fase mangler");
  // Deterministisk.
  assert.strictEqual(html, resolver.buildBrandPlaceHeaderHtml(sp, "leisure"));
});

check("isBrandSocialPlace skiller brand-steder fra generiske locations", () => {
  const sp = resolver.getSocialPlaceByLocationId(LID, baseOpts);
  assert.strictEqual(resolver.isBrandSocialPlace(sp), true);
  assert.strictEqual(resolver.isBrandSocialPlace({ id: "cafe", type: "cafe" }), false);
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
