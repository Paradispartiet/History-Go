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
  const history = [
    { event: "show", ts: 900, shown: [{ type: "spatial", target_id: "b" }] },
    { event: "show", ts: 800, shown: [{ type: "spatial", target_id: "b" }] },
    { event: "show", ts: 700, shown: [{ type: "spatial", target_id: "b" }] },
    { event: "click", ts: 650, type: "spatial", target_id: "c" },
    { event: "click", ts: 600, type: "concept", target_id: "x1" },
    { event: "click", ts: 500, type: "concept", target_id: "x2" },
    { event: "click", ts: 400, type: "concept", target_id: "x3" },
    { event: "click", ts: 300, type: "concept", target_id: "x4" }
  ];

  const localStorage = createStorage({
    hg_nextup_history_v1: JSON.stringify(history)
  });

  const window = {
    PLACES: [],
    NEARBY_PLACES: [],
    WK_BY_PLACE: {},
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

  const debug = window.HGNavigator._debug;

  const repeated = debug.applyHistoryWeights({
    type: "spatial",
    target_id: "b",
    label: "B",
    score: 80,
    meta: {}
  });
  const clicked = debug.applyHistoryWeights({
    type: "spatial",
    target_id: "c",
    label: "C",
    score: 80,
    meta: {}
  });
  const preferredType = debug.applyHistoryWeights({
    type: "concept",
    target_id: "new-concept",
    label: "Nytt begrep",
    score: 50,
    meta: {}
  });
  const unseenType = debug.applyHistoryWeights({
    type: "wonderkammer",
    target_id: "wk-new",
    label: "Nytt funn",
    score: 50,
    meta: {}
  });

  assert.equal(repeated.meta.repeat_penalty, 18);
  assert.ok(repeated.score < 80, "repeated ignored target should be penalized");

  assert.equal(clicked.meta.recent_click_penalty, 12);
  assert.ok(clicked.score < 80, "recently clicked target should get cooldown");

  assert.ok(preferredType.meta.affinity_boost > 0);
  assert.ok(preferredType.score > 50, "frequently chosen type should get a bounded affinity boost");

  assert.equal(unseenType.meta.exploration_bonus, 3);
  assert.equal(unseenType.score, 53, "unseen types should retain a small exploration path");

  console.log("hg-navigator-personalization.test.js: ok");
})();
