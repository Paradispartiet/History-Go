#!/usr/bin/env node
// Låser "ingen ping-pong"-feilen (PR A): dayPatches.answer skal ikke flytte Calendar-fasen
// for daily-events fra DailyMailBuilder. Når en fase (morgen) har flere items, skal svar på
// første morgen-item IKKE flytte kalenderen til lunsj — fasen følger item.phase (DailyMailBuilder)
// + CivicationDayProgression, og avanserer først når morgen-items i runtime er tomme.
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

function pendingEvent() {
  const inbox = global.CivicationState.getInbox();
  const item = Array.isArray(inbox) ? inbox.find(row => row && row.status === 'pending') : null;
  return item ? (item.event || item) : null;
}

// Komplett mock-kalender med fasemodell + spion på setPhase, slik at vi kan se nøyaktig hvilke
// faseskift som skjer under et svar. setPhase brukes både av dayPatches (det vi vil fjerne for
// daily-events) og av DailyMailBuilder.enqueueNext (legitimt: fase følger item.phase).
function makeCalendar() {
  // Faserekkefølgen må speile dayCalendarBridge (mailDayProgram): 8 faser, ikke 5. Med en utdatert
  // 5-fase-liste tvinges ukjente faser (forenoon/workday/dinner) til 'morning' av setPhase-mocken,
  // og morgen→neste-fase-overgangen ser falskt "fast" ut.
  const DAY_PHASES = ['morning', 'forenoon', 'workday', 'lunch', 'afternoon', 'dinner', 'evening', 'day_end'];
  const LABELS = { morning: 'Morgen', forenoon: 'Formiddag', workday: 'Arbeidsøkt', lunch: 'Lunsj', afternoon: 'Ettermiddag', dinner: 'Middag', evening: 'Kveld', day_end: 'Dagslutt' };
  const setPhaseCalls = [];
  let phase = 'morning';
  let dayIndex = 1;
  let dailyFlags = {};
  let dailySummary = null;

  const cal = {
    DAY_PHASES,
    getPhase: () => phase,
    getPhaseLabel: (p) => LABELS[String(p || '')] || 'Morgen',
    getClock: () => ({ dayIndex }),
    setPhase: (next) => {
      const n = DAY_PHASES.includes(String(next)) ? String(next) : 'morning';
      setPhaseCalls.push(n);
      phase = n;
      return { phase };
    },
    advancePhase: () => {
      const idx = DAY_PHASES.indexOf(phase);
      if (idx === -1) { phase = 'morning'; return; }
      if (idx >= DAY_PHASES.length - 1) { dayIndex += 1; phase = 'morning'; dailyFlags = {}; dailySummary = null; return; }
      phase = DAY_PHASES[idx + 1];
    },
    markDailyFlag: (key, value = true) => { dailyFlags[String(key)] = value; },
    hasDailyFlag: (key) => !!dailyFlags[String(key)],
    setDailySummary: (summary) => { dailySummary = summary || null; },
    getDailySummary: () => dailySummary,
    resetForNewDay: () => { dayIndex += 1; phase = 'morning'; dailyFlags = {}; dailySummary = null; },
    getPhaseModel: () => ({ dayIndex, phase, phaseLabel: LABELS[phase] || 'Morgen', dailyFlags, dailySummary, phases: DAY_PHASES.slice() }),
    advanceByMinutes: () => {},
    setClock: () => {},
    startShiftForJob: () => {}
  };

  return { cal, setPhaseCalls };
}

function runtimeState() {
  return global.CivicationState.getState().mail_day_runtime_v1;
}

function morningRemaining(rt) {
  return (rt?.items || []).filter(row => row.phase === 'morning' && row.status !== 'answered').length;
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

  const calendar = makeCalendar();
  const setPhaseCalls = calendar.setPhaseCalls;
  global.CivicationCalendar = calendar.cal;

  global.HG_CapitalMaintenance = { maintain: () => null };
  global.HG_Lifestyle = { addTags: () => null };
  global.CivicationPsyche = {
    getAutonomy: () => 50,
    updateIntegrity: () => null,
    updateVisibility: () => null,
    updateEconomicRoom: () => null,
    updateTrust: () => null,
    checkBurnout: () => null,
    processCollapse: () => null
  };

  // dayPatches.answer kaller disse som globale hjelpere (definert av andre day*-moduler i nettleseren).
  // Vi stubber dem her og teller dem for å bekrefte at etter-svar-effektene fortsatt kjøres for daily-events.
  const effectCalls = { log: 0, phaseEffects: 0, contact: 0 };
  global.appendDayChoiceLog = () => { effectCalls.log += 1; };
  global.applyPhaseChoiceEffects = () => { effectCalls.phaseEffects += 1; };
  global.maybeCreateContactFromChoice = () => { effectCalls.contact += 1; };
  // Forsvarsstubber for grener som ikke skal kjøre for daily-events (onAppOpen-morgen / non-daily day_end).
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

  // Patch-rekkefølgen speiler Civication.html: dayPatches (294) lastes før DailyMailBuilder (300),
  // så DailyMailBuilder blir den ytterste answer-wrapperen og dayPatches.answer ligger inni kjeden.
  // MailRuntime utelates med vilje: den injiserer consequence-threads som ikke er relevante for
  // dette fokuserte fase-eierskaps-testet, og uten den er hver pending et rent DailyMailBuilder-item.
  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/day/dayChoiceDirector.js');
  loadScript('js/Civication/systems/day/dayConsequences.js');
  loadScript('js/Civication/systems/day/dayPatches.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');
  loadScript('js/Civication/systems/day/dayProgressionController.js');

  // DailyMailBuilder skal eksponere klassifiseringen dayPatches støtter seg på.
  assert.strictEqual(
    typeof global.CivicationDailyMailBuilder.isDailyEvent,
    'function',
    'DailyMailBuilder should export isDailyEvent so dayPatches can recognise daily-events'
  );

  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv',
    title: 'Controller',
    role_key: 'controller',
    role_id: 'naer_controller'
  });

  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;

  // Bygg hele dagen. Controller-morgenen har flere morgen-items (morning_brief, primary_work_mail,
  // operational_mail x2, people_ping), så vi kan reprodusere ping-pong-vinduet.
  const built = await global.CivicationDailyMailBuilder.buildQueue(
    global.CivicationState.getActivePosition(),
    { date: '2026-06-22' }
  );
  global.CivicationState.setState({ mail_day_runtime_v1: built });

  const morningItems = built.items.filter(row => row.phase === 'morning');
  assert(
    morningItems.length >= 2,
    `runtime should contain at least two morning items to exercise the no-ping-pong window (got ${morningItems.length})`
  );

  // Lever første item.
  const opened = await engine.onAppOpen({ force: true });
  assert.strictEqual(opened.enqueued, true, 'opening the app should deliver the first daily item');
  assert.strictEqual(pendingEvent().phase_tag, 'morning', 'first delivered item should be a morning item');

  let morningAnswersWithRemaining = 0;
  let reachedNextPhase = false;
  const phaseAfterMorning = 'forenoon';

  for (let guard = 0; guard < 50; guard += 1) {
    const pending = pendingEvent();
    assert(pending, 'a pending item should be available while the day is not complete');

    if (pending.phase_tag !== 'morning') break;

    // Svar på morgen-item; nullstill fase-spion slik at vi ser kun dette svarets faseskift.
    setPhaseCalls.length = 0;
    const choiceId = pending.choices[0].id;
    const before = { log: effectCalls.log, phaseEffects: effectCalls.phaseEffects, contact: effectCalls.contact };
    const res = await engine.answer(pending.id, choiceId);
    assert.notStrictEqual(res?.ok, false, `answering morning item ${pending.id} should succeed`);

    const rt = runtimeState();
    assert(rt.answered_ids.includes(pending.id), `answer should mark ${pending.id} answered in runtime`);

    // Etter-svar-effektene fra dayPatches.answer skal fortsatt kjøre for daily-events.
    assert(effectCalls.log > before.log, 'appendDayChoiceLog should still run for daily-events');
    assert(effectCalls.phaseEffects > before.phaseEffects, 'applyPhaseChoiceEffects should still run for daily-events');
    assert(effectCalls.contact > before.contact, 'maybeCreateContactFromChoice should still run for daily-events');

    const remaining = morningRemaining(rt);

    if (remaining > 0) {
      // KJERNEINVARIANT: dayPatches skal ikke flytte fasen forbi morning mens morgen-items gjenstår.
      // Det eneste legitime setPhase-kallet her er DailyMailBuilder.enqueueNext som leverer neste
      // morgen-item og setter fase = "morning". Et "lunch"-kall ville vært det gamle dobbeltskiftet.
      assert(
        setPhaseCalls.every(p => p === 'morning'),
        `answering a morning item must not move the calendar past morning while morning items remain (saw setPhase: ${JSON.stringify(setPhaseCalls)})`
      );
      assert.strictEqual(global.CivicationCalendar.getPhase(), 'morning', 'calendar stays in morning while morning items remain');

      const next = pendingEvent();
      assert(next, 'the next morning item should be delivered after answering');
      assert.strictEqual(next.phase_tag, 'morning', 'next delivered item is still morning while morning items remain');

      const prog = global.CivicationDayProgression.inspect();
      assert.strictEqual(prog.phase, 'morning', 'DayProgression should report morning phase');
      assert(prog.openItemsInPhase >= 1, 'DayProgression should see the delivered morning item as open');
      assert.strictEqual(prog.canAdvance, false, 'phase must not be advanceable while a morning item is open');

      morningAnswersWithRemaining += 1;
    } else {
      // Morgen er tom: nå skal fasen følge neste item (formiddag). Dette er DailyMailBuilders ansvar.
      assert.strictEqual(global.CivicationCalendar.getPhase(), phaseAfterMorning, `phase advances to ${phaseAfterMorning} only once all morning items are answered`);
      const next = pendingEvent();
      assert(next && next.phase_tag === phaseAfterMorning, `first ${phaseAfterMorning} item should be delivered after morning is empty`);
      reachedNextPhase = true;
      break;
    }
  }

  assert(
    morningAnswersWithRemaining >= 1,
    'test must answer at least one morning item while other morning items remained (the no-ping-pong window)'
  );
  assert(reachedNextPhase, `flow should progress to ${phaseAfterMorning} once the morning phase is empty`);

  console.log('civication-day-phase-single-owner.test.js passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
