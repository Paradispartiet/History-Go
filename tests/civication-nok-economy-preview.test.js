'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const config = require('../data/Civication/economy/nok-budget-prototype-2026.json');
const wallet = { balance: 125, last_tick_day_index: 8, livelihood_settled_weeks: ['game-week-000001'] };
const saved = JSON.stringify(wallet);
const window = { CivicationState: { getWallet: () => wallet,
  updateWallet: () => { throw Error('A preview must not pay or charge money'); } } };
const context = vm.createContext({ window, console, Date, localStorage: { getItem: () => null } });
for (const file of ['js/Civication/core/civicationCalendar.js',
  'js/Civication/core/civicationNokBudget.js', 'js/Civication/core/civicationEconomyEngine.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
}
const unemployed = window.CivicationEconomyEngine.getNokBudgetPreview(config);
assert.equal(unemployed.actualBalance, 125);
assert.equal(unemployed.monthlyNet, 0, 'no actual or scenario job is inferred');
assert.equal(unemployed.approvedSupportNok, 0);
assert.equal(unemployed.gameMonth.id, '2026-01');
const employed = window.CivicationEconomyEngine.getNokBudgetPreview(config, { employed: true });
assert.equal(employed.mode, 'scenario_preview');
assert.equal(employed.activated, false);
assert.ok(Math.abs(employed.monthlyNet - 25829.59933333333) < .001);
assert.equal(JSON.stringify(wallet), saved);
const loader = require('../js/Civication/civicationShellLoader.js');
for (const list of [loader.SHELL_SCRIPTS, loader.LEGACY_SCRIPTS]) {
  assert.ok(list.indexOf('js/Civication/core/civicationNokBudget.js') < list.indexOf('js/Civication/core/civicationEconomyEngine.js'));
}
console.log('PASS: browser-compatible shared budget, shell ordering, actual wallet and read-only engine preview');
