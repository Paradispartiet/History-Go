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
  "writeCivicationAccess"
]) {
  assert.strictEqual(typeof adapter[method], "function", `${method} is exposed`);
}

console.log("CivicationStorageAdapter checks passed.");
