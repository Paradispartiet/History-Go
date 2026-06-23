#!/usr/bin/env node
// PR G (#3): makeDayEndEvent skal telle fullførte hovedfaser fra DailyMailBuilder-runtime, ikke
// fra Calendar.dailyFlags (som PR A ikke lenger setter per fase for daily-events). Tidligere viste
// dagslutt ofte "0 av 4 hovedfaser fullført" selv når dagen var spilt.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');
function load(rel) { vm.runInThisContext(fs.readFileSync(path.join(repoRoot, rel), 'utf8'), { filename: rel }); }

global.window = global;
global.localStorage = { getItem() { return null; }, setItem() {}, removeItem() {} };
global.Event = function Event(type) { this.type = type; };
global.dispatchEvent = () => {};

let dailySummary = null;
global.CivicationCalendar = {
  // dayIndex 2 + ikke-controller rolle → vi treffer den generiske day_end-grenen.
  getPhaseModel: () => ({ dayIndex: 2, phase: 'day_end', dailyFlags: {}, dailySummary }),
  setDailySummary: (s) => { dailySummary = s || null; },
  getDailySummary: () => dailySummary
};
global.CivicationState = {
  getState: () => ({ score: 2, stability: 'STABLE' }),
  getActivePosition: () => ({ career_id: 'naeringsliv', title: 'Ekspeditør' })
};

// Runtime der morgen/lunsj/ettermiddag/kveld er ferdig besvart, og dagslutt-item-et leveres nå.
function makeRuntime(workStatuses) {
  const items = [];
  for (const [phase, status] of Object.entries(workStatuses)) {
    items.push({ phase, slot: phase + '_slot', status, event: { id: phase + '_1', phase_tag: phase } });
  }
  items.push({ phase: 'day_end', slot: 'day_summary', status: 'queued', event: { id: 'd1', phase_tag: 'day_end' } });
  return { items };
}

global.CivicationDailyMailBuilder = {
  inspect: () => ({ runtime: makeRuntime({ morning: 'answered', lunch: 'answered', afternoon: 'answered', evening: 'answered' }) })
};

load('js/Civication/systems/day/dayCarryover.js');
load('js/Civication/systems/day/dayEvents.js');

// Alle fire hovedfaser besvart → completedPhases = 4 (dailyFlags er tomme; runtime brukes).
let ev = global.makeDayEndEvent();
assert.strictEqual(ev.day_end_context.completedPhases, 4, 'all four work phases answered should count as 4 completed phases');
assert(ev.situation.join(' ').includes('4 av 4'), `day_end text should reflect 4 of 4 (got: ${ev.situation.join(' ')})`);

// Bare to faser ferdig (ettermiddag/kveld fortsatt åpne) → completedPhases = 2.
global.CivicationDailyMailBuilder.inspect = () => ({
  runtime: makeRuntime({ morning: 'answered', lunch: 'answered', afternoon: 'delivered', evening: 'queued' })
});
ev = global.makeDayEndEvent();
assert.strictEqual(ev.day_end_context.completedPhases, 2, 'two answered work phases should count as 2');

// Ingen runtime → fall tilbake til dailyFlags (legacy). To flagg satt → 2.
global.CivicationDailyMailBuilder.inspect = () => ({ runtime: { items: [] } });
global.CivicationCalendar.getPhaseModel = () => ({ dayIndex: 2, phase: 'day_end', dailyFlags: { morning_done: true, lunch_done: true }, dailySummary });
ev = global.makeDayEndEvent();
assert.strictEqual(ev.day_end_context.completedPhases, 2, 'with no runtime it should fall back to dailyFlags count');

console.log('civication-day-end-completed-phases.test.js passed');
