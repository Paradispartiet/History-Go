#!/usr/bin/env node
// tests/civication-city-place-role-classes.test.js
//
// Validerer at CivicationCityLayer legger tydelige rolleklasser og semantiske
// data-attributter på stedsmarkørene (Del A), slik at systemnoder, ekte steder,
// venners hjem og generiske fallback-noder fremstår som forskjellige ting:
//   - buildPlaceClassList gir is-role-* klasse fra getLocationRole
//     (system-node / player-home / work-node / insight-node / friend-home /
//      social-place / social-fallback)
//   - buildPlaceDataAttrs setter data-location-role alltid, og
//     data-social-place-type / data-source-place-id / data-brand-id KUN for
//     ekte sosiale steder
//   - getPlacerole-wrapperen faller trygt tilbake på id/type uten motoren.
//
// Kjør:  node tests/civication-city-place-role-classes.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function readJSON(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

function loadModules() {
  const sandboxWindow = { addEventListener() {} };
  global.window = sandboxWindow;
  global.document = {
    readyState: "complete",
    getElementById: () => null,
    querySelector: () => null,
    addEventListener: () => {},
    createElement: () => ({ className: "", style: {}, setAttribute() {}, appendChild() {}, querySelector: () => null })
  };
  global.requestAnimationFrame = () => 0;
  global.fetch = () => Promise.reject(new Error("fetch not available in test"));

  vm.runInThisContext(
    fs.readFileSync(path.join(repoRoot, "js/Civication/systems/civicationFriendsEngine.js"), "utf8"),
    { filename: "civicationFriendsEngine.js" }
  );
  vm.runInThisContext(
    fs.readFileSync(path.join(repoRoot, "js/Civication/ui/CivicationCityLayer.js"), "utf8"),
    { filename: "CivicationCityLayer.js" }
  );

  assert.ok(sandboxWindow.CivicationFriendsEngine, "CivicationFriendsEngine skal eksporteres");
  assert.ok(sandboxWindow.CivicationCityLayer, "CivicationCityLayer skal eksporteres");
  return sandboxWindow;
}

const W = loadModules();
const layer = W.CivicationCityLayer;

const locations = readJSON("data/Civication/map/phaseLocations.json").phaseLocations;
function loc(id) { return locations.find((l) => l.id === id); }

// Ekte sosiale steder slik CivicationSocialPlaceResolver bygger dem.
const realCoffee = {
  id: "brand_place:oslo_s:fuglen", sourcePlaceId: "oslo_s", brandId: "fuglen",
  socialPlaceType: "coffee", type: "cafe", label: "Fuglen", placeLabel: "Oslo S"
};
const realPark = {
  id: "place:st_hanshaugen", sourcePlaceId: "st_hanshaugen", brandId: null,
  socialPlaceType: "park_public_space", type: "park", label: "St. Hanshaugen park",
  placeLabel: "St. Hanshaugen park"
};

let failures = 0;
function check(name, fn) {
  try { fn(); console.log("  ok  -", name); }
  catch (e) { failures += 1; console.error("FAIL  -", name); console.error("       ", e && e.message); }
}

console.log("CivicationCityLayer – rolleklasser i DOM (Del A)");

check("API finnes: getPlaceRole / buildPlaceClassList / buildPlaceDataAttrs", () => {
  assert.strictEqual(typeof layer.getPlaceRole, "function");
  assert.strictEqual(typeof layer.buildPlaceClassList, "function");
  assert.strictEqual(typeof layer.buildPlaceDataAttrs, "function");
});

check("systemnoder får is-role-system-node / player-home / work-node / insight-node", () => {
  assert.ok(layer.buildPlaceClassList(loc("nav_office"), false).includes("is-role-system-node"));
  assert.ok(layer.buildPlaceClassList(loc("home"), false).includes("is-role-player-home"));
  assert.ok(layer.buildPlaceClassList(loc("workplace"), false).includes("is-role-work-node"));
  assert.ok(layer.buildPlaceClassList(loc("psychology_room"), false).includes("is-role-insight-node"));
});

check("venners hjem får is-role-friend-home (og beholder is-friend-home)", () => {
  const cls = layer.buildPlaceClassList(loc("friend_home_demo_01"), false);
  assert.ok(cls.includes("is-role-friend-home"), "rolleklasse mangler");
  assert.ok(cls.includes("is-friend-home"), "bakoverkompatibel klasse mangler");
});

check("ekte sosiale steder får is-role-social-place", () => {
  assert.ok(layer.buildPlaceClassList(realCoffee, false).includes("is-role-social-place"));
  assert.ok(layer.buildPlaceClassList(realPark, false).includes("is-role-social-place"));
});

check("generiske fallback-noder får is-role-social-fallback", () => {
  ["cafe", "park", "football", "culture", "gym", "store"].forEach((id) => {
    assert.ok(
      layer.buildPlaceClassList(loc(id), false).includes("is-role-social-fallback"),
      "feil rolleklasse for " + id
    );
  });
});

check("is-active legges på når stedet er aktivt i fasen", () => {
  const cls = layer.buildPlaceClassList(loc("nav_office"), true);
  assert.ok(cls.includes("is-active"));
  assert.ok(!layer.buildPlaceClassList(loc("nav_office"), false).includes("is-active"));
});

console.log("CivicationCityLayer – data-attributter (Del A)");

check("data-location-role settes for alle roller, og data-place-id alltid", () => {
  const a = layer.buildPlaceDataAttrs(loc("nav_office"));
  assert.strictEqual(a["data-place-id"], "nav_office");
  assert.strictEqual(a["data-location-role"], "system_node");
});

check("ekte sosiale steder får brand-/place-/type-attributter", () => {
  const a = layer.buildPlaceDataAttrs(realCoffee);
  assert.strictEqual(a["data-location-role"], "social_place");
  assert.strictEqual(a["data-social-place-type"], "coffee");
  assert.strictEqual(a["data-source-place-id"], "oslo_s");
  assert.strictEqual(a["data-brand-id"], "fuglen");
});

check("place-only steder får type/place-id, men ingen brand-id", () => {
  const a = layer.buildPlaceDataAttrs(realPark);
  assert.strictEqual(a["data-social-place-type"], "park_public_space");
  assert.strictEqual(a["data-source-place-id"], "st_hanshaugen");
  assert.ok(!("data-brand-id" in a), "place-only skal ikke ha brand-id");
});

check("systemnoder/fallback har ingen brand-/place-attributter", () => {
  ["data-social-place-type", "data-source-place-id", "data-brand-id"].forEach((k) => {
    assert.ok(!(k in layer.buildPlaceDataAttrs(loc("nav_office"))), "nav_office skal ikke ha " + k);
    assert.ok(!(k in layer.buildPlaceDataAttrs(loc("cafe"))), "generisk cafe skal ikke ha " + k);
  });
});

console.log("CivicationCityLayer – role-wrapper");

check("getPlaceRole bruker motorens getLocationRole når den finnes", () => {
  assert.strictEqual(layer.getPlaceRole(loc("nav_office")), "system_node");
  assert.strictEqual(layer.getPlaceRole(loc("home")), "player_home");
  assert.strictEqual(layer.getPlaceRole(realCoffee), "social_place");
  assert.strictEqual(layer.getPlaceRole(loc("cafe")), "social_fallback");
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
