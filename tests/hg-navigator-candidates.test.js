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
    {
      id: "a",
      name: "A",
      categoryId: "historie",
      emne_ids: ["arbeiderbevegelsen", "industrialisering"],
      quiz_profile: { primary_angles: ["Arbeiderbevegelsen", "Industrialisering"] }
    },
    { id: "b", name: "B", categoryId: "historie", emne_ids: ["arbeiderbevegelsen"], _d: 80 },
    { id: "c", name: "C", categoryId: "politikk", emne_ids: ["arbeiderbevegelsen"], _d: 140 },
    { id: "d", name: "D", categoryId: "historie", emne_ids: ["industrialisering"], _d: 220 },
    { id: "e", name: "E", categoryId: "kunst", emne_ids: ["modernisme"], _d: 300 }
  ];

  const stories = [
    {
      id: "story-1",
      title: "Fra fabrikk til folkestyre",
      place_id: "a",
      next_scenes: [
        { place_id: "c", reason: "Her fortsetter den politiske konflikten." },
        { place_id: "d", reason: "Her ser du den industrielle konsekvensen." }
      ],
      related_places: ["b"]
    }
  ];

  const localStorage = createStorage({
    visited_places: JSON.stringify({ a: true }),
    hg_quiz_sets_v1: JSON.stringify({}),
    hg_learning_log_v1: JSON.stringify([]),
    hg_insights_events_v1: JSON.stringify([]),
    hg_nextup_mode_v1: JSON.stringify({ mode: "learn" })
  });

  const window = {
    PLACES: places,
    NEARBY_PLACES: places.slice(1),
    WK_BY_PLACE: {
      a: [
        { id: "wk-1", title: "Fanen fra streiken", type: "object" },
        { id: "wk-2", title: "Arbeideravisen", type: "document" }
      ]
    },
    HGStories: {
      getByPlace(placeId) { return placeId === "a" ? stories : []; },
      all: stories
    },
    DEBUG: false
  };

  const context = vm.createContext({
    window,
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
    Infinity,
    encodeURIComponent
  });

  const source = fs.readFileSync(path.join(__dirname, "..", "js", "hgNavigator.js"), "utf8");
  vm.runInContext(source, context, { filename: "hgNavigator.js" });

  const tri = await window.HGNavigator.buildForPlace(places[0], {
    nearbyPlaces: places.slice(1)
  });

  assert.equal(tri.schema, "hg_nextup_v4");
  assert.ok(tri.candidate_counts.spatial >= 4);
  assert.ok(tri.candidate_counts.wonderkammer >= 2);
  assert.ok(tri.candidate_counts.narrative >= 3);
  assert.ok(tri.candidate_counts.concept >= 2);

  const keys = tri.suggestions.map(item => `${item.type}::${item.target_id}`);
  assert.equal(new Set(keys).size, keys.length, "ranked suggestions must be deduplicated");

  const countsByType = tri.suggestions.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});
  Object.values(countsByType).forEach(count => assert.ok(count <= 3));

  assert.ok(tri.suggestions.filter(item => item.type === "spatial").length >= 2);
  assert.ok(tri.suggestions.filter(item => item.type === "narrative").length >= 2);
  assert.ok(tri.suggestions.filter(item => item.type === "concept").length >= 2);
  assert.ok(tri.suggestions.filter(item => item.type === "wonderkammer").length >= 2);

  assert.ok(tri.spatial?.place_id);
  assert.ok(tri.wk?.entry_id);
  assert.ok(tri.narrative?.next_place_id);
  assert.ok(tri.concept?.emne_id);

  const debug = window.HGNavigator._debug;
  assert.ok(debug.buildSpatialCandidates(places[0], places.slice(1)).length >= 4);
  assert.ok(debug.buildWonderkammerCandidates(places[0]).length >= 2);
  assert.ok(debug.buildNarrativeCandidates(places[0]).length >= 3);
  assert.ok(debug.buildConceptCandidates(places[0]).length >= 2);

  console.log("hg-navigator-candidates.test.js: ok");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
