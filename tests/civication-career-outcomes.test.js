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

function makePlan() {
  return {
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
        add_branch_flags: ['career_stagnated', 'evening_pressure', 'morning_choices_expand']
      }
    }
  };
}

function makeActive() {
  return {
    career_id: 'naeringsliv',
    role_id: 'naer_test',
    role_key: 'testrolle',
    title: 'Testrolle'
  };
}

async function run() {
  const plan = makePlan();
  const active = makeActive();
  let state = {};
  let activePosition = active;
  let autonomy = 60;

  global.window = global;
  global.document = {
    readyState: 'complete',
    addEventListener() {}
  };
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

  class CivicationEventEngine {
    constructor(pending) { this.pending = pending; }
    getPendingEvent() { return this.pending; }
    async answer() { return { ok: true, feedback: 'answered' }; }
    async buildMailPool() { return { mails: [{ id: 'legacy_mail', source_type: 'legacy_pack' }] }; }
  }
  global.CivicationEventEngine = CivicationEventEngine;

  global.CivicationMailRuntime = {
    getPlanPath() { return 'data/Civication/mailPlans/naeringsliv/test_plan.json'; },
    async loadJson() { return plan; },
    async makeCandidateMailsForActiveRole() { return [{ id: 'planned_mail', source_type: 'planned' }]; },
    async debugCandidates() { return []; },
    inspect() { return {}; }
  };

  loadScript('js/Civication/systems/civicationCareerOutcomeRuntime.js');

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

  state = { mail_runtime_v1: makeRuntime(3), score: 1, strikes: 0, warning_used: false, stability: 'STABLE' };
  const terminal = await global.CivicationCareerOutcomeRuntime.getTerminalPlanState(active, state);
  assert.strictEqual(terminal.done, true, 'Complete mailPlan should be terminal');
  assert.strictEqual(terminal.closed, false, 'Fresh terminal mailPlan should not be closed');
  assert.strictEqual(terminal.mail.source_type, 'role_outcome', 'Terminal mail should use role_outcome source_type');
  assert.strictEqual(terminal.mail.mail_type, 'job_outcome', 'Terminal mail should use job_outcome mail_type');
  assert.strictEqual(terminal.mail.mail_class, 'career_outcome', 'Terminal mail should use career_outcome mail_class');
  assert.strictEqual(terminal.mail.career_outcome_meta.status, 'STAGNATED', 'Terminal outcome should expose one supported terminal state');

  state = {
    mail_runtime_v1: makeRuntime(3),
    career_outcome_state: {
      status: 'STAGNATED',
      role_plan_id: 'test_plan_v1'
    }
  };
  const closed = await global.CivicationCareerOutcomeRuntime.getTerminalPlanState(active, state);
  assert.strictEqual(closed.done, true, 'Closed terminal mailPlan should stay done');
  assert.strictEqual(closed.closed, true, 'Closed terminal mailPlan should suppress further candidates');
  assert.strictEqual(closed.mail, null, 'Closed terminal mailPlan must not emit another outcome mail');

  state = {};
  autonomy = 60;
  global.CivicationCareerOutcomeRuntime.applyOutcomeState({
    id: 'stagnated_outcome',
    source_type: 'role_outcome',
    mail_class: 'career_outcome',
    career_outcome_meta: terminal.mail.career_outcome_meta
  });
  assert.strictEqual(state.career_outcome_state.status, 'STAGNATED', 'Stagnation should persist career_outcome_state');
  assert(state.mail_branch_state.flags.includes('career_stagnated'), 'Stagnation should add career_stagnated flag');
  assert(state.mail_branch_state.flags.includes('evening_pressure'), 'Stagnation should add evening_pressure flag');
  assert(state.mail_branch_state.flags.includes('morning_choices_expand'), 'Stagnation should add morning_choices_expand flag');
  assert.strictEqual(autonomy, 49, 'Stagnation should lower autonomy when CivicationPsyche supports overrides');

  state = {};
  activePosition = active;
  global.CivicationCareerOutcomeRuntime.applyOutcomeState({
    id: 'fired_outcome',
    source_type: 'role_outcome',
    mail_class: 'career_outcome',
    career_outcome_meta: {
      status: 'FIRED',
      outcome: 'fired',
      role_scope: 'testrolle',
      role_plan_id: 'test_plan_v1',
      decided_at: '2026-06-03T00:00:00.000Z'
    }
  });
  assert.strictEqual(state.career_outcome_state.status, 'FIRED', 'Fired outcome should persist career_outcome_state');
  assert.strictEqual(state.career.activeJob, null, 'Fired outcome should end active job');
  assert.strictEqual(activePosition, null, 'Fired outcome should clear active position');

  state = {};
  activePosition = active;
  global.CivicationCareerOutcomeRuntime.applyOutcomeState({
    id: 'promoted_outcome',
    source_type: 'role_outcome',
    mail_class: 'career_outcome',
    career_outcome_meta: {
      status: 'PROMOTED',
      outcome: 'promoted',
      role_scope: 'testrolle',
      role_plan_id: 'test_plan_v1',
      decided_at: '2026-06-03T00:00:00.000Z'
    }
  });
  assert.strictEqual(state.career_outcome_state.status, 'PROMOTED', 'Promoted outcome should persist career_outcome_state');
  assert.strictEqual(state.career.promotion_ready, true, 'Promoted outcome should set promotion_ready');

  state = {};
  const outcomeEvent = {
    id: 'answer_outcome',
    source_type: 'role_outcome',
    mail_type: 'job_outcome',
    mail_class: 'career_outcome',
    choices: [{ id: 'A' }],
    career_outcome_meta: {
      status: 'PROMOTED',
      outcome: 'promoted',
      role_scope: 'testrolle',
      role_plan_id: 'test_plan_v1',
      decided_at: '2026-06-03T00:00:00.000Z'
    }
  };
  await new global.CivicationEventEngine({ status: 'pending', event: outcomeEvent }).answer('answer_outcome', 'A');
  assert.strictEqual(state.career_outcome_state.status, 'PROMOTED', 'Answer-flow should apply career outcome state');

  state = {};
  const personalEvent = {
    id: 'personal_001',
    source_type: 'life',
    mail_type: 'personal',
    mail_class: 'private_message',
    choices: [{ id: 'A' }],
    career_outcome_meta: {
      status: 'FIRED',
      outcome: 'fired',
      role_scope: 'testrolle',
      role_plan_id: 'test_plan_v1'
    }
  };
  await new global.CivicationEventEngine({ status: 'pending', event: personalEvent }).answer('personal_001', 'A');
  assert.strictEqual(state.career_outcome_state, undefined, 'Personal messages must not receive career outcome handling');

  console.log('PASS: Civication career outcome tests completed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
