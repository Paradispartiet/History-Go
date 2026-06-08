#!/usr/bin/env node
// tests/civication-city-layer-three-map-anchor.test.js
//
// Validerer at CivicationCityLayer forankrer markørene i DEN AKTIVE kartmotorens
// koordinatsystem (Del C/E), og at ThreeMap (3D) velges FØR CanvasMap når begge
// er aktive – slik at NAV-kontor, Psykologirommet, vennehjem osv. følger
// 3D-kartets zoom/pan i stedet for å flyte som normalisert prosent.
//
// Tester de rene, eksponerte hjelperne (resolveLocationAnchor /
// projectLocationToScreen) headless med stubbede kartmotorer, og auditerer at de
// faste stedene faktisk har en world-anchor i phaseLocations.json.
//
// Kjør:  node tests/civication-city-layer-three-map-anchor.test.js

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

// Distinkte projeksjons-skalaer så vi kan se HVILKEN motor som ble brukt.
//   ThreeMap:  x*2000, y*1600
//   CanvasMap: x*1000, y*800
let threeActive = true;
let threeProjects = true;
let canvasActive = true;
W.CivicationThreeMap = {
  isActive: () => threeActive,
  projectWorldToScreen: (x, y) => {
    if (!threeProjects) return null;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x: x * 2000, y: y * 1600 };
  },
  onTransformChanged: () => {}
};
const canvasPlaceScreens = { oslo_s: { x: 535, y: 585, source: "manual" } };
W.CivicationCanvasMap = {
  isActive: () => canvasActive,
  projectWorldToScreen: (x, y) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
    return { x: x * 1000, y: y * 800 };
  },
  projectPlaceToScreen: (id) => canvasPlaceScreens[String(id)] || null,
  onTransformChanged: () => {}
};

let failures = 0;
function check(name, fn) {
  try { fn(); console.log("  ok  -", name); }
  catch (e) { failures += 1; console.error("FAIL  -", name); console.error("       ", e && e.message); }
}

// Laster de ekte phaseLocations for de faste stedene.
const phaseData = readJSON("data/Civication/map/phaseLocations.json");
const phaseLocations = Array.isArray(phaseData) ? phaseData
  : (Array.isArray(phaseData.locations) ? phaseData.locations : (phaseData.phaseLocations || []));
function locById(id) {
  return phaseLocations.find((l) => String(l.id) === String(id)) || null;
}

console.log("CivicationCityLayer – ThreeMap-forankring (Del C/E)");

check("ThreeMap brukes FØR CanvasMap når begge er aktive", () => {
  threeActive = true; threeProjects = true; canvasActive = true;
  const loc = { id: "nav_office", position: { x: 0.51, y: 0.71 } };
  const anchor = layer.resolveLocationAnchor(loc);
  assert.strictEqual(anchor.mode, "screen");
  // ThreeMap-skala (x*2000), ikke CanvasMap (x*1000).
  assert.strictEqual(anchor.x, 0.51 * 2000);
  assert.strictEqual(anchor.y, 0.71 * 1600);
});

check("når ThreeMap er aktivt brukes IKKE normalisert prosent-fallback", () => {
  threeActive = true; threeProjects = true; canvasActive = true;
  const loc = { id: "nav_office", position: { x: 0.51, y: 0.71 } };
  const anchor = layer.resolveLocationAnchor(loc);
  assert.notStrictEqual(anchor.mode, "normalized");
  assert.strictEqual(anchor.mode, "screen");
});

["nav_office", "psychology_room", "friend_home_demo_01"].forEach((id) => {
  check(id + " projiseres via ThreeMap når aktiv", () => {
    threeActive = true; threeProjects = true; canvasActive = true;
    const loc = locById(id);
    assert.ok(loc && loc.position, id + " skal ha position i phaseLocations.json");
    const screen = layer.projectLocationToScreen(loc);
    assert.ok(screen, id + " skal projiseres");
    assert.strictEqual(screen.x, loc.position.x * 2000, "skal bruke ThreeMap-projeksjon");
    assert.strictEqual(screen.y, loc.position.y * 1600, "skal bruke ThreeMap-projeksjon");
  });
});

check("vennemarkør på friend_home_demo_01 deler ThreeMap-anker (samme locationId) i px", () => {
  threeActive = true; threeProjects = true; canvasActive = true;
  const loc = locById("friend_home_demo_01");
  const placeAnchor = layer.resolveLocationAnchor(loc);
  // En vennemarkør står på samme loc (samme locationId) -> samme skjermanker.
  const friendAnchor = layer.resolveLocationAnchor(loc);
  assert.strictEqual(friendAnchor.mode, "screen", "px-anker så pixel-offset påføres etter projeksjon");
  assert.deepStrictEqual(
    { x: friendAnchor.x, y: friendAnchor.y },
    { x: placeAnchor.x, y: placeAnchor.y },
    "venn og sted skal dele samme projiserte ThreeMap-anker"
  );
});

check("ThreeMap aktiv men projeksjon mangler -> ingen anker (markør skjules/flagges)", () => {
  threeActive = true; threeProjects = false; canvasActive = true;
  const loc = locById("nav_office");
  // Ingen sourcePlaceId, og projectWorldToScreen returnerer null -> null anker.
  assert.strictEqual(layer.projectLocationToScreen(loc), null);
  assert.strictEqual(layer.resolveLocationAnchor(loc), null);
  // Skal IKKE falle tilbake til normalisert prosent mens en motor er aktiv.
});

check("ThreeMap ikke aktiv, CanvasMap aktiv -> CanvasMap brukes som før", () => {
  threeActive = false; threeProjects = true; canvasActive = true;
  const loc = { id: "nav_office", position: { x: 0.51, y: 0.71 } };
  const anchor = layer.resolveLocationAnchor(loc);
  assert.strictEqual(anchor.mode, "screen");
  // CanvasMap-skala (x*1000).
  assert.strictEqual(anchor.x, 0.51 * 1000);
  assert.strictEqual(anchor.y, 0.71 * 800);
});

check("ingen kartmotor aktiv -> gammel normalisert fallback", () => {
  threeActive = false; canvasActive = false;
  const loc = { id: "nav_office", position: { x: 0.51, y: 0.71 } };
  const anchor = layer.resolveLocationAnchor(loc);
  assert.strictEqual(anchor.mode, "normalized");
  assert.strictEqual(anchor.x, 0.51);
  assert.strictEqual(anchor.y, 0.71);
  // Reset for evt. videre kjøring.
  threeActive = true; canvasActive = true;
});

console.log("Civication – data/audit (faste steder har world-anchor)");

["psychology_room", "nav_office", "friend_home_demo_01", "friend_home_demo_02", "friend_home_demo_03"]
  .forEach((id) => {
    check(id + " har position i phaseLocations.json", () => {
      const loc = locById(id);
      assert.ok(loc, id + " skal finnes");
      assert.ok(loc.position && typeof loc.position.x === "number" && typeof loc.position.y === "number",
        id + " skal ha numerisk position.x/y");
    });
  });

check("alle phaseLocations med ikon kan få world-anchor (position eller mapZone)", () => {
  const districts = W.CIVI_MAP_DISTRICTS || [];
  const zoneIds = new Set(districts.map((d) => String(d.id)));
  const missing = phaseLocations.filter((loc) => {
    if (!loc || !loc.icon) return false;
    const hasPos = loc.position && typeof loc.position.x === "number" && typeof loc.position.y === "number";
    // En mapZone gir også world-anchor (bydelssenter); zoneIds er bare test-stubb.
    const hasZone = !!loc.mapZone;
    return !(hasPos || hasZone);
  });
  void zoneIds;
  assert.strictEqual(missing.length, 0,
    "phaseLocations uten world-anchor: " + missing.map((l) => l.id).join(", "));
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
