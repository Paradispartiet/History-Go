import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const popupSource = fs.readFileSync("js/ui/place-popup-v2.js", "utf8");
const unifiedSource = fs.readFileSync("js/ui/place-unified-surface.ts", "utf8");

test("Phase 7 removes the explicit popup-to-PlaceCard host presentation path", () => {
  assert.doesNotMatch(popupSource, /unifiedHost/);
  assert.doesNotMatch(popupSource, /hgUnifiedDirectHost/);
  assert.doesNotMatch(popupSource, /hg:place-unified-host-rendered/);
  assert.doesNotMatch(unifiedSource, /pcUnifiedKnowledgeHost/);
  assert.doesNotMatch(unifiedSource, /hg-unified-renderer-embedded/);
  assert.match(unifiedSource, /mountPlaceSheetPhase1\(place\)/);
  assert.match(unifiedSource, /phase:\s*7/);
});

test("standalone place-popup-v2 remains available as a compatibility fallback", async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  const calls = [];
  window.showPlacePopup = () => undefined;
  window.makePopup = (html, extraClass) => { calls.push({ html, extraClass }); };
  window.eval(popupSource);

  await window.showPlacePopup({ id: "legacy_place", name: "Legacy Place", category: "historie", desc: "Beskrivelse" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].extraClass, "place-popup place-popup-v2");
  assert.match(calls[0].html, /Legacy Place/);
  dom.window.close();
});

test("Micro keeps the dedicated mini-popup contract", async () => {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  const calls = [];
  window.showPlacePopup = () => undefined;
  window.makePopup = (html, extraClass) => { calls.push({ html, extraClass }); };
  window.eval(popupSource);

  await window.showPlacePopup({
    id: "micro_place",
    name: "Micro Place",
    category: "litteratur",
    placeTier: "micro",
    desc: "Kort beskrivelse",
    micro_place_profile: {
      schema: "history_go_micro_place_profile_v1",
      kind: "lesekiosk",
      currentStatus: "active",
      sourceUrl: "https://example.test/source",
      quizMode: "none"
    }
  });
  assert.equal(calls.length, 1);
  assert.match(calls[0].extraClass, /micro-place-popup-shell/);
  assert.match(calls[0].html, /data-place-tier="micro"/);
  dom.window.close();
});
