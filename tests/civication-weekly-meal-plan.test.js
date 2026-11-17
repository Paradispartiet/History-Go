#!/usr/bin/env node
"use strict";
// Focused local-only contract test: meal planning must not spend money or invent retail evidence.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const base = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(base, "Civication.html"), "utf8");
assert.match(html, /id="civiWeeklyMealPlanPanel"/, "planner mounted within existing store panel");
const loader = fs.readFileSync(path.join(base, "js/Civication/civicationShellLoader.js"), "utf8");
assert.match(loader, /js\/Civication\/systems\/civicationMealPlan\.js/);
assert.match(loader, /js\/Civication\/ui\/CivicationMealPlanUI\.js/);
const beforeUI = loader.indexOf("js/Civication/systems/civicationMealPlan.js");
const ui = loader.indexOf("js/Civication/ui/CivicationMealPlanUI.js");
assert(beforeUI >= 0 && ui > beforeUI, "meal plan model loads before UI in the shell");
assert(!html.includes('<script src="js/Civication/systems/civicationMealPlan.js"'),
  "planner must not bypass the canonical Life Story startup script list");

const data = new Map();
const storage = {
  getItem: key => data.get(key) ?? null,
  setItem: (key, value) => data.set(key, String(value)),
  removeItem: key => data.delete(key)
};
let gameDay = 1;
const window = { CivicationCalendar: { getClock: () => ({ dayIndex: gameDay }) } };
const context = vm.createContext({ window, localStorage: storage, Object, Number, Math, JSON, console });
const source = fs.readFileSync(path.join(base, "js/Civication/systems/civicationMealPlan.js"), "utf8");
vm.runInContext(source, context, { filename: "civicationMealPlan.js" });
const plan = window.CivicationMealPlan;
const key1 = plan.getWeekKey();
assert.equal(key1, "game-week-000001");
assert.equal(data.size, 0, "reading planner must not write, charge or create a new game state");
assert.equal(plan.getWeek().people, 2);
assert.equal(plan.getShoppingList().length, 0);
assert.equal(plan.suggestionForTime({ currentMinutes: 17 * 60 }), null, "no unselected default meal");
assert.equal(plan.templates().length, 2);

plan.applyTemplate("varied");
const week = plan.getWeek();
for (let day = 0; day < 7; day++) {
  for (const meal of ["breakfast", "lunch", "dinner", "supper"]) {
    assert(week.meals[day][meal], "template must fill all 28 meal slots");
  }
}
const shopping = plan.getShoppingList();
assert(shopping.length > 0);
const pantry = { havregryn: 100 };
const reduced = plan.getShoppingList(null, pantry);
const oats1 = shopping.find(row => row.id === "havregryn");
const oats2 = reduced.find(row => row.id === "havregryn");
assert(oats1.required > 100);
assert.equal(oats2.quantity, oats1.quantity - 100, "pantry deduction can remove verified on-hand quantity");
assert.equal(shopping.some(x => x.price || x.storeId || x.availableNow), false, "never invent store stock or prices");

plan.setMeal(0, "dinner", "taco");
assert.equal(plan.getWeek().meals[0].dinner, "taco", "manual daily change overrides template");
plan.setMeal(0, "dinner", null);
assert.equal(plan.getWeek().meals[0].dinner, undefined, "clearing a meal does not erase the week");
assert.throws(() => plan.setMeal(0, "breakfast", "pasta"), /cannot be selected/);
assert.throws(() => plan.setMeal(7, "dinner", "pasta"), /Invalid meal slot/);
assert.throws(() => plan.setPeople(0), /Invalid household size/);
assert.throws(() => plan.applyTemplate("unknown"), /Unknown template/);
plan.setPeople(4);
assert.equal(plan.getWeek().people, 4);
assert.equal(plan.getShoppingList().find(x => x.id === "havregryn").required,
  oats1.required * 2, "household scaling applies exactly once");

assert.equal(plan.suggestionForTime({ currentMinutes: 5 * 60 }), null, "no suggestions outside meal windows");
assert.equal(plan.suggestionForTime({ currentMinutes: 12 * 60 }).meal, "lunch");
assert.equal(plan.suggestionForTime({ currentMinutes: 17 * 60 }), null, "cleared dinner not suggested");
assert.equal(plan.suggestionForTime({ currentMinutes: 21 * 60 }).meal, "supper");
assert.equal(plan.suggestionForTime({ currentMinutes: 12 * 60, recentlyAte: true }), null, "no repeated offer after eating");
assert.equal(plan.suggestionForTime({ currentMinutes: 0 }), null);
assert.equal(plan.suggestionForTime({ currentMinutes: -1 }), null);

gameDay = 8;
assert.equal(plan.getWeekKey(), "game-week-000002", "new game week follows Civication calendar, not device date");
assert.equal(plan.getWeek().meals[0], undefined, "week plans are isolated");
assert.equal(plan.suggestionForTime({ currentMinutes: 12 * 60 }), null);
plan.applyTemplate("green");
assert.equal(plan.getWeek("game-week-000001").people, 4, "previous week unchanged");
assert.equal(plan.getWeek("game-week-000002").people, 2);
assert.equal(data.size, 1, "one private plan key; no wallet writes");
assert(data.has("hg_civi_meal_plans_v1"));
assert(!data.has("hg_civi_wallet_v1") && !data.has("hg_pc_wallet_v1"));
assert(!data.has("aha_import_payload_v1"), "no automatic AHA export");

data.set("hg_civi_meal_plans_v1", "{bad json");
assert.equal(plan.getWeek().people, 2, "malformed private save fails safe");
assert.equal(plan.getShoppingList().length, 0);
console.log("PASS: Civication weekly meal plan, meal windows, household list, privacy and no price claims");
