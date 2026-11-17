'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
(async () => {
const dom = new JSDOM('<body><div id="civiEconomyPanel"></div></body>',
  { url: 'https://example.test', runScripts: 'outside-only' });
const w = dom.window;
for (const path of ['core/civicationState.js', 'core/civicationCalendar.js', 'core/civicationNokBudget.js',
  'core/civicationEconomyEngine.js', 'civicationCommercial.js', 'ui/CivicationEconomyUI.js'])
  w.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
const state = w.CivicationState;
const calendar = w.CivicationCalendar;
calendar.setClock({ dayIndex: 36, currentMinutes: 480 }); // 5 February, played time.
// Explicit ledger/opening-balance fixtures; actual new purchases/payments use owners.
state.updateWallet({ balance: 40000, preserved: { old: true }, nok_v1: { active: true, version: 1, config,
  startedDayIndex: 1,
  earnedDays: [{ monthId: '2026-02', grossCents: 100000, taxCents: 10000 }],
  payrollLedger: [
    { monthId: '2025-12', grossCents: 10000, taxCents: 2000, paidDateISO: '2026-01-01' },
    { monthId: '2026-01', grossCents: 3169400, taxCents: 586440, paidDateISO: '2026-02-03' }
  ],
  invoices: [
    { id: 'january-paid', sourceId: 'fixture', title: 'Tidligere betalt', amountNok: 50, status: 'paid', paidDateISO: '2026-01-31' },
    { id: 'electricity', sourceId: 'fixture', monthId: '2026-01', title: '<img src=x onerror=alert(1)>', amountNok: 617, status: 'paid', paidDateISO: '2026-02-01' },
    { id: 'rent', sourceId: 'fixture', title: 'Leie', amountNok: 10090, status: 'pending', dueDateISO: '2026-01-01' },
    { id: 'future', sourceId: 'fixture', amountNok: 10, status: 'pending', dueDateISO: '2026-03-01' },
    { id: 'cancelled', sourceId: 'fixture', amountNok: 999, status: 'cancelled' }
  ],
  shopping: { quantities: {}, openedUnits: {}, consumptions: [], purchases: [
    { requestId: 'old-food', productId: 'tine-milk-1l', title: 'Melk', amountNok: 19.4, gameDateISO: '2026-01-31' }
  ] },
  transportPasses: [{ id: 'old-ticket', amountNok: 655, startsAtGameMinute: 1440, expiresAtGameMinute: 31 * 1440 }]
} });
const view = month => w.CivicationNokBudget.monthlyCashFlow(state.getWallet(), month, calendar.getGameDate);
assert.equal(view('2026-02').incomeCents, 2582960, 'January earnings are February cash, paid on 3 February');
assert.equal(view('2026-02').expenseCents, 61700, 'pending/cancelled/future invoices, earned wages and proxies are excluded');
assert.equal(view('2026-01').incomeCents, 8000);
assert.equal(view('2026-01').expenseCents, 72440, 'ticket belongs to purchase month, not expiry month');
assert.equal(view('2026-03').entries.length, 0);
w.CivicationEconomyUI.render();
const host = w.document.getElementById('civiEconomyPanel');
const before = JSON.stringify(state.getWallet());
const statement = host.querySelector('[data-nok-monthly-statement]');
assert.ok(statement.textContent.includes('25\u00a0829,60'));
assert.equal(statement.querySelector('img'), null, 'payment titles are inert text');
assert.equal(JSON.stringify(state.getWallet()), before, 'view and render are read-only');
host.querySelector('[data-nok-invoice="rent"]').click();
assert.equal(state.getWallet().nok_v1.invoices.find(i => i.id === 'rent').paidDateISO, '2026-02-05');
assert.equal((await w.HG_CiviShop.buyPack('tine-milk-1l', 'feb-milk')).ok, true);
assert.equal(w.CivicationEconomyEngine.purchaseNokTransportPass().ok, true);
let current = view('2026-02');
assert.equal(current.invoiceCents, 1070700);
assert.equal(current.groceryCents, 1940);
assert.equal(current.transportCents, 65500);
assert.equal(current.expenseCents, 1138140);
assert.equal(current.netCents, 1444820);
assert.equal(current.entries.length, 5);
const consumed = w.HG_CiviShop.consumeNokProduct('tine-milk-1l', 'feb-use');
assert.equal(consumed.remaining, 750);
assert.equal(view('2026-02').expenseCents, current.expenseCents, 'consumption never counts as another expense');
assert.equal(state.getWallet().balance, 29235.6);
assert.equal(state.getWallet().preserved.old, true);
const saved = JSON.stringify(state.getWallet());
for (const path of ['core/civicationNokBudget.js', 'ui/CivicationEconomyUI.js'])
  w.eval(fs.readFileSync('js/Civication/' + path, 'utf8'));
w.CivicationEconomyUI.render();
assert.equal(JSON.stringify(state.getWallet()), saved);
assert.equal(view('2026-02').expenseCents, current.expenseCents);
for (const mutate of [
  x => x.nok_v1.payrollLedger.push(x.nok_v1.payrollLedger[0]),
  x => x.nok_v1.shopping.purchases.push(x.nok_v1.shopping.purchases[0]),
  x => x.nok_v1.transportPasses.push(x.nok_v1.transportPasses[0]),
  x => x.nok_v1.invoices.push(x.nok_v1.invoices[0]),
  x => x.nok_v1.shopping.purchases[0].amountNok = '19.4',
  x => x.nok_v1.shopping.purchases[0].amountNok = 19.401,
  x => x.nok_v1.invoices[1].paidDateISO = '2026-02-30',
  x => x.nok_v1.payrollLedger[1].taxCents = -1,
  x => x.nok_v1.shopping = 'corrupt',
  x => { x.nok_v1.payrollLedger[0].grossCents = Number.MAX_SAFE_INTEGER; x.nok_v1.payrollLedger[0].paidDateISO = '2026-02-01'; }
]) {
  const bad = JSON.parse(saved); mutate(bad);
  const snapshot = JSON.stringify(bad);
  const result = w.CivicationNokBudget.monthlyCashFlow(bad, '2026-02', calendar.getGameDate);
  assert.equal(result.ok, false, 'corrupt/duplicate/overflow histories have no partial totals');
  assert.equal(result.entries, undefined);
  assert.equal(JSON.stringify(bad), snapshot);
}
assert.equal(view('2026-13').reason, 'INVALID_MONTH');
assert.equal(w.CivicationNokBudget.monthlyCashFlow({}, '2026-02', calendar.getGameDate).reason, 'NOK_NOT_ACTIVE');
const bad = JSON.parse(saved); bad.nok_v1.shopping.purchases[0].gameDateISO = 'invalid';
state.updateWallet(bad); w.CivicationEconomyUI.render();
assert.ok(host.querySelector('[data-nok-monthly-statement]').textContent.includes('ikke tilgjengelig'));
console.log('PASS: actual payment month, gross/tax net, invoice payment UI, groceries, transport, no consumption/proxy double count, read-only reload, invalid histories and safe UI');
dom.window.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
