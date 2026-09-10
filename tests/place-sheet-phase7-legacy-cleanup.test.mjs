import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = path => fs.readFileSync(path, "utf8");
const unified = read("js/ui/place-unified-surface.ts");
const popup = read("js/ui/place-popup-v2.js");
const loader = read("js/ui/place-card-status-surface.js");
const shortcuts = read("js/ui/place-popup-shortcuts.js");
const shortcutsCss = read("css/place-popup-shortcuts.css");
const unifiedCss = read("css/place-unified-surface.css");

test("Phase 7 retires the standard popup host bridge and embedded shell CSS", () => {
  assert.equal(fs.existsSync("js/ui/place-popup-unified-host-bridge.js"), false);
  assert.equal(fs.existsSync("tests/place-popup-unified-host-bridge.test.mjs"), false);
  assert.doesNotMatch(loader, /place-popup-unified-host-bridge/);
  assert.doesNotMatch(popup, /unifiedHost|hgUnifiedDirectHost|place-unified-host-rendered/);
  assert.doesNotMatch(unified, /pcUnifiedKnowledgeHost|hg-unified-renderer-embedded|hg-unified-place-staging/);
  assert.doesNotMatch(unifiedCss, /pc-unified-knowledge-host|hg-unified-renderer-embedded|hg-unified-place-staging/);
});

test("Phase 7 removes shortcut geometry but preserves compatibility routing", () => {
  assert.doesNotMatch(shortcuts, /data-place-popup-tab|<svg/);
  assert.match(shortcuts, /HGPlacePopupShortcuts/);
  assert.match(shortcuts, /HGPlacePopupTabs\?\.openTab/);
  assert.match(shortcuts, /showPlacePopup\(place, tabId\)/);
  assert.doesNotMatch(shortcutsCss, /pc-place-popup-shortcut|repeat\(6/);
  assert.match(shortcutsCss, /#placeCard \.pc-events-quad\{[\s\S]*grid-row:2/);
});

test("standard Places stay direct while Micro retains legacy popup routing", () => {
  assert.match(unified, /mountPlaceSheetPhase1\(place\)/);
  assert.match(unified, /detail: \{ placeId: placeId\(place\), direct: true, phase: 7 \}/);
  assert.match(unified, /if \(isMicro\(canonical\)\) return current\.apply\(this, \[canonical, target\]\)/);
  assert.match(unified, /return openSection\(canonical, target \|\| "about"\)/);
  assert.match(unified, /phase:\s*7/);
  assert.match(popup, /renderMicroPlacePopup/);
  assert.match(popup, /micro-place-popup-shell/);
});
