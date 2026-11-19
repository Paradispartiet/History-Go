'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
const scripts = ['core/civicationState.js', 'core/civicationCalendar.js', 'core/civicationNokBudget.js',
  'civicationCommercial.js', 'ui/CivicationStoreUI.js'];
async function boot(seed) {
  const dom = new JSDOM('<body><div id="civiStorePanel"></div></body>', { url: 'https://example.test', runScripts: 'outside-only' });
  await new Promise(resolve => setTimeout(resolve, 0));
  if (seed) for (const [key, value] of Object.entries(seed)) dom.window.localStorage.setItem(key, value);
  for (const path of scripts) dom.window.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
  return dom;
}
(async () => {
  let dom = await boot(); let w = dom.window;
  let state = w.CivicationState; let shop = w.HG_CiviShop;
  state.updateWallet({ balance: 200, old: { preserved: true }, nok_v1: { active: true, version: 1, config } });
  const counts = { 'rice-lentils-tomato-onion': 2, 'pasta-tomato-onion': 1, 'oats-with-milk': 3 };
  const before = JSON.stringify(state.getWallet());
  const view = shop.previewNokMealPlan(counts);
  assert.equal(view.ok, true); assert.equal(view.portions, 6);
  assert.equal(view.referenceCostCents, 4804, 'aggregate raw ingredient cost rounded once');
  assert.equal(view.shoppingCostCents, 18510, 'whole packages, including two cans of tomatoes');
  assert.equal(view.projectedBalanceCents, 1490); assert.equal(view.canAfford, true);
  assert.equal(view.ingredients.find(i => i.productId === 'r-chopped-tomatoes-400g').required, 450);
  assert.equal(view.ingredients.find(i => i.productId === 'r-chopped-tomatoes-400g').packagesToBuy, 2);
  assert.equal(JSON.stringify(state.getWallet()), before, 'preview is read-only');
  for (const invalid of [null, [], { unknown: 1 }, { 'oats-with-milk': -1 }, { 'oats-with-milk': 1.5 },
    { 'oats-with-milk': '3' }, { 'oats-with-milk': 100 }, { 'oats-with-milk': 99, 'pasta-tomato-onion': 1 }]) {
    assert.equal(shop.saveNokMealPlan(invalid).ok, false);
    assert.equal(JSON.stringify(state.getWallet()), before);
  }
  await w.CivicationStoreUI.render();
  const planner = w.document.querySelector('[data-meal-planner]'); planner.open = true;
  const invalidInput = planner.querySelector('[data-plan-meal="oats-with-milk"]');
  invalidInput.value = '1.5'; invalidInput.dispatchEvent(new w.Event('input', { bubbles: true }));
  planner.querySelector('[data-save-meal-plan]').click();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(JSON.stringify(state.getWallet()), before);
  assert.equal(invalidInput.value, '1.5', 'invalid draft remains available for correction');
  assert.equal(planner.querySelector('[data-save-meal-plan]').disabled, false);
  for (const [id, count] of Object.entries(counts)) {
    const input = planner.querySelector('[data-plan-meal="' + id + '"]'); input.value = String(count);
    input.dispatchEvent(new w.Event('input', { bubbles: true }));
  }
  assert.ok(planner.querySelector('[data-meal-plan-preview]').textContent.includes('185,10'));
  assert.equal(JSON.stringify(state.getWallet()), before, 'editing counts never writes player state');
  planner.querySelector('[data-save-meal-plan]').click();
  await new Promise(resolve => setTimeout(resolve, 5));
  assert.equal(state.getWallet().balance, 200);
  assert.equal(state.getWallet().nok_v1.shopping.purchases.length, 0);
  assert.equal(shop.getNokPantry().length, 0);
  assert.deepEqual(JSON.parse(JSON.stringify(state.getWallet().nok_v1.shopping.mealPlan.servings)), counts);
  assert.ok(w.document.activeElement.hasAttribute('data-save-meal-plan'));
  const saved = JSON.stringify(state.getWallet());
  assert.equal(shop.saveNokMealPlan(counts).skipped, true);
  assert.equal(JSON.stringify(state.getWallet()), saved);
  const cash = w.CivicationNokBudget.monthlyCashFlow(state.getWallet(), w.CivicationCalendar.getMonthPeriod().id, w.CivicationCalendar.getGameDate);
  assert.equal(cash.expenseCents, 0, 'saving a plan is not a payment');
  const seed = Object.fromEntries(Array.from({ length: w.localStorage.length }, (_, i) => {
    const key = w.localStorage.key(i); return [key, w.localStorage.getItem(key)];
  }));
  dom.window.close(); dom = await boot(seed); w = dom.window; state = w.CivicationState; shop = w.HG_CiviShop;
  assert.equal(JSON.stringify(state.getWallet()), saved, 'fresh device retains only selected servings, with no purchases');
  assert.equal(shop.getNokMealPlan().shoppingCostCents, 18510);
  for (const [id, n] of [['r-rice-2kg', 1], ['sevan-red-lentils-dry-900g', 1], ['r-chopped-tomatoes-400g', 2],
    ['yellow-onions-1kg', 1], ['sopps-spaghetti-500g', 1], ['axa-oats-1100g', 1], ['tine-milk-1l', 1]])
    for (let i = 0; i < n; i++) assert.equal((await shop.buyPack(id, 'plan-buy-' + id + i)).ok, true);
  assert.equal(state.getWallet().balance, 14.9);
  assert.equal(shop.getNokMealPlan().shoppingCostCents, 0, 'already owned units reduce the shopping list');
  for (let i = 0; i < 3; i++) shop.consumeNokProduct('tine-milk-1l', 'other-use-' + i);
  assert.equal(shop.getNokMealPlan().shoppingCostCents, 1940, 'fresh partial stock is used after other consumption');
  assert.equal(shop.getNokMealPlan().canAfford, false);
  assert.equal(shop.getNokMealPlan().projectedBalanceCents, -450);
  assert.equal(state.getWallet().balance, 14.9, 'unaffordable forecast never creates debt or a purchase');
  const withMilk = state.getWallet();
  state.updateWallet({ ...withMilk, nok_v1: { ...withMilk.nok_v1, shopping: { ...withMilk.nok_v1.shopping,
    openedUnits: { ...withMilk.nok_v1.shopping.openedUnits, 'tine-milk-1l': 0 } } } });
  const missingIngredient = JSON.stringify(state.getWallet());
  assert.equal(shop.consumeNokMeal('oats-with-milk', 'missing-planned-milk').reason, 'NOT_ENOUGH_STOCK');
  assert.equal(JSON.stringify(state.getWallet()), missingIngredient, 'failed preparation never decrements a selected portion');
  state.updateWallet(withMilk);
  // Player revises the plan to fit the milk still available.
  assert.equal(shop.saveNokMealPlan({ ...counts, 'oats-with-milk': 1 }).ok, true);
  assert.equal(shop.getNokMealPlan().shoppingCostCents, 0);
  for (const [id, requestId] of [['rice-lentils-tomato-onion', 'planned-1'], ['rice-lentils-tomato-onion', 'planned-2'],
    ['pasta-tomato-onion', 'planned-3'], ['oats-with-milk', 'planned-4']]) {
    assert.equal(shop.consumeNokMeal(id, requestId).ok, true);
    const once = JSON.stringify(state.getWallet());
    assert.equal(shop.consumeNokMeal(id, requestId).skipped, true);
    assert.equal(JSON.stringify(state.getWallet()), once, 'repeat preparation never decrements the plan twice');
  }
  assert.equal(shop.getNokMealPlan().portions, 0);
  assert.equal(shop.getNokMealPlan().shoppingCostCents, 0);
  assert.equal(state.getWallet().balance, 14.9);
  assert.equal(state.getWallet().old.preserved, true);
  await w.CivicationStoreUI.render(); await new Promise(resolve => setTimeout(resolve, 0));
  dom.window.close();
  console.log('PASS: read-only portion planning, whole-package shopping cost, real save UI, fresh-device restore, partial stock, affordability, separate payments and atomic plan completion');
})().catch(error => { console.error(error); process.exitCode = 1; });
