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

  // ===========================================================================
  // Persisted per-role job_learning_progress (PR 980).
  // Uses a distinct active role so it does not inherit the low-value 'testrolle'
  // profile registered above.
  // ===========================================================================
  const thr = Runtime.DEFAULT_MASTERY_THRESHOLD;
  const activeP = { career_id: 'naeringsliv', role_id: 'naer_prog', role_key: 'progrolle', title: 'Prog' };

  // Canonical role key is role_id (same as jobLearningProfiles / the audit).
  assert.strictEqual(Runtime.resolveLearningRoleKey(activeP), 'naer_prog', 'role key resolves to role_id');
  assert.strictEqual(Runtime.resolveLearningRoleKey({ role_key: 'x' }), 'x', 'falls back to scope when no role_id');

  // A/B: helpers tolerate empty / partial state and missing active without throwing.
  assert.strictEqual(Runtime.getJobLearningProgress({}, activeP), null, 'no entry => null progress');
  assert.strictEqual(Runtime.getJobLearningSteps({}, activeP), null, 'no entry => null steps');
  assert.strictEqual(Runtime.getJobLearningProgress({}, null), null, 'no active => null progress');
  assert.strictEqual(Runtime.isJobMastered({}, null), false, 'no active => not mastered');
  assert.doesNotThrow(() => Runtime.markJobLearningStep(undefined, undefined, undefined), 'mark tolerates empty args');
  assert.doesNotThrow(() => Runtime.ensureJobLearningProgressEntry(undefined, undefined), 'ensure tolerates empty args');

  // C: stored steps below threshold => not mastered, still more to teach.
  const below = vmOf({ job_learning_progress: { naer_prog: { steps: 1 } } }, activeP);
  assert.strictEqual(below.stepsTaken, 1, 'view model reads stored steps');
  assert.strictEqual(below.jobMastered, false, 'below threshold is not mastered');
  assert.strictEqual(below.jobHasMoreToTeach, true, 'below threshold still has more to teach');

  // D: stored steps >= threshold => mastered, and routine when stagnation flag is set.
  const storedMastered = vmOf({ job_learning_progress: { naer_prog: { steps: thr } } }, activeP);
  assert.strictEqual(storedMastered.jobMastered, true, 'stored steps drive mastery');
  assert.strictEqual(storedMastered.learningStatus, 'mastered', 'mastered status from stored progress');
  assert.strictEqual(storedMastered.jobHasMoreToTeach, false, 'mastered role has nothing more to teach');

  const storedRoutine = vmOf(
    { job_learning_progress: { naer_prog: { steps: thr } }, mail_branch_state: { flags: ['career_stagnated'] } },
    activeP
  );
  assert.strictEqual(storedRoutine.learningStatus, 'routine', 'mastered (stored) + stagnation => routine');

  // E: PROMOTED with low stored steps is still NOT mastered.
  const promotedStored = vmOf(
    { job_learning_progress: { naer_prog: { steps: 1 } }, career_outcome_state: { status: 'PROMOTED' } },
    activeP
  );
  assert.strictEqual(promotedStored.jobMastered, false, 'PROMOTED + low stored steps is not mastered');

  // F: mastery is reachable from stored progress with no career outcome at all.
  const masteredNoOutcomeStored = vmOf({ job_learning_progress: { naer_prog: { steps: thr } } }, activeP);
  assert.strictEqual(masteredNoOutcomeStored.jobMastered, true, 'mastery from stored steps without any career outcome');

  // G: stored progress is prioritized over mail_plan_progress.
  const conflicting = vmOf(
    { job_learning_progress: { naer_prog: { steps: thr } }, mail_plan_progress: { step_index: 0 } },
    activeP
  );
  assert.strictEqual(conflicting.stepsTaken, thr, 'stored progress wins over mail_plan_progress');
  assert.strictEqual(conflicting.jobMastered, true, 'stored progress drives mastery over mail progress');

  // H: with no stored progress, the existing mail-progress fallback still works.
  const fallback = vmOf({ mail_plan_progress: { step_index: 1 } }, activeP);
  assert.strictEqual(fallback.stepsTaken, 1, 'falls back to mail progress when no stored entry');
  assert.strictEqual(fallback.jobMastered, false, 'fallback path computes mastery from mail steps');

  // I: markJobLearningStep creates entry, increments deterministically, clamps,
  //    sets mastered, records the day, and never touches career_outcome_state.
  let st = {};
  const p1 = Runtime.markJobLearningStep(st, activeP, { day: 3 });
  assert.strictEqual(p1.job_learning_progress.naer_prog.steps, 1, 'mark creates entry and increments to 1');
  assert.strictEqual(p1.job_learning_progress.naer_prog.mastered, false, 'one step is not mastery');
  assert.strictEqual(p1.job_learning_progress.naer_prog.last_updated_day, 3, 'records last_updated_day');
  assert.strictEqual(p1.job_learning_progress.naer_prog.learned_at, null, 'not mastered => no learned_at');
  assert.strictEqual(p1.career_outcome_state, undefined, 'mark never writes career_outcome_state');

  st = { ...st, ...p1 };
  const p2 = Runtime.markJobLearningStep(st, activeP, { delta: thr });
  const e2 = p2.job_learning_progress.naer_prog;
  assert.strictEqual(e2.steps, 1 + thr, 'increments deterministically from the stored value');
  assert.strictEqual(e2.mastered, true, 'crossing the threshold sets mastered');
  assert(typeof e2.learned_at === 'string' && e2.learned_at, 'reaching mastery sets learned_at');

  const clamped = Runtime.markJobLearningStep({ job_learning_progress: { naer_prog: { steps: 1 } } }, activeP, { delta: -5 });
  assert.strictEqual(clamped.job_learning_progress.naer_prog.steps, 0, 'steps never go below 0');

  // ensureJobLearningProgressEntry creates a normalized entry without mutating input.
  const inputState = {};
  const ensured = Runtime.ensureJobLearningProgressEntry(inputState, activeP);
  assert.strictEqual(ensured.key, 'naer_prog', 'ensure resolves the role key');
  assert.strictEqual(ensured.entry.steps, 0, 'ensured entry starts at 0 steps');
  assert.deepStrictEqual(inputState, {}, 'ensure does not mutate the input state');
  assert(ensured.job_learning_progress.naer_prog, 'ensure patch contains the entry');

  // Other roles in the map are preserved when marking one role.
  const multi = { job_learning_progress: { naer_other: { steps: 4 } } };
  const pMulti = Runtime.markJobLearningStep(multi, activeP, {});
  assert.strictEqual(pMulti.job_learning_progress.naer_other.steps, 4, 'unrelated role progress is preserved');
  assert.strictEqual(pMulti.job_learning_progress.naer_prog.steps, 1, 'target role progress is added');

  console.log('PASS: Civication job learning view-model tests completed.');
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exit(1);
}
