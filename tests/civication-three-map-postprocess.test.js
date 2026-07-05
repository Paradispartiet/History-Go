#!/usr/bin/env node
// tests/civication-three-map-postprocess.test.js
//
// Verifiserer post-prosesseringen i CivicationThreeMap: en EffectComposer-kjede
// (RenderPass → SSAO → SMAA → OutputPass → tilt-shift/vignett), bak et
// kvalitetsnivå, med three + addons lastet LOKALT via import map (ingen CDN).
// Miljøet kan ikke kjøre WebGL i node, så testen dekker API + kildeassertjoner.
// Selve bildet (SSAO/SMAA/tilt-shift på vs. av) er bekreftet i ekte headless
// Chromium (SwiftShader WebGL).
//
// Kjør:  node tests/civication-three-map-postprocess.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const srcPath = path.join(repoRoot, "js/Civication/ui/CivicationThreeMap.js");
const src = fs.readFileSync(srcPath, "utf8");
const civHtml = fs.readFileSync(path.join(repoRoot, "Civication.html"), "utf8");

let failures = 0;
function check(name, fn) {
  try { fn(); console.log("  ok  -", name); }
  catch (e) { failures += 1; console.error("FAIL  -", name); console.error("       ", e && e.message); }
}

console.log("Civication 3D-kart – post-prosessering (SSAO/SMAA/tilt-shift)");

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

check("Civication.html har import map for three + three/addons (lokal, ingen CDN)", () => {
  assert.match(civHtml, /<script type="importmap">/);
  assert.match(civHtml, /"three":\s*"\.\/js\/vendor\/three\/three\.module\.js"/);
  assert.match(civHtml, /"three\/addons\/":\s*"\.\/js\/vendor\/three\/addons\/"/);
});

check("addons lastes via import map og deler three-instans", () => {
  // Hoved-three via bare specifier "three" (samme instans som addonene).
  assert.match(src, /await import\(\s*\/\* @vite-ignore \*\/\s*"three"\s*\)/);
  assert.match(src, /function loadPostAddons\(\)/);
  assert.match(src, /"three\/addons\/postprocessing\/"/);
  for (const mod of ["EffectComposer", "RenderPass", "ShaderPass", "SSAOPass", "SMAAPass", "OutputPass"]) {
    assert.match(src, new RegExp('"' + mod + '\\.js"'), "mangler addon-import: " + mod);
  }
});

check("kvalitetsnivået leses fra window.CIVICATION_MAP_QUALITY", () => {
  assert.match(src, /window\.CIVICATION_MAP_QUALITY/);
  assert.match(src, /if \(q === "high"\) return true;/);
  assert.match(src, /if \(q === "low" \|\| q === "off" \|\| q === "none"\) return false;/);
  assert.match(src, /cores <= 4 && minSide < 520/);
});

check("EffectComposer-kjeden bygges: Render → SSAO → SMAA → Output → tilt-shift", () => {
  const build = src.match(/function buildPostPipeline\(\)[\s\S]*?\n  \}/);
  assert.ok(build, "fant ikke buildPostPipeline");
  const b = build[0];
  assert.ok(b.indexOf("RenderPass") > -1, "mangler RenderPass");
  const iSSAO = b.indexOf("SSAOPass"), iSMAA = b.indexOf("SMAAPass"),
        iOut = b.indexOf("OutputPass"), iTilt = b.indexOf("_tiltPass = new ADDONS.ShaderPass");
  assert.ok(iSSAO > -1 && iSMAA > iSSAO && iOut > iSMAA && iTilt > iOut,
    "rekkefølgen skal være SSAO → SMAA → OutputPass → tilt-shift (sist)");
  // Fail-safe: uten addons eller ved feil kjøres direkte render.
  assert.match(b, /if \(!renderer \|\| !THREE \|\| !ADDONS\) return;/);
  assert.match(b, /catch \(e\) \{[\s\S]*?_postEnabled = false;/);
});

check("render-løkka bruker composer når på, ellers direkte render", () => {
  const loop = src.match(/function loop\(\)[\s\S]*?\n  \}/);
  assert.ok(loop, "fant ikke loop()");
  assert.match(loop[0], /if \(_postEnabled && _composer\)/);
  assert.match(loop[0], /_composer\.render\(\);/);
  assert.match(loop[0], /\} else \{[\s\S]*?renderer\.render\(scene, camera\);/);
  assert.match(src, /_composer\.setSize\(/);  // resize håndterer target-størrelsene
});

check("tilt-shift-shaderen gjør bånd-blur + vignett (kjører på sRGB etter OutputPass)", () => {
  assert.match(src, /smoothstep\(uFocusHeight, uFocusHeight \+ uFalloff, d\) \* uMaxBlur/);
  assert.match(src, /uVignette/);
  // Ingen egen sRGB-encode her – OutputPass har allerede tonemap+sRGB.
  assert.doesNotMatch(src, /lin2srgb/);
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
