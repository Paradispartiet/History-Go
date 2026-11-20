'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('js/Civication/core/civicationEconomyEngine.js', 'utf8');
let wallet = { balance: 15000.25, last_tick_day_index: 8,
  livelihood_settled_weeks: ['game-week-000001'], nok_v1: { active: true, version: 1,
    invoices: [{ id: 'rent-2026-01', sourceId: 'lease-fixture-1', amountNok: 10090,
      dueDateISO: '2026-01-01', status: 'pending' }] } };
// These are explicit versioned-wallet fixtures, not production activation.
let date = '2026-01-01';
let writes = 0;
function boot() {
  const window = { CivicationCalendar: { getGameDate: () => date }, CivicationState: {
    getWallet: () => JSON.parse(JSON.stringify(wallet)),
    updateWallet: next => { wallet = JSON.parse(JSON.stringify(next)); writes++; }
  } };
  vm.runInNewContext(source, { window, Date });
  return window.CivicationEconomyEngine;
}
let engine = boot();
date = '2025-12-31';
assert.equal(engine.payNokInvoice('rent-2026-01').reason, 'NOT_DUE');
assert.equal(writes, 0);
date = '2026-01-01';
assert.equal(engine.payNokInvoice('rent-2026-01').balance, 4910.25);
assert.equal(wallet.last_tick_day_index, 8);
assert.deepEqual(wallet.livelihood_settled_weeks, ['game-week-000001']);
assert.equal(wallet.nok_v1.invoices[0].paidDateISO, date);
engine = boot();
assert.equal(engine.payNokInvoice('rent-2026-01').skipped, true);
assert.equal(writes, 1, 'retry/reload cannot debit twice');
assert.equal(engine.payNokInvoice('missing').reason, 'INVOICE_NOT_UNIQUE');
const bill = wallet.nok_v1.invoices[0];
bill.status = 'pending';
bill.amountNok = 9000;
assert.equal(engine.payNokInvoice(bill.id).reason, 'NOT_ENOUGH_PC');
assert.equal(wallet.balance, 4910.25);
assert.equal(bill.status, 'pending');
bill.amountNok = -10;
assert.equal(engine.payNokInvoice(bill.id).reason, 'INVALID_AMOUNT');
bill.amountNok = 1.001;
assert.equal(engine.payNokInvoice(bill.id).reason, 'INVALID_AMOUNT');
bill.amountNok = 1;
bill.dueDateISO = '2026-02-30';
assert.equal(engine.payNokInvoice(bill.id).reason, 'INVALID_DATE');
bill.dueDateISO = '2026-01-01';
bill.sourceId = '';
assert.equal(engine.payNokInvoice(bill.id).reason, 'INVALID_INVOICE');
bill.sourceId = 'lease-fixture-1';
wallet.balance = 4910.251;
assert.equal(engine.payNokInvoice(bill.id).reason, 'INVALID_AMOUNT');
wallet.balance = 4910.25;
wallet.nok_v1.invoices.push({ ...bill });
assert.equal(engine.payNokInvoice(bill.id).reason, 'INVOICE_NOT_UNIQUE');
wallet.nok_v1.invoices.pop();
assert.equal(engine.payNokInvoice('').reason, 'INVALID_INVOICE_ID');
wallet.nok_v1.active = false;
assert.equal(engine.payNokInvoice(bill.id).reason, 'NOK_NOT_ACTIVE');
assert.equal(writes, 1, 'all rejected attempts leave the saved wallet intact');
console.log('PASS: source-bound NOK invoices, game due dates, cents, reload idempotency and no overdraft');
