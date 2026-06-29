const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const writes = [];
const store = new Map();
const warnings = [];
const context = {
  window: {
    HG_CARAVAN: {
      stages: [
        { id: "stage_1", route_id: "route_italia" },
        { id: "stage_2", route_id: "route_italia" }
      ]
    },
    localStorage: {
      getItem: (key) => store.has(key) ? store.get(key) : null,
      setItem: (key, value) => { writes.push(key); store.set(key, value); },
      removeItem: (key) => store.delete(key)
    },
    dispatchEvent: () => true
  },
  console: { warn: (...args) => warnings.push(args) },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; },
  Date,
  JSON,
  Object,
  Array,
  Number,
  Set,
  String
};
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync("js/caravan-progress.js", "utf8"), context);

const progress = context.window.HG_CARAVAN_PROGRESS;
assert(progress, "progress API is exported");
assert.deepStrictEqual(progress.getAll().progress, {}, "empty localStorage starts with empty progress");

progress.setProgress("route_italia", "stage_1", "hest", "planned");
assert.strictEqual(progress.getProgress("route_italia", "stage_1", "hest").status, "planned", "planned is stored per mode");
progress.setProgress("route_italia", "stage_1", "hest", "completed");
assert.strictEqual(progress.getRouteSummary("route_italia", "hest").completed, 1, "route summary counts completed stages for selected mode");
progress.setProgress("route_italia", "stage_1", "sykkel", "started");
assert.strictEqual(progress.getRouteSummary("route_italia", "all").progressionPoints, 2, "all-mode summary counts progression points");
progress.clearProgress("route_italia", "stage_1", "hest");
assert.strictEqual(progress.getProgress("route_italia", "stage_1", "hest"), null, "clear removes selected mode only");
assert.strictEqual(progress.getProgress("route_italia", "stage_1", "sykkel").status, "started", "other modes are preserved");

store.set("HG_CARAVAN_PROGRESS_V1", "{bad json");
assert.deepStrictEqual(progress.getAll().progress, {}, "corrupt localStorage resets to empty progress");
assert(warnings.some((args) => String(args[0]) === "[HG_CARAVAN_PROGRESS]"), "corrupt storage logs prefixed warning");

progress.setProgress("route_italia", "missing_stage", "hest", "planned");
assert(warnings.some((args) => args[1] === "stage mangler"), "missing stages log prefixed warning");
assert.deepStrictEqual([...new Set(writes)], ["HG_CARAVAN_PROGRESS_V1"], "only caravan progress key is written");
console.log("PASS: caravan progress test completed.");
