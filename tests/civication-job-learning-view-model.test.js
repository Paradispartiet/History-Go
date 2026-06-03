#!/usr/bin/env node
// tests/civication-job-learning-view-model.test.js
//
// Tests the pure, DOM-free JOB LEARNING view model. Job learning ("what the player
// actually learned from the job") is deliberately separate from career outcome
// ("what happens to the employment": PROMOTED / STAGNATED / FIRED). These tests pin
// that separation: PROMOTED does not imply mastery, "utlært" can be shown with no
// career outcome at all, and STAGNATED maps to low learning / routine rather than to
// merely "the same job".

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
  let activePosition = null;

  global.window = global;
  global.document = { readyState: 'complete', addEventListener() {} };
  global.addEventListener = () => {};
  global.dispatchEvent = () => {};
  global.Event = class Event { constructor(type) { this.type = type; } };

  global.CivicationState = {
    getState() { return state; },
    setState(patch) { state = { ...state, ...patch }; return patch; },
    getActivePosition() { return activePosition; }
  };

  loadScript('js/Civication/systems/civicationJobLearningRuntime.js');
  const Runtime = global.CivicationJobLearningRuntime;
  const vmOf = Runtime.getJobLearningViewModel;
  assert.strictEqual(typeof vmOf, 'function', 'getJobLearningViewModel must be exported');

  const threshold = Runtime.DEFAULT_MASTERY_THRESHOLD;
  assert(Number.isFinite(threshold) && threshold >= 1, 'default mastery threshold is a positive number');

  const active = { career_id: 'naeringsliv', role_id: 'naer_test', role_key: 'testrolle', title: 'Testrolle' };

  // --- Tolerates empty / partial / malformed state and missing active position. ----
  for (const empty of [undefined, null, {}, { mail_plan_progress: null }, { career_outcome_state: 'oops' }]) {
    const v = vmOf(empty, null);
    assert.strictEqual(v.hasLearningState, false, 'no active role => no learning state');
    assert.strictEqual(v.learningLabel, '', 'no learning state => no label');
    assert.deepStrictEqual(v.indicators, [], 'no learning state => no indicators');
    assert.strictEqual(v.jobMastered, false, 'no learning state => not mastered');
  }
  // Malformed active position must not throw either.
  assert.doesNotThrow(() => vmOf({}, { role_key: 123 }), 'malformed active is tolerated');

  // --- Fresh active role with no steps: still learning, more to teach (positive). ---
  const fresh = vmOf({}, active);
  assert.strictEqual(fresh.hasLearningState, true, 'active role => learning state exists');
  assert.strictEqual(fresh.learningStatus, 'still_learning', 'fresh role is still learning');
  assert.strictEqual(fresh.learningLabel, 'Jobben lærer deg fortsatt noe', 'positive still-learning label');
  assert.strictEqual(fresh.jobMastered, false, 'fresh role is not mastered');
  assert.strictEqual(fresh.jobHasMoreToTeach, true, 'fresh role still has more to teach');
  assert.strictEqual(fresh.indicators.length, 1, 'one learning indicator');
  assert(fresh.indicators[0].label.startsWith('Læring:'), 'indicator label is prefixed with Læring:');

  // --- Staying in a job that still teaches is NOT framed as negative. --------------
  const midway = vmOf({ mail_plan_progress: { step_index: 2 } }, active);
  assert.strictEqual(midway.learningStatus, 'still_learning', 'midway role is still learning, not stagnation');
  assert.strictEqual(midway.jobHasMoreToTeach, true, 'staying can still be worth it');

  // --- Nearing mastery just below the threshold. -----------------------------------
  const nearingSteps = Math.max(1, Math.ceil(threshold * 0.6));
  const nearing = vmOf({ mail_plan_progress: { step_index: nearingSteps } }, active);
  assert.strictEqual(nearing.learningStatus, 'nearing_mastery', 'nearing the threshold reads as nearing mastery');
  assert.strictEqual(nearing.learningLabel, 'Du begynner å bli utlært');
  assert.strictEqual(nearing.jobMastered, false, 'nearing is not yet mastered');

  // --- "Utlært" can be shown independent of career_outcome_state. ------------------
  const masteredNoOutcome = vmOf({ mail_plan_progress: { step_index: threshold } }, active);
  assert.strictEqual(masteredNoOutcome.jobMastered, true, 'reaching threshold means mastered');
  assert.strictEqual(masteredNoOutcome.learningStatus, 'mastered', 'mastered status with no career outcome');
  assert.strictEqual(masteredNoOutcome.learningLabel, 'Utlært i rollen', 'utlært label');
  assert.strictEqual(masteredNoOutcome.jobHasMoreToTeach, false, 'mastered role has nothing more to teach');

  // Same mastery, but career_outcome_state is ACTIVE / empty: learning is unchanged.
  const masteredActiveOutcome = vmOf(
    { mail_plan_progress: { step_index: threshold }, career_outcome_state: { status: 'ACTIVE' } },
    active
  );
  assert.strictEqual(masteredActiveOutcome.jobMastered, true, 'mastery is independent of career outcome state');
  assert.strictEqual(masteredActiveOutcome.learningStatus, 'mastered');

  // --- PROMOTED does NOT automatically mean jobMastered. ---------------------------
  const promotedEarly = vmOf(
    { mail_plan_progress: { step_index: 1 }, career_outcome_state: { status: 'PROMOTED' } },
    active
  );
  assert.strictEqual(promotedEarly.jobMastered, false, 'PROMOTED with few steps is NOT mastered');
  assert.strictEqual(promotedEarly.learningStatus, 'still_learning', 'PROMOTED can coexist with still learning');
  assert.strictEqual(promotedEarly.jobHasMoreToTeach, true, 'a promoted player may still have more to learn');

  // --- STAGNATED maps to low learning / routine, not merely "the same job". --------
  // Mastered (no useful learning left) + stagnation flag => routine without development.
  const routine = vmOf(
    {
      mail_plan_progress: { step_index: threshold },
      career_outcome_state: { status: 'STAGNATED' },
      mail_branch_state: { flags: ['career_stagnated', 'evening_pressure'] }
    },
    active
  );
  assert.strictEqual(routine.learningStatus, 'routine', 'mastered + stagnation flag => routine');
  assert.strictEqual(routine.learningLabel, 'Rutine uten utvikling', 'routine label connects stagnation to no new learning');

  // Stagnation flag WITHOUT mastery does not force "routine": there may still be
  // learning value, so the picture stays learning-driven rather than purely negative.
  const stagnatedButLearning = vmOf(
    { mail_plan_progress: { step_index: 1 }, mail_branch_state: { flags: ['career_stagnated'] } },
    active
  );
  assert.notStrictEqual(stagnatedButLearning.learningStatus, 'routine', 'early stagnation flag alone is not routine');

  // --- Low learning value (dead-end) jobs surface "lite nyttig læring igjen". ------
  Runtime.registerProfiles({
    testrolle: { learning_value: 'low', usefulness: 'low', dead_end_risk: 'high', mastery_threshold: 3 }
  });
  const lowValue = vmOf({ mail_plan_progress: { step_index: 1 } }, active);
  assert.strictEqual(lowValue.jobLearningValue, 'low', 'registered profile lowers learning value');
  assert.strictEqual(lowValue.learningStatus, 'low_value', 'low-value job reads as low_value');
  assert.strictEqual(lowValue.learningLabel, 'Lite nyttig læring igjen');
  assert.strictEqual(lowValue.jobHasMoreToTeach, false, 'a dead-end job has little useful left to teach');

  // Metadata embedded on the active position also works and wins over registry.
  const embeddedHigh = vmOf(
    { mail_plan_progress: { step_index: 1 } },
    { ...active, job_learning: { learning_value: 'high', mastery_threshold: 10 } }
  );
  assert.strictEqual(embeddedHigh.jobLearningValue, 'high', 'embedded profile overrides registry');
  assert.strictEqual(embeddedHigh.masteryThreshold, 10, 'embedded mastery_threshold is used');
  assert.strictEqual(embeddedHigh.learningStatus, 'still_learning', 'high-value early role still learning');

  console.log('PASS: Civication job learning view-model tests completed.');
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
