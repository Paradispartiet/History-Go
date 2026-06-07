#!/usr/bin/env node
// tests/civication-canvas-map-projection.test.js
//
// Validerer det stabile projeksjons-API-et i js/Civication/ui/CivicationCanvasMap.js
// (Del A): at andre kartlag kan bruke NØYAKTIG samme world->screen-projeksjon
// som canvas selv tegner med, og at et ryddig transform-event dispatches ved
// zoom/pan/resize. Laster den ekte produksjonsfilen med stubbede browser-globaler
// (ingen WebGL/canvas) og setter transform via setTransformForTesting.
//
// Kjør:  node tests/civication-canvas-map-projection.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function loadScript(relPath) {
  const code = fs.readFileSync(path.join(repoRoot, relPath), "utf8");
  vm.runInThisContext(code, { filename: relPath });
}

const dispatched = [];
let rafQueue = [];

function setup() {
  global.window = global;
  global.__civiThreeActive = false;
  global.requestAnimationFrame = (cb) => { rafQueue.push(cb); return rafQueue.length; };
  global.CustomEvent = class CustomEvent {
    constructor(type, opts) { this.type = type; this.detail = opts && opts.detail; }
  };
  global.dispatchEvent = (e) => { dispatched.push(e); return true; };
  global.addEventListener = () => {};
  global.document = {
    readyState: "complete",
    addEventListener() {},
    getElementById() { return null; },
    body: { classList: { contains() { return false; }, add() {}, remove() {} } }
  };

  loadScript("js/Civication/ui/CivicationOsloMapCalibration.js");
  loadScript("js/Civication/ui/CivicationCanvasMap.js");
}

function flushRaf() {
  const q = rafQueue;
  rafQueue = [];
  q.forEach((cb) => { try { cb(); } catch (_e) { /* ignore */ } });
}

let failures = 0;
function check(name, fn) {
  try { fn(); console.log("  ok  -", name); }
  catch (e) { failures += 1; console.error("FAIL  -", name); console.error("       ", e && e.message); }
}

setup();
const M = global.window.CivicationCanvasMap;
assert.ok(M, "window.CivicationCanvasMap skal være registrert");

console.log("CivicationCanvasMap – projeksjons-API (Del A)");

[
  "projectWorldToScreen", "projectNormalizedToScreen", "projectPlaceToWorld",
  "projectPlaceToScreen", "getTransformState", "getViewportSize", "isActive",
  "onTransformChanged", "offTransformChanged", "setTransformForTesting"
].forEach((fn) => {
  check("API finnes: " + fn, () => assert.strictEqual(typeof M[fn], "function"));
});

check("setTransformForTesting + getTransformState gir stabil state", () => {
  const t = M.setTransformForTesting({ zoom: 2, cx: 0.5, cy: 0.5, width: 1000, height: 800 });
  assert.deepStrictEqual(t, { zoom: 2, cx: 0.5, cy: 0.5, width: 1000, height: 800 });
  assert.deepStrictEqual(M.getTransformState(), t);
  assert.deepStrictEqual(M.getViewportSize(), { width: 1000, height: 800 });
});

check("projectWorldToScreen bruker zoom/cx/cy/W/H (samme matte som worldToScreen)", () => {
  M.setTransformForTesting({ zoom: 2, cx: 0.5, cy: 0.5, width: 1000, height: 800 });
  // Senter av world (cx,cy) -> senter av viewport.
  assert.deepStrictEqual(M.projectWorldToScreen(0.5, 0.5), { x: 500, y: 400 });
  // (0.75-0.5)*2*1000 + 500 = 1000 ; y uendret.
  assert.deepStrictEqual(M.projectWorldToScreen(0.75, 0.5), { x: 1000, y: 400 });
  // (0.25-0.5)*2*800 + 400 = 0.
  assert.deepStrictEqual(M.projectWorldToScreen(0.5, 0.25), { x: 500, y: 0 });
});

check("projectNormalizedToScreen == projectWorldToScreen (world er normalisert 0–1)", () => {
  M.setTransformForTesting({ zoom: 2, cx: 0.5, cy: 0.5, width: 1000, height: 800 });
  assert.deepStrictEqual(M.projectNormalizedToScreen(0.75, 0.5), M.projectWorldToScreen(0.75, 0.5));
});

check("projectWorldToScreen returnerer null ved ugyldig input/viewport", () => {
  M.setTransformForTesting({ zoom: 1, cx: 0.5, cy: 0.5, width: 1000, height: 800 });
  assert.strictEqual(M.projectWorldToScreen(NaN, 0.5), null);
  assert.strictEqual(M.projectWorldToScreen("x", 0.5), null);
  M.setTransformForTesting({ width: 0, height: 0 });
  assert.strictEqual(M.projectWorldToScreen(0.5, 0.5), null);
});

check("projectPlaceToScreen bruker manuell civiMap.x/y (samme løype som drawPlaces)", () => {
  M.setTransformForTesting({ zoom: 1, cx: 0.5, cy: 0.5, width: 1000, height: 800 });
  const s = M.projectPlaceToScreen({ id: "manual_place", civiMap: { x: 0.5, y: 0.5 } });
  assert.ok(s, "skal projisere manuelt plassert place");
  assert.strictEqual(s.x, 500);
  assert.strictEqual(s.y, 400);
  assert.strictEqual(s.source, "manual");
});

check("projectPlaceToWorld bruker kalibrert Oslo-projeksjon for lat/lon", () => {
  // Oslo S – kalibreringen har et anker her, så x/y skal lande i sentrum.
  const w = M.projectPlaceToWorld({ id: "oslo_s", lat: 59.9109, lon: 10.7534 });
  assert.ok(w, "skal projisere lat/lon via kalibrering");
  assert.ok(w.x > 0.45 && w.x < 0.62, "x i sentrum, fikk " + w.x);
  assert.ok(w.y > 0.5 && w.y < 0.66, "y i sentrum, fikk " + w.y);
});

check("projectPlaceToWorld/Screen returnerer null når koordinater mangler (gjetter ikke)", () => {
  assert.strictEqual(M.projectPlaceToWorld({ id: "no_coords" }), null);
  assert.strictEqual(M.projectPlaceToScreen({ id: "no_coords" }), null);
});

console.log("CivicationCanvasMap – transform-event (Del A)");

check("civi:canvasMapTransformChanged dispatches ved zoom (etter state-oppdatering)", () => {
  M.setTransformForTesting({ zoom: 1, cx: 0.5, cy: 0.5, width: 1000, height: 800 });
  dispatched.length = 0;
  let cbDetail = null;
  const cb = (d) => { cbDetail = d; };
  M.onTransformChanged(cb);
  M.zoomIn();
  flushRaf();
  const evt = dispatched.find((e) => e.type === "civi:canvasMapTransformChanged");
  assert.ok(evt, "transform-event skal dispatches ved zoom");
  assert.ok(evt.detail && evt.detail.zoom > 1, "detail.zoom skal reflektere ny zoom");
  assert.ok(cbDetail && cbDetail.zoom > 1, "onTransformChanged-callback skal få ny zoom");
  ["zoom", "cx", "cy", "width", "height"].forEach((k) =>
    assert.ok(Object.prototype.hasOwnProperty.call(evt.detail, k), "detail mangler " + k));
  M.offTransformChanged(cb);
});

check("offTransformChanged kobler fra lytteren", () => {
  M.setTransformForTesting({ zoom: 1, cx: 0.5, cy: 0.5, width: 1000, height: 800 });
  let calls = 0;
  const cb = () => { calls += 1; };
  M.onTransformChanged(cb);
  M.offTransformChanged(cb);
  M.zoomIn();
  flushRaf();
  assert.strictEqual(calls, 0, "frakoblet lytter skal ikke kalles");
});

check("transform-emit coalesces (maks ett event pr. rAF-frame)", () => {
  M.setTransformForTesting({ zoom: 1, cx: 0.5, cy: 0.5, width: 1000, height: 800 });
  dispatched.length = 0;
  M.zoomIn();
  M.zoomIn();
  M.zoomIn();
  flushRaf();
  const events = dispatched.filter((e) => e.type === "civi:canvasMapTransformChanged");
  assert.strictEqual(events.length, 1, "flere zoom i samme frame skal gi ett event, fikk " + events.length);
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
