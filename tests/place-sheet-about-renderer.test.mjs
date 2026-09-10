import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const source = fs.readFileSync("js/ui/place-sheet/sections/about.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const popupSource = fs.readFileSync("js/ui/place-popup-v2.js", "utf8");
const unifiedSource = fs.readFileSync("js/ui/place-unified-surface.ts", "utf8");
const runtime = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");

test("About renderer owns popupDesc-first selection and safe paragraph HTML", () => {
  assert.match(source, /place\.popupDesc, place\.popupdesc, place\.description, place\.desc/);
  assert.match(source, /suppressIfSameAsDesc/);
  assert.match(source, /data-hg-place-sheet-owner="about"/);
  assert.match(source, /escapeHtml/);
  assert.match(shellSource, /mountCanonicalAbout/);
});

test("generated runtime exposes the shared About renderer", () => {
  const dom = new JSDOM("<!doctype html><html><head></head><body></body></html>", {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  window.eval(runtime);

  const about = window.HGPlaceSheetSections?.about;
  assert.equal(typeof about?.text, "function");
  assert.equal(typeof about?.renderHtml, "function");
  assert.equal(about.text({ desc: "kort", popupDesc: "lang" }), "lang");

  const html = about.renderHtml({ desc: "kort", popupDesc: "<b>lang</b>\n\nneste" });
  assert.match(html, /&lt;b&gt;lang&lt;\/b&gt;/);
  assert.match(html, /<p>neste<\/p>/);
  assert.doesNotMatch(html, /<b>lang<\/b>/);
  assert.equal(about.renderHtml({ desc: "samme", popupDesc: "samme" }, { suppressIfSameAsDesc: true }), "");
  dom.window.close();
});

test("Phase 6 standard path owns About directly while standalone popup keeps the shared fallback", () => {
  assert.match(unifiedSource, /mountPlaceSheetPhase1\(place\)/);
  assert.match(unifiedSource, /dispatchDirectReady\(place, generation\)/);
  assert.doesNotMatch(unifiedSource, /suppressPlaceAbout/);
  assert.doesNotMatch(unifiedSource, /legacyShowPlacePopup\(place,\s*\{\s*unifiedHost:/);
  assert.match(popupSource, /HGPlaceSheetSections\?\.about/);
  assert.match(popupSource, /suppressPlaceAbout/);
});
