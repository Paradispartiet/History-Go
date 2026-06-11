#!/usr/bin/env node
// tests/civication-player-phase-snapshots.test.js
//
// Validerer SPILLERENS eget fase-minne (player phase snapshots) i
// CivicationFriendsEngine:
//   - spilleren kan lagre/hente eget snapshot pr. semantisk fase
//   - ny lagring overskriver KUN samme fase, ikke alle faser
//   - snapshot bygges deterministisk fra aktiv fase + nåværende tilstand
//   - formatet er kompatibelt med friend snapshot-formatet
//   - manglende snapshot håndteres trygt
//   - localStorage speiles når tilgjengelig, og minne-fallback virker uten
//   - INGEN GPS/live-tracking-felter introduseres
//
// Kjør:  node tests/civication-player-phase-snapshots.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

// Laster en fersk motor-instans i et eget sandbox-window. Et valgfritt
// localStorage-objekt kan injiseres for å teste persistens.
function loadEngine(win) {
  const sandboxWindow = win || {};
  global.window = sandboxWindow;
  global.fetch = () => Promise.reject(new Error("fetch not available in test"));
  const code = fs.readFileSync(
    path.join(repoRoot, "js/Civication/systems/civicationFriendsEngine.js"),
    "utf8"
  );
  vm.runInThisContext(code, { filename: "civicationFriendsEngine.js" });
  assert.ok(sandboxWindow.CivicationFriendsEngine, "CivicationFriendsEngine skal eksporteres");
  return sandboxWindow.CivicationFriendsEngine;
}

// Enkelt localStorage-stub for å teste persistens uten nettleser.
function makeLocalStorage() {
  const store = {};
  return {
    _store: store,
    getItem: (k) => (Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };
}

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log("  ok  -", name);
  } catch (e) {
    failures += 1;
    console.error("FAIL  -", name);
    console.error("       ", e && e.message);
  }
}

const locationsData = readJSON("data/Civication/map/phaseLocations.json");
const snapshotsData = readJSON("data/Civication/map/friendPhaseSnapshots.json");
const locationIds = new Set(locationsData.phaseLocations.map((l) => l.id));

// Feltene som et friend snapshot bruker – spillerens snapshot skal være et
// superset av disse (samme form + evt. channel/type på toppen).
const FRIEND_SNAPSHOT_KEYS = ["phase", "state", "locationId", "activity", "mood", "updatedAtLabel", "visibleOnMap"];

console.log("CivicationFriendsEngine – spillerens eget fase-minne");

const eng = loadEngine();
eng.clearPlayerPhaseSnapshotsForTesting();

check("buildPlayerSnapshotFromCurrentState matcher morgen-eksempelet (deterministisk)", () => {
  const snap = eng.buildPlayerSnapshotFromCurrentState("morning", { state: "at_home", locationId: "home" });
  assert.strictEqual(snap.phase, "morning");
  assert.strictEqual(snap.state, "at_home");
  assert.strictEqual(snap.locationId, "home");
  assert.strictEqual(snap.activity, "starter dagen hjemme");
  assert.strictEqual(snap.mood, "rolig");
  assert.strictEqual(snap.updatedAtLabel, "sist morgenrunde");
  assert.strictEqual(snap.visibleOnMap, true);
  // Samme input -> samme output.
  const again = eng.buildPlayerSnapshotFromCurrentState("morning", { state: "at_home", locationId: "home" });
  assert.deepStrictEqual(snap, again);
});

check("buildPlayerSnapshotFromCurrentState matcher arbeids-eksempelet", () => {
  const snap = eng.buildPlayerSnapshotFromCurrentState("work");
  assert.strictEqual(snap.phase, "work");
  assert.strictEqual(snap.state, "at_work");
  assert.strictEqual(snap.locationId, "workplace");
  assert.strictEqual(snap.activity, "jobber med dagens oppgaver");
  assert.strictEqual(snap.mood, "fokusert");
  assert.strictEqual(snap.updatedAtLabel, "sist arbeidsrunde");
});

check("buildPlayerSnapshotFromCurrentState bruker eksisterende dagfase som kilde (lunch -> work)", () => {
  const snap = eng.buildPlayerSnapshotFromCurrentState("lunch");
  assert.strictEqual(snap.phase, "work");
});

check("standard locationId-er peker til ekte steder i phaseLocations.json", () => {
  ["morning", "work", "leisure", "evening", "reflection"].forEach((phase) => {
    const snap = eng.buildPlayerSnapshotFromCurrentState(phase);
    assert.ok(locationIds.has(snap.locationId), `${phase}: ukjent locationId ${snap.locationId}`);
  });
});

check("savePlayerSnapshotForPhase + getPlayerSnapshotForPhase lagrer og henter pr. fase", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const saved = eng.savePlayerSnapshotForPhase("morning", {
    state: "at_home", locationId: "home", activity: "lager frokost", mood: "rolig"
  });
  assert.strictEqual(saved.phase, "morning");
  const got = eng.getPlayerSnapshotForPhase("morning");
  assert.strictEqual(got.locationId, "home");
  assert.strictEqual(got.activity, "lager frokost");
});

check("ny lagring overskriver KUN samme fase, ikke alle faser", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  eng.savePlayerSnapshotForPhase("morning", { state: "at_home", locationId: "home", activity: "morgen" });
  eng.savePlayerSnapshotForPhase("work", { state: "at_work", locationId: "workplace", activity: "jobb" });
  // Overskriv morning på nytt.
  eng.savePlayerSnapshotForPhase("morning", { state: "at_home", locationId: "home", activity: "ny morgen" });

  const all = eng.getPlayerPhaseSnapshots();
  assert.strictEqual(all.morning.activity, "ny morgen", "morning skal være oppdatert");
  assert.ok(all.work, "work skal fortsatt finnes");
  assert.strictEqual(all.work.activity, "jobb", "work skal være uendret");
  assert.deepStrictEqual(Object.keys(all).sort(), ["morning", "work"]);
});

check("formatet er kompatibelt med friend snapshot-formatet", () => {
  const friendSnap = snapshotsData.friendPhaseSnapshots[0].snapshots.morning;
  const playerSnap = eng.buildPlayerSnapshotFromCurrentState("morning");
  FRIEND_SNAPSHOT_KEYS.forEach((key) => {
    assert.ok(Object.prototype.hasOwnProperty.call(friendSnap, key), `friend mangler ${key}`);
    assert.ok(Object.prototype.hasOwnProperty.call(playerSnap, key), `player mangler ${key}`);
    assert.strictEqual(typeof playerSnap[key], typeof friendSnap[key], `ulik type for ${key}`);
  });
});

check("manglende snapshot håndteres trygt (null)", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  assert.strictEqual(eng.getPlayerSnapshotForPhase("evening"), null);
  assert.deepStrictEqual(eng.getPlayerPhaseSnapshots(), {});
});

check("capturePlayerPhaseSnapshot lagrer for eksplisitt fase", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const snap = eng.capturePlayerPhaseSnapshot({ locationId: "park" }, "leisure");
  assert.strictEqual(snap.phase, "leisure");
  assert.strictEqual(snap.locationId, "park");
  assert.ok(eng.getPlayerSnapshotForPhase("leisure"));
});

check("skjult tilstand gir visibleOnMap=false", () => {
  const snap = eng.buildPlayerSnapshotFromCurrentState("evening", { state: "offline_simulated" });
  assert.strictEqual(snap.visibleOnMap, false);
});

check("INGEN GPS/live-tracking-felter i player snapshot", () => {
  const forbidden = new Set([
    "lat", "lng", "latitude", "longitude", "gps", "geo", "coords", "coordinate",
    "livelocation", "realtime", "timestampms", "currentlocation", "islive", "tracking"
  ]);
  const snap = eng.buildPlayerSnapshotFromCurrentState("morning");
  Object.keys(snap).forEach((key) => {
    assert.ok(!forbidden.has(key.toLowerCase()), `forbudt felt: ${key}`);
  });
});

const playerChoiceSocialPlaces = [
  { id: "brand_place:universitetsplassen:fuglen", locationId: "brand_place:universitetsplassen:fuglen", sourcePlaceId: "universitetsplassen", brandId: "fuglen", socialPlaceType: "coffee", label: "Fuglen", placeLabel: "Universitetsplassen", type: "cafe", channel: "social", phaseAffinity: ["morning", "leisure", "evening"], activePhases: ["lunch", "afternoon", "evening"] },
  { id: "brand_place:st_hanshaugen:java", locationId: "brand_place:st_hanshaugen:java", sourcePlaceId: "st_hanshaugen", brandId: "java", socialPlaceType: "coffee", label: "Java Kaffebar", placeLabel: "St. Hanshaugen park", type: "cafe", channel: "social", phaseAffinity: ["morning", "leisure", "evening"], activePhases: ["lunch", "afternoon", "evening"] },
  { id: "place:st_hanshaugen_park", locationId: "place:st_hanshaugen_park", sourcePlaceId: "st_hanshaugen_park", brandId: null, socialPlaceType: "park_public_space", label: "St. Hanshaugen park", placeLabel: "St. Hanshaugen park", type: "park", channel: "social", phaseAffinity: ["leisure", "evening", "reflection"], activePhases: ["afternoon", "evening"] },
  { id: "brand_place:youngstorget:kulturhuset", locationId: "brand_place:youngstorget:kulturhuset", sourcePlaceId: "youngstorget", brandId: "kulturhuset", socialPlaceType: "culture", label: "Kulturhuset", placeLabel: "Youngstorget", type: "culture", channel: "social", phaseAffinity: ["leisure", "evening", "reflection"], activePhases: ["afternoon", "evening", "day_end"] },
  { id: "place:bislett_stadion", locationId: "place:bislett_stadion", sourcePlaceId: "bislett_stadion", brandId: null, socialPlaceType: "sport_football", label: "Bislett stadion", placeLabel: "Bislett stadion", type: "training", channel: "social", phaseAffinity: ["leisure", "evening"], activePhases: ["afternoon", "evening"] }
];
const playerChoiceLocations = eng.mergeSocialPlacesIntoLocations(locationsData.phaseLocations, playerChoiceSocialPlaces);
const playerChoiceContext = { locations: playerChoiceLocations, socialPlaces: playerChoiceSocialPlaces };

check("getPlayerConcreteChoicesForPhase returnerer konkrete socialPlaces for relevante faser", () => {
  const choices = eng.getPlayerConcreteChoicesForPhase("leisure", playerChoiceContext);
  assert.ok(choices.some((c) => c.locationId === "brand_place:universitetsplassen:fuglen"));
  assert.ok(choices.some((c) => c.locationId === "place:st_hanshaugen_park"));
  assert.ok(choices.every((c) => c.choiceId.indexOf("go:") === 0));
});

check("coffee choices vises i lunch, leisure og evening via activePhases/phaseAffinity", () => {
  ["lunch", "leisure", "evening"].forEach((phase) => {
    const coffee = eng.getPlayerSocialPlaceChoicesForPhase(phase, playerChoiceContext)
      .filter((c) => c.socialPlaceType === "coffee");
    assert.ok(coffee.length >= 2, phase + " skal ha kaffesteder");
  });
});

check("culture, park og sport vises i riktige sosialfaser", () => {
  const evening = eng.getPlayerSocialPlaceChoicesForPhase("evening", playerChoiceContext);
  assert.ok(evening.some((c) => c.socialPlaceType === "culture"));
  assert.ok(evening.some((c) => c.socialPlaceType === "park_public_space"));
  assert.ok(evening.some((c) => c.socialPlaceType === "sport_football"));
  const afternoon = eng.getPlayerSocialPlaceChoicesForPhase("afternoon", playerChoiceContext);
  assert.ok(afternoon.some((c) => c.socialPlaceType === "sport_football"));
});

check("systemnoder kan fortsatt velges etter fase", () => {
  const morning = eng.getPlayerSystemChoicesForPhase("morning", playerChoiceContext);
  assert.ok(morning.some((c) => c.locationId === "home"));
  assert.ok(morning.some((c) => c.locationId === "workplace"));
  assert.ok(morning.some((c) => c.locationId === "psychology_room"));
  const dayEnd = eng.getPlayerSystemChoicesForPhase("day_end", playerChoiceContext);
  assert.ok(dayEnd.some((c) => c.locationId === "psychology_room"));
});

check("choice label er norsk og stabil", () => {
  const choice = eng.getPlayerSocialPlaceChoicesForPhase("leisure", playerChoiceContext)
    .find((c) => c.locationId === "brand_place:universitetsplassen:fuglen");
  assert.strictEqual(choice.label, "Gå til Fuglen");
  assert.strictEqual(choice.subtitle, "Kaffe · Universitetsplassen");
  assert.strictEqual(eng.buildPlayerPhaseChoiceLabel(choice), "Gå til Fuglen");
});

check("player choice view-model grupperer konkrete steder, systemvalg og hjem/arbeid", () => {
  const model = eng.buildPlayerPhaseChoiceModel("morning", playerChoiceContext);
  const groups = new Map(model.groups.map((g) => [g.id, g]));
  assert.ok(groups.has("concrete"), "konkrete steder-gruppe mangler");
  assert.ok(groups.has("system"), "systemvalg-gruppe mangler");
  assert.ok(groups.has("home_work"), "hjem/arbeid-gruppe mangler");
  assert.ok(groups.get("concrete").choices.some((c) => c.displayLabel === "Fuglen" && c.subtitle === "Kaffe · Universitetsplassen"));
  assert.ok(groups.get("system").choices.some((c) => c.locationId === "psychology_room" && c.subtitle === "Innsikt · AHA"));
  assert.ok(groups.get("home_work").choices.some((c) => c.locationId === "home"));
});

check("fallback vises som kategoriinngang bare når konkrete steder mangler", () => {
  const withReal = eng.buildPlayerPhaseChoiceModel("leisure", playerChoiceContext);
  const withRealFallbacks = (withReal.groups.find((g) => g.id === "fallback") || { choices: [] }).choices;
  assert.ok(!withRealFallbacks.some((c) => ["cafe", "park", "football", "culture", "gym"].includes(c.locationId)),
    "fallback skal ikke konkurrere med konkrete steder av samme type");
  const withoutReal = eng.buildPlayerPhaseChoiceModel("leisure", { locations: locationsData.phaseLocations, socialPlaces: [] });
  const fallback = withoutReal.groups.find((g) => g.id === "fallback");
  assert.ok(fallback, "fallback-gruppe skal finnes uten konkrete steder");
  assert.ok(fallback.choices.some((c) => c.kind === "social_fallback" && /Kategoriinngang/.test(c.subtitle)));
});

check("fallback uten konkrete steder kan fortsatt lagres generisk", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const result = eng.applyPlayerPhaseChoice("go:cafe", { locations: locationsData.phaseLocations, socialPlaces: [], phase: "leisure" });
  assert.ok(result && result.snapshot, "fallback-valg skal gi snapshot");
  assert.strictEqual(result.snapshot.locationId, "cafe");
  assert.strictEqual(result.snapshot.state, "at_cafe");
  assert.strictEqual(result.snapshot.socialAvailability, "open_to_contact");
});

check("valg av brand_place:* lagrer concrete locationId og stedskontekst", () => {
  eng.clearPlayerPhaseSnapshotsForTesting();
  const result = eng.applyPlayerPhaseChoice("go:brand_place:universitetsplassen:fuglen", { ...playerChoiceContext, phase: "leisure" });
  assert.ok(result && result.snapshot);
  assert.strictEqual(result.snapshot.phase, "leisure");
  assert.strictEqual(result.snapshot.state, "at_social_place");
  assert.strictEqual(result.snapshot.locationId, "brand_place:universitetsplassen:fuglen");
  assert.strictEqual(result.snapshot.rawLocationId, null);
  assert.strictEqual(result.snapshot.sourcePlaceId, "universitetsplassen");
  assert.strictEqual(result.snapshot.brandId, "fuglen");
  assert.strictEqual(result.snapshot.socialPlaceType, "coffee");
  assert.strictEqual(result.snapshot.activity, "går til Fuglen");
  assert.strictEqual(result.snapshot.socialAvailability, "open_to_contact");
  assert.strictEqual(result.snapshot.visibleOnMap, true);
});

check("valg av place:* lagrer sourcePlaceId og socialPlaceType", () => {
  const result = eng.applyPlayerPhaseChoice("go:place:st_hanshaugen_park", { ...playerChoiceContext, phase: "evening" });
  assert.strictEqual(result.snapshot.locationId, "place:st_hanshaugen_park");
  assert.strictEqual(result.snapshot.sourcePlaceId, "st_hanshaugen_park");
  assert.strictEqual(result.snapshot.brandId, undefined);
  assert.strictEqual(result.snapshot.socialPlaceType, "park_public_space");
});

check("valg av systemnode lagrer system locationId", () => {
  const result = eng.applyPlayerPhaseChoice("go:psychology_room", { ...playerChoiceContext, phase: "reflection" });
  assert.strictEqual(result.snapshot.state, "at_system_node");
  assert.strictEqual(result.snapshot.locationId, "psychology_room");
  assert.strictEqual(result.snapshot.activity, "går til Psykologirommet");
  assert.strictEqual(result.snapshot.visibleOnMap, true);
});

check("localStorage speiles når tilgjengelig", () => {
  const ls = makeLocalStorage();
  const engLs = loadEngine({ localStorage: ls });
  engLs.savePlayerSnapshotForPhase("morning", { state: "at_home", locationId: "home", activity: "persist" });
  const raw = ls.getItem("civi.playerPhaseSnapshots.v1");
  assert.ok(raw, "skal ha skrevet til localStorage");
  const parsed = JSON.parse(raw);
  assert.strictEqual(parsed.morning.activity, "persist");
});

check("minne-fallback virker uten localStorage", () => {
  const engMem = loadEngine({}); // ingen localStorage
  engMem.savePlayerSnapshotForPhase("work", { state: "at_work", locationId: "workplace", activity: "kun minne" });
  assert.strictEqual(engMem.getPlayerSnapshotForPhase("work").activity, "kun minne");
});

check("clearPlayerPhaseSnapshotsForTesting nullstiller alt", () => {
  eng.savePlayerSnapshotForPhase("morning", { locationId: "home" });
  eng.clearPlayerPhaseSnapshotsForTesting();
  assert.deepStrictEqual(eng.getPlayerPhaseSnapshots(), {});
});

console.log("CivicationFriendsEngine – friend-fase-minne fungerer fortsatt");

check("friend snapshot velges fortsatt for aktiv fase", () => {
  const friends = readJSON("data/Civication/map/friends.json").friends;
  const snapshots = snapshotsData.friendPhaseSnapshots;
  const mariam = friends.find((f) => f.id === "friend_demo_01");
  const p = eng.resolveFriendMapPresence(mariam, "leisure", snapshots, 1);
  assert.strictEqual(p.source, "snapshot");
  assert.strictEqual(p.locationId, "park");
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
