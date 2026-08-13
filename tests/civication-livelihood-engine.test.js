const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

const CATALOG = JSON.parse(fs.readFileSync('data/Civication/livelihoodCatalog.json', 'utf8'));
const RUNTIME = fs.readFileSync('js/Civication/systems/civicationLivelihoodRuntime.js', 'utf8');

function installStorage(seed = {}) {
  const store = { ...seed };
  return {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    dump() { return { ...store }; }
  };
}

function setup({ employed = false, lifeState = null } = {}) {
  global.window = global;
  global.localStorage = installStorage();
  global.Event = function Event(type) { this.type = type; };
  global.dispatchEvent = () => true;
  global.fetch = undefined;
  global.CIVI_LIVELIHOOD_CATALOG = CATALOG;
  global.weekKey = () => '2026-W33';

  let activePosition = employed ? { career_id: 'handel', title: 'Butikkmedarbeider' } : null;
  let wallet = { balance: 100, last_tick_iso: null };
  global.CivicationState = {
    getActivePosition: () => activePosition,
    setActivePosition: (next) => { activePosition = next; },
    getWallet: () => wallet,
    updateWallet: (next) => { wallet = { ...next }; }
  };
  global.CivicationLifePositions = {
    getState: () => lifeState || { primary: null, active_by_badge: {}, history: [] }
  };
  global.CivicationEconomyEngine = {
    tickWeekly() {
      if (wallet.last_tick_iso === '2026-W33') return;
      wallet = { ...wallet, balance: wallet.balance + (activePosition ? 10 : 0), last_tick_iso: '2026-W33' };
    },
    getEconomySnapshot() {
      return { balance: wallet.balance, estimatedNetAfterHome: activePosition ? 10 : 0 };
    }
  };
  delete global.CivicationLivelihoods;
  delete global.HG_CiviEconomySnapshot;
  vm.runInThisContext(RUNTIME, { filename: 'civicationLivelihoodRuntime.js' });
  return {
    api: global.CivicationLivelihoods,
    getWallet: () => wallet,
    getActive: () => activePosition,
    setActive: (next) => { activePosition = next; }
  };
}

assert.strictEqual(CATALOG.schema, 'civication_livelihood_catalog_v1');
assert(CATALOG.kinds.length >= 8, 'catalog has broad livelihood kinds');
assert(CATALOG.principles.some((line) => /aldri.*automatisk/i.test(line)), 'catalog forbids automatic identity income');
assert(CATALOG.kinds.every((kind) => ['one_time', 'recurring'].includes(kind.default_cadence)), 'every livelihood kind has explicit cadence');
assert.strictEqual(CATALOG.kinds.find((kind) => kind.id === 'gig_honorarium').default_cadence, 'one_time', 'a gig is one-time by default');
assert.strictEqual(CATALOG.kinds.find((kind) => kind.id === 'royalty_income').default_cadence, 'recurring', 'royalty can recur');

// Life position alone must never create money or a stream.
let env = setup({ lifeState: { primary: { badge_id: 'litteratur', label: 'Skrivebordspoet' }, active_by_badge: { litteratur: { badge_id: 'litteratur', label: 'Skrivebordspoet' } }, history: [] } });
assert.strictEqual(env.api.getState().streams.length, 0, 'life position alone creates no income stream');
assert.strictEqual(env.api.getSnapshot().current_week_projection.net, 0, 'life position alone projects zero livelihood income');

// Paying opportunities require provenance.
let result = env.api.createOpportunity({
  id: 'bad_no_source',
  kind_id: 'freelance_assignment',
  label: 'Tekstoppdrag',
  income: { model: 'fixed', amount: 7 }
});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'source_provenance_required');

// Costs are separate: income envelopes cannot be negative.
result = env.api.createOpportunity({
  id: 'negative_income',
  kind_id: 'freelance_assignment',
  label: 'Ugyldig negativ inntekt',
  source: { type: 'client', id: 'bad_client', label: 'Feilcase' },
  income: { model: 'fixed', amount: -3 }
});
assert.strictEqual(result.ok, false);
assert.strictEqual(result.reason, 'invalid_income_model');

// An explicit opportunity may require a selected life position, but does not alter employment.
result = env.api.createOpportunity({
  id: 'poesi_tekstoppdrag',
  kind_id: 'freelance_assignment',
  label: 'Kort tekstoppdrag',
  description: 'Skriv en kort introduksjon til en opplesningskveld.',
  source: { type: 'client', id: 'litteraturhuset_event_1', label: 'Litteraturarrangør' },
  income: { model: 'variable', min: 6, max: 12 },
  direct_costs: { fixed: 1, rate: 0.1 },
  requires_life_positions: [{ badge_id: 'litteratur', label: 'Skrivebordspoet' }]
});
assert.strictEqual(result.ok, true);
assert.strictEqual(result.opportunity.cadence, 'one_time', 'freelance assignment is one-time unless concrete opportunity says otherwise');
assert.strictEqual(env.api.acceptOpportunity('poesi_tekstoppdrag').ok, true);
assert.strictEqual(env.api.getState().streams.length, 1, 'accepted opportunity becomes active stream');
assert.strictEqual(env.getActive(), null, 'accepting livelihood opportunity does not create formal job');

const firstProjection = env.api.prepareWeekSettlement('2026-W33');
const secondProjection = env.api.prepareWeekSettlement('2026-W33');
assert.deepStrictEqual(firstProjection.items, secondProjection.items, 'same stream+week is deterministic');
assert(firstProjection.gross >= 6 && firstProjection.gross <= 12, 'variable income remains inside explicit envelope');
assert(firstProjection.costs >= 1, 'direct costs are visible and deducted');

const before = env.getWallet().balance;
let settlement = env.api.settleWeekToWallet('2026-W33');
assert.strictEqual(settlement.ok, true);
assert.strictEqual(settlement.applied, true);
assert.strictEqual(env.getWallet().balance, before + settlement.net, 'livelihood settles into canonical wallet');
assert.strictEqual(env.api.getState().streams[0].status, 'closed', 'one-time assignment closes after its successful settlement');
assert.strictEqual(env.api.getState().streams[0].close_reason, 'one_time_settled');
const afterFirstSettlement = env.getWallet().balance;
settlement = env.api.settleWeekToWallet('2026-W33');
assert.strictEqual(settlement.applied, false, 'same week cannot be paid twice');
assert.strictEqual(env.getWallet().balance, afterFirstSettlement, 'idempotent settlement preserves wallet');

// Employment and livelihood can coexist.
env = setup({ employed: true });
result = env.api.createOpportunity({
  id: 'sideoppdrag_1',
  kind_id: 'gig_honorarium',
  label: 'Kveldsgig',
  source: { type: 'booking', id: 'gig_1', label: 'Lokalt arrangement' },
  income: { model: 'fixed', amount: 5 },
  direct_costs: { fixed: 1 }
});
assert.strictEqual(result.ok, true);
assert.strictEqual(result.opportunity.cadence, 'one_time');
assert.strictEqual(env.api.acceptOpportunity('sideoppdrag_1').ok, true);
const jobBefore = env.getWallet().balance;
global.CivicationEconomyEngine.tickWeekly();
assert.strictEqual(env.getWallet().balance, jobBefore + 10 + 4, 'weekly bridge combines job salary and livelihood net in same wallet');
assert.strictEqual(env.api.getState().streams[0].status, 'closed', 'the gig does not silently become a perpetual weekly salary');
const bridgedBalance = env.getWallet().balance;
global.CivicationEconomyEngine.tickWeekly();
assert.strictEqual(env.getWallet().balance, bridgedBalance, 'second weekly tick cannot duplicate salary or livelihood in test harness');
const economySnapshot = global.CivicationEconomyEngine.getEconomySnapshot();
assert.strictEqual(economySnapshot.weeklyLivelihoodProjectedNet, 4, 'economy snapshot retains this week livelihood result after settlement');
assert.strictEqual(economySnapshot.estimatedNetAfterHome, 14, 'economy snapshot combines formal and livelihood result');

// A zero canonical balance must not fall back to a stale legacy pc alias.
env = setup();
env.getWallet().balance = 0;
env.getWallet().pc = 99;
result = env.api.createOpportunity({
  id: 'zero_balance_job',
  kind_id: 'casual_shift',
  label: 'Én ekstravakt',
  source: { type: 'shift', id: 'shift_1', label: 'Ekstravakt' },
  income: { model: 'fixed', amount: 5 }
});
assert.strictEqual(result.ok, true);
assert.strictEqual(env.api.acceptOpportunity('zero_balance_job').ok, true);
settlement = env.api.settleWeekToWallet('2026-W33');
assert.strictEqual(env.getWallet().balance, 5, 'canonical balance=0 wins over stale pc alias');

// support_payment itself is fail-closed to unemployment; producers cannot forget the flag.
env = setup({ employed: true });
result = env.api.createOpportunity({
  id: 'stottevedtak_1',
  kind_id: 'support_payment',
  label: 'Tidsavgrenset støtte',
  source: { type: 'system_decision', id: 'decision_1', label: 'Innvilget vedtak' },
  income: { model: 'fixed', amount: 9 }
});
assert.strictEqual(result.ok, true);
assert.strictEqual(result.opportunity.requires_unemployed, true, 'support kind enforces unemployment requirement by default');
assert.strictEqual(env.api.acceptOpportunity('stottevedtak_1').ok, false, 'unemployment-only opportunity cannot be accepted while employed');
env.setActive(null);
assert.strictEqual(env.api.acceptOpportunity('stottevedtak_1').ok, true, 'same explicit opportunity becomes eligible when unemployed');
env.setActive({ career_id: 'handel', title: 'Butikkmedarbeider' });
const paused = env.api.prepareWeekSettlement('2026-W33').items[0];
assert.strictEqual(paused.net, 0);
assert.strictEqual(paused.reason, 'paused_while_employed');
assert.strictEqual(env.getActive().career_id, 'handel', 'livelihood never rewrites formal employment');

// Occasional recurring income may be zero in a week, but stays deterministic and auditable.
env = setup();
result = env.api.createOpportunity({
  id: 'royalty_1',
  kind_id: 'royalty_income',
  label: 'Liten royaltyavtale',
  source: { type: 'royalty_contract', id: 'royalty_contract_1', label: 'Utgiver' },
  income: { model: 'occasional', min: 1, max: 8, probability: 0.5 }
});
assert.strictEqual(result.ok, true);
assert.strictEqual(result.opportunity.cadence, 'recurring');
assert.strictEqual(env.api.acceptOpportunity('royalty_1').ok, true);
const royaltyA = env.api.computeStreamWeek(env.api.getState().streams[0], '2026-W33', { employed: false });
const royaltyB = env.api.computeStreamWeek(env.api.getState().streams[0], '2026-W33', { employed: false });
assert.deepStrictEqual(royaltyA, royaltyB, 'occasional income cannot be rerolled by reload');

console.log('civication livelihood engine tests passed');
