'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
const dom = new JSDOM('<body><div id="civiEconomyPanel"></div></body>',
  { url: 'https://example.test/Civication.html', runScripts: 'outside-only' });
const w = dom.window;
for (const path of ['core/civicationState.js', 'core/civicationCalendar.js',
  'core/civicationEconomyEngine.js', 'ui/CivicationEconomyUI.js'])
  w.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
const state = w.CivicationState;
const calendar = w.CivicationCalendar;
const engine = w.CivicationEconomyEngine;
state.updateWallet({ balance: 2000, history: [{ id: 'old' }], nok_v1: { active: true,
  version: 1, config, startedDayIndex: 1, earnedDays: [], payrollLedger: [], invoices: [], recurringBills: [] } });
calendar.setClock({ dayIndex: 31, currentMinutes: 600 });
w.CivicationEconomyUI.render();
const host = w.document.getElementById('civiEconomyPanel');
const buy = host.querySelector('[data-nok-transport]');
assert.ok(host.textContent.includes('30 spilldøgn'));
buy.focus(); buy.click();
assert.equal(state.getWallet().balance, 1345);
assert.equal(state.getWallet().nok_v1.transportPasses[0].amountNok, 655);
assert.equal(state.getWallet().nok_v1.transportPasses[0].sourceId, config.budget.transport.source);
assert.ok(host.textContent.includes('2026-03-02 kl. 10:00'));
assert.equal(w.document.activeElement.tagName, 'H3');
assert.equal(host.querySelector('[data-nok-transport]'), null);
assert.equal(engine.purchaseNokTransportPass().skipped, true);
assert.equal(state.getWallet().balance, 1345);
calendar.setClock({ dayIndex: 32, currentMinutes: 600 }); // February 1 is not a new ticket period.
assert.ok(engine.getNokTransportStatus().current);
calendar.setClock({ dayIndex: 61, currentMinutes: 599 });
assert.ok(engine.getNokTransportStatus().current, 'valid until the exact purchase time plus 30 days');
calendar.setClock({ dayIndex: 61, currentMinutes: 600 });
assert.equal(engine.getNokTransportStatus().current, null);
assert.equal(state.getWallet().balance, 1345, 'expiry never renews or debits');
assert.equal(engine.purchaseNokTransportPass().balance, 690);
calendar.setClock({ dayIndex: 91, currentMinutes: 600 });
assert.equal(engine.purchaseNokTransportPass().balance, 35);
assert.equal(state.getWallet().nok_v1.transportPasses.length, 3);
assert.equal(state.getWallet().nok_v1.invoices.length, 0, 'ticket purchases never create monthly bills');
calendar.setClock({ dayIndex: 121, currentMinutes: 600 });
w.CivicationEconomyUI.render();
assert.equal(host.querySelector('[data-nok-transport]').disabled, true);
const saved = JSON.stringify(state.getWallet());
assert.equal(engine.purchaseNokTransportPass().reason, 'NOT_ENOUGH_PC');
assert.equal(JSON.stringify(state.getWallet()), saved);
state.updateWallet({ ...state.getWallet(), balance: 1000 });
w.CivicationEconomyUI.render();
const stale = host.querySelector('[data-nok-transport]');
state.updateWallet({ ...state.getWallet(), balance: 0 });
stale.click();
assert.equal(state.getWallet().balance, 0);
assert.ok(host.textContent.includes('Ikke nok penger'));
assert.equal(state.getWallet().nok_v1.transportPasses.length, 3);
w.eval(fs.readFileSync('js/Civication/core/civicationEconomyEngine.js', 'utf8'));
assert.equal(JSON.stringify(state.getWallet().nok_v1.transportPasses), JSON.stringify(JSON.parse(saved).nok_v1.transportPasses), 'reload preserves the paid history');
assert.equal(state.getWallet().history[0].id, 'old');
state.updateWallet({ balance: 1000, nok_v1: { active: true, version: 1, config, startedDayIndex: 1 } });
calendar.setClock({ startDateISO: '2028-01-01', dayIndex: 31, currentMinutes: 600 });
assert.equal(engine.purchaseNokTransportPass().ok, true);
assert.equal(engine.getNokTransportStatus().validUntilDateISO, '2028-03-01', '30 days also respects leap years');
for (const invalid of [-1, 655.001, '655']) {
  const bad = JSON.parse(JSON.stringify(config));
  bad.budget.transport.priceNok = invalid;
  state.updateWallet({ balance: 1000, nok_v1: { active: true, version: 1, config: bad, startedDayIndex: 1 } });
  const before = JSON.stringify(state.getWallet());
  assert.equal(engine.purchaseNokTransportPass().reason, 'TRANSPORT_PRICE_NOT_MAPPED');
  assert.equal(JSON.stringify(state.getWallet()), before);
}
console.log('PASS: sourced prepaid 30-day purchase, exact expiry across months/leap year, no automatic renewal, no duplicate debit, stale balance and reload');
dom.window.close();
