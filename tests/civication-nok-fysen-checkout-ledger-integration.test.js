'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');

// Exercises the composed, real browser-facing modules on the reconciled branch.
const dom = new JSDOM('<div id="civiWeeklyMealPlanPanel"></div><div id="civiStorePanel"></div>', {
  url:'https://example.test',runScripts:'outside-only'
});
const w = dom.window;
for (const path of [
  'core/civicationState.js','core/civicationCalendar.js',
  'core/civicationNokBudget.js','civicationCommercial.js',
  'systems/civicationMealPlan.js','ui/CivicationMealPlanUI.js'
]) w.eval(fs.readFileSync('js/Civication/'+path,'utf8'));
w.CivicationCalendar.setClock({startDateISO:'2026-01-01',dayIndex:1});
w.CivicationState.updateWallet({
  balance:500,
  nok_v1:{ active:true,version:1,config,restaurantPurchases:[],
    payrollLedger:[],invoices:[],transportPasses:[] }
});
const state=w.CivicationState, plan=w.CivicationMealPlan, shop=w.HG_CiviShop;
assert.equal(shop.saveNokMealWeek('2026-01-01', [
  {date:'2026-01-01',slot:'breakfast',mealId:'oats-with-milk'},
  {date:'2026-01-02',slot:'lunch',mealId:'pasta-tomato-onion'}
]).ok,true);
const initialWallet=JSON.stringify(state.getWallet());
plan.setRestaurantMeal(0,'breakfast',{
  restaurantId:'fysen-example',name:'Prøverestaurant',dishName:'Frokost',
  portions:2,priceMinor:12500,priceKind:'exact'
});
assert.equal(state.getWallet().balance,500,'scheduling never debits');
assert.notEqual(JSON.stringify(state.getWallet()),initialWallet,
  'only the one dated home meal is removed from the grocery plan');
assert.equal(shop.getNokMealWeek().entries.length,1);
const pre=w.CivicationNokBudget.monthlyCashFlow(state.getWallet(),'2026-01',
  w.CivicationCalendar.getGameDate);
assert.equal(pre.ok,true);
assert.equal(pre.restaurantCents,0);
assert.equal(plan.getRestaurantFinanceSnapshot().unpaidPlannedMinor,25000);
assert.equal(plan.getRestaurantFinanceSnapshot().purchasedMinor,0);

const receipt=plan.purchaseRestaurantMeal(0,'breakfast','fysen-20260101-breakfast');
assert.equal(receipt.ok,true);
assert.equal(receipt.applied,true);
assert.equal(receipt.receipt.amountMinor,25000);
assert.equal(state.getWallet().balance,250);
assert.equal(state.getWallet().nok_v1.restaurantPurchases.length,1);
const paid=plan.getRestaurantFinanceSnapshot();
assert.equal(paid.purchasedMinor,25000);
assert.equal(paid.unpaidPlannedMinor,0,'no double subtraction after checkout');
assert.equal(paid.afterKnownPlansMinor,25000);
const cash=w.CivicationNokBudget.monthlyCashFlow(state.getWallet(),'2026-01',
  w.CivicationCalendar.getGameDate);
assert.equal(cash.ok,true);
assert.equal(cash.restaurantCents,25000);
assert.equal(cash.groceryCents,0,'unbought groceries are not expenses');
assert.equal(cash.entries.filter(x=>x.category==='restaurants').length,1);
assert.equal(plan.purchaseRestaurantMeal(0,'breakfast','fysen-20260101-breakfast').applied,false);
assert.equal(plan.purchaseRestaurantMeal(0,'breakfast','fysen-different-request').reason,
  'MEAL_ALREADY_PURCHASED');
assert.equal(state.getWallet().balance,250,'duplicate purchase cannot debit twice');

w.CivicationMealPlanUI.render();
const ui=w.document.querySelector('#civiWeeklyMealPlanPanel');
assert.match(ui.textContent,/Restaurantplan.*kroneøkonomi/s);
assert.match(ui.textContent,/betalt i spillet/);
assert.ok(![...ui.querySelectorAll('button')].some(x=>x.textContent.includes('Kjøp i spillet')),
  'paid slot has no second checkout button');
assert.equal(ui.querySelectorAll('select').length,2,
  'the dated NOK Shop remains the only editor for home-cooked meals');

dom.window.close();
console.log('PASS: NOK home plan -> Fysen replacement -> one checkout -> one cash-flow entry');
