#!/usr/bin/env node
// tests/civication-canvas-map-groundhopper.test.js
//
// Verifiserer at 2D-kartet (CivicationCanvasMap) konsumerer read-modellen
// (CivicationCityMap) og markerer Groundhopper-relevante steder med en flat ring
// – parallelt med CivicationThreeMap. Denne node-testen dekker (1) API/logikk med
// en fake-2D-context og (2) at drawPlaces integrerer ringen (kildeassertjoner).
//
// (Selve pikselmalingen er dessuten bekreftet i ekte headless Chromium, siden
//  CanvasMap er fallback-rendereren som faktisk tegner når WebGL/CDN ikke er
//  tilgjengelig – 2D-canvas krever verken CDN eller GPU.)
//
// Kjør:  node tests/civication-canvas-map-groundhopper.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

let failures = 0;
function check(name, fn) {
  try { fn(); console.log("  ok  -", name); }
  catch (e) { failures += 1; console.error("FAIL  -", name); console.error("       ", e && e.message); }
}

console.log("Civication 2D-kart – Groundhopper-visning");

// Last CivicationCanvasMap i et isolert stub-window (init() kalles ikke, så
// verken canvas eller DataHub trengs ved load).
function loadCanvasMap(extraWindow) {
  const win = Object.assign({}, extraWindow);
  const sandbox = {
    window: win,
    document: { readyState: "complete", addEventListener() {}, getElementById() { return null; },
      body: { classList: { contains() { return false; }, add() {}, remove() {} } } },
    console: { warn() {}, info() {}, log() {}, error() {} },
    requestAnimationFrame: () => 0,
    setTimeout, clearTimeout,
    CustomEvent: class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } }
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.addEventListener = () => {};
  sandbox.window.requestAnimationFrame = sandbox.requestAnimationFrame;
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, "js/Civication/ui/CivicationOsloMapCalibration.js"), "utf8"), sandbox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, "js/Civication/ui/CivicationCanvasMap.js"), "utf8"), sandbox);
  return sandbox.window.CivicationCanvasMap;
}

// Fake 2D-context som registrerer kallene drawGroundhopperRing gjør.
function makeRecordingCtx() {
  const calls = [];
  const ctx = {};
  ["save", "restore", "translate", "scale", "beginPath", "ellipse", "stroke"].forEach((m) => {
    ctx[m] = (...args) => calls.push({ m, args });
  });
  Object.defineProperty(ctx, "strokeStyle", { set(v) { calls.push({ m: "strokeStyle", args: [v] }); } });
  Object.defineProperty(ctx, "lineWidth", { set(v) { calls.push({ m: "lineWidth", args: [v] }); } });
  return { ctx, calls };
}

check("API-et eksponerer Groundhopper-funksjonene", () => {
  const M = loadCanvasMap();
  ["isGroundhopperPlace", "getGroundhopperMarkerCount", "drawGroundhopperRing"]
    .forEach((fn) => assert.strictEqual(typeof M[fn], "function", `mangler API: ${fn}`));
  assert.strictEqual(M.getGroundhopperMarkerCount(), 0, "ingen markører før tegning");
});

check("isGroundhopperPlace delegerer til read-modellen og degraderer stille", () => {
  const M0 = loadCanvasMap();
  assert.strictEqual(M0.isGroundhopperPlace("bislett_stadion"), false, "uten read-model skal gi false");

  const M = loadCanvasMap({
    CivicationCityMap: { isGroundhopperPlace: (id) => id === "bislett_stadion" }
  });
  assert.strictEqual(M.isGroundhopperPlace("bislett_stadion"), true);
  assert.strictEqual(M.isGroundhopperPlace("oslo_domkirke"), false);
});

check("drawGroundhopperRing stroker en flat ellipse i groundhopper-grønn", () => {
  const M = loadCanvasMap();
  const { ctx, calls } = makeRecordingCtx();
  M.drawGroundhopperRing(ctx, 100, 200, 1.5);

  const names = calls.map((c) => c.m);
  assert.ok(names.includes("save") && names.includes("restore"), "skal save/restore context");
  assert.deepStrictEqual(calls.find((c) => c.m === "translate").args, [100, 200], "skal translatere til stedet");
  assert.deepStrictEqual(calls.find((c) => c.m === "scale").args, [1.5, 1.5], "skal skalere med argumentet");
  const ellipse = calls.find((c) => c.m === "ellipse");
  assert.ok(ellipse, "skal tegne en ellipse");
  assert.ok(ellipse.args[2] > ellipse.args[3], "ellipsen skal være flat (rx > ry)");
  const stroke = calls.find((c) => c.m === "strokeStyle");
  assert.ok(stroke && /111,\s*191,\s*122/.test(String(stroke.args[0])), "skal bruke groundhopper-grønn (#6fbf7a)");
  assert.ok(names.includes("stroke"), "skal stroke (ring, ikke fylt)");
});

// Kildeassertjoner: at drawPlaces faktisk integrerer ringen.
const src = fs.readFileSync(path.join(repoRoot, "js/Civication/ui/CivicationCanvasMap.js"), "utf8");

check("drawPlaces kicker read-modellen, nullstiller telleren og tegner ring under miniatyren", () => {
  assert.match(src, /_groundhopperMarkers = 0;/);
  assert.match(src, /ensureCityMapLoaded\(\);/);
  // Ringen tegnes FØR miniatyren (så bygget står oppå), med teller-økning.
  const drawPlaces = src.match(/function drawPlaces\(\)[\s\S]*?\n  \}/);
  assert.ok(drawPlaces, "fant ikke drawPlaces");
  const ringIdx = drawPlaces[0].indexOf("drawGroundhopperRing(ctx");
  const miniIdx = drawPlaces[0].indexOf("drawMiniature(ctx");
  assert.ok(ringIdx > -1 && miniIdx > -1 && ringIdx < miniIdx, "ringen skal tegnes før miniatyren");
  assert.match(drawPlaces[0], /_groundhopperMarkers \+= 1;/);
  // Når read-modellen er klar, tegnes stedene på nytt.
  assert.match(src, /Promise\.resolve\(api\.load\(\)\)[\s\S]*?scheduleFrame\(\)/);
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
