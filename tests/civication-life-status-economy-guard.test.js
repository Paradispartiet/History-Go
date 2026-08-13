#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(ROOT, "js/Civication/systems/civicationLifePositionRuntime.js"), "utf8");

const storage = new Map();
let activeJob = null;
let economyState = { unemployed_since_week: "2026-W20" };
let balance = 0;
let simulateJobLoss = false;

const stateApi = {
  getActivePosition: () => activeJob,
  setState(patch) { economyState = { ...economyState, ...(patch || {}) }; }
};

const economyEngine = {
  tickWeekly() {
    if (activeJob?.career_id) {
      balance += 10;
      if (simulateJobLoss) activeJob = null;
      return;
    }
    if (economyState.unemployed_since_week) balance += 3;
    else economyState.unemployed_since_week = "2026-W32";
  }
};

const sandbox = {
  console,
  Date,
  Event: function Event(type) { this.type = type; },
  localStorage: {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => storage.set(key, String(value))
  },
  window: {
    BADGES: [],
    CivicationState: stateApi,
    CivicationEconomyEngine: economyEngine,
    dispatchEvent: () => {}
  },
  module: { exports: {} }
};
sandbox.window.window = sandbox.window;
vm.createContext(sandbox);
vm.runInContext(source, sandbox, { filename: "civicationLifePositionRuntime.js" });

const api = sandbox.window.CivicationLifePositions;
assert.ok(api);
assert.strictEqual(api.installEconomyStatusGuard(), true);

let result = api.setCircumstances({ activity_status: "voluntary_no_job", benefit_status: "disability_benefit" });
assert.strictEqual(result.ok, true);
economyState.unemployed_since_week = "2026-W20";
balance = 0;
sandbox.window.CivicationEconomyEngine.tickWeekly();
assert.strictEqual(balance, 0);
assert.strictEqual(economyState.unemployed_since_week, null);

result = api.setCircumstances({ activity_status: "none", benefit_status: "aap" });
assert.strictEqual(result.ok, true);
economyState.unemployed_since_week = "2026-W20";
balance = 0;
sandbox.window.CivicationEconomyEngine.tickWeekly();
assert.strictEqual(balance, 0);
assert.strictEqual(economyState.unemployed_since_week, null);

result = api.setCircumstances({ activity_status: "student", benefit_status: "none" });
assert.strictEqual(result.ok, true);
economyState.unemployed_since_week = "2026-W20";
balance = 0;
sandbox.window.CivicationEconomyEngine.tickWeekly();
assert.strictEqual(balance, 0);
assert.strictEqual(economyState.unemployed_since_week, null);

result = api.setCircumstances({ activity_status: "jobseeker", benefit_status: "none" });
assert.strictEqual(result.ok, true);
economyState.unemployed_since_week = "2026-W20";
balance = 0;
sandbox.window.CivicationEconomyEngine.tickWeekly();
assert.strictEqual(balance, 3);
assert.strictEqual(economyState.unemployed_since_week, "2026-W20");

activeJob = { career_id: "litteratur", title: "Redaksjonsmedarbeider" };
balance = 0;
sandbox.window.CivicationEconomyEngine.tickWeekly();
assert.strictEqual(balance, 10);
assert.strictEqual(api.getState().circumstances.activity_status, "none");

simulateJobLoss = true;
activeJob = { career_id: "litteratur", title: "Redaksjonsmedarbeider" };
api.setCircumstances({ activity_status: "none", benefit_status: "none" });
sandbox.window.CivicationEconomyEngine.tickWeekly();
assert.strictEqual(activeJob, null);
assert.strictEqual(api.getState().circumstances.activity_status, "jobseeker");

console.log("civication life-status economy guard ok");
