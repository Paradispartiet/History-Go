'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
let wallet = { balance: 125.25, last_tick_day_index: 1, livelihood_settled_weeks: ['legacy-marker'],
  nok_v1: { active: true, version: 1, startedDayIndex: 1, config,
    earnedDays: [], payrollLedger: [] } };
let clockRaw = null;
let active = { career_id: 'retail-fixture', nok_salary_contract: {
  jobId: config.job.id, sourceId: config.job.source, employmentPercent: 100 } };
function boot() {
  const window = { CivicationState: {
    getWallet: () => JSON.parse(JSON.stringify(wallet)),
    updateWallet: next => { wallet = JSON.parse(JSON.stringify(next)); },
    getState: () => ({}), getActivePosition: () => active
  } };
  const context = vm.createContext({ window, Date, localStorage: {
    getItem: () => clockRaw, setItem: (_, v) => { clockRaw = v; }
  } });
  for (const file of ['civicationCalendar.js', 'civicationNokBudget.js', 'civicationEconomyEngine.js']) {
    vm.runInContext(fs.readFileSync('js/Civication/core/' + file, 'utf8'), context);
  }
  return window;
}
// Explicit NOK activation and employment are boundary fixtures, not an earned offer.
let app = boot();
app.CivicationEconomyEngine.recordCompletedDay(1);
assert.equal(wallet.nok_v1.earnedDays.length, 0, 'current day cannot be paid before completion');
const checkpoints = [];
for (let day = 1; day <= 90; day++) {
  if (day === 46) active = null; // February 15: job loss after 14 earned days.
  app.CivicationCalendar.setClock({ dayIndex: day + 1 });
  app.CivicationEconomyEngine.recordCompletedDay(day);
  const once = JSON.stringify(wallet);
  app.CivicationEconomyEngine.recordCompletedDay(day);
  assert.equal(JSON.stringify(wallet), once, 'duplicate day cannot earn twice');
  app.CivicationEconomyEngine.tickWeekly();
  const paid = JSON.stringify(wallet);
  app.CivicationEconomyEngine.tickWeekly();
  assert.equal(JSON.stringify(wallet), paid, 'boot/repeated tick cannot pay twice');
  if ([31, 59, 90].includes(day)) checkpoints.push(wallet.balance);
  if (day === 45) app = boot();
}
assert.deepEqual(checkpoints, [25954.85, 38869.65, 38869.65]);
assert.deepEqual(wallet.nok_v1.payrollLedger.map(e => e.monthId), ['2026-01', '2026-02', '2026-03']);
assert.equal(wallet.nok_v1.payrollLedger[0].grossCents, 3169400);
assert.equal(wallet.nok_v1.payrollLedger[1].grossCents, 1584700);
assert.equal(wallet.nok_v1.payrollLedger[2].grossCents, 0, 'no automatic NAV or salary after job loss');
assert.equal(wallet.last_tick_day_index, 1, 'NOK payroll never advances the old weekly settlement marker');
assert.deepEqual(wallet.livelihood_settled_weeks, ['legacy-marker']);
assert.deepEqual(wallet.nok_v1.earnedDays, []);
const saved = JSON.stringify(wallet);
app = boot();
app.CivicationEconomyEngine.tickWeekly();
assert.equal(JSON.stringify(wallet), saved);
active = { career_id: 'unmapped-job' };
app.CivicationCalendar.setClock({ dayIndex: 92 });
app.CivicationEconomyEngine.recordCompletedDay(91);
assert.equal(JSON.stringify(wallet), saved, 'unmapped job cannot receive invented pay');
console.log('PASS: three real NOK months, earned salary/tax, mid-month job loss, reload and no legacy double pay');
