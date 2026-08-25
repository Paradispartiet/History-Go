import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import { sha256Text } from "../scripts/validate-place-description-production-v4_2.mjs";

const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const placePath = "data/places/by/oslo/places_by_oslo_oppdag_kvadraturen_batch_03/grev_wedels_plass.json";
const place = readJson(placePath);
const production = readJson("data/places/production/grev_wedels_plass.json");
const quiz = readJson("data/quiz/by/grev_wedels_plass_sets.json");
const placesIndex = readJson("data/places/places_index.json");
const route = readJson("data/routes/historical/routes_historical_oslo.json");
const people = readJson("data/people/politikk/akershus/eidsvollsbygningen/herman_wedel_jarlsberg.json")[0];
const runtime = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");
const windows = new Set();

afterEach(() => {
  for (const window of windows) window.close();
  windows.clear();
});

function makeRuntime() {
  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="grev_wedels_plass"><div class="pc-body">
      <div class="pc-title-row"><h2>Grev Wedels plass</h2><div id="pcBadgesIcon" class="pc-round"></div></div>
      <div class="pc-icons-quad"><div id="pcPeopleIcon" class="pc-round"></div><div id="pcBrandsIcon" class="pc-round"></div></div>
      <div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div>
    </div></div><button id="pcQuiz" hidden>Ta quiz</button>
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  windows.add(dom.window);
  const related = place.related_place_ids.map(id => ({ id, name: id.replaceAll("_", " ") }));
  dom.window.PLACES = [place, ...related];
  dom.window.eval(runtime);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded", { bubbles: true }));
  return dom.window;
}

test("Grev Wedels plass has resolved park ownership, media and production evidence", () => {
  assert.equal(production.identity.status, "resolved");
  assert.match(production.identity.represents, /parkrom/);
  assert.equal(production.textHashes.desc, sha256Text(place.desc));
  assert.equal(production.textHashes.popupDesc, sha256Text(place.popupDesc));
  assert.equal(production.completion.claimsVerified.verified, production.claims.length);
  assert.equal(place.history_layers.length, 5);
  assert.equal(place.popupDesc.split(/\n\s*\n/).length, 6);
  assert.match(place.image, /^https:\/\/commons\.wikimedia\.org\/wiki\/Special:Redirect\/file\//);
  assert.equal(place.imageLicense, "Public domain");
  assert.equal(place.for_na.beforeImageMeta.license, "CC BY-SA 4.0");
  assert.equal(place.related_place_ids.length, 4);
  const indexed = placesIndex.find(item => item.id === place.id);
  assert.ok(indexed);
  for (const key of ["year", "desc", "image", "cardImage", "coordNote"]) assert.equal(indexed[key], place[key], `places_index.${key}`);
});

test("PlaceCard keeps the fixed full composition without inventing a Brand", async () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "related"]);
  assert.equal(place.civication_store.length, 3);
  assert.ok(place.civication_store.every(item => item.physicalObject && item.placeSpecific));
  assert.equal(readJson("data/brands/brands_by_place.json").grev_wedels_plass, undefined);
  const window = makeRuntime();
  await window.HGPlaceCardCollections.apply(place);
  assert.deepEqual(Array.from(window.HGPlaceCardCollections.get(place), item => item.id), ["people", "objects", "brands", "related"]);
  const grid = window.document.querySelector(".pc-icons-quad");
  assert.equal(grid.dataset.collectionCount, "4");
  assert.equal(window.document.getElementById("pcPeopleIcon").dataset.collectionShape, "circle");
  assert.equal(window.document.getElementById("pcObjectsIcon").dataset.collectionShape, "rectangle");
  assert.equal(window.document.getElementById("pcBrandsIcon").dataset.collectionShape, "rectangle");
  assert.equal(window.document.getElementById("pcCategoryCollectionIcon").dataset.collectionShape, "rectangle");
  assert.equal(window.document.getElementById("pcObjectsList").querySelectorAll("[data-visual-round-item]").length, 3);
  assert.equal(window.document.getElementById("pcCategoryCollectionList").querySelectorAll("[data-visual-round-item]").length, 4);
  assert.equal(window.document.getElementById("pcBrandsIcon").hidden, false);
  assert.equal(window.document.getElementById("pcQuiz").classList.contains("pc-action-primary"), true);
});

test("People, Quiz/Knowledge and route are complete", () => {
  assert.equal(people.placeId, "eidsvollsbygningen");
  assert.ok(people.places.includes("grev_wedels_plass"));
  assert.equal(people.profileStatus, "ready_people_v1");
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7, 7, 7]);
  assert.equal(questions.length, 35);
  assert.ok(questions.every(question => question.knowledge_link_status === "linked"));
  assert.equal(new Set(questions.map(question => question.primary_knowledge_unit_id)).size, 35);
  const chapter = route.flatMap(item => item.chapters || []).find(item => item.placeId === place.id);
  assert.ok(chapter);
  assert.equal(chapter.tasks[0].type, "observation");
  assert.equal(Object.prototype.hasOwnProperty.call(chapter.tasks[0], "placeholder"), false);
  assert.match(chapter.tasks[0].prompt, /Kvinnetorso/);
});
