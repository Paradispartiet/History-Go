const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const store = new Map();
const warnings = [];
const events = [{ id: "event_1", event_type: "ferry" }];
const context = {
  window: {
    HG_CARAVAN: {
      routes: [{ id: "route_italia" }],
      badges: [
        { id: "caravan_first_stage", title: "Første etappe", criteria_type: "completed_stage_count", criteria: { count: 1 }, visible: true, sort_order: 1 },
        { id: "caravan_horse_started", title: "Hestekaravane startet", criteria_type: "started_stage_count", criteria: { mode: "hest", count: 1 }, visible: true, sort_order: 2 },
        { id: "caravan_ferry_crossing", title: "Sjøpassasjen", criteria_type: "event_type_choice_logged", criteria: { event_type: "ferry", count: 1 }, visible: true, sort_order: 3 },
        { id: "caravan_first_consequence", title: "Første konsekvens", criteria_type: "consequence_applied_count", criteria: { count: 1 }, visible: true, sort_order: 4 }
      ],
      events,
      indexes: { badgesById: {}, eventsById: { event_1: events[0] } }
    },
    HG_CARAVAN_PROGRESS: { getAll: () => ({ progress: { route_italia: { stage_1: { hest: { status: "completed" } } } } }) },
    HG_CARAVAN_EVENT_LOG: { getAll: () => ({ entries: [{ route_id: "route_italia", stage_id: "stage_1", event_id: "event_1", travel_mode: "hest", choice_id: "ferry" }] }) },
    HG_CARAVAN_CONSEQUENCES: { getAll: () => ({ applied: { route_italia: { stage_1: { event_1: { hest: { choice_id: "ferry" } } } } } }) },
    localStorage: {
      getItem: (key) => store.has(key) ? store.get(key) : null,
      setItem: (key, value) => store.set(key, value),
      removeItem: (key) => store.delete(key)
    },
    dispatchEvent: () => true
  },
  console: { warn: (...args) => warnings.push(args) },
  CustomEvent: function CustomEvent(type, init) { this.type = type; this.detail = init && init.detail; },
  Date, JSON, Object, Array, Number, Set, String
};
for (const badge of context.window.HG_CARAVAN.badges) context.window.HG_CARAVAN.indexes.badgesById[badge.id] = badge;
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync("js/caravan-badges.js", "utf8"), context);

const api = context.window.HG_CARAVAN_BADGES;
assert.strictEqual(api.summary().total, 4, "all visible badge definitions are counted");
assert.deepStrictEqual(api.getUnlocked(), {}, "empty localStorage starts locked");
api.evaluateAll();
assert(api.isUnlocked("caravan_first_stage"), "completed stage unlocks first stage badge");
assert(api.isUnlocked("caravan_horse_started"), "started/completed hest stage unlocks horse badge");
assert(api.isUnlocked("caravan_ferry_crossing"), "ferry event choice unlocks ferry badge");
assert(api.isUnlocked("caravan_first_consequence"), "applied consequence unlocks consequence badge");
assert.strictEqual(api.summary().unlocked, 4, "summary counts unlocked badges");
store.set("HG_CARAVAN_BADGES_V1", "{bad json");
assert.doesNotThrow(() => api.getUnlocked(), "corrupt localStorage does not crash");
assert(warnings.some((args) => String(args[0]) === "[HG_CARAVAN_BADGES]"), "corrupt storage logs prefixed warning");
api.resetBadges();
assert.deepStrictEqual(api.getUnlocked(), {}, "reset removes local caravan badges");
console.log("PASS: caravan badges test completed.");
