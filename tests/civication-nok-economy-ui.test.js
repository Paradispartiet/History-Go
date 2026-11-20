'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><div id="civiEconomyPanel"></div>', { runScripts: 'outside-only', url: 'https://example.test/Civication.html' });
const { window } = dom;
let wallet = { balance: 12500.25, last_tick_day_index: 8, nok_v1: { active: true, version: 1,
  earnedDays: [{ monthId: '2026-01', grossCents: 102238, taxCents: 18917 }],
  payrollLedger: [], invoices: [
    { id: 'rent', title: '<img src=x onerror=alert(1)>', sourceId: 'lease-fixture', amountNok: 10090, dueDateISO: '2026-01-01', status: 'pending' },
    { id: 'future', sourceId: 'future-fixture', amountNok: 10, dueDateISO: '2026-02-01', status: 'pending' },
    { id: 'expensive', sourceId: 'bill-fixture', amountNok: 50000, dueDateISO: '2026-01-01', status: 'pending' }
  ] } };
let writes = 0;
window.CivicationState = { getWallet: () => JSON.parse(JSON.stringify(wallet)),
  updateWallet: next => { wallet = JSON.parse(JSON.stringify(next)); writes++; window.dispatchEvent(new window.Event('updateProfile')); } };
for (const path of ['core/civicationCalendar.js', 'core/civicationEconomyEngine.js', 'ui/CivicationEconomyUI.js']) {
  window.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
}
window.CivicationEconomyUI.render();
const host = window.document.getElementById('civiEconomyPanel');
assert.ok(host.textContent.includes('Opptjent brutto denne måneden'));
assert.ok(host.textContent.includes('Estimert skatt'));
assert.ok(host.textContent.includes('Opptjent netto'));
assert.equal(host.querySelector('img'), null, 'stored titles are text, never HTML');
assert.equal(writes, 0, 'rendering never pays or migrates');
assert.equal(host.querySelector('[data-nok-invoice="future"]').disabled, true);
assert.equal(host.querySelector('[data-nok-invoice="expensive"]').disabled, true);
const pay = host.querySelector('[data-nok-invoice="rent"]');
pay.focus();
pay.click();
assert.equal(wallet.balance, 2410.25);
assert.equal(wallet.nok_v1.invoices[0].status, 'paid');
assert.equal(wallet.last_tick_day_index, 8);
assert.equal(writes, 1);
assert.ok(host.querySelector('[role="status"]').textContent.includes('Regningen er betalt'));
assert.equal(window.document.activeElement.tagName, 'H3', 'focus remains inside the refreshed economy view');
pay.click();
window.CivicationEconomyUI.render();
assert.equal(writes, 1, 'double click and redraw never debit twice');
assert.equal(host.querySelector('[data-nok-invoice="rent"]'), null);
wallet.nok_v1.invoices.push({ id: 'race', sourceId: 'race-fixture', amountNok: 1,
  dueDateISO: '2026-01-01', status: 'pending' });
window.CivicationEconomyUI.render();
const stale = host.querySelector('[data-nok-invoice="race"]');
wallet.balance = 0; // Balance changed after rendering; the engine must recheck it.
stale.click();
assert.equal(writes, 1);
assert.equal(wallet.nok_v1.invoices.at(-1).status, 'pending');
assert.ok(host.querySelector('[role="status"]').textContent.includes('Ikke nok penger'));
wallet.nok_v1.active = false;
window.CivicationEconomyUI.render();
assert.ok(host.textContent.includes('Kroneøkonomien er ikke aktivert'));
assert.equal(host.querySelector('button'), null);
assert.equal(writes, 1);
console.log('PASS: actual NOK payment through UI, due/affordability, focus, inert text and no render mutations');
dom.window.close();
