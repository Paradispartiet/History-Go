#!/usr/bin/env node
// PR D: WorkdayPanel eksponerer aktiv fase + dagsbunke per fase nativt via computeWorkdayModel,
// lest fra CivicationDayProgression.inspect() + CivicationDailyMailBuilder.inspect() — uten å
// kalle onAppOpen/enqueue og uten DOM. Erstatter dayPatches.patchUI sin fase-HUD-monkey-patch.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

global.window = global;
global.document = {
  getElementById() { return null; },
  querySelector() { return null; },
  querySelectorAll() { return []; }
};
global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
global.Event = function Event(type) { this.type = type; };
global.addEventListener = function () {};

const repoRoot = path.resolve(__dirname, '..');
function load(rel) { vm.runInThisContext(fs.readFileSync(path.join(repoRoot, rel), 'utf8'), { filename: rel }); }

load('js/Civication/systems/civicationEventChannels.js');
load('js/Civication/ui/CivicationUI.js');

// En dagsbunke med to morgen-items (én besvart, én levert), to lunsj-items (begge køet),
// og ett dagslutt-item. Speiler DailyMailBuilder.inspect().runtime.items.
const runtimeItems = [
  { phase: 'morning', slot: 'morning_brief', status: 'answered', event: { id: 'm1', subject: 'Morgenbrief', phase_tag: 'morning' } },
  { phase: 'morning', slot: 'primary_work_mail', status: 'delivered', event: { id: 'm2', subject: 'Primæroppgave', phase_tag: 'morning' } },
  { phase: 'lunch', slot: 'phase_lunch', status: 'queued', event: { id: 'l1', subject: 'Lunsj', phase_tag: 'lunch' } },
  { phase: 'lunch', slot: 'small_choice', status: 'queued', event: { id: 'l2', subject: 'Liten beslutning', phase_tag: 'lunch' } },
  { phase: 'day_end', slot: 'day_summary', status: 'queued', event: { id: 'd1', subject: 'Dagslutt', phase_tag: 'day_end' } }
];

let onAppOpenCalls = 0;

global.CivicationMailEngine = { getInbox: () => [] };
global.CivicationState = {
  getInbox: () => [],
  getActivePosition: () => ({ title: 'Controller', brand_name: 'Testfirma' }),
  getState: () => ({ career: { progress: {}, contract: {} } })
};
global.CivicationCalendar = {
  getPhase: () => 'morning',
  getPhaseLabel: (p) => ({ morning: 'Morgen', lunch: 'Lunsj', afternoon: 'Ettermiddag', evening: 'Kveld', day_end: 'Dagslutt' }[String(p || '')] || ''),
  getPhaseModel: () => ({ dayIndex: 1, phase: 'morning' }),
  getDisplayModel: () => null
};
// onAppOpen må ALDRI kalles av en read-only modell.
global.HG_CiviEngine = { onAppOpen: () => { onAppOpenCalls += 1; throw new Error('computeWorkdayModel must not call onAppOpen'); } };
global.CivicationDailyMailBuilder = {
  inspect: () => ({ runtime: { items: runtimeItems } })
};
global.CivicationDayProgression = {
  inspect: () => ({
    phase: 'morning',
    phaseLabel: 'Morgen',
    dayIndex: 1,
    openItemsInPhase: 1,
    openItemSubjects: ['Primæroppgave'],
    nextPhase: 'lunch',
    canAdvance: false,
    reason: 'open_items_in_phase'
  })
};

// --- modell ---
const snap = global.HG_CiviWorkdaySnapshot();
assert.strictEqual(onAppOpenCalls, 0, 'computeWorkdayModel must not call onAppOpen');
assert(snap.dayPhase, 'workday model should expose a dayPhase section');

const dp = snap.dayPhase;
assert.strictEqual(dp.hasBundle, true, 'dayPhase should report a built bundle');
assert.strictEqual(dp.phase, 'morning', 'dayPhase phase should follow DayProgression');
assert.strictEqual(dp.dayIndex, 1, 'dayPhase dayIndex from DayProgression');
assert.strictEqual(dp.openItemsInPhase, 1, 'dayPhase openItemsInPhase from DayProgression');
assert.strictEqual(dp.canAdvance, false, 'cannot advance while morning item open');
assert.strictEqual(dp.nextPhase, 'lunch', 'next phase surfaced');

// Dagsbunke gruppert per fase.
const byId = Object.fromEntries(dp.phases.map((p) => [p.id, p]));
assert.strictEqual(byId.morning.total, 2, 'two morning items in the bundle');
assert.strictEqual(byId.morning.answered, 1, 'one morning item answered');
assert.strictEqual(byId.morning.open, 1, 'one morning item still open');
assert.strictEqual(byId.morning.done, false, 'morning not done while an item is open');
assert.strictEqual(byId.lunch.total, 2, 'two lunch items in the bundle');
assert.strictEqual(byId.lunch.open, 2, 'both lunch items open');
assert.strictEqual(byId.day_end.total, 1, 'one day_end item in the bundle');
assert.deepStrictEqual(dp.phases.map((p) => p.id), ['morning', 'lunch', 'afternoon', 'evening', 'day_end'], 'phases kept in day order');
assert.strictEqual(byId.afternoon.total, 0, 'empty phases still represented');

// --- native HTML-seksjon (ren streng, ingen DOM) ---
const html = global.CivicationUI.buildDayPhaseSectionHtml(dp);
assert(html.includes('Dag 1 · Morgen'), 'native section shows day + phase heading');
assert(html.includes('Morgen 1/2'), 'native section shows per-phase progress count');
assert(html.includes('Åpne i fasen: 1'), 'native section shows open items in phase');
assert(html.includes('Primæroppgave'), 'native section lists the open morning item subject');

// Tom bunke → ingen seksjon (ingen krasj).
assert.strictEqual(global.CivicationUI.buildDayPhaseSectionHtml({ hasBundle: false }), '', 'no section without a built bundle');
assert.strictEqual(global.CivicationUI.buildDayPhaseSectionHtml(null), '', 'no section for null model');

// Modellen skal være trygg også uten DayProgression/DailyMailBuilder (defensive read).
delete global.CivicationDayProgression;
delete global.CivicationDailyMailBuilder;
const snap2 = global.HG_CiviWorkdaySnapshot();
assert.strictEqual(snap2.dayPhase.hasBundle, false, 'no bundle when builders are absent');
assert(Array.isArray(snap2.dayPhase.phases) && snap2.dayPhase.phases.length === 5, 'phase scaffold still present');

console.log('civication-workday-panel-phase-model.test.js passed');
