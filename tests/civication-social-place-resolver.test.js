#!/usr/bin/env node
// tests/civication-social-place-resolver.test.js
//
// Validerer den datadrevne broen mellom ekte brand-/place-data og Civications
// sosiale steder (CivicationSocialPlaceResolver). Sosiale steder skal IKKE være
// generiske ("cafe"/"park"), men koblet til ekte placeId-er og brand-data.
//
// PR #1200 bygget kaffe som første ekte socialPlaceType. Denne testen dekker den
// utvidede modellen med flere ekte sosiale stedstyper: coffee, culture,
// book_library, hospitality_food, retail_social (brand-baserte) og
// park_public_space, city_walk, sport_football (place-only) – uten generiske
// løssteder.
//
// Bekrefter bl.a.:
//   - coffee fra PR #1200 fungerer fortsatt (nøyaktig samme 7 kaffesteder)
//   - culture/book/hospitality/retail bygges fra ekte brand/place-koblinger
//   - park/byrom + byvandring + sport bygges som place-only fra ekte place-source
//   - placeId/sourcePlaceId valideres mot source-data; brands uten placeId droppes
//   - duplikater fjernes; locationId er stabil for brand-place og place-only
//   - samme phase + samme locationId gir møte; ulik locationId / kun samme
//     socialPlaceType gir IKKE møte
//   - snapshot/samtale/relasjon får med sourcePlaceId/brandId/socialPlaceType
//   - jobbmail påvirkes ikke (henvendelse + samtale er PRIVAT)
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
const placesBy = readJSON("data/places/by/oslo/places_by.json");
const placesSport = readJSON("data/places/sport/europa/norway/oslo_sport.json");
const placesPlaygrounds = readJSON("data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json");
const allPlaces = [].concat(placesBy, placesSport, placesPlaygrounds);

// baseOpts dekker brand-baserte steder (place-metadata fra places_by).
const baseOpts = { brandMaster, brandByPlace, places: placesBy };
// placeOpts dekker place-only steder (alle relevante place-source-filer).
const placeOpts = { brandMaster, brandByPlace, places: allPlaces };

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

function pairs(list) {
  return list.map((m) => m.sourcePlaceId + "->" + (m.brandId || "(place)")).sort();
}

// ---------------------------------------------------------------------------
console.log("Brand-klassifisering: socialPlaceType fra ekte brand-data");

check("getSocialPlaceTypeForBrand avleder rett type pr. ekte brand", () => {
  const t = (id) => resolver.getSocialPlaceTypeForBrand(resolver.getBrandById(id, baseOpts));
  // coffee
  assert.strictEqual(t("java_kaffebar"), "coffee");
  assert.strictEqual(t("fuglen"), "coffee"); // sector coffee_design
  // book / library
  assert.strictEqual(t("tronsmo_bokhandel"), "book_library");
  assert.strictEqual(t("tanum_karl_johan"), "book_library");
  // culture (scene/musikk/galleri/opera/nightlife)
  assert.strictEqual(t("mono"), "culture");
  assert.strictEqual(t("parkteatret"), "culture");
  assert.strictEqual(t("den_norske_opera"), "culture");
  assert.strictEqual(t("galleri_brandstrup"), "culture");
  assert.strictEqual(t("ingensteds"), "culture");
  // hospitality / food
  assert.strictEqual(t("grand_cafe"), "hospitality_food");
  assert.strictEqual(t("statholdergaarden"), "hospitality_food");
  assert.strictEqual(t("maaemo"), "hospitality_food");
  // retail_social
  assert.strictEqual(t("retro_lykke"), "retail_social");
  assert.strictEqual(t("norway_designs"), "retail_social");
  assert.strictEqual(t("yme_universe"), "retail_social"); // fashion_brand kind shop
});

check("ikke-sosiale brands gir null (mote/smykker/luksus/jus/arkitektur)", () => {
  const t = (id) => resolver.getSocialPlaceTypeForBrand(resolver.getBrandById(id, baseOpts));
  ["dior", "gucci", "rolex", "louis_vuitton", "thune_jewelry", "cos",
   "tiger_of_sweden", "haavind", "wiersholm", "snohetta"].forEach((id) => {
    assert.strictEqual(t(id), null, id + " skal ikke være et sosialt brand");
  });
});

check("isCoffeeBrand fanger coffee_brand og sector coffee/coffee_design", () => {
  assert.strictEqual(resolver.isCoffeeBrand({ brand_type: "coffee_brand", sector: "coffee" }), true);
  assert.strictEqual(resolver.isCoffeeBrand({ brand_type: "design_brand", sector: "coffee_design" }), true); // Fuglen
  assert.strictEqual(resolver.isCoffeeBrand({ brand_type: "fashion_brand", sector: "fashion" }), false);
  assert.strictEqual(resolver.isCoffeeBrand({ brand_type: "legendary_venue", sector: "hospitality" }), false);
});

// ---------------------------------------------------------------------------
console.log("Coffee fra PR #1200 fungerer fortsatt");

check("getCoffeeSocialPlaces gir nøyaktig de 7 ekte kaffestedene", () => {
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
  assert.ok(coffee.every((m) => m.socialPlaceType === "coffee"), "alle skal være socialPlaceType coffee");
  assert.ok(coffee.every((m) => m.type === "cafe"), "engine-type cafe (PR #1200-kompatibel)");
  // Hospitality-restauranter skal IKKE være i kaffesettet.
  assert.ok(!pairs(coffee).includes("karl_johan->grand_cafe"), "grand_cafe er servering, ikke kaffe");
});

check("ekte placeId bevares + place-metadata hentes fra source-data (coffee)", () => {
  const sp = resolver.getSocialPlaceByLocationId("brand_place:st_hanshaugen_park:java_kaffebar", baseOpts);
  assert.ok(sp, "stedet skal finnes");
  assert.strictEqual(sp.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(sp.brandId, "java_kaffebar");
  assert.strictEqual(sp.label, "Java Kaffebar");
  assert.strictEqual(sp.placeLabel, "St. Hanshaugen park");
  assert.strictEqual(sp.placeFound, true);
  // Koordinatene leses fra kildedata (places_by/St. Hanshaugen park); de er forfinet i
  // kildedataen, så testen følger sannhetskilden (ikke en gammel hardkodet verdi).
  assert.strictEqual(sp.lat, 59.9273);
  assert.strictEqual(sp.lon, 10.7414);
  assert.strictEqual(sp.category, "by");
  assert.strictEqual(sp.type, "cafe");
  assert.strictEqual(sp.socialPlaceType, "coffee");
  assert.strictEqual(sp.channel, "social");
  assert.deepStrictEqual(sp.conversationTone, ["rolig", "uformell", "åpen"]);
});

check("sosial locationId er stabil og deterministisk (brand-place)", () => {
  const a = resolver.buildSocialPlaceFromBrandPlace("st_hanshaugen_park",
    { id: "java_kaffebar", name: "Java Kaffebar", brand_type: "coffee_brand", sector: "coffee" }, null);
  assert.strictEqual(a.locationId, "brand_place:st_hanshaugen_park:java_kaffebar");
  assert.strictEqual(a.id, a.locationId);
  assert.strictEqual(a.placeFound, false);
  assert.strictEqual(a.sourcePlaceId, "st_hanshaugen_park");
  const b = resolver.buildSocialPlaceFromBrandPlace("st_hanshaugen_park",
    { id: "java_kaffebar", name: "Java Kaffebar", brand_type: "coffee_brand", sector: "coffee" }, null);
  assert.deepStrictEqual(a, b);
});

// ---------------------------------------------------------------------------
console.log("Nye brand-baserte typer fra ekte brand/place-koblinger");

check("culture bygges fra ekte scene/musikk/galleri/opera-brands", () => {
  const culture = resolver.getSocialPlacesByType("culture", placeOpts);
  const p = pairs(culture);
  ["youngstorget->mono", "olaf_ryes_plass->parkteatret", "operahuset->den_norske_opera",
   "tjuvholmen->galleri_brandstrup", "vulkan_energisentral->ingensteds", "bla->bla"].forEach((x) => {
    assert.ok(p.includes(x), "mangler culture-sted: " + x);
  });
  assert.ok(culture.every((m) => m.socialPlaceType === "culture"));
  assert.ok(culture.every((m) => m.type === "culture"));
});

check("book_library bygges fra ekte bokhandel-brands", () => {
  const books = resolver.getSocialPlacesByType("book_library", placeOpts);
  const p = pairs(books);
  ["universitetsplassen->tronsmo_bokhandel", "karl_johan->tanum_karl_johan",
   "norli_universitetsgata->norli_universitetsgata",
   "eldorado_bokhandel->eldorado_bokhandel"].forEach((x) => {
    assert.ok(p.includes(x), "mangler bok-sted: " + x);
  });
  // Ekte bibliotek-sted (Deichman) bygges som place-only book_library.
  assert.ok(p.includes("deichman_bjorvika->(place)"), "Deichman skal være place-only bibliotek");
  assert.ok(books.every((m) => m.socialPlaceType === "book_library"));
});

check("hospitality_food bygges fra ekte restaurant-/serveringsbrands", () => {
  const hosp = resolver.getHospitalitySocialPlaces(baseOpts);
  const p = pairs(hosp);
  ["karl_johan->grand_cafe", "bankplassen->engebret_cafe", "gronlandsleiret->olympen",
   "christiania_torv->statholdergaarden", "st_hanshaugen_park->smalhans",
   "torggata->arakataka", "bjorvika->maaemo"].forEach((x) => {
    assert.ok(p.includes(x), "mangler servering-sted: " + x);
  });
  assert.ok(hosp.every((m) => m.socialPlaceType === "hospitality_food"));
});

check("retail_social bygges fra ekte butikk-/konsept-/independent-brands", () => {
  const retail = resolver.getSocialPlacesByType("retail_social", baseOpts);
  const p = pairs(retail);
  ["markveien->retro_lykke", "markveien->robot", "markveien->velouria_vintage",
   "grensen_kjopesenter->outland", "karl_johan->norway_designs",
   "karl_johan->yme_universe", "majorstuen_tbanestasjon->pur_norsk"].forEach((x) => {
    assert.ok(p.includes(x), "mangler butikk-sted: " + x);
  });
  assert.ok(retail.every((m) => m.socialPlaceType === "retail_social"));
});

// ---------------------------------------------------------------------------
console.log("Place-only sosiale steder fra ekte place-source");

check("park_public_space bygges som place-only fra ekte parker", () => {
  const parks = resolver.getSocialPlacesByType("park_public_space", placeOpts);
  const ids = parks.map((m) => m.sourcePlaceId).sort();
  ["birkelunden", "botsparken", "slottsparken", "st_hanshaugen_park",
   "stensparken", "vigelandsparken"].forEach((id) => {
    assert.ok(ids.includes(id), "mangler park: " + id);
  });
  parks.forEach((m) => {
    assert.strictEqual(m.brandId, null, "park-sted skal være place-only (ingen brand)");
    assert.strictEqual(m.locationId, "place:" + m.sourcePlaceId);
    assert.strictEqual(m.type, "park");
    assert.strictEqual(m.source, "places_source");
  });
});

check("city_walk bygges fra ekte byrom/gater/plasser (ikke generisk)", () => {
  const walk = resolver.getSocialPlacesByType("city_walk", placeOpts);
  const ids = walk.map((m) => m.sourcePlaceId);
  ["karl_johan", "torggata", "universitetsplassen", "christiania_torv",
   "bankplassen"].forEach((id) => {
    assert.ok(ids.includes(id), "mangler byrom: " + id);
  });
  walk.forEach((m) => {
    assert.strictEqual(m.brandId, null);
    assert.strictEqual(m.locationId, "place:" + m.sourcePlaceId);
    assert.strictEqual(m.socialPlaceType, "city_walk");
  });
  // Boligområder/infrastruktur er IKKE byvandringssteder.
  assert.ok(!ids.includes("ullevål_hageby"), "boligområde skal ikke bli city_walk");
  assert.ok(!ids.includes("ring_3"), "infrastruktur skal ikke bli city_walk");
});

check("sport_football bygges fra ekte idrettssteder, ikke lekeplasser", () => {
  const sport = resolver.getSocialPlacesByType("sport_football", placeOpts);
  const ids = sport.map((m) => m.sourcePlaceId).sort();
  ["bislett_stadion", "ullevaal_stadion", "intility_arena",
   "frogner_stadion", "daelenenga_idrettspark"].forEach((id) => {
    assert.ok(ids.includes(id), "mangler idrettssted: " + id);
  });
  // Lekeplasser/løse treningssteder er IKKE sport_football.
  assert.ok(!ids.some((id) => id.indexOf("lekeplass_") === 0), "lekeplass skal ikke bli sport");
  assert.ok(!ids.some((id) => id.indexOf("treningssted_") === 0), "treningssted skal ikke bli sport");
  sport.forEach((m) => assert.strictEqual(m.type, "training"));
});

check("place-only locationId er stabil og deterministisk", () => {
  const park = placesBy.find((p) => p.id === "st_hanshaugen_park");
  const a = resolver.buildSocialPlaceFromPlace(park);
  assert.strictEqual(a.locationId, "place:st_hanshaugen_park");
  assert.strictEqual(a.id, a.locationId);
  assert.strictEqual(a.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(a.socialPlaceType, "park_public_space");
  assert.deepStrictEqual(a, resolver.buildSocialPlaceFromPlace(park));
});

check("type-konfig: fase-affinitet, tone og aktiviteter pr. type", () => {
  assert.deepStrictEqual(resolver.getSocialPhaseAffinityForType("coffee"), ["morning", "leisure", "evening"]);
  assert.deepStrictEqual(resolver.getSocialToneForType("park_public_space"), ["åpen", "tilfeldig", "rolig"]);
  assert.deepStrictEqual(resolver.getSocialActivitiesForType("book_library"), ["read", "browse", "meet_people"]);
  // Norske labels for socialPlaceType.
  assert.strictEqual(resolver.getSocialPlaceTypeLabel("coffee"), "kaffe");
  assert.strictEqual(resolver.getSocialPlaceTypeLabel("culture"), "kultur");
  assert.strictEqual(resolver.getSocialPlaceTypeLabel("book_library"), "bok / bibliotek");
  assert.strictEqual(resolver.getSocialPlaceTypeLabel("park_public_space"), "park / byrom");
  assert.strictEqual(resolver.getSocialPlaceTypeLabel("sport_football"), "sport / fotball");
  assert.strictEqual(resolver.getSocialPlaceTypeLabel("hospitality_food"), "servering");
  assert.strictEqual(resolver.getSocialPlaceTypeLabel("retail_social"), "butikk / interesse");
  assert.strictEqual(resolver.getSocialPlaceTypeLabel("city_walk"), "byvandring");
});

check("getSocialPlacesForPhase filtrerer på ekte fase-affinitet", () => {
  const morning = resolver.getSocialPlacesForPhase("morning", placeOpts);
  assert.ok(morning.length > 0, "kaffesteder har morgen-affinitet");
  assert.ok(morning.every((m) => m.phaseAffinity.indexOf("morning") !== -1));
  // Kaffe har morgen-affinitet; park har ikke.
  assert.ok(morning.some((m) => m.socialPlaceType === "coffee"));
  assert.ok(!morning.some((m) => m.socialPlaceType === "park_public_space"));
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
  // karl_johan har dior/gucci/rolex (mote/smykker) + sosiale brands av flere typer.
  const social = resolver.getSocialBrandsForPlace("karl_johan", baseOpts).map((b) => b.id).sort();
  assert.deepStrictEqual(social, [
    "egon", "grand_cafe", "grand_hotel_oslo", "hotel_continental",
    "norway_designs", "steen_strom", "stockfleths", "tanum_karl_johan",
    "theatercafeen", "yme_universe"
  ]);
});

// ---------------------------------------------------------------------------
console.log("Filtrering: ingen løse brands/places, ingen duplikater");

check("brands uten place-kobling lager ingen sosiale steder", () => {
  const all = resolver.resolveCivicationSocialPlacesFromBrands(baseOpts);
  all.forEach((m) => {
    assert.ok(Object.prototype.hasOwnProperty.call(brandByPlace, m.sourcePlaceId),
      "sted uten ekte placeId: " + m.sourcePlaceId);
    const ids = brandByPlace[m.sourcePlaceId].map(String);
    assert.ok(ids.includes(m.brandId), "brand ikke koblet til placeId: " + m.brandId);
  });
});

check("place-only steder bruker kun ekte placeId fra source-data", () => {
  const fromPlaces = resolver.resolveCivicationSocialPlacesFromPlaces(placeOpts);
  const sourceIds = new Set(allPlaces.map((p) => String(p.id)));
  assert.ok(fromPlaces.length > 0);
  fromPlaces.forEach((m) => {
    assert.ok(sourceIds.has(m.sourcePlaceId), "place-only uten ekte placeId: " + m.sourcePlaceId);
    assert.strictEqual(m.brandId, null);
  });
});

check("ikke-sosiale brands (mote/smykker/jus) genererer ingen steder", () => {
  const all = resolver.resolveCivicationSocialPlacesFromBrands(baseOpts).map((m) => m.brandId);
  ["dior", "gucci", "rolex", "cos", "haavind", "wiersholm", "thune_jewelry"].forEach((id) => {
    assert.ok(!all.includes(id), id + " skal ikke bli et sosialt sted");
  });
});

check("duplikater (samme place+brand) unngås", () => {
  const dupOpts = {
    brandMaster,
    brandByPlace: { ...brandByPlace, st_hanshaugen_park: ["java_kaffebar", "java_kaffebar"] },
    places: placesBy
  };
  const all = resolver.resolveCivicationSocialPlacesFromBrands(dupOpts);
  const ids = all.map((m) => m.locationId);
  assert.strictEqual(ids.length, new Set(ids).size, "ingen duplikate locationId");
  const java = all.filter((m) => m.locationId === "brand_place:st_hanshaugen_park:java_kaffebar");
  assert.strictEqual(java.length, 1, "java_kaffebar skal kun finnes én gang");
});

check("resolveAll dedupliserer brand-place og place-only på locationId", () => {
  const all = resolver.resolveAllCivicationSocialPlaces(placeOpts);
  const ids = all.map((m) => m.locationId);
  assert.strictEqual(ids.length, new Set(ids).size, "ingen duplikate locationId i samlet sett");
  // Samme placeId kan gi BÅDE brand-place og place-only (ulik identitet) – men
  // det er to ulike locationId-er, ikke et duplikat.
  assert.ok(ids.includes("brand_place:st_hanshaugen_park:java_kaffebar"));
  assert.ok(ids.includes("place:st_hanshaugen_park"));
});

check("kaffe prioriteres først i resolve-rekkefølgen", () => {
  const all = resolver.resolveCivicationSocialPlacesFromBrands(baseOpts);
  const firstNonCoffee = all.findIndex((m) => m.socialPlaceType !== "coffee");
  const lastCoffee = all.map((m) => m.socialPlaceType).lastIndexOf("coffee");
  assert.ok(lastCoffee < firstNonCoffee, "alle kaffesteder skal komme først");
});

// ---------------------------------------------------------------------------
console.log("Integrasjon: sosialt møte krever samme phase + samme locationId");

const LID = "brand_place:st_hanshaugen_park:java_kaffebar";
const PARK_LID = "place:slottsparken";

check("merge gjør sosiale steder tilgjengelige for den sosiale motoren", () => {
  const baseLocations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
  const socialPlaces = resolver.resolveAllCivicationSocialPlaces(placeOpts);
  const merged = resolver.mergeSocialPlacesIntoLocations(baseLocations, socialPlaces);
  const loc = eng.locationById(merged, LID);
  assert.ok(loc, "brand-stedet skal finnes blant locations");
  assert.strictEqual(loc.label, "Java Kaffebar");
  assert.strictEqual(loc.type, "cafe");
  const park = eng.locationById(merged, PARK_LID);
  assert.ok(park, "place-only park skal finnes blant locations");
  assert.strictEqual(park.type, "park");
  // Eksisterende generiske steder er fortsatt der (ingen overstyring).
  assert.ok(eng.locationById(merged, "cafe"), "generisk cafe skal fortsatt finnes");
  assert.ok(eng.locationById(merged, "home"), "home skal fortsatt finnes");
});

check("samme phase + samme locationId gir et sosialt møte (brand-place)", () => {
  const friends = [{ id: "f_brand_01", name: "Ada Lin", role: "Designer" }];
  const snapshots = [{ friendId: "f_brand_01", snapshots: { leisure: {
    phase: "leisure", state: "at_cafe", locationId: LID, activity: "tar en kaffe",
    mood: "rolig", visibleOnMap: true, socialAvailability: "open_to_contact" } } }];
  const locations = resolver.mergeSocialPlacesIntoLocations([], resolver.getCoffeeSocialPlaces(baseOpts));

  const enc = eng.getSocialEncountersForLocation("leisure", LID, { friends, snapshots, locations, dayIndex: 1 });
  assert.strictEqual(enc.length, 1);
  assert.strictEqual(enc[0].friendId, "f_brand_01");
  assert.strictEqual(enc[0].locationId, LID);
  assert.strictEqual(enc[0].locationLabel, "Java Kaffebar");
  assert.strictEqual(enc[0].action, "approach");
  // Møte-modellen bærer ekte stedskobling videre.
  assert.strictEqual(enc[0].sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(enc[0].brandId, "java_kaffebar");
  assert.strictEqual(enc[0].socialPlaceType, "coffee");
});

check("samme phase + ulik locationId gir IKKE møte (samme socialPlaceType)", () => {
  // To kaffesteder (samme socialPlaceType coffee) men ulik locationId.
  const LID2 = "brand_place:universitetsplassen:fuglen";
  const friends = [
    { id: "p1", name: "Per En", role: "Barista" },
    { id: "p2", name: "Pia To", role: "Barista" }
  ];
  const snapshots = [
    { friendId: "p1", snapshots: { leisure: { phase: "leisure", state: "at_cafe",
      locationId: LID, activity: "kaffe", visibleOnMap: true, socialAvailability: "open_to_contact" } } },
    { friendId: "p2", snapshots: { leisure: { phase: "leisure", state: "at_cafe",
      locationId: LID2, activity: "kaffe", visibleOnMap: true, socialAvailability: "open_to_contact" } } }
  ];
  const locations = resolver.mergeSocialPlacesIntoLocations([], resolver.getCoffeeSocialPlaces(baseOpts));
  const encAtLid = eng.getSocialEncountersForLocation("leisure", LID, { friends, snapshots, locations });
  // Kun personen på akkurat dette stedet vises – ikke den på et annet kaffested.
  assert.deepStrictEqual(encAtLid.map((e) => e.friendId), ["p1"]);
  // Annen fase gir heller ingen møter.
  assert.strictEqual(eng.getSocialEncountersForLocation("morning", LID, { friends, snapshots, locations }).length, 0);
});

check("place-only park gir møte på samme phase + samme locationId", () => {
  const friends = [{ id: "f_park_01", name: "Liv Berg", role: "Student" }];
  const snapshots = [{ friendId: "f_park_01", snapshots: { evening: {
    phase: "evening", state: "at_park", locationId: PARK_LID, activity: "setter seg i parken",
    mood: "rolig", visibleOnMap: true, socialAvailability: "open_to_contact" } } }];
  const locations = resolver.mergeSocialPlacesIntoLocations([],
    resolver.getSocialPlacesByType("park_public_space", placeOpts));
  const enc = eng.getSocialEncountersForLocation("evening", PARK_LID, { friends, snapshots, locations });
  assert.strictEqual(enc.length, 1);
  assert.strictEqual(enc[0].sourcePlaceId, "slottsparken");
  assert.strictEqual(enc[0].brandId, null);
  assert.strictEqual(enc[0].socialPlaceType, "park_public_space");
});

check("player snapshot lagrer sourcePlaceId/brandId/socialPlaceType", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const sp = resolver.getSocialPlaceByLocationId(LID, baseOpts);
  const snap = eng.capturePlayerPhaseSnapshotAtLocation(sp, "leisure");
  assert.strictEqual(snap.phase, "leisure");
  assert.strictEqual(snap.locationId, LID);
  assert.strictEqual(snap.socialAvailability, "open_to_contact");
  assert.strictEqual(snap.visibleOnMap, true);
  assert.strictEqual(snap.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(snap.brandId, "java_kaffebar");
  assert.strictEqual(snap.socialPlaceType, "coffee");
  assert.strictEqual(eng.getPlayerSnapshotForPhase("leisure").locationId, LID);
  eng.clearPlayerPhaseSnapshotsForTesting();
});

// ---------------------------------------------------------------------------
console.log("Henvendelse + samtaletråd er PRIVAT (jobbmail påvirkes ikke)");

check("approach på sosialt sted blir en PERSONLIG melding, aldri jobbmail", () => {
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
  // Ekte stedskobling følger henvendelsen.
  assert.strictEqual(m.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(m.brandId, "java_kaffebar");
  assert.strictEqual(m.socialPlaceType, "coffee");
  // Aldri jobb-/karrierefelt (job-bridgen bruker brand_id/role_key/career_id).
  assert.strictEqual(m.career_id, undefined);
  assert.strictEqual(m.role_key, undefined);
  assert.strictEqual(m.brand_id, undefined);
  // Registrert i innkommende som privat, ikke jobbmail.
  assert.strictEqual(sentMails.length, 1);
  assert.strictEqual(channels.isJobMail(sentMails[0]), false);
  assert.strictEqual(channels.isPrivateMessage(sentMails[0]), true);
  assert.strictEqual(sentMails[0].socialPlaceType, "coffee");
});

check("positiv respons (reply) lager samtaletråd med ekte stedskobling", () => {
  convo.clearConversationsForTesting();
  const conversation = convo.createSocialConversationFromResponse(
    { responseId: "reply", friendId: "f_brand_02", friendName: "Ola Nord", phase: "leisure",
      locationId: LID, sourcePlaceId: "st_hanshaugen_park", brandId: "java_kaffebar",
      socialPlaceType: "coffee", placeLabel: "St. Hanshaugen park" },
    {}
  );
  assert.ok(conversation, "samtale skal opprettes");
  assert.strictEqual(conversation.locationId, LID);
  assert.strictEqual(conversation.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(conversation.brandId, "java_kaffebar");
  assert.strictEqual(conversation.socialPlaceType, "coffee");
  assert.strictEqual(conversation.channel, "private");
  assert.strictEqual(conversation.mail_class, "private_message");
  // Samtale-mailen er privat, aldri jobbmail.
  assert.ok(sentMails.length >= 1);
  assert.strictEqual(channels.isJobMail(sentMails[sentMails.length - 1]), false);
  convo.clearConversationsForTesting();
});

// ---------------------------------------------------------------------------
console.log("UI: stedskort-header for sosialt sted");

check("buildSocialPlaceHeaderHtml viser brandnavn, type-label, sted og fase", () => {
  const sp = resolver.getSocialPlaceByLocationId(LID, baseOpts);
  const html = resolver.buildSocialPlaceHeaderHtml(sp, "leisure");
  assert.ok(html.includes("Java Kaffebar"), "brandnavn mangler");
  assert.ok(html.includes("Kaffe"), "socialPlaceType-label mangler");
  assert.ok(html.includes("St. Hanshaugen park"), "tilknyttet ekte sted mangler");
  assert.ok(html.includes("Fritidsfase"), "fase mangler");
  assert.strictEqual(html, resolver.buildSocialPlaceHeaderHtml(sp, "leisure"));
  // Bakoverkompatibelt navn finnes fortsatt.
  assert.strictEqual(resolver.buildBrandPlaceHeaderHtml(sp, "leisure"), html);
});

check("buildSocialPlaceHeaderHtml viser place-only park med ekte stednavn", () => {
  const park = resolver.getSocialPlaceByLocationId("place:slottsparken", placeOpts);
  const html = resolver.buildSocialPlaceHeaderHtml(park, "evening");
  assert.ok(html.includes("Slottsparken"), "stednavn mangler");
  assert.ok(html.includes("Park / byrom"), "park-label mangler");
});

check("isBrandSocialPlace/isPlaceSocialPlace skiller stedstyper", () => {
  const brand = resolver.getSocialPlaceByLocationId(LID, baseOpts);
  const park = resolver.getSocialPlaceByLocationId("place:slottsparken", placeOpts);
  assert.strictEqual(resolver.isBrandSocialPlace(brand), true);
  assert.strictEqual(resolver.isPlaceSocialPlace(brand), false);
  assert.strictEqual(resolver.isBrandSocialPlace(park), false);
  assert.strictEqual(resolver.isPlaceSocialPlace(park), true);
  assert.strictEqual(resolver.isSocialPlace({ id: "cafe", type: "cafe" }), false);
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
