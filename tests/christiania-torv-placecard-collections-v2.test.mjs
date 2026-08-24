import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";

const readJson = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = readJson("data/places/by/oslo/places/christiania_torv.json");
const quiz = readJson("data/quiz/by/christiania_torv_sets.json");
const schema = readJson("data/places/regler/place_card_profile_v2.schema.json");
const runtime = fs.readFileSync("js/ui/place-rounds-visual-collections.js", "utf8");
const workcard = fs.readFileSync("reports/place-production/christiania-torv-workcard-current.md", "utf8");
const finalAudit = fs.readFileSync("reports/place-production/christiania-torv-final-completion-audit-v1.md", "utf8");
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
    <div id="placeCard" data-current-place-id="christiania_torv">
      <div class="pc-body">
        <div class="pc-title-row"><h2>Christiania Torv</h2><div id="pcBadgesIcon" class="pc-round"></div></div>
        <div class="pc-icons-quad">
          <div id="pcPeopleIcon" class="pc-round"></div>
          <div id="pcBrandsIcon" class="pc-round"></div>
        </div>
        <div id="pcPeopleList"></div><div id="pcBrandsList"></div><div id="pcBadgesList"></div>
      </div>
    </div>
    <button id="pcQuiz" hidden>Ta quiz</button>
  </body>`, { url: "https://history-go.test/", runScripts: "outside-only" });
  windows.add(dom.window);
  const related = place.related_place_ids.map(id => ({ id, name: id.replaceAll("_", " ") }));
  dom.window.PLACES = [place, ...related];
  dom.window.eval(runtime);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded", { bubbles: true }));
  return dom.window;
}

test("Christiania Torv uses the canonical full four-collection v2 profile", () => {
  assert.equal(Object.prototype.hasOwnProperty.call(place, "round_profile"), false);
  assert.deepEqual(place.place_card_profile, {
    schema: "history_go_place_card_profile_v2",
    collection_ids: ["people", "objects", "brands", "related"],
    reason: place.place_card_profile.reason,
    verifiedAt: "2026-08-24"
  });
  assert.ok(place.place_card_profile.reason.length >= schema.properties.reason.minLength);
  assert.match(place.place_card_profile.reason, /faste, fulle standardkomposisjonen/);
  assert.ok(!place.place_card_profile.collection_ids.includes("images"));
  assert.ok(place.place_card_profile.collection_ids.includes("brands"));
});

test("the three content-bearing collections remain place-specific while Brands stays an honest reserve", () => {
  const wenche = people.find(person => person.id === "wenche_gulbransen");
  assert.ok(wenche, "canonical Wenche Gulbransen profile must exist");
  assert.ok([wenche.placeId, ...(wenche.places || [])].includes("christiania_torv"));
  assert.equal(place.civication_store.length, 1);
  assert.equal(place.civication_store[0].id, "christiania_torv_christian_ivs_hanske");
  assert.equal(place.civication_store[0].physicalObject, true);
  assert.equal(place.related_place_ids.length, 5);
  assert.equal(new Set(place.related_place_ids).size, 5);
  assert.ok(place.related_place_ids.includes("gamle_radhus"));
});

test("runtime renders the v2 profile as a full 2 × 2 PlaceCard with prominent Quiz", async () => {
  const window = makeRuntime();
  await window.HGPlaceCardCollections.apply(place);
  const ids = Array.from(window.HGPlaceCardCollections.get(place), definition => definition.id);
  assert.deepEqual(ids, ["people", "objects", "brands", "related"]);
  assert.equal(window.HGPlaceCardCollections.getProfileSource(place), "place_card_profile_v2");
  const grid = window.document.querySelector(".pc-icons-quad");
  assert.equal(grid.dataset.collectionCount, "4");
  assert.equal(grid.dataset.collectionProfileSource, "place_card_profile_v2");
  assert.equal(window.document.getElementById("pcPeopleIcon").dataset.collectionShape, "circle");
  assert.equal(window.document.getElementById("pcObjectsIcon").dataset.collectionShape, "rectangle");
  assert.equal(window.document.getElementById("pcCategoryCollectionIcon").dataset.collectionShape, "rectangle");
  assert.equal(window.document.getElementById("pcObjectsList").querySelectorAll("[data-visual-round-item]").length, 1);
  assert.equal(window.document.getElementById("pcCategoryCollectionList").querySelectorAll("[data-visual-round-item]").length, 5);
  assert.equal(window.document.getElementById("pcBrandsIcon").hidden, false);
  assert.equal(window.document.getElementById("pcBrandsIcon").dataset.collectionShape, "rectangle");
  const quizButton = window.document.getElementById("pcQuiz");
  assert.equal(quizButton.hidden, false);
  assert.equal(quizButton.classList.contains("pc-action-primary"), true);
});

test("popup, Quiz and production richness remain complete after PlaceCard migration", () => {
  assert.ok(place.popupDesc.split(/\n\s*\n/).length >= 5);
  assert.equal(place.history_layers.length, 4);
  assert.equal(place.source_summary.safe_sources.length, 5);
  assert.match(place.imageSourceUrl, /^https:\/\/commons\.wikimedia\.org\//);
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(quiz.sets.length, 5);
  assert.equal(questions.length, 35);
  assert.ok(questions.every(question => question.knowledge_link_status === "linked"));
  assert.ok(questions.every(question => question.primary_knowledge_unit_id));
  assert.match(workcard, /VALGTE PLACECARD-SAMLINGER: `people`, `objects`, `brands`, `related`/);
  assert.match(workcard, /Bilder er ikke samling/);
  assert.match(finalAudit, /første eksplisitte `place_card_profile` v2-piloten/);
});
