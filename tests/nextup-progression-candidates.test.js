const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createStorage(seed = {}) {
  const store = new Map(Object.entries(seed));
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); },
    removeItem(key) { store.delete(key); }
  };
}

(async () => {
  const places = [
    { id: "a", name: "A", category: "historie" },
    { id: "b", name: "B", category: "historie" },
    { id: "c", name: "C", category: "kunst" }
  ];
  const localStorage = createStorage({
    visited_places: JSON.stringify({ a: true }),
    merits_by_category: JSON.stringify({ historie: { points: 4 } }),
    hg_nextup_history_v1: JSON.stringify([])
  });

  const document = {
    addEventListener() {}
  };
  const window = {
    PLACES: places,
    NEARBY_PLACES: [places[1], places[2]],
    BADGES: [{ id: "historie", name: "Historie", tiers: [{ label: "Student", threshold: 5 }] }],
    DomainRegistry: { toRuntimeCategoryId(value) { return value; } },
    QuizEngine: {
      async getTargetSummary(id) {
        if (id === "a") return { hasAny: true, totalSets: 3, completedSets: 1, remainingSets: 2, isComplete: false };
        if (id === "b") return { hasAny: true, totalSets: 1, completedSets: 0, remainingSets: 1, isComplete: false };
        return { hasAny: false, totalSets: 0, completedSets: 0, remainingSets: 0, isComplete: false };
      }
    },
    HGNavigator: {
      async buildForPlace(place) {
        return {
          schema: "hg_nextup_v4",
          mode: { mode: "complete" },
          current_place_id: place.id,
          suggestions: [
            { type: "spatial", target_id: "b", label: "B", score: 80, source: "places", meta: { place_id: "b" } },
            { type: "spatial", target_id: "c", label: "C", score: 70, source: "places", meta: { place_id: "c" } }
          ],
          candidate_counts: { spatial: 2 }
        };
      },
      _debug: {
        selectRankedSuggestions(items) { return items.sort((a, b) => b.score - a.score).slice(0, 12); },
        applyHistoryWeights(item) { return item; }
      }
    },
    setTimeout(fn) { fn(); },
    dispatchEvent() {},
    HGBadges: { async ensureBadgesLoaded() { return window.BADGES; } }
  };

  const context = vm.createContext({
    window,
    document,
    localStorage,
    console,
    Date,
    JSON,
    Math,
    Number,
    String,
    Array,
    Object,
    Set,
    Map,
    Promise,
    Event: function Event() {},
    CustomEvent: function CustomEvent() {}
  });

  const source = fs.readFileSync(path.join(__dirname, "..", "js", "nextUpProgression.js"), "utf8");
  vm.runInContext(source, context, { filename: "nextUpProgression.js" });

  const tri = await window.HGNavigator.buildForPlace(places[0], { nearbyPlaces: window.NEARBY_PLACES });
  assert.equal(tri.schema, "hg_nextup_v4_progression");
  assert.equal(tri.candidate_counts.quiz, 2);
  assert.equal(tri.candidate_counts.badge, 1);

  const quiz = tri.suggestions.find(item => item.type === "quiz" && item.target_id === "a");
  assert.ok(quiz, "current place incomplete quiz should be suggested");
  assert.equal(quiz.meta.remaining_sets, 2);
  assert.equal(quiz.score, 100, "complete mode should strongly boost actionable quiz progress");

  const badge = tri.suggestions.find(item => item.type === "badge");
  assert.ok(badge, "an incomplete quiz that advances the next badge tier should be suggested");
  assert.equal(badge.meta.points_remaining, 1);
  assert.equal(badge.meta.place_id, "a");
  assert.equal(badge.meta.quiz_target_id, "a");

  console.log("nextup-progression-candidates.test.js: ok");
})();
