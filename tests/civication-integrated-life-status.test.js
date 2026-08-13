#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const runtimeSource = fs.readFileSync(
  path.join(ROOT, "js/Civication/systems/civicationLifePositionRuntime.js"),
  "utf8"
);

const storage = new Map([
  ["merits_by_category", JSON.stringify({
    subkultur: { points: 100 }
  })]
]);

let activeJob = null;
const badge = {
  id: "subkultur",
  name: "Subkultur",
  tiers: [
    {
      threshold: 60,
      label: "Gangster",
      life_position: {
        kind: "identity_status",
        track: "subkultur",
        employment_independent: true
      }
    }
  ]
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
    BADGES: [badge],
    CivicationState: { getActivePosition: () => activeJob },
    dispatchEvent: () => {}
  },
  module: { exports: {} }
};
sandbox.window.window = sandbox.window;

vm.createContext(sandbox);
vm.runInContext(runtimeSource, sandbox, { filename: "civicationLifePositionRuntime.js" });
const api = sandbox.window.CivicationLifePositions;

assert.ok(api, "existing CivicationLifePositions API must remain the owner");
assert.strictEqual(storage.has("hg_civi_life_status_v1"), false, "must not create a second life-status store");
assert.strictEqual(storage.has("hg_civi_circumstances_v1"), false, "must not create a circumstances store");

let context = api.getLifeContext();
assert.strictEqual(context.employment.formal_status, "no_formal_job");
assert.strictEqual(context.circumstances.activity_status, "none");
assert.strictEqual(context.circumstances.benefit_status, "none");
assert.strictEqual(context.circumstances.housing_status, "housed");

let result = api.setCircumstances({
  activity_status: "voluntary_no_job",
  benefit_status: "disability_benefit"
});
assert.strictEqual(result.ok, true, "voluntary no-job + disability benefit must be representable");
context = api.getLifeContext();
assert.strictEqual(context.circumstances.activity_status, "voluntary_no_job");
assert.strictEqual(context.circumstances.benefit_status, "disability_benefit");
assert.strictEqual(context.employment.formal_status, "no_formal_job");

// Uføretrygd/AAP are not job titles and may coexist with an actual job.
activeJob = { career_id: "subkultur", title: "Kulturkonsulent" };
context = api.getLifeContext();
assert.strictEqual(context.employment.formal_status, "employed");
assert.strictEqual(context.circumstances.benefit_status, "disability_benefit");

result = api.setCircumstances({ benefit_status: "aap" });
assert.strictEqual(result.ok, true);
context = api.getLifeContext();
assert.strictEqual(context.employment.formal_status, "employed");
assert.strictEqual(context.circumstances.benefit_status, "aap");

// Existing Badge life positions must still work.
result = api.activate("subkultur", "Gangster");
assert.strictEqual(result.ok, true);
assert.strictEqual(api.getLifeContext().primary_life_position.label, "Gangster");

// Open choices belong to the same life-position API and need no Badge points.
const open = api.getAllUnlockedPositions();
for (const label of ["Uteligger", "Boms", "Kriminell", "Bohem", "Nomade"]) {
  assert.ok(open.some((position) => position.label === label), `${label} must be an always-open life choice`);
}

// Housing-oriented life choices update circumstances inside the same stored profile.
result = api.activate("liv_bosituasjon", "Uteligger");
assert.strictEqual(result.ok, true);
context = api.getLifeContext();
assert.strictEqual(context.circumstances.housing_status, "unhoused");
assert.strictEqual(context.circumstances.housing_choice, "chosen");
assert.strictEqual(context.active_life_positions.some((position) => position.label === "Gangster"), true);
assert.strictEqual(context.active_life_positions.some((position) => position.label === "Uteligger"), true);

// A criminal life path is a narrative choice, not an automatic conviction.
result = api.activate("liv_lovsbane", "Kriminell");
assert.strictEqual(result.ok, true);
context = api.getLifeContext();
assert.strictEqual(context.active_life_positions.some((position) => position.label === "Kriminell"), true);
assert.strictEqual(Object.prototype.hasOwnProperty.call(context.circumstances, "legal_status"), false,
  "choosing Kriminell must not fabricate a legal conviction/status");

// Everything persists inside the existing life-position storage key.
const persisted = JSON.parse(storage.get("hg_civi_life_positions_v1"));
assert.strictEqual(persisted.version, 2);
assert.strictEqual(persisted.circumstances.benefit_status, "aap");
assert.strictEqual(persisted.circumstances.housing_status, "unhoused");
assert.ok(persisted.active_by_badge.liv_lovsbane);
assert.ok(persisted.active_by_badge.liv_bosituasjon);

console.log("civication integrated life status ok: work, benefit, housing and free life paths share existing life-position profile");
