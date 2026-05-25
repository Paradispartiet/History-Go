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

  global.CivicationCalendar = {
    DAY_PHASES,
    getPhase: () => phase,
    getPhaseLabel: (p) => String(p || ''),
    getClock: () => ({ dayIndex }),
    advancePhase: () => {
      if (phase === 'day_end') {
        dayIndex += 1;
        phase = 'morning';
        return;
      }
      const idx = DAY_PHASES.indexOf(phase);
      phase = DAY_PHASES[idx + 1] || phase;
    }
  };

  global.CivicationDailyMailBuilder = {
    inspect: () => ({ runtime: { items: [] } })
  };

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

  console.log('civication day progression day_end rollover ok');
}

run();
