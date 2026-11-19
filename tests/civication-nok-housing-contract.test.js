'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = JSON.parse(JSON.stringify(require('../data/Civication/economy/nok-budget-prototype-2026.json')));
// Explicit reviewed-config and lease boundary fixtures; these are not actual listings.
config.status = 'active';
config.migration.activated = true;
config.housingOffers = [
  { id: 'sagene-fixture', districtId: 'sagene', monthlyRentNok: 10090, sourceId: 'fixture-lease-a' },
  { id: 'lokka-fixture', districtId: 'grunerlokka', monthlyRentNok: 11000, sourceId: 'fixture-lease-b' }
];
const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', url: 'https://example.test' });
const w = dom.window;
for (const file of ['core/civicationState.js', 'core/civicationCalendar.js', 'core/civicationNokBudget.js',
  'core/civicationEconomyEngine.js', 'ui/CivicationHome.js']) w.eval(fs.readFileSync('js/Civication/' + file, 'utf8'));
w.CivicationState.updateWallet({ balance: 20000, last_tick_day_index: 1 });
w.localStorage.setItem('hg_capital_v1', '{"economic":50}');
assert.equal(w.CivicationEconomyEngine.migrateNokEconomy(config).ok, true);
assert.equal(w.CivicationHome.selectDistrict('sagene'), true);
let wallet = w.CivicationState.getWallet();
assert.equal(wallet.nok_v1.housing.districtId, 'sagene');
assert.equal(wallet.nok_v1.recurringBills[0].amountNok, 10090);
assert.equal(w.CivicationHome.getCurrentDistrict().id, 'sagene');
assert.ok(w.CivicationHome.getDistrictViewModels().find(d => d.id === 'sagene').rentLabel.includes('kr / måned'));
const selected = JSON.stringify(wallet);
assert.equal(w.CivicationHome.selectDistrict('sagene'), true);
assert.equal(JSON.stringify(w.CivicationState.getWallet()), selected, 'same housing selection never duplicates the lease');
w.CivicationEconomyEngine.tickWeekly();
wallet = w.CivicationState.getWallet();
assert.equal(wallet.nok_v1.invoices.length, 1);
assert.equal(w.CivicationEconomyEngine.payNokInvoice(wallet.nok_v1.invoices[0].id).balance, 9910);
assert.equal(w.CivicationHome.selectDistrict('grunerlokka'), true);
w.CivicationEconomyEngine.tickWeekly();
wallet = w.CivicationState.getWallet();
assert.equal(wallet.nok_v1.housing.districtId, 'grunerlokka');
assert.equal(wallet.nok_v1.recurringBills[0].endsOnISO, '2026-01-01');
assert.equal(wallet.nok_v1.invoices[0].status, 'paid', 'moving does not erase a paid bill or invent a refund');
assert.equal(wallet.nok_v1.invoices[1].amountNok, 11000);
assert.equal(wallet.balance, 9910);
assert.equal(w.CivicationHome.selectDistrict('sondre_nordstrand'), false, 'unmapped housing cannot invent a rent');
assert.equal(w.localStorage.getItem('hg_capital_v1'), '{"economic":50}');
w.localStorage.setItem('civi_home_v1', '{"currentDistrictId":"sagene","home":{"district":"sagene"}}');
assert.equal(w.CivicationHome.getCurrentDistrict().id, 'grunerlokka', 'wallet-owned housing wins over a stale legacy projection');
assert.equal(w.CivicationHome.applyRentTick(true).reason, 'NOK_WALLET_BILLING');
assert.equal(w.CivicationHome.applyHousingPeriodCosts(true).reason, 'NOK_WALLET_BILLING');
console.log('PASS: actual district choice creates sourced lease, issues/pay rent, moves safely and preserves canonical housing');
dom.window.close();
