'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const prototype = require('../data/Civication/economy/nok-budget-prototype-2026.json');
const approved = JSON.parse(JSON.stringify(prototype));
approved.status = 'active';
approved.migration.activated = true;
const unapproved = JSON.parse(JSON.stringify(prototype));
unapproved.status = 'prototype_not_activated';
unapproved.migration.activated = false; // Must always be refused even in release candidate.
let wallet = { balance: 123.45, last_tick_day_index: 8, completed_game_days_v1: [],
  livelihood_settled_weeks: ['game-week-000001'], history: [{ id: 'old-purchase' }] };
let active = null;
let writes = 0;
const window = { CivicationState: {
  getWallet: () => JSON.parse(JSON.stringify(wallet)), getActivePosition: () => active,
  updateWallet: value => { wallet = JSON.parse(JSON.stringify(value)); writes++; }
} };
const context = vm.createContext({ window, Date, localStorage: { getItem: () => '{"dayIndex":8}' } });
for (const name of ['civicationCalendar.js', 'civicationNokBudget.js', 'civicationEconomyEngine.js']) {
  vm.runInContext(fs.readFileSync('js/Civication/core/' + name, 'utf8'), context);
}
const migrate = window.CivicationEconomyEngine.migrateNokEconomy;
assert.equal(migrate(unapproved).reason, 'NOK_CONFIG_NOT_APPROVED');
assert.equal(writes, 0);
wallet.completed_game_days_v1 = [{ dayIndex: 8, weeklyNet: 2 }];
assert.equal(migrate(approved).reason, 'UNSETTLED_LEGACY_PAYROLL');
wallet.completed_game_days_v1 = [];
active = { career_id: 'unmapped' };
assert.equal(migrate(approved).reason, 'ACTIVE_JOB_NOT_MAPPED');
active = null;
const before = JSON.parse(JSON.stringify(wallet));
assert.equal(migrate(approved).ok, true);
assert.equal(wallet.balance, 123.45);
assert.equal(wallet.nok_v1.startedDayIndex, 8);
assert.equal(wallet.nok_v1.lastRecordedDayIndex, 7);
assert.equal(wallet.nok_v1.activatedDateISO, '2026-01-08');
for (const key of Object.keys(before)) assert.deepEqual(wallet[key], before[key], key + ' survives migration');
assert.deepEqual(wallet.nok_v1.recurringBills, []);
assert.deepEqual(wallet.nok_v1.payrollLedger, []);
approved.job.grossMonthlyNok = 1;
assert.equal(wallet.nok_v1.config.job.grossMonthlyNok, prototype.job.grossMonthlyNok, 'caller changes cannot rewrite the saved contract basis');
const saved = JSON.stringify(wallet);
assert.equal(migrate(approved).skipped, true);
assert.equal(JSON.stringify(wallet), saved);
assert.equal(writes, 1, 'migration can only initialize once');
for (const balance of [0, -25]) {
  wallet = { balance };
  assert.equal(migrate(approved).ok, true);
  assert.equal(wallet.balance, balance, 'zero and existing debt are preserved without credit or forgiveness');
}
wallet = { balance: 1.001 };
assert.equal(migrate(approved).reason, 'INVALID_OPENING_BALANCE');
console.log('PASS: NOK migration preserves balance/history, blocks pending wages and unapproved configuration, and never repeats');
