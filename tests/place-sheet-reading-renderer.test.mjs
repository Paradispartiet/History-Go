import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const rendererSource = fs.readFileSync("js/ui/place-sheet/sections/reading.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const popupSource = fs.readFileSync("js/ui/place-popup-tabs.js", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet-reading.css", "utf8");

test("Lesespor keeps canonical loading owners while Place Sheet owns filtering/rendering", () => {
  assert.match(rendererSource, /HGPlaceOpen\?\.get/);
  assert.match(rendererSource, /DataHub\?\.loadLesespor/);
  assert.doesNotMatch(rendererSource, /fetch\(/);
  assert.doesNotMatch(rendererSource, /data\/lesespor/);
  assert.match(rendererSource, /filterReadingForPlace/);
  assert.match(rendererSource, /data-hg-place-sheet-owner="reading"/);
  assert.match(shellSource, /sections\/reading/);
  assert.match(popupSource, /async function loadLesespor/);
  assert.match(popupSource, /function renderLesespor/);
});

test("generated runtime filters by place, rejects paywalls, deduplicates and escapes", () => {
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  window.eval(runtimeSource);

  const api = window.HGPlaceSheetSections?.reading;
  assert.equal(typeof api?.filterForPlace, "function");
  assert.equal(typeof api?.renderHtml, "function");
  assert.equal(typeof api?.mount, "function");
  assert.equal(typeof api?.resolve, "function");

  const items = [
    { id: "a", title: "Ny <tekst>", place_ids: ["sted"], year: 2026, access: "open", publication: "Arkiv & avis", relevance: "Viktig > nå", url: "https://example.com/a" },
    { id: "b", title: "Betalt", place_ids: ["sted"], year: 2025, access: "subscription", url: "https://example.com/b" },
    { id: "c", title: "Annet sted", place_ids: ["annet"], year: 2024, access: "open", url: "https://example.com/c" },
    { id: "a", title: "Duplikat", place_ids: ["sted"], year: 2023, access: "open", url: "https://example.com/dup" },
    { id: "d", title: "Utrygg lenke", place_ids: ["sted"], year: 2022, access: "unknown", url: "http://example.com/d" }
  ];

  const filtered = api.filterForPlace(items, "sted");
  assert.deepEqual(filtered.map(item => item.id), ["a", "d"]);
  const html = api.renderHtml(items, "sted");
  assert.match(html, /Ny &lt;tekst&gt;/);
  assert.match(html, /Arkiv &amp; avis/);
  assert.match(html, /Viktig &gt; nå/);
  assert.match(html, /https:\/\/example\.com\/a/);
  assert.doesNotMatch(html, /Betalt/);
  assert.doesNotMatch(html, /Annet sted/);
  assert.doesNotMatch(html, /http:\/\/example\.com\/d/);
  dom.window.close();
});

test("unified Place Sheet mounts Lesespor and retires only the embedded fallback panel", async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard" class="is-unified-place is-place-sheet-phase1">
      <div class="pc-body">
        <section class="pc-sheet-shell" data-hg-place-sheet-shell="1">
          <section data-hg-place-sheet-news></section>
        </section>
        <section id="pcUnifiedKnowledgeHost">
          <section data-place-panel="reading">legacy reading</section>
        </section>
      </div>
    </div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  window.HGPlaceOpen = {
    get: id => id === "sted" ? { lesespor: [{ id: "open", title: "Åpen tekst", place_ids: ["sted"], access: "open", url: "https://example.com/open" }] } : null
  };
  window.eval(runtimeSource);
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: "sted" } }));
  await new Promise(resolve => window.setTimeout(resolve, 0));

  const slot = window.document.querySelector('[data-hg-place-sheet-section="reading"]');
  assert.ok(slot);
  assert.equal(slot.hidden, false);
  assert.match(slot.textContent, /Lesespor/);
  assert.match(slot.textContent, /Åpen tekst/);
  assert.equal(window.document.querySelector('#pcUnifiedKnowledgeHost [data-place-panel="reading"]'), null);
  assert.equal(slot.getAttribute("data-place-panel"), "reading");
  dom.window.close();
});

test("canonical Lesespor has a direct responsive Place Sheet stylesheet", () => {
  assert.match(css, /canonical Lesespor/);
  assert.match(css, /pc-sheet-canonical-reading/);
  assert.match(css, /pc-sheet-reading-list/);
  assert.match(css, /repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media \(max-width:720px\)/);
});
