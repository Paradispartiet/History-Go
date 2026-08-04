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
  const dom = new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="${place.id}"><div class="pc-body"><div class="pc-title-row"><h2 id="pcTitle"></h2></div><div class="pc-icons-quad">${ICONS.map(x => `<div id="pc${x}Icon" class="pc-round" hidden></div>`).join("")}</div><div id="pcPeopleList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div><div id="pcWorksList"></div><div id="pcCivicationStoreList"></div></div></div></body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  windows.add(w);
  w.PLACES = [place];
  Object.assign(w, globals);
  w.eval(source);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  return w;
}

const ids = (w, place) => Array.from(w.HGPlaceRounds.get(place), def => def.id);

test("canonical pool contains category-dependent visual collections and excludes Civication", () => {
  const w = make({ id: "x", category: "historie" });
  assert.deepEqual(Array.from(w.HGVisualPlaceRounds.ids), ["badges", "people", "works", "objects", "details", "spots", "brands", "map", "flora", "fauna"]);
  assert.ok(!w.HGVisualPlaceRounds.ids.includes("civication"));
  for (const bad of ["før_nå", "fortellinger", "leksikon", "play", "training", "tasks"]) assert.ok(!w.HGVisualPlaceRounds.ids.includes(bad), bad);
});

test("history uses Spots as the category-dependent fourth round", () => {
  const place = { id: "h", category: "historie", spots: [{ id: "port", title: "Port", image: "port.jpg" }] };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "spots"]);
  assert.equal(w.HGPlaceRounds.getFourth(place), "spots");
});

test("history falls through to Details when Spots is empty", () => {
  const place = { id: "h", category: "historie", details: [{ id: "merke", title: "Merke", image: "merke.jpg" }] };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "details"]);
});

test("music and subculture use Works when work content exists", () => {
  for (const category of ["musikk", "subkultur"]) {
    const place = { id: category, category, works: [{ id: "verk", title: "Verk", image: "verk.jpg" }] };
    const w = make(place);
    assert.deepEqual(ids(w, place), ["people", "objects", "brands", "works"]);
    w.close();
    windows.delete(w);
  }
});

test("nature keeps map flora fauna and uses Spots as fourth", () => {
  const place = { id: "n", category: "natur", spots: [{ id: "utsikt", title: "Utsikt", image: "utsikt.jpg" }] };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["map", "flora", "fauna", "spots"]);
  assert.equal(w.HGPlaceRounds.badge.id, "badges");
});

test("category first candidate remains the semantic fallback without filler Civication", () => {
  const politics = { id: "p", category: "politikk" };
  const music = { id: "m", category: "musikk" };
  const w = make(politics);
  assert.deepEqual(ids(w, politics), ["people", "objects", "brands", "spots"]);
  assert.deepEqual(ids(w, music), ["people", "objects", "brands", "works"]);
});

test("nature map never falls back to generic main-map navigation", () => {
  assert.ok(!/flyToPlace|HGMapView|\.flyTo\s*\(/.test(source));
  assert.ok(source.includes("HGNatureDetailedMap"));
  assert.ok(source.includes("generelle hovedkartet som fallback"));
});

test("People preview does not create people_ids filtering", () => {
  assert.ok(!source.includes("people_ids"));
});
