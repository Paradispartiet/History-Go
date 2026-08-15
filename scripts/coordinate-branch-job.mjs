import fs from 'node:fs';

function replaceOnce(source, needle, replacement, label) {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(needle, replacement);
}

// -----------------------------------------------------------------------------
// 1. Move JobEligibility answer ownership to ChoiceDirector middleware priority 50.
// -----------------------------------------------------------------------------
const runtimeFile = 'js/Civication/systems/civicationJobEligibilityRuntime.js';
let runtime = fs.readFileSync(runtimeFile, 'utf8');

const lockAnchor = '  const LOCKS_KEY = "career_reentry_locks";\n';
runtime = replaceOnce(
  runtime,
  lockAnchor,
  `${lockAnchor}  const ANSWER_MIDDLEWARE_NAME = "job_eligibility_runtime";\n  const ANSWER_MIDDLEWARE_PRIORITY = 50;\n  const ANSWER_MIDDLEWARE_QUEUE_KEY = "__civicationChoiceAnswerMiddlewareQueue";\n`,
  'eligibility constants'
);

const answerStart = runtime.indexOf('  // Patch CivicationEventEngine.answer:');
const answerEnd = runtime.indexOf('  // Patch CivicationJobs.pushOffer:', answerStart);
if (answerStart < 0 || answerEnd <= answerStart) throw new Error('eligibility answer block not found');

const middlewareBlock = `  // ChoiceDirector around-answer middleware: capture active position before the inner
  // chain because a FIRED outcome may clear it, then update reentry locks only after a
  // successful answer. This preserves the previous wrapper timing without owning
  // CivicationEventEngine.prototype.answer directly.
  async function jobEligibilityAnswerMiddleware(ctx, next) {
    const eventObj = ctx?.eventObj || null;
    const activeBefore = getActive();
    const result = await next();

    if (result?.ok !== false && eventObj) {
      try {
        const patch = processAnsweredMail(getState(), activeBefore, eventObj);
        if (patch) {
          setState(patch);
          try { window.dispatchEvent(new Event("updateProfile")); } catch (_e) {}
        }
      } catch (_err) {
        // Reentry-lock er best-effort: aldri bryt svar-flyten.
      }
    }

    return result;
  }

  function registerAnswerMiddleware() {
    const director = window.CivicationChoiceDirector;
    if (director?.registerAnswerMiddleware) {
      return director.registerAnswerMiddleware(
        ANSWER_MIDDLEWARE_NAME,
        jobEligibilityAnswerMiddleware,
        ANSWER_MIDDLEWARE_PRIORITY
      );
    }

    const runtimeWindow = /** @type {Window & typeof globalThis & { __civicationChoiceAnswerMiddlewareQueue?: Array<{ name: string, fn: Function, priority: number }> }} */ (window);
    const queue = Array.isArray(runtimeWindow[ANSWER_MIDDLEWARE_QUEUE_KEY])
      ? runtimeWindow[ANSWER_MIDDLEWARE_QUEUE_KEY]
      : (runtimeWindow[ANSWER_MIDDLEWARE_QUEUE_KEY] = []);
    if (!queue.some(entry => entry?.name === ANSWER_MIDDLEWARE_NAME)) {
      queue.push({
        name: ANSWER_MIDDLEWARE_NAME,
        fn: jobEligibilityAnswerMiddleware,
        priority: ANSWER_MIDDLEWARE_PRIORITY
      });
    }
    return true;
  }

  // Compatibility API for existing callers/tests. The name remains during migration,
  // but it now registers middleware and never patches EventEngine.answer directly.
  function patchEventEngineAnswer() {
    return registerAnswerMiddleware();
  }

`;
runtime = runtime.slice(0, answerStart) + middlewareBlock + runtime.slice(answerEnd);

runtime = replaceOnce(
  runtime,
  '    patchEventEngineAnswer();\n    patchJobsPushOffer();',
  '    registerAnswerMiddleware();\n    patchJobsPushOffer();',
  'eligibility boot'
);

runtime = replaceOnce(
  runtime,
  '    patchEventEngineAnswer,\n    patchJobsPushOffer,',
  '    patchEventEngineAnswer,\n    registerAnswerMiddleware,\n    patchJobsPushOffer,',
  'eligibility exports'
);

runtime = replaceOnce(
  runtime,
  '        answer_patched: window.CivicationEventEngine?.prototype?.__civicationJobEligibilityAnswerPatched === true,',
  '        answer_middleware_registered: window.CivicationChoiceDirector?.listAnswerMiddlewares?.().some?.(entry => entry?.name === ANSWER_MIDDLEWARE_NAME) === true,',
  'eligibility inspect'
);

if (runtime.includes('proto.answer = async function jobEligibilityAnswer')) {
  throw new Error('legacy JobEligibility answer wrapper still present');
}
fs.writeFileSync(runtimeFile, runtime);

// -----------------------------------------------------------------------------
// 2. Update the existing domain test so its E2E answer section executes the registered
//    middleware rather than expecting a direct EventEngine monkey patch.
// -----------------------------------------------------------------------------
const testFile = 'tests/civication-job-eligibility.test.js';
let test = fs.readFileSync(testFile, 'utf8');

const eventAnchor = "  global.Event = class Event { constructor(type) { this.type = type; } };\n\n";
const fakeDirector = `${eventAnchor}  const registeredAnswerMiddlewares = [];\n  global.CivicationChoiceDirector = {\n    registerAnswerMiddleware(name, fn, priority = 100) {\n      const key = String(name || '');\n      if (!registeredAnswerMiddlewares.some((entry) => entry.name === key)) {\n        registeredAnswerMiddlewares.push({ name: key, fn, priority: Number(priority || 100) });\n        registeredAnswerMiddlewares.sort((a, b) => a.priority - b.priority);\n      }\n      return true;\n    },\n    listAnswerMiddlewares() {\n      return registeredAnswerMiddlewares.map((entry) => ({ name: entry.name, priority: entry.priority }));\n    }\n  };\n\n`;
test = replaceOnce(test, eventAnchor, fakeDirector, 'eligibility test fake director');

test = replaceOnce(
  test,
  "  for (const fn of ['getJobOfferEligibility', 'createFiredReentryLock', 'clearReentryLockIfQualified', 'processAnsweredMail', 'resolveCategory']) {",
  "  for (const fn of ['getJobOfferEligibility', 'createFiredReentryLock', 'clearReentryLockIfQualified', 'processAnsweredMail', 'resolveCategory', 'registerAnswerMiddleware']) {",
  'eligibility test exported functions'
);

const e2eStart = test.indexOf('  // ==================================================================================\n  // End-to-end through patched CivicationEventEngine.answer.');
const e2eEnd = test.indexOf('  // ==================================================================================\n  // pushOffer patch:', e2eStart);
if (e2eStart < 0 || e2eEnd <= e2eStart) throw new Error('eligibility E2E test block not found');

const e2eReplacement = `  // ==================================================================================
  // End-to-end through registered ChoiceDirector answer middleware.
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

  const originalEngineAnswer = FakeEngine.prototype.answer;
  assert.strictEqual(E.patchEventEngineAnswer(), true, 'compatibility API registers answer middleware');
  assert.strictEqual(E.registerAnswerMiddleware(), true, 'middleware registration is idempotent');
  assert.strictEqual(FakeEngine.prototype.answer, originalEngineAnswer, 'eligibility never patches EventEngine.answer directly');
  assert.strictEqual(registeredAnswerMiddlewares.filter((entry) => entry.name === 'job_eligibility_runtime').length, 1, 'eligibility middleware is registered exactly once');
  const eligibilityStage = registeredAnswerMiddlewares.find((entry) => entry.name === 'job_eligibility_runtime');
  assert(eligibilityStage && typeof eligibilityStage.fn === 'function', 'eligibility middleware is available');
  assert.strictEqual(eligibilityStage.priority, 50, 'eligibility middleware stays at priority 50');

  async function answerThroughEligibility(engine, eventId, choiceId) {
    const pendingSnapshot = engine.getPendingEvent();
    return eligibilityStage.fn(
      {
        engine,
        eventId,
        choiceId,
        pending: pendingSnapshot,
        eventObj: pendingSnapshot?.event || null
      },
      () => originalEngineAnswer.call(engine, eventId, choiceId)
    );
  }

  const engine = new FakeEngine();
  await answerThroughEligibility(engine, 'fire_e2e', 'A');
  assert.strictEqual(engineState.career_reentry_locks.naeringsliv.status, 'locked', 'middleware FIRED creates the lock from the captured active position');
  assert.strictEqual(engineState.job_learning_progress.naer_fagarbeider.mastered, true, 'learning progress preserved through fired (middleware)');
  assert.deepStrictEqual(engineState.job_learning_progress.naer_fagarbeider.unlocked_skills, ['x'], 'unlocked skills preserved through fired (middleware)');

  // Now the player works in another category and answers a plan mail there.
  engineActive = { career_id: 'media', role_id: 'med_journalist', title: 'Journalist' };
  pending = { status: 'pending', event: { id: 'plan_e2e', source_type: 'planned', mail_type: 'job' } };
  await answerThroughEligibility(engine, 'plan_e2e', 'A');
  assert.strictEqual(engineState.career_reentry_locks.naeringsliv.status, 'cleared', 'plan mail in another category clears the lock (middleware)');
  assert.strictEqual(engineState.career_reentry_locks.naeringsliv.cleared_by_category, 'media', 'middleware clear records the clearing category');

`;
test = test.slice(0, e2eStart) + e2eReplacement + test.slice(e2eEnd);
fs.writeFileSync(testFile, test);

console.log('Patched JobEligibility answer ownership to ChoiceDirector middleware priority 50 and updated domain regression');
