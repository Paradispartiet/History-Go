#!/usr/bin/env node
// tests/civication-friends-phases.test.js
//
// Validerer den datadrevne, deterministiske venne-/fasepunkt-modellen for
// Civication-byen:
//   - data/Civication/map/phaseLocations.json + friends.json er gyldig JSON
//     med forventet struktur, og referanser (homeId / locationId) peker til
//     ekte steder.
//   - js/Civication/systems/civicationFriendsEngine.js lastes (med stubbede
//     browser-globaler) og de rene funksjonene gir deterministisk, forventet
//     oppførsel – samme input gir samme output.
//
// Kjør:  node tests/civication-friends-phases.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

function loadEngine() {
  // Minimal browser-stubbing: engine-IIFE-en bruker window/fetch/console.
  const sandboxWindow = {};
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
const friendsData = readJSON("data/Civication/map/friends.json");
const locations = locationsData.phaseLocations;
const friends = friendsData.friends;
const locationIds = new Set(locations.map((l) => l.id));

const eng = loadEngine();

console.log("phaseLocations.json + friends.json struktur");

check("phaseLocations er en ikke-tom array", () => {
  assert.ok(Array.isArray(locations) && locations.length > 0);
});

check("hvert sted har id, label, type, position og availableActivities", () => {
  locations.forEach((loc) => {
    assert.ok(loc.id, "id mangler");
    assert.ok(loc.label, `label mangler for ${loc.id}`);
    assert.ok(loc.type, `type mangler for ${loc.id}`);
    assert.ok(loc.position && typeof loc.position.x === "number" && typeof loc.position.y === "number",
      `position mangler/ugyldig for ${loc.id}`);
    assert.ok(Array.isArray(loc.availableActivities), `availableActivities mangler for ${loc.id}`);
  });
});

check("kjernesteder finnes (home, workplace, cafe, psychology_room, nav_office)", () => {
  ["home", "workplace", "cafe", "psychology_room", "nav_office"].forEach((id) => {
    assert.ok(locationIds.has(id), `mangler sted: ${id}`);
  });
});

check("friends er en ikke-tom array med påkrevde felt", () => {
  assert.ok(Array.isArray(friends) && friends.length > 0);
  friends.forEach((f) => {
    assert.ok(f.id, "friend.id mangler");
    assert.ok(f.name, `name mangler for ${f.id}`);
    assert.ok(f.role, `role mangler for ${f.id}`);
    assert.ok(f.avatar && typeof f.avatar === "object", `avatar mangler for ${f.id}`);
    assert.ok(f.presenceByPhase && typeof f.presenceByPhase === "object", `presenceByPhase mangler for ${f.id}`);
  });
});

check("alle avatar.homeId peker til et ekte sted", () => {
  friends.forEach((f) => {
    assert.ok(locationIds.has(f.avatar.homeId), `${f.id}: ukjent homeId ${f.avatar.homeId}`);
  });
});

check("alle presence.locationId peker til et ekte sted", () => {
  friends.forEach((f) => {
    Object.entries(f.presenceByPhase).forEach(([phase, p]) => {
      assert.ok(locationIds.has(p.locationId), `${f.id}/${phase}: ukjent locationId ${p.locationId}`);
    });
  });
});

console.log("CivicationFriendsEngine – rene, deterministiske funksjoner");

check("presenceText gir norske statustekster", () => {
  assert.strictEqual(eng.presenceText("at_home"), "Er hjemme");
  assert.strictEqual(eng.presenceText("at_work"), "Er på jobb");
  assert.strictEqual(eng.presenceText("walking_in_city"), "Går rundt i byen");
  assert.strictEqual(eng.presenceText("training"), "Trener");
});

check("computePresence leser eksplisitt presenceByPhase", () => {
  const mariam = friends.find((f) => f.id === "friend_demo_01");
  const p = eng.computePresence(mariam, "morning", 1);
  assert.strictEqual(p.state, "at_home");
  assert.strictEqual(p.locationId, "friend_home_demo_01");
  assert.strictEqual(p.statusText, "Er hjemme");
  assert.strictEqual(p.visibleOnMap, true);
});

check("computePresence er deterministisk (samme input -> samme output)", () => {
  const sara = friends.find((f) => f.id === "friend_demo_03");
  const a = eng.computePresence(sara, "afternoon", 1);
  const b = eng.computePresence(sara, "afternoon", 1);
  assert.deepStrictEqual(a, b);
});

check("skjulte tilstander (unavailable/offline) gir visibleOnMap=false", () => {
  const oda = friends.find((f) => f.id === "friend_demo_04");
  const lunch = eng.computePresence(oda, "lunch", 1);
  assert.strictEqual(lunch.state, "unavailable");
  assert.strictEqual(lunch.visibleOnMap, false);
  const end = eng.computePresence(oda, "day_end", 1);
  assert.strictEqual(end.state, "offline_simulated");
  assert.strictEqual(end.visibleOnMap, false);
});

check("activeLocations følger activePhases (store kun om ettermiddagen)", () => {
  const morningIds = eng.activeLocations(locations, "morning").map((l) => l.id);
  assert.ok(morningIds.includes("home"), "home skal være aktiv om morgenen");
  assert.ok(!morningIds.includes("store"), "store skal IKKE være aktiv om morgenen");
  const afternoonIds = eng.activeLocations(locations, "afternoon").map((l) => l.id);
  assert.ok(afternoonIds.includes("store"), "store skal være aktiv om ettermiddagen");
});

check("psychology_room og nav_office er alltid aktive", () => {
  ["morning", "lunch", "afternoon", "evening", "day_end"].forEach((phase) => {
    const ids = eng.activeLocations(locations, phase).map((l) => l.id);
    assert.ok(ids.includes("psychology_room"), `psychology_room mangler i ${phase}`);
    assert.ok(ids.includes("nav_office"), `nav_office mangler i ${phase}`);
  });
});

check("friendsAtLocation finner synlige venner på et sted i en fase", () => {
  // Mariam jobber på kaféen om ettermiddagen.
  const atCafe = eng.friendsAtLocation(friends, "cafe", "afternoon", 1).map((r) => r.friend.id);
  assert.ok(atCafe.includes("friend_demo_01"), "Mariam skal være på kaféen om ettermiddagen");
  // Sara besøker spilleren hjemme om kvelden.
  const atHome = eng.friendsAtLocation(friends, "home", "evening", 1).map((r) => r.friend.id);
  assert.ok(atHome.includes("friend_demo_03"), "Sara skal besøke spilleren hjemme om kvelden");
  // Oda er unavailable om lunsj -> ikke synlig på arbeidsplassen.
  const atWork = eng.friendsAtLocation(friends, "workplace", "lunch", 1).map((r) => r.friend.id);
  assert.ok(!atWork.includes("friend_demo_04"), "Oda (unavailable) skal ikke vises på kartet");
});

if (failures > 0) {
  console.error(`\n${failures} sjekk(er) feilet.`);
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
