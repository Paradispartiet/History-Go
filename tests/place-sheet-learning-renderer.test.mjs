import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const adapterSource = fs.readFileSync("js/ui/place-sheet/sections/learning.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const learningSource = fs.readFileSync("js/ui/place-learning-surface.js", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet-learning.css", "utf8");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitFor(predicate, timeoutMs = 1500) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return;
    await delay(10);
  }
  throw new Error("Timed out waiting for direct Fagverk owner");
}

test("Place Sheet Fagverk adapter calls the existing HGPlaceLearningSurface owner directly", () => {
  assert.doesNotMatch(adapterSource, /fetch\(/);
  assert.match(adapterSource, /HGPlaceLearningSurface/);
  assert.match(adapterSource, /loadRegistry/);
  assert.match(adapterSource, /renderLearningSection/);
  assert.match(adapterSource, /data-hg-place-sheet-owner/);
  assert.doesNotMatch(adapterSource, /pcUnifiedKnowledgeHost/);
  assert.match(learningSource, /function loadRegistry/);
  assert.match(learningSource, /function renderLearningSection/);
  assert.match(learningSource, /global\.HGPlaceLearningSurface/);
  assert.match(shellSource, /sections\/learning/);
});

test("generated runtime renders Fagverk directly after Språk without a popup host", async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard" class="is-unified-place is-place-sheet-phase1">
      <div class="pc-body">
        <section class="pc-sheet-shell" data-hg-place-sheet-shell="1" data-place-id="sted">
          <section data-hg-place-sheet-section="news"></section>
          <section data-hg-place-sheet-section="reading"></section>
          <section data-hg-place-sheet-section="language"></section>
        </section>
      </div>
    </div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  window.PLACES = [{ id: "sted", name: "Sted", placeTier: "standard" }];
  window.HGPlaceLearningSurface = {
    loadRegistry: async () => ({ subjects: {} }),
    renderLearningSection: (_registry, place) => `<section class="hg-section hg-place-learning-section"><a href="fagverk-sted.html?place=${place.id}">Fagverkinnhold</a></section>`
  };
  window.eval(runtimeSource);
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: "sted", direct: true, phase: 6 } }));
  await waitFor(() => Boolean(window.document.querySelector('[data-hg-place-sheet-section="learning"] [data-hg-place-sheet-owner="learning"]')));

  const slot = window.document.querySelector('[data-hg-place-sheet-section="learning"]');
  assert.ok(slot);
  assert.equal(slot.hidden, false);
  assert.equal(slot.dataset.placeId, "sted");
  assert.match(slot.textContent, /Fagverkinnhold/);
  assert.ok(slot.querySelector('[data-hg-place-sheet-owner="learning"]'));
  assert.equal(window.document.querySelector('#pcUnifiedKnowledgeHost'), null);
  assert.ok(slot.querySelector('.pc-sheet-learning-compat.hg-place-popup-v2'));

  const language = window.document.querySelector('[data-hg-place-sheet-section="language"]');
  assert.equal(language.nextElementSibling, slot, "Fagverk must follow Språk in the canonical stream");
  dom.window.close();
});

test("Fagverk adapter fails closed when the canonical owner yields no registry/content", async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard"><div class="pc-body"><section data-hg-place-sheet-shell="1" data-place-id="sted"></section></div></div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  window.PLACES = [{ id: "sted", name: "Sted", placeTier: "standard" }];
  window.HGPlaceLearningSurface = { loadRegistry: async () => null, renderLearningSection: () => "" };
  window.eval(runtimeSource);
  assert.equal(window.HGPlaceSheetSections?.learning?.adopt("sted"), null);
  await delay(20);
  const slot = window.document.querySelector('[data-hg-place-sheet-section="learning"]');
  assert.ok(slot);
  assert.equal(slot.hidden, true);
  assert.equal(slot.dataset.placeId, undefined);
  assert.equal(slot.querySelector('[data-hg-place-sheet-owner="learning"]'), null);
  dom.window.close();
});

test("direct Fagverk compatibility root has explicit Place Sheet layout overrides", () => {
  assert.match(css, /canonical Fagverk compatibility surface/);
  assert.match(css, /pc-sheet-learning-compat\.hg-place-popup-v2/);
  assert.match(css, /position:static !important/);
  assert.match(css, /overflow:visible/);
  assert.match(css, /pc-unified-section-title/);
});
