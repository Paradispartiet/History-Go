const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const store = new Map();
const warnings = [];
const context = vm.createContext({
  console: { warn: (...args) => warnings.push(args), log: console.log },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init?.detail; },
  window: {
    localStorage: { getItem: (key) => store.get(key) || null, setItem: (key, value) => store.set(key, value) },
    dispatchEvent: () => {},
    HG_CARAVAN: {
      events: [{ id: "event_1", choices: [{ id: "wait", resource_effects_by_mode: { hest: { hvile: 10, energi: -5 } } }] }]
    },
    HG_CARAVAN_RESOURCES: {
      calls: [],
      adjustResource(routeId, mode, resourceKey, delta) { this.calls.push({ routeId, mode, resourceKey, delta }); return {}; }
    }
  }
});
context.global = context;

vm.runInContext(fs.readFileSync("js/caravan-consequences.js", "utf8"), context);
const api = context.window.HG_CARAVAN_CONSEQUENCES;

assert.strictEqual(JSON.stringify(api.getChoiceEffects("event_1", "wait", "hest")), JSON.stringify({ hvile: 10, energi: -5 }), "effects are exposed for choice/mode");
assert.strictEqual(api.getChoiceEffects("event_1", "wait", "all"), null, "all mode has no effects API result");
assert.strictEqual(api.canApplyChoiceEffects("route", "stage", "event_1", "wait", "hest"), true, "first apply is allowed");
const applied = api.applyChoiceEffects("route", "stage", "event_1", "wait", "hest");
assert.strictEqual(applied.choice_id, "wait", "apply stores selected choice");
assert.deepStrictEqual(context.window.HG_CARAVAN_RESOURCES.calls.map((call) => [call.resourceKey, call.delta]), [["hvile", 10], ["energi", -5]], "apply adjusts resources through resources API");
assert.strictEqual(api.canApplyChoiceEffects("route", "stage", "event_1", "wait", "hest"), false, "second apply is blocked");
assert.strictEqual(api.applyChoiceEffects("route", "stage", "event_1", "wait", "hest"), null, "second apply returns null");
api.clearApplied("route", "stage", "event_1", "hest");
assert.strictEqual(api.getApplied("route", "stage", "event_1", "hest"), null, "clear removes marker only");
store.set("HG_CARAVAN_CONSEQUENCES_V1", "{bad json");
assert.strictEqual(JSON.stringify(api.getAll().applied), JSON.stringify({}), "corrupt storage does not crash");
assert(warnings.some((args) => String(args[0]) === "[HG_CARAVAN]"), "corrupt storage logs HG_CARAVAN warning");
console.log("PASS: caravan consequences test completed.");
