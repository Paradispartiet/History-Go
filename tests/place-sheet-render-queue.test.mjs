import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const queueSource = fs.readFileSync("js/ui/place-sheet/place-sheet-render-queue.ts", "utf8");
const stateSource = fs.readFileSync("js/ui/place-sheet/place-sheet-state.ts", "utf8");
const registrySource = fs.readFileSync("js/ui/place-sheet/place-section-registry.ts", "utf8");
const shellSource = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const runtimeSource = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

function waitFor(predicate, timeoutMs = 4000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (predicate()) return resolve();
      if (Date.now() - started >= timeoutMs) return reject(new Error("Timed out waiting for Place Sheet state"));
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
        <div class="hg-place-popup-body">
          <nav class="hg-place-tabs" role="tablist">
            <button type="button" class="hg-place-tab" data-place-tab="about">Om</button>
            <button type="button" class="hg-place-tab" data-place-tab="history">Historie</button>
            <button type="button" class="hg-place-tab" data-place-tab="stories">Fortellinger</button>
            <button type="button" class="hg-place-tab" data-place-tab="before-after">Før/etter</button>
            <button type="button" class="hg-place-tab" data-place-tab="news">Nyheter</button>
            <button type="button" class="hg-place-tab" data-place-tab="reading">Lesespor</button>
            <button type="button" class="hg-place-tab" data-place-tab="sources">Kilder</button>
          </nav>
          <div class="hg-place-tab-panels">
            <section class="hg-place-tab-panel" data-place-panel="about">Om</section>
            <section class="hg-place-tab-panel" data-place-panel="history">Historie</section>
            <section class="hg-place-tab-panel" data-place-panel="stories">Fortellinger</section>
            <section class="hg-place-tab-panel" data-place-panel="before-after">Før/etter</section>
            <section class="hg-place-tab-panel" data-place-panel="news">Nyheter</section>
            <section class="hg-place-tab-panel" data-place-panel="reading">Lesespor fallback</section>
            <section class="hg-place-tab-panel" data-place-panel="sources">Ingen brukerrettede kilder er registrert ennå.</section>
            <section class="hg-place-tab-panel" data-place-panel="more">Staging</section>
          </div>
        </div>
      </article>
    </div>`;
  window.document.body.appendChild(popup);
  return popup;
}

function installFixture(window, places, slowPlaceId = "") {
  window.PLACES = places;
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

  window.HGPlacePopupTabs = {
    decoratePopup: () => {
      const news = window.document.querySelector('[data-hg-place-sheet-section="news"]');
      if (news) {
        news.hidden = false;
        news.innerHTML = '<section data-hg-place-sheet-owner="news">Nyheter</section>';
      }
      return true;
    }
  };
  window.HGPlacePopupDirectTabs = { decoratePopup: () => true };
  window.HGLanguageLayer = {
    decoratePopup: async place => {
      if (place.id === slowPlaceId) await delay(80);
      const article = [...window.document.querySelectorAll('.hg-popup.place-popup-v2 .hg-place-popup-v2')]
        .find(node => node.querySelector('.hg-modal-title')?.textContent === place.name);
      const panels = article?.querySelector('.hg-place-tab-panels');
      if (!panels || panels.querySelector('[data-place-panel="language"]')) return;
      const panel = window.document.createElement('section');
      panel.className = 'hg-place-tab-panel hg-place-language-panel';
      panel.dataset.placePanel = 'language';
      panel.innerHTML = `<div data-language-place="${place.id}">Språk</div>`;
      panels.appendChild(panel);
    }
  };
  window.HGPlaceLearningSurface = {
    loadRegistry: async () => ({ subjects: {} }),
    renderLearningSection: () => '<section class="hg-place-learning-section">Fagverk</section>'
  };
  window.DataHub = {
    loadLesespor: async () => ({
      items: places.map(place => ({ id: `reading-${place.id}`, place_ids: [place.id], title: `Les ${place.name}` }))
    })
  };
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

test("Phase 3 source contract starts the full queue automatically without viewport or interaction gates", () => {
  assert.match(shellSource, /startAutomaticPlaceSheetRender/);
  assert.match(queueSource, /scheduler\.postTask|requestAnimationFrame/);
  assert.match(queueSource, /hg:place-unified-ready/);
  assert.match(stateSource, /AbortController/);
  assert.match(stateSource, /full-ready/);
  assert.match(registrySource, /"about"[\s\S]*"sources"/);
  assert.doesNotMatch(queueSource, /IntersectionObserver/);
  assert.doesNotMatch(queueSource, /addEventListener\(["']scroll/);
  assert.doesNotMatch(queueSource, /data-place-tab/);
});

test("standard Place reaches full-ready automatically without scroll, click or tab activation", async () => {
  const dom = createDom();
  const { window } = dom;
  const place = { id: "automatic_place", name: "Automatic Place", placeTier: "standard", popupDesc: "Om stedet" };
  installFixture(window, [place]);

  const readyIds = [];
  window.addEventListener("hg:place-sheet-full-ready", event => readyIds.push(event.detail?.placeId));
  window.eval(runtimeSource);
  await window.openPlaceCard(place);
  await waitFor(() => readyIds.includes(place.id));

  const card = window.document.getElementById("placeCard");
  assert.equal(card.dataset.hgPlaceSheetRenderState, "full-ready");
  assert.equal(window.HGPlaceSheetState?.snapshot()?.placeId, place.id);
  assert.equal(window.HGPlaceSheetState?.snapshot()?.sections.sources, "rendered");
  assert.equal(window.HGPlaceSheetState?.snapshot()?.sections.reading, "rendered");
  dom.window.close();
});

test("opening B while A is still rendering invalidates A and only B may become full-ready", async () => {
  const dom = createDom();
  const { window } = dom;
  const a = { id: "place_a", name: "Place A", placeTier: "standard", popupDesc: "A" };
  const b = { id: "place_b", name: "Place B", placeTier: "standard", popupDesc: "B" };
  installFixture(window, [a, b], a.id);

  const readyIds = [];
  window.addEventListener("hg:place-sheet-full-ready", event => readyIds.push(event.detail?.placeId));
  window.eval(runtimeSource);

  const openA = window.openPlaceCard(a);
  await delay(10);
  const openB = window.openPlaceCard(b);
  await Promise.allSettled([openA, openB]);
  await waitFor(() => readyIds.includes(b.id));

  assert.equal(readyIds.includes(a.id), false, "stale Place A generation must not emit full-ready");
  assert.equal(window.HGPlaceSheetState?.snapshot()?.placeId, b.id);
  assert.equal(window.document.getElementById("placeCard").dataset.hgPlaceSheetRenderPlaceId, b.id);
  assert.equal(window.document.getElementById("placeCard").dataset.hgPlaceSheetRenderState, "full-ready");
  dom.window.close();
});
