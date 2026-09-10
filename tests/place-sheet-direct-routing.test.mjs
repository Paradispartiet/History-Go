import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const directSource = fs.readFileSync("js/ui/place-sheet/place-sheet-direct-routing.ts", "utf8");
const queueSource = fs.readFileSync("js/ui/place-sheet/place-sheet-render-queue.ts", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function waitFor(predicate, timeoutMs = 5000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (predicate()) return resolve();
      if (Date.now() - started >= timeoutMs) return reject(new Error("Timed out waiting for direct Place Sheet routing"));
      setTimeout(tick, 10);
    };
    tick();
  });
}

function createPopup(window, place) {
  const popup = window.document.createElement("div");
  popup.className = "hg-popup place-popup-v2";
  popup.innerHTML = `
    <div class="hg-popup-inner">
      <button class="hg-popup-close" type="button">×</button>
      <article class="hg-place-popup-v2" data-hg-place-tabs="1">
        <header class="hg-place-popup-header"><h1 class="hg-modal-title">${place.name}</h1></header>
        <div class="hg-place-popup-body">Micro compatibility</div>
      </article>
    </div>`;
  window.document.body.appendChild(popup);
  return popup;
}

function createDom() {
  return new JSDOM(`<!doctype html><html><head></head><body class="hg-app">
    <div id="placeCard" class="is-open">
      <div class="pc-body">
        <div class="pc-text"><h2 id="pcTitle"></h2><p id="pcDesc"></p></div>
        <div class="pc-grid"></div>
      </div>
    </div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only", pretendToBeVisual: true });
}

function installFixture(window, place) {
  window.PLACES = [place];
  window.LEKSIKON_BY_PLACE = {
    [place.id]: [
      { id: "main", title: place.name },
      { id: "news-direct", type: "news_note", title: "Nyheter" }
    ]
  };
  window.openPlaceCard = async value => {
    const card = window.document.getElementById("placeCard");
    card.dataset.currentPlaceId = value.id;
    return value;
  };
  window.showPlacePopup = value => createPopup(window, value);
  window.showPlacePopup.__hgPlacePopupV2 = true;
  window.showPlacePopup.__hgPlacePopupTabs = true;
  window.showPlacePopup.__hgPlacePopupDirectTabs = true;
  window.__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__ = true;

  window.HGPlacePopupTabs = {};
  window.HGPlacePopupDirectTabs = {};
  window.HGLanguageLayer = {
    decoratePopup: async (value, root) => {
      const panels = root?.querySelector('.hg-place-tab-panels');
      if (!panels || panels.querySelector('[data-place-panel="language"]')) return;
      const panel = window.document.createElement('section');
      panel.className = 'hg-place-tab-panel hg-place-language-panel';
      panel.dataset.placePanel = 'language';
      panel.innerHTML = `<div data-language-place="${value.id}">Språk</div>`;
      panels.appendChild(panel);
    }
  };
  window.HGPlaceLearningSurface = {
    loadRegistry: async () => ({ subjects: {} }),
    renderLearningSection: () => '<section class="hg-place-learning-section">Fagverk</section>'
  };
  window.DataHub = {
    loadLesespor: async () => {
      await delay(90);
      return { items: [{ id: "reading-direct", place_ids: [place.id], title: "Les stedet" }] };
    }
  };
  window.HTMLElement.prototype.scrollIntoView = function scrollIntoView() {
    window.__lastScrolledSection = this.getAttribute("data-hg-place-sheet-section") || this.getAttribute("data-place-panel") || "";
  };
}

test("Phase 4 promotion remains separate from the full automatic queue after Phase 6 cutover", () => {
  assert.match(directSource, /promoteAutomaticPlaceSheetSection/);
  assert.match(directSource, /showPromotedPlaceSheetSection/);
  assert.match(directSource, /openPromotedPlaceSheetSection/);
  assert.match(queueSource, /drainPromotedCompatibilitySections/);
  assert.match(queueSource, /the canonical queue remains intact and continues/);
  assert.doesNotMatch(directSource, /IntersectionObserver/);
  assert.doesNotMatch(directSource, /addEventListener\(["']scroll/);
});

test("direct Kilder request is promoted before the normal late batch and full-ready still completes", async () => {
  const dom = createDom();
  const { window } = dom;
  const place = { id: "direct_place", name: "Direct Place", placeTier: "standard", popupDesc: "Om stedet" };
  installFixture(window, place);

  const states = [];
  window.addEventListener("hg:place-sheet-state", event => {
    states.push(JSON.parse(JSON.stringify(event.detail)));
  });

  window.eval(runtimeSource);
  await waitFor(() => window.showPlacePopup?.__hgPlaceSheetDirectRouting === true);
  await window.showPlacePopup(place, "sources");

  assert.equal(window.document.querySelector("body > .hg-popup.place-popup-v2"), null, "standard direct route must not open legacy popup");
  assert.equal(window.document.querySelector("#pcUnifiedKnowledgeHost"), null);
  const promotedBeforeNews = states.some(state => (
    state.placeId === place.id
    && state.sections?.sources === "rendered"
    && (state.sections?.news === "pending" || state.sections?.news === "loading")
  ));
  assert.equal(promotedBeforeNews, true, "direct Kilder must settle before the normal news/reading batch completes");
  assert.equal(window.__lastScrolledSection, "sources", "direct routing must finish by scrolling to the promoted section");

  await waitFor(() => window.HGPlaceSheetState?.snapshot()?.phase === "full-ready");
  const finalState = window.HGPlaceSheetState.snapshot();
  assert.equal(finalState.placeId, place.id);
  assert.equal(finalState.sections.sources, "rendered");
  assert.equal(finalState.sections.news, "rendered");
  assert.equal(finalState.sections.reading, "rendered");
  assert.equal(finalState.sections.language, "rendered");
  assert.equal(finalState.sections.learning, "rendered");
  dom.window.close();
});

test("Micro routing bypasses promotion and keeps the compatibility popup path", async () => {
  const dom = createDom();
  const { window } = dom;
  const micro = { id: "direct_micro", name: "Direct Micro", placeTier: "micro" };
  installFixture(window, micro);
  window.eval(runtimeSource);
  await waitFor(() => window.showPlacePopup?.__hgPlaceSheetDirectRouting === true);

  const result = window.showPlacePopup(micro, "sources");
  assert.equal(result instanceof Promise, false, "Micro must preserve the standalone compatibility call shape");
  assert.ok(window.document.querySelector("body > .hg-popup.place-popup-v2"));
  assert.equal(window.HGPlaceSheetState?.snapshot?.() || null, null);
  dom.window.close();
});
