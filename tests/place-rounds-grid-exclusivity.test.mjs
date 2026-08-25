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

test("PlaceCard uses seven small SVG shortcuts and opens Om from title or info text", () => {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard" data-current-place-id="p"><div class="pc-title-row"><h2 id="pcTitle">Stedet</h2></div><p id="pcDesc">Infotekst</p><div class="pc-side-stack"><div class="pc-icons-quad"></div></div></div></body>', { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  const calls = [];
  w.PLACES = [{ id: "p", name: "Stedet" }];
  w.HGPlacePopupTabs = { openTab: (place, tabId) => calls.push([place.id, tabId]) };
  w.eval(shortcutsSource);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));

  const buttons = [...w.document.querySelectorAll("[data-place-popup-tab]")];
  assert.equal(buttons.length, 7);
  assert.ok(buttons.every(button => button.querySelector("svg")));
  assert.equal(w.document.querySelector('[data-place-popup-tab="about"]'), null);
  assert.deepEqual(buttons.map(button => button.dataset.placePopupTab), ["history", "stories", "before-after", "news", "reading", "sources", "more"]);
  assert.match(shortcutsCss, /grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/);
  assert.match(shortcutsCss, /grid-template-rows:minmax\(0,1fr\) 32px/);
  assert.match(shortcutsCss, /#placeCard \.pc-icons-quad\{[\s\S]*?gap:3px/);
  assert.doesNotMatch(shortcutsCss, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(shortcutsCss, /width:21px/);

  w.document.getElementById("pcTitle").click();
  w.document.getElementById("pcDesc").dispatchEvent(new w.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  assert.deepEqual(calls, [["p", "about"], ["p", "about"]]);
  assert.equal(w.document.getElementById("pcTitle").getAttribute("role"), "button");
  assert.equal(w.document.getElementById("pcDesc").getAttribute("tabindex"), "0");
  dom.window.close();
});
