#!/usr/bin/env node
// tests/civication-city-layer-map-anchor.test.js
//
// Validerer at CivicationCityLayer forankrer markørene i kartets eget
// koordinatsystem via CanvasMap-projeksjonen (Del B), i stedet for å bruke
// loc.position direkte som overlay-prosent. Tester de rene, eksponerte
// hjelperne (resolveLocationAnchor / projectLocationToScreen) headless med en
// stubbet CanvasMap.
//
// Kjør:  node tests/civication-city-layer-map-anchor.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

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

  // Bydeler for mapZone-fallback.
  sandboxWindow.CIVI_MAP_DISTRICTS = [
    { id: "grunerlokka", center: [0.55, 0.45] },
    { id: "frogner", center: [0.31, 0.46] }
  ];

  vm.runInThisContext(
    fs.readFileSync(path.join(repoRoot, "js/Civication/systems/civicationFriendsEngine.js"), "utf8"),
    { filename: "civicationFriendsEngine.js" }
  );
  vm.runInThisContext(
    fs.readFileSync(path.join(repoRoot, "js/Civication/ui/CivicationCityLayer.js"), "utf8"),
    { filename: "CivicationCityLayer.js" }
  );

  assert.ok(sandboxWindow.CivicationCityLayer, "CivicationCityLayer skal eksporteres");
  return sandboxWindow;
}

const W = loadModules();
const layer = W.CivicationCityLayer;

// Stubbet CanvasMap-projeksjon: world (0–1) * (1000 x 800), pluss en fast
// place-projeksjon for et utvalg ekte placeId-er.
let canvasActive = true;
const placeScreens = {
  oslo_s: { x: 535, y: 585, source: "manual" }
};
W.CivicationCanvasMap = {
  isActive: () => canvasActive,
  projectWorldToScreen: (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x: x * 1000, y: y * 800 };
  },
  projectPlaceToScreen: (id) => placeScreens[String(id)] || null,
  onTransformChanged: () => {}
};

let failures = 0;
function check(name, fn) {
  try { fn(); console.log("  ok  -", name); }
  catch (e) { failures += 1; console.error("FAIL  -", name); console.error("       ", e && e.message); }
}

console.log("CivicationCityLayer – kartforankring (Del B)");

check("API finnes: resolveLocationAnchor / projectLocationToScreen / refreshMarkerPositions", () => {
  assert.strictEqual(typeof layer.resolveLocationAnchor, "function");
  assert.strictEqual(typeof layer.projectLocationToScreen, "function");
  assert.strictEqual(typeof layer.refreshMarkerPositions, "function");
});

check("loc.position projiseres via CanvasMap (px), ikke brukt direkte som prosent", () => {
  canvasActive = true;
  const loc = { id: "friend_home_demo_01", position: { x: 0.57, y: 0.49 }, mapZone: "grunerlokka" };
  const anchor = layer.resolveLocationAnchor(loc);
  assert.strictEqual(anchor.mode, "screen", "skal være skjermforankret når CanvasMap er aktiv");
  // 0.57*1000=570, 0.49*800=392 – px, ikke 57%/49%.
  assert.strictEqual(anchor.x, 570);
  assert.strictEqual(anchor.y, 392);
});

check("loc.sourcePlaceId prøves som ekte History Go-place-anker først", () => {
  canvasActive = true;
  // sourcePlaceId vinner selv om en (annen) position finnes.
  const loc = { id: "brand_place:oslo_s:b1", sourcePlaceId: "oslo_s", position: { x: 0.1, y: 0.1 } };
  const screen = layer.projectLocationToScreen(loc);
  assert.deepStrictEqual({ x: screen.x, y: screen.y }, { x: 535, y: 585 });
});

check("sourcePlaceId som ikke kan projiseres faller tilbake til loc.position", () => {
  canvasActive = true;
  const loc = { id: "brand_place:ukjent:b1", sourcePlaceId: "ukjent_place", position: { x: 0.25, y: 0.5 } };
  const screen = layer.projectLocationToScreen(loc);
  assert.deepStrictEqual({ x: screen.x, y: screen.y }, { x: 250, y: 400 });
});

check("mapZone-fallback projiserer bydelssenter når position mangler", () => {
  canvasActive = true;
  const loc = { id: "x", mapZone: "grunerlokka" }; // center [0.55, 0.45]
  const screen = layer.projectLocationToScreen(loc);
  assert.deepStrictEqual({ x: screen.x, y: screen.y }, { x: 550, y: 360 });
});

check("uten anker (ingen sourcePlaceId/position/mapZone) -> null, gjetter ikke", () => {
  canvasActive = true;
  assert.strictEqual(layer.projectLocationToScreen({ id: "tom" }), null);
  assert.strictEqual(layer.resolveLocationAnchor({ id: "tom" }), null);
});

check("når CanvasMap ikke er aktiv brukes normalisert fallback (3D/SVG)", () => {
  canvasActive = false;
  const loc = { id: "friend_home_demo_01", position: { x: 0.57, y: 0.49 } };
  const anchor = layer.resolveLocationAnchor(loc);
  assert.strictEqual(anchor.mode, "normalized");
  assert.strictEqual(anchor.x, 0.57);
  assert.strictEqual(anchor.y, 0.49);
  // projectLocationToScreen krever aktiv CanvasMap.
  assert.strictEqual(layer.projectLocationToScreen(loc), null);
  canvasActive = true;
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
