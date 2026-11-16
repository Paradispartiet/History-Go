#!/usr/bin/env node
'use strict';
// Runtime integration, not organic merit earning: existing savings and one
// music merit are explicit fixtures. Prices/wages come from the real catalogs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const read = file => JSON.parse(source(file));
const canonicalKey = 'hg_civi_wallet_v1';
const legacyKey = 'hg_pc_wallet_v1';
const pack = read('data/Civication/commercial_packs.json').packs.find(p => p.id === 'streetwear_basic');
assert.equal(pack.price_pc, 1200);

function setup(seed = {}, withState = true) {
  const data = new Map(Object.entries(seed).map(([k, v]) => [k, JSON.stringify(v)]));
  const storage = {
    getItem: k => data.get(k) ?? null,
    setItem: (k, v) => data.set(k, String(v))
  };
  const window = { localStorage: storage, dispatchEvent() {},
    DataHub: { fetchJSON: async file => read(file) } };
  const math = Object.create(Math);
  math.random = () => 1; // Disable random layoffs in this payroll invariant.
  const context = vm.createContext({ window, localStorage: storage, Math: math, Date, console,
    Event: class { constructor(type) { this.type = type; } },
    deriveTierFromPoints: () => ({ tierIndex: 0 }) });
  const load = file => vm.runInContext(source(file), context, { filename: file });
  if (withState) load('js/Civication/core/civicationState.js');
  load('js/Civication/civicationCommercial.js');
  return { window, storage, load, json: k => JSON.parse(storage.getItem(k)),
    snapshot: () => JSON.stringify([...data]) };
}

async function run() {
  const metadata = {
    last_tick_day_index: 8, last_tick_iso: '2026-11-16T08:00:00.000Z',
    completed_game_days_v1: [{ dayIndex: 8, careerId: 'musikk', weeklyNet: 2 }],
    livelihood_settled_weeks: ['game-week-000001']
  };
  const s = setup({ [canonicalKey]: { balance: 1300, ...metadata },
    [legacyKey]: { balance: 9000 }, merits_by_category: { musikk: { points: 1 } } });
  const before = s.snapshot();
  assert.equal(s.window.HG_CiviShop.getWallet().last_tick_day_index, 8,
    'shop reads must retain the canonical payroll checkpoint');
  assert.equal(s.snapshot(), before, 'reading a canonical wallet is side-effect free');
  const bought = await s.window.HG_CiviShop.buyPack(pack.id);
  assert.equal(bought.ok, true);
  assert.deepEqual(s.json(canonicalKey), { balance: 100, ...metadata },
    'a real catalog purchase changes only balance, preserving earned days and settled livelihood weeks');
  assert.equal(s.json('hg_pc_inventory_v1').packs[pack.id], true);
  assert.equal(s.json(legacyKey).balance, 100, 'compatibility mirror follows the canonical debit');
  const after = s.snapshot();
  assert.equal((await s.window.HG_CiviShop.buyPack(pack.id)).reason, 'NOT_ENOUGH_PC');
  assert.equal(s.snapshot(), after, 'unaffordable purchases change neither wallet nor inventory');

  for (const balance of [0, -25]) {
    const zero = setup({ [canonicalKey]: { balance, ...metadata }, [legacyKey]: { balance: 9000 } });
    const saved = zero.snapshot();
    assert.equal(zero.window.getPCWallet(), balance, 'stale legacy money cannot replace a real zero or debt');
    assert.equal(zero.snapshot(), saved, 'displaying zero/debt cannot top up the canonical wallet');
  }
  s.window.savePCWallet(0);
  assert.deepEqual(s.json(canonicalKey), { balance: 0, ...metadata },
    'numeric compatibility writes preserve all payroll metadata');
  s.window.savePCWallet({ balance: 5 });
  assert.deepEqual(s.json(canonicalKey), { balance: 5, ...metadata },
    'balance-only object writes also preserve metadata');
  s.window.savePCWallet({ pc: 7 });
  assert.deepEqual(s.json(canonicalKey), { balance: 7, pc: 7, ...metadata },
    'the legacy pc alias remains supported without deleting settlement fields');

  const migrated = setup({ [legacyKey]: { pc: 17 } });
  assert.equal(migrated.window.getPCWallet(), 17, 'a genuinely absent canonical wallet imports old savings');
  assert.equal(migrated.json(canonicalKey).balance, 17);
  migrated.window.CivicationState.updateWallet({ balance: 0, ...metadata });
  assert.equal(migrated.window.getPCWallet(), 0, 'legacy import never repeats after canonical initialization');
  const standalone = setup({ [legacyKey]: { pc: 1300 }, merits_by_category: { musikk: { points: 1 } } }, false);
  assert.equal((await standalone.window.HG_CiviShop.buyPack(pack.id)).newBalance, 100,
    'legacy-only shop entry remains usable');

  // Three actual game weeks with catalog wages, catalog work expenses, a
  // midweek purchase, and a fresh runtime reading the same serialized wallet.
  const journey = setup({ [canonicalKey]: { balance: 1198, last_tick_day_index: 1 },
    merits_by_category: { musikk: { points: 1 } } });
  journey.window.HG_CAREERS = read('data/Civication/hg_careers.json').careers;
  journey.window.BADGES = [{ id: 'musikk', tiers: [{ threshold: 1 }] }];
  journey.window.CivicationState.setActivePosition({ career_id: 'musikk' });
  let day = 1;
  journey.window.CivicationCalendar = { getClock: () => ({ dayIndex: day }) };
  journey.load('js/Civication/core/civicationEconomyEngine.js');
  const economy = journey.window.CivicationEconomyEngine;
  const checkpoints = [];
  for (let completed = 1; completed <= 21; completed++) {
    economy.recordCompletedDay(completed);
    if (completed === 10) {
      const earned = journey.json(canonicalKey);
      assert.equal((await journey.window.HG_CiviShop.buyPack(pack.id)).newBalance, 0);
      assert.deepEqual(journey.json(canonicalKey), { ...earned, balance: 0 },
        'buying midweek preserves already completed work days and the settlement anchor');
    }
    day = completed + 1;
    economy.tickWeekly();
    const once = journey.storage.getItem(canonicalKey);
    economy.tickWeekly();
    assert.equal(journey.storage.getItem(canonicalKey), once, 'duplicate tick never repays wages');
    if (completed % 7 === 0) checkpoints.push(journey.json(canonicalKey).balance);
  }
  assert.deepEqual(checkpoints, [1200, 2, 4],
    'three catalog net wages of 2 PC minus one 1200-PC purchase reconcile exactly');
  assert.equal(journey.json(canonicalKey).last_tick_day_index, 22);
  assert.deepEqual(journey.json(canonicalKey).completed_game_days_v1, []);
  const persisted = journey.storage.getItem(canonicalKey);
  journey.load('js/Civication/civicationCommercial.js');
  journey.load('js/Civication/core/civicationEconomyEngine.js');
  assert.equal(journey.window.getPCWallet(), 4);
  journey.window.CivicationEconomyEngine.tickWeekly();
  assert.equal(journey.storage.getItem(canonicalKey), persisted, 'reloading after the third week cannot repay or refill');
  console.log('PASS: shop wallet ownership, legacy migration, catalog purchase and three-week payroll reconciliation');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
