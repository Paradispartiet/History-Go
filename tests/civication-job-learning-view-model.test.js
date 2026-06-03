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

async function run() {
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

  // ==========================================================================
  // Career readiness from job learning (view model only, not career outcome).
  // ==========================================================================
  assert.strictEqual(typeof Runtime.getCareerLearningSignals, 'function', 'career learning signals helper is exported');
  assert.strictEqual(typeof Runtime.getUnlockedJobSkills, 'function', 'unlocked job skills helper is exported');
  assert.strictEqual(typeof Runtime.getMasteredJobRoles, 'function', 'mastered job roles helper is exported');

  const emptySignals = Runtime.getCareerLearningSignals({}, activeP);
  assert.strictEqual(emptySignals.readinessLevel, 'none', 'empty state has no career readiness');
  assert.deepStrictEqual(emptySignals.masteredRoles, [], 'empty state has no mastered roles');
  assert.deepStrictEqual(emptySignals.unlockedSkills, [], 'empty state has no unlocked skills');
  assert.strictEqual(vmOf({}, activeP).careerReadiness.level, 'none', 'view model exposes safe default readiness');

  const buildingState = { job_learning_progress: { naer_prog: { steps: 1, mastered: false } } };
  const buildingSignals = Runtime.getCareerLearningSignals(buildingState, activeP);
  assert.strictEqual(buildingSignals.readinessLevel, 'building', 'progress without mastery is building readiness');
  assert.strictEqual(buildingState.career_outcome_state, undefined, 'building readiness does not set PROMOTED');

  const masteredSkillState = {
    job_learning_progress: {
      naer_prog: {
        steps: thr,
        mastered: true,
        unlocked_skills: ['arbeidsrytme', 'praktisk drift', 'rutineforståelse']
      }
    }
  };
  const masteredSignals = Runtime.getCareerLearningSignals(masteredSkillState, activeP);
  assert.strictEqual(masteredSignals.readinessLevel, 'ready_for_next_step', 'mastery creates next-step readiness');
  assert.deepStrictEqual(masteredSignals.unlockedSkills, ['arbeidsrytme', 'praktisk drift', 'rutineforståelse'], 'signals expose unlocked skills');
  assert.strictEqual(masteredSignals.currentRoleMastered, true, 'signals know the active role is mastered');
  assert.strictEqual(vmOf(masteredSkillState, activeP).careerReadiness.level, 'ready_for_next_step', 'view model exposes next-step readiness');

  const strongState = {
    job_learning_progress: {
      naer_prog: { steps: thr, mastered: true, unlocked_skills: ['arbeidsrytme', 'praktisk drift', 'rutineforståelse'] },
      naer_other: { steps: thr, mastered: true, unlocked_skills: ['kundedialog', 'prioritering', 'teamarbeid'] }
    }
  };
  const strongSignals = Runtime.getCareerLearningSignals(strongState, activeP);
  assert.strictEqual(strongSignals.readinessLevel, 'strong', 'multiple mastered roles / many skills create strong readiness');
  assert.deepStrictEqual(Runtime.getMasteredJobRoles(strongState, activeP), ['naer_prog', 'naer_other'], 'mastered roles are collected from progress state');
  assert.deepStrictEqual(
    Runtime.getUnlockedJobSkills(strongState),
    ['arbeidsrytme', 'praktisk drift', 'rutineforståelse', 'kundedialog', 'prioritering', 'teamarbeid'],
    'unlocked skills are collected across roles'
  );

  const promotedWithoutMastery = Runtime.getCareerLearningSignals(
    { job_learning_progress: { naer_prog: { steps: 1, mastered: false } }, career_outcome_state: { status: 'PROMOTED' } },
    activeP
  );
  assert.strictEqual(promotedWithoutMastery.readinessLevel, 'building', 'PROMOTED does not create next-step readiness by itself');

  const masteryWithoutPromotedState = { job_learning_progress: { naer_prog: { steps: thr, mastered: true } } };
  const masteryWithoutPromoted = Runtime.getCareerLearningSignals(masteryWithoutPromotedState, activeP);
  assert.strictEqual(masteryWithoutPromoted.readinessLevel, 'ready_for_next_step', 'mastery can create readiness without career outcome');
  assert.strictEqual(masteryWithoutPromotedState.career_outcome_state, undefined, 'mastery readiness does not write career_outcome_state');

  const outcomeState = { status: 'PROMOTED', resolved: true };
  const preserveState = {
    job_learning_progress: { naer_prog: { steps: thr, mastered: true } },
    career_outcome_state: outcomeState
  };
  const beforeOutcome = JSON.stringify(preserveState.career_outcome_state);
  Runtime.getCareerLearningSignals(preserveState, activeP);
  assert.strictEqual(JSON.stringify(preserveState.career_outcome_state), beforeOutcome, 'career readiness helper never mutates career_outcome_state');

  // ===========================================================================
  // Learning step from answered job mails (idempotent, never the outcome mail).
  // ===========================================================================

  // Gating: only plan-advancing job mails grant learning; outcome mails never do.
  assert.strictEqual(Runtime.shouldMailGrantLearning({ source_type: 'planned' }), true, 'planned mail grants learning');
  assert.strictEqual(
    Runtime.shouldMailGrantLearning({ daily_mail_meta: { advances_role_plan: true } }),
    true,
    'daily mail flagged to advance the plan grants learning'
  );
  assert.strictEqual(Runtime.shouldMailGrantLearning({ source_type: 'legacy_pack' }), false, 'legacy mail does not grant learning');
  assert.strictEqual(Runtime.shouldMailGrantLearning({ source_type: 'role_outcome' }), false, 'terminal outcome mail never grants learning');
  assert.strictEqual(
    Runtime.shouldMailGrantLearning({ source_type: 'planned', mail_class: 'career_outcome' }),
    false,
    'career_outcome mail never grants learning even if marked planned'
  );

  // recordJobLearningForAnsweredMail: qualifying mail grants exactly one step and is
  // idempotent per mail id; never writes career_outcome_state.
  const jobMail = { id: 'naer_prog_mail_1', source_type: 'planned', mail_type: 'job' };
  let recState = {};
  const rec1 = Runtime.recordJobLearningForAnsweredMail(recState, activeP, jobMail, { day: 2 });
  assert(rec1, 'qualifying mail produces a patch');
  assert.strictEqual(rec1.job_learning_progress.naer_prog.steps, 1, 'grants one learning step');
  assert.strictEqual(rec1.job_learning_progress.naer_prog.last_updated_day, 2, 'records the day');
  assert(rec1.job_learning_progress.naer_prog.counted_mail_ids.includes('naer_prog_mail_1'), 'mail id is recorded');
  assert.strictEqual(rec1.career_outcome_state, undefined, 'recording never writes career_outcome_state');

  recState = { ...recState, ...rec1 };
  const recDup = Runtime.recordJobLearningForAnsweredMail(recState, activeP, jobMail, { day: 3 });
  assert.strictEqual(recDup, null, 'same mail id does not grant a second step (idempotent)');

  const recOther = Runtime.recordJobLearningForAnsweredMail(recState, activeP, { id: 'naer_prog_mail_2', source_type: 'planned' }, { day: 3 });
  assert.strictEqual(recOther.job_learning_progress.naer_prog.steps, 2, 'a different mail id grants the next step');

  assert.strictEqual(
    Runtime.recordJobLearningForAnsweredMail({}, activeP, { id: 'x', source_type: 'role_outcome' }, {}),
    null,
    'outcome mail does not grant a step'
  );
  assert.strictEqual(
    Runtime.recordJobLearningForAnsweredMail({}, null, jobMail, {}),
    null,
    'no active role => no learning step'
  );

  // End-to-end through a patched event engine: answering a planned job mail advances
  // stored learning, and re-answering the same mail does not double count.
  let engineState = {};
  let enginePending = { status: 'pending', event: { id: 'naer_prog_e2e', source_type: 'planned', mail_type: 'job' } };
  const engineActive = activeP;
  global.CivicationState.getState = () => engineState;
  global.CivicationState.setState = (patch) => { engineState = { ...engineState, ...patch }; return patch; };
  global.CivicationState.getActivePosition = () => engineActive;
  global.CivicationCalendar = { getClock: () => ({ dayIndex: 5 }) };

  class FakeEngine {
    getPendingEvent() { return enginePending; }
    async answer() { return { ok: true }; }
  }
  global.CivicationEventEngine = FakeEngine;

  assert.strictEqual(Runtime.patchEventEngineAnswer(), true, 'answer patch applies once');
  assert.strictEqual(Runtime.patchEventEngineAnswer(), false, 'answer patch is idempotent');

  const engine = new FakeEngine();
  await engine.answer('naer_prog_e2e', 'A');
  assert.strictEqual(engineState.job_learning_progress.naer_prog.steps, 1, 'answering a planned job mail advances learning');
  assert.strictEqual(engineState.job_learning_progress.naer_prog.last_updated_day, 5, 'uses the calendar day');

  await engine.answer('naer_prog_e2e', 'A');
  assert.strictEqual(engineState.job_learning_progress.naer_prog.steps, 1, 're-answering the same mail does not double count');

  enginePending = { status: 'pending', event: { id: 'naer_prog_outcome', source_type: 'role_outcome', mail_class: 'career_outcome' } };
  await engine.answer('naer_prog_outcome', 'A');
  assert.strictEqual(engineState.job_learning_progress.naer_prog.steps, 1, 'answering the outcome mail does not grant a learning step');

  // ===========================================================================
  // Unlock transferable_skills / teaches at mastery (idempotent, only at mastery).
  // ===========================================================================
  Runtime.registerProfiles({
    naer_unlock: {
      learning_value: 'high',
      usefulness: 'high',
      dead_end_risk: 'low',
      mastery_threshold: 2,
      teaches: ['lærdom A', 'lærdom B', 'lærdom C'],
      transferable_skills: ['ferdighet A', 'ferdighet B', 'ferdighet C']
    }
  });
  const activeU = { career_id: 'naeringsliv', role_id: 'naer_unlock', role_key: 'unlockrolle', title: 'Unlock' };

  // Below mastery: nothing unlocked yet.
  let us = {};
  const u1 = Runtime.markJobLearningStep(us, activeU, {});
  assert.strictEqual(u1.job_learning_progress.naer_unlock.steps, 1, 'first step');
  assert.strictEqual(u1.job_learning_progress.naer_unlock.mastered, false, 'not yet mastered');
  assert.deepStrictEqual(u1.job_learning_progress.naer_unlock.unlocked_skills, [], 'no skills before mastery');
  assert.deepStrictEqual(u1.job_learning_progress.naer_unlock.unlocked_teaches, [], 'no teaches before mastery');

  // Reaching the threshold unlocks the profile's skills and teaches.
  us = { ...us, ...u1 };
  const u2 = Runtime.markJobLearningStep(us, activeU, {});
  const eU = u2.job_learning_progress.naer_unlock;
  assert.strictEqual(eU.mastered, true, 'mastered at threshold');
  assert.deepStrictEqual(eU.unlocked_skills, ['ferdighet A', 'ferdighet B', 'ferdighet C'], 'mastery unlocks transferable skills');
  assert.deepStrictEqual(eU.unlocked_teaches, ['lærdom A', 'lærdom B', 'lærdom C'], 'mastery unlocks teaches');

  // Further steps are idempotent: unlocked lists do not grow or duplicate.
  us = { ...us, ...u2 };
  const u3 = Runtime.markJobLearningStep(us, activeU, {});
  assert.deepStrictEqual(u3.job_learning_progress.naer_unlock.unlocked_skills, ['ferdighet A', 'ferdighet B', 'ferdighet C'], 'unlocks stay idempotent');
  assert.strictEqual(u3.job_learning_progress.naer_unlock.steps, 3, 'steps keep advancing past mastery');

  // View model surfaces the unlocked lists.
  const uvm = vmOf(us, activeU);
  assert.strictEqual(uvm.jobMastered, true, 'mastered in view model');
  assert.deepStrictEqual(uvm.unlockedSkills, ['ferdighet A', 'ferdighet B', 'ferdighet C'], 'view model exposes unlocked skills');
  assert.deepStrictEqual(uvm.unlockedTeaches, ['lærdom A', 'lærdom B', 'lærdom C'], 'view model exposes unlocked teaches');

  // No stored progress => view model exposes empty unlocked lists, never undefined.
  const noStore = vmOf({}, activeU);
  assert.deepStrictEqual(noStore.unlockedSkills, [], 'empty unlocked skills without stored progress');
  assert.deepStrictEqual(noStore.unlockedTeaches, [], 'empty unlocked teaches without stored progress');

  console.log('PASS: Civication job learning view-model tests completed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
