'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
const { getElectricityProfile } = require('../js/Civication/core/civicationNokBudget.js');
const profile = getElectricityProfile(config);
assert.equal(profile.monthlyCents, 61700);
assert.equal(profile.monthlyConsumptionKwh, 500);
assert.equal(profile.unitPriceNokPerKwh, 1.234);
assert.equal(profile.includes, 'power_grid_taxes_less_public_support');
const invalid = JSON.parse(JSON.stringify(config));
invalid.budget.electricity.monthlyNok = 1000;
assert.throws(() => getElectricityProfile(invalid), RangeError);
const dom = new JSDOM('<body><div id="civiEconomyPanel"></div><div id="homeStatusContent"></div></body>',
  { url: 'https://example.test', runScripts: 'outside-only' });
const w = dom.window;
for (const path of ['core/civicationState.js', 'core/civicationCalendar.js', 'core/civicationNokBudget.js',
  'core/civicationEconomyEngine.js', 'ui/CivicationHome.js', 'ui/CivicationEconomyUI.js'])
  w.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
const state = w.CivicationState;
const clock = w.CivicationCalendar;
let engine = w.CivicationEconomyEngine;
state.updateWallet({ balance: 20000, nok_v1: { active: true, version: 1, config,
  startedDayIndex: 1, lastRecordedDayIndex: 0, activatedDateISO: '2026-01-01', earnedDays: [], payrollLedger: [] } });
w.CivicationHome.render();
assert.ok(w.document.getElementById('homeStatusContent').textContent.includes('617 kr per hel måned'));
assert.ok(w.document.getElementById('homeStatusContent').textContent.includes('500 kWh antatt forbruk'));
for (let day = 1; day <= 90; day++) {
  if (day === 10) assert.equal(w.CivicationHome.selectDistrict('sagene'), true);
  clock.setClock({ dayIndex: day + 1 });
  engine.recordCompletedDay(day);
  engine.tickWeekly();
  const before = JSON.stringify(state.getWallet());
  engine.recordCompletedDay(day); engine.tickWeekly();
  assert.equal(JSON.stringify(state.getWallet()), before);
  if (day === 45) {
    w.eval(fs.readFileSync('js/Civication/core/civicationEconomyEngine.js', 'utf8'));
    engine = w.CivicationEconomyEngine;
  }
}
const wallet = JSON.parse(JSON.stringify(state.getWallet()));
const bills = wallet.nok_v1.invoices.filter(i => i.estimatedConsumptionKwh != null);
assert.deepEqual(bills.map(i => i.amountNok), [437.88, 617, 617]);
assert.deepEqual(bills.map(i => i.dueDateISO), ['2026-02-01', '2026-03-01', '2026-04-01']);
assert.deepEqual(bills.map(i => i.estimatedConsumptionKwh), [354.839, 500, 500]);
assert.ok(bills.every(i => i.sourceId === config.budget.electricity.source));
assert.equal(wallet.balance, 20000, 'consumption and invoice generation never debit or grant support');
w.CivicationEconomyUI.render();
assert.ok(w.document.getElementById('civiEconomyPanel').textContent.includes('Antatt forbruk'));
assert.equal(engine.payNokInvoice(bills[0].id).balance, 19562.12);
const saved = JSON.stringify(state.getWallet());
engine.tickWeekly();
assert.equal(JSON.stringify(state.getWallet()), saved);
assert.equal(engine.payNokInvoice(bills[0].id).skipped, true);
assert.equal(state.getWallet().nok_v1.invoices.filter(i => i.status === 'paid').length, 1);
console.log('PASS: sourced effective electricity rate, assumed consumption, partial first month, invoice after consumption, short months, reload and single payment');
dom.window.close();
