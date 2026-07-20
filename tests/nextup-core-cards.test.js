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

(() => {
  const localStorage = createStorage();
  const listeners = new Map();
  const window = {
    HGNavigator: {
      async buildForPlace() { return {}; }
    },
    addEventListener(type, handler) { listeners.set(type, handler); },
    setTimeout(fn) { fn(); return 1; },
    setInterval(fn) { fn(); return 1; },
    clearInterval() {},
    renderNextUpV2() {}
  };

  const context = vm.createContext({
    window,
    localStorage,
    console,
    JSON,
    Number,
    String,
    Array,
    Object,
    Set,
    Map
  });

  const source = fs.readFileSync(path.join(__dirname, "..", "js", "nextUpCoreCards.js"), "utf8");
  vm.runInContext(source, context, { filename: "nextUpCoreCards.js" });

  const tri = {
    suggestions: [
      { type: "quiz", target_id: "quiz-a", label: "Quiz", score: 99, meta: {} },
      { type: "spatial", target_id: "ranked-place", label: "Rangert sted", score: 88, meta: { place_id: "ranked-place" } }
    ],
    spatial: { place_id: "legacy-place", label: "Legacy sted", score: 70 },
    wk: { entry_id: "wk-1", label: "Et funn", score: 60 },
    narrative: { next_place_id: "scene-1", story_id: "story-1", label: "Neste scene", score: 65 },
    concept: { emne_id: "concept-1", subject_id: "historie", label: "Et begrep", score: 55 }
  };

  const repaired = window.HGNextUpCoreCards.ensureCoreCards(tri);
  assert.deepEqual(
    repaired.suggestions.slice(0, 4).map(item => item.type),
    ["spatial", "wonderkammer", "narrative", "concept"]
  );
  assert.equal(repaired.suggestions[0].target_id, "ranked-place", "existing ranked core candidate should win over legacy fallback");
  assert.equal(repaired.suggestions[1].target_id, "wk-1");
  assert.equal(repaired.suggestions[2].target_id, "scene-1");
  assert.equal(repaired.suggestions[3].target_id, "concept-1");
  assert.equal(repaired.suggestions[4].type, "quiz", "extra recommendation types should remain after the core cards");
  assert.equal(repaired.core_suggestions.length, 4);
  assert.ok(repaired.core_suggestions.every(item => item.meta.core_card === true));

  console.log("nextup-core-cards.test.js: ok");
})();
