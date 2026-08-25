import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const roundsSource = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-visual-collections.js"), "utf8");
const shortcutsSource = fs.readFileSync(path.join(__dirname, "../js/ui/place-popup-shortcuts.js"), "utf8");
const shortcutsCss = fs.readFileSync(path.join(__dirname, "../css/place-popup-shortcuts.css"), "utf8");
const layoutCss = fs.readFileSync(path.join(__dirname, "../css/layout.css"), "utf8");
const placeCardCss = fs.readFileSync(path.join(__dirname, "../css/placeCard.css"), "utf8");
const placeCardSource = fs.readFileSync(path.join(__dirname, "../js/ui/place-card.js"), "utf8");

test("legacy nodes cannot leak beyond the fixed four PlaceCard collections", async () => {
  const dom = new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="p"><div class="pc-body"><div class="pc-title-row"><h2 id="pcTitle"></h2></div><div class="pc-icons-quad">${["People", "Nature", "Badges", "Works", "Details", "Spots", "CivicationStore", "Brands", "ForNa", "Fortellinger", "Leksikon", "Play", "Training", "Tasks"].map(x => `<div id="pc${x}Icon" class="pc-round"></div>`).join("")}</div><div id="pcPeopleList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div><div id="pcWorksList"></div><div id="pcCivicationStoreList"></div></div></div></body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  w.PLACES = [{ id: "p", category: "sport", competitions: [{ id: "finale", title: "Finale", image: "finale.jpg" }], image: "sted.jpg" }];
  w.eval(roundsSource);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  await w.HGVisualPlaceRounds.apply(w.PLACES[0]);
  const visible = [...w.document.querySelectorAll(".pc-icons-quad .pc-round")].filter(el => !el.hidden);
  assert.equal(visible.length, 4);
  assert.equal(w.document.querySelector(".pc-icons-quad").dataset.collectionCount, "4");
  assert.equal(w.document.querySelector(".pc-icons-quad").dataset.collectionProfileSource, "category_default");
  assert.deepEqual(visible.slice().sort((a, b) => Number(a.style.order) - Number(b.style.order)).map(el => el.id), ["pcPeopleIcon", "pcObjectsIcon", "pcBrandsIcon", "pcCategoryCollectionIcon"]);
  for (const removed of ["pcWorksIcon", "pcDetailsIcon", "pcSpotsIcon", "pcCivicationStoreIcon"]) {
    assert.equal(w.document.getElementById(removed).hidden, true, removed);
  }
  assert.equal(w.document.getElementById("pcPeopleIcon").dataset.collectionShape, "circle");
  assert.equal(w.document.getElementById("pcCategoryCollectionIcon").dataset.collectionShape, "rectangle");
  assert.equal(w.document.getElementById("pcBadgesIcon").parentElement.className, "pc-title-row");
  dom.window.close();
});

test("PlaceCard uses six full-width SVG shortcuts and opens Om from title or info text", () => {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="p"><div class="pc-title-row"><h2 id="pcTitle">Stedet</h2></div><p id="pcDesc">Infotekst</p><div class="pc-grid"><div class="pc-frontcard"></div><div class="pc-side-stack"><div class="pc-icons-quad"></div></div><div class="pc-events-quad"></div></div></div></body>', { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  const calls = [];
  w.PLACES = [{ id: "p", name: "Stedet" }];
  w.HGPlacePopupTabs = { openTab: (place, tabId) => calls.push([place.id, tabId]) };
  w.eval(shortcutsSource);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));

  const buttons = [...w.document.querySelectorAll("[data-place-popup-tab]")];
  assert.equal(buttons.length, 6);
  assert.ok(buttons.every(button => button.querySelector("svg")));
  assert.equal(w.document.querySelector('[data-place-popup-tab="about"]'), null);
  assert.deepEqual(buttons.map(button => button.dataset.placePopupTab), ["history", "stories", "before-after", "news", "reading", "sources"]);
  assert.equal(w.document.querySelector(".pc-place-popup-shortcuts").parentElement.classList.contains("pc-grid"), true);
  assert.match(shortcutsCss, /grid-template-columns:repeat\(6,minmax\(0,1fr\)\)/);
  assert.match(shortcutsCss, /grid-column:1 \/ 3;[\s\S]*?grid-row:2;/);
  assert.match(shortcutsCss, /#placeCard \.pc-events-quad\{[\s\S]*?grid-row:3/);
  assert.match(shortcutsCss, /#placeCard \.pc-icons-quad\{[\s\S]*?gap:5px/);
  assert.doesNotMatch(shortcutsCss, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(shortcutsCss, /width:21px/);
  assert.match(shortcutsCss, /#placeCard #pcMeta\{[\s\S]*?grid-template-columns:minmax\(0,\.9fr\) minmax\(0,1\.35fr\)/);
  assert.match(shortcutsCss, /pc-progress-status-line\{[\s\S]*?grid-column:1 \/ -1;[\s\S]*?grid-row:2/);
  assert.match(shortcutsCss, /#placeCard \.pc-title-row\{[\s\S]*?order:0;[\s\S]*?margin:4px 0 8px/);
  assert.match(shortcutsCss, /#placeCard #pcMeta > \*\{[\s\S]*?white-space:nowrap !important;[\s\S]*?text-overflow:ellipsis/);
  assert.match(layoutCss, /body\.hg-app #placeCard\{[\s\S]*?top:\s*calc\(var\(--hg-visual-header-height, 74px\) \+ 58px\);[\s\S]*?bottom:\s*auto;[\s\S]*?max-height:\s*calc\([\s\S]*?100dvh[\s\S]*?var\(--hg-bottom-nav-height\) - 72px/);
  assert.match(placeCardCss, /#placeCard\{[\s\S]*?top:\s*calc\(var\(--hg-visual-header-height, 74px\) \+ 58px\);[\s\S]*?bottom:\s*auto;[\s\S]*?max-height:\s*calc\([\s\S]*?100dvh[\s\S]*?- 72px/);
  assert.doesNotMatch(layoutCss, /body\.hg-app #placeCard\{[\s\S]*?top:auto/);
  assert.doesNotMatch(layoutCss, /body\.hg-app #placeCard\{[\s\S]*?max-height:\s*none/);
  assert.match(placeCardSource, /if \(!samePlace\)[\s\S]*?scrollBody\.scrollTop = 0/);

  w.document.getElementById("pcTitle").click();
  w.document.getElementById("pcDesc").dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert.deepEqual(calls, [["p", "about"], ["p", "about"]]);
  assert.equal(w.document.getElementById("pcTitle").getAttribute("role"), "button");
  assert.equal(w.document.getElementById("pcDesc").getAttribute("tabindex"), "0");
  dom.window.close();
});
