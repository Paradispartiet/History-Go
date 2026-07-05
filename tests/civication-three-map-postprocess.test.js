#!/usr/bin/env node
// tests/civication-three-map-postprocess.test.js
//
// Verifiserer post-prosesseringen i CivicationThreeMap (tilt-shift dybdeskarphet
// + vignett + varm grade), bak et kvalitetsnivå. Miljøet kan ikke kjøre WebGL i
// node, så denne testen dekker API + kildeassertjoner. Selve bildet (tilt-shift
// på/av) er bekreftet i ekte headless Chromium (SwiftShader WebGL).
//
// Kjør:  node tests/civication-three-map-postprocess.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const srcPath = path.join(repoRoot, "js/Civication/ui/CivicationThreeMap.js");
const src = fs.readFileSync(srcPath, "utf8");

let failures = 0;
function check(name, fn) {
  try { fn(); console.log("  ok  -", name); }
  catch (e) { failures += 1; console.error("FAIL  -", name); console.error("       ", e && e.message); }
}

console.log("Civication 3D-kart – post-prosessering (tilt-shift/vignett)");

function loadThreeMap(extraWindow) {
  const win = Object.assign({}, extraWindow);
  const sandbox = {
    window: win,
    document: { readyState: "complete", addEventListener() {}, getElementById() { return null; },
      body: { classList: { contains() { return false; }, add() {}, remove() {} } } },
    console: { warn() {}, info() {}, log() {}, error() {} },
    navigator: { hardwareConcurrency: 8 },
    setTimeout, clearTimeout
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.navigator = sandbox.navigator;
  sandbox.window.addEventListener = () => {};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(repoRoot, "js/Civication/ui/CivicationOsloMapCalibration.js"), "utf8"), sandbox);
  vm.runInContext(src, sandbox, { filename: "CivicationThreeMap.js" });
  return sandbox.window.CivicationThreeMap;
}

check("API eksponerer isPostEnabled og den er av før init/WebGL", () => {
  const M = loadThreeMap();
  assert.strictEqual(typeof M.isPostEnabled, "function", "mangler API: isPostEnabled");
  assert.strictEqual(M.isPostEnabled(), false, "skal være av uten scene/WebGL");
});

check("kvalitetsnivået leses fra window.CIVICATION_MAP_QUALITY", () => {
  // decidePostEnabled er intern; sjekk at logikken finnes og respekterer flagget.
  assert.match(src, /window\.CIVICATION_MAP_QUALITY/);
  assert.match(src, /if \(q === "high"\) return true;/);
  assert.match(src, /if \(q === "low" \|\| q === "off" \|\| q === "none"\) return false;/);
  // Svake mobiler (få kjerner + liten skjerm) slås av.
  assert.match(src, /cores <= 4 && minSide < 520/);
});

check("post-pipelinen bygges i init og er selvstendig (core-THREE, ingen addon)", () => {
  assert.match(src, /function buildPostPipeline\(\)/);
  assert.match(src, /buildPostPipeline\(\);/);            // kalt i init
  assert.match(src, /new THREE\.WebGLRenderTarget\(/);
  assert.match(src, /new THREE\.ShaderMaterial\(/);
  assert.doesNotMatch(src, /EffectComposer|SSAOPass|SMAAPass|examples\/jsm|addons\//,
    "skal ikke avhenge av three-addons/CDN");
  // Feil ved oppsett skal degradere til direkte render.
  assert.match(src, /catch \(e\) \{[\s\S]*?_postEnabled = false;/);
});

check("render-løkka bruker target -> fullskjerms-pass når post er på, ellers direkte", () => {
  const loop = src.match(/function loop\(\)[\s\S]*?\n  \}/);
  assert.ok(loop, "fant ikke loop()");
  assert.match(loop[0], /if \(_postEnabled && _postTarget && _postQuad\)/);
  assert.match(loop[0], /renderer\.setRenderTarget\(_postTarget\)[\s\S]*?renderer\.render\(scene, camera\)[\s\S]*?renderer\.setRenderTarget\(null\)[\s\S]*?renderer\.render\(_postScene, _postCamera\)/);
  assert.match(loop[0], /\} else \{[\s\S]*?renderer\.render\(scene, camera\);/);
  // resize håndterer target-størrelsen.
  assert.match(src, /resizePost\(\);/);
});

check("shaderen gjør tilt-shift + vignett + sRGB-encode (unngår dobbel tonemap)", () => {
  assert.match(src, /smoothstep\(uFocusHeight, uFocusHeight \+ uFalloff, d\) \* uMaxBlur/);
  assert.match(src, /uVignette/);
  assert.match(src, /lin2srgb/);
  assert.match(src, /toneMapped: false/);
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
