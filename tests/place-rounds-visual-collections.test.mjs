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
  const dom = new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="${place.id}"><div class="pc-body"><div class="pc-title-row"><h2 id="pcTitle"></h2></div><div class="pc-icons-quad">${ICONS.map(x => `<div id="pc${x}Icon" class="pc-round" hidden></div>`).join("")}</div><div id="pcPeopleList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div><div id="pcCivicationStoreList"></div></div></div></body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  windows.add(w);
  w.PLACES = [place];
  Object.assign(w, globals);
  w.eval(source);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  return w;
}

const ids = (w, place) => Array.from(w.HGPlaceRounds.get(place), def => def.id);

test("canonical pool contains badge plus approved visual round types", () => {
  const place = { id: "x", category: "historie" };
  const w = make(place);
  assert.deepEqual(Array.from(w.HGVisualPlaceRounds.ids), ["badges", "people", "objects", "brands", "civication", "map", "flora", "fauna"]);
  for (const bad of ["nature", "works", "details", "spots", "før_nå", "fortellinger", "leksikon", "play", "training", "tasks"]) {
    assert.ok(!w.HGVisualPlaceRounds.ids.includes(bad), bad);
  }
});

test("ordinary places use four visual collections beside frontImage", () => {
  const place = { id: "x", category: "historie", rounds: ["works", "nature"] };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "civication"]);
  assert.equal(w.HGPlaceRounds.badge.id, "badges");
});

test("nature places use map flora fauna and civication beside frontImage", () => {
  const place = { id: "n", category: "natur", people: [{}], objects: [{}] };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["map", "flora", "fauna", "civication"]);
  assert.equal(w.HGPlaceRounds.badge.id, "badges");
});

test("nature map never falls back to generic main-map navigation", () => {
  assert.ok(!/flyToPlace|HGMapView|\.flyTo\s*\(/.test(source));
  assert.ok(source.includes("HGNatureDetailedMap"));
  assert.ok(source.includes("generelle hovedkartet som fallback"));
});

test("People preview does not create people_ids filtering", () => {
  assert.ok(!source.includes("people_ids"));
});
