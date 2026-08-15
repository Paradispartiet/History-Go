const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const dailyPath = path.join(repoRoot, "js/Civication/systems/civicationDailyMailBuilder.js");
const workdaySource = fs.readFileSync(workdayPath, "utf8");
const dailySource = fs.readFileSync(dailyPath, "utf8");

for (const source of [workdaySource, dailySource]) {
  assert(!source.includes("__civi_fallback_choice"));
  assert(!source.includes("Gjør dette ryddig og dokumenter det"));
  assert(!source.includes("Løs det raskt og gå videre"));
}

const windowObject = {
  DEBUG: false,
  CivicationState: {
    getState: () => ({}),
    getActivePosition: () => null
  },
  CivicationMailRuntime: {
    makeCandidateMailsForActiveRole: async () => []
  }
};
windowObject.window = windowObject;
windowObject.addEventListener = () => {};
const documentObject = { readyState: "loading", addEventListener: () => {} };
const context = vm.createContext({
  window: windowObject,
  document: documentObject,
  console,
  Date,
  Array,
  Object,
  String,
  Number,
  Promise,
  Set,
  Map,
  Math,
  Event: function Event(type) { this.type = type; }
});
vm.runInContext(workdaySource, context, { filename: workdayPath });

const normalize = windowObject.CivicationSceneCatalog?.normalizeChoices;
assert.equal(typeof normalize, "function");
assert.deepEqual(Array.from(normalize([])), []);
const one = Array.from(normalize([{ id: "ack", label: "Bekreft" }]));
assert.equal(one.length, 1);
assert.equal(one[0].id, "ack");
assert.equal(one[0].label, "Bekreft");
const two = Array.from(normalize([
  { id: "A", label: "Undersøk" },
  { id: "B", label: "Eskaler" }
]));
assert.equal(two.length, 2);
assert.deepEqual(two.map((choice) => choice.id), ["A", "B"]);
assert(two.every((choice) => choice.__civi_fallback_choice !== true));

console.log("civication-scene-interaction-no-fallback.test.js: PASS");
