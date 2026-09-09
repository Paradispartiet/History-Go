import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const unifiedSource = fs.readFileSync("js/ui/place-unified-surface.ts", "utf8");
const runtime = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const css = fs.readFileSync("css/place-sheet.css", "utf8");
const collectionsSource = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");

test("Phase 1 shell reuses existing PlaceCard nodes instead of cloning them", () => {
  assert.match(shellSource, /appendChild\(front\)/);
  assert.match(shellSource, /copy\.prepend\(textBlock\)/);
  assert.match(shellSource, /appendChild\(sideStack\)/);
  assert.match(shellSource, /appendChild\(events\)/);
  assert.doesNotMatch(shellSource, /cloneNode/);
  assert.match(shellSource, /restoreLegacyPlaceCardStructure/);
  assert.match(shellSource, /pc-sheet-canonical-about/);
});

test("Phase 1 styling keeps portrait hero and four editorial collection cards", () => {
  assert.match(css, /grid-template-columns:\s*minmax\(230px,\s*\.78fr\)\s+minmax\(0,\s*1\.42fr\)/);
  assert.match(css, /\.pc-sheet-explore-grid[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /data-collection-shape="circle"[\s\S]*border-radius:\s*50%/);
  assert.match(css, /data-collection-shape="rectangle"[\s\S]*border-radius:\s*22px/);
  assert.match(css, /content:\s*attr\(aria-label\)\s*" · "\s*attr\(data-collection-item-count\)/);
  assert.match(collectionsSource, /collectionItemCount/);
});

test("Unified runtime mounts Phase 1, moves canonical About into hero and restores Micro", async () => {
  assert.match(unifiedSource, /place-sheet\/place-sheet-shell/);
  assert.match(unifiedSource, /mountPlaceSheetPhase1/);
  assert.match(unifiedSource, /attachCanonicalAboutToPlaceSheet/);
  assert.match(unifiedSource, /restoreLegacyPlaceCardStructure/);

  const dom = new JSDOM(`<!doctype html><html><head></head><body class="hg-app">
    <div id="placeCard" class="is-open"><div class="pc-body">
      <div class="pc-text"><div class="pc-title-row"><h2 id="pcTitle"></h2></div><div id="pcMeta"></div><p id="pcDesc"></p></div>
      <div class="pc-grid">
        <div class="pc-frontcard" id="pcFrontCardFlip"><img id="pcFrontImage" alt=""></div>
        <div class="pc-side-stack"><div class="pc-icons-quad" data-collection-count="4">
          <div id="pcPeopleIcon" class="pc-round pc-collection" data-collection-shape="circle"></div>
          <div id="pcObjectsIcon" class="pc-round pc-collection" data-collection-shape="rectangle"></div>
          <div id="pcBrandsIcon" class="pc-round pc-collection" data-collection-shape="rectangle"></div>
          <div id="pcCategoryCollectionIcon" class="pc-round pc-collection" data-collection-shape="rectangle"></div>
        </div></div>
        <div id="pcEventsBox" class="pc-events-quad"></div>
      </div>
    </div></div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  const standard = { id: "editorial_place", name: "Editorial Place", placeTier: "standard", popupDesc: "Lang canonical omtekst." };
  const micro = { id: "micro_place", name: "Micro Place", placeTier: "micro" };
  window.PLACES = [standard, micro];

  window.openPlaceCard = async place => {
    const card = window.document.getElementById("placeCard");
    card.dataset.currentPlaceId = place.id;
    window.document.getElementById("pcTitle").textContent = place.name;
    window.document.getElementById("pcDesc").textContent = place.id === standard.id ? "Kort ingress." : "Micro ingress.";
    return place;
  };
  window.showPlacePopup = place => {
    const host = window.document.getElementById("pcUnifiedKnowledgeHost") || window.document.body;
    const popup = window.document.createElement("div");
    popup.className = "hg-popup place-popup-v2";
    popup.innerHTML = `<div class="hg-popup-inner"><article class="hg-place-popup-v2" data-hg-place-tabs="1">
      <header class="hg-place-popup-header"><h1 class="hg-modal-title">${place.name}</h1></header>
      <div class="hg-place-popup-body"><section class="hg-place-hero"></section><nav class="hg-place-tabs"><button data-place-tab="about">Om</button><button data-place-tab="history">Historie</button><button data-place-tab="sources">Kilder</button></nav>
      <div class="hg-place-tab-panels"><section class="hg-place-tab-panel" data-place-panel="about"><section class="hg-section hg-place-section hg-place-about-section"><h3>Om stedet</h3><div class="hg-place-longread"><p>${place.popupDesc || ""}</p></div></section></section><section class="hg-place-tab-panel" data-place-panel="history" hidden>Historie</section><section class="hg-place-tab-panel" data-place-panel="sources" hidden>Kilder</section><section class="hg-place-tab-panel" data-place-panel="more" hidden></section></div></div>
    </article></div>`;
    host.appendChild(popup);
    return popup;
  };
  window.showPlacePopup.__hgPlacePopupV2 = true;
  window.showPlacePopup.__hgPlacePopupTabs = true;
  window.showPlacePopup.__hgPlacePopupDirectTabs = true;
  window.__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__ = true;
  window.HGPlacePopupTabs = { decoratePopup: () => true };
  window.HGPlacePopupDirectTabs = { decoratePopup: () => true };
  window.HGLanguageLayer = { decoratePopup: async () => undefined };
  window.HGPlaceLearningSurface = { loadRegistry: async () => null, renderLearningSection: () => "" };

  window.eval(runtime);
  await window.openPlaceCard(standard);

  const card = window.document.getElementById("placeCard");
  const shell = card.querySelector('[data-hg-place-sheet-shell="1"]');
  assert.ok(shell);
  assert.equal(card.classList.contains("is-place-sheet-phase1"), true);
  assert.equal(window.document.getElementById("pcFrontCardFlip").parentElement?.classList.contains("pc-sheet-hero-media"), true);
  assert.equal(window.document.querySelector(".pc-text")?.parentElement?.classList.contains("pc-sheet-hero-copy"), true);
  assert.ok(shell.querySelector(".pc-sheet-explore-grid .pc-side-stack"));
  assert.ok(shell.querySelector(".pc-sheet-onsite #pcEventsBox"));
  assert.match(shell.querySelector(".pc-sheet-canonical-about")?.textContent || "", /Lang canonical omtekst/);
  assert.equal(card.querySelector('.hg-popup .hg-place-about-section'), null, "canonical popupDesc node must have one visual owner");

  await window.openPlaceCard(micro);
  assert.equal(card.querySelector('[data-hg-place-sheet-shell="1"]'), null);
  assert.equal(card.classList.contains("is-place-sheet-phase1"), false);
  const grid = card.querySelector(":scope > .pc-body > .pc-grid");
  assert.ok(grid?.querySelector("#pcFrontCardFlip"));
  assert.ok(grid?.querySelector(".pc-side-stack"));
  assert.ok(grid?.querySelector("#pcEventsBox"));
  assert.equal(window.document.querySelector(".pc-text")?.parentElement?.classList.contains("pc-body"), true);

  dom.window.close();
});
