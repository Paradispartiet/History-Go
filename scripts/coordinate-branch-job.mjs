import fs from 'node:fs';

function replaceOnce(source, needle, replacement, label) {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(needle, replacement);
}

// -----------------------------------------------------------------------------
// 1. JobLearning answer ownership -> ChoiceDirector middleware priority 60.
// -----------------------------------------------------------------------------
const runtimeFile = 'js/Civication/systems/civicationJobLearningRuntime.js';
let runtime = fs.readFileSync(runtimeFile, 'utf8');

const ratioAnchor = '  const NEARING_RATIO = 0.6;\n';
runtime = replaceOnce(
  runtime,
  ratioAnchor,
  `${ratioAnchor}  const ANSWER_MIDDLEWARE_NAME = "job_learning_runtime";\n  const ANSWER_MIDDLEWARE_PRIORITY = 60;\n  const ANSWER_MIDDLEWARE_QUEUE_KEY = "__civicationChoiceAnswerMiddlewareQueue";\n`,
  'learning constants'
);

const answerStart = runtime.indexOf('  // Patch CivicationEventEngine.answer to record a learning step');
const answerEnd = runtime.indexOf('\n  function boot() {', answerStart);
if (answerStart < 0 || answerEnd <= answerStart) throw new Error('learning answer block not found');

const middlewareBlock = `  // ChoiceDirector around-answer middleware: capture the active role before the inner
  // chain because an outcome may clear it, then record learning only after a
  // successful qualifying job-mail answer. Never touches career_outcome_state.
  async function jobLearningAnswerMiddleware(ctx, next) {
    const eventObj = ctx?.eventObj || null;
    const active = getActive();
    const result = await next();

    if (result?.ok !== false && eventObj && active) {
      try {
        const patch = recordJobLearningForAnsweredMail(getState(), active, eventObj, { day: currentLearningDay() });
        if (patch) {
          setState(patch);
          try { window.dispatchEvent(new Event("updateProfile")); } catch (_e) {}
        }
      } catch (_err) {
        // Learning progress is best-effort: never break the answer flow.
      }
    }

    return result;
  }

  function registerAnswerMiddleware() {
    const director = window.CivicationChoiceDirector;
    if (director?.registerAnswerMiddleware) {
      return director.registerAnswerMiddleware(
        ANSWER_MIDDLEWARE_NAME,
        jobLearningAnswerMiddleware,
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
        fn: jobLearningAnswerMiddleware,
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
  '    loadProfilesData();\n    patchEventEngineAnswer();',
  '    loadProfilesData();\n    registerAnswerMiddleware();',
  'learning boot'
);

runtime = replaceOnce(
  runtime,
  '    recordJobLearningForAnsweredMail,\n    patchEventEngineAnswer,',
  '    recordJobLearningForAnsweredMail,\n    patchEventEngineAnswer,\n    registerAnswerMiddleware,',
  'learning exports'
);

runtime = replaceOnce(
  runtime,
  '        answer_patched: window.CivicationEventEngine?.prototype?.__civicationJobLearningAnswerPatched === true,',
  '        answer_middleware_registered: window.CivicationChoiceDirector?.listAnswerMiddlewares?.().some?.(entry => entry?.name === ANSWER_MIDDLEWARE_NAME) === true,',
  'learning inspect'
);

if (runtime.includes('proto.answer = async function jobLearningAnswer')) {
  throw new Error('legacy JobLearning answer wrapper still present');
}
fs.writeFileSync(runtimeFile, runtime);

// -----------------------------------------------------------------------------
// 2. Update existing JobLearning E2E test to use registered middleware.
// -----------------------------------------------------------------------------
const testFile = 'tests/civication-job-learning-view-model.test.js';
let test = fs.readFileSync(testFile, 'utf8');

const eventAnchor = "  global.Event = class Event { constructor(type) { this.type = type; } };\n\n";
const fakeDirector = `${eventAnchor}  const registeredAnswerMiddlewares = [];\n  global.CivicationChoiceDirector = {\n    registerAnswerMiddleware(name, fn, priority = 100) {\n      const key = String(name || '');\n      if (!registeredAnswerMiddlewares.some((entry) => entry.name === key)) {\n        registeredAnswerMiddlewares.push({ name: key, fn, priority: Number(priority || 100) });\n        registeredAnswerMiddlewares.sort((a, b) => a.priority - b.priority);\n      }\n      return true;\n    },\n    listAnswerMiddlewares() {\n      return registeredAnswerMiddlewares.map((entry) => ({ name: entry.name, priority: entry.priority }));\n    }\n  };\n\n`;
test = replaceOnce(test, eventAnchor, fakeDirector, 'learning test fake director');

const e2eStart = test.indexOf('  // End-to-end through a patched event engine: answering a planned job mail advances');
const e2eEnd = test.indexOf('  // ===========================================================================\n  // Unlock transferable_skills / teaches at mastery', e2eStart);
if (e2eStart < 0 || e2eEnd <= e2eStart) throw new Error('learning E2E block not found');

const e2eReplacement = `  // End-to-end through registered ChoiceDirector middleware: answering a planned job
  // mail advances stored learning, and re-answering the same mail does not double count.
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

  const originalEngineAnswer = FakeEngine.prototype.answer;
  assert.strictEqual(Runtime.patchEventEngineAnswer(), true, 'compatibility API registers answer middleware');
  assert.strictEqual(Runtime.registerAnswerMiddleware(), true, 'middleware registration is idempotent');
  assert.strictEqual(FakeEngine.prototype.answer, originalEngineAnswer, 'job learning never patches EventEngine.answer directly');
  assert.strictEqual(registeredAnswerMiddlewares.filter((entry) => entry.name === 'job_learning_runtime').length, 1, 'job learning middleware is registered exactly once');
  const learningStage = registeredAnswerMiddlewares.find((entry) => entry.name === 'job_learning_runtime');
  assert(learningStage && typeof learningStage.fn === 'function', 'job learning middleware is available');
  assert.strictEqual(learningStage.priority, 60, 'job learning middleware stays at priority 60');

  async function answerThroughLearning(engine, eventId, choiceId) {
    const pendingSnapshot = engine.getPendingEvent();
    return learningStage.fn(
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
  await answerThroughLearning(engine, 'naer_prog_e2e', 'A');
  assert.strictEqual(engineState.job_learning_progress.naer_prog.steps, 1, 'answering a planned job mail advances learning');
  assert.strictEqual(engineState.job_learning_progress.naer_prog.last_updated_day, 5, 'uses the calendar day');

  await answerThroughLearning(engine, 'naer_prog_e2e', 'A');
  assert.strictEqual(engineState.job_learning_progress.naer_prog.steps, 1, 're-answering the same mail does not double count');

  enginePending = { status: 'pending', event: { id: 'naer_prog_outcome', source_type: 'role_outcome', mail_class: 'career_outcome' } };
  await answerThroughLearning(engine, 'naer_prog_outcome', 'A');
  assert.strictEqual(engineState.job_learning_progress.naer_prog.steps, 1, 'answering the outcome mail does not grant a learning step');

`;
test = test.slice(0, e2eStart) + e2eReplacement + test.slice(e2eEnd);
fs.writeFileSync(testFile, test);

// -----------------------------------------------------------------------------
// 3. Patch-order documentation: Learning is explicit priority 60; three legacy wrappers remain.
// -----------------------------------------------------------------------------
const docsFile = 'docs/CIVICATION_PATCH_ORDER.md';
let docs = fs.readFileSync(docsFile, 'utf8');
const eligibilityRow = '| 50 | `systems/civicationJobEligibilityRuntime.js` | Fanger aktiv jobb før inner svar; oppretter/clearer FIRED reentry-lock kun etter vellykket svar | innenfor Daily / utenfor gjenværende legacy-kjede |\n';
docs = replaceOnce(
  docs,
  eligibilityRow,
  `${eligibilityRow}| 60 | \`systems/civicationJobLearningRuntime.js\` | Fanger aktiv rolle før inner svar; registrerer kvalifiserende jobblæring kun etter vellykket svar | innenfor Eligibility / utenfor gjenværende legacy-kjede |\n`,
  'docs learning row'
);

docs = replaceOnce(
  docs,
  '      → Eligibility pre (capture activeBefore)\n        → gjenværende legacy svarstabel\n      ← Eligibility post (reentry-lock best-effort ved success)',
  '      → Eligibility pre (capture activeBefore)\n        → Learning pre (capture active)\n          → gjenværende legacy svarstabel\n        ← Learning post (jobblæring best-effort ved success)\n      ← Eligibility post (reentry-lock best-effort ved success)',
  'docs nesting'
);

docs = replaceOnce(docs, 'Disse fire modulene wrapper fortsatt', 'Disse tre modulene wrapper fortsatt', 'docs remaining count');
docs = replaceOnce(
  docs,
  '| 70 | `systems/civicationCareerOutcomeRuntime.js` | terminal outcome/FIRED-forberedelse og outcome-state |\n| 60 | `systems/civicationJobLearningRuntime.js` | læringsprogresjon fra besvart jobbmail |',
  '| 70 | `systems/civicationCareerOutcomeRuntime.js` | terminal outcome/FIRED-forberedelse og outcome-state |',
  'docs remove learning legacy row'
);
docs = replaceOnce(docs, '`CivicationChoiceDirector` lastes fortsatt etter disse fire.', '`CivicationChoiceDirector` lastes fortsatt etter disse tre.', 'docs legacy paragraph');
docs = replaceOnce(docs, '- Flytt `civicationJobLearningRuntime` → priority 60.\n', '', 'docs remove goal');
docs = replaceOnce(docs, 'Når disse fire er borte', 'Når disse tre er borte', 'docs final count');
fs.writeFileSync(docsFile, docs);

console.log('Patched JobLearning answer ownership to ChoiceDirector middleware priority 60, updated E2E regression and patch-order docs');
