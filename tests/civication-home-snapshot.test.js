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
assert.strictEqual(typeof window.CivicationHome.unlockDistrict, "function", "unlockDistrict eksporteres");
assert.strictEqual(typeof window.CivicationHome.canMoveToDistrict, "function", "canMoveToDistrict eksporteres");
assert.strictEqual(typeof window.CivicationHome.moveToDistrict, "function", "moveToDistrict eksporteres");
assert.strictEqual(typeof window.CivicationHome.applyRentTick, "function", "applyRentTick eksporteres");

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
  "housingStatus",
  "rentPressure",
  "rentDue",
  "unlockedDistrictIds",
  "availableMoves",
  "blockedMoves",
  "supportEligibility",
  "homeInfluence"
], "snapshot har stabil toppnivå-shape uten valgt nabolag");
assert.strictEqual(emptySnapshot.currentDistrict, null, "ingen currentDistrict uten valgt nabolag");
assert.strictEqual(emptySnapshot.settled, false, "settled er false uten valgt nabolag");
assert.ok(Array.isArray(emptySnapshot.unlockedDistrictIds), "snapshot har unlockedDistrictIds");
assert.ok(Array.isArray(emptySnapshot.availableMoves), "snapshot har availableMoves");
assert.ok(Array.isArray(emptySnapshot.blockedMoves), "snapshot har blockedMoves");
assert.strictEqual(typeof emptySnapshot.supportEligibility.eligibleForSupport, "boolean", "snapshot har supportEligibility");

const viewModels = window.CivicationHome.getDistrictViewModels();
const ids = viewModels.map((district) => district.id);
assert.strictEqual(ids.length, new Set(ids).size, "ingen duplikate district ids");
const startDistricts = viewModels.filter((district) => district.isStartOption);
assert.ok(startDistricts.length >= 3, "view models inkluderer startnabolag");
assert.ok(startDistricts.some((district) => district.id === "sagene"), "Sagene er startnabolag i view models");
assert.ok(viewModels.some((district) => district.id === "gronland"), "Grønland finnes i view models");
assert.ok(viewModels.some((district) => district.id === "toyen"), "Tøyen finnes i view models");
assert.ok(viewModels.some((district) => district.id === "majorstuen"), "Majorstuen finnes i view models");
assert.ok(viewModels.some((district) => district.id === "gamle_oslo"), "Gamle Oslo finnes i view models");

const frogner = viewModels.find((district) => district.id === "frogner");
assert.ok(frogner, "Frogner finnes i view models");
assert.strictEqual(frogner.lockReason, "For lite kapital", "låst nabolag viser lockReason");
assert.strictEqual(frogner.affordabilityLabel, "Mangler 70 kapital", "affordabilityLabel viser manglende kapital");
assert.strictEqual(window.CivicationHome.canMoveToDistrict("frogner").ok, false, "canMoveToDistrict avviser låst nabolag");

assert.strictEqual(window.CivicationHome.moveToDistrict("sagene"), true, "kan flytte til gratis startnabolag");
let afterSelection = window.CivicationHome.getDistrictViewModels();
let sagene = afterSelection.find((district) => district.id === "sagene");
assert.ok(sagene.isCurrent, "valgt nabolag markeres isCurrent");
assert.strictEqual(window.CivicationHome.getHomeSnapshot().currentDistrict.id, "sagene", "current district finnes etter flytting");

assert.strictEqual(window.CivicationHome.unlockDistrict("frogner", "test_unlock"), true, "unlockDistrict låser opp nabolag");
assert.strictEqual(window.CivicationHome.canMoveToDistrict("frogner").ok, true, "opplåst nabolag kan flyttes til");
assert.strictEqual(window.CivicationHome.moveToDistrict("frogner"), true, "moveToDistrict endrer currentDistrictId");
const afterMove = window.CivicationHome.getHomeSnapshot();
assert.strictEqual(afterMove.state.currentDistrictId, "frogner", "state currentDistrictId er oppdatert");
assert.strictEqual(afterMove.currentDistrict.id, "frogner", "snapshot currentDistrict er oppdatert");
assert.ok(afterMove.districts.find((district) => district.id === "frogner").isCurrent, "nytt nabolag markeres isCurrent");

const rentResult = window.CivicationHome.applyRentTick(true);
assert.strictEqual(rentResult.ok, true, "applyRentTick lykkes");
const rentSnapshot = window.CivicationHome.getHomeSnapshot();
assert.ok(rentSnapshot.rentDue > 0 || ["strained", "at_risk", "homeless"].includes(rentSnapshot.housingStatus), "applyRentTick påvirker rentDue eller housingStatus");
assert.strictEqual(typeof rentSnapshot.rentPressure.score, "number", "rentPressure har score");

console.log("civication-home-snapshot tests passed");
