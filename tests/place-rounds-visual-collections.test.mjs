import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-visual-collections.js"), "utf8");
const windows = new Set();
afterEach(() => { for (const w of windows) w.close(); windows.clear(); });
const ICONS = ["People", "Badges", "Brands", "Nature", "Works", "CivicationStore", "ForNa", "Fortellinger", "Leksikon", "Play", "Training", "Tasks"];

function make(place, globals = {}) {
  const dom = new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="${place.id}"><div class="pc-body"><div class="pc-title-row"><h2 id="pcTitle"></h2></div><div class="pc-icons-quad">${ICONS.map(x => `<div id="pc${x}Icon" class="pc-round" hidden></div>`).join("")}</div><div id="pcPeopleList"></div><div id="pcWorksList"></div><div id="pcNatureList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div><div id="pcCivicationStoreList"></div></div></div></body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  windows.add(w);
  w.PLACES = [place];
  Object.assign(w, globals);
  w.eval(source);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  return w;
}

const ids = (w, place) => Array.from(w.HGPlaceRounds.get(place), def => def.id);

test("canonical pool contains badge and documented visual collection types", () => {
  const w = make({ id: "x", category: "historie" });
  assert.deepEqual(Array.from(w.HGVisualPlaceRounds.ids), ["badges", "people", "works", "objects", "details", "spots", "nature", "brands"]);
  for (const bad of ["civication", "map", "flora", "fauna", "før_nå", "fortellinger", "leksikon", "play", "training", "tasks"]) {
    assert.ok(!w.HGVisualPlaceRounds.ids.includes(bad), bad);
  }
});

test("the fourth content round follows category documentation", () => {
  const cases = [
    ["by", ["works", "spots", "details", "people"]],
    ["historie", ["people", "objects", "spots", "details"]],
    ["kunst", ["works", "people", "details", "spots"]],
    ["musikk", ["people", "works", "objects", "spots"]],
    ["naeringsliv", ["brands", "people", "objects", "spots"]],
    ["natur", ["nature", "spots", "details", "people"]],
    ["politikk", ["people", "spots", "details", "objects"]],
    ["sport", ["people", "objects", "spots", "details"]],
    ["subkultur", ["people", "works", "details", "spots"]],
    ["vitenskap", ["people", "objects", "spots", "details"]],
    ["film_tv", ["people", "works", "spots", "objects"]]
  ];
  for (const [category, expected] of cases) {
    const place = { id: `p_${category}`, category };
    const w = make(place);
    assert.deepEqual(ids(w, place), expected, category);
    w.close();
    windows.delete(w);
  }
});

test("explicit content rounds are completed from category profile", () => {
  const place = { id: "p", category: "politikk", rounds: ["badges", "works", "people"] };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["works", "people", "spots", "details"]);
  assert.equal(w.HGPlaceRounds.badge.id, "badges");
});

test("Civication can feed physical Objects but is never a round", () => {
  const place = { id: "p", category: "historie", civication_items: [{ id: "o", title: "Objekt", image: "o.png", physical: true }] };
  const w = make(place, { CIVICATION_STORE_BY_PLACE: {} });
  assert.ok(!ids(w, place).includes("civication"));
  assert.ok(source.includes("physicalCivication"));
  assert.ok(source.includes('id === "objects"'));
});

test("People preview does not create people_ids filtering", () => {
  assert.ok(!source.includes("people_ids"));
});
