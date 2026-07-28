#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");
const sourcePath = path.join(repoRoot, "js/profile-place-collection.js");
const source = fs.readFileSync(sourcePath, "utf8");

const storage = new Map([
  ["visited_places", JSON.stringify({ physical_place: true })],
  ["places_collected", JSON.stringify({ quiz_place: { source: "quiz", ts: 1 } })],
  ["people_collected", JSON.stringify({ person_1: true })]
]);
const writes = [];

const makeElement = () => ({
  innerHTML: "",
  textContent: "",
  style: {},
  querySelectorAll() { return []; }
});

const elements = {
  collectionGrid: makeElement(),
  timelineBody: makeElement(),
  timelineProgressBar: makeElement(),
  timelineProgressText: makeElement(),
  collectionCardsBody: makeElement()
};

const documentStub = {
  readyState: "complete",
  getElementById(id) { return elements[id] || null; },
  addEventListener() {}
};

const windowStub = {
  PLACES: [
    { id: "physical_place", name: "Fysisk sted", category: "historie", year: 1900, desc: "Fysisk besøkt", image: "physical.png", cardImage: "physical-card.png" },
    { id: "quiz_place", name: "Quizsted", category: "kunst", year: 1950, desc: "Kun quiz", image: "quiz.png", cardImage: "quiz-card.png" },
    { id: "untouched_place", name: "Urørt sted", category: "natur", year: 2000, desc: "Ingen progresjon", image: "untouched.png", cardImage: "untouched-card.png" }
  ],
  PEOPLE: [
    { id: "person_1", name: "Samlet person", year: 1920, image: "person.png", imageCard: "person-card.png" }
  ],
  addEventListener() {},
  showPlacePopup() {},
  showPersonPopup() {}
};

const localStorageStub = {
  getItem(key) { return storage.has(key) ? storage.get(key) : null; },
  setItem(key, value) { writes.push([key, value]); storage.set(key, String(value)); },
  removeItem(key) { storage.delete(key); }
};

vm.runInNewContext(source, {
  window: windowStub,
  document: documentStub,
  localStorage: localStorageStub,
  console,
  setTimeout(fn) { fn(); return 1; },
  Set,
  Array,
  Object,
  String,
  Number,
  Math,
  JSON
}, { filename: sourcePath });

const api = windowStub.HGProfilePlaceCollection;
assert.ok(api, "profile place collection API is exposed");
assert.deepStrictEqual(Array.from(api.getVisitedPlaceIds()), ["physical_place"], "visited remains physical-only");
assert.deepStrictEqual(Array.from(api.getQuizCollectedPlaceIds()), ["quiz_place"], "quiz collection stays separate");
assert.deepStrictEqual(Array.from(api.getCollectedPlaceIds()).sort(), ["physical_place", "quiz_place"], "profile collection is the union");
assert.strictEqual(api.getCollectedSource("physical_place"), "Besøkt");
assert.strictEqual(api.getCollectedSource("quiz_place"), "Quiz");

api.refresh();

assert.match(elements.collectionGrid.innerHTML, /Fysisk sted/, "physical place appears in detailed collection");
assert.match(elements.collectionGrid.innerHTML, /Quizsted/, "quiz-only place appears in detailed collection");
assert.doesNotMatch(elements.collectionGrid.innerHTML, /Urørt sted/, "unearned place stays out of collection");
assert.match(elements.collectionGrid.innerHTML, /Besøkt/, "physical source is visible");
assert.match(elements.collectionGrid.innerHTML, /Quiz/, "quiz source is visible");

assert.match(elements.timelineBody.innerHTML, /Fysisk sted/);
assert.match(elements.timelineBody.innerHTML, /Quizsted/);
assert.match(elements.timelineBody.innerHTML, /Samlet person/);
assert.match(elements.collectionCardsBody.innerHTML, /Fysisk sted/);
assert.match(elements.collectionCardsBody.innerHTML, /Quizsted/);
assert.match(elements.collectionCardsBody.innerHTML, /Samlet person/);

assert.deepStrictEqual(writes, [], "profile collection read model never mutates physical or quiz progress");

console.log("Profile collection includes physical and quiz-collected places without conflating visits.");
