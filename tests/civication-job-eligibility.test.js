#!/usr/bin/env node
// tests/civication-job-eligibility.test.js
//
// Tests the dual-gate job eligibility model and the FIRED category reentry lock.
//
// Dual gate:
//   knowledge_gate = History Go / quiz / merits (contract-ready, not enforced yet)
//   learning_gate  = Civication / job_learning_progress / mastered roles / unlocked skills
//
// FIRED rule: getting fired in one category temporarily LOCKS that category. The lock
// only clears once the player works in ANOTHER category and answers at least one
// plan-advancing job mail there. STAGNATED and PROMOTED never create a lock, and FIRED
// never deletes learning progress or unlocked skills.

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
    getActivePosition() { return activePosition; },
    setActivePosition(next) { activePosition = next; }
  };

  // Load job learning first so the eligibility runtime can reuse its signals
  // (getCareerLearningSignals / shouldMailGrantLearning), mirroring production order.
  loadScript('js/Civication/systems/civicationJobLearningRuntime.js');
  loadScript('js/Civication/systems/civicationJobEligibilityRuntime.js');

  const E = global.CivicationJobEligibilityRuntime;
  assert.strictEqual(typeof E, 'object', 'CivicationJobEligibilityRuntime is exported');
  for (const fn of ['getJobOfferEligibility', 'createFiredReentryLock', 'clearReentryLockIfQualified', 'processAnsweredMail', 'resolveCategory']) {
    assert.strictEqual(typeof E[fn], 'function', `${fn} is exported`);
  }

  const firedActive = { career_id: 'naeringsliv', role_id: 'naer_fagarbeider', title: 'Fagarbeider' };
  const firedMeta = { status: 'FIRED', decided_at: '2026-06-03T20:00:00.000Z' };
  const firedEvent = {
    source_type: 'role_outcome',
    mail_class: 'career_outcome',
    career_outcome_meta: { status: 'FIRED', decided_at: '2026-06-03T20:00:00.000Z' }
  };

  // A canonical "already fired in naeringsliv" state used by several cases below.
  const lockedState = {
    career_reentry_locks: {
      naeringsliv: {
        status: 'locked',
        reason: 'fired',
        fired_category: 'naeringsliv',
        fired_role_id: 'naer_fagarbeider'
      }
    }
  };

  // --- 1. FIRED in a category creates a reentry lock. ------------------------------
  const lockPatch = E.createFiredReentryLock({}, firedActive, firedMeta);
  assert(lockPatch && lockPatch.career_reentry_locks, 'fired produces a career_reentry_locks patch');
  const lock = lockPatch.career_reentry_locks.naeringsliv;
  assert.strictEqual(lock.status, 'locked', 'category is locked after fired');
  assert.strictEqual(lock.reason, 'fired', 'lock reason is fired');
  assert.strictEqual(lock.fired_category, 'naeringsliv', 'lock records the fired category');
  assert.strictEqual(lock.fired_role_id, 'naer_fagarbeider', 'lock records the fired role id');
  assert.strictEqual(lock.locked_at, '2026-06-03T20:00:00.000Z', 'lock uses the outcome decided_at');
  assert.strictEqual(lock.clear_condition, 'worked_other_category', 'lock declares its clear condition');

  // Tolerant resolver: no resolvable category => no lock, no crash.
  assert.strictEqual(E.createFiredReentryLock({}, { title: 'Mystery' }, firedMeta), null, 'no category => no lock');
  assert.doesNotThrow(() => E.createFiredReentryLock({}, null, null), 'fired lock tolerates null active');

  // role_id prefix fallback resolves naeringsliv when no explicit category/career_id.
  const prefixPatch = E.createFiredReentryLock({}, { role_id: 'naer_arbeider', title: 'Arbeider' }, firedMeta);
  assert.strictEqual(prefixPatch.career_reentry_locks.naeringsliv.status, 'locked', 'role_id prefix resolves category');

  // Via processAnsweredMail (the real answer-flow entry point).
  const firedViaMail = E.processAnsweredMail({}, firedActive, firedEvent);
  assert.strictEqual(firedViaMail.career_reentry_locks.naeringsliv.status, 'locked', 'fired outcome mail creates lock');

  // --- 2. Same-category offer is blocked while the lock is active. -----------------
  const blocked = E.getJobOfferEligibility(lockedState, { career_id: 'naeringsliv', title: 'Lagerarbeider' }, { active: null });
  assert.strictEqual(blocked.eligible, false, 'same-category offer is not eligible while locked');
  assert.strictEqual(blocked.reentryLock.status, 'blocked', 'reentry lock reports blocked for same category');
  assert(blocked.blockers.length > 0, 'a blocker explains the locked category');
  assert.strictEqual(blocked.offerRoute, 'recovery_after_fired', 'blocked same-category offer routes via recovery');

  // --- 3. Other-category offers are NOT blocked by this lock. ----------------------
  for (const cat of ['by', 'media', 'vitenskap']) {
    const open = E.getJobOfferEligibility(lockedState, { career_id: cat, title: 'Stilling' }, { active: null });
    assert.strictEqual(open.reentryLock.status, 'clear', `${cat} is not blocked by the naeringsliv lock`);
    assert.strictEqual(open.eligible, true, `${cat} offer is eligible`);
    assert.strictEqual(open.offerRoute, 'recovery_after_fired', `${cat} offer after fired routes via recovery`);
  }

  // --- 4. Accepting another-category job alone does NOT clear the lock. ------------
  // No qualifying plan mail answered yet (legacy / non-plan mail).
  const notCleared = E.clearReentryLockIfQualified(
    lockedState,
    { career_id: 'media', role_id: 'med_journalist' },
    { id: 'x', source_type: 'legacy_pack' }
  );
  assert.strictEqual(notCleared, null, 'non-plan mail in another category does not clear the lock');
  assert.strictEqual(E.isCategoryLocked(lockedState, 'naeringsliv'), true, 'lock remains active');

  // --- 5. A plan-advancing job mail in ANOTHER category clears the lock. -----------
  const cleared = E.clearReentryLockIfQualified(
    lockedState,
    { career_id: 'media', role_id: 'med_journalist' },
    { id: 'm1', source_type: 'planned' }
  );
  assert(cleared && cleared.career_reentry_locks, 'qualifying mail in another category produces a clear patch');
  const clearedLock = cleared.career_reentry_locks.naeringsliv;
  assert.strictEqual(clearedLock.status, 'cleared', 'lock is marked cleared');
  assert.strictEqual(clearedLock.cleared_by_category, 'media', 'records which category cleared it');
  assert.strictEqual(clearedLock.cleared_by_role_id, 'med_journalist', 'records the clearing role');
  assert(clearedLock.cleared_at, 'records cleared_at');

  // After clearing, eligibility treats naeringsliv as open again.
  const afterClear = { ...lockedState, ...cleared };
  assert.strictEqual(E.isCategoryLocked(afterClear, 'naeringsliv'), false, 'cleared lock no longer blocks');
  const reopened = E.getJobOfferEligibility(afterClear, { career_id: 'naeringsliv', title: 'Arbeider' }, { active: null });
  assert.strictEqual(reopened.eligible, true, 'naeringsliv offers are eligible again after clearing');
  assert.strictEqual(reopened.reentryLock.status, 'clear', 'cleared entry does not report blocked');

  // Also via processAnsweredMail (advances_role_plan flag form).
  const clearedViaFlag = E.processAnsweredMail(
    lockedState,
    { career_id: 'media', role_id: 'med_journalist' },
    { id: 'm2', daily_mail_meta: { advances_role_plan: true } }
  );
  assert.strictEqual(clearedViaFlag.career_reentry_locks.naeringsliv.status, 'cleared', 'advances_role_plan mail clears the lock');

  // --- 6. Outcome / terminal mails NEVER clear the lock. ---------------------------
  assert.strictEqual(
    E.clearReentryLockIfQualified(lockedState, { career_id: 'media' }, { id: 'o', source_type: 'role_outcome' }),
    null,
    'role_outcome mail does not clear the lock'
  );
  assert.strictEqual(
    E.clearReentryLockIfQualified(lockedState, { career_id: 'media' }, { id: 'o', source_type: 'planned', mail_class: 'career_outcome' }),
    null,
    'career_outcome mail does not clear the lock even if planned'
  );

  // --- 7. A plan mail in the SAME locked category does NOT clear it. ---------------
  assert.strictEqual(
    E.clearReentryLockIfQualified(lockedState, { career_id: 'naeringsliv', role_id: 'naer_arbeider' }, { id: 's', source_type: 'planned' }),
    null,
    'plan mail in the locked category does not clear it'
  );

  // --- 8. STAGNATED creates no lock. ----------------------------------------------
  const stagnated = E.processAnsweredMail(
    {},
    firedActive,
    { source_type: 'role_outcome', mail_class: 'career_outcome', career_outcome_meta: { status: 'STAGNATED' } }
  );
  assert.strictEqual(stagnated, null, 'STAGNATED outcome does not create a reentry lock');

  // STAGNATED still offers an exit route in eligibility (without any lock).
  const stagEligibility = E.getJobOfferEligibility({ career_outcome_state: { status: 'STAGNATED' } }, { career_id: 'media' }, { active: null });
  assert.strictEqual(stagEligibility.careerStateModifier.status, 'stagnated', 'modifier reflects STAGNATED');
  assert.strictEqual(stagEligibility.offerRoute, 'exit_from_stagnation', 'STAGNATED routes as exit_from_stagnation');
  assert.strictEqual(stagEligibility.eligible, true, 'STAGNATED never blocks new offers');
  assert.strictEqual(stagEligibility.reentryLock.status, 'clear', 'STAGNATED produces no reentry lock');

  // --- 9. PROMOTED creates no lock. -----------------------------------------------
  const promoted = E.processAnsweredMail(
    {},
    firedActive,
    { source_type: 'role_outcome', mail_class: 'career_outcome', career_outcome_meta: { status: 'PROMOTED' } }
  );
  assert.strictEqual(promoted, null, 'PROMOTED outcome does not create a reentry lock');

  // --- 10. FIRED preserves learning progress / unlocked skills / teaches. ----------
  const learnState = {
    job_learning_progress: {
      naer_fagarbeider: { steps: 6, mastered: true, unlocked_skills: ['arbeidsrytme'], unlocked_teaches: ['praktisk drift'] }
    }
  };
  const firedWithLearning = E.processAnsweredMail(learnState, firedActive, firedEvent);
  assert.strictEqual(firedWithLearning.job_learning_progress, undefined, 'fired patch never touches job_learning_progress');
  const mergedAfterFired = { ...learnState, ...firedWithLearning };
  assert.strictEqual(mergedAfterFired.job_learning_progress.naer_fagarbeider.mastered, true, 'mastery survives fired');
  assert.deepStrictEqual(mergedAfterFired.job_learning_progress.naer_fagarbeider.unlocked_skills, ['arbeidsrytme'], 'unlocked skills survive fired');
  assert.deepStrictEqual(mergedAfterFired.job_learning_progress.naer_fagarbeider.unlocked_teaches, ['praktisk drift'], 'unlocked teaches survive fired');

  // --- 11. Knowledge gate without explicit requirements never blocks. --------------
  const noReq = E.getJobOfferEligibility({}, { career_id: 'media', title: 'Journalist' }, { active: null });
  assert.strictEqual(noReq.knowledgeGate.status, 'not_configured', 'no explicit knowledge requirement => not_configured');
  assert.strictEqual(noReq.eligible, true, 'missing quiz requirements never block an offer in this PR');
  assert.strictEqual(noReq.blockers.length, 0, 'no knowledge blocker without requirements');

  const withReq = E.getJobOfferEligibility({}, { career_id: 'media', knowledge_requirements: ['quiz_history_1'] }, { active: null });
  assert.strictEqual(withReq.knowledgeGate.status, 'unknown', 'explicit requirements read tolerantly as unknown (not enforced yet)');
  assert.strictEqual(withReq.eligible, true, 'explicit requirements still do not block in this PR');

  // --- 12. Learning gate uses readiness signals but never writes career_outcome_state.
  const lgState = {
    job_learning_progress: {
      naer_fagarbeider: { steps: 6, mastered: true, unlocked_skills: ['a', 'b', 'c'] }
    }
  };
  const beforeCO = JSON.stringify(lgState.career_outcome_state);
  const lg = E.getJobOfferEligibility(lgState, { career_id: 'media' }, { active: { career_id: 'naeringsliv', role_id: 'naer_fagarbeider' } });
  assert(['ready_for_next_step', 'strong'].includes(lg.learningGate.status), 'learning gate reflects readiness from job_learning_progress');
  assert.strictEqual(lg.learningGate.source, 'job_learning_progress', 'learning gate is sourced from job learning progress');
  assert.strictEqual(JSON.stringify(lgState.career_outcome_state), beforeCO, 'learning gate never writes career_outcome_state');
  assert.strictEqual(lgState.career_outcome_state, undefined, 'learning gate does not promote / set career outcome');

  // Empty / partial state is tolerated everywhere without throwing.
  assert.doesNotThrow(() => E.getJobOfferEligibility(undefined, undefined, undefined), 'eligibility tolerates empty input');
  assert.doesNotThrow(() => E.getJobOfferEligibility({}, null, {}), 'eligibility tolerates null offer');

  // ==================================================================================
  // Knowledge gate: real, narrow knowledge requirements against History Go quiz state.
  //   not_required / not_configured / unknown never block.
  //   soft_required explains (reason) but never blocks.
  //   required blocks ONLY when the resolver can confirm a "missing" requirement.
  // ==================================================================================
  for (const fn of ['registerKnowledgeRequirements', 'getKnowledgeProgressSnapshot', 'evaluateKnowledgeRequirement', 'evaluateKnowledgeGate', 'getKnowledgeRequirementForOffer']) {
    assert.strictEqual(typeof E[fn], 'function', `${fn} is exported`);
  }

  // K1. No requirements registered => not_configured, never blocks.
  const kNone = E.getJobOfferEligibility({ quiz_progress: {} }, { career_id: 'naeringsliv', title: 'Selger' }, { active: null });
  assert.strictEqual(kNone.knowledgeGate.status, 'not_configured', 'no registry => not_configured');
  assert.strictEqual(kNone.eligible, true, 'not_configured never blocks');
  for (const bucket of ['requirements', 'passed', 'missing', 'unknown']) {
    assert(Array.isArray(kNone.knowledgeGate[bucket]), `knowledgeGate.${bucket} is an array`);
  }

  // Register a contract mirroring data/Civication/jobKnowledgeRequirements.json, plus a
  // deliberately strict role to exercise mode "required" (real categories only).
  E.registerKnowledgeRequirements({
    schema: 'civication_job_knowledge_requirements_v1',
    version: 1,
    default: { mode: 'not_required' },
    categories: {
      naeringsliv: { mode: 'soft_required', label: 'Næringsliv', requirements: [{ type: 'category_quiz_count', category: 'politikk', min_completed: 1 }] },
      vitenskap: { mode: 'soft_required', label: 'Vitenskap', requirements: [{ type: 'category_quiz_count', category: 'vitenskap', min_completed: 1 }] }
    },
    roles: {
      med_redaktor: { mode: 'required', label: 'Redaktør', requirements: [{ type: 'category_quiz_count', category: 'politikk', min_completed: 2 }] }
    }
  });

  // K2. Category requirement exists but no quiz_progress source => unknown; soft never blocks.
  const kUnknown = E.getJobOfferEligibility({}, { career_id: 'naeringsliv', title: 'Selger' }, { active: null });
  assert.strictEqual(kUnknown.knowledgeGate.status, 'unknown', 'no readable quiz source => unknown, not missing');
  assert.strictEqual(kUnknown.knowledgeGate.mode, 'soft_required', 'soft_required mode carried through');
  assert.strictEqual(kUnknown.knowledgeGate.source, 'jobKnowledgeRequirements', 'sourced from jobKnowledgeRequirements');
  assert.strictEqual(kUnknown.eligible, true, 'unknown never blocks');

  // K3. Soft requirement missing (source readable, category empty) => eligible, reason, no blocker.
  const kSoftMissing = E.getJobOfferEligibility({ quiz_progress: { historie: { completed: ['a'] } } }, { career_id: 'naeringsliv' }, { active: null });
  assert.strictEqual(kSoftMissing.knowledgeGate.status, 'missing', 'readable source + below threshold => missing');
  assert.strictEqual(kSoftMissing.eligible, true, 'soft_required missing does not block');
  assert.strictEqual(kSoftMissing.blockers.length, 0, 'soft_required missing adds no blocker');
  assert(kSoftMissing.reasons.some((r) => /quiz/i.test(r)), 'soft missing surfaces an explanatory reason');
  assert.strictEqual(kSoftMissing.knowledgeGate.missing.length, 1, 'one missing requirement reported');

  // K4. Required requirement missing AND resolver can evaluate => eligible false + blocker.
  const kRequiredMissing = E.getJobOfferEligibility({ quiz_progress: { politikk: { completed: ['p1'] } } }, { role_id: 'med_redaktor', career_id: 'media' }, { active: null });
  assert.strictEqual(kRequiredMissing.knowledgeGate.status, 'missing', 'required role requirement below threshold => missing');
  assert.strictEqual(kRequiredMissing.knowledgeGate.mode, 'required', 'required mode carried through');
  assert.strictEqual(kRequiredMissing.eligible, false, 'required + confirmed missing blocks the offer');
  assert(kRequiredMissing.blockers.length > 0, 'required missing adds a blocker');

  // K4b. Required requirement WITHOUT a readable source => unknown; must NOT block.
  const kRequiredUnknown = E.getJobOfferEligibility({}, { role_id: 'med_redaktor', career_id: 'media' }, { active: null });
  assert.strictEqual(kRequiredUnknown.knowledgeGate.status, 'unknown', 'required requirement without source => unknown');
  assert.strictEqual(kRequiredUnknown.eligible, true, 'required + unknown never blocks (cannot confirm missing)');

  // K5. Passed requirement => passed, eligible, with a reason.
  const kPassed = E.getJobOfferEligibility({ quiz_progress: { politikk: { completed: ['p1', 'p2'] } } }, { career_id: 'naeringsliv' }, { active: null });
  assert.strictEqual(kPassed.knowledgeGate.status, 'passed', 'enough completed quizzes => passed');
  assert.strictEqual(kPassed.eligible, true, 'passed is eligible');
  assert(kPassed.reasons.some((r) => /kunnskapsgrunnlag/i.test(r)), 'passed surfaces a reason');
  assert.strictEqual(kPassed.knowledgeGate.passed.length, 1, 'one passed requirement reported');

  // K6. Fired reentry lock OVERRIDES a passed knowledge gate for the same category.
  const lockedNaering = {
    quiz_progress: { politikk: { completed: ['p1', 'p2'] } },
    career_reentry_locks: { naeringsliv: { status: 'locked', reason: 'fired', fired_category: 'naeringsliv' } }
  };
  const kLockWins = E.getJobOfferEligibility(lockedNaering, { career_id: 'naeringsliv', title: 'Selger' }, { active: null });
  assert.strictEqual(kLockWins.knowledgeGate.status, 'passed', 'knowledge is passed');
  assert.strictEqual(kLockWins.reentryLock.status, 'blocked', 'reentry lock still blocks same category');
  assert.strictEqual(kLockWins.eligible, false, 'reentry lock overrides a passed knowledge gate');

  // K7. Learning gate still works alongside the knowledge gate; neither writes career_outcome_state.
  const kLearn = {
    quiz_progress: { politikk: { completed: ['p1', 'p2'] } },
    job_learning_progress: { naer_fagarbeider: { steps: 6, mastered: true, unlocked_skills: ['a', 'b', 'c'] } }
  };
  const kLearnEl = E.getJobOfferEligibility(kLearn, { career_id: 'naeringsliv' }, { active: { career_id: 'naeringsliv', role_id: 'naer_fagarbeider' } });
  assert(['ready_for_next_step', 'strong'].includes(kLearnEl.learningGate.status), 'learning gate still reflects readiness');
  assert.strictEqual(kLearnEl.knowledgeGate.status, 'passed', 'knowledge gate evaluated independently of learning gate');
  assert.strictEqual(kLearn.career_outcome_state, undefined, 'knowledge/learning gates never set career_outcome_state');

  // K8. Snapshot + requirement helpers tolerate empty / malformed input without throwing.
  assert.doesNotThrow(() => E.getKnowledgeProgressSnapshot(undefined), 'snapshot tolerates undefined state');
  assert.doesNotThrow(() => E.getKnowledgeProgressSnapshot({ quiz_progress: 'nope' }), 'snapshot tolerates malformed quiz_progress');
  assert.strictEqual(E.evaluateKnowledgeRequirement({}, { type: 'unsupported_type' }).status, 'unknown', 'unsupported requirement type => unknown');
  assert.strictEqual(E.evaluateKnowledgeRequirement({}, 'opaque_id').status, 'unknown', 'opaque string requirement => unknown');
  const snap = E.getKnowledgeProgressSnapshot({ quiz_progress: { politikk: { completed: ['p1', 'p2'] } } });
  assert.strictEqual(snap.quizCompletedByCategory.politikk, 2, 'snapshot counts completed quizzes per category');
  assert.strictEqual(snap.hasQuizSource, true, 'snapshot flags a readable quiz source');

  // ==================================================================================
  // End-to-end through patched CivicationEventEngine.answer.
  // ==================================================================================
  let engineState = {
    job_learning_progress: {
      naer_fagarbeider: { steps: 6, mastered: true, unlocked_skills: ['x'], unlocked_teaches: ['y'] }
    }
  };
  let engineActive = { career_id: 'naeringsliv', role_id: 'naer_fagarbeider', title: 'Fagarbeider' };
  let pending = {
    status: 'pending',
    event: { id: 'fire_e2e', source_type: 'role_outcome', mail_class: 'career_outcome', career_outcome_meta: { status: 'FIRED', decided_at: '2026-06-03T20:00:00.000Z' } }
  };

  global.CivicationState.getState = () => engineState;
  global.CivicationState.setState = (patch) => { engineState = { ...engineState, ...patch }; return patch; };
  global.CivicationState.getActivePosition = () => engineActive;

  class FakeEngine {
    getPendingEvent() { return pending; }
    async answer() {
      // Simulate the existing FIRED flow clearing the active position.
      if (pending?.event?.career_outcome_meta?.status === 'FIRED') engineActive = null;
      return { ok: true };
    }
  }
  global.CivicationEventEngine = FakeEngine;

  assert.strictEqual(E.patchEventEngineAnswer(), true, 'answer patch applies once');
  assert.strictEqual(E.patchEventEngineAnswer(), false, 'answer patch is idempotent');

  const engine = new FakeEngine();
  await engine.answer('fire_e2e', 'A');
  assert.strictEqual(engineState.career_reentry_locks.naeringsliv.status, 'locked', 'engine FIRED creates the lock from the captured active position');
  assert.strictEqual(engineState.job_learning_progress.naer_fagarbeider.mastered, true, 'learning progress preserved through fired (engine)');
  assert.deepStrictEqual(engineState.job_learning_progress.naer_fagarbeider.unlocked_skills, ['x'], 'unlocked skills preserved through fired (engine)');

  // Now the player works in another category and answers a plan mail there.
  engineActive = { career_id: 'media', role_id: 'med_journalist', title: 'Journalist' };
  pending = { status: 'pending', event: { id: 'plan_e2e', source_type: 'planned', mail_type: 'job' } };
  await engine.answer('plan_e2e', 'A');
  assert.strictEqual(engineState.career_reentry_locks.naeringsliv.status, 'cleared', 'plan mail in another category clears the lock (engine)');
  assert.strictEqual(engineState.career_reentry_locks.naeringsliv.cleared_by_category, 'media', 'engine clear records the clearing category');

  // ==================================================================================
  // pushOffer patch: blocks locked category, enriches eligible offers (additive).
  // ==================================================================================
  let jobsState = { career_reentry_locks: { naeringsliv: { status: 'locked', reason: 'fired' } } };
  global.CivicationState.getState = () => jobsState;
  global.CivicationState.setState = (patch) => { jobsState = { ...jobsState, ...patch }; return patch; };
  global.CivicationState.getActivePosition = () => null;

  let storedOffers = [];
  global.CivicationJobs = {
    pushOffer(input) {
      const offer = { offer_key: `${input.career_id}:${input.threshold}`, ...input, status: 'pending' };
      storedOffers.unshift(offer);
      return { ok: true, offer };
    },
    getOffers() { return storedOffers; },
    setOffers(arr) { storedOffers = Array.isArray(arr) ? arr : []; }
  };

  assert.strictEqual(E.patchJobsPushOffer(), true, 'pushOffer patch applies once');
  assert.strictEqual(E.patchJobsPushOffer(), false, 'pushOffer patch is idempotent');

  const blockedPush = global.CivicationJobs.pushOffer({ career_id: 'naeringsliv', title: 'Lagerarbeider', threshold: 1 });
  assert.strictEqual(blockedPush.ok, false, 'locked category offer is refused at pushOffer');
  assert.strictEqual(blockedPush.reason, 'reentry_locked', 'refusal reason is reentry_locked');
  assert(blockedPush.eligibility && blockedPush.eligibility.reentryLock.status === 'blocked', 'refusal carries eligibility detail');
  assert.strictEqual(storedOffers.length, 0, 'no offer is stored for a locked category');

  const okPush = global.CivicationJobs.pushOffer({ career_id: 'media', title: 'Journalist', threshold: 1 });
  assert.strictEqual(okPush.ok, true, 'other-category offer is created');
  assert(okPush.offer.eligibility, 'created offer is enriched with eligibility metadata');
  assert.strictEqual(okPush.offer.eligibility.reentry_lock, 'clear', 'enriched offer reports a clear reentry lock');
  assert.strictEqual(okPush.offer.eligibility.knowledge_gate, 'not_configured', 'enriched offer carries knowledge gate status');
  assert(storedOffers[0] && storedOffers[0].eligibility, 'enriched offer is persisted back');

  console.log('PASS: Civication job eligibility + reentry lock tests completed.');
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
