const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = path.join(__dirname, "..");

function runViewport(width, height) {
  const classes = new Set(["hg-app"]);
  const properties = new Map();
  const shell = { style: {} };
  const mapLayer = { style: {} };
  const body = {
    classList: {
      toggle(name, enabled) {
        if (enabled) classes.add(name);
        else classes.delete(name);
      }
    }
  };
  const document = {
    body,
    activeElement: null,
    documentElement: {
      style: {
        setProperty(name, value) {
          properties.set(name, value);
        }
      }
    },
    querySelector(selector) {
      return selector === ".app-shell" ? shell : null;
    },
    getElementById(id) {
      return id === "mapLayer" ? mapLayer : null;
    },
    addEventListener() {}
  };
  const window = {
    innerWidth: width,
    innerHeight: height,
    visualViewport: null,
    addEventListener() {}
  };
  const context = {
    window,
    document,
    HTMLElement: function HTMLElement() {},
    requestAnimationFrame(callback) {
      callback();
      return 1;
    },
    setTimeout
  };

  const source = fs.readFileSync(path.join(repoRoot, "js/core/viewportManager.js"), "utf8");
  vm.runInNewContext(source, context, { filename: "viewportManager.js" });
  window.ViewportManager.init();

  return { classes, shell, properties, viewport: window.HGViewport };
}

function testNarrowIpadKeepsTabletCanvasWithCompactUi() {
  const result = runViewport(650, 900);

  assert.equal(result.viewport.mode, "tablet");
  assert.equal(result.viewport.uiMode, "phone");
  assert.equal(result.viewport.designWidth, 900);
  assert.ok(result.viewport.scale < 1);
  assert.equal(result.classes.has("hg-phone"), true);
  assert.equal(result.classes.has("hg-tablet"), false);
}

function testWideViewportUsesTabletUi() {
  const result = runViewport(1024, 900);

  assert.equal(result.viewport.mode, "tablet");
  assert.equal(result.viewport.uiMode, "tablet");
  assert.equal(result.classes.has("hg-phone"), false);
  assert.equal(result.classes.has("hg-tablet"), true);
}

function testFixedLayersHaveNarrowViewportRules() {
  const miniProfile = fs.readFileSync(path.join(repoRoot, "css/miniProfile.css"), "utf8");
  const onboarding = fs.readFileSync(path.join(repoRoot, "css/onboarding.css"), "utf8");

  assert.match(
    miniProfile,
    /body\.hg-app header\.site-header \.hg-brand\s*\{\s*width:\s*54px;/s,
    "compact logo rule must match the specificity of the 112px theme rule"
  );
  assert.match(onboarding, /@media \(max-width:\s*860px\)[\s\S]*font-size:\s*16px;/);
  assert.match(onboarding, /@media \(max-width:\s*860px\)[\s\S]*\.hg-onb-title\s*\{\s*font-size:\s*22px;/s);
}

function testChangedResourcesAreCacheBusted() {
  const index = fs.readFileSync(path.join(repoRoot, "index.html"), "utf8");
  const app = fs.readFileSync(path.join(repoRoot, "js/app.js"), "utf8");
  const release = "20260825-narrow-ipad-scaling1";

  assert.match(index, new RegExp(`css/miniProfile\\.css\\?v=${release}`));
  assert.match(index, new RegExp(`css/onboarding\\.css\\?v=${release}`));
  assert.match(index, new RegExp(`js/app\\.js\\?v=${release}`));
  assert.match(app, new RegExp(`js/core/viewportManager\\.js\\?v=${release}`));
}

testNarrowIpadKeepsTabletCanvasWithCompactUi();
testWideViewportUsesTabletUi();
testFixedLayersHaveNarrowViewportRules();
testChangedResourcesAreCacheBusted();

console.log("Narrow iPad UI scaling checks passed.");
