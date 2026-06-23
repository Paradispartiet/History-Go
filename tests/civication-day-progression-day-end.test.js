#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const source = fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  vm.runInThisContext(source, { filename: relPath });
}

function setup() {
  global.window = global;
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.dispatchEvent = () => {};

  let phase = 'day_end';
  let dayIndex = 7;
  const DAY_PHASES = ['morning', 'lunch', 'afternoon', 'evening', 'day_end'];

  // PR F: ved day_end-rullnings skal dagens summary ferdigstilles til uken. advancePhase ved
  // day_end nullstiller dagen og fjerner dailySummary, så DayProgression må lese den FØR.
  let dailySummary = { dayIndex: 7, completedPhases: 4, score: 2, quality: 'sterk', choiceLog: [] };

  global.CivicationCalendar = {
    DAY_PHASES,
    getPhase: () => phase,
    getPhaseLabel: (p) => String(p || ''),
    getClock: () => ({ dayIndex }),
    getDailySummary: () => dailySummary,
    advancePhase: () => {
      if (phase === 'day_end') {
        dayIndex += 1;
        phase = 'morning';
        dailySummary = null;
        return;
      }
      const idx = DAY_PHASES.indexOf(phase);
      phase = DAY_PHASES[idx + 1] || phase;
    }
  };

  global.CivicationDailyMailBuilder = {
    inspect: () => ({ runtime: { items: [] } })
  };

  global.CivicationState = {
    getActivePosition: () => ({ career_id: 'naeringsliv' })
  };

  // Spioner på ukesavslutningen.
  global.__weekly = { savedSummaries: [], finalizeCareerIds: [] };
  global.saveDailySummaryToWeek = (summary) => { global.__weekly.savedSummaries.push(summary); return summary; };
  global.finalizeWeekIfNeeded = (careerId) => { global.__weekly.finalizeCareerIds.push(careerId); return null; };

  loadScript('js/Civication/systems/day/dayProgressionController.js');
}

async function run() {
  setup();

  const before = global.CivicationDayProgression.inspect();
  assert.strictEqual(before.phase, 'day_end');
  assert.strictEqual(before.reason, 'at_last_phase');
  assert.strictEqual(before.canAdvance, false);

  const result = await global.CivicationDayProgression.advancePhaseIfReady();
  assert.strictEqual(result.advanced, true, 'day_end should allow advancing into next day');
  assert.strictEqual(result.fromPhase, 'day_end');
  assert.strictEqual(result.toPhase, 'morning');

  const after = global.CivicationDayProgression.inspect();
  assert.strictEqual(after.phase, 'morning');
  assert.strictEqual(after.dayIndex, 8);

  // PR F: rullnings fra day_end skal ha ferdigstilt ukesoppsummeringen FØR dagen ble nullstilt.
  assert.strictEqual(global.__weekly.savedSummaries.length, 1, 'day_end rollover should save the daily summary to the week');
  assert.strictEqual(global.__weekly.savedSummaries[0]?.dayIndex, 7, 'the captured summary should be the day_end day (before reset)');
  assert.strictEqual(global.__weekly.savedSummaries[0]?.quality, 'sterk', 'the full summary should be passed to the week');
  assert.deepStrictEqual(global.__weekly.finalizeCareerIds, ['naeringsliv'], 'day_end rollover should finalize the week for the active career');

  console.log('civication day progression day_end rollover ok');
}

run();
