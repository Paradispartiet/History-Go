#!/usr/bin/env node
// Verifies the narrow CivicationStorageAdapter localStorage facade.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const adapterPath = path.join(root, "js/Civication/core/CivicationStorageAdapter.js");
const code = fs.readFileSync(adapterPath, "utf8");

function createLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      key = String(key);
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    }
  };
}

global.window = global;
global.localStorage = createLocalStorage();
global.console = { ...console, warn() {} };

vm.runInThisContext(code, { filename: "js/Civication/core/CivicationStorageAdapter.js" });

const adapter = global.CivicationStorageAdapter;

assert(adapter, "global CivicationStorageAdapter export exists");
assert.strictEqual(typeof adapter, "object", "adapter is an object");

assert.deepStrictEqual(
  adapter.readJson("missing_key", { fallback: true }),
  { fallback: true },
  "readJson returns fallback for missing key"
);

localStorage.setItem("bad_json", "{not valid json");
assert.deepStrictEqual(
  adapter.readJson("bad_json", ["fallback"]),
  ["fallback"],
  "readJson returns fallback for invalid JSON"
);

const roundtrip = { ok: true, count: 2, nested: { value: "yes" } };
adapter.writeJson("roundtrip_key", roundtrip);
assert.deepStrictEqual(
  adapter.readJson("roundtrip_key", null),
  roundtrip,
  "writeJson/readJson roundtrip works"
);

for (const method of [
  "readVisitedPlaces",
  "readMeritsByCategory",
  "readQuizProgress"
]) {
  assert.strictEqual(typeof adapter[method], "function", `${method} is exposed`);
}

for (const method of [
  "writeVisitedPlaces",
  "writeMeritsByCategory",
  "writeQuizProgress"
]) {
  assert.strictEqual(adapter[method], undefined, `${method} is not exposed`);
}

for (const method of [
  "readCivicationState",
  "writeCivicationState",
  "readMailStore",
  "writeMailStore",
  "readLegacyInbox",
  "writeLegacyInbox",
  "readActivePosition",
  "writeActivePosition",
  "readCalendar",
  "writeCalendar",
  "readHome",
  "writeHome",
  "readCapital",
  "writeCapital",
  "readPcWallet",
  "writePcWallet",
  "readCiviWallet",
  "writeCiviWallet",
  "readCivicationAccess",
  "writeCivicationAccess",
  "readTravelState",
  "writeTravelState",
  "updateTravelState",
  "appendTravelLog",
  "clearPendingTravelRequest"
]) {
  assert.strictEqual(typeof adapter[method], "function", `${method} is exposed`);
}

assert.strictEqual(adapter.KEYS.TRAVEL, "hg_civi_travel_v1", "travel key is exposed");

const originalProgression = {
  visited_places: [{ id: "existing" }],
  merits_by_category: { sport: { points: 3 } },
  quiz_progress: { quiz_a: { done: true } }
};
localStorage.setItem("visited_places", JSON.stringify(originalProgression.visited_places));
localStorage.setItem("merits_by_category", JSON.stringify(originalProgression.merits_by_category));
localStorage.setItem("quiz_progress", JSON.stringify(originalProgression.quiz_progress));

adapter.writeTravelState({ version: 1, pendingTravelRequest: { placeId: "oslo" }, travelLog: [] });
assert.deepStrictEqual(
  adapter.readTravelState(),
  { version: 1, pendingTravelRequest: { placeId: "oslo" }, travelLog: [] },
  "travel state roundtrip uses the travel key"
);

adapter.updateTravelState({ currentDestination: { placeId: "oslo", status: "requested" } });
assert.deepStrictEqual(
  adapter.readTravelState().currentDestination,
  { placeId: "oslo", status: "requested" },
  "updateTravelState patches the travel state"
);

adapter.appendTravelLog({ status: "requested", placeId: "oslo" });
assert.strictEqual(adapter.readTravelState().travelLog.length, 1, "appendTravelLog appends to travelLog");

adapter.clearPendingTravelRequest();
assert.strictEqual(adapter.readTravelState().pendingTravelRequest, null, "clearPendingTravelRequest clears pending travel only");

assert.deepStrictEqual(adapter.readVisitedPlaces(), originalProgression.visited_places, "travel methods do not change visited_places");
assert.deepStrictEqual(adapter.readMeritsByCategory(), originalProgression.merits_by_category, "travel methods do not change merits_by_category");
assert.deepStrictEqual(adapter.readQuizProgress(), originalProgression.quiz_progress, "travel methods do not change quiz_progress");

console.log("CivicationStorageAdapter checks passed.");
