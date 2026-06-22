const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function installStorage(seed = {}) {
  const store = { ...seed };
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    dump() { return { ...store }; }
  };
}

function setup({ active = null, wallet = { balance: 42, last_tick_iso: null }, merits = {}, home = null, packs = [] } = {}) {
  global.window = global;
  global.localStorage = installStorage({ merits_by_category: JSON.stringify(merits) });
  global.Event = function Event(type) { this.type = type; };
  global.dispatchEvent = () => true;
  global.weekKey = () => '2026-W26';
  global.deriveTierFromPoints = (badge, points) => {
    const tiers = Array.isArray(badge?.tiers) ? badge.tiers : [];
    let tierIndex = 0;
    tiers.forEach((tier, index) => {
      if (Number(points) >= Number(tier.threshold || 0)) tierIndex = index;
    });
    return { tierIndex };
  };
  global.CivicationState = {
    getState: () => ({}),
    getWallet: () => wallet,
    getActivePosition: () => active,
    updateWallet: () => { throw new Error('snapshot must not update wallet'); },
    setState: () => { throw new Error('snapshot must not set state'); },
    setActivePosition: () => { throw new Error('snapshot must not set active position'); }
  };
  global.HG_CAREERS = [{ career_id: 'handel', economy: { salary_by_tier: { '1': 100, '2': 160 }, weekly_expenses: { base: 20, risk_modifier: 1.5 } } }];
  global.BADGES = [{ id: 'handel', tiers: [{ label: 'Start', threshold: 0 }, { label: 'Trygg', threshold: 50 }] }];
  global.CivicationHome = home ? { getHomeSnapshot: () => home } : undefined;
  global.HG_CiviShop = { getVisiblePacks: () => packs };
  delete global.CivicationEconomyEngine;
  delete global.HG_CiviEconomySnapshot;
  vm.runInThisContext(fs.readFileSync('js/Civication/core/civicationEconomyEngine.js', 'utf8'), { filename: 'civicationEconomyEngine.js' });
}

setup();
let snap = global.HG_CiviEconomySnapshot();
assert(snap.warnings.includes('no_active_position'), 'no active job emits warning');
assert.strictEqual(snap.weeklySalary, 0, 'no active job has salary 0');

setup({ active: { career_id: 'handel' }, merits: { handel: { points: 60 } } });
snap = global.CivicationEconomyEngine.getEconomySnapshot();
assert.strictEqual(snap.weeklySalary, 160, 'salary_by_tier is used for tier salary');
assert.strictEqual(snap.weeklyJobExpenses, 30, 'weekly expenses are base * risk_modifier');

setup({ active: { career_id: 'handel' }, merits: { handel: { points: 60 } }, home: { currentDistrict: { rent: 200 }, housingPressure: 'pressure' } });
snap = global.HG_CiviEconomySnapshot();
assert.strictEqual(snap.homeRent, 200, 'home rent is included from CivicationHome snapshot');
assert.strictEqual(snap.estimatedNetAfterHome, -70, 'estimated net subtracts salary, expenses, and rent');
assert(snap.warnings.includes('negative_estimated_net'), 'negative estimated net emits warning');
assert(snap.warnings.includes('rent_pressure'), 'rent pressure emits warning');

setup({ active: { career_id: 'handel' }, merits: { handel: { points: 60 } }, wallet: { balance: 80, last_tick_iso: null }, packs: [{ id: 'cheap', price_pc: 50 }, { id: 'dear', price_pc: 100 }] });
const beforeWallet = global.CivicationState.getWallet();
const beforeStorage = global.localStorage.dump();
snap = global.HG_CiviEconomySnapshot();
assert.strictEqual(global.CivicationState.getWallet(), beforeWallet, 'snapshot does not mutate wallet object reference');
assert.deepStrictEqual(global.localStorage.dump(), beforeStorage, 'snapshot does not mutate localStorage');
assert.strictEqual(snap.affordability.canAffordVisiblePacksCount, 1, 'affordability counts visible packs');
assert.strictEqual(snap.affordability.cheapestVisiblePackId, 'cheap', 'affordability reports cheapest pack');
assert.strictEqual(typeof global.HG_CiviEconomySnapshot, 'function', 'global HG_CiviEconomySnapshot exists');

console.log('civication-economy-snapshot tests passed');
