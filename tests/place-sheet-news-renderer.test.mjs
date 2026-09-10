import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const rendererSource = fs.readFileSync("js/ui/place-sheet/sections/news.ts", "utf8");
const contextSource = fs.readFileSync("js/ui/place-sheet/place-section-context.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const unifiedSource = fs.readFileSync("js/ui/place-unified-surface.ts", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitFor(predicate, timeoutMs = 1500) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return;
    await delay(10);
  }
  throw new Error("Timed out waiting for direct News owner");
}

test("News renderer uses shared canonical Leksikon context without popup hydration", () => {
  assert.doesNotMatch(rendererSource, /LEKSIKON_BY_PLACE/);
  assert.doesNotMatch(rendererSource, /classifyArticle/);
  assert.match(rendererSource, /resolvePlaceKnowledgeContext/);
  assert.doesNotMatch(rendererSource, /pcUnifiedKnowledgeHost/);
  assert.match(contextSource, /async function loadArticles/);
  assert.match(contextSource, /function classifyArticle/);
  assert.match(contextSource, /historical_news/);
  assert.match(contextSource, /news_notes/);
  assert.match(rendererSource, /Gamle nyheter/);
  assert.match(rendererSource, /Nyere notiser/);
  assert.match(rendererSource, /data-hg-place-sheet-owner="news"/);
});

test("generated runtime preserves both news buckets, source links and escaping", () => {
  const dom = new JSDOM("<!doctype html><html><head></head><body><div id='host'></div></body></html>", {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  window.eval(runtimeSource);

  const api = window.HGPlaceSheetSections?.news;
  assert.equal(typeof api?.renderContentHtml, "function");
  assert.equal(typeof api?.renderHtml, "function");
  assert.equal(typeof api?.mount, "function");
  assert.equal(typeof api?.adopt, "function");

  const historical = [{
    id: "old-1",
    title: "Avis <1900>",
    date: "1900-01-02",
    type: "historical_news",
    summary: { one_liner: "Gamle & viktige nyheter" },
    sources: [{ url: "https://example.com/old", label: "Arkiv & avis" }]
  }];
  const notes = [{
    id: "new-1",
    title: "Nyere > notis",
    year: 2026,
    type: "news_note",
    popupDesc: "Nå <senere>",
    sources: [{ url: "https://example.com/new", title: "Offisiell <kilde>" }]
  }];

  const html = api.renderHtml(historical, notes);
  assert.match(html, /Gamle nyheter/);
  assert.match(html, /Nyere notiser/);
  assert.match(html, /Avis &lt;1900&gt;/);
  assert.match(html, /Gamle &amp; viktige nyheter/);
  assert.match(html, /Nyere &gt; notis/);
  assert.match(html, /Nå &lt;senere&gt;/);
  assert.match(html, /Arkiv &amp; avis/);
  assert.match(html, /Offisiell &lt;kilde&gt;/);
  assert.match(html, /https:\/\/example\.com\/old/);
  assert.match(html, /https:\/\/example\.com\/new/);
  assert.doesNotMatch(html, /Avis <1900>/);

  const host = window.document.getElementById("host");
  const mounted = api.mount(host, historical, notes);
  assert.ok(mounted);
  assert.equal(host.hidden, false);
  assert.equal(mounted.dataset.hgPlaceSheetOwner, "news");

  const empty = window.document.createElement("div");
  assert.equal(api.mount(empty, [], []), null);
  assert.equal(empty.hidden, true);
  dom.window.close();
});

test("direct Place Sheet hydrates classified Leksikon news without a popup host", async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>
    <div id="placeCard"><div class="pc-body">
      <section class="pc-sheet-shell" data-hg-place-sheet-shell="1" data-place-id="sted">
        <section data-hg-place-sheet-news data-hg-place-sheet-section="news" hidden></section>
      </section>
    </div></div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const { window } = dom;
  window.PLACES = [{ id: "sted", name: "Sted", placeTier: "standard" }];
  window.LEKSIKON_BY_PLACE = {
    sted: [
      { id: "main", title: "Sted" },
      { id: "old", type: "historical_news", title: "Gammel avis", summary: { one_liner: "Historisk notis" } },
      { id: "new", type: "news_note", title: "Ny notis", popupDesc: "Nyere hendelse" }
    ]
  };
  window.eval(runtimeSource);
  window.dispatchEvent(new window.CustomEvent("hg:place-unified-ready", { detail: { placeId: "sted", direct: true, phase: 6 } }));
  await waitFor(() => Boolean(window.document.querySelector('[data-hg-place-sheet-section="news"] [data-hg-place-sheet-owner="news"]')));

  const slot = window.document.querySelector('[data-hg-place-sheet-section="news"]');
  assert.equal(slot.hidden, false);
  assert.equal(slot.dataset.placeId, "sted");
  assert.match(slot.textContent, /Gammel avis/);
  assert.match(slot.textContent, /Ny notis/);
  assert.equal(window.document.querySelector('#pcUnifiedKnowledgeHost'), null);
  dom.window.close();
});

test("Unified Place Sheet owns loaded news and direct section routing", () => {
  assert.match(shellSource, /sections\/news/);
  assert.match(shellSource, /pc-sheet-news/);
  assert.match(shellSource, /data-hg-place-sheet-section="news"/);
  assert.match(unifiedSource, /placeSheetSectionTarget\(id\)/);
  assert.match(unifiedSource, /\["about", "Om"\]/);
  assert.match(unifiedSource, /\["news", "Nyheter"\]/);
  assert.match(unifiedSource, /directStandardPlaces:\s*true/);
});

test("direct Place Sheet News has responsive canonical card styling", () => {
  assert.match(css, /Phase 2 canonical News/);
  assert.match(css, /pc-sheet-canonical-news/);
  assert.match(css, /pc-sheet-news-list/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media \(max-width:720px\)/);
});
