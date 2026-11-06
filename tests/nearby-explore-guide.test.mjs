import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../js/ui/nearby-explore-guide.js", import.meta.url), "utf8");
const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const compactCss = readFileSync(new URL("../css/nearby-explore-guide.css", import.meta.url), "utf8");

test("Utforsk enhancement preserves the canonical five categories", () => {
  for (const mode of ["nearby", "people", "nature", "routes", "badges"]) {
    assert.match(html, new RegExp('data-leftmode="' + mode + '"'));
  }
  assert.match(html, /id="nearbyQuickSearch"/);
  assert.match(html, /id="nearbyGuidePanel"/);
  assert.match(html, /nearby-explore-guide\.js/);
});

test("Utforsk search and guide work on current cards without replacing them", () => {
  class Element {
    constructor(text = "") {
      this.textContent = text;
      this.hidden = false;
      this.value = "";
      this.children = [];
      this.listeners = {};
      this.attributes = {};
      this.classList = { contains: () => false, add: () => {} };
    }
    addEventListener(type, handler) { this.listeners[type] = handler; }
    setAttribute(name, value) { this.attributes[name] = value; }
    getAttribute(name) { return this.attributes[name] || null; }
    querySelector() { return null; }
    closest() { return this; }
  }

  const root = new Element();
  const row = new Element();
  const tabs = new Element();
  const controls = new Element();
  const input = new Element();
  const count = new Element();
  const summary = new Element();
  const toggle = new Element();
  const guide = new Element();
  const list = new Element();
  const peopleList = new Element();
  guide.hidden = true;
  root.querySelector = (selector) => ({
    ".nearby-row2": row, ".nearby-tabs": tabs, ".nearby-controls": controls
  })[selector] || null;
  list.children = [new Element("Akerselva historisk rute"), new Element("Bislett stadion")];
  peopleList.children = [new Element("Anna Rogstad"), new Element("Christian Krohg")];

  const ids = {
    nearbyListContainer: root, nearbyQuickSearch: input, nearbySearchCount: count,
    nearbyActiveFilter: summary, nearbyGuideToggle: toggle,
    nearbyGuidePanel: guide, nearbyList: list, leftPeopleList: peopleList
  };
  const document = { readyState: "complete", getElementById: (id) => ids[id] || null };

  let mode = "nearby", sort = "distance", place = "unvisited", favorite = false, badge = "all";
  const filters = {
    getPlaceFilter: () => place, getSort: () => sort,
    getFavoritesOnly: () => favorite, getActiveBadgeFilter: () => badge,
    setPlaceFilter: (value) => { place = value; },
    setSort: (value) => { sort = value; },
    setFavoritesOnly: (value) => { favorite = value; },
    setActiveBadgeFilter: (value) => { badge = value; }
  };
  const window = {
    HGNearbyFilters: filters,
    HGLeftPanelMode: {
      getActiveMode: () => mode, setMode: (value) => { mode = value; },
      rerender: () => {}
    },
    updateNearbyFilterButton: () => {},
    updateNearbySortButton: () => {}
  };
  class MutationObserver { observe() {} }

  runInNewContext(source, {
    document, window, HTMLElement: Element, HTMLImageElement: Element,
    Element, MutationObserver, requestAnimationFrame: (fn) => fn()
  });

  assert.equal(count.textContent, "2 steder");
  input.value = "AKERSELVA";
  input.listeners.input();
  assert.equal(list.children[0].hidden, false);
  assert.equal(list.children[1].hidden, true);
  assert.equal(count.textContent, "1 av 2 treff");

  // Switching categories must not silently carry an unrelated search.
  window.HGLeftPanelMode.setMode("people");
  tabs.listeners.click();
  assert.equal(input.value, "");
  assert.equal(count.textContent, "2 folk");
  assert.equal(peopleList.children[0].hidden, false);
  assert.equal(peopleList.children[1].hidden, false);
  window.HGLeftPanelMode.setMode("nearby");
  tabs.listeners.click();

  toggle.listeners.click();
  assert.equal(guide.hidden, false);
  assert.equal(toggle.attributes["aria-expanded"], "true");

  const action = new Element();
  action.getAttribute = (name) => name === "data-hg-guide-action" ? "history" : null;
  guide.listeners.click({ target: action });
  assert.equal(sort, "oldest");
  assert.equal(place, "all");
  assert.equal(input.value, "");
  assert.equal(list.children[1].hidden, false);
  assert.equal(guide.hidden, true);
});

test("Utforsk tabs use compact responsive pills without changing category labels", () => {
  assert.match(compactCss, /#nearbyListContainer \.nearby-tab\s*\{[^}]*min-height:34px;[^}]*padding:7px 12px;[^}]*font-size:13px;/s);
  assert.match(compactCss, /body\.hg-app\.hg-phone #nearbyListContainer \.nearby-tab\s*\{[^}]*min-height:32px;[^}]*padding:6px 9px;[^}]*font-size:12px;/s);
  for (const [container, icon] of [
    ["leftPeopleList", "👤"], ["leftNatureList", "🌿"],
    ["leftRoutesList", "🥾"], ["leftBadgesList", "🏅"]
  ]) {
    assert.ok(compactCss.includes("#nearbyListContainer #" + container + " .nearby-thumbWrap.hg-image-missing::before{content:\"" + icon + "\";}"));
  }
  for (const label of ["Steder", "Folk", "Natur", "Ruter", "Merker"]) {
    assert.match(html, new RegExp(">" + label + "</button>"));
  }
});
