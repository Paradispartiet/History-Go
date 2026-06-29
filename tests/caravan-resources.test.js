const assert = require("assert");
const fs = require("fs");
const vm = require("vm");

const store = new Map();
const warnings = [];
const context = {
  window: {
    localStorage: {
      getItem: (key) => store.get(key) || null,
      setItem: (key, value) => store.set(key, value)
    },
    dispatchEvent: () => true,
    CustomEvent: function CustomEvent(type, init) { return { type, ...init }; }
  },
  console: { warn: (...args) => warnings.push(args) },
  Date,
  JSON,
  Number,
  String,
  Object,
  Array,
  Math
};
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(fs.readFileSync("js/caravan-resources.js", "utf8"), context);

const api = context.window.HG_CARAVAN_RESOURCES;
assert(api, "resources API is exported");
assert.deepStrictEqual(Object.keys(api.getResources("karavanen_italia_oslo_roma", "til_fots")).filter((key) => key !== "updatedAt"), ["energi", "vann", "hvile", "utstyr"], "walking defaults are exposed");
api.adjustResource("karavanen_italia_oslo_roma", "hest", "energi", -25);
assert.strictEqual(api.getResources("karavanen_italia_oslo_roma", "hest").energi, 75, "adjustResource stores delta");
api.setResource("karavanen_italia_oslo_roma", "hest", "energi", 999);
assert.strictEqual(api.getResources("karavanen_italia_oslo_roma", "hest").energi, 100, "setResource clamps high values");
api.adjustResource("karavanen_italia_oslo_roma", "hest", "energi", -999);
assert.strictEqual(api.getResources("karavanen_italia_oslo_roma", "hest").energi, 0, "adjustResource clamps low values");
api.resetResources("karavanen_italia_oslo_roma", "hest");
assert.strictEqual(api.getResources("karavanen_italia_oslo_roma", "hest").hestehelse, 100, "reset restores horse resources");
api.setResource("karavanen_italia_oslo_roma", "sykkel", "hestehelse", 50);
assert(warnings.some((args) => String(args[0]) === "[HG_CARAVAN_RESOURCES]" && String(args[1]).includes("ugyldig ressurs")), "invalid resource key warns");
api.getResources("karavanen_italia_oslo_roma", "bil");
assert(warnings.some((args) => String(args[0]) === "[HG_CARAVAN_RESOURCES]" && String(args[1]).includes("ugyldig travel mode")), "invalid mode warns");
store.set("HG_CARAVAN_RESOURCES_V1", "{bad json");
assert.strictEqual(api.getResources("karavanen_italia_oslo_roma", "hest").energi, 100, "corrupt storage resets to defaults without crashing");
assert(warnings.some((args) => String(args[1]).includes("korrupt localStorage")), "corrupt storage logs prefixed warning");
console.log("PASS: caravan resources test completed.");
