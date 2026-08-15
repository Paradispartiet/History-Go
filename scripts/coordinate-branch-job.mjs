import fs from 'node:fs';

function replaceOnce(source, needle, replacement, label) {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(needle, replacement);
}

// -----------------------------------------------------------------------------
// 1. CareerOutcome answer ownership -> ChoiceDirector middleware priority 70.
//    Candidate/buildMailPool wrappers remain untouched; this port moves only answer().
// -----------------------------------------------------------------------------
const runtimeFile = 'js/Civication/systems/civicationCareerOutcomeRuntime.js';
let runtime = fs.readFileSync(runtimeFile, 'utf8');

const constantsAnchor = '  const TERMINAL_STATUSES = ["PROMOTED", "STAGNATED", "FIRED"];\n';
runtime = replaceOnce(
  runtime,
  constantsAnchor,
  `${constantsAnchor}  const ANSWER_MIDDLEWARE_NAME = "career_outcome_runtime";\n  const ANSWER_MIDDLEWARE_PRIORITY = 70;\n  const ANSWER_MIDDLEWARE_QUEUE_KEY = "__civicationChoiceAnswerMiddlewareQueue";\n`,
  'career outcome constants'
);

const answerStart = runtime.indexOf('  function patchEventEngineAnswer() {\n');
const answerEnd = runtime.indexOf('\n  // Pure, DOM-free view model', answerStart);
if (answerStart < 0 || answerEnd <= answerStart) throw new Error('career outcome answer block not found');

const middlewareBlock = `  async function careerOutcomeAnswerMiddleware(ctx, next) {
    const eventObj = ctx?.eventObj || null;
    const isOutcome = norm(eventObj?.source_type) === "role_outcome" || norm(eventObj?.mail_class) === "career_outcome";

    // Preserve the historical pre-answer FIRED mutation exactly. It deliberately has
    // no rollback: inner answer failures still leave stability=FIRED, just as the
    // previous direct wrapper did.
    const outcomeStatus = norm(eventObj?.career_outcome_meta?.status);
    if (isOutcome && outcomeStatus === "FIRED") {
      /** @type {{ consumed?: Record<string, unknown> } | null | undefined} */
      const current = getState();
      const consumed = (current && typeof current.consumed === "object" && current.consumed !== null)
        ? { ...current.consumed }
        : {};
      setState({ stability: "FIRED", consumed });
    }

    const result = await next();

    if (result?.ok !== false && isOutcome) {
      applyOutcomeState(eventObj);
      try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    }

    return result;
  }

  function registerAnswerMiddleware() {
    const director = window.CivicationChoiceDirector;
    if (director?.registerAnswerMiddleware) {
      return director.registerAnswerMiddleware(
        ANSWER_MIDDLEWARE_NAME,
        careerOutcomeAnswerMiddleware,
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
        fn: careerOutcomeAnswerMiddleware,
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
  '    patchEventEngineBuildMailPool();\n    patchEventEngineAnswer();',
  '    patchEventEngineBuildMailPool();\n    registerAnswerMiddleware();',
  'career outcome boot'
);

runtime = replaceOnce(
  runtime,
  '    patchEventEngineBuildMailPool,\n    patchEventEngineAnswer,',
  '    patchEventEngineBuildMailPool,\n    patchEventEngineAnswer,\n    registerAnswerMiddleware,',
  'career outcome exports'
);

runtime = replaceOnce(
  runtime,
  '        answer_patched: window.CivicationEventEngine?.prototype?.__civicationCareerOutcomeAnswerPatched === true,',
  '        answer_middleware_registered: window.CivicationChoiceDirector?.listAnswerMiddlewares?.().some?.(entry => entry?.name === ANSWER_MIDDLEWARE_NAME) === true,',
  'career outcome inspect'
);

if (runtime.includes('proto.answer = async function outcomeAnswer')) {
  throw new Error('legacy CareerOutcome answer wrapper still present');
}
fs.writeFileSync(runtimeFile, runtime);

// -----------------------------------------------------------------------------
// 2. Existing domain test: run answer assertions through registered middleware.
// -----------------------------------------------------------------------------
const testFile = 'tests/civication-career-outcomes.test.js';
let test = fs.readFileSync(testFile, 'utf8');

const eventAnchor = "  global.Event = class Event { constructor(type) { this.type = type; } };\n";
const fakeDirector = `${eventAnchor}\n  const registeredAnswerMiddlewares = [];\n  global.CivicationChoiceDirector = {\n    registerAnswerMiddleware(name, fn, priority = 100) {\n      const key = String(name || '');\n      if (!registeredAnswerMiddlewares.some((entry) => entry.name === key)) {\n        registeredAnswerMiddlewares.push({ name: key, fn, priority: Number(priority || 100) });\n        registeredAnswerMiddlewares.sort((a, b) => a.priority - b.priority);\n      }\n      return true;\n    },\n    listAnswerMiddlewares() {\n      return registeredAnswerMiddlewares.map((entry) => ({ name: entry.name, priority: entry.priority }));\n    }\n  };\n`;
test = replaceOnce(test, eventAnchor, fakeDirector, 'career outcome test fake director');

const classAnchor = `  global.CivicationEventEngine = CivicationEventEngine;\n`;
test = replaceOnce(
  test,
  classAnchor,
  `  const originalEventEngineAnswer = CivicationEventEngine.prototype.answer;\n${classAnchor}`,
  'career outcome original answer capture'
);

const loadAnchor = "  loadScript('js/Civication/systems/civicationCareerOutcomeRuntime.js');\n\n";
const loadInsert = `${loadAnchor}  assert.strictEqual(CivicationEventEngine.prototype.answer, originalEventEngineAnswer, 'career outcome must not patch EventEngine.answer directly');\n  assert.strictEqual(global.CivicationCareerOutcomeRuntime.registerAnswerMiddleware(), true, 'middleware registration is idempotent');\n  assert.strictEqual(registeredAnswerMiddlewares.filter((entry) => entry.name === 'career_outcome_runtime').length, 1, 'career outcome middleware registers exactly once');\n  const outcomeStage = registeredAnswerMiddlewares.find((entry) => entry.name === 'career_outcome_runtime');\n  assert(outcomeStage && typeof outcomeStage.fn === 'function', 'career outcome middleware is available');\n  assert.strictEqual(outcomeStage.priority, 70, 'career outcome middleware stays at priority 70');\n\n  async function answerThroughOutcome(engine, eventId, choiceId) {\n    const pendingSnapshot = engine.getPendingEvent();\n    return outcomeStage.fn(\n      {\n        engine,\n        eventId,\n        choiceId,\n        pending: pendingSnapshot,\n        eventObj: pendingSnapshot?.event || null\n      },\n      () => originalEventEngineAnswer.call(engine, eventId, choiceId)\n    );\n  }\n\n`;
test = replaceOnce(test, loadAnchor, loadInsert, 'career outcome test middleware helper');

test = replaceOnce(
  test,
  "  await new global.CivicationEventEngine({ status: 'pending', event: outcomeEvent }).answer('answer_outcome', 'A');",
  "  await answerThroughOutcome(new global.CivicationEventEngine({ status: 'pending', event: outcomeEvent }), 'answer_outcome', 'A');",
  'career outcome promoted answer'
);

test = replaceOnce(
  test,
  "  await new global.CivicationEventEngine({ status: 'pending', event: personalEvent }).answer('personal_001', 'A');",
  "  await answerThroughOutcome(new global.CivicationEventEngine({ status: 'pending', event: personalEvent }), 'personal_001', 'A');",
  'career outcome personal answer'
);
fs.writeFileSync(testFile, test);

// -----------------------------------------------------------------------------
// 3. Patch-order documentation: CareerOutcome is explicit priority 70; two direct
//    answer wrappers remain (MailRuntime and dayPatches).
// -----------------------------------------------------------------------------
const docsFile = 'docs/CIVICATION_PATCH_ORDER.md';
let docs = fs.readFileSync(docsFile, 'utf8');
const learningRow = '| 60 | `systems/civicationJobLearningRuntime.js` | Fanger aktiv rolle før inner svar; registrerer kvalifiserende jobblæring kun etter vellykket svar | innenfor Eligibility / utenfor gjenværende legacy-kjede |\n';
docs = replaceOnce(
  docs,
  learningRow,
  `${learningRow}| 70 | \`systems/civicationCareerOutcomeRuntime.js\` | Setter FIRED stability før inner svar uten rollback; anvender terminal outcome-state etter vellykket svar | innenfor Learning / utenfor gjenværende legacy-kjede |\n`,
  'docs career outcome row'
);

docs = replaceOnce(
  docs,
  '        → Learning pre (capture active)\n          → gjenværende legacy svarstabel\n        ← Learning post (jobblæring best-effort ved success)',
  '        → Learning pre (capture active)\n          → CareerOutcome pre (FIRED stability ved behov)\n            → gjenværende legacy svarstabel\n          ← CareerOutcome post (terminal outcome-state ved success)\n        ← Learning post (jobblæring best-effort ved success)',
  'docs career outcome nesting'
);

docs = replaceOnce(docs, 'Disse tre modulene wrapper fortsatt', 'Disse to modulene wrapper fortsatt', 'docs remaining count');
docs = replaceOnce(
  docs,
  '| 80 | `systems/civicationMailRuntime.js` | pre-answer mailplan-state, brandkonsekvens og trigget thread |\n| 70 | `systems/civicationCareerOutcomeRuntime.js` | terminal outcome/FIRED-forberedelse og outcome-state |',
  '| 80 | `systems/civicationMailRuntime.js` | pre-answer mailplan-state, brandkonsekvens og trigget thread |',
  'docs remove career outcome legacy row'
);
docs = replaceOnce(docs, '`CivicationChoiceDirector` lastes fortsatt etter disse tre.', '`CivicationChoiceDirector` lastes fortsatt etter disse to.', 'docs legacy paragraph');
docs = replaceOnce(docs, '- Flytt `civicationCareerOutcomeRuntime` → priority 70.\n', '', 'docs remove career outcome goal');
docs = replaceOnce(docs, 'Når disse tre er borte', 'Når disse to er borte', 'docs final count');
fs.writeFileSync(docsFile, docs);

console.log('Patched CareerOutcome answer ownership to ChoiceDirector middleware priority 70, updated domain regression and patch-order docs');
