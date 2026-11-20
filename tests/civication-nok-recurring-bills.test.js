'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
let clock = null;
let wallet = { balance: 20000, last_tick_day_index: 1, nok_v1: {
  active: true, version: 1, startedDayIndex: 1, recurringBills: [{
    id: 'lease-v1', sourceId: 'lease-fixture', amountNok: 10090,
    firstDueDateISO: '2026-01-31', endsOnISO: '2026-02-28'
  }], earnedDays: [], payrollLedger: []
} };
function boot() {
  const window = { CivicationState: {
    getState: () => ({}), getActivePosition: () => null,
    getWallet: () => JSON.parse(JSON.stringify(wallet)),
    updateWallet: value => { wallet = JSON.parse(JSON.stringify(value)); }
  } };
  const context = vm.createContext({ window, Date, localStorage: {
    getItem: () => clock, setItem: (_, value) => { clock = value; }
  } });
  for (const file of ['civicationCalendar.js', 'civicationEconomyEngine.js']) {
    vm.runInContext(fs.readFileSync('js/Civication/core/' + file, 'utf8'), context);
  }
  return window;
}
// Contracts and NOK activation are explicit fixtures, not production migration.
let app = boot();
app.CivicationEconomyEngine.tickWeekly();
assert.equal(wallet.nok_v1.invoices.length, 1);
assert.equal(wallet.balance, 20000, 'issuing a bill does not debit money');
const january = wallet.nok_v1.invoices[0];
assert.equal(january.dueDateISO, '2026-01-31');
assert.equal(app.CivicationEconomyEngine.payNokInvoice(january.id).reason, 'NOT_DUE');
app.CivicationCalendar.setClock({ dayIndex: 91 }); // April 1, catch up missed game ticks.
app.CivicationEconomyEngine.tickWeekly();
assert.deepEqual(wallet.nok_v1.invoices.map(i => i.dueDateISO), ['2026-01-31', '2026-02-28']);
assert.equal(wallet.balance, 20000);
assert.equal(app.CivicationEconomyEngine.payNokInvoice(january.id).balance, 9910);
const saved = JSON.stringify(wallet);
app = boot();
app.CivicationEconomyEngine.tickWeekly();
assert.equal(JSON.stringify(wallet), saved, 'reload preserves paid state and cannot recreate a bill');
wallet.nok_v1.recurringBills[0].amountNok = 10091;
const changed = JSON.stringify(wallet);
assert.equal(app.CivicationEconomyEngine.tickWeekly().reason, 'BILLING_CONTRACT_CONFLICT');
assert.equal(JSON.stringify(wallet), changed, 'conflicting terms never rewrite a previously issued bill');
wallet.nok_v1.recurringBills[0].amountNok = -1;
assert.equal(app.CivicationEconomyEngine.tickWeekly().reason, 'INVALID_BILLING_CONTRACT');
wallet.nok_v1.recurringBills[0].amountNok = 10090;
wallet.nok_v1.recurringBills[0].firstDueDateISO = '2026-02-30';
assert.equal(app.CivicationEconomyEngine.tickWeekly().reason, 'INVALID_BILLING_CONTRACT');
wallet.nok_v1.recurringBills[0].firstDueDateISO = '2026-01-31';
wallet.nok_v1.invoices.push({ ...wallet.nok_v1.invoices[0] });
assert.equal(app.CivicationEconomyEngine.tickWeekly().reason, 'INVOICE_NOT_UNIQUE');
wallet.nok_v1.invoices.pop();
wallet.nok_v1.startedDayIndex = 45; // Migration begins after January: never issue pre-migration bills.
wallet.nok_v1.invoices = [];
app.CivicationEconomyEngine.tickWeekly();
assert.deepEqual(wallet.nok_v1.invoices.map(i => i.dueDateISO), ['2026-02-28']);
console.log('PASS: monthly contract invoices, short months, catch-up, expiry, reload and no pre-migration charges');
