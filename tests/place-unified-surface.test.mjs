import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const root = process.cwd();
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const source = read("js/ui/place-unified-surface.ts");
const runtime = read("dist/web/place-unified-surface.js");
const css = read("css/place-unified-surface.css");
const phase6Css = read("css/place-sheet-phase6.css");
const config = read("js/config.js");
const statusSurface = read("js/ui/place-card-status-surface.js");
const plan = read("docs/PLACE_UNIFIED_SURFACE_PLAN.md");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function waitFor(predicate, timeoutMs = 5000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (predicate()) return;
    await delay(10);
  }
  throw new Error("Timed out waiting for unified Place state");
}

test("unified Place surface keeps public entry points and canonical section set", () => {
  assert.match(source, /function\s+patchOpenPlaceCard\s*\(/);
  assert.match(source, /function\s+patchShowPlacePopup\s*\(/);
  assert.match(source, /HGPlacePopupTabs\.openTab/);
  assert.match(source, /\["about",\s*"Om"\]/);
  assert.match(source, /\["language",\s*"Språk"\]/);
  assert.match(source, /\["learning",\s*"Fagverk"\]/);
  assert.match(source, /isMicro\(place/);
  assert.match(source, /No legacy showPlacePopup call for standard Places/);
  assert.doesNotMatch(source, /fetch\(["']data\/places\//);
});

test("unified renderer is critical runtime while Phase 6 adds direct Place Sheet styling", () => {
  assert.match(
    statusSurface,
    /ensureScript\("dist\/web\/place-unified-surface\.js"\)/,
    "Unified Place Surface must load with the primary PlaceCard/popup runtime"
  );
  const directIndex = config.indexOf('"js/ui/place-popup-direct-tabs.js"');
  const unifiedIndex = config.indexOf('"dist/web/place-unified-surface.js"');
  assert.ok(directIndex >= 0, "direct-tabs runtime must remain loaded for Micro compatibility");
  assert.ok(unifiedIndex > directIndex, "unified runtime must install after canonical legacy popup routing");
  assert.ok(runtime.length > 500, "committed TypeScript bundle must exist");
  assert.match(css, /prefers-reduced-motion/);
  assert.match(phase6Css, /Place Sheet Phase 6/);
  assert.match(phase6Css, /pc-sheet-section-nav/);
  assert.match(phase6Css, /is-place-sheet-direct/);
});

test("plan locks fail-closed parity and Micro Place exception", () => {
  assert.match(plan, /0 funksjonstap/);
  assert.match(plan, /100 % parity/);
  assert.match(plan, /Micro Places/);
  assert.match(plan, /openPlaceCard\(place\)/);
  assert.match(plan, /showPlacePopup/);
});

function createPopup(window, place) {
  const popup = window.document.createElement("div");
  popup.className = "hg-popup place-popup-v2";
  popup.innerHTML = `
    <div class="hg-popup-inner">
      <button class="hg-popup-close" type="button">×</button>
      <article class="hg-place-popup-v2" data-hg-place-tabs="1">
        <header class="hg-place-popup-header"><h1 class="hg-modal-title">${place.name}</h1></header>
        <div class="hg-place-popup-body">Micro legacy popup</div>
      </article>
    </div>`;
  window.document.body.appendChild(popup);
  return popup;
}

test("standard Places render directly in Place Sheet while Micro keeps the standalone popup", async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body class="hg-app">
    <div id="placeCard" class="is-open"><div class="pc-body"><div class="pc-text"><h2 id="pcTitle"></h2><p id="pcDesc"></p></div><div class="pc-grid"></div></div></div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  const standard = { id: "standard_place", name: "Standard Place", placeTier: "standard", popupDesc: "Om standardstedet" };
  const micro = { id: "micro_place", name: "Micro Place", placeTier: "micro" };
  window.PLACES = [standard, micro];
  window.LEKSIKON_BY_PLACE = { [standard.id]: [] };

  window.openPlaceCard = async place => {
    const card = window.document.getElementById("placeCard");
    card.dataset.currentPlaceId = place.id;
    return place;
  };
  window.showPlacePopup = place => createPopup(window, place);
  window.showPlacePopup.__hgPlacePopupV2 = true;
  window.showPlacePopup.__hgPlacePopupTabs = true;
  window.showPlacePopup.__hgPlacePopupDirectTabs = true;
  window.__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__ = true;
  window.HGPlacePopupTabs = {};
  window.HGPlacePopupDirectTabs = {};
  window.HGLanguageLayer = {
    decoratePopup: async (place, root) => {
      const panels = root?.querySelector('.hg-place-tab-panels');
      if (!panels || panels.querySelector('[data-place-panel="language"]')) return;
      const panel = window.document.createElement('section');
      panel.className = 'hg-place-tab-panel hg-place-language-panel';
      panel.dataset.placePanel = 'language';
      panel.hidden = true;
      panel.innerHTML = `<div data-language-place="${place.id}">Språkinnhold</div>`;
      panels.appendChild(panel);
    }
  };
  window.HGPlaceLearningSurface = {
    loadRegistry: async () => ({ subjects: {} }),
    renderLearningSection: () => '<section class="hg-place-learning-section">Fagverkinnhold</section>'
  };
  window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};

  window.eval(runtime);
  await window.openPlaceCard(standard);
  await waitFor(() => window.HGPlaceSheetState?.snapshot?.()?.phase === "full-ready");

  const card = window.document.getElementById("placeCard");
  assert.equal(card.classList.contains("is-unified-place"), true);
  assert.equal(card.classList.contains("is-place-sheet-direct"), true);
  assert.equal(card.querySelector("#pcUnifiedKnowledgeHost"), null, "standard Place must not create the compatibility host");
  assert.equal(card.querySelector(".hg-popup.place-popup-v2.hg-unified-renderer-embedded"), null, "standard Place must not embed a legacy popup");
  assert.equal(window.document.querySelector("body > .hg-popup.place-popup-v2"), null, "standard Place must not open a standalone popup");
  assert.ok(card.querySelector('[data-hg-place-sheet-section="language"] [data-hg-place-sheet-owner="language"]'));
  assert.ok(card.querySelector('[data-hg-place-sheet-section="learning"] [data-hg-place-sheet-owner="learning"]'));
  assert.ok(card.querySelector('[data-hg-place-sheet-section="sources"] [data-hg-place-sheet-owner="sources"]'));
  assert.ok(card.querySelector('.pc-sheet-section-nav'));
  assert.equal(typeof window.HGPlacePopupTabs.openTab, "function", "legacy entry point must route into Place Sheet for standard Places");

  await window.HGPlacePopupTabs.openTab(standard, "history");
  assert.equal(window.document.querySelector("body > .hg-popup.place-popup-v2"), null);

  await window.openPlaceCard(micro);
  assert.equal(card.classList.contains("is-unified-place"), false, "Micro must restore the reduced Place surface");
  window.showPlacePopup(micro);
  assert.ok(window.document.querySelector("body > .hg-popup.place-popup-v2"), "Micro info remains a standalone popup");

  dom.window.close();
});
