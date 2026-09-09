import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const historySource = fs.readFileSync("js/ui/place-sheet/sections/history.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const popupSource = fs.readFileSync("js/ui/place-popup-v2.js", "utf8");
const unifiedSource = fs.readFileSync("js/ui/place-unified-surface.ts", "utf8");
const runtime = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");

test("History renderer owns canonical history_layers without swallowing other History surfaces", () => {
  assert.match(historySource, /canonicalHistoryLayers/);
  assert.match(historySource, /Array\.isArray\(place(?:\?\.|\.)history_layers\)/);
  assert.match(historySource, /sort_order\s*\?\?\s*item\?\.sortOrder/);
  assert.match(historySource, /data-hg-place-sheet-owner="history"/);
  assert.match(historySource, /escapeHtml/);
  assert.doesNotMatch(historySource, /chronology|visibleArticlesForPopup|HGEvents/);
});

test("generated runtime exposes sorted and escaped shared History renderer", () => {
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  window.eval(runtime);

  const history = window.HGPlaceSheetSections?.history;
  assert.equal(typeof history?.layers, "function");
  assert.equal(typeof history?.renderHtml, "function");

  const place = {
    history_layers: [
      { id: "late", sort_order: 20, period: "1900", title: "Sen", summary: "Andre" },
      { id: "early", sort_order: 10, period: "1800", title: "<Tidlig>", summary: "Første & viktig" }
    ]
  };
  assert.deepEqual(history.layers(place).map(row => row.id), ["early", "late"]);
  const html = history.renderHtml(place);
  assert.ok(html.indexOf("1800") < html.indexOf("1900"));
  assert.match(html, /&lt;Tidlig&gt;/);
  assert.match(html, /Første &amp; viktig/);
  assert.doesNotMatch(html, /<Tidlig>/);
  dom.window.close();
});

test("Unified path owns history_layers in Place Sheet while standalone popup keeps shared fallback", () => {
  assert.match(shellSource, /mountCanonicalHistory/);
  assert.match(shellSource, /data-hg-place-sheet-section[^\n]*history|SHELL_SECTION_ATTR[^\n]*history/);
  assert.match(shellSource, /pc-sheet-canonical-history/);
  assert.match(unifiedSource, /suppressPlaceHistory:\s*ownsHistory/);
  assert.match(unifiedSource, /placeSheetSectionTarget\("history"\)/);
  assert.match(unifiedSource, /hg-place-history-section/);
  assert.match(popupSource, /HGPlaceSheetSections\?\.history/);
  assert.match(popupSource, /suppressPlaceHistory/);
});

test("direct Place Sheet History keeps popup-quality timeline styling", () => {
  assert.match(css, /pc-sheet-canonical-history/);
  assert.match(css, /pc-sheet-canonical-history[^\{]*\.hg-place-timeline/);
  assert.match(css, /pc-sheet-canonical-history[^\{]*\.hg-place-timeline-marker/);
  assert.match(css, /linear-gradient\(180deg,#f6c800,rgba\(246,200,0,\.08\)\)/);
});
