'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
const { costOfLivingScenario } = require('../js/Civication/core/civicationNokBudget.js');

const original = JSON.stringify(config);
assert.equal(config.status, 'active');
assert.equal(config.migration.activated, true);
assert.equal(config.migration.releaseMode, 'explicit_player_opt_in_only');
const estimate = (areaId, rooms, householdId) =>
  costOfLivingScenario(config, { areaId, rooms, householdId });

assert.deepEqual([
  estimate('oslo_baerum', 1, 'one_adult').monthlyRentNok,
  estimate('oslo_baerum', 2, 'two_adults').monthlyRentNok,
  estimate('oslo_baerum', 3, 'two_adults_two_children').monthlyRentNok,
  estimate('oslo_baerum', 4, 'two_adults_two_children').monthlyRentNok
], [10090, 15260, 19030, 23200], 'SSB 2025 rent varies by home size');
const family = estimate('oslo_baerum', 3, 'two_adults_two_children');
assert.equal(family.monthlyFoodNok, 15375);
assert.equal(family.monthlyRentAndFoodNok, 34405);
assert.equal(family.includesElectricity, false);
assert.equal(family.includesRestaurants, false);
assert.equal(family.isActualPayment, false);
assert.equal(family.isHousingOffer, false);
assert.equal(estimate('oslo_central',2,'two_adults').monthlyRentNok, 16700);
assert.equal(estimate('oslo_outer',2,'two_adults').monthlyRentNok, 14500);
assert.equal(estimate('trondheim_central',2,'two_adults').monthlyRentNok, 13200);
assert.equal(estimate('trondheim_outer',2,'two_adults').monthlyRentNok, 12200);
assert.equal(estimate('rural',2,'one_adult').monthlyRentAndFoodNok, 11970);
assert.equal(estimate('oslo_baerum', 4, 'two_adults_schoolchildren').monthlyRentAndFoodNok, 39270);
assert.equal(estimate('oslo_central',3,'one_adult').reason, 'ROOM_REFERENCE_UNAVAILABLE',
  'never invent prices for an unreported room size');
assert.equal(estimate('unlisted',2,'one_adult').reason, 'UNKNOWN_REFERENCE');
assert.equal(estimate('oslo_baerum',0,'one_adult').reason, 'INVALID_SELECTION');
assert.equal(estimate('oslo_baerum',2,'unknown').reason, 'UNKNOWN_REFERENCE');
assert.equal(costOfLivingScenario({}).reason, 'REFERENCES_UNAVAILABLE');
assert.equal(JSON.stringify(config), original, 'read-only reference cannot modify configuration');

(async function () {
  const dom = new JSDOM('<body><div id="civiEconomyPanel"></div></body>', {
    url:'https://example.test', runScripts:'outside-only'
  });
  const w = dom.window;
  const wallet = { balance:1234, nok_v1:{active:false,version:1} };
  let writes = 0;
  w.CivicationState = { getWallet:()=>wallet, updateWallet:()=>{writes++;} };
  w.fetch = async () => ({ ok:true, json:async()=>config });
  w.eval(fs.readFileSync(path.join(__dirname, '../js/Civication/core/civicationNokBudget.js'), 'utf8'));
  w.eval(fs.readFileSync(path.join(__dirname, '../js/Civication/ui/CivicationEconomyUI.js'), 'utf8'));
  await w.CivicationEconomyUI.loadActivationConfig();
  const panel = w.document.querySelector('[data-nok-location-costs]');
  assert.ok(panel, 'cost comparison visible even before NOK currency activation');
  assert.match(panel.textContent, /34\s?405,00/, 'family in Oslo, 3 rooms');
  assert.equal(w.document.querySelector('[data-nok-activate]'), null,
    'loading reference data cannot activate NOK economy');
  const region = panel.querySelectorAll('select')[0];
  region.value = 'oslo_outer';
  region.dispatchEvent(new w.Event('change', { bubbles:true }));
  const updated = w.document.querySelector('[data-nok-location-costs]');
  assert.match(updated.textContent, /14\s?500,00/, 'chosen location changes the displayed rent');
  assert.match(updated.textContent, /15\s?375,00/, 'household food reference is preserved');
  assert.equal(wallet.balance, 1234);
  assert.equal(writes, 0, 'reference selectors do not save wallet or create charges');
  assert.equal(JSON.stringify(config), original);
  dom.window.close();
  console.log('PASS: Civication sourced regional rent/household food, safe unsupported combinations, read-only UI, no wallet writes');
})().catch(error => { console.error(error); process.exitCode=1; });
