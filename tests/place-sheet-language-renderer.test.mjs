import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const rendererSource = fs.readFileSync("js/ui/place-sheet/sections/language.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const languageSource = fs.readFileSync("js/ui/place-language-layer.js", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet-language.css", "utf8");

test("Place Sheet language adapter leaves canonical loading and rich rendering in HGLanguageLayer", () => {
  assert.doesNotMatch(rendererSource, /fetch\(/);
  assert.doesNotMatch(rendererSource, /data\/leksikon\/sprak/);
  assert.doesNotMatch(rendererSource, /loadForPlace/);
  assert.match(languageSource, /async function loadForPlace/);
  assert.match(languageSource, /function renderLanguagePanel/);
  assert.match(languageSource, /function bindLanguagePanel/);
  assert.match(languageSource, /async function decorateLanguage/);
  assert.match(shellSource, /sections\/language/);
});

test("generated runtime adopts the already-rendered unified language panel without cloning it", () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard" class="is-unified-place is-place-sheet-phase1">
      <div class="pc-body">
        <section class="pc-sheet-shell" data-hg-place-sheet-shell="1">
          <section data-hg-place-sheet-section="news"></section>
          <section data-hg-place-sheet-section="reading" data-place-panel="reading"></section>
        </section>
        <section id="pcUnifiedKnowledgeHost">
          <article class="hg-place-popup-v2" data-hg-language-layer="1">
            <section data-language-teaser>legacy teaser</section>
            <div class="hg-place-tab-panels">
              <section class="hg-place-tab-panel hg-place-language-panel" data-place-panel="language" hidden aria-hidden="true" aria-labelledby="legacy-tab">
                <div class="hg-language-layer" data-language-place="sted"><button id="bound-control">Språkknapp</button></div>
              </section>
            </div>
          </article>
        </section>
      </div>
    </div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  const panelBefore = window.document.querySelector('.hg-place-language-panel[data-place-panel="language"]');
  window.eval(runtimeSource);

  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: "sted" } }));

  const slot = window.document.querySelector('[data-hg-place-sheet-section="language"]');
  assert.ok(slot);
  assert.equal(slot.hidden, false);
  assert.equal(slot.getAttribute("data-place-panel"), "language");
  assert.equal(slot.dataset.placeId, "sted");
  assert.equal(slot.querySelector('.hg-place-language-panel'), panelBefore, "canonical language DOM should be moved, not cloned");
  assert.equal(panelBefore.hidden, false);
  assert.equal(panelBefore.getAttribute("aria-hidden"), null);
  assert.equal(panelBefore.getAttribute("aria-labelledby"), null);
  assert.equal(window.document.querySelector('#pcUnifiedKnowledgeHost .hg-place-language-panel'), null);
  assert.equal(window.document.querySelector('#pcUnifiedKnowledgeHost [data-language-teaser]'), null);
  assert.ok(slot.querySelector('.pc-sheet-language-compat.hg-place-popup-v2[data-hg-language-layer="1"]'));

  const reading = window.document.querySelector('[data-hg-place-sheet-section="reading"]');
  assert.equal(reading.nextElementSibling, slot, "Språk must follow Lesespor in the canonical stream");
  dom.window.close();
});

test("language adapter fails closed for missing or mismatched rendered language content", () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard"><div class="pc-body"><section class="pc-sheet-shell" data-hg-place-sheet-shell="1"></section></div></div>
    <section id="pcUnifiedKnowledgeHost"><section class="hg-place-language-panel" data-place-panel="language"><div data-language-place="other"></div></section></section>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  window.eval(runtimeSource);
  assert.equal(window.HGPlaceSheetSections?.language?.adopt("sted"), null);
  assert.equal(window.document.querySelector('[data-hg-place-sheet-section="language"]'), null);
  dom.window.close();
});

test("direct language compatibility root has explicit Place Sheet layout overrides", () => {
  assert.match(css, /canonical Språk compatibility surface/);
  assert.match(css, /pc-sheet-language-compat\.hg-place-popup-v2/);
  assert.match(css, /position:static !important/);
  assert.match(css, /overflow:visible/);
});
