const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

function makeStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    clear: () => data.clear()
  };
}

const localStorage = makeStorage();
const listeners = [];
const document = {
  readyState: "loading",
  getElementById: () => null,
  addEventListener: () => {}
};
const window = {
  localStorage,
  HGLearningLog: {
    getQuizHistory: () => [],
    getVisitHistory: () => []
  },
  addEventListener: (name, fn) => listeners.push([name, fn]),
  dispatchEvent: () => true,
  setTimeout: () => 0
};

const sandbox = {
  window,
  document,
  localStorage,
  console,
  Event: function Event(type) { this.type = type; },
  setTimeout: window.setTimeout
};
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

const src = fs.readFileSync(path.join(__dirname, "..", "js", "Civication", "ui", "CivicationHome.js"), "utf8");
vm.runInContext(src, sandbox, { filename: "CivicationHome.js" });

assert.strictEqual(typeof window.CivicationHome.getHomeSnapshot, "function", "getHomeSnapshot eksporteres");
assert.strictEqual(typeof window.CivicationHome.getDistrictViewModels, "function", "getDistrictViewModels eksporteres");

localStorage.clear();
localStorage.setItem("hg_capital_v1", JSON.stringify({ economic: 0 }));

const emptySnapshot = window.CivicationHome.getHomeSnapshot();
assert.deepStrictEqual(Object.keys(emptySnapshot), [
  "state",
  "currentDistrict",
  "selectedAccess",
  "capital",
  "economicCapital",
  "districts",
  "startDistricts",
  "settled",
  "housingPressure",
  "rentArrears",
  "lastRentAmount",
  "moveCount",
  "monthlyRentLabel",
  "homeInfluence"
], "snapshot har stabil toppnivå-shape uten valgt nabolag");
assert.strictEqual(emptySnapshot.currentDistrict, null, "ingen currentDistrict uten valgt nabolag");
assert.strictEqual(emptySnapshot.settled, false, "settled er false uten valgt nabolag");

const viewModels = window.CivicationHome.getDistrictViewModels();
const startDistricts = viewModels.filter((district) => district.isStartOption);
assert.ok(startDistricts.length >= 3, "view models inkluderer startnabolag");
assert.ok(startDistricts.some((district) => district.id === "grunerlokka"), "Grünerløkka er startnabolag i view models");

const frogner = viewModels.find((district) => district.id === "frogner");
assert.ok(frogner, "Frogner finnes i view models");
assert.strictEqual(frogner.lockReason, "For lite kapital", "låst nabolag viser lockReason");
assert.strictEqual(frogner.affordabilityLabel, "Mangler 70 kapital", "affordabilityLabel viser manglende kapital");

assert.strictEqual(window.CivicationHome.selectDistrict("sagene"), true, "kan velge gratis startnabolag");
const afterSelection = window.CivicationHome.getDistrictViewModels();
const sagene = afterSelection.find((district) => district.id === "sagene");
assert.ok(sagene.isCurrent, "valgt nabolag markeres isCurrent");

console.log("civication-home-snapshot tests passed");
