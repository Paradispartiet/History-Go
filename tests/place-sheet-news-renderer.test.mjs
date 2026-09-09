import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const rendererSource = fs.readFileSync("js/ui/place-sheet/sections/news.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const tabsSource = fs.readFileSync("js/ui/place-popup-tabs.js", "utf8");
const unifiedSource = fs.readFileSync("js/ui/place-unified-surface.ts", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");

test("News renderer is presentation-only and leaves canonical Leksikon loading/classification in popup hydration", () => {
  assert.doesNotMatch(rendererSource, /LEKSIKON_BY_PLACE/);
  assert.doesNotMatch(rendererSource, /classifyArticle/);
  assert.match(tabsSource, /async function loadLeksikon/);
  assert.match(tabsSource, /function classifyArticle/);
  assert.match(tabsSource, /historical_news/);
  assert.match(tabsSource, /news_notes/);
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

test("Unified Place Sheet owns loaded news while standalone popup retains shared fallback", () => {
  assert.match(shellSource, /sections\/news/);
  assert.match(shellSource, /pc-sheet-news/);
  assert.match(shellSource, /data-hg-place-sheet-section="news"/);
  assert.match(tabsSource, /HGPlaceSheetSections\?\.news\?\.renderContentHtml/);
  assert.match(tabsSource, /popup\.closest\("#pcUnifiedKnowledgeHost"\)/);
  assert.match(tabsSource, /HGPlaceSheetSections\?\.news\?\.mount/);
  assert.match(tabsSource, /buckets\.historical_news, buckets\.news_notes/);
  assert.match(tabsSource, /renderNews\(buckets\.historical_news, buckets\.news_notes\)/);
  assert.match(unifiedSource, /id === "before-after" \|\| id === "news"/);
  assert.match(unifiedSource, /placeSheetSectionTarget\("news"\)/);
  assert.match(unifiedSource, /\["about", "history", "stories", "before-after", "news"\]/);
});

test("direct Place Sheet News has responsive canonical card styling", () => {
  assert.match(css, /Phase 2 canonical News/);
  assert.match(css, /pc-sheet-canonical-news/);
  assert.match(css, /pc-sheet-news-list/);
  assert.match(css, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(css, /@media \(max-width:720px\)/);
});
