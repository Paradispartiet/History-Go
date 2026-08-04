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
const ICONS = ["People", "Badges", "Brands", "Nature", "Works", "Details", "Spots", "CivicationStore", "ForNa", "Fortellinger", "Leksikon", "Play", "Training", "Tasks"];

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

test("canonical pool contains only clear fourth-round alternatives", () => {
  const w = make({ id: "x", category: "historie", image: "x.jpg" });
  assert.deepEqual(Array.from(w.HGVisualPlaceRounds.ids), [
    "badges", "people", "objects", "brands", "map", "flora", "fauna",
    "productions", "structures", "competitions", "related", "destinations", "images"
  ]);
  for (const removed of ["works", "details", "spots", "civication", "før_nå", "fortellinger", "leksikon", "play", "training", "tasks"]) {
    assert.ok(!w.HGVisualPlaceRounds.ids.includes(removed), removed);
  }
});

test("art uses Kunstverk when production content exists", () => {
  const place = { id: "kunst", category: "kunst", works: [{ id: "verk", title: "Et verk", image: "verk.jpg" }], image: "sted.jpg" };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "productions"]);
  assert.equal(w.HGPlaceRounds.getFourth(place), "productions");
  assert.equal(w.HGPlaceRounds.getFourthLabel(place), "Kunstverk");
});

test("sport uses Kamper og konkurranser from real competition data", () => {
  const place = { id: "sport", category: "sport", matches: [{ id: "finale", title: "Cupfinalen", image: "finale.jpg" }], image: "stadion.jpg" };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "competitions"]);
  assert.equal(w.HGPlaceRounds.getFourthLabel(place), "Kamper og konkurranser");
});

test("history uses actual related History GO places", () => {
  const place = { id: "h", category: "historie", related_place_ids: ["r"], image: "h.jpg" };
  const related = { id: "r", name: "Relatert sted", image: "r.jpg" };
  const w = make(place, { PLACES: [place, related] });
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "related"]);
  assert.equal(w.HGPlaceRounds.getItems(place, "related")[0].title, "Relatert sted");
});

test("city uses named buildings and structures, not generic Spots", () => {
  const place = { id: "by", category: "by", buildings: [{ id: "hall", title: "Hovedhallen", image: "hall.jpg" }], spots: [{ id: "tilfeldig", title: "Et punkt" }], image: "by.jpg" };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "structures"]);
  assert.equal(w.HGPlaceRounds.getItems(place, "structures").length, 1);
});

test("nature keeps map flora fauna and uses real tour destinations", () => {
  const place = { id: "n", category: "natur", destinations: [{ id: "topp", title: "Utsiktstoppen", image: "topp.jpg" }], image: "natur.jpg" };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["map", "flora", "fauna", "destinations"]);
  assert.equal(w.HGPlaceRounds.badge.id, "badges");
});

test("Bilder is the only general fallback when category content is missing", () => {
  const place = { id: "p", category: "politikk", frontImage: "front.jpg" };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "images"]);
  assert.equal(w.HGPlaceRounds.getFourthLabel(place), "Bilder");
  assert.equal(w.HGPlaceRounds.getItems(place, "images")[0].image, "front.jpg");
});

test("generic Details and Spots data never become fourth rounds", () => {
  const place = {
    id: "p", category: "historie", image: "sted.jpg",
    details: [{ id: "d", title: "Detalj", image: "d.jpg" }],
    spots: [{ id: "s", title: "Tilfeldig punkt", image: "s.jpg" }]
  };
  const w = make(place);
  assert.equal(w.HGPlaceRounds.getFourth(place), "images");
});

test("nature map never falls back to generic main-map navigation", () => {
  assert.ok(!/flyToPlace|HGMapView|\.flyTo\s*\(/.test(source));
  assert.ok(source.includes("HGNatureDetailedMap"));
  assert.ok(source.includes("generelle hovedkartet som fallback"));
});

test("People preview does not create people_ids filtering", () => {
  assert.ok(!source.includes("people_ids"));
});
