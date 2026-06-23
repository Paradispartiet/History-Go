#!/usr/bin/env node
// PR B: DailyMailBuilder + mailDayProgram er autoritativ dagrytme. Når en bygd dag finnes for
// aktiv rolle, skal dayPatches.onAppOpen IKKE generere en parallell fase-event — heller ikke når
// DailyMailBuilder faller gjennom (f.eks. blokkert av en åpen task-gate). Lunch/evening/day_end
// skal komme fra programmet. skipDailyMailBuilder beholder den eldre escape-hatchen.
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

function loadScript(relPath) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, relPath), 'utf8'), { filename: relPath });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function pendingEvent() {
  const inbox = global.CivicationState.getInbox();
  const item = Array.isArray(inbox) ? inbox.find(row => row && row.status === 'pending') : null;
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
  // PR E: skipDailyMailBuilder-grenen delegerer nå til den underliggende motoren, som kan
  // forsøke å hente data. Vi svarer 404 på alt, så delegeringen kjører uten å treffe nett.
  global.fetch = async () => ({ ok: false, status: 404, async json() { return null; } });

  let phase = 'lunch';
  global.CivicationCalendar = {
    DAY_PHASES: ['morning', 'lunch', 'afternoon', 'evening', 'day_end'],
    getPhase: () => phase,
    setPhase: (next) => { phase = next; },
    getPhaseLabel: (p) => String(p || ''),
    getClock: () => ({ dayIndex: 1 }),
    getPhaseModel: () => ({ dayIndex: 1, phase, phaseLabel: phase, dailyFlags: {}, phases: [] }),
    markDailyFlag: () => {},
    getDailySummary: () => null,
    resetForNewDay: () => {},
    advanceByMinutes: () => {}
  };
  global.HG_CapitalMaintenance = { maintain: () => null };
  global.HG_Lifestyle = { addTags: () => null };
  global.CivicationPsyche = {
    getAutonomy: () => 50, updateIntegrity: () => null, updateVisibility: () => null,
    updateEconomicRoom: () => null, updateTrust: () => null, checkBurnout: () => null, processCollapse: () => null
  };

  // Fase-generatorer som dayPatches.onAppOpen ville brukt i den eldre flyten. Vi spionerer for å
  // bekrefte at de IKKE kalles når en bygd dag finnes, men FORTSATT kalles via escape-hatchen.
  const gen = { lunch: 0, evening: 0, dayEnd: 0 };
  global.makeLunchEvent = async (active) => { gen.lunch += 1; return { id: 'legacy_lunch', source: 'Civication', source_type: 'phase', phase_tag: 'lunch', subject: 'Legacy lunsj', situation: [], choices: [{ id: 'A', label: 'A' }] }; };
  global.makeEveningEvent = async () => { gen.evening += 1; return { id: 'legacy_evening', source_type: 'phase', phase_tag: 'evening', choices: [{ id: 'A', label: 'A' }] }; };
  global.makeDayEndEvent = () => { gen.dayEnd += 1; return { id: 'legacy_day_end', source_type: 'phase', phase_tag: 'day_end', choices: [{ id: 'A', label: 'A' }] }; };
  // Morgen-grenen brukes ikke (fase = lunch), men identifikatorene må finnes for IIFE-en.
  global.getNextDayCarryover = () => ({ visibilityBias: 0, processBias: 0, fatigue: 0 });
  global.setNextDayCarryover = () => {};
  global.applyMorningCarryoverEffects = () => {};
  global.getMorningModeFromCarryover = () => null;
  global.applyMorningModeToEvent = (ev) => ev;
  global.appendDayChoiceLog = () => {};
  global.applyPhaseChoiceEffects = () => {};
  global.maybeCreateContactFromChoice = () => {};
  global.saveDailySummaryToWeek = () => {};
  global.finalizeWeekIfNeeded = () => {};

  // dayPatches lastes før DailyMailBuilder (som i Civication.html), så DailyMailBuilder blir den
  // ytterste onAppOpen-wrapperen og dayPatches.onAppOpen er fall-through-grenen.
  loadScript('js/Civication/core/civicationState.js');
  loadScript('js/Civication/core/civicationEventEngine.js');
  loadScript('js/Civication/systems/civicationEventChannels.js');
  loadScript('js/Civication/systems/civicationCareerRoleResolver.js');
  loadScript('js/Civication/systems/day/dayPatches.js');
  loadScript('js/Civication/systems/civicationDailyMailBuilder.js');

  assert.strictEqual(
    typeof global.CivicationDailyMailBuilder.hasBuiltDayForActiveRole,
    'function',
    'DailyMailBuilder should export hasBuiltDayForActiveRole for dayPatches to defer on'
  );

  // Onboarding skal ikke blokkere onAppOpen i denne testen.
  global.CivicationState.getOnboardingState = () => ({ complete: true });

  global.CivicationState.setActivePosition({
    career_id: 'naeringsliv',
    title: 'Controller',
    role_key: 'controller',
    role_id: 'naer_controller'
  });

  // Bygg en "dag" manuelt: en answered task-gate i lunsj (som blokkerer DailyMailBuilder fordi
  // task-en er åpen) etterfulgt av et lunsj-item fra programmet.
  const runtime = {
    version: 1,
    date: todayKey(),
    role_scope: 'controller',
    role_id: 'naer_controller',
    career_id: 'naeringsliv',
    current_index: 1,
    delivered_ids: ['gate_lunch'],
    answered_ids: ['gate_lunch'],
    items: [
      { status: 'answered', phase: 'lunch', slot: 'lunch_gate', event: { id: 'gate_lunch', mail_type: 'task_gate', mail_class: 'daily_workday', phase_tag: 'lunch' } },
      { status: 'queued', phase: 'lunch', slot: 'phase_lunch', event: { id: 'program_lunch_item', mail_type: 'phase', mail_class: 'daily_workday', phase_tag: 'lunch', choices: [{ id: 'A', label: 'A' }] } }
    ]
  };
  global.CivicationState.setState({ mail_day_runtime_v1: runtime });

  // Åpen task på gate-en → DailyMailBuilder.enqueueNext returnerer blocked_by_open_task og faller
  // gjennom til dayPatches.onAppOpen.
  global.CivicationTaskEngine = {
    getTaskByMailId: (id) => (id === 'gate_lunch' ? { id: 'task_lunch', mail_id: 'gate_lunch', status: 'open' } : null),
    listOpenTasks: () => [{ id: 'task_lunch', mail_id: 'gate_lunch', status: 'open' }]
  };

  assert.strictEqual(
    global.CivicationDailyMailBuilder.hasBuiltDayForActiveRole(),
    true,
    'a built runtime for the active role today should be recognised'
  );

  const engine = new global.CivicationEventEngine();
  global.HG_CiviEngine = engine;

  // 1) Normalflyt: DailyMailBuilder blokkert → dayPatches.onAppOpen skal DEFERre, ikke generere.
  const deferred = await engine.onAppOpen({ force: true });
  assert.strictEqual(
    deferred?.reason,
    'deferred_to_daily_mail_builder',
    `dayPatches.onAppOpen should defer to DailyMailBuilder when a day is built (got ${JSON.stringify(deferred)})`
  );
  assert.strictEqual(gen.lunch, 0, 'makeLunchEvent must not run while DailyMailBuilder owns the built day');
  assert.strictEqual(gen.evening, 0, 'makeEveningEvent must not run while DailyMailBuilder owns the built day');
  assert.strictEqual(gen.dayEnd, 0, 'makeDayEndEvent must not run while DailyMailBuilder owns the built day');
  const leaked = pendingEvent();
  assert(
    !leaked || leaked.source_type !== 'phase',
    'no legacy dayPatches phase-event should be enqueued alongside the program'
  );

  // 2) PR E: de gamle fase-genererte onAppOpen-grenene er fjernet. Selv med
  // skipDailyMailBuilder (escape-hatchen forbi PR B-deferren) skal dayPatches.onAppOpen IKKE
  // generere et fase-event lenger — den delegerer til den underliggende motoren, og
  // makeLunchEvent/makeEveningEvent/makeDayEndEvent kalles aldri fra dayPatches.
  await engine.onAppOpen({ force: true, skipDailyMailBuilder: true });
  assert.strictEqual(gen.lunch, 0, 'makeLunchEvent must not run from dayPatches.onAppOpen after PR E');
  assert.strictEqual(gen.evening, 0, 'makeEveningEvent must not run from dayPatches.onAppOpen after PR E');
  assert.strictEqual(gen.dayEnd, 0, 'makeDayEndEvent must not run from dayPatches.onAppOpen after PR E');

  console.log('civication-day-phase-onappopen-defer.test.js passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
