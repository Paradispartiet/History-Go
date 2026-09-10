import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const rendererSource = fs.readFileSync("js/ui/place-sheet/sections/language.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const languageSource = fs.readFileSync("js/ui/place-language-layer.js", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet-language.css", "utf8");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitFor(predicate, timeoutMs = 1500) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return;
    await delay(10);
  }
  throw new Error("Timed out waiting for direct language owner");
}

test("Place Sheet language adapter leaves canonical loading and rich rendering in HGLanguageLayer", () => {
  assert.doesNotMatch(rendererSource, /fetch\(/);
  assert.doesNotMatch(rendererSource, /data\/leksikon\/sprak/);
  assert.doesNotMatch(rendererSource, /loadForPlace/);
  assert.match(rendererSource, /HGLanguageLayer/);
  assert.match(rendererSource, /decoratePopup/);
  assert.match(rendererSource, /data-hg-place-sheet-language-scaffold/);
  assert.match(rendererSource, /data-hg-place-sheet-owner/);
  assert.doesNotMatch(rendererSource, /pcUnifiedKnowledgeHost/);
  assert.match(languageSource, /async function loadForPlace/);
  assert.match(languageSource, /function renderLanguagePanel/);
  assert.match(languageSource, /function bindLanguagePanel/);
  assert.match(languageSource, /async function decorateLanguage/);
  assert.match(shellSource, /sections\/language/);
});

test("generated runtime lets HGLanguageLayer render directly into a temporary scaffold and keeps only the owner panel", async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard" class="is-unified-place is-place-sheet-phase1">
      <div class="pc-body">
        <section class="pc-sheet-shell" data-hg-place-sheet-shell="1" data-place-id="sted">
          <section data-hg-place-sheet-section="news"></section>
          <section data-hg-place-sheet-section="reading" data-place-panel="reading"></section>
        </section>
      </div>
    </div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  window.PLACES = [{ id: "sted", name: "Sted", placeTier: "standard" }];
  window.HGLanguageLayer = {
    decoratePopup: async (place, root) => {
      const panels = root.querySelector('.hg-place-tab-panels');
      const panel = window.document.createElement('section');
      panel.className = 'hg-place-tab-panel hg-place-language-panel';
      panel.dataset.placePanel = 'language';
      panel.hidden = true;
      panel.setAttribute('aria-hidden', 'true');
      panel.setAttribute('aria-labelledby', 'temporary-tab');
      panel.innerHTML = `<div class="hg-language-layer" data-language-place="${place.id}"><button id="bound-control">Språkknapp</button></div>`;
      panels.appendChild(panel);
    }
  };
  window.eval(runtimeSource);

  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: "sted", direct: true, phase: 6 } }));
  await waitFor(() => Boolean(window.document.querySelector('[data-hg-place-sheet-section="language"] [data-hg-place-sheet-owner="language"]')));

  const slot = window.document.querySelector('[data-hg-place-sheet-section="language"]');
  const panel = slot.querySelector('.hg-place-language-panel');
  assert.ok(slot);
  assert.equal(slot.hidden, false);
  assert.equal(slot.getAttribute("data-place-panel"), "language");
  assert.equal(slot.dataset.placeId, "sted");
  assert.ok(panel);
  assert.equal(panel.hidden, false);
  assert.equal(panel.getAttribute("aria-hidden"), null);
  assert.equal(panel.getAttribute("aria-labelledby"), null);
  assert.equal(panel.getAttribute("data-hg-place-sheet-owner"), "language");
  assert.equal(window.document.querySelector('#pcUnifiedKnowledgeHost'), null);
  assert.equal(slot.querySelector('[data-hg-place-sheet-language-scaffold="1"]'), null, "temporary scaffold must be discarded after owner rendering");
  assert.ok(slot.querySelector('.pc-sheet-language-compat.hg-place-popup-v2[data-hg-language-layer="1"]'));

  const reading = window.document.querySelector('[data-hg-place-sheet-section="reading"]');
  assert.equal(reading.nextElementSibling, slot, "Språk must follow Lesespor in the canonical stream");
  dom.window.close();
});

test("language adapter remains hidden and unowned when HGLanguageLayer yields no panel", async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard"><div class="pc-body"><section class="pc-sheet-shell" data-hg-place-sheet-shell="1" data-place-id="sted"></section></div></div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  window.PLACES = [{ id: "sted", name: "Sted", placeTier: "standard" }];
  window.HGLanguageLayer = { decoratePopup: async () => {} };
  window.eval(runtimeSource);
  assert.equal(window.HGPlaceSheetSections?.language?.adopt("sted"), null);
  await delay(20);
  const slot = window.document.querySelector('[data-hg-place-sheet-section="language"]');
  assert.ok(slot);
  assert.equal(slot.hidden, true);
  assert.equal(slot.dataset.placeId, undefined);
  assert.equal(slot.querySelector('[data-hg-place-sheet-owner="language"]'), null);
  dom.window.close();
});

test("direct language compatibility root has explicit Place Sheet layout overrides", () => {
  assert.match(css, /canonical Språk compatibility surface/);
  assert.match(css, /pc-sheet-language-compat\.hg-place-popup-v2/);
  assert.match(css, /position:static !important/);
  assert.match(css, /overflow:visible/);
});
