#!/usr/bin/env node
// Regression: legacy post-ready loaders can evaluate badges.js twice.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../js/ui/badges.js", import.meta.url), "utf8");
let clickListeners = 0;
let openCount = 0;
let loadCount = 0;
const window = {
  openPlaceCard: async () => { openCount += 1; return "opened"; },
  DataHub: {
    loadBadges: async () => {
      loadCount += 1;
      return [{ id: "historie", name: "Historie" }];
    }
  }
};
const document = {
  addEventListener(type) {
    if (type === "click") clickListeners += 1;
  },
  getElementById() { return null; }
};
const context = vm.createContext({ window, document, console, setTimeout });

vm.runInContext(source, context, { filename: "badges.js:first" });
const firstWrapper = window.openPlaceCard;
assert.equal(typeof window.ensureBadgesLoaded, "function");
assert.equal(clickListeners, 1, "one popup toggle listener");

vm.runInContext(source, context, { filename: "badges.js:second" });
assert.equal(window.openPlaceCard, firstWrapper, "second evaluation must not rewrap PlaceCard");
assert.equal(clickListeners, 1, "second evaluation must not add another popup listener");
assert.equal(window.__hgBadgeRuntimeState.patchApplied, true);

assert.equal(await window.openPlaceCard({ id: "minneparken_gamlebyen" }), "opened");
assert.equal(openCount, 1, "openPlaceCard must run exactly once");
assert.equal(loadCount, 1, "badge data must be loaded exactly once");
assert.equal(window.BADGES.length, 1);

console.log("badges.js classic-script double-load is idempotent");
