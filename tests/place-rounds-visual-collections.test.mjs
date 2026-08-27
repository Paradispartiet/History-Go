import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "../js/ui/place-rounds-visual-collections.js"), "utf8");
const placeCardSource = fs.readFileSync(path.join(__dirname, "../js/ui/place-card.js"), "utf8");
const placeCardCss = fs.readFileSync(path.join(__dirname, "../css/placeCard.css"), "utf8");
const windows = new Set();
afterEach(() => { for (const w of windows) w.close(); windows.clear(); });
const ICONS = ["People", "Badges", "Brands", "Nature", "Works", "Details", "Spots", "CivicationStore", "ForNa", "Fortellinger", "Leksikon", "Play", "Training", "Tasks"];

function make(place, globals = {}) {
  const dom = new JSDOM(`<!doctype html><body><div id="placeCard" data-current-place-id="${place.id}"><div class="pc-body"><div class="pc-title-row"><h2 id="pcTitle"></h2></div><div class="pc-icons-quad">${ICONS.map(x => `<div id="pc${x}Icon" class="pc-round" hidden></div>`).join("")}</div><div id="pcPeopleList"></div><div id="pcBadgesList"></div><div id="pcBrandsList"></div><div id="pcWorksList"></div><div id="pcCivicationStoreList"></div></div></div><button id="pcQuiz" hidden>Ta quiz</button></body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  const w = dom.window;
  windows.add(w);
  w.PLACES = [place];
  Object.assign(w, globals);
  w.eval(source);
  w.document.dispatchEvent(new w.Event("DOMContentLoaded", { bubbles: true }));
  return w;
}

const ids = (w, place) => Array.from(w.HGPlaceCardCollections.get(place), def => def.id);

test("canonical pool contains collections, never the removed Images reserve", () => {
  const w = make({ id: "x", category: "historie", image: "x.jpg" });
  assert.deepEqual(Array.from(w.HGVisualPlaceCardCollections.ids), [
    "badges", "people", "objects", "brands", "map", "flora", "fauna",
    "productions", "structures", "competitions", "related", "destinations"
  ]);
  for (const removed of ["images", "works", "details", "spots", "civication", "før_nå", "fortellinger", "leksikon", "play", "training", "tasks"]) {
    assert.ok(!w.HGVisualPlaceCardCollections.ids.includes(removed), removed);
  }
});

test("every ordinary category default keeps one circle and three rectangles", () => {
  const art = { id: "kunst", category: "kunst", works: [{ id: "verk", title: "Et verk", image: "verk.jpg" }], image: "sted.jpg" };
  const politics = { id: "politikk", category: "politikk", frontImage: "front.jpg" };
  const w = make(art);
  assert.deepEqual(ids(w, art), ["people", "objects", "brands", "productions"]);
  assert.equal(w.HGPlaceCardCollections.getCategoryCollection(art), "productions");
  assert.equal(w.HGPlaceCardCollections.getFourthLabel(art), "Kunstverk");
  assert.deepEqual(ids(w, politics), ["people", "objects", "brands", "related"]);
  assert.equal(w.HGPlaceCardCollections.getCategoryCollection(politics), "related");
});

test("all registered ordinary categories render a full 1 + 3 composition", async () => {
  const categories = [
    "by", "historie", "historisk", "kunst", "litteratur", "media", "musikk",
    "naeringsliv", "politikk", "popkultur", "psykologi", "religion", "scenekunst", "sport",
    "subkultur", "vitenskap", "filosofi", "film_tv", "lekeplass", "trening", "transport"
  ];
  for (const category of categories) {
    const place = { id: `all_${category}`, category };
    const w = make(place);
    await w.HGPlaceCardCollections.apply(place);
    const definitions = Array.from(w.HGPlaceCardCollections.get(place));
    assert.equal(definitions.length, 4, category);
    assert.deepEqual(definitions.map(def => def.shape), ["circle", "rectangle", "rectangle", "rectangle"], category);
    assert.equal(w.document.querySelector(".pc-icons-quad").dataset.collectionCount, "4", category);
  }
});

test("nature keeps circular Flora and Fauna while Map and destinations are rectangular", async () => {
  const place = { id: "n", category: "natur", destinations: [{ id: "topp", title: "Utsiktstoppen", image: "topp.jpg" }], image: "natur.jpg" };
  const w = make(place);
  await w.HGPlaceCardCollections.apply(place);
  assert.deepEqual(ids(w, place), ["flora", "fauna", "map", "destinations"]);
  assert.equal(w.document.getElementById("pcFloraIcon").dataset.collectionShape, "circle");
  assert.equal(w.document.getElementById("pcFaunaIcon").dataset.collectionShape, "circle");
  assert.equal(w.document.getElementById("pcNatureMapIcon").dataset.collectionShape, "rectangle");
  assert.equal(w.document.getElementById("pcCategoryCollectionIcon").dataset.collectionShape, "rectangle");
});

test("canonical profiles accept curated one-to-four collections and reject structurally invalid profiles", () => {
  const complete = {
    id: "complete", category: "by", related_place_ids: ["r"],
    place_card_profile: {
      schema: "history_go_place_card_profile_v2",
      collection_ids: ["people", "objects", "brands", "structures"],
      reason: "Den faste fulle komposisjonen er kontrollert.", verifiedAt: "2026-08-24"
    }
  };
  const curated = {
    id: "curated", category: "historie",
    place_card_profile: {
      schema: "history_go_place_card_profile_v2",
      collection_ids: ["people", "objects", "related"],
      reason: "Tre kildebårne samlinger er den ferdige komposisjonen.", verifiedAt: "2026-08-27"
    }
  };
  const invalid = {
    id: "invalid", category: "historie",
    place_card_profile: {
      schema: "history_go_place_card_profile_v2",
      collection_ids: [],
      reason: "En tom profil skal falle tilbake.", verifiedAt: "2026-08-27"
    }
  };
  const w = make(complete, { PLACES: [complete, curated, invalid, { id: "r", name: "Relatert" }] });
  assert.deepEqual(ids(w, complete), ["people", "objects", "brands", "structures"]);
  assert.equal(w.HGPlaceCardCollections.getProfileSource(complete), "place_card_profile_v2");
  assert.deepEqual(ids(w, curated), ["people", "objects", "related"]);
  assert.equal(w.HGPlaceCardCollections.getProfileSource(curated), "place_card_profile_v2");
  assert.deepEqual(ids(w, invalid), ["people", "objects", "brands", "related"]);
  assert.equal(w.HGPlaceCardCollections.getProfileSource(invalid), "category_default");
});

test("legacy round_profile remains readable and silently drops Images", async () => {
  const place = {
    id: "legacy",
    category: "by",
    image: "gate.jpg",
    related_place_ids: ["relatert"],
    round_profile: {
      schema: "history_go_place_round_profile_v1",
      content_round_ids: ["people", "images", "brands", "related"],
      reason: "Eksisterende profil beholdes gjennom kompatibilitetslaget."
    }
  };
  const related = { id: "relatert", name: "Relatert sted", cardImage: "missing.jpg" };
  const w = make(place, { PLACES: [place, related] });
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "related"]);
  assert.equal(w.HGPlaceCardCollections.getProfileSource(place), "round_profile_v1_adapter");
  await w.HGPlaceCardCollections.apply(place);
  assert.equal(w.document.querySelector(".pc-icons-quad").dataset.collectionCount, "4");
  assert.equal(w.document.querySelector(".pc-icons-quad").dataset.collectionProfileSource, "round_profile_v1_adapter");
});

test("Christiania Torv's full four-collection v2 profile is executable", () => {
  const place = JSON.parse(fs.readFileSync(path.join(__dirname, "../data/places/by/oslo/places/christiania_torv.json"), "utf8"));
  const w = make(place);
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "related"]);
  assert.equal(w.HGPlaceCardCollections.getProfileSource(place), "place_card_profile_v2");
});

test("People stays circular; other ordinary collections become rounded rectangles", async () => {
  const place = {
    id: "shape",
    category: "by",
    related_place_ids: ["r"],
    place_card_profile: {
      schema: "history_go_place_card_profile_v2",
      collection_ids: ["people", "objects", "brands", "related"],
      reason: "Fire dokumenterte samlinger brukes for formtesten.",
      verifiedAt: "2026-08-24"
    }
  };
  const w = make(place, { PLACES: [place, { id: "r", name: "Relatert" }] });
  await w.HGPlaceCardCollections.apply(place);
  assert.equal(w.document.getElementById("pcPeopleIcon").dataset.collectionShape, "circle");
  for (const id of ["pcObjectsIcon", "pcBrandsIcon", "pcCategoryCollectionIcon"]) {
    assert.equal(w.document.getElementById(id).dataset.collectionShape, "rectangle", id);
  }
});

test("broken collection previews fall back to icon and count", async () => {
  const place = {
    id: "gate",
    category: "by",
    related_place_ids: ["relatert"],
    place_card_profile: {
      schema: "history_go_place_card_profile_v2",
      collection_ids: ["people", "objects", "brands", "related"],
      reason: "Relasjonen er en reell og dokumentert samling.",
      verifiedAt: "2026-08-24"
    }
  };
  const related = { id: "relatert", name: "Relatert sted", cardImage: "missing.jpg" };
  const w = make(place, { PLACES: [place, related] });
  await w.HGPlaceCardCollections.apply(place);
  const icon = w.document.getElementById("pcCategoryCollectionIcon");
  icon.querySelector("img").dispatchEvent(new w.Event("error"));
  assert.match(icon.textContent, /🧭/);
  assert.match(icon.textContent, /1/);
  assert.equal(icon.querySelector("img"), null);
});

test("documented physical Civication objects remain in Objects without a preview image", async () => {
  const place = {
    id: "physical_without_image",
    category: "by",
    civication_store: [{
      id: "documented_object",
      title: "Dokumentert fysisk objekt",
      physicalObject: true,
      placeSpecific: true,
      historicalFunction: "Et fysisk og kildebundet spor ved stedet."
    }],
    place_card_profile: {
      schema: "history_go_place_card_profile_v2",
      collection_ids: ["people", "objects", "brands", "related"],
      reason: "Det fysiske objektet er dokumentert selv om eget previewbilde mangler.",
      verifiedAt: "2026-08-24"
    }
  };
  const w = make(place);
  await w.HGPlaceCardCollections.apply(place);
  assert.equal(w.HGPlaceCardCollections.getItems(place, "objects").length, 1);
  assert.equal(w.document.querySelectorAll("#pcObjectsList [data-visual-round-item]").length, 1);
  assert.equal(w.document.querySelector("#pcObjectsIcon img"), null);
  assert.equal(w.document.querySelector("#pcObjectsIcon .pc-round-count").textContent, "1");
});

test("Quiz remains a mandatory prominent PlaceCard action", async () => {
  const place = { id: "quiz", category: "by" };
  const w = make(place);
  await w.HGPlaceCardCollections.apply(place);
  const quiz = w.document.getElementById("pcQuiz");
  assert.equal(quiz.hidden, false);
  assert.equal(quiz.getAttribute("aria-hidden"), "false");
  assert.ok(quiz.classList.contains("pc-action-primary"));
});

test("generic Details and Spots never become collections and nature map has no generic fallback", () => {
  const place = { id: "p", category: "historie", details: [{ id: "d" }], spots: [{ id: "s" }] };
  const w = make(place);
  assert.deepEqual(ids(w, place), ["people", "objects", "brands", "related"]);
  assert.ok(!/flyToPlace|HGMapView|\.flyTo\s*\(/.test(source));
  assert.ok(source.includes("HGNatureDetailedMap"));
  assert.ok(!source.includes("people_ids"));
});

test("core People and Brands keep preview fallback and keyboard activation", () => {
  assert.match(placeCardSource, /const setRoundPreview =/);
  assert.match(placeCardSource, /setRoundPreview\(peopleIcon, previewImage, previewAlt, "👥", persons\.length\)/);
  assert.match(placeCardSource, /setRoundPreview\(brandsIcon, b0\?\.logo \|\| "", b0\?\.label \|\| "", "🏷️", brands\.length\)/);
  assert.match(placeCardSource, /iconEl\?\.addEventListener\("keydown", openRoundPopup\)/);
  assert.match(placeCardSource, /Number\(count\) === 0/);
});

test("missing or broken front media keeps a branded visual surface instead of a black hole", () => {
  assert.match(placeCardSource, /pcFrontFallbackBound/);
  assert.match(placeCardSource, /frontFace\.dataset\.mediaState = "fallback"/);
  assert.match(placeCardCss, /\.pc-card-face-front\{[\s\S]*linear-gradient/);
  assert.match(placeCardCss, /content:"HISTORY GO"/);
});
