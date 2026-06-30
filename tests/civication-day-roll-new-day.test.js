#!/usr/bin/env node
// Låser dagsløpet ende-til-ende: en hel maildag besvares via motoren (slik NextAction gjør),
// dagen hviler ved day_end (ingen automatisk rullnings), og "Start ny dag"
// (CivicationDayProgression.advancePhaseIfReady) ruller til neste in-game-dag MED en fersk,
// ikke-tom morgenbunke.
//
// Regresjonsvakt for to feil:
//  1) Fasen følger items (enqueueNext setPhase) gjennom alle 8 faser uten å sette seg fast.
//  2) Dagsrullnings i samme kalenderdøgn må tvinge ny buildQueue (runtime er datokeyet via
//     todayKey); uten forceNew gjenbrukes gårsdagens ferdigbesvarte bunke og ny dag blir tom.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function makeStorage() {
  const store = new Map();
  return {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(String(key), String(value)); },
    removeItem(key) { store.delete(key); },
    clear() { store.clear(); }
  };
}

function makeFetch(rootDir) {
  return async function fetchMock(url) {
    const clean = String(url || '').split('?')[0].replace(/^\/+/, '');
    const fullPath = path.resolve(rootDir, clean);
    if (!fullPath.startsWith(rootDir)) return { ok: false, status: 400, async json() { return null; } };
    try {
      const body = await fs.promises.readFile(fullPath, 'utf8');
      return { ok: true, status: 200, async json() { return JSON.parse(body); } };
    } catch {
      return { ok: false, status: 404, async json() { return null; } };
    }
  };
}

function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

// 8-fase-kalender som speiler dayCalendarBridge: advancePhase ruller til ny dag ved day_end.
function makeCalendar() {
  const DAY_PHASES = ['morning', 'forenoon', 'workday', 'lunch', 'afternoon', 'dinner', 'evening', 'day_end'];
  let phase = 'morning';
  let dayIndex = 1;
  let flags = {};
  let summary = null;
  return {
    DAY_PHASES,
    getPhase: () => phase,
    getPhaseLabel: (p) => String(p || ''),
    getClock: () => ({ dayIndex }),
    setPhase: (next) => { phase = DAY_PHASES.includes(String(next)) ? String(next) : 'morning'; return { phase }; },
    advancePhase: () => {
      const idx = DAY_PHASES.indexOf(phase);
      if (idx >= DAY_PHASES.length - 1) { dayIndex += 1; phase = 'morning'; flags = {}; summary = null; return; }
      phase = DAY_PHASES[idx + 1];
    },
    markDailyFlag: (key, value = true) => { flags[String(key)] = value; },
    hasDailyFlag: (key) => !!flags[String(key)],
    setDailySummary: (s) => { summary = s || null; },
    getDailySummary: () => summary,
    resetForNewDay: () => { dayIndex += 1; phase = 'morning'; flags = {}; summary = null; },
    getPhaseModel: () => ({ dayIndex, phase, dailyFlags: flags, dailySummary: summary, phases: DAY_PHASES.slice() }),
    advanceByMinutes: () => {},
    setClock: () => {},
    startShiftForJob: () => {}
  };
}

function pendingEvent() {
  const inbox = global.CivicationState.getInbox();
  const item = Array.isArray(inbox) ? inbox.find((row) => row && row.status === 'pending') : null;
  return item ? (item.event || item) : null;
}

async function run() {
  global.window = global;
  global.localStorage = makeStorage();
  global.location = { href: 'http://localhost/Civication.html' };
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.fetch = makeFetch(repoRoot);

  global.CivicationCalendar = makeCalendar();
  global.HG_CapitalMaintenance = { maintain: () => null };
  global.HG_Lifestyle = { addTags: () => null };
  global.CivicationPsyche = {
    getAutonomy: () => 50, updateIntegrity: () => null, updateVisibility: () => null,
    updateEconomicRoom: () => null, updateTrust: () => null, checkBurnout: () => null, processCollapse: () => null
  };
  global.appendDayChoiceLog = () => {};
  global.applyPhaseChoiceEffects = () => {};
  global.maybeCreateContactFromChoice = () => {};
  global.getNextDayCarryover = () => ({ visibilityBias: 0, processBias: 0, fatigue: 0 });
  global.setNextDayCarryover = () => {};
  global.applyMorningCarryoverEffects = () => {};
  global.getMorningModeFromCarryover = () => null;
  global.applyMorningModeToEvent = (ev) => ev;
  global.makeLunchEvent = async () => ({ id: 'stub_lunch', choices: [{ id: 'A', label: 'A' }] });
  global.makeEveningEvent = async () => ({ id: 'stub_evening', choices: [{ id: 'A', label: 'A' }] });
  global.makeDayEndEvent = () => ({ id: 'stub_day_end', choices: [{ id: 'A', label: 'A' }] });
  global.saveDailySummaryToWeek = () => {};
  global.finalizeWeekIfNeeded = () => {};

  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/day/dayChoiceDirector.js');
  loadScript('js/Civication/systems/day/dayConsequences.js');
  loadScript('js/Civication/systems/day/dayPatches.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');
  loadScript('js/Civication/systems/day/dayProgressionController.js');

  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv', title: 'Controller', role_key: 'controller', role_id: 'naer_controller'
  });

  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;

  const built = await global.CivicationDailyMailBuilder.buildQueue(
    global.CivicationState.getActivePosition(), { date: '2026-06-22' }
  );
  global.CivicationState.setState({ mail_day_runtime_v1: built });

  // Svar på hele dagen item-for-item (samme motorvei som NextAction bruker via answerMail).
  await engine.onAppOpen({ force: true });
  const phasesSeen = new Set();
  for (let guard = 0; guard < 120; guard += 1) {
    const pending = pendingEvent();
    if (!pending) break;
    phasesSeen.add(pending.phase_tag);
    await engine.answer(pending.id, pending.choices[0].id);
  }

  // Hele 8-faseløpet skal være gjennomgått uten å sette seg fast.
  ['morning', 'forenoon', 'workday', 'lunch', 'afternoon', 'dinner', 'evening', 'day_end'].forEach((p) => {
    assert(phasesSeen.has(p), `flow should pass through ${p} (saw: ${[...phasesSeen].join(', ')})`);
  });

  // Dagen hviler ved day_end uten å rulle automatisk videre.
  const atRest = global.CivicationDayProgression.inspect();
  assert.strictEqual(atRest.phase, 'day_end', 'day rests at day_end after everything is answered');
  assert.strictEqual(Number(atRest.openItemsInPhase || 0), 0, 'no open items remain at day_end');
  assert.strictEqual(global.CivicationCalendar.getClock().dayIndex, 1, 'day does NOT auto-roll to a new day');
  assert.strictEqual(pendingEvent(), null, 'nothing pending while the day rests at day_end');

  // "Start ny dag" (NextAction → advancePhaseIfReady) ruller til dag 2 med fersk morgenbunke.
  const rolled = await global.CivicationDayProgression.advancePhaseIfReady();
  assert.strictEqual(rolled.advanced, true, 'advancePhaseIfReady rolls the day at day_end');
  assert.strictEqual(global.CivicationCalendar.getClock().dayIndex, 2, 'new in-game day is day 2');
  assert.strictEqual(global.CivicationCalendar.getPhase(), 'morning', 'new day starts in the morning');

  const fresh = pendingEvent();
  assert(fresh, 'new day must deliver a fresh item (queue rebuilt via forceNew), not an empty/stuck day');
  assert.strictEqual(fresh.phase_tag, 'morning', 'first item of the new day is a morning item');

  const runtime = global.CivicationState.getState().mail_day_runtime_v1;
  const answeredOnFreshDay = (runtime.items || []).filter((row) => row.status === 'answered').length;
  assert.strictEqual(answeredOnFreshDay, 0, 'new day starts with an unanswered queue, not yesterday\'s answered one');

  console.log('civication-day-roll-new-day.test.js passed');
}

run().catch((error) => { console.error(error); process.exit(1); });
