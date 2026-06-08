#!/usr/bin/env node
// tests/civication-three-map-projection.test.js
//
// Validerer det stabile projeksjons-/transform-API-et i
// js/Civication/ui/CivicationThreeMap.js (Del A/B): at andre kartlag kan
// projisere normaliserte Civication world-koordinater (0–1) til skjermpiksler
// via SAMME kamera/zoom/pan/resize-state som 3D-kartet selv tegner med, og at
// et ryddig transform-event (civi:threeMapTransformChanged) dispatches ved
// zoom/pan/resize. Laster den ekte produksjonsfilen med stubbede browser-
// globaler (ingen WebGL) og injiserer et fake THREE/kamera via setStateForTesting.
//
// Kjør:  node tests/civication-three-map-projection.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");

function loadScript(relPath) {
  const code = fs.readFileSync(path.join(repoRoot, relPath), "utf8");
  vm.runInThisContext(code, { filename: relPath });
}

// Speiler ThreeMap-konstantene (kun for å regne forventede skjermpunkter).
const MAP_W = 20;
const MAP_D = 20;

const dispatched = [];
let rafQueue = [];

function setup() {
  global.window = global;
  global.CIVICATION_THREE_MAP_ENABLED = false; // init() skal returnere tidlig
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

  loadScript("js/Civication/ui/CivicationThreeMap.js");
}

function flushRaf() {
  const q = rafQueue;
  rafQueue = [];
  q.forEach((cb) => { try { cb(); } catch (_e) { /* ignore */ } });
}

// Fake THREE.Vector3: project(camera) gjør en deterministisk lineær world->NDC-
// mapping så vi kan forutsi skjermpunktene uten ekte WebGL-kamera.
class FakeVector3 {
  constructor(x, y, z) { this.x = x; this.y = y; this.z = z; }
  project(camera) {
    const r = camera.__project(this.x, this.y, this.z);
    this.x = r.x; this.y = r.y; this.z = r.z;
    return this;
  }
}
const FAKE_THREE = { Vector3: FakeVector3 };

// Fake ortografisk kamera. __project speiler en enkel «rett ned»-projeksjon:
//   ndc.x = worldX / (MAP_W/2),  ndc.y = -worldZ / (MAP_D/2),  ndc.z = 0
function makeCamera() {
  return {
    left: 0, right: 0, top: 0, bottom: 0, zoom: 1,
    position: { set() {} },
    lookAt() {},
    updateProjectionMatrix() {},
    __project(wx, wy, wz) {
      return { x: wx / (MAP_W / 2), y: -wz / (MAP_D / 2), z: 0 };
    }
  };
}

let failures = 0;
function check(name, fn) {
  try { fn(); console.log("  ok  -", name); }
  catch (e) { failures += 1; console.error("FAIL  -", name); console.error("       ", e && e.message); }
}

setup();
const M = global.window.CivicationThreeMap;
assert.ok(M, "window.CivicationThreeMap skal være registrert");

console.log("CivicationThreeMap – projeksjons-API (Del A)");

[
  "projectWorldToScreen", "projectNormalizedToScreen", "getTransformState",
  "getViewportSize", "isActive", "onTransformChanged", "offTransformChanged",
  "setStateForTesting"
].forEach((fn) => {
  check("API finnes: " + fn, () => assert.strictEqual(typeof M[fn], "function"));
});

check("isActive reflekterer aktiv-state", () => {
  M.setStateForTesting({ active: false });
  assert.strictEqual(M.isActive(), false);
  M.setStateForTesting({ active: true });
  assert.strictEqual(M.isActive(), true);
});

check("projectWorldToScreen returnerer null når ThreeMap ikke er aktivt", () => {
  M.setStateForTesting({ active: false, THREE: FAKE_THREE, camera: makeCamera(), renderer: {}, W: 1000, H: 800 });
  assert.strictEqual(M.projectWorldToScreen(0.5, 0.5), null);
});

check("projectWorldToScreen returnerer skjermpunkt når ThreeMap er aktivt", () => {
  M.setStateForTesting({ active: true, THREE: FAKE_THREE, camera: makeCamera(), renderer: {}, W: 1000, H: 800 });
  // nx=0.5,ny=0.5 -> world (0,*,0) -> ndc (0,0) -> senter av viewport.
  assert.deepStrictEqual(M.projectWorldToScreen(0.5, 0.5), { x: 500, y: 400 });
  // nx=0.75 -> worldX=5 -> ndc.x=0.5 -> (0.5+1)/2*1000 = 750.
  assert.strictEqual(M.projectWorldToScreen(0.75, 0.5).x, 750);
  // ny=0.25 -> worldZ=-5 -> ndc.y=0.5 -> (-0.5+1)/2*800 = 200.
  assert.strictEqual(M.projectWorldToScreen(0.5, 0.25).y, 200);
});

check("projectNormalizedToScreen == projectWorldToScreen", () => {
  M.setStateForTesting({ active: true, THREE: FAKE_THREE, camera: makeCamera(), renderer: {}, W: 1000, H: 800 });
  assert.deepStrictEqual(M.projectNormalizedToScreen(0.75, 0.25), M.projectWorldToScreen(0.75, 0.25));
});

check("projectWorldToScreen returnerer null ved ugyldig input/viewport/renderer", () => {
  M.setStateForTesting({ active: true, THREE: FAKE_THREE, camera: makeCamera(), renderer: {}, W: 1000, H: 800 });
  assert.strictEqual(M.projectWorldToScreen(NaN, 0.5), null);
  assert.strictEqual(M.projectWorldToScreen("x", 0.5), null);
  M.setStateForTesting({ W: 0, H: 0 });
  assert.strictEqual(M.projectWorldToScreen(0.5, 0.5), null);
});

console.log("CivicationThreeMap – transform-event (Del B)");

check("civi:threeMapTransformChanged dispatches ved reset() med riktig detail", () => {
  M.setStateForTesting({ active: true, THREE: FAKE_THREE, camera: makeCamera(), renderer: {}, W: 1000, H: 800 });
  dispatched.length = 0;
  let cbDetail = null;
  const cb = (d) => { cbDetail = d; };
  M.onTransformChanged(cb);
  M.reset(); // zoom/pan -> updateCamera -> scheduleTransformEmit
  flushRaf();
  const evt = dispatched.find((e) => e.type === "civi:threeMapTransformChanged");
  assert.ok(evt, "transform-event skal dispatches ved reset/zoom/pan");
  ["zoom", "panX", "panZ", "width", "height"].forEach((k) =>
    assert.ok(Object.prototype.hasOwnProperty.call(evt.detail, k), "detail mangler " + k));
  assert.strictEqual(evt.detail.width, 1000);
  assert.strictEqual(evt.detail.height, 800);
  assert.ok(cbDetail && Object.prototype.hasOwnProperty.call(cbDetail, "zoom"),
    "onTransformChanged-callback skal få transform-detail");
  M.offTransformChanged(cb);
});

check("offTransformChanged kobler fra lytteren", () => {
  M.setStateForTesting({ active: true, THREE: FAKE_THREE, camera: makeCamera(), renderer: {}, W: 1000, H: 800 });
  let calls = 0;
  const cb = () => { calls += 1; };
  M.onTransformChanged(cb);
  M.offTransformChanged(cb);
  M.reset();
  flushRaf();
  assert.strictEqual(calls, 0, "frakoblet lytter skal ikke kalles");
});

check("transform-emit coalesces (maks ett event pr. rAF-frame)", () => {
  M.setStateForTesting({ active: true, THREE: FAKE_THREE, camera: makeCamera(), renderer: {}, W: 1000, H: 800 });
  dispatched.length = 0;
  M.reset();
  M.reset();
  M.reset();
  flushRaf();
  const events = dispatched.filter((e) => e.type === "civi:threeMapTransformChanged");
  assert.strictEqual(events.length, 1, "flere transformer i samme frame skal gi ett event, fikk " + events.length);
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
