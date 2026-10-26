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
  let careerId = activeCareer;
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
  }, {
    career_id: 'service', economy: {
      salary_by_tier: { '1': 200 }, weekly_expenses: { base: 30, risk_modifier: 1 },
      risk: { layoff_chance_per_week: 0 }
    }, world_logic: { maintenance: { min_quiz_per_weeks: 0 } }
  }];
  global.BADGES = [
    { id: 'handel', tiers: [{ threshold: 0, label: 'Start' }] },
    { id: 'service', tiers: [{ threshold: 0, label: 'Start' }] }
  ];
  global.CivicationState = {
    getState: () => state,
    setState: patch => { state = { ...state, ...patch }; return state; },
    getWallet: () => wallet,
    updateWallet: next => { wallet = { ...next }; writes++; },
    getActivePosition: () => careerId ? { career_id: careerId } : null,
    setActivePosition: () => {}
  };
  if (withClock) global.CivicationCalendar = { getClock: () => ({ dayIndex }) };
  else delete global.CivicationCalendar;
  delete global.CivicationEconomyEngine;
  vm.runInThisContext(fs.readFileSync(enginePath, 'utf8'), { filename: enginePath });
  return {
    tick: () => global.CivicationEconomyEngine.tickWeekly(),
    recordDay: value => global.CivicationEconomyEngine.recordCompletedDay(value),
    career: value => { careerId = value; },
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
  const s = setup();
  s.tick();
  // Three earned days in Handel, then four in Service (a higher salary).
  // The active job on payout day must not replace earlier earned wages.
  for (let day = 1; day <= 7; day++) {
    if (day === 4) s.career('service');
    s.recordDay(day);
    s.recordDay(day); // Same-day retry cannot record twice.
    s.day(day + 1);
    s.tick();
  }
  assert.equal(s.wallet().balance, 131, 'mixed week must prorate 3/7 of 80 plus 4/7 of 170');
  assert.equal(s.wallet().last_tick_day_index, 8);
  assert.deepEqual(s.wallet().completed_game_days_v1, [], 'settled days cannot be paid again');
  s.tick();
  assert.equal(s.wallet().balance, 131, 'reload cannot double-pay mixed week');
  for (let day = 8; day <= 14; day++) {
    s.recordDay(day);
    s.day(day + 1);
    s.tick();
  }
  assert.equal(s.wallet().balance, 301, 'second complete week uses only the service wage');
}

{
  const s = setup();
  s.tick();
  // Starting a new job halfway through a week must not grant seven wages.
  s.career(null);
  for (let day = 1; day <= 7; day++) {
    if (day === 5) s.career('handel');
    s.recordDay(day);
    s.day(day + 1);
    s.tick();
  }
  assert.equal(s.wallet().balance, 34, 'three days of employment earn only 3/7 of weekly net 80');
}

{
  const s = setup();
  s.tick();
  for (let day = 1; day <= 7; day++) {
    if (day === 4) s.career(null);
    s.recordDay(day);
    s.day(day + 1);
    s.tick();
  }
  assert.equal(s.wallet().balance, 34, 'job loss must retain wages earned before layoff');
  assert.equal(s.state().unemployed_since_day_index, 4, 'unemployment begins on the first jobless day');
}

{
  const s = setup();
  s.tick();
  for (let day = 1; day <= 7; day++) {
    s.recordDay(day);
    s.day(day + 1);
  }
  s.career('unknown-category');
  s.tick();
  assert.equal(s.wallet().balance, 80, 'saved earned wages survive unavailable current career data');
  const restored = setup({ startDay: 8, oldWallet: JSON.parse(JSON.stringify(s.wallet())) });
  restored.tick();
  assert.equal(restored.wallet().balance, 80, 'wallet rehydrate cannot pay an already settled week twice');
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


{
  // One continuous 21-played-day payroll history. The jobs below are explicit
  // economic test fixtures, not fabricated History Go merits or UI offers.
  // A separate organic browser test covers earned merits and job acceptance.
  const s = setup({ activeCareer: null });
  s.tick(); // initialize on game day 1; no retroactive wages
  assert.equal(s.wallet().balance, 0);
  const checkpoints = [];
  for (let completedDay = 1; completedDay <= 21; completedDay++) {
    if (completedDay === 8) s.career('handel');
    if (completedDay === 15) s.career('service');
    s.recordDay(completedDay);
    s.recordDay(completedDay); // duplicated day-complete event must be inert
    const expectedCareer = completedDay <= 7 ? '' : completedDay <= 14 ? 'handel' : 'service';
    assert.equal(s.wallet().completed_game_days_v1.at(-1).careerId, expectedCareer,
      'daily employment snapshot must follow the job held on that actual day');
    // Salary must not arrive partway through a game week.
    const before = s.wallet().balance;
    s.day(completedDay + 1);
    s.tick();
    if (completedDay % 7 !== 0) {
      assert.equal(s.wallet().balance, before,
        'no payment before seven completed game days');
    } else {
      const expected = completedDay === 7 ? 50 : completedDay === 14 ? 130 : 300;
      assert.equal(s.wallet().balance, expected,
        'day ' + completedDay + ' settles only that completed week');
      assert.equal(s.wallet().last_tick_day_index, completedDay + 1);
      assert.deepEqual(s.wallet().completed_game_days_v1, [],
        'settled daily salary records must be cleared');
      checkpoints.push({ completedDay, balance: s.wallet().balance });
    }
    const once = s.wallet().balance;
    s.tick(); // reload / repeated render must not duplicate a settlement
    assert.equal(s.wallet().balance, once, 'weekly tick remains idempotent');
  }
  assert.deepEqual(checkpoints, [
    { completedDay: 7, balance: 50 },  // eligible NAV, zero job salary
    { completedDay: 14, balance: 130 }, // 80 net from seven actual Handel days
    { completedDay: 21, balance: 300 }  // 170 net from seven Service days
  ], 'three consecutive week settlements follow actual earned periods');
  const persisted = JSON.parse(JSON.stringify(s.wallet()));
  const restored = setup({ activeCareer: 'service', startDay: 22, oldWallet: persisted });
  restored.tick();
  assert.equal(restored.wallet().balance, 300,
    'serialized wallet reload must not duplicate the third settlement');
  restored.day(23);
  restored.tick();
  assert.equal(restored.wallet().balance, 300,
    'wall-clock change or reopening on day 23 cannot create an extra payment');
}

console.log('Civication canonical game-week economy regression passed');
