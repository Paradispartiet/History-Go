import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const source = fs.readFileSync("js/ui/place-sheet/place-sheet-shell.ts", "utf8");
const css = fs.readFileSync("css/place-sheet-phase6.css", "utf8");
const bundle = fs.readFileSync("dist/web/place-unified-surface.js", "utf8");
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function until(predicate, ms = 6000) {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > ms) throw new Error("Timed out waiting for content-aware Place Sheet navigation");
    await delay(20);
  }
}

function navFixture() {
  const dom = new JSDOM(`<!doctype html><html><head></head><body class="hg-app">
    <div id="placeCard" class="is-open"><div class="pc-body">
      <div class="pc-text"><h2 id="pcTitle"></h2><p id="pcDesc"></p></div>
      <div class="pc-grid">
        <div class="pc-frontcard"><img id="pcFrontImage" alt=""></div>
        <div class="pc-side-stack"><div class="pc-icons-quad">
          <button class="pc-round pc-collection" data-collection-id="brands" data-collection-item-count="1" aria-label="Brands"></button>
          <button class="pc-round pc-collection" data-collection-id="historical_events" data-collection-item-count="1" aria-label="Historiske hendelser"></button>
          <button class="pc-round pc-collection" data-collection-id="objects" data-collection-item-count="0" aria-label="Gjenstander"></button>
        </div></div>
        <div id="pcEventsBox"></div>
      </div>
    </div></div>
  </body></html>`, { url: "https://history-go.test/", runScripts: "outside-only", pretendToBeVisual: true });
  const { window } = dom;
  const grabein = {
    id: "museumsleiligheten_grabein", name: "Museumsleiligheten Gråbein",
    placeTier: "standard", desc: "Kort ingress.", popupDesc: "Utfyllende om leiligheten.",
    place_card_profile: { schema: "history_go_place_card_profile_v2",
      collection_ids: ["brands", "historical_events"], reason: "To dokumenterte samlinger" }
  };
  const empty = { id: "place_without_content", name: "Tomt sted", placeTier: "standard", desc: "Kort ingress." };
  window.PLACES = [grabein, empty];
  window.openPlaceCard = async place => {
    window.document.getElementById("placeCard").dataset.currentPlaceId = place.id;
    window.document.getElementById("pcTitle").textContent = place.name;
    window.document.getElementById("pcDesc").textContent = place.desc;
    return place;
  };
  window.showPlacePopup = () => null;
  window.showPlacePopup.__hgPlacePopupV2 = true;
  window.showPlacePopup.__hgPlacePopupTabs = true;
  window.showPlacePopup.__hgPlacePopupDirectTabs = true;
  window.__HG_PLACE_POPUP_DIRECT_TABS_INSTALLED__ = true;
  window.HGPlacePopupTabs = { decoratePopup: () => true };
  window.HGPlacePopupDirectTabs = { decoratePopup: () => true };
  window.HGLanguageLayer = { decoratePopup: async () => {} };
  window.HGPlaceLearningSurface = { loadRegistry: async () => ({}), renderLearningSection: () => "" };
  window.HGStories = { getByPlace: () => [] };
  window.LEKSIKON_BY_PLACE = {};
  window.HGLeksikon = { init: async () => {}, leksikonReadRecordsForPlace: () => [] };
  window.DataHub = { loadLesespor: async () => ({ items: [] }) };
  window.HGPlaceCardCollections = {
    get: place => (place.id === grabein.id
      ? [{ id: "brands", label: "Brands" }, { id: "historical_events", label: "Historiske hendelser" }, { id: "objects", label: "Gjenstander" }]
      : []),
    getItems: (place, id) => (place.id === grabein.id && ["brands", "historical_events"].includes(id)
      ? [{ id: id + "_member" }] : [])
  };
  window.eval(bundle);
  return { dom, window, grabein, empty };
}

function visible(nav, selector) {
  return [...nav.querySelectorAll(selector)].filter(button => !button.hidden).map(button => button.textContent.trim());
}

test("navigation uses actual rendered sections rather than the fixed list", async () => {
  const { dom, window, grabein, empty } = navFixture();
  try {
    await window.openPlaceCard(grabein);
    const nav = window.document.querySelector('[data-hg-place-sheet-nav="1"]');
    assert.ok(nav);
    await until(() => visible(nav, '[data-hg-place-sheet-jump]').includes("Om"));

    assert.deepEqual(visible(nav, '[data-hg-place-sheet-collection-link]'), ["Brands", "Historiske hendelser"]);
    for (const id of ["stories", "before-after", "news", "reading", "language", "learning", "sources"]) {
      assert.equal(nav.querySelector(`[data-hg-place-sheet-jump="${id}"]`)?.hidden, true, id + " must be hidden without content");
    }

    const stories = window.document.querySelector('[data-hg-place-sheet-section="stories"]');
    stories.hidden = false;
    stories.innerHTML = '<section data-hg-place-sheet-owner="stories"><h3>Fortellinger</h3><p>En ny kildebelagt fortelling.</p></section>';
    await until(() => nav.querySelector('[data-hg-place-sheet-jump="stories"]').hidden === false);

    // Use the actual asynchronous Sources slot; never insert a duplicate.
    await until(() => window.HGPlaceSheetState?.snapshot?.()?.phase === "full-ready");
    const shell = nav.closest('[data-hg-place-sheet-shell="1"]');
    const sources = shell.querySelector('[data-hg-place-sheet-section="sources"]');
    assert.ok(sources);
    sources.dataset.placeId = grabein.id;
    sources.hidden = false;
    sources.innerHTML = '<section data-hg-place-sheet-owner="sources"><h3>Kilder</h3><div class="hg-place-tab-empty">Ingen brukerrettede kilder er registrert.</div></section>';
    await delay(40);
    assert.equal(nav.querySelector('[data-hg-place-sheet-jump="sources"]').hidden, true, "empty-state text is not a source");
    sources.innerHTML = '<section data-hg-place-sheet-owner="sources"><h3>Kilder</h3><ul class="hg-place-source-list"><li>Byarkivet</li></ul></section>';
    await until(() => nav.querySelector('[data-hg-place-sheet-jump="sources"]').hidden === false);
    sources.hidden = true;
    await until(() => nav.querySelector('[data-hg-place-sheet-jump="sources"]').hidden === true);

    await window.openPlaceCard(empty);
    const emptyNav = window.document.querySelector('[data-hg-place-sheet-nav="1"]');
    assert.ok(emptyNav);
    await until(() => emptyNav.querySelector('[data-hg-place-sheet-jump="stories"]').hidden === true);
    assert.equal(visible(emptyNav, '[data-hg-place-sheet-collection-link]').length, 0);
    assert.equal(emptyNav.querySelector('[data-hg-place-sheet-jump="sources"]').hidden, true);
  } finally {
    dom.window.close();
  }
});

test("navigation hides unavailable buttons even when the pill stylesheet sets display", () => {
  assert.match(source, /function hasSectionContent/);
  assert.match(source, /function hasCollectionContent/);
  assert.match(source, /MutationObserver/);
  assert.match(source, /syncSectionNav\(shell\)/);
  assert.match(css, /\.pc-sheet-section-nav button\[hidden\]\s*\{\s*display:none !important;/);
});
