#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const modePath = path.join(root, "js/ui/toast.js");

global.window = global;
global.document = undefined;
global.location = { hash: "#/map", href: "index.html#/map" };
global.localStorage = (() => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null),
    setItem: (k, v) => m.set(String(k), String(v)),
    removeItem: (k) => m.delete(String(k)),
    clear: () => m.clear()
  };
})();

global.PLACES = [];
vm.runInThisContext(fs.readFileSync(modePath, "utf8"), { filename: modePath });

const Mode = global.HGCivicationMode;
assert(Mode, "mode API exposed");
assert.strictEqual(Mode.SESSION_KEY, "hg_civication_mode_v1");

const session = Mode.normalizeSession({
  active: true,
  started_ts: Date.now(),
  title: "Bygg faglig grunnlag",
  target_type: "knowledge",
  target_id: "quiz_oslo_1",
  quiz_id: "quiz_oslo_1",
  category_id: "historie",
  emne_id: "kildekritikk",
  completion_mode: "quiz_completed",
  payload: { target_type: "knowledge", quiz_id: "quiz_oslo_1", category_id: "historie", emne_id: "kildekritikk" }
});
assert(session, "session normalizes");
assert.strictEqual(session.title, "Bygg faglig grunnlag");

const places = [
  { id: "relevant", name: "Relevant sted", category: "historie", emne_ids: ["kildekritikk"], lat: 59.91, lon: 10.75 },
  { id: "broad", name: "Historisk sted", category: "historie", lat: 59.92, lon: 10.76 },
  { id: "other", name: "Annet", category: "natur", lat: 59.93, lon: 10.77 }
];
const suggestions = Mode.suggestPlaces(session, places);
assert.strictEqual(suggestions[0].place.id, "relevant", "emne match ranks first");
assert.ok(suggestions.some((row) => row.place.id === "broad"), "category match included");
assert.ok(!suggestions.some((row) => row.place.id === "other"), "irrelevant place excluded");

let state = {
  visitedPlaces: new Set(),
  unlockByQuiz: {},
  quizProgress: {},
  merits: {},
  readStories: {},
  readLeksikon: {},
  readPersons: {},
  debateById: {},
  debateByConflict: {}
};
assert.strictEqual(Mode.evaluateCompletion(session, state).completed, false, "not completed before quiz");
state.unlockByQuiz.quiz_oslo_1 = { quizId: "quiz_oslo_1" };
assert.deepStrictEqual(Mode.evaluateCompletion(session, state), { completed: true, correct: true, source: "unlock_index" });

const placeSession = Mode.normalizeSession({
  active: true,
  started_ts: Date.now(),
  target_type: "place",
  target_id: "akershus_festning",
  place_id: "akershus_festning",
  completion_mode: "visit_place",
  payload: { target_type: "place", place_id: "akershus_festning" }
});
state = { ...state, visitedPlaces: new Set(["akershus_festning"]), unlockByQuiz: {} };
assert.strictEqual(Mode.evaluateCompletion(placeSession, state).completed, true, "visited place completes visit task");

console.log("civication history-go mode ok");
