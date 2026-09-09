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
const config = read("js/config.js");
const plan = read("docs/PLACE_UNIFIED_SURFACE_PLAN.md");

test("unified Place surface keeps public entry points and canonical section set", () => {
  assert.match(source, /function\s+patchOpenPlaceCard\s*\(/);
  assert.match(source, /function\s+patchShowPlacePopup\s*\(/);
  assert.match(source, /HGPlacePopupTabs\.openTab/);
  assert.match(source, /\["about",\s*"Om"\]/);
  assert.match(source, /\["language",\s*"Språk"\]/);
  assert.match(source, /\["learning",\s*"Fagverk"\]/);
  assert.match(source, /isMicro\(place/);
  assert.doesNotMatch(source, /fetch\(["']data\/places\//);
});

test("unified renderer is loaded after popup direct-tabs from the TypeScript bundle", () => {
  const directIndex = config.indexOf('"js/ui/place-popup-direct-tabs.js"');
  const unifiedIndex = config.indexOf('"dist/web/place-unified-surface.js"');
  assert.ok(directIndex >= 0, "direct-tabs runtime must remain loaded");
  assert.ok(unifiedIndex > directIndex, "unified runtime must load after canonical popup routing");
  assert.ok(runtime.length > 500, "committed TypeScript bundle must exist");
  assert.match(css, /hg-unified-renderer-embedded/);
  assert.match(css, /\.pc-unified-section-nav/);
  assert.match(css, /data-place-panel="more"/);
  assert.match(css, /prefers-reduced-motion/);
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
        <div class="hg-place-popup-body">
          <section class="hg-place-hero">duplicated hero</section>
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
            <section class="hg-place-tab-panel" data-place-panel="about">Om-innhold</section>
            <section class="hg-place-tab-panel" data-place-panel="history" hidden>Historie-innhold</section>
            <section class="hg-place-tab-panel" data-place-panel="stories" hidden>Stories</section>
            <section class="hg-place-tab-panel" data-place-panel="before-after" hidden>Før/etter</section>
            <section class="hg-place-tab-panel" data-place-panel="news" hidden>Nyheter</section>
            <section class="hg-place-tab-panel" data-place-panel="reading" hidden>Lesespor</section>
            <section class="hg-place-tab-panel" data-place-panel="sources" hidden>Kilder</section>
            <section class="hg-place-tab-panel" data-place-panel="more" hidden>staging</section>
          </div>
        </div>
      </article>
    </div>`;
  window.document.body.appendChild(popup);
  return popup;
}

test("standard Place embeds knowledge in PlaceCard while Micro keeps the old surface", async () => {
  const dom = new JSDOM(`<!doctype html><html><head></head><body class="hg-app">
    <div id="placeCard" class="is-open"><div class="pc-body"><div class="pc-text"><h2 id="pcTitle"></h2><p id="pcDesc"></p></div><div class="pc-grid"></div></div></div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  const standard = { id: "standard_place", name: "Standard Place", placeTier: "standard" };
  const micro = { id: "micro_place", name: "Micro Place", placeTier: "micro" };
  window.PLACES = [standard, micro];

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

  window.HGPlacePopupTabs = { decoratePopup: () => true };
  window.HGPlacePopupDirectTabs = { decoratePopup: () => true };
  window.HGLanguageLayer = {
    decoratePopup: async () => {
      const article = window.document.querySelector('.hg-popup.place-popup-v2 .hg-place-popup-v2');
      const tabs = article?.querySelector('.hg-place-tabs');
      const panels = article?.querySelector('.hg-place-tab-panels');
      if (!tabs || !panels || panels.querySelector('[data-place-panel="language"]')) return;
      const tab = window.document.createElement('button');
      tab.type = 'button'; tab.className = 'hg-place-tab'; tab.dataset.placeTab = 'language'; tab.textContent = 'Språk';
      tabs.appendChild(tab);
      const panel = window.document.createElement('section');
      panel.className = 'hg-place-tab-panel'; panel.dataset.placePanel = 'language'; panel.hidden = true; panel.textContent = 'Språkinnhold';
      panels.appendChild(panel);
    }
  };
  window.HGPlaceLearningSurface = {
    loadRegistry: async () => ({ subjects: {} }),
    renderLearningSection: () => '<section class="hg-place-learning-section">Fagverkinnhold</section>'
  };

  window.eval(runtime);
  await window.openPlaceCard(standard);

  const card = window.document.getElementById("placeCard");
  assert.equal(card.classList.contains("is-unified-place"), true);
  const embedded = card.querySelector(".hg-popup.place-popup-v2.hg-unified-renderer-embedded");
  assert.ok(embedded, "canonical popup renderer should be embedded in the card");
  assert.ok(card.querySelector('[data-place-panel="language"]'));
  assert.ok(card.querySelector('[data-hg-unified-section="learning"]'));
  assert.equal(card.querySelectorAll('.hg-place-learning-section').length, 1, "Fagverk must have one visual owner");
  assert.equal(card.querySelector('[data-place-panel="history"]').hidden, false);
  assert.equal(typeof window.HGPlacePopupTabs.openTab, "function");

  await window.HGPlacePopupTabs.openTab(standard, "history");
  await window.openPlaceCard(micro);
  assert.equal(card.classList.contains("is-unified-place"), false, "Micro must restore the reduced Place surface");
  window.showPlacePopup(micro);
  assert.ok(window.document.querySelector("body > .hg-popup.place-popup-v2"), "Micro info remains a standalone popup");

  dom.window.close();
});
