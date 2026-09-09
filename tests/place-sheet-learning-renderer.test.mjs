import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const adapterSource = fs.readFileSync("js/ui/place-sheet/sections/learning.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const learningSource = fs.readFileSync("js/ui/place-learning-surface.js", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet-learning.css", "utf8");

test("Place Sheet Fagverk adapter leaves registry loading and canonical rendering in HGPlaceLearningSurface", () => {
  assert.doesNotMatch(adapterSource, /fetch\(/);
  assert.doesNotMatch(adapterSource, /loadRegistry/);
  assert.doesNotMatch(adapterSource, /renderLearningSection/);
  assert.match(learningSource, /function loadRegistry/);
  assert.match(learningSource, /function renderLearningSection/);
  assert.match(learningSource, /global\.HGPlaceLearningSurface/);
  assert.match(shellSource, /sections\/learning/);
});

test("generated runtime adopts the exact already-rendered Fagverk wrapper after Språk", () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard" class="is-unified-place is-place-sheet-phase1">
      <div class="pc-body">
        <section class="pc-sheet-shell" data-hg-place-sheet-shell="1">
          <section data-hg-place-sheet-section="news"></section>
          <section data-hg-place-sheet-section="reading"></section>
          <section data-hg-place-sheet-section="language"></section>
        </section>
        <section id="pcUnifiedKnowledgeHost">
          <article class="hg-place-popup-v2">
            <section class="hg-place-tab-panel pc-unified-learning-panel" data-hg-unified-section="learning" role="region">
              <h2 class="pc-unified-section-title">Fagverk</h2>
              <section class="hg-section hg-place-section hg-place-learning-section"><a href="fagverk-sted.html?place=sted">Fagverkinnhold</a></section>
            </section>
          </article>
        </section>
      </div>
    </div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  const learningBefore = window.document.querySelector('[data-hg-unified-section="learning"]');
  window.eval(runtimeSource);
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: "sted" } }));

  const slot = window.document.querySelector('[data-hg-place-sheet-section="learning"]');
  assert.ok(slot);
  assert.equal(slot.hidden, false);
  assert.equal(slot.dataset.placeId, "sted");
  assert.equal(slot.querySelector('[data-hg-unified-section="learning"]'), learningBefore, "canonical Fagverk DOM should move, not clone");
  assert.equal(window.document.querySelector('#pcUnifiedKnowledgeHost [data-hg-unified-section="learning"]'), null);
  assert.ok(slot.querySelector('.pc-sheet-learning-compat.hg-place-popup-v2'));

  const language = window.document.querySelector('[data-hg-place-sheet-section="language"]');
  assert.equal(language.nextElementSibling, slot, "Fagverk must follow Språk in the canonical stream");
  dom.window.close();
});

test("Fagverk adapter fails closed when canonical learning content was not rendered", () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard"><div class="pc-body"><section data-hg-place-sheet-shell="1"></section></div></div>
    <section id="pcUnifiedKnowledgeHost"><section data-hg-unified-section="learning"></section></section>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  window.eval(runtimeSource);
  assert.equal(window.HGPlaceSheetSections?.learning?.adopt("sted"), null);
  assert.equal(window.document.querySelector('[data-hg-place-sheet-section="learning"]'), null);
  dom.window.close();
});

test("direct Fagverk compatibility root has explicit Place Sheet layout overrides", () => {
  assert.match(css, /canonical Fagverk compatibility surface/);
  assert.match(css, /pc-sheet-learning-compat\.hg-place-popup-v2/);
  assert.match(css, /position:static !important/);
  assert.match(css, /overflow:visible/);
  assert.match(css, /pc-unified-section-title/);
});
