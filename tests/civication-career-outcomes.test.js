#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const repoRoot = path.resolve(__dirname, '..');

function loadScript(relPath) {
  const fullPath = path.join(repoRoot, relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  vm.runInThisContext(code, { filename: relPath });
}

function makeRuntime(plannedCount) {
  return {
    role_plan_id: 'test_plan_v1',
    step_index: 3,
    history: Array.from({ length: plannedCount }, (_row, index) => ({
      id: `planned_${index + 1}`,
      source_type: 'planned',
      choice_id: 'A'
    }))
  };
}

function run() {
  global.window = global;
  global.document = {
    readyState: 'complete',
    addEventListener() {}
  };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.Event = class Event { constructor(type) { this.type = type; } };

  global.CivicationState = {
    getState() { return {}; },
    setState(patch) { return patch; },
    getActivePosition() { return null; }
  };

  loadScript('js/Civication/systems/civicationCareerOutcomeRuntime.js');

  const plan = {
    id: 'test_plan_v1',
    sequence: [
      { step: 1, type: 'job' },
      { step: 2, type: 'conflict' },
      { step: 3, type: 'story', phase: 'climax' }
    ],
    outcome_rules: {
      fired: {
        stability_values: ['FIRED'],
        strikes_gte: 2,
        score_lte: -2
      },
      promoted: {
        completion_ratio_gte: 1,
        score_gte: 4,
        strikes_lte: 0,
        allow_warning: false
      },
      stagnated: {
        autonomy_delta: -11,
        add_branch_flags: ['career_stagnated', 'evening_pressure']
      }
    }
  };

  const active = {
    career_id: 'naeringsliv',
    role_id: 'naer_test',
    role_key: 'testrolle',
    title: 'Testrolle'
  };

  const promoted = global.CivicationCareerOutcomeRuntime.decideOutcome(
    active,
    plan,
    makeRuntime(3),
    { score: 4, strikes: 0, warning_used: false, stability: 'STABLE' }
  );
  assert.strictEqual(promoted.status, 'PROMOTED', 'Complete plan with enough score and no strikes should promote');

  const stagnatedByLowScore = global.CivicationCareerOutcomeRuntime.decideOutcome(
    active,
    plan,
    makeRuntime(3),
    { score: 1, strikes: 0, warning_used: false, stability: 'STABLE' }
  );
  assert.strictEqual(stagnatedByLowScore.status, 'STAGNATED', 'Complete plan with weak score should stagnate');

  const stagnatedByWarning = global.CivicationCareerOutcomeRuntime.decideOutcome(
    active,
    plan,
    makeRuntime(3),
    { score: 4, strikes: 0, warning_used: true, stability: 'STABLE' }
  );
  assert.strictEqual(stagnatedByWarning.status, 'STAGNATED', 'Warning should block promotion when allow_warning is false');

  const firedByStrikes = global.CivicationCareerOutcomeRuntime.decideOutcome(
    active,
    plan,
    makeRuntime(3),
    { score: 5, strikes: 2, warning_used: false, stability: 'STABLE' }
  );
  assert.strictEqual(firedByStrikes.status, 'FIRED', 'Plan fired.strikes_gte should trigger fired outcome');

  const firedByScore = global.CivicationCareerOutcomeRuntime.decideOutcome(
    active,
    plan,
    makeRuntime(3),
    { score: -2, strikes: 0, warning_used: false, stability: 'STABLE' }
  );
  assert.strictEqual(firedByScore.status, 'FIRED', 'Plan fired.score_lte should trigger fired outcome');

  assert.strictEqual(
    global.CivicationCareerOutcomeRuntime.getOutcomeRules(plan).stagnated.autonomy_delta,
    -11,
    'Plan stagnation rules should override default autonomy delta'
  );

  console.log('PASS: Civication career outcome tests completed.');
}

run();
