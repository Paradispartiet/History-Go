import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const popupSource = fs.readFileSync("js/ui/place-popup-v2.js", "utf8");
const unifiedSource = fs.readFileSync("js/ui/place-unified-surface.ts", "utf8");

test("Phase 6 standard Places bypass the legacy popup renderer and mount Place Sheet directly", () => {
  assert.match(unifiedSource, /mountPlaceSheetPhase1\(place\)/);
  assert.match(unifiedSource, /dispatchDirectReady\(place, generation\)/);
  assert.doesNotMatch(
    unifiedSource,
    /legacyShowPlacePopup\(place,\s*\{\s*unifiedHost:/,
    "standard Unified materialization must not route through the popup renderer"
  );
  assert.match(
    unifiedSource,
    /if \(isMicro\(canonical\)\) return current\.apply\(this, \[canonical, target\]\)/,
    "Micro Places must retain the legacy popup path"
  );
});

test("place-popup-v2 can render a standard Place directly into an explicit host", async () => {
  const dom = new JSDOM(`<!doctype html><html><body class="hg-app">
    <div id="placeCard" data-current-place-id="explicit_host_place"></div>
    <div id="host"></div>
  </body></html>`, {
    url: "https://history-go.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  let legacyPopupCalls = 0;
  let closes = 0;
  window.showPlacePopup = () => undefined;
  window.makePopup = () => { legacyPopupCalls += 1; };
  window.closePopup = () => { closes += 1; };
  window.eval(popupSource);

  const host = window.document.getElementById("host");
  const place = {
    id: "explicit_host_place",
    name: "Explicit Host Place",
    category: "historie",
    desc: "Kort beskrivelse.",
    popupDesc: "En lengre canonical beskrivelse av stedet."
  };

  await window.showPlacePopup(place, { unifiedHost: host });

  assert.equal(legacyPopupCalls, 0, "explicit host rendering must bypass standalone makePopup");
  assert.equal(closes, 1, "explicit host rendering keeps close-before-open semantics");
  const shell = host.querySelector(":scope > .hg-popup.place-popup-v2");
  assert.ok(shell, "canonical renderer must create its compatibility shell directly inside the host");
  assert.equal(shell.dataset.hgUnifiedDirectHost, "1");
  assert.ok(shell.querySelector(".hg-place-popup-v2 .hg-modal-title"));
  assert.match(shell.textContent, /Explicit Host Place/);
  assert.equal(window.document.querySelector("body > .hg-popup.place-popup-v2"), null);
  dom.window.close();
});

test("place-popup-v2 keeps standalone makePopup when no explicit host is supplied", async () => {
  const dom = new JSDOM(`<!doctype html><html><body></body></html>`, {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  let legacyPopupCalls = 0;
  window.showPlacePopup = () => undefined;
  window.makePopup = () => { legacyPopupCalls += 1; };
  window.eval(popupSource);

  await window.showPlacePopup({ id: "legacy_place", name: "Legacy Place", desc: "Beskrivelse" });
  assert.equal(legacyPopupCalls, 1);
  dom.window.close();
});
