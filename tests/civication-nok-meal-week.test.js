'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
async function boot(seed) {
  const dom = new JSDOM('<div id="civiStorePanel"></div><div id="civiWeeklyMealPlanPanel"></div>', { url: 'https://example.test', runScripts: 'outside-only' });
  await new Promise(r => setTimeout(r, 0));
  for (const [k, v] of Object.entries(seed || {})) dom.window.localStorage.setItem(k, v);
  for (const p of ['core/civicationState.js', 'core/civicationCalendar.js', 'core/civicationNokBudget.js', 'civicationCommercial.js', 'ui/CivicationStoreUI.js', 'systems/civicationMealPlan.js', 'ui/CivicationMealPlanUI.js'])
    dom.window.eval(fs.readFileSync('js/Civication/' + p, 'utf8'));
  return dom;
}
(async () => {
  let dom = await boot(), w = dom.window, state = w.CivicationState, shop = w.HG_CiviShop;
  w.localStorage.setItem('hg_civi_meal_plans_v1', JSON.stringify({version:1,weeks:{'game-week-000001':{weekKey:'game-week-000001',people:2,meals:{0:{dinner:'pasta'}}}}}));
  const legacyPlan = w.localStorage.getItem('hg_civi_meal_plans_v1');
  w.CivicationCalendar.setClock({ startDateISO: '2026-12-29', dayIndex: 1 });
  state.updateWallet({ balance: 200, old: 'preserved', nok_v1: { active: true, version: 1, config } });
  const date = '2026-12-29', mealId = 'oats-with-milk';
  const entries = [{ date, slot: 'breakfast', mealId }, { date: '2027-01-01', slot: 'lunch', mealId: 'pasta-tomato-onion' },
    { date: '2027-01-04', slot: 'supper', mealId }];
  const before = JSON.stringify(state.getWallet());
  const view = shop.previewNokMealWeek(date, entries);
  assert.equal(view.ok, true); assert.equal(view.portions, 3);
  assert.deepEqual(Array.from(view.dates), ['2026-12-29', '2026-12-30', '2026-12-31', '2027-01-01', '2027-01-02', '2027-01-03', '2027-01-04']);
  assert.equal(view.referenceCostCents, 2181); assert.equal(view.shoppingCostCents, 9620);
  assert.equal(JSON.stringify(state.getWallet()), before, 'preview neither pays nor consumes');
  assert.equal(shop.previewNokMealWeek('2028-02-27', []).dates[2], '2028-02-29');
  for (const [start, invalid] of [['2026-02-29', []], ['2026-02-30', []], ['9999-12-29', []], [date, null],
    [date, entries.concat(entries[0])], [date, [{ date, slot: 'snack', mealId }]], [date, [{ date: '2027-01-05', slot: 'lunch', mealId }]],
    [date, [{ date, slot: 'lunch', mealId: 'unknown' }]]]) {
    assert.equal(shop.saveNokMealWeek(start, invalid).ok, false); assert.equal(JSON.stringify(state.getWallet()), before);
  }
  // Existing portion plans are replaced explicitly, never added a second time.
  assert.equal(shop.saveNokMealPlan({ [mealId]: 50 }).ok, true);
  assert.equal(shop.saveNokMealWeek(date, entries).ok, true);
  assert.equal(shop.getNokMealPlan().portions, 3);
  assert.equal(w.CivicationMealPlan.getWeek().meals[0].breakfast, mealId);
  assert.equal(w.CivicationMealPlan.getShoppingList().find(i => i.id === 'tine-milk-1l').quantity, 500);
  assert.deepEqual(Array.from(w.CivicationMealPlan.getIngredientIdsByMeal().breakfast), ['axa-oats-1100g', 'tine-milk-1l']);
  assert.equal(w.CivicationMealPlan.suggestionForTime({ currentMinutes: 480 }).recipeId, mealId);
  assert.throws(() => w.CivicationMealPlan.applyTemplate('varied'), /dated NOK/);
  assert.equal(w.localStorage.getItem('hg_civi_meal_plans_v1'), legacyPlan);
  w.CivicationMealPlanUI.render();
  assert.equal(w.document.querySelectorAll('#civiWeeklyMealPlanPanel select').length, 0, 'NOK has only one active planner');
  assert.ok(w.document.querySelector('#civiWeeklyMealPlanPanel input[type=search]'), 'explicit Fysen archive search is preserved');
  assert.equal(shop.saveNokMealWeek(date, entries.slice().reverse()).skipped, true);
  assert.equal(state.getWallet().balance, 200);
  assert.equal(shop.getNokPantry().length, 0);
  await w.CivicationStoreUI.render();
  assert.equal(w.document.querySelectorAll('[data-meal-week] select').length, 28);
  assert.equal(w.document.querySelector('[data-meal-planner]'), null, 'no second active portion editor');
  const weekly = w.document.querySelector('[data-meal-week]');
  const dinner = weekly.querySelector('[data-week-date="2026-12-29"][data-week-slot="dinner"]');
  const saved = JSON.stringify(state.getWallet());
  dinner.value = 'pasta-tomato-onion'; dinner.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.equal(JSON.stringify(state.getWallet()), saved, 'date/slot draft is read-only');
  weekly.querySelector('[data-save-meal-week]').click(); await new Promise(r => setTimeout(r, 5));
  assert.equal(shop.getNokMealPlan().portions, 4);
  assert.ok(w.document.activeElement.hasAttribute('data-save-meal-week'));
  assert.equal(w.document.querySelectorAll('[data-prepare-week]').length, 2, 'only today has preparation controls');
  assert.equal(w.document.querySelector('[data-prepare-week]').disabled, true);
  const missing = JSON.stringify(state.getWallet());
  assert.equal(shop.consumeNokMeal(mealId, 'missing', date + ':breakfast').ok, false);
  assert.equal(JSON.stringify(state.getWallet()), missing, 'missing ingredients preserve plan and pantry');
  for (const id of ['axa-oats-1100g', 'tine-milk-1l']) assert.equal((await shop.buyPack(id, 'buy-' + id)).ok, true);
  const cashBefore = w.CivicationNokBudget.monthlyCashFlow(state.getWallet(), '2026-12', w.CivicationCalendar.getGameDate);
  assert.equal(state.getWallet().balance, 149.7);
  const future = JSON.stringify(state.getWallet());
  assert.equal(shop.consumeNokMeal(mealId, 'future', '2027-01-04:supper').reason, 'MEAL_DATE_UNAVAILABLE');
  assert.equal(JSON.stringify(state.getWallet()), future);
  await w.CivicationStoreUI.render();
  w.document.querySelector('[data-prepare-week="2026-12-29:breakfast"]').click();
  await new Promise(r => setTimeout(r, 5));
  assert.equal(shop.getNokMealPlan().portions, 3);
  assert.equal(shop.getNokProductStock('tine-milk-1l').available, 750);
  assert.equal(shop.getNokProductStock('axa-oats-1100g').available, 1020);
  assert.equal(state.getWallet().balance, 149.7);
  const recorded = state.getWallet().nok_v1.shopping.consumptions.at(-1);
  const once = JSON.stringify(state.getWallet());
  assert.equal(shop.consumeNokMeal(mealId, recorded.requestId, recorded.planEntryKey).skipped, true);
  assert.equal(shop.consumeNokMeal(mealId, 'stale', recorded.planEntryKey).ok, false);
  assert.equal(shop.consumeNokMeal(mealId, recorded.requestId).reason, 'ACTION_REQUEST_CONFLICT');
  assert.equal(shop.saveNokMealWeek(date, entries).reason, 'MEAL_DATE_UNAVAILABLE', 'completed slots cannot be resurrected');
  assert.equal(JSON.stringify(state.getWallet()), once);
  assert.deepEqual(w.CivicationNokBudget.monthlyCashFlow(state.getWallet(), '2026-12', w.CivicationCalendar.getGameDate), cashBefore);
  // Cooking outside the schedule changes stock, without completing a future slot.
  assert.equal(shop.consumeNokMeal(mealId, 'ad-hoc').ok, true);
  assert.equal(shop.getNokMealPlan().portions, 3);
  const seed = Object.fromEntries(Array.from({ length: w.localStorage.length }, (_, i) => {
    const k = w.localStorage.key(i); return [k, w.localStorage.getItem(k)];
  }));
  const snapshot = JSON.stringify(state.getWallet()); await w.CivicationStoreUI.render(); await new Promise(r => setTimeout(r, 0)); dom.window.close();
  dom = await boot(seed); w = dom.window; state = w.CivicationState; shop = w.HG_CiviShop;
  assert.equal(JSON.stringify(state.getWallet()), snapshot);
  w.CivicationCalendar.setClock({ dayIndex: 7 });
  const pending = shop.getNokMealWeek();
  assert.equal(shop.saveNokMealWeek(date, pending.entries).skipped, true, 'past pending slots can be retained');
  const past = JSON.stringify(state.getWallet());
  assert.equal(shop.consumeNokMeal('pasta-tomato-onion', 'past', '2027-01-01:lunch').ok, false);
  assert.equal(shop.saveNokMealWeek(date, [{ date: '2026-12-30', slot: 'dinner', mealId }]).ok, false);
  assert.equal(JSON.stringify(state.getWallet()), past);
  assert.equal(shop.consumeNokMeal(mealId, 'last-day', '2027-01-04:supper').ok, true);
  assert.equal(shop.getNokMealPlan().portions, 2);
  assert.equal(state.getWallet().old, 'preserved');
  assert.equal(state.getWallet().balance, 149.7);
  await w.CivicationStoreUI.render(); await new Promise(r => setTimeout(r, 0)); dom.window.close();
  console.log('PASS: dated seven-day menus, all four slots, read-only drafts, shared package forecast, UI save/prepare, date guards, atomic completion, duplicate protection and fresh-device restore');
})().catch(e => { console.error(e); process.exitCode = 1; });
