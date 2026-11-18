'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');

const dom = new JSDOM('<div id="civiWeeklyMealPlanPanel"></div><div id="civiStorePanel"></div>', {
  url:'https://example.test',runScripts:'outside-only'
});
const w=dom.window;
for(const path of ['core/civicationState.js','core/civicationCalendar.js',
  'core/civicationNokBudget.js','civicationCommercial.js',
  'systems/civicationMealPlan.js','ui/CivicationMealPlanUI.js'])
  w.eval(fs.readFileSync('js/Civication/'+path,'utf8'));

const plan=w.CivicationMealPlan,shop=w.HG_CiviShop,state=w.CivicationState;
w.CivicationCalendar.setClock({startDateISO:'2026-01-01',dayIndex:1});
state.updateWallet({balance:50000,nok_v1:{active:true,version:1,config}});
const breakfast='oats-with-milk';
const entries=[{date:'2026-01-01',slot:'breakfast',mealId:breakfast},
  {date:'2026-01-02',slot:'lunch',mealId:'pasta-tomato-onion'}];
assert.equal(shop.saveNokMealWeek('2026-01-01',entries).ok,true);
const beforeBudget=JSON.stringify(state.getWallet());
plan.setRestaurantBudgetNok(300);
assert.equal(JSON.stringify(state.getWallet()),beforeBudget,'restaurant budget does not write wallet');
assert.equal(plan.getWeek().restaurantBudgetNok,300);
assert.equal(plan.getWeek().meals[0].breakfast,breakfast);

plan.setRestaurantMeal(0,'breakfast',{
  restaurantId:'fysen-example',name:'Eksempelrestaurant',dishName:'Frokost',
  portions:2,priceMinor:11900,priceKind:'exact'
});
const wallet=state.getWallet();
assert.equal(wallet.balance,50000,'planning never debits');
assert.equal(wallet.nok_v1.restaurantPurchases,undefined,'planning never writes a receipt');
assert.equal(wallet.nok_v1.shopping.mealPlan.entries.length,1,
  'restaurant choice replaces exactly one pending dated home meal');
assert.equal(shop.getNokMealWeek().entries[0].slot,'lunch');
const overlapping=shop.saveNokMealWeek('2026-01-01',entries);
assert.equal(overlapping.reason,'RESTAURANT_SLOT_ALREADY_PLANNED',
  'dated home planner refuses to double-book a Fysen restaurant slot');
assert.equal(state.getWallet().balance,50000);
assert.equal(plan.getWeek().restaurantMeals[0].breakfast.priceKind,'exact');
assert.equal(plan.getWeek().meals[0]?.breakfast,undefined);
assert.equal(plan.getIngredientIdsByMeal(1).breakfast,undefined);
assert.equal(plan.suggestionForTime({dayIndex:1,currentMinutes:480}),null);
assert.equal(plan.getShoppingList().some(x=>x.id==='tine-milk-1l'),false,
  'removed home meal must not still be purchased as groceries');
const forecast=plan.getRestaurantFinanceSnapshot();
assert.equal(forecast.nokActive,true);
assert.equal(forecast.balanceMinor,5000000);
assert.equal(forecast.plannedMinor,23800);
assert.equal(forecast.afterKnownPlansMinor,4976200);
assert.equal(forecast.purchasedMinor,null);
assert.equal(forecast.meals.length,1);
assert.equal(w.CivicationNokBudget.monthlyCashFlow(wallet,'2026-01',
  w.CivicationCalendar.getGameDate).restaurantCents,0,
  'a private planned restaurant meal is not a settled NOK ledger purchase');

const snapshot=JSON.stringify(state.getWallet());
plan.setRestaurantMeal(1,'dinner',{
  restaurantId:'fysen-example',name:'Eksempelrestaurant',dishName:'Middag',
  portions:1,priceMinor:19000,priceKind:'from'
});
assert.equal(JSON.stringify(state.getWallet()),snapshot,'no other wallet changes for extra restaurant plans');
assert.equal(plan.getRestaurantSummary().fromMeals,1);
assert.throws(()=>plan.applyTemplate('varied'),/dated NOK/);
assert.throws(()=>plan.setMeal(0,'breakfast','oats'),/dated NOK/);
w.CivicationMealPlanUI.render();
const ui=w.document.getElementById('civiWeeklyMealPlanPanel');
assert.match(ui.textContent,/Restaurantbudsjett/);
assert.match(ui.textContent,/Hjemmelagde måltider.*NOK-butikkpanelet/s);
assert.equal(ui.querySelectorAll('select').length,2,'do not show duplicate home recipe editor');
assert.ok(ui.querySelector('input[type="search"]'),'preserve Fysen city-only search');
assert.equal(state.getWallet().balance,50000);

plan.setRestaurantMeal(0,'breakfast',null);
assert.equal(plan.getWeek().restaurantMeals[0]?.breakfast,undefined);
assert.equal(shop.getNokMealWeek().entries.length,1,
  'removing restaurant plans does not silently restore old grocery purchases');
const next=JSON.stringify(state.getWallet());
assert.equal(next,JSON.stringify(snapshot),'wallet stable after removing a restaurant plan');

dom.window.close();
console.log('PASS: NOK Shop owns home meals; Fysen overlay replaces slot, saves budget and never charges automatically');
