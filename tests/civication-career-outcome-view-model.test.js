#!/usr/bin/env node
// tests/civication-career-outcome-view-model.test.js
//
// Tests the pure, DOM-free outcome view model used by the day-phase UI to make
// career outcome consequences visible. No DOM is involved: we load the runtime
// module headless and exercise getOutcomeViewModel directly, plus one end-to-end
// check that a STAGNATED outcome still sets the branch flags and that the view
// model reflects them.

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const code = fs.readFileSync(path.join(repoRoot, relPath), 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function run() {
  let state = {};
  let activePosition = { career_id: 'naeringsliv' };
  let autonomy = 60;

  global.window = global;
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.weekKey = () => '2026-W23';

  global.CivicationState = {
    getState() { return state; },
    setState(patch) { state = { ...state, ...patch }; return patch; },
    getActivePosition() { return activePosition; },
    setActivePosition(next) { activePosition = next; },
    appendJobHistoryEnded(job, reason) { state.job_history_ended = { job, reason }; }
  };

  global.CivicationPsyche = {
    getAutonomy() { return autonomy; },
    setAutonomyOverride(next) { autonomy = next; },
    registerCollapse(careerId, reason) { state.psyche_collapse = { careerId, reason }; }
  };

  global.CivicationMailRuntime = {
    getPlanPath() { return ''; },
    async loadJson() { return null; },
    async makeCandidateMailsForActiveRole() { return []; },
    async debugCandidates() { return []; },
    inspect() { return {}; }
  };

  loadScript('js/Civication/systems/civicationCareerOutcomeRuntime.js');
  const Runtime = global.CivicationCareerOutcomeRuntime;
  const vmOf = Runtime.getOutcomeViewModel;
  assert.strictEqual(typeof vmOf, 'function', 'getOutcomeViewModel must be exported');

  // --- Tolerates empty / partial / malformed state without throwing. ----------
  for (const empty of [undefined, null, {}, { mail_branch_state: null }, { career_outcome_state: 'oops' }]) {
    const v = vmOf(empty);
    assert.strictEqual(v.hasOutcome, false, 'empty state has no outcome');
    assert.strictEqual(v.hasAnything, false, 'empty state has nothing to show');
    assert.deepStrictEqual(v.indicators, [], 'empty state has no indicators');
    assert.strictEqual(v.stagnated, false, 'empty state is not stagnated');
    assert.strictEqual(v.eveningPressure, false, 'empty state has no evening pressure');
    assert.strictEqual(v.morningChoicesExpand, false, 'empty state has no morning expansion');
    assert.strictEqual(v.statusLabel, '', 'empty state has no status label');
  }

  // --- Short status labels for each terminal status. --------------------------
  const promoted = vmOf({ career_outcome_state: { status: 'PROMOTED' } });
  assert.strictEqual(promoted.status, 'PROMOTED');
  assert.strictEqual(promoted.statusLabel, 'Forfremmelse klar', 'PROMOTED short label');
  assert.strictEqual(promoted.hasOutcome, true);
  assert.strictEqual(promoted.indicators[0].kind, 'promoted');

  const fired = vmOf({ career_outcome_state: { status: 'FIRED' } });
  assert.strictEqual(fired.statusLabel, 'Arbeidsforhold avsluttet', 'FIRED short label');
  assert.strictEqual(fired.indicators[0].kind, 'fired');

  const stagnatedStatus = vmOf({ career_outcome_state: { status: 'STAGNATED' } });
  assert.strictEqual(
    stagnatedStatus.statusLabel,
    'Stagnasjon: mindre autonomi, mer press',
    'STAGNATED short label'
  );

  // Non-terminal / unknown status produces no outcome banner.
  const active = vmOf({ career_outcome_state: { status: 'ACTIVE' } });
  assert.strictEqual(active.hasOutcome, false, 'ACTIVE is not a terminal outcome');
  assert.strictEqual(active.statusLabel, '', 'ACTIVE has no status label');

  // --- Reads the three stagnation branch flags independently of status. -------
  const flagged = vmOf({
    mail_branch_state: {
      flags: ['career_stagnated', 'evening_pressure', 'morning_choices_expand', 'unrelated_flag']
    }
  });
  assert.strictEqual(flagged.stagnated, true, 'reads career_stagnated');
  assert.strictEqual(flagged.eveningPressure, true, 'reads evening_pressure');
  assert.strictEqual(flagged.morningChoicesExpand, true, 'reads morning_choices_expand');
  assert.strictEqual(flagged.hasOutcome, false, 'flags alone do not imply a terminal outcome');
  assert.strictEqual(flagged.hasAnything, true, 'flags alone are still worth showing');

  const kinds = flagged.indicators.map(function (i) { return i.kind; });
  assert(kinds.includes('stagnated'), 'stagnation indicator present');
  assert(kinds.includes('evening_pressure'), 'evening pressure indicator present');
  assert(kinds.includes('morning_choices_expand'), 'morning expansion indicator present');
  flagged.indicators.forEach(function (i) {
    assert(i.label && i.text, 'every indicator has a label and text');
  });

  // Partial flags: only evening_pressure set.
  const onlyEvening = vmOf({ mail_branch_state: { flags: ['evening_pressure'] } });
  assert.strictEqual(onlyEvening.eveningPressure, true);
  assert.strictEqual(onlyEvening.stagnated, false);
  assert.strictEqual(onlyEvening.morningChoicesExpand, false);
  assert.strictEqual(onlyEvening.indicators.length, 1, 'only one indicator for a single flag');

  // --- End-to-end: STAGNATED applyOutcomeState still sets flags, and the view
  //     model reflects them (ties runtime consequences to the UI surface). -----
  state = {};
  autonomy = 60;
  const meta = {
    status: 'STAGNATED',
    outcome: 'stagnated',
    role_scope: 'arbeider',
    role_plan_id: 'arbeider_naeringsliv_v2',
    applied_rules: {
      stagnated: {
        autonomy_delta: -12,
        stability: 'STAGNATED',
        add_branch_flags: ['career_stagnated', 'evening_pressure', 'morning_choices_expand']
      }
    },
    decided_at: '2026-06-03T00:00:00.000Z'
  };
  Runtime.applyOutcomeState({
    id: 'arbeider_stagnated_outcome',
    source_type: 'role_outcome',
    mail_class: 'career_outcome',
    career_outcome_meta: meta
  });

  assert(state.mail_branch_state.flags.includes('career_stagnated'), 'STAGNATED still sets career_stagnated');
  assert(state.mail_branch_state.flags.includes('evening_pressure'), 'STAGNATED still sets evening_pressure');
  assert(state.mail_branch_state.flags.includes('morning_choices_expand'), 'STAGNATED still sets morning_choices_expand');
  assert.strictEqual(state.career_outcome_state.status, 'STAGNATED', 'STAGNATED persists outcome state');

  const live = vmOf(state);
  assert.strictEqual(live.status, 'STAGNATED', 'view model reflects persisted STAGNATED status');
  assert.strictEqual(live.stagnated, true, 'view model reflects stagnation flag from real outcome');
  assert.strictEqual(live.eveningPressure, true, 'view model reflects evening pressure from real outcome');
  assert.strictEqual(live.morningChoicesExpand, true, 'view model reflects morning expansion from real outcome');
  assert(live.indicators.length >= 4, 'real STAGNATED outcome surfaces status + three flag indicators');

  console.log('PASS: Civication career outcome view-model tests completed.');
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
