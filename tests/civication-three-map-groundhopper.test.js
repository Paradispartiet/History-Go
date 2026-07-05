#!/usr/bin/env node
// tests/civication-three-map-groundhopper.test.js
//
// Verifiserer at 3D-kartet (CivicationThreeMap) konsumerer read-modellen
// (CivicationCityMap) og markerer Groundhopper-relevante steder med en flat ring.
//
// Miljøet her kan ikke kjøre WebGL (Three.js lastes fra CDN som er blokkert), så
// testen dekker – i tråd med de øvrige three-map-testene – (1) den rene logikken
// via det eksponerte API-et med en injisert fake-THREE, og (2) at rebuildPlaces
// faktisk integrerer ringen i begge tegneløpene (kildeassertjoner). Live WebGL-
// bekreftelse må gjøres manuelt i en nettleser med CDN-tilgang.
//
// Kjør:  node tests/civication-three-map-groundhopper.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

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

console.log("Civication 3D-kart – Groundhopper-visning");

// Last CivicationThreeMap i et stub-window (init() returnerer tidlig fordi
// CIVICATION_THREE_MAP_ENABLED ikke er satt, så Three.js trengs ikke ved load).
function loadThreeMap(extraWindow) {
  const source = fs.readFileSync(
    path.join(repoRoot, "js/Civication/ui/CivicationThreeMap.js"), "utf8");
  const win = Object.assign({}, extraWindow);
  const sandbox = {
    window: win,
    document: { readyState: "complete", addEventListener() {}, getElementById() { return null; },
      body: { classList: { contains() { return false; }, add() {}, remove() {} } } },
    console: { warn() {}, log() {}, error() {} },
    setTimeout, clearTimeout
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.addEventListener = () => {};
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: "CivicationThreeMap.js" });
  return sandbox.window.CivicationThreeMap;
}

// Minimal fake-THREE som dekker akkurat det buildGroundhopperRing trenger.
function makeFakeThree() {
  return {
    DoubleSide: "DoubleSide",
    RingGeometry: function (inner, outer, seg) { this.inner = inner; this.outer = outer; this.seg = seg; },
    MeshBasicMaterial: function (opts) { Object.assign(this, opts || {}); this.isMaterial = true; },
    Mesh: function (geometry, material) {
      this.geometry = geometry; this.material = material; this.isMesh = true;
      this.rotation = { x: 0, y: 0, z: 0 };
      this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.userData = {};
    }
  };
}

check("API-et eksponerer Groundhopper-funksjonene", () => {
  const M = loadThreeMap();
  ["isGroundhopperPlace", "getGroundhopperMarkerCount", "buildGroundhopperRing"]
    .forEach((fn) => assert.strictEqual(typeof M[fn], "function", `mangler API: ${fn}`));
  assert.strictEqual(M.getGroundhopperMarkerCount(), 0, "ingen markører før tegning");
});

check("isGroundhopperPlace delegerer til read-modellen og degraderer stille", () => {
  // Uten read-model: alltid false, ingen feil.
  const M0 = loadThreeMap();
  assert.strictEqual(M0.isGroundhopperPlace("bislett"), false, "uten read-model skal gi false");

  // Med read-model: speiler dens svar.
  const M = loadThreeMap({
    CivicationCityMap: { isGroundhopperPlace: (id) => id === "bislett" }
  });
  assert.strictEqual(M.isGroundhopperPlace("bislett"), true);
  assert.strictEqual(M.isGroundhopperPlace("oslo_domkirke"), false);
});

check("buildGroundhopperRing lager en flat ring med riktig markering", () => {
  const M = loadThreeMap();
  const fake = makeFakeThree();
  M.setStateForTesting({ THREE: fake });

  const ring = M.buildGroundhopperRing(2);
  assert.ok(ring && ring.isMesh, "skal returnere en Mesh");
  assert.ok(ring.geometry instanceof fake.RingGeometry, "skal bruke RingGeometry");
  // Ringen skaleres med argumentet.
  assert.ok(ring.geometry.outer > ring.geometry.inner, "ytre radius > indre radius");
  assert.strictEqual(ring.geometry.outer, 0.40 * 2, "ytre radius skalert med argumentet");
  // Flat på bakken: rotert -90° om X.
  assert.ok(Math.abs(ring.rotation.x + Math.PI / 2) < 1e-9, "ringen skal ligge flatt");
  assert.strictEqual(ring.userData.groundhopperRing, true, "ringen skal være merket");
  assert.strictEqual(ring.material.transparent, true, "materialet skal være gjennomsiktig");
});

// (2) Kildeassertjoner: at rebuildPlaces faktisk integrerer ringen begge steder.
const src = fs.readFileSync(
  path.join(repoRoot, "js/Civication/ui/CivicationThreeMap.js"), "utf8");

check("rebuildPlaces kicker read-modellen og nullstiller telleren", () => {
  assert.match(src, /_stats\.groundhopperMarkers = 0;/);
  assert.match(src, /ensureCityMapLoaded\(\);/);
  // Når read-modellen er klar, tegnes stedene på nytt.
  assert.match(src, /Promise\.resolve\(api\.load\(\)\)[\s\S]*?rebuildPlaces\(\)/);
});

check("Groundhopper-ring legges til i både landemerke- og miniatyrløpet", () => {
  // Landemerkeløpet bruker fast skala; miniatyrløpet bruker stedets skala.
  assert.match(src, /buildGroundhopperRing\(1\.0\)/, "landemerkeløpet skal legge til ring");
  assert.match(src, /buildGroundhopperRing\(scale\)/, "miniatyrløpet skal legge til ring");
  // Miniatyrløpet flagger noden og teller markøren.
  assert.match(src, /node\.userData\.groundhopperRelevant = true;/);
  assert.match(src, /_stats\.groundhopperMarkers \+= 1;/);
  // Synlige miniatyrer bærer groundhopper-flagget for introspeksjon/testing.
  assert.match(src, /_visibleMiniatures\.push\(\{[^}]*groundhopper\b/);
  // getSceneStats eksponerer telleren.
  assert.match(src, /groundhopperMarkers: _stats\.groundhopperMarkers \|\| 0/);
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
