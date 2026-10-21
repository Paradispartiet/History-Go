#!/usr/bin/env node
'use strict';
// Integration gate: authored 21-day private story + the actual game calendar,
// wallet economy, and Civication account backup. The museum job / five completed
// quiz sets are fixtures at the offer boundary; the organic browser test checks
// real quiz -> merits -> offer acceptance separately.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.join(__dirname, '..');
const read = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const source = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const Content = require('../js/Civication/lifestory/lifestoryContent.js');
const State = require('../js/Civication/lifestory/lifestoryState.js');
const Runner = require('../js/Civication/lifestory/lifestoryRunner.js');
const manifest = read(Content.MANIFEST_PATH);
const careerCatalog = read('data/Civication/hg_careers.json');
const roles = read('data/Civication/hg_careers2.json');
const museum = roles.careers.find(c => c.career_id === 'kunst').positions[0];
assert.equal(museum.threshold, 5);
assert.match(museum.title, /museum|galleri/i);
assert.ok(careerCatalog.careers.some(c => c.career_id === 'kunst'));

function storage(seed = {}) {
  const data = new Map(Object.entries(seed));
  return {
    get length() { return data.size; },
    key(i) { return [...data.keys()][i] ?? null; },
    getItem(k) { return data.get(k) ?? null; },
    setItem(k, value) { data.set(k, String(value)); },
    removeItem(k) { data.delete(k); }
  };
}
const json = (store, key, fallback) => JSON.parse(store.getItem(key) || JSON.stringify(fallback));
function environment(store, db) {
  const window = {
    localStorage: store, setInterval() {}, dispatchEvent() {},
    document: { getElementById: () => null, addEventListener() {} },
    HistoryGoAHAAuth: {
      getSession: async () => ({ user: { id: 'journey-player' } }),
      getClient: async () => ({
        from(table) {
          assert.equal(table, 'aha_imports');
          return {
            select() { return this; },
            eq() { return this; },
            async maybeSingle() { return { data: db.record, error: null }; },
            async upsert(row) { db.record = row; db.writes++; return { error: null }; }
          };
        }
      })
    }
  };
  const safeMath = Object.create(Math);
  safeMath.random = () => 1; // Disable random layoff while testing deterministic payroll.
  const context = vm.createContext({
    window, localStorage: store, Math: safeMath, Date, console,
    weekKey: () => '2026-W43', // Wall week fixed across the entire played journey.
    deriveTierFromPoints: () => ({ tierIndex: 0 }),
    Event: class { constructor(type) { this.type = type; } },
    CustomEvent: class { constructor(type, opts) { this.type = type; this.detail = opts?.detail; } },
    clearTimeout() {}, setTimeout() { return 0; }
  });
  window.BADGES = [{ id: 'kunst', tiers: [{ threshold: 5, label: museum.title }] }];
  window.HG_CAREERS = careerCatalog.careers;
  window.CIVI_CAREER_RULES = [{ global_rules: careerCatalog.global_rules }];
  window.CivicationObligationEngine = { getQuizCountLastWeek: () => 1 };
  window.CivicationState = {
    getState: () => json(store, 'hg_civi_state_v1', {}),
    setState(patch) {
      const next = { ...this.getState(), ...patch };
      store.setItem('hg_civi_state_v1', JSON.stringify(next));
      return next;
    },
    getWallet: () => json(store, 'hg_civi_wallet_v1', { balance: 0, last_tick_day_index: 1 }),
    updateWallet(wallet) { store.setItem('hg_civi_wallet_v1', JSON.stringify(wallet)); },
    getActivePosition: () => json(store, 'hg_active_position_v1', null),
    setActivePosition(position) { store.setItem('hg_active_position_v1', JSON.stringify(position)); }
  };
  vm.runInContext(source('js/Civication/core/civicationCalendar.js'), context);
  vm.runInContext(source('js/Civication/core/civicationEconomyEngine.js'), context);
  const loadCloud = () => {
    vm.runInContext(source('js/Civication/core/CivicationCloudSave.js'), context);
    return window.CivicationCloudSave;
  };
  return { window, loadCloud };
}
function published(roleId) {
  const role = manifest.roles[roleId];
  assert.ok(role);
  return Content.buildContent({
    role: read(role.role), roleThreads: read(role.threads),
    roleScenes: read(role.scenes), lifeThreads: read(manifest.life.threads),
    lifeScenes: read(manifest.life.scenes),
    phaseDefinitions: read(manifest.shared.phaseDefinitions)
  });
}

async function run() {
  const priorStore = global.CivicationJsonStore;
  global.CivicationJsonStore = { fetchJson: async p => read(p) };
  try {
    const originalStore = storage({
      hg_civi_wallet_v1: JSON.stringify({ balance: 0, last_tick_day_index: 1 })
    });
    const db = { record: null, writes: 0 };
    const game = environment(originalStore, db);
    const calendar = game.window.CivicationCalendar;
    const money = game.window.CivicationEconomyEngine;
    let content = published('arbeidsledig');
    let state = State.createInitialState(content);
    const economy = [];
    let actions = 0;
    money.tickWeekly(); // Initial boot must not mint benefits or salary.
    assert.equal(money.getEconomySnapshot().balance, 0);

    for (let day = 1; day <= 21; day++) {
      assert.equal(calendar.getClock().dayIndex, day, 'authoritative calendar matches life day');
      assert.equal(state.livsdag, day, 'Life Story clock matches canonical day');

      if (day === 8 || day === 15) {
        money.tickWeekly();
        economy.push({
          checkpoint: day,
          balance: money.getEconomySnapshot().balance,
          lastTick: game.window.CivicationState.getWallet().last_tick_day_index
        });
        money.tickWeekly(); // Reload/duplicate payout attempt.
        assert.equal(money.getEconomySnapshot().balance, economy.at(-1).balance);
      }

      if (day === 8) {
        // Explicit integration boundary: separate organic Playwright test earns
        // these five History Go quiz sets and accepts the same published offer.
        const sets = Object.fromEntries(Array.from({ length: 5 }, (_, i) =>
          ['munch_museet-set-' + (i + 1), { completed: true }]));
        originalStore.setItem('merits_by_category', JSON.stringify({ kunst: { points: 5 } }));
        originalStore.setItem('hg_quiz_sets_v1', JSON.stringify(sets));
        originalStore.setItem('hg_badge_tiers_v1', JSON.stringify({ kunst: 0 }));
        game.window.CivicationState.setActivePosition({
          career_id: 'kunst', role_key: 'kunst_publikum_og_formidling', title: museum.title
        });
        originalStore.setItem('hg_job_history_v1', JSON.stringify([
          { career_id: 'kunst', role_key: 'kunst_publikum_og_formidling', started_day_index: day }
        ]));
        const before = JSON.stringify(state);
        content = await Content.makePersonalOnlyContent(content);
        assert.equal(content.personalOnly, true);
        assert.equal(JSON.stringify(state), before, 'private projection cannot rewrite the actual save');
        assert.equal(state.rolle, 'arbeidsledig', 'formal museum work cannot fabricate a story role');
      }
      let playedToday = 0;
      while (!state.dagFerdig) {
        const scene = Runner.selectNextScene(state, content);
        if (scene) {
          const choices = scene.valg.filter(c => !c.skills_requirement);
          assert.ok(choices.length, 'ordinary authored choice available');
          Runner.applyChoice(state, content, scene.id, choices[0].id);
          playedToday++;
          actions++;
        } else Runner.advance(state, content);
        assert.ok(playedToday < 220, 'story day must terminate');
      }
      assert.ok(playedToday > 0, 'day ' + day + ' must include authored actions');
      assert.equal(state.livsdag, day, 'story cannot skip a game day');
      originalStore.setItem('civication_lifestory_v1', JSON.stringify(state));
      money.recordCompletedDay(day);
      money.recordCompletedDay(day); // No duplicate earned work days.
      if (day < 21) Runner.startNextDay(state, content);
      calendar.advanceByMinutes(24 * 60);
    }

    assert.equal(calendar.getClock().dayIndex, 22);
    money.tickWeekly();
    economy.push({
      checkpoint: 22, balance: money.getEconomySnapshot().balance,
      lastTick: game.window.CivicationState.getWallet().last_tick_day_index
    });
    assert.deepEqual(economy.map(r => r.checkpoint), [8, 15, 22]);
    assert.deepEqual(economy.map(r => r.lastTick), [8, 15, 22],
      'exactly three complete game-week settlements');
    assert.equal(economy[0].balance, 0, 'unemployed week has no museum salary');
    assert.ok(economy[1].balance > 0, 'second week earns real catalog wages');
    assert.ok(economy[2].balance > economy[1].balance, 'third week earns only its own wages');
    assert.equal(json(originalStore, 'hg_civi_wallet_v1', {}).completed_game_days_v1.length, 0,
      'settled daily wage records are cleared');
    money.tickWeekly();
    assert.equal(money.getEconomySnapshot().balance, economy[2].balance,
      'three completed weeks never pay a fourth time on reload');
    assert.equal(state.livsdag, 21);
    assert.ok(state.arkiv.some(row => /^wave_e_life21_d21_/.test(row.sceneId)));
    assert.equal(new Set(state.arkiv.map(x => x.sceneId)).size, state.arkiv.length);
    assert.equal(game.window.CivicationState.getActivePosition().career_id, 'kunst');

    const cloud = game.loadCloud();
    await cloud.ready;
    await cloud.flush();
    assert.equal(db.writes, 1);
    for (const key of ['merits_by_category', 'hg_quiz_sets_v1', 'hg_badge_tiers_v1', 'hg_active_position_v1',
      'hg_job_history_v1', 'hg_civi_calendar_v1', 'hg_civi_wallet_v1',
      'civication_lifestory_v1']) {
      assert.equal(db.record.payload.state[key], originalStore.getItem(key),
        key + ' is part of the full played account backup');
    }
    const secondStore = storage();
    const restored = environment(secondStore, db);
    const restoredCloud = restored.loadCloud();
    await restoredCloud.ready;
    assert.equal(restored.window.CivicationCalendar.getClock().dayIndex, 22);
    assert.equal(json(secondStore, 'civication_lifestory_v1', {}).livsdag, 21);
    assert.equal(json(secondStore, 'hg_active_position_v1', {}).career_id, 'kunst');
    assert.equal(json(secondStore, 'merits_by_category', {}).kunst.points, 5);
    assert.equal(Object.keys(json(secondStore, 'hg_quiz_sets_v1', {})).length, 5);
    assert.equal(json(secondStore, 'hg_badge_tiers_v1', {}).kunst, 0);
    assert.equal(json(secondStore, 'hg_job_history_v1', []).length, 1);
    assert.equal(restored.window.CivicationEconomyEngine.getEconomySnapshot().balance,
      economy[2].balance);
    restored.window.CivicationEconomyEngine.tickWeekly();
    await restoredCloud.flush();
    assert.equal(db.writes, 1, 'new device neither duplicates pay nor rewrites unchanged backup');
    console.log('PASS: ' + actions + ' authored choices across 21 played days, three game-week checkpoints, museum payroll and fresh-device account restoration');
  } finally {
    if (priorStore === undefined) delete global.CivicationJsonStore;
    else global.CivicationJsonStore = priorStore;
  }
}
run().catch(error => { console.error(error); process.exitCode = 1; });
