#!/usr/bin/env node
// Wallet economy must follow completed game days, not real calendar Mondays.
// The canonical calendar advances only via the existing day progression flow.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const enginePath = path.resolve(__dirname, '../js/Civication/core/civicationEconomyEngine.js');

function setup({ activeCareer = 'handel', startDay = 1, oldWallet = null, withClock = true } = {}) {
  let dayIndex = startDay;
  let wallet = oldWallet || { balance: 0, last_tick_iso: null };
  let state = {};
  let writes = 0;
  const data = new Map([['merits_by_category', JSON.stringify({ handel: { points: 0 } })]]);
  global.window = global;
  global.localStorage = {
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, String(value))
  };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.dispatchEvent = () => {};
  global.weekKey = () => '2026-W43'; // Never changes, even when two game weeks pass.
  global.deriveTierFromPoints = () => ({ tierIndex: 0 });
  global.CIVI_CAREER_RULES = [{
    global_rules: { unemployment: { nav_after_weeks: 1, nav_weekly_pc: 50 } }
  }];
  global.HG_CAREERS = [{
    career_id: 'handel', economy: {
      salary_by_tier: { '1': 100 }, weekly_expenses: { base: 20, risk_modifier: 1 },
      risk: { layoff_chance_per_week: 0 }
    }, world_logic: { maintenance: { min_quiz_per_weeks: 0 } }
  }];
  global.BADGES = [{ id: 'handel', tiers: [{ threshold: 0, label: 'Start' }] }];
  global.CivicationState = {
    getState: () => state,
    setState: patch => { state = { ...state, ...patch }; return state; },
    getWallet: () => wallet,
    updateWallet: next => { wallet = { ...next }; writes++; },
    getActivePosition: () => activeCareer ? { career_id: activeCareer } : null,
    setActivePosition: () => {}
  };
  if (withClock) global.CivicationCalendar = { getClock: () => ({ dayIndex }) };
  else delete global.CivicationCalendar;
  delete global.CivicationEconomyEngine;
  vm.runInThisContext(fs.readFileSync(enginePath, 'utf8'), { filename: enginePath });
  return {
    tick: () => global.CivicationEconomyEngine.tickWeekly(),
    day: value => { dayIndex = value; },
    wallet: () => wallet,
    state: () => state,
    writes: () => writes,
    snapshot: () => global.CivicationEconomyEngine.getEconomySnapshot()
  };
}

{
  const s = setup();
  s.tick();
  assert.equal(s.wallet().balance, 0, 'first boot must never mint salary');
  assert.equal(s.wallet().last_tick_day_index, 1);
  s.day(7);
  s.tick();
  assert.equal(s.wallet().balance, 0, 'six completed days are not a full week');
  s.day(8);
  assert.equal(s.snapshot().tickStatus.canTickNow, true);
  s.tick();
  assert.equal(s.wallet().balance, 80, 'seven completed days settle one net week');
  assert.equal(s.wallet().last_tick_day_index, 8);
  s.tick();
  assert.equal(s.wallet().balance, 80, 'reload/retry on the same day cannot double-pay');
  s.day(14);
  s.tick();
  assert.equal(s.wallet().balance, 80);
  s.day(15);
  s.tick();
  assert.equal(s.wallet().balance, 160, 'next game week pays once even in the same calendar week');
  assert.equal(s.wallet().last_tick_day_index, 15);
}

{
  const s = setup({ activeCareer: null });
  s.tick();
  assert.equal(s.state().unemployed_since_day_index, 1);
  s.day(8);
  s.tick();
  assert.equal(s.wallet().balance, 50, 'NAV eligibility is measured in played weeks');
  s.tick();
  assert.equal(s.wallet().balance, 50);
  s.day(15);
  s.tick();
  assert.equal(s.wallet().balance, 100);
}

{
  // Existing players may have null after previously working. Treat null as
  // no recorded unemployment start, not as a valid day-zero checkpoint.
  const s = setup({ activeCareer: null });
  s.state().unemployed_since_day_index = null;
  s.tick();
  assert.equal(s.state().unemployed_since_day_index, 1, 'null unemployment start must initialize on day one');
  s.day(8);
  s.tick();
  assert.equal(s.wallet().balance, 50, 'benefits must not be delayed by a null checkpoint');
}

{
  const s = setup({ startDay: 4, oldWallet: { balance: 60, last_tick_iso: '2026-10-01T10:00:00.000Z' } });
  s.tick();
  assert.equal(s.wallet().balance, 60, 'migrating an old wallet must not mint back pay');
  assert.equal(s.wallet().last_tick_day_index, 4);
  s.day(10);
  s.tick();
  assert.equal(s.wallet().balance, 60);
  s.day(11);
  s.tick();
  assert.equal(s.wallet().balance, 140);
}

{
  const s = setup({ withClock: false });
  s.tick();
  assert.equal(s.writes(), 0, 'without an authoritative game day, fail closed');
  assert.equal(s.wallet().balance, 0);
}

console.log('Civication canonical game-week economy regression passed');
