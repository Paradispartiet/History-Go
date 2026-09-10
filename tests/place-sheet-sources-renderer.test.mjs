import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const adapterSource = fs.readFileSync("js/ui/place-sheet/sections/sources.ts", "utf8");
const contextSource = fs.readFileSync("js/ui/place-sheet/place-section-context.ts", "utf8");
const learningSource = fs.readFileSync("js/ui/place-sheet/sections/learning.ts", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet-sources.css", "utf8");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitFor(predicate, timeoutMs = 1500) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return;
    await delay(10);
  }
  throw new Error("Timed out waiting for direct Sources owner");
}

test("Place Sheet Kilder renders from canonical Place/Leksikon context without popup DOM", () => {
  assert.doesNotMatch(adapterSource, /fetch\(/);
  assert.doesNotMatch(adapterSource, /DataHub/);
  assert.match(adapterSource, /resolvePlaceKnowledgeContext/);
  assert.match(adapterSource, /source_summary|sourceSummary/);
  assert.match(adapterSource, /externalLinks/);
  assert.match(adapterSource, /for_na/);
  assert.match(adapterSource, /data-hg-place-sheet-owner="sources"/);
  assert.doesNotMatch(adapterSource, /pcUnifiedKnowledgeHost/);
  assert.match(contextSource, /LEKSIKON_BY_PLACE/);
  assert.match(contextSource, /HGLeksikon/);
  assert.match(contextSource, /visibleArticlesForPlace/);
  assert.match(learningSource, /import "\.\/sources"/);
});

test("generated runtime renders direct Kilder after Fagverk with canonical links and escaping", async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard" class="is-unified-place is-place-sheet-phase1">
      <div class="pc-body">
        <section class="pc-sheet-shell" data-hg-place-sheet-shell="1" data-place-id="sted">
          <section data-hg-place-sheet-section="news"></section>
          <section data-hg-place-sheet-section="reading"></section>
          <section data-hg-place-sheet-section="language"></section>
          <section data-hg-place-sheet-section="learning"></section>
        </section>
      </div>
    </div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  const place = {
    id: "sted",
    name: "Sted",
    placeTier: "standard",
    source_summary: { safe_sources: ["Byarkiv & katalog"] },
    externalLinks: [{ type: "official", label: "Offisiell <side>", url: "https://example.com/place" }],
    for_na: { sources: ["https://example.com/compare"] }
  };
  window.PLACES = [place];
  window.LEKSIKON_BY_PLACE = {
    sted: [{ id: "main", title: "Sted", externalLinks: [{ type: "archive", label: "Arkiv & avis", url: "https://example.com/article" }] }]
  };

  window.eval(runtimeSource);
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: "sted", direct: true, phase: 6 } }));
  await waitFor(() => Boolean(window.document.querySelector('[data-hg-place-sheet-section="sources"] [data-hg-place-sheet-owner="sources"]')));

  const sourceSlot = window.document.querySelector('[data-hg-place-sheet-section="sources"]');
  const learningSlot = window.document.querySelector('[data-hg-place-sheet-section="learning"]');
  assert.ok(sourceSlot);
  assert.equal(sourceSlot.hidden, false);
  assert.equal(sourceSlot.dataset.placeId, "sted");
  assert.match(sourceSlot.textContent, /Byarkiv & katalog/);
  assert.match(sourceSlot.textContent, /Offisiell <side>/);
  assert.match(sourceSlot.textContent, /Arkiv & avis/);
  assert.equal(sourceSlot.querySelector('a[href="https://example.com/place"]')?.getAttribute("target"), "_blank");
  assert.ok(sourceSlot.querySelector('a[href="https://example.com/article"]'));
  assert.ok(sourceSlot.querySelector('a[href="https://example.com/compare"]'));
  assert.equal(window.document.querySelector('#pcUnifiedKnowledgeHost'), null);
  assert.equal(learningSlot.nextElementSibling, sourceSlot, "Kilder must follow Fagverk in the canonical stream");
  dom.window.close();
});

test("Kilder has a direct owner even when no user-facing sources are registered", async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard"><div class="pc-body"><section data-hg-place-sheet-shell="1" data-place-id="sted"></section></div></div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  window.PLACES = [{ id: "sted", name: "Sted", placeTier: "standard" }];
  window.LEKSIKON_BY_PLACE = { sted: [] };
  window.eval(runtimeSource);
  assert.equal(window.HGPlaceSheetSections?.sources?.adopt("sted"), null);
  await waitFor(() => Boolean(window.document.querySelector('[data-hg-place-sheet-section="sources"] [data-hg-place-sheet-owner="sources"]')));
  const slot = window.document.querySelector('[data-hg-place-sheet-section="sources"]');
  assert.equal(slot.hidden, false);
  assert.equal(slot.dataset.placeId, "sted");
  assert.match(slot.textContent, /Ingen brukerrettede kilder/);
  dom.window.close();
});

test("direct Kilder panel has responsive Place Sheet compatibility styling", () => {
  assert.match(css, /canonical Kilder compatibility surface/);
  assert.match(css, /pc-sheet-canonical-sources/);
  assert.match(css, /position:static !important/);
  assert.match(css, /overflow:visible/);
  assert.match(css, /hg-place-source-link-list/);
  assert.match(css, /@media \(max-width:720px\)/);
});
