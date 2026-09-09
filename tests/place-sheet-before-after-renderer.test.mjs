import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const rendererSource = fs.readFileSync("js/ui/place-sheet/sections/before-after.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const tabsSource = fs.readFileSync("js/ui/place-popup-tabs.js", "utf8");
const unifiedSource = fs.readFileSync("js/ui/place-unified-surface.ts", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");

test("Before/after renderer owns canonical for_na without changing its source contract", () => {
  assert.match(rendererSource, /place\?\.for_na/);
  assert.match(rendererSource, /data\.beforeImage\s*\|\|\s*data\.before_image\s*\|\|\s*data\.imageBefore/);
  assert.match(rendererSource, /data\.nowImage\s*\|\|\s*data\.now_image\s*\|\|\s*data\.imageNow/);
  assert.match(rendererSource, /data\.beforeImageMeta\s*\|\|\s*data\.before_image_meta/);
  assert.match(rendererSource, /data\.lookFor\s*\|\|\s*data\.look_for\s*\|\|\s*data\.observe\s*\|\|\s*data\.observer/);
  assert.match(rendererSource, /data-hg-place-sheet-owner="before-after"/);
});

test("generated runtime preserves before/now imagery, attribution, prose and observation prompts", () => {
  const dom = new JSDOM("<!doctype html><html><head></head><body><div id='host'></div></body></html>", {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  window.eval(runtimeSource);

  const api = window.HGPlaceSheetSections?.beforeAfter;
  assert.equal(typeof api?.data, "function");
  assert.equal(typeof api?.renderContentHtml, "function");
  assert.equal(typeof api?.renderHtml, "function");
  assert.equal(typeof api?.mount, "function");

  const place = {
    id: "test-place",
    name: "Test & Place",
    for_na: {
      beforeImage: "bilder/places/test-before.webp",
      beforeImageLabel: "Før <1900>",
      beforeImageMeta: {
        credit: "Archive & Co",
        license: "CC BY-SA 4.0",
        sourcePage: "https://example.com/before"
      },
      nowImage: "https://images.example.com/now.webp",
      nowImageLabel: "Nå > 2026",
      nowImageMeta: {
        author: "Photo <Author>",
        sourceUrl: "https://example.com/now"
      },
      before: "Før <gaten>",
      now: "Nå & senere",
      change: "Endring > tidligere",
      lookFor: ["Detalj <A>", "Detalj & B"]
    }
  };

  const html = api.renderHtml(place);
  assert.match(html, /bilder\/places\/test-before\.webp/);
  assert.match(html, /https:\/\/images\.example\.com\/now\.webp/);
  assert.match(html, /Før &lt;1900&gt;/);
  assert.match(html, /Test &amp; Place/);
  assert.match(html, /Archive &amp; Co · CC BY-SA 4\.0/);
  assert.match(html, /https:\/\/example\.com\/before/);
  assert.match(html, /Photo &lt;Author&gt;/);
  assert.match(html, /Før &lt;gaten&gt;/);
  assert.match(html, /Nå &amp; senere/);
  assert.match(html, /Endring &gt; tidligere/);
  assert.match(html, /Detalj &lt;A&gt;/);
  assert.match(html, /Detalj &amp; B/);
  assert.doesNotMatch(html, /Før <1900>/);

  const host = window.document.getElementById("host");
  const mounted = api.mount(host, place);
  assert.ok(mounted);
  assert.equal(host.hidden, false);
  assert.equal(mounted.dataset.hgPlaceSheetOwner, "before-after");

  const empty = window.document.createElement("div");
  assert.equal(api.mount(empty, { id: "empty" }), null);
  assert.equal(empty.hidden, true);
  dom.window.close();
});

test("Unified Place Sheet owns before-after while standalone popup tabs keep the shared fallback", () => {
  assert.match(shellSource, /mountCanonicalBeforeAfter/);
  assert.match(shellSource, /pc-sheet-before-after/);
  assert.match(shellSource, /setAttribute\(SHELL_SECTION_ATTR, "before-after"\)/);
  assert.match(tabsSource, /HGPlaceSheetSections\?\.beforeAfter\?\.renderContentHtml/);
  assert.match(tabsSource, /renderBeforeAfter\(place\)/);
  assert.match(unifiedSource, /placeSheetSectionTarget\("before-after"\)/);
  assert.match(unifiedSource, /id === "before-after" && placeSheetSectionTarget\("before-after"\)/);
  assert.match(unifiedSource, /\["about", "history", "stories", "before-after"\]/);
});

test("direct Place Sheet before-after keeps paired-media and attribution styling", () => {
  assert.match(css, /pc-sheet-canonical-before-after/);
  assert.match(css, /hg-place-before-after-media/);
  assert.match(css, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,1fr\)\)/);
  assert.match(css, /pc-sheet-canonical-before-after[^\{]*figcaption/);
  assert.match(css, /pc-sheet-canonical-before-after[^\{]*hg-place-tab-section/);
});
