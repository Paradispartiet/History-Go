import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const tabsSource = read("js/ui/place-popup-tabs.js");
const directSource = read("js/ui/place-popup-direct-tabs.js");
const languageSource = read("js/ui/place-language-layer.js");
const unifiedSource = read("js/ui/place-unified-surface.ts");

function popupMarkup(id) {
  return `<div class="hg-popup place-popup-v2" id="${id}">
    <div class="hg-popup-inner">
      <article class="hg-place-popup-v2">
        <div class="hg-place-popup-body">
          <section class="hg-place-hero"></section>
          <section class="hg-place-about-section"><div class="hg-place-longread"><p>Om stedet</p></div></section>
        </div>
      </article>
    </div>
  </div>`;
}

test("popup tabs decorate only the explicitly supplied root", async () => {
  const dom = new JSDOM(`<!doctype html><body>${popupMarkup("a")}${popupMarkup("b")}</body>`, {
    url: "https://history-go.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.showPlacePopup = () => null;
  window.showPlacePopup.__hgPlacePopupV2 = true;
  window.LEKSIKON_BY_PLACE = { p: [] };
  window.HGStories = { byPlace: { p: [] } };
  window.LESESPOR = [];
  window.HG_PLACE_OPEN_LANGUAGE = { p: null };
  window.eval(tabsSource);

  const popupA = window.document.getElementById("a");
  const popupB = window.document.getElementById("b");
  window.HGPlacePopupTabs.decoratePopup({ id: "p", name: "Place" }, popupB);
  await new Promise(resolve => window.setTimeout(resolve, 0));

  assert.equal(popupA.querySelector(".hg-place-popup-v2").hasAttribute("data-hg-place-tabs"), false);
  assert.equal(popupB.querySelector(".hg-place-popup-v2").getAttribute("data-hg-place-tabs"), "1");
  assert.ok(popupB.querySelector('[data-place-panel="about"]'));
  dom.window.close();
});

test("direct-tabs routing respects the explicit popup root", async () => {
  const dom = new JSDOM(`<!doctype html><body>${popupMarkup("a")}${popupMarkup("b")}</body>`, {
    url: "https://history-go.test/",
    runScripts: "outside-only",
    pretendToBeVisual: true
  });
  const { window } = dom;
  window.showPlacePopup = () => null;
  window.showPlacePopup.__hgPlacePopupV2 = true;
  window.LEKSIKON_BY_PLACE = { p: [] };
  window.HGStories = { byPlace: { p: [] } };
  window.LESESPOR = [];
  window.HG_PLACE_OPEN_LANGUAGE = { p: null };
  window.eval(tabsSource);
  window.eval(directSource);

  const popupA = window.document.getElementById("a");
  const popupB = window.document.getElementById("b");
  window.HGPlacePopupTabs.decoratePopup({ id: "p", name: "Place" }, popupB);
  window.HGPlacePopupDirectTabs.decoratePopup({ id: "p", name: "Place" }, popupB);
  await new Promise(resolve => window.setTimeout(resolve, 0));

  assert.equal(popupA.querySelector(".hg-place-popup-v2").hasAttribute("data-hg-place-tabs"), false);
  assert.equal(popupB.querySelector(".hg-place-popup-v2").dataset.hgDirectTabs, "1");
  assert.ok(popupB.querySelector('[data-place-panel="language"]'));
  dom.window.close();
});

test("language and Unified runtime expose and use explicit root scoping", () => {
  assert.match(languageSource, /async function decorateLanguage\(place, root = null\)/);
  assert.match(languageSource, /resolvePopupRoot\(root\)/);
  assert.match(unifiedSource, /HGPlacePopupTabs\?\.decoratePopup\?\.\(place, popup\)/);
  assert.match(unifiedSource, /HGPlacePopupDirectTabs\?\.decoratePopup\?\.\(place, popup\)/);
  assert.match(unifiedSource, /HGLanguageLayer\?\.decoratePopup\?\.\(place, popup\)/);
});
