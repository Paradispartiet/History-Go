#!/usr/bin/env node
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

function boot(overrides = {}) {
  global.window = global;
  global.localStorage = installStorage({ merits_by_category: JSON.stringify({ handel: { points: 10 } }) });
  global.Event = function Event(type) { this.type = type; };
  global.document = {
    scripts: [],
    body: { appendChild() {} },
    documentElement: {},
    addEventListener() {},
    createElement: () => ({ setAttribute() {}, style: {}, getAttribute() { return ''; } }),
    getElementById: () => null
  };
  global.dispatchEvent = () => true;
  global.addEventListener = () => {};
  global.console = { log() {}, warn() {}, error() {}, table() {}, groupCollapsed() {}, groupEnd() {} };
  global.CivicationState = {
    getWallet: () => ({ balance: 100 }),
    getActivePosition: () => ({ career_id: 'handel', title: 'Ekspeditør' }),
    getState: () => ({}),
    getInbox: () => []
  };
  global.HG_CiviShop = {
    getInv: () => ({ packs: [{ id: 'p1' }], ownedItems: [{ id: 'p1' }], style_counts: { retail: 1 } }),
    getVisiblePacks: () => [{ id: 'p1' }],
    getVisibleStores: () => []
  };
  global.HG_CiviProfileSnapshot = () => ({ id: 'profile' });
  global.HG_CiviWorkdaySnapshot = () => ({ task: { id: 't1' } });
  global.HG_CiviEconomySnapshot = () => ({ balance: 100, estimatedNetAfterHome: 50, warnings: [] });
  global.CivicationHome = { getState: () => ({ district: 'sentrum' }), getHomeSnapshot: () => ({ district: 'sentrum', housingPressure: 'normal' }) };
  global.HG_CiviEngine = { getPendingEvent: () => null };
  global.CivicationOutcomeStatusUI = { render() {} };
  delete global.CivicationCareerOutcomeRuntime;
  Object.assign(global, overrides);
  vm.runInThisContext(fs.readFileSync('js/Civication/CivicationBoot.js', 'utf8'), { filename: 'CivicationBoot.js' });
  return global.HG_CiviDebug;
}

(async () => {
  let debug = boot({ CivicationState: { getWallet: () => null, getActivePosition: () => null, getState: () => ({}), getInbox: () => [] } });
  let report = await debug.health();
  assert.strictEqual(report.ok, false, 'wallet blocker makes health not ok');
  assert.strictEqual(report.checks.wallet.status, 'blocker', 'missing wallet is blocker');
  assert(report.blockers.some((b) => b.key === 'wallet'), 'wallet blocker is listed');

  debug = boot({ CivicationState: { getWallet: () => ({ balance: 100 }), getActivePosition: () => null, getState: () => ({}), getInbox: () => [] }, HG_CiviEconomySnapshot: () => ({ balance: 100, estimatedNetAfterHome: 50, warnings: ['no_active_position'] }) });
  report = await debug.health();
  assert.strictEqual(report.checks.workday.status, 'idle', 'no active job is idle');
  assert(report.warnings.some((w) => w.warning === 'no_active_position'), 'no active job emits economy warning');

  debug = boot({ HG_CiviEconomySnapshot: () => ({ balance: 100, estimatedNetAfterHome: -10, warnings: [] }) });
  report = await debug.health();
  assert(report.warnings.some((w) => w.warning === 'negative_estimated_net'), 'negative economy net warns');

  debug = boot();
  const before = global.localStorage.dump();
  report = await debug.health();
  assert.strictEqual(report.ok, true, 'valid core snapshots are ok');
  assert.deepStrictEqual(global.localStorage.dump(), before, 'health does not mutate localStorage');

  const healthyScore = report.score;
  debug = boot({ HG_CiviEconomySnapshot: () => ({ balance: 100, estimatedNetAfterHome: -10, warnings: ['already_ticked_this_week'] }) });
  report = await debug.health();
  assert(report.score < healthyScore, 'warnings decrease score');
  const warningScore = report.score;
  debug = boot({ HG_CiviShop: undefined });
  report = await debug.health();
  assert(report.score < warningScore, 'blockers decrease score more than warnings');

  debug = boot();
  report = await debug.health();
  const printed = await debug.printHealth();
  assert.deepStrictEqual(printed.checks, report.checks, 'printHealth returns health object shape');

  console.log('civication readiness health tests passed');
})().catch((error) => {
  process.stderr.write(String(error && error.stack || error));
  process.exit(1);
});
