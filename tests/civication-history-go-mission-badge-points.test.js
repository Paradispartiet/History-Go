#!/usr/bin/env node
// Exercise History Go's actual persistent Civication-mode completion evaluator.
// Life Story's chapter requires real merits; a single irrelevant quiz is not enough.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const storage = new Map();
const localStorage = {
  getItem: key => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key)
};
const location = { hash: "#/map" };
const window = { location, API: {}, addEventListener() {} };
vm.runInNewContext(fs.readFileSync("js/ui/toast.js", "utf8"), {
  window, localStorage, location, console, Date, JSON, Math, Set, Map, URL, setTimeout, clearTimeout
}, { filename: "toast.js" });
const api = window.HGCivicationMode;
assert(api, "existing mission-toast runtime remains available");
const mission = {
  active: true, source: "lifestory_continuation", started_ts: Date.now(),
  title: "Bygg kunnskap for Sideprosjektbygger",
  target_type: "knowledge", category_id: "naeringsliv",
  required_points: 10, completion_mode: "badge_points",
  payload: { required_points: 10, completion_mode: "badge_points" },
  return_href: "Civication.html"
};
assert(api.saveSession(mission), "chapter journey can reuse the persistent toast");
assert.equal(api.evaluateCompletion(mission).completed, false);
storage.set("merits_by_category", JSON.stringify({ naeringsliv: { points: 1 }, musikk: { points: 100 } }));
assert.equal(api.evaluateCompletion(mission).completed, false,
  "one quiz or unrelated badge must not complete the chapter goal");
storage.set("merits_by_category", JSON.stringify({ naeringsliv: { points: 9 } }));
assert.equal(api.evaluateCompletion(mission).completed, false);
storage.set("merits_by_category", JSON.stringify({ naeringsliv: { points: 10 } }));
const earned = api.evaluateCompletion(mission);
assert.equal(earned.completed, true, "only genuine threshold reaching completes the learning goal");
assert.equal(earned.source, "merits");
assert.equal(api.getSession().required_points, 10);
assert.equal(storage.has("civication_lifestory_v1"), false,
  "a completed toast must not advance Life Story or activate a role");
const openGoal = { ...mission, completion_mode: "explore_category", required_points: null,
  category_id: "musikk", payload: { completion_mode: "explore_category", required_points: null } };
storage.set("merits_by_category", JSON.stringify({ musikk: { points: 100 } }));
assert.equal(api.evaluateCompletion(openGoal).completed, false,
  "unknown merit threshold cannot be declared reached simply because points exist");
const noCategory = { ...openGoal, category_id: null };
assert.equal(api.evaluateCompletion(noCategory).completed, false,
  "an unselected path is an exploration guide, not an unlock");

console.log("History Go Civication mission toast follows genuine badge threshold");
