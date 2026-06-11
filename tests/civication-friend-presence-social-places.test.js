#!/usr/bin/env node
// tests/civication-friend-presence-social-places.test.js
//
// Validerer at venners generiske faseplassering (presenceByPhase / phase
// snapshots) kan resolves til EKTE, konkrete socialPlaces fra
// CivicationSocialPlaceResolver, slik at personmarkører ikke lenger ender på
// generiske kategoriinnganger ("cafe"/"culture"/"football"/"store") når det
// finnes konkrete steder i byen.
//
// Dekker:
//   - resolver: cafe->coffee, culture->culture, football->sport_football,
//     store->retail_social når data finnes
//   - systemnoder (workplace/nav_office/psychology_room) beholdes
//   - venners simulerte hjem (friend_home_demo_*) beholdes
//   - konkret brand_place:* / place:* beholdes uendret
//   - mangel på konkrete steder gir generisk fallback
//   - determinisme: samme friendId+phase+generic -> samme sted; ulike venner kan
//     få ulike steder; ingen tilfeldig hopping mellom render
//   - view-model: rawLocationId bevares, resolved locationId brukes
//   - snapshots: konkret brukes direkte, generisk resolves, fallback virker
//   - sosial flyt: samme resolved konkret locationId gir møte; samme generisk
//     rawLocationId alene gir IKKE møte når resolved er ulik; henvendelse bruker
//     konkret locationId og blir en PRIVAT melding (aldri jobbmail/karrierefelt)
//
// Kjør:  node tests/civication-friend-presence-social-places.test.js

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
const resolver = sandboxWindow.CivicationSocialPlaceResolver;

assert.ok(eng, "CivicationFriendsEngine skal være lastet");
assert.ok(resolver, "CivicationSocialPlaceResolver skal være lastet");
assert.ok(bridge, "CivicationFriendMessages skal være lastet");

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
// Kontrollert sett konkrete socialPlaces (deterministisk, uten fetch).
// To kaffesteder (samme type), ett kultursted, ett sport-sted (place-only),
// ett butikksted. Formen speiler resolverens runtime-modell.
function sp(fields) {
  return Object.assign({
    channel: "social",
    placeLabel: fields.label,
    label: fields.label
  }, fields, { id: fields.locationId });
}
const SOCIAL_PLACES = [
  sp({ locationId: "brand_place:plassen_a:java", socialPlaceType: "coffee", sourcePlaceId: "plassen_a", brandId: "java", label: "Java Kaffebar", type: "cafe" }),
  sp({ locationId: "brand_place:plassen_b:fuglen", socialPlaceType: "coffee", sourcePlaceId: "plassen_b", brandId: "fuglen", label: "Fuglen", type: "cafe" }),
  sp({ locationId: "brand_place:plassen_c:mono", socialPlaceType: "culture", sourcePlaceId: "plassen_c", brandId: "mono", label: "Mono", type: "culture" }),
  sp({ locationId: "place:bislett_stadion", socialPlaceType: "sport_football", sourcePlaceId: "bislett_stadion", brandId: null, label: "Bislett stadion", type: "training" }),
  sp({ locationId: "brand_place:plassen_d:retro", socialPlaceType: "retail_social", sourcePlaceId: "plassen_d", brandId: "retro", label: "Retro Lykke", type: "store_social" })
];

const baseLocations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
const mergedLocations = eng.mergeSocialPlacesIntoLocations(baseLocations, SOCIAL_PLACES);
const CTX = { socialPlaces: SOCIAL_PLACES, locations: mergedLocations };

const MARIAM = { id: "friend_demo_01", name: "Mariam Holt", role: "Barista" };
const SARA = { id: "friend_demo_03", name: "Sara Nguyen", role: "Student" };
const JONAS = { id: "friend_demo_02", name: "Jonas Eide", role: "Lagermedarbeider" };
const ODA = { id: "friend_demo_04", name: "Oda Berg", role: "Hjelpepleier" };

function resolveLoc(friend, locationId, phase) {
  return eng.resolveFriendPresenceLocation({ locationId, phase }, friend, CTX);
}

// ---------------------------------------------------------------------------
console.log("Resolver: generisk faseplassering -> konkret socialPlace");

check("cafe resolves til konkret coffee socialPlace når data finnes", () => {
  const r = resolveLoc(MARIAM, "cafe", "work");
  assert.strictEqual(r.resolutionSource, "social_place_resolver");
  assert.strictEqual(r.socialPlaceType, "coffee");
  assert.strictEqual(r.resolvedFromLocationId, "cafe");
  assert.ok(eng.isConcreteSocialLocationId(r.locationId), "resolved locationId skal være konkret");
  assert.ok(["brand_place:plassen_a:java", "brand_place:plassen_b:fuglen"].includes(r.locationId));
  assert.ok(r.sourcePlaceId, "sourcePlaceId skal følge med");
  assert.ok(r.brandId, "brandId skal følge med");
});

check("culture resolves til konkret culture socialPlace", () => {
  const r = resolveLoc(MARIAM, "culture", "evening");
  assert.strictEqual(r.resolutionSource, "social_place_resolver");
  assert.strictEqual(r.socialPlaceType, "culture");
  assert.strictEqual(r.locationId, "brand_place:plassen_c:mono");
});

check("football resolves til konkret sport_football socialPlace", () => {
  const r = resolveLoc(SARA, "football", "leisure");
  assert.strictEqual(r.socialPlaceType, "sport_football");
  assert.strictEqual(r.locationId, "place:bislett_stadion");
  assert.strictEqual(r.sourcePlaceId, "bislett_stadion");
  assert.strictEqual(r.brandId, null);
});

check("store resolves til konkret retail_social socialPlace", () => {
  const r = resolveLoc(SARA, "store", "work");
  assert.strictEqual(r.socialPlaceType, "retail_social");
  assert.strictEqual(r.locationId, "brand_place:plassen_d:retro");
});

check("gym resolves til konkret sport/training-sted når det finnes", () => {
  const r = resolveLoc(JONAS, "gym", "evening");
  assert.strictEqual(r.socialPlaceType, "sport_football");
  assert.strictEqual(r.locationId, "place:bislett_stadion");
});

// ---------------------------------------------------------------------------
console.log("Beholdes uendret: system / hjem / konkret");

check("workplace beholdes som system/work-node", () => {
  const r = resolveLoc(JONAS, "workplace", "work");
  assert.strictEqual(r.resolutionSource, "system_node");
  assert.strictEqual(r.locationId, "workplace");
  assert.strictEqual(r.resolvedFromLocationId, null);
});

check("nav_office beholdes som systemnode", () => {
  const r = resolveLoc(ODA, "nav_office", "morning");
  assert.strictEqual(r.resolutionSource, "system_node");
  assert.strictEqual(r.locationId, "nav_office");
});

check("psychology_room beholdes som insight-node (system)", () => {
  const r = resolveLoc(SARA, "psychology_room", "reflection");
  assert.strictEqual(r.resolutionSource, "system_node");
  assert.strictEqual(r.locationId, "psychology_room");
});

check("friend_home_demo_* beholdes som friend_home", () => {
  const r = resolveLoc(ODA, "friend_home_demo_01", "evening");
  assert.strictEqual(r.resolutionSource, "friend_home");
  assert.strictEqual(r.locationId, "friend_home_demo_01");
});

check("konkret brand_place:* beholdes uendret", () => {
  const r = resolveLoc(MARIAM, "brand_place:plassen_a:java", "work");
  assert.strictEqual(r.resolutionSource, "concrete");
  assert.strictEqual(r.locationId, "brand_place:plassen_a:java");
  assert.strictEqual(r.resolvedFromLocationId, null);
  // Beriket fra context når stedet finnes i location-listen.
  assert.strictEqual(r.socialPlaceType, "coffee");
  assert.strictEqual(r.sourcePlaceId, "plassen_a");
});

check("konkret place:* beholdes uendret", () => {
  const r = resolveLoc(SARA, "place:bislett_stadion", "leisure");
  assert.strictEqual(r.resolutionSource, "concrete");
  assert.strictEqual(r.locationId, "place:bislett_stadion");
});

check("mangel på konkrete steder gir generisk fallback", () => {
  const emptyCtx = { socialPlaces: [], locations: baseLocations };
  const r = eng.resolveFriendPresenceLocation({ locationId: "cafe", phase: "work" }, MARIAM, emptyCtx);
  assert.strictEqual(r.resolutionSource, "generic_fallback");
  assert.strictEqual(r.locationId, "cafe");
  assert.strictEqual(r.resolvedFromLocationId, null);
});

check("resolveFriendMapPresence uten context er bakoverkompatibelt rått", () => {
  const snaps = [{ friendId: "friend_demo_01", snapshots: { work: { phase: "work",
    state: "at_cafe", locationId: "cafe", activity: "kaffe", visibleOnMap: true,
    socialAvailability: "open_to_contact" } } }];
  const p = eng.resolveFriendMapPresence(MARIAM, "work", snaps, 1);
  assert.strictEqual(p.locationId, "cafe", "generisk locationId beholdes uten context");
  assert.strictEqual(p.resolutionSource, undefined, "ingen resolution-felt uten context");
  assert.strictEqual(p.rawLocationId, undefined);
});

// ---------------------------------------------------------------------------
console.log("Determinisme (Del B)");

check("samme friendId + phase + generic locationId gir samme konkrete sted", () => {
  const a = resolveLoc(MARIAM, "cafe", "work").locationId;
  const b = resolveLoc(MARIAM, "cafe", "work").locationId;
  const c = resolveLoc(MARIAM, "cafe", "work").locationId;
  assert.strictEqual(a, b);
  assert.strictEqual(b, c);
});

check("ulike venner kan få ulike konkrete steder (samme generic+phase)", () => {
  const picks = new Set();
  for (let i = 0; i < 40; i += 1) {
    const f = { id: "synth_friend_" + i, name: "F" + i, role: "Barista" };
    picks.add(resolveLoc(f, "cafe", "work").locationId);
  }
  assert.ok(picks.size > 1, "minst to ulike kaffesteder skal velges på tvers av venner");
  picks.forEach((p) => assert.ok(eng.isConcreteSocialLocationId(p)));
});

check("rolle påvirker typevalg: Barista prioriterer coffee for cafe", () => {
  const types = eng.getPreferredSocialPlaceTypesForGeneric("cafe", MARIAM);
  assert.strictEqual(types[0], "coffee");
});

// ---------------------------------------------------------------------------
console.log("View-model: rawLocationId bevares, resolved locationId brukes");

check("buildResolvedFriendPresence bevarer rawLocationId og setter resolved", () => {
  const raw = { state: "at_work", locationId: "cafe", activity: "vakt", phase: "work", visibleOnMap: true };
  const vm2 = eng.buildResolvedFriendPresence(MARIAM, raw, CTX);
  assert.strictEqual(vm2.rawLocationId, "cafe");
  assert.ok(eng.isConcreteSocialLocationId(vm2.locationId));
  assert.strictEqual(vm2.resolvedFromLocationId, "cafe");
  assert.strictEqual(vm2.resolutionSource, "social_place_resolver");
  assert.strictEqual(vm2.socialPlaceType, "coffee");
  // Rå felt beholdes urørt.
  assert.strictEqual(vm2.state, "at_work");
  assert.strictEqual(vm2.activity, "vakt");
});

// ---------------------------------------------------------------------------
console.log("Snapshots (Del D)");

const FRIENDS = [MARIAM, SARA];
const SNAPSHOTS = [
  {
    friendId: "friend_demo_01",
    snapshots: {
      // konkret locationId i snapshot brukes direkte
      work: { phase: "work", state: "at_cafe", locationId: "brand_place:plassen_a:java",
        activity: "kaffe", visibleOnMap: true, socialAvailability: "open_to_contact" },
      // generisk locationId i snapshot kan resolves
      leisure: { phase: "leisure", state: "walking_in_city", locationId: "culture",
        activity: "kultur", visibleOnMap: true, socialAvailability: "open_to_contact" }
    }
  }
];

check("snapshot med konkret locationId brukes direkte", () => {
  const rows = eng.friendSnapshotRows([MARIAM], "work", SNAPSHOTS, 1, CTX);
  const p = rows[0].presence;
  assert.strictEqual(p.source, "snapshot");
  assert.strictEqual(p.locationId, "brand_place:plassen_a:java");
  assert.strictEqual(p.resolutionSource, "concrete");
  assert.strictEqual(p.rawLocationId, "brand_place:plassen_a:java");
});

check("snapshot med generisk locationId resolves til konkret socialPlace", () => {
  const rows = eng.friendSnapshotRows([MARIAM], "leisure", SNAPSHOTS, 1, CTX);
  const p = rows[0].presence;
  assert.strictEqual(p.source, "snapshot");
  assert.strictEqual(p.rawLocationId, "culture");
  assert.strictEqual(p.socialPlaceType, "culture");
  assert.strictEqual(p.locationId, "brand_place:plassen_c:mono");
});

check("fallback til presenceByPhase virker fortsatt (med resolving)", () => {
  // Sara har ingen snapshot -> fallback til presenceByPhase. afternoon=football.
  const saraFull = readJSON("data/Civication/map/friends.json").friends
    .find((f) => f.id === "friend_demo_03");
  const rows = eng.friendSnapshotRows([saraFull], "leisure", [], 1, CTX);
  const p = rows[0].presence;
  assert.strictEqual(p.source, "presence_fallback");
  assert.strictEqual(p.rawLocationId, "football");
  assert.strictEqual(p.locationId, "place:bislett_stadion");
});

// ---------------------------------------------------------------------------
console.log("Sosial møteflyt (Del F): møte krever samme resolved konkret sted");

check("samme phase + samme resolved konkret locationId gir møte", () => {
  // Kun ÉN kaffekandidat -> begge venner resolver til samme konkrete sted.
  const oneCoffee = [SOCIAL_PLACES[0]];
  const locs = eng.mergeSocialPlacesIntoLocations(baseLocations, oneCoffee);
  const ctx = { socialPlaces: oneCoffee };
  const friends = [
    { id: "m1", name: "M1", role: "Barista" },
    { id: "m2", name: "M2", role: "Barista" }
  ];
  const snaps = friends.map((f) => ({
    friendId: f.id,
    snapshots: { work: { phase: "work", state: "at_cafe", locationId: "cafe",
      activity: "kaffe", visibleOnMap: true, socialAvailability: "open_to_contact" } }
  }));
  const enc = eng.getSocialEncountersForLocation("work", "brand_place:plassen_a:java",
    { friends, snapshots: snaps, locations: locs, socialPlaces: ctx.socialPlaces, dayIndex: 1 });
  assert.strictEqual(enc.length, 2, "begge skal møtes på samme konkrete kaffested");
  assert.strictEqual(enc[0].locationId, "brand_place:plassen_a:java");
  assert.strictEqual(enc[0].socialPlaceType, "coffee");
  // Generisk node gir IKKE lenger møte når konkret sted finnes.
  const genEnc = eng.getSocialEncountersForLocation("work", "cafe",
    { friends, snapshots: snaps, locations: locs, socialPlaces: ctx.socialPlaces, dayIndex: 1 });
  assert.strictEqual(genEnc.length, 0, "generisk cafe-node skal ikke gi møte når resolved er konkret");
});

check("samme generisk rawLocationId alene gir IKKE møte når resolved er ulik", () => {
  // To kaffekandidater -> finn to venner som resolver til ULIKE steder.
  const twoCoffee = [SOCIAL_PLACES[0], SOCIAL_PLACES[1]];
  const locs = eng.mergeSocialPlacesIntoLocations(baseLocations, twoCoffee);
  const ctx = { socialPlaces: twoCoffee };
  let fa = null, fb = null;
  for (let i = 0; i < 200 && (!fa || !fb); i += 1) {
    const f = { id: "x" + i, name: "X" + i, role: "Barista" };
    const lid = eng.resolveFriendPresenceLocation({ locationId: "cafe", phase: "work" }, f, ctx).locationId;
    if (lid === "brand_place:plassen_a:java" && !fa) fa = f;
    else if (lid === "brand_place:plassen_b:fuglen" && !fb) fb = f;
  }
  assert.ok(fa && fb, "skal finne to venner med ulik resolved kaffe");
  const friends = [fa, fb];
  const snaps = friends.map((f) => ({
    friendId: f.id,
    snapshots: { work: { phase: "work", state: "at_cafe", locationId: "cafe",
      activity: "kaffe", visibleOnMap: true, socialAvailability: "open_to_contact" } }
  }));
  const encA = eng.getSocialEncountersForLocation("work", "brand_place:plassen_a:java",
    { friends, snapshots: snaps, locations: locs, socialPlaces: ctx.socialPlaces, dayIndex: 1 });
  assert.deepStrictEqual(encA.map((e) => e.friendId), [fa.id],
    "kun vennen som resolver til sted A skal møtes der");
});

check("Henvend deg bruker konkret locationId + blir PRIVAT melding (aldri jobb)", () => {
  const oneCoffee = [SOCIAL_PLACES[0]];
  const locs = eng.mergeSocialPlacesIntoLocations(baseLocations, oneCoffee);
  const friends = [{ id: "approach_f", name: "Ada Lin", role: "Barista" }];
  const snaps = [{ friendId: "approach_f", snapshots: { work: { phase: "work", state: "at_cafe",
    locationId: "cafe", activity: "kaffe", visibleOnMap: true, socialAvailability: "open_to_contact" } } }];
  const enc = eng.getSocialEncountersForLocation("work", "brand_place:plassen_a:java",
    { friends, snapshots: snaps, locations: locs, socialPlaces: oneCoffee, dayIndex: 1 })[0];
  assert.ok(enc, "møtet skal finnes");
  assert.strictEqual(enc.locationId, "brand_place:plassen_a:java");

  const bridged = bridge.handleCivicationFriendMessageAction({ ok: true, action: "approach", model: enc });
  assert.strictEqual(bridged.ok, true);
  assert.strictEqual(bridged.channel, "private");
  const m = bridged.message;
  assert.strictEqual(m.channel, "private");
  assert.strictEqual(m.locationId, "brand_place:plassen_a:java");
  assert.strictEqual(m.sourcePlaceId, "plassen_a");
  assert.strictEqual(m.brandId, "java");
  assert.strictEqual(m.socialPlaceType, "coffee");
  // Aldri jobb-/karrierefelt.
  assert.strictEqual(m.career_id, undefined);
  assert.strictEqual(m.role_key, undefined);
  assert.strictEqual(m.brand_id, undefined);
  // Registrert som privat melding, ikke jobbmail.
  assert.strictEqual(sentMails.length, 1);
  assert.strictEqual(channels.isJobMail(sentMails[0]), false);
  assert.strictEqual(channels.isPrivateMessage(sentMails[0]), true);
});

check("handleFriendAction(approach) fra profilkort bruker resolved konkret sted", () => {
  const friends = [MARIAM];
  const snaps = [{ friendId: "friend_demo_01", snapshots: { work: { phase: "work",
    state: "at_cafe", locationId: "cafe", activity: "kaffe", visibleOnMap: true,
    socialAvailability: "open_to_contact" } } }];
  const res = eng.handleFriendAction("approach", "friend_demo_01", {
    phase: "work", friends, snapshots: snaps, locations: mergedLocations,
    socialPlaces: SOCIAL_PLACES, dayIndex: 1
  });
  assert.strictEqual(res.ok, true);
  assert.ok(eng.isConcreteSocialLocationId(res.model.locationId),
    "approach-modellen skal peke på konkret sted");
  assert.strictEqual(res.model.socialPlaceType, "coffee");
  assert.ok(res.model.sourcePlaceId, "sourcePlaceId skal følge med henvendelsen");
});

// ---------------------------------------------------------------------------
console.log("Debug-hjelper");

check("getFriendPresenceResolutionDebug returnerer resolution-deskriptor", () => {
  const dbg = eng.getFriendPresenceResolutionDebug("friend_demo_99", "work");
  assert.strictEqual(dbg.found, false);
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
