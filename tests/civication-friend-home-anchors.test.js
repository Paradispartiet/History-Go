#!/usr/bin/env node
// tests/civication-friend-home-anchors.test.js
//
// Audit + modelltest for venners hjem og kartankere (Del D/E):
//   - alle friends med avatar.homeId har en tilsvarende phaseLocation
//   - home location har type friend_home, mapZone og position
//   - kjente koblinger (Mariam/Jonas/Sara/Oda) stemmer
//   - delt demo-hjem (Oda deler friend_home_demo_01 med Mariam) rapporteres trygt
//   - buildFriendHomeModel merker hjemmet som simulert (ikke ekte adresse/GPS)
//   - alle CityLayer-locations kan løses til et kartanker (position eller mapZone)
//
// Kjør:  node tests/civication-friend-home-anchors.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

function loadEngine() {
  const sandboxWindow = { addEventListener() {} };
  global.window = sandboxWindow;
  global.document = { readyState: "complete", getElementById: () => null, addEventListener: () => {} };
  global.fetch = () => Promise.reject(new Error("fetch not available in test"));
  vm.runInThisContext(
    fs.readFileSync(path.join(repoRoot, "js/Civication/systems/civicationFriendsEngine.js"), "utf8"),
    { filename: "civicationFriendsEngine.js" }
  );
  return sandboxWindow.CivicationFriendsEngine;
}

const eng = loadEngine();
const locations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
const friends = readJSON("data/Civication/map/friends.json").friends;

// Bydeler (mapZone-fallback-anker). Minimal stub som matcher zonene i dataene.
const DISTRICT_CENTERS = {
  sagene: [0.50, 0.40], gamle_oslo: [0.61, 0.66], st_hanshaugen: [0.43, 0.50],
  frogner: [0.31, 0.46], nordstrand: [0.75, 0.78], stovner: [0.83, 0.34],
  grunerlokka: [0.55, 0.45], sentrum: [0.51, 0.60]
};

let failures = 0;
function check(name, fn) {
  try { fn(); console.log("  ok  -", name); }
  catch (e) { failures += 1; console.error("FAIL  -", name); console.error("       ", e && e.message); }
}

console.log("Civication – venners hjem (audit, Del D/E)");

check("alle friends har avatar.homeId", () => {
  friends.forEach((f) => assert.ok(eng.getFriendHomeId(f), f.id + " mangler homeId"));
});

check("hver homeId finnes som phaseLocation av type friend_home med mapZone + position", () => {
  friends.forEach((f) => {
    const loc = eng.getFriendHomeLocation(f, locations);
    assert.ok(loc, f.id + ": homeId peker ikke til en phaseLocation");
    assert.ok(eng.isFriendHomeLocation(loc), f.id + ": hjem er ikke type friend_home (" + loc.type + ")");
    assert.ok(loc.mapZone, f.id + ": hjem mangler mapZone");
    assert.ok(loc.position && typeof loc.position.x === "number" && typeof loc.position.y === "number",
      f.id + ": hjem mangler position");
  });
});

check("kjente hjem-koblinger stemmer (Mariam/Jonas/Sara/Oda)", () => {
  const byId = new Map(friends.map((f) => [f.id, f]));
  const expect = {
    friend_demo_01: "friend_home_demo_01", // Mariam
    friend_demo_02: "friend_home_demo_02", // Jonas
    friend_demo_03: "friend_home_demo_03", // Sara
    friend_demo_04: "friend_home_demo_01"  // Oda – deler med Mariam
  };
  Object.entries(expect).forEach(([fid, homeId]) => {
    assert.strictEqual(eng.getFriendHomeId(byId.get(fid)), homeId, fid + " feil homeId");
  });
});

check("delt demo-hjem rapporteres trygt som shared demo home", () => {
  const byHome = {};
  friends.forEach((f) => {
    const id = eng.getFriendHomeId(f);
    (byHome[id] = byHome[id] || []).push(f.id);
  });
  const shared = Object.keys(byHome).filter((h) => byHome[h].length > 1);
  // Oda + Mariam deler friend_home_demo_01.
  assert.deepStrictEqual(byHome.friend_home_demo_01.sort(), ["friend_demo_01", "friend_demo_04"]);
  assert.ok(shared.includes("friend_home_demo_01"), "delt demo-hjem skal kunne identifiseres");
});

check("buildFriendHomeModel merker hjemmet som simulert (ikke ekte adresse/GPS)", () => {
  const mariam = friends.find((f) => f.id === "friend_demo_01");
  const model = eng.buildFriendHomeModel(mariam, locations);
  assert.strictEqual(model.homeId, "friend_home_demo_01");
  assert.strictEqual(model.label, "Mariams hjem");
  assert.strictEqual(model.mapZone, "grunerlokka");
  assert.deepStrictEqual(model.position, { x: 0.57, y: 0.49 });
  assert.strictEqual(model.anchorType, "simulated_home");
  assert.strictEqual(model.isPrivateRealAddress, false);
  assert.strictEqual(model.visibility, "game_only");
  assert.strictEqual(model.found, true);
  assert.strictEqual(model.isFriendHome, true);
  assert.strictEqual(model.hasPosition, true);
});

check("buildFriendHomeModel håndterer manglende/feil homeId trygt", () => {
  const ghost = { id: "ghost_01", name: "Nora Vik", avatar: { homeId: "does_not_exist" } };
  const model = eng.buildFriendHomeModel(ghost, locations);
  assert.strictEqual(model.found, false);
  assert.strictEqual(model.isPrivateRealAddress, false, "skal aldri flagges som ekte adresse");
  assert.strictEqual(model.position, null);

  const noHome = { id: "ghost_02", name: "Per", avatar: {} };
  const m2 = eng.buildFriendHomeModel(noHome, locations);
  assert.strictEqual(m2.homeId, null);
  assert.strictEqual(m2.found, false);
});

console.log("Civication – kartankere for alle phaseLocations (Del E)");

check("hver phaseLocation kan løses til et kartanker (position eller mapZone-senter)", () => {
  const missing = [];
  locations.forEach((loc) => {
    const hasPos = loc.position && typeof loc.position.x === "number" && typeof loc.position.y === "number";
    const hasZone = !!(loc.mapZone && DISTRICT_CENTERS[loc.mapZone]);
    if (!hasPos && !hasZone) missing.push(loc.id);
  });
  assert.deepStrictEqual(missing, [], "locations uten anker: " + missing.join(", "));
});

check("friend_home_demo_* forankres via loc.position", () => {
  ["friend_home_demo_01", "friend_home_demo_02", "friend_home_demo_03"].forEach((id) => {
    const loc = eng.locationById(locations, id);
    assert.ok(loc, "mangler " + id);
    assert.ok(loc.position && typeof loc.position.x === "number", id + " mangler position");
  });
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
