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

// A restaurant pick replaces the home-cooked recipe for the same slot, but never purchases food.
plan.setRestaurantBudgetNok(1000);
assert.equal(plan.getRestaurantSummary().budgetNok,1000);
const beforeChicken = plan.getShoppingList().find(row=>row.id==="kylling")?.quantity;
plan.setRestaurantMeal(3,"dinner",{
  restaurantId:"demo-public-restaurant",name:"Prøverestaurant",dishName:"Pasta",
  portions:2,priceMinor:14550,priceKind:"exact"
});
const restaurantSummary=plan.getRestaurantSummary();
assert.equal(restaurantSummary.plannedMinor,29100);
assert.equal(restaurantSummary.remainingMinor,70900);
assert.equal(restaurantSummary.meals.length,1);
assert.equal(restaurantSummary.meals[0].day,3);
assert.equal(plan.getWeek().meals[3].dinner,undefined);
// The legacy PC wallet MUST NOT become a krone balance just by reading a forecast.
assert.equal(plan.getRestaurantFinanceSnapshot().balanceMinor, null);
let walletWrites = 0;
let wallet = { balance:800, nok_v1:{ active:false, version:1 } };
window.CivicationState = {
  getWallet: () => wallet,
  updateWallet: () => { walletWrites++; throw new Error("forecast must not pay"); }
};
assert.equal(plan.getRestaurantFinanceSnapshot().balanceMinor, null);
wallet = { balance:800, nok_v1:{ active:true, version:1 } };
const forecast = plan.getRestaurantFinanceSnapshot();
assert.equal(forecast.nokActive, true);
assert.equal(forecast.balanceMinor, 80000);
assert.equal(forecast.afterKnownPlansMinor, 50900);
assert.equal(forecast.hasUncertainPrices, false);
assert.equal(wallet.balance, 800);
assert.equal(walletWrites, 0, "a forecast cannot charge the canonical wallet");
plan.setRestaurantMeal(2,"lunch",{
  restaurantId:"demo-public-restaurant",name:"Prøverestaurant",dishName:"Lunsj",
  portions:1,priceMinor:25000,priceKind:"from"
});
assert.equal(plan.getRestaurantSummary().fromMeals,1);
assert.equal(plan.getRestaurantFinanceSnapshot().hasUncertainPrices,true,
  "from price must be described as a lower bound, not a final charge");
assert.equal(plan.getRestaurantFinanceSnapshot().afterKnownPlansMinor, 25900);
plan.setRestaurantMeal(1,"breakfast",{
  restaurantId:"demo-public-restaurant",name:"Prøverestaurant",dishName:"Historisk rett",
  portions:1,priceMinor:9900
});
assert.equal(plan.getRestaurantSummary().unspecifiedPriceKindMeals, 1,
  "legacy meal choices lacking quote kind must not imply an exact price");
assert.equal(plan.getRestaurantFinanceSnapshot().hasUncertainPrices, true);
plan.setRestaurantMeal(1,"breakfast",null);
assert.equal(walletWrites, 0);
plan.setRestaurantMeal(2,"lunch",null);
assert.equal(plan.getWeek().meals[3].dinner,undefined);
assert(!plan.getShoppingList().some(row=>row.id==="kylling"),
  "restaurant dinner excludes the old ingredient shopping list");
plan.setMeal(3,"dinner","chicken");
assert.equal(plan.getRestaurantSummary().meals.length,0,
  "selecting home cooking replaces an earlier restaurant plan");
assert.equal(plan.getShoppingList().find(row=>row.id==="kylling")?.quantity,beforeChicken);
assert.throws(()=>plan.setRestaurantMeal(7,"dinner",null),/Invalid restaurant meal slot/);
assert.throws(()=>plan.setRestaurantMeal(0,"dinner",{restaurantId:"x",name:"Restaurant",dishName:"Pasta",portions:1,priceMinor:-1}),/Invalid restaurant meal/);
assert.throws(()=>plan.setRestaurantBudgetNok(-1),/Invalid weekly restaurant budget/);
assert.throws(()=>plan.setRestaurantMeal(2,"lunch",{restaurantId:"x",name:"X",dishName:"X",portions:1,priceMinor:1,priceKind:"estimated"}),/Invalid restaurant meal/);
wallet = { balance:800, nok_v1:{ active:true, version:2 } };
assert.equal(plan.getRestaurantFinanceSnapshot().balanceMinor,null,
  "unsupported wallet versions must never expose a presumed NOK balance");
wallet = { balance:800, nok_v1:{ active:true, version:1 } };
// Only an explicit purchase on the correct game day may debit active NOK.
// A scheduled meal, even with a known price, cannot debit anything itself.
window.CivicationCalendar.getGameDate = () => "2026-11-18";
window.CivicationState.updateWallet = next => { walletWrites++; wallet = next; };
plan.setRestaurantMeal(0,"dinner",{
  restaurantId:"demo-public-restaurant",name:"Prøverestaurant",dishName:"Spillmiddag",
  portions:1,priceMinor:12500,priceKind:"from"
});
assert.equal(plan.purchaseRestaurantMeal(0,"dinner","restaurant:refused").reason,"EXACT_PRICE_REQUIRED");
plan.setRestaurantMeal(0,"dinner",{
  restaurantId:"demo-public-restaurant",name:"Prøverestaurant",dishName:"Spillmiddag",
  portions:1,priceMinor:12500,priceKind:"exact"
});
assert.equal(plan.purchaseRestaurantMeal(3,"dinner","restaurant:wrongday").reason,"NOT_CURRENT_MEAL_DAY");
assert.equal(plan.purchaseRestaurantMeal(0,"dinner","restaurant:future","game-week-000002").reason,"NOT_CURRENT_MEAL_DAY");
assert.equal(walletWrites,0,"meal planning never pays");
assert.equal(plan.getRestaurantFinanceSnapshot().afterKnownPlansMinor,38400);
wallet.balance=50;
assert.equal(plan.purchaseRestaurantMeal(0,"dinner","restaurant:no-funds").reason,"INSUFFICIENT_FUNDS");
wallet.balance=800;
const receipt = plan.purchaseRestaurantMeal(0,"dinner","restaurant:purchase-1");
assert.equal(receipt.ok,true);
assert.equal(receipt.applied,true);
assert.equal(receipt.receipt.amountMinor,12500);
assert.equal(receipt.receipt.gameDateISO,"2026-11-18");
assert.equal(wallet.balance,675);
assert.equal(walletWrites,1);
assert.equal(wallet.nok_v1.restaurantPurchases.length,1);
assert.equal(plan.purchaseRestaurantMeal(0,"dinner","restaurant:purchase-1").applied,false,
  "same request is idempotent");
assert.equal(plan.purchaseRestaurantMeal(0,"dinner","restaurant:purchase-2").reason,"MEAL_ALREADY_PURCHASED");
assert.equal(walletWrites,1,"no duplicate checkout");
const paidForecast=plan.getRestaurantFinanceSnapshot();
assert.equal(paidForecast.unpaidPlannedMinor,29100,
  "already paid meal must not be deducted from the forecast a second time");
assert.equal(paidForecast.afterKnownPlansMinor,38400);
assert.equal(paidForecast.purchasedMinor,12500);
assert.equal(paidForecast.purchasedSlots[0],"0:dinner");
plan.setRestaurantMeal(0,"dinner",null);
plan.setRestaurantMeal(2,"lunch",{
  restaurantId:"demo-public-restaurant",name:"Prøverestaurant",dishName:"Suppe",
  portions:1,priceMinor:null
});
assert.equal(plan.getRestaurantSummary().unpricedMeals,1);
assert.equal(plan.getRestaurantSummary().plannedMinor,0);
plan.applyTemplate("varied");
assert.equal(plan.getRestaurantSummary().meals.length,0,"new template clears prior restaurant picks");
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
assert.equal(walletWrites, 1, "planning and browsing do not make additional purchases");

data.set("hg_civi_meal_plans_v1", "{bad json");
assert.equal(plan.getWeek().people, 2, "malformed private save fails safe");
assert.equal(plan.getShoppingList().length, 0);
console.log("PASS: Civication weekly meal plan, meal windows, household list, privacy and no price claims");
