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
