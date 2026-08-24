import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import { sha256Text } from "../scripts/validate-place-description-production-v4_2.mjs";

const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = readJson("data/places/by/oslo/places/bankplassen.json");
const production = readJson("data/places/production/bankplassen.json");
const quiz = readJson("data/quiz/by/bankplassen_sets_merged.json");
const quizManifest = readJson("data/quiz/manifest.json");
const fagManifest = readJson("data/fag/fag_manifest.json");
const route = readJson("data/routes/historical/routes_historical_oslo.json");
const placesIndex = readJson("data/places/places_index.json");
const civicationPeople = readJson("data/Civication/historyPeople_index.json");
const runtime = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");
const peopleManifest = readJson("data/people/manifest.json");
const people = peopleManifest.files.flatMap(file => {
  const value = readJson(`data/people/${file.slice("people/".length)}`);
  return Array.isArray(value) ? value : Array.isArray(value.people) ? value.people : [value];
});
const windows = new Set();

afterEach(() => {
  for (const window of windows) window.close();
  windows.clear();
});

function makeRuntime() {
  const dom = new JSDOM(`<!doctype html><body>
    <div id="placeCard" data-current-place-id="bankplassen"><div class="pc-body">
      <div class="pc-title-row"><h2>Bankplassen</h2><div id="pcBadgesIcon" class="pc-round"></div></div>
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

test("Bankplassen has resolved square identity, complete sources and canonical media", () => {
  assert.equal(production.identity.status, "resolved");
  assert.match(production.identity.represents, /plassrom/);
  assert.equal(production.textHashes.desc, sha256Text(place.desc));
  assert.equal(production.textHashes.popupDesc, sha256Text(place.popupDesc));
  assert.equal(production.completion.claimsVerified.verified, production.claims.length);
  assert.equal(place.history_layers.length, 5);
  assert.ok(place.popupDesc.split(/\n\s*\n/).length >= 6);
  assert.match(place.imageSourceUrl, /^https:\/\/commons\.wikimedia\.org\//);
  assert.equal(place.for_na.beforeImageMeta.license, "Public domain");
  assert.equal(place.for_na.nowImageMeta.license, "CC BY-SA 4.0");
  assert.equal(place.related_place_ids.length, 4);
  const indexed = placesIndex.find(item => item.id === "bankplassen");
  assert.ok(indexed);
  for (const key of ["year", "desc", "image", "cardImage", "coordNote"]) {
    assert.equal(indexed[key], place[key], `places_index.${key}`);
  }
});

test("PlaceCard fills the fixed four-cell contract and keeps Quiz primary", async () => {
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "related"]);
  assert.equal(place.civication_store.length, 4);
  assert.ok(place.civication_store.every(item => item.physicalObject && item.placeSpecific));
  const window = makeRuntime();
  await window.HGPlaceCardCollections.apply(place);
  assert.deepEqual(Array.from(window.HGPlaceCardCollections.get(place), item => item.id), ["people", "objects", "brands", "related"]);
  const grid = window.document.querySelector(".pc-icons-quad");
  assert.equal(grid.dataset.collectionCount, "4");
  assert.equal(grid.dataset.collectionProfileSource, "place_card_profile_v2");
  assert.equal(window.document.getElementById("pcPeopleIcon").dataset.collectionShape, "circle");
  assert.equal(window.document.getElementById("pcObjectsIcon").dataset.collectionShape, "rectangle");
  assert.equal(window.document.getElementById("pcBrandsIcon").dataset.collectionShape, "rectangle");
  assert.equal(window.document.getElementById("pcCategoryCollectionIcon").dataset.collectionShape, "rectangle");
  assert.equal(window.document.getElementById("pcObjectsList").querySelectorAll("[data-visual-round-item]").length, 4);
  assert.equal(window.document.getElementById("pcCategoryCollectionList").querySelectorAll("[data-visual-round-item]").length, 4);
  assert.equal(window.document.getElementById("pcPeopleIcon").hidden, false);
  assert.equal(window.document.getElementById("pcBrandsIcon").hidden, false);
  assert.equal(window.document.getElementById("pcQuiz").hidden, false);
  assert.equal(window.document.getElementById("pcQuiz").classList.contains("pc-action-primary"), true);
});

test("Bankplassen has one direct, statue-based People owner and no residual building ownership", () => {
  const direct = people.filter(person => [person.placeId, person.place_id, person.source_place_id, ...(person.places || []), ...(person.placeIds || [])].includes("bankplassen"));
  assert.deepEqual(direct.map(person => person.id), ["johannes_brun"]);
  const brun = direct[0];
  assert.equal(brun.profileStatus, "ready_people_v1");
  assert.ok(brun.source_urls.includes("https://www.oppdagkvadraturen.no/stoppesteder/johannes-brun-brynjulf-bergslien"));
  assert.deepEqual(readJson("data/brands/brands_by_place.json").bankplassen, ["engebret_cafe"]);
  const civicationFlat = Object.values(civicationPeople.categories || {}).flatMap(value => Array.isArray(value) ? value : []);
  assert.equal(civicationFlat.find(person => person.id === "johannes_brun")?.placeId, "bankplassen");
  assert.equal(civicationFlat.find(person => person.id === "sverre_fehn")?.placeId, "grunnlovsbygget_bankplassen");
  assert.equal(civicationFlat.some(person => person.id === "gjensidigestiftelsen"), false);
  const fehn = people.find(person => person.id === "sverre_fehn");
  assert.equal(fehn.placeId, "grunnlovsbygget_bankplassen");
  assert.ok(fehn.places.includes("grunnlovsbygget_bankplassen"));
});

test("Quiz is 5x7, Knowledge-linked and registered in both manifests", () => {
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7, 7, 7]);
  assert.equal(questions.length, 35);
  assert.ok(questions.every(question => question.knowledge_link_status === "linked"));
  assert.equal(new Set(questions.map(question => question.primary_knowledge_unit_id)).size, 35);
  assert.equal(quizManifest.sets.filter(row => row.targetId === "bankplassen").length, 1);
  assert.deepEqual(fagManifest.by.quizProduction.targets.bankplassen, {
    source_brief: "../quiz/production_briefs/by/bankplassen.json",
    context_artifact: "../quiz/production_context/by/bankplassen.json",
    quiz_file: "../quiz/by/bankplassen_sets_merged.json"
  });
});

test("Bankplassen route task is an actual on-site observation", () => {
  const chapter = route.flatMap(item => item.chapters || []).find(item => item.placeId === "bankplassen");
  assert.ok(chapter);
  assert.equal(chapter.tasks.length, 1);
  assert.equal(chapter.tasks[0].type, "observation");
  assert.equal(Object.prototype.hasOwnProperty.call(chapter.tasks[0], "placeholder"), false);
  assert.match(chapter.tasks[0].prompt, /1828, 1906 og 1986/);
});
