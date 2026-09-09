import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const adapterSource = fs.readFileSync("js/ui/place-sheet/sections/sources.ts", "utf8");
const learningSource = fs.readFileSync("js/ui/place-sheet/sections/learning.ts", "utf8");
const popupSource = fs.readFileSync("js/ui/place-popup-tabs.js", "utf8");
const popupV2Source = fs.readFileSync("js/ui/place-popup-v2.js", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet-sources.css", "utf8");

test("Place Sheet Kilder adapter preserves canonical source owners", () => {
  assert.doesNotMatch(adapterSource, /fetch\(/);
  assert.doesNotMatch(adapterSource, /DataHub/);
  assert.doesNotMatch(adapterSource, /HGPlaceOpen/);
  assert.doesNotMatch(adapterSource, /source_summary|sourceSummary|externalLinks|for_na/);
  assert.match(popupV2Source, /function renderSourceSummary\(place\)/);
  assert.match(popupV2Source, /hg-place-sources-section/);
  assert.match(popupSource, /function renderSources\(place, articles, includeProfileLabels = true\)/);
  assert.match(popupSource, /append\(tabs\.panels\.sources, renderSources/);
  assert.match(learningSource, /import "\.\/sources"/);
});

test("generated runtime moves the exact Sources panel after Fagverk and keeps later hydration alive", () => {
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
            <div class="hg-place-tab-panels">
              <section class="hg-place-tab-panel" data-place-panel="sources">
                <h2 class="pc-unified-section-title">Kilder</h2>
                <section class="hg-place-sources-section"><ul><li>Canonical source profile</li></ul></section>
              </section>
            </div>
            <section class="hg-place-tab-panel pc-unified-learning-panel" data-hg-unified-section="learning">
              <section class="hg-place-learning-section">Fagverkinnhold</section>
            </section>
          </article>
        </section>
      </div>
    </div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  const sourcePanelBefore = window.document.querySelector('[data-place-panel="sources"]');

  window.eval(runtimeSource);
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: "sted" } }));

  const sourceSlot = window.document.querySelector('[data-hg-place-sheet-section="sources"]');
  const learningSlot = window.document.querySelector('[data-hg-place-sheet-section="learning"]');
  assert.ok(sourceSlot);
  assert.ok(learningSlot);
  assert.equal(sourceSlot.hidden, false);
  assert.equal(sourceSlot.dataset.placeId, "sted");
  assert.equal(sourceSlot.querySelector('[data-place-panel="sources"]'), sourcePanelBefore, "canonical Sources panel must move, not clone");
  assert.equal(window.document.querySelector('#pcUnifiedKnowledgeHost [data-place-panel="sources"]'), null);
  assert.equal(learningSlot.nextElementSibling, sourceSlot, "Kilder must follow Fagverk in the canonical stream");

  sourcePanelBefore.insertAdjacentHTML("beforeend", '<div data-generated="sources"><a href="https://example.com/source">Sen kildehydrering</a></div>');
  assert.match(sourceSlot.textContent, /Sen kildehydrering/, "async popup hydration must continue on the moved panel");
  dom.window.close();
});

test("Kilder adapter fails closed outside the unified canonical Sources panel", () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard"><div class="pc-body"><section data-hg-place-sheet-shell="1"></section></div></div>
    <section class="hg-popup place-popup-v2"><section data-place-panel="sources">Standalone Sources</section></section>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  window.eval(runtimeSource);
  assert.equal(window.HGPlaceSheetSections?.sources?.adopt("sted"), null);
  assert.equal(window.document.querySelector('[data-hg-place-sheet-section="sources"]'), null);
  assert.match(window.document.querySelector('.place-popup-v2 [data-place-panel="sources"]').textContent, /Standalone Sources/);
  dom.window.close();
});

test("adopted Kilder panel has direct responsive Place Sheet compatibility styling", () => {
  assert.match(css, /canonical Kilder compatibility surface/);
  assert.match(css, /pc-sheet-canonical-sources/);
  assert.match(css, /position:static !important/);
  assert.match(css, /overflow:visible/);
  assert.match(css, /hg-place-source-link-list/);
  assert.match(css, /@media \(max-width:720px\)/);
});
