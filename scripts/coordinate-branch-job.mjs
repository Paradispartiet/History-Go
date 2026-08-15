import fs from 'node:fs';

function replaceOnce(source, needle, replacement, label) {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(needle, replacement);
}

// -----------------------------------------------------------------------------
// 1. MailRuntime answer ownership -> ChoiceDirector middleware priority 80.
//    reset/buildMailPool/pickEventFromPack remain owned by patchEventEngine().
// -----------------------------------------------------------------------------
const runtimeFile = 'js/Civication/systems/civicationMailRuntime.js';
let runtime = fs.readFileSync(runtimeFile, 'utf8');

const runtimeKeyAnchor = '  const RUNTIME_KEY = "mail_runtime_v1";\n';
runtime = replaceOnce(
  runtime,
  runtimeKeyAnchor,
  `${runtimeKeyAnchor}  const ANSWER_MIDDLEWARE_NAME = "mail_runtime";\n  const ANSWER_MIDDLEWARE_PRIORITY = 80;\n  const ANSWER_MIDDLEWARE_QUEUE_KEY = "__civicationChoiceAnswerMiddlewareQueue";\n`,
  'mail runtime constants'
);

const patchAnchor = '  function patchEventEngine() {\n';
const middlewareBlock = `  async function mailRuntimeAnswerMiddleware(ctx, next) {
    const eventObj = ctx?.eventObj || null;
    const eventId = ctx?.eventId;
    const choiceId = ctx?.choiceId;
    const active = getActive();
    const choice = Array.isArray(eventObj?.choices)
      ? eventObj.choices.find(row => norm(row?.id) === norm(choiceId)) || null
      : null;
    const triggerId = norm(choice?.triggers_on_choice);
    const sourcePhaseTag = norm(eventObj?.phase_tag || window.CivicationCalendar?.getPhase?.()) || "morning";

    // Preserve historical timing exactly: planned/thread runtime state is written
    // before the inner answer chain and is not rolled back if the inner answer fails.
    if (eventObj && norm(eventObj.id) === norm(eventId) && choice) {
      const patch = buildRuntimeStatePatchForAnswer(active, eventObj, choiceId);
      if (patch) setState(patch);
    }

    const result = await next();

    if (result?.ok !== false && eventObj && choice) {
      const brandConsequence = window.CivicationBrandJobState?.applyChoiceConsequences?.(eventObj, choice) || null;
      if (brandConsequence && result && typeof result === "object") result.brand_consequence = brandConsequence;
    }

    if (result?.ok !== false && triggerId) {
      await enqueueThread(triggerId, {
        triggeredBy: eventId,
        choiceId,
        sourcePhaseTag,
        replacePending: true
      });
    }

    return result;
  }

  function registerAnswerMiddleware() {
    const director = window.CivicationChoiceDirector;
    if (director?.registerAnswerMiddleware) {
      return director.registerAnswerMiddleware(
        ANSWER_MIDDLEWARE_NAME,
        mailRuntimeAnswerMiddleware,
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
        fn: mailRuntimeAnswerMiddleware,
        priority: ANSWER_MIDDLEWARE_PRIORITY
      });
    }
    return true;
  }

`;
runtime = replaceOnce(runtime, patchAnchor, middlewareBlock + patchAnchor, 'mail runtime middleware insertion');

const answerStart = runtime.indexOf('    const originalAnswer = proto.answer;\n');
const answerEnd = runtime.indexOf('\n\n    proto.__civicationMailRuntimePatched = true;', answerStart);
if (answerStart < 0 || answerEnd <= answerStart) throw new Error('mail runtime answer wrapper block not found');
runtime = runtime.slice(0, answerStart) + runtime.slice(answerEnd + 2);

runtime = replaceOnce(
  runtime,
  '      patched: proto?.__civicationMailRuntimePatched === true,\n',
  '      patched: proto?.__civicationMailRuntimePatched === true,\n      answer_middleware_registered: window.CivicationChoiceDirector?.listAnswerMiddlewares?.().some?.(entry => entry?.name === ANSWER_MIDDLEWARE_NAME) === true,\n',
  'mail runtime inspect'
);

runtime = replaceOnce(
  runtime,
  '  function boot() {\n    patchEventEngine();\n  }',
  '  function boot() {\n    patchEventEngine();\n    registerAnswerMiddleware();\n  }',
  'mail runtime boot'
);

runtime = replaceOnce(
  runtime,
  '    enqueueThread,\n    patchEventEngine\n',
  '    enqueueThread,\n    patchEventEngine,\n    registerAnswerMiddleware\n',
  'mail runtime exports'
);

if (runtime.includes('proto.answer = async function runtimeAnswer')) {
  throw new Error('legacy MailRuntime answer wrapper still present');
}
fs.writeFileSync(runtimeFile, runtime);

// -----------------------------------------------------------------------------
// 2. Full mail-loop integration now loads the canonical ChoiceDirector after the
//    pre-Director runtime modules, matching production adoption of deferred middleware.
// -----------------------------------------------------------------------------
const loopFile = 'tests/civication-mail-loop.test.js';
let loop = fs.readFileSync(loopFile, 'utf8');
const loopLoadAnchor = "  loadScript('js/Civication/systems/civicationLifeMailRuntime.js');\n";
loop = replaceOnce(
  loop,
  loopLoadAnchor,
  `${loopLoadAnchor}  loadScript('js/Civication/systems/civicationSceneInteraction.js');\n  loadScript('js/Civication/systems/day/dayChoiceDirector.js');\n`,
  'mail loop ChoiceDirector load'
);
loop = replaceOnce(
  loop,
  "  assert.strictEqual(\n    global.CivicationMailRuntime.inspect().patched,\n    true,\n    'CivicationMailRuntime should patch EventEngine prototype'\n  );\n",
  "  assert.strictEqual(\n    global.CivicationMailRuntime.inspect().patched,\n    true,\n    'CivicationMailRuntime should patch non-answer EventEngine surfaces'\n  );\n  assert.strictEqual(\n    global.CivicationMailRuntime.inspect().answer_middleware_registered,\n    true,\n    'CivicationMailRuntime answer flow should be registered in ChoiceDirector'\n  );\n",
  'mail loop inspect assertion'
);
fs.writeFileSync(loopFile, loop);

// -----------------------------------------------------------------------------
// 3. Brand integration test uses the real ChoiceDirector pipeline instead of relying
//    on MailRuntime monkey-patching EventEngine.answer.
// -----------------------------------------------------------------------------
const brandFile = 'tests/civication-brand-job-state.test.js';
let brand = fs.readFileSync(brandFile, 'utf8');
brand = replaceOnce(
  brand,
  '  global.window = global;\n',
  '  global.window = global;\n  delete global.CivicationChoiceDirector;\n  delete global.CivicationSceneInteraction;\n  delete global.__civicationChoiceAnswerMiddlewareQueue;\n',
  'brand test reset director'
);
brand = replaceOnce(
  brand,
  "  global.CivicationEventEngine.prototype.answer = async function answer() { return { ok: true }; };\n",
  "  global.CivicationEventEngine.prototype.answer = async function answer() { return this.__answerResult || { ok: true }; };\n",
  'brand test base answer'
);
brand = replaceOnce(
  brand,
  "  loadScript('js/Civication/systems/civicationMailRuntime.js');\n\n  global.CivicationState.setActivePosition(activePosition);",
  "  loadScript('js/Civication/systems/civicationMailRuntime.js');\n  loadScript('js/Civication/systems/civicationSceneInteraction.js');\n  loadScript('js/Civication/systems/day/dayChoiceDirector.js');\n\n  global.CivicationState.setActivePosition(activePosition);",
  'brand test director load'
);
brand = replaceOnce(
  brand,
  "  global.CivicationEventEngine.prototype.answer = async function answerFail() { return { ok: false }; };\n  global.CivicationMailRuntime.patchEventEngine();\n  const engineFail = new global.CivicationEventEngine();",
  "  const engineFail = new global.CivicationEventEngine();\n  engineFail.__answerResult = { ok: false };",
  'brand test failure path'
);
fs.writeFileSync(brandFile, brand);

// -----------------------------------------------------------------------------
// 4. Patch-order documentation: MailRuntime is explicit priority 80; only dayPatches
//    remains as a direct answer wrapper.
// -----------------------------------------------------------------------------
const docsFile = 'docs/CIVICATION_PATCH_ORDER.md';
let docs = fs.readFileSync(docsFile, 'utf8');
const outcomeRow = '| 70 | `systems/civicationCareerOutcomeRuntime.js` | Setter FIRED stability før inner svar uten rollback; anvender terminal outcome-state etter vellykket svar | innenfor Learning / utenfor gjenværende legacy-kjede |\n';
docs = replaceOnce(
  docs,
  outcomeRow,
  `${outcomeRow}| 80 | \`systems/civicationMailRuntime.js\` | Skriver planned/thread mailplan-state før inner svar uten rollback; anvender brandkonsekvens og triggered thread etter vellykket svar | innenfor CareerOutcome / utenfor siste legacy-wrapper |\n`,
  'docs mail runtime row'
);

docs = replaceOnce(
  docs,
  '          → CareerOutcome pre (FIRED stability ved behov)\n            → gjenværende legacy svarstabel\n          ← CareerOutcome post (terminal outcome-state ved success)',
  '          → CareerOutcome pre (FIRED stability ved behov)\n            → MailRuntime pre (planned/thread state ved behov)\n              → siste legacy answer-wrapper\n            ← MailRuntime post (brand / triggered thread ved success)\n          ← CareerOutcome post (terminal outcome-state ved success)',
  'docs mail runtime nesting'
);

docs = replaceOnce(
  docs,
  'Disse to modulene wrapper fortsatt `EventEngine.answer` direkte og skal flyttes inn i middleware-registeret i neste porter. De står her i historisk inner→outer-rekkefølge:',
  'Denne ene modulen wrapper fortsatt `EventEngine.answer` direkte og skal flyttes inn i middleware-registeret i neste port:',
  'docs remaining count'
);
docs = replaceOnce(
  docs,
  '| 90 | `systems/day/dayPatches.js` | recovery/onboarding, task-kapital, fase/followup-koordinering |\n| 80 | `systems/civicationMailRuntime.js` | pre-answer mailplan-state, brandkonsekvens og trigget thread |',
  '| 90 | `systems/day/dayPatches.js` | recovery/onboarding, task-kapital, fase/followup-koordinering |',
  'docs remove mail runtime legacy row'
);
docs = replaceOnce(
  docs,
  '`CivicationChoiceDirector` lastes fortsatt etter disse to. Derfor fanger Director den gjenværende legacy-kjeden som sin terminal og legger de eksplisitte middleware-stegene rundt den. Det er bevisst en overgangstilstand, ikke sluttarkitekturen.',
  '`CivicationChoiceDirector` lastes fortsatt etter `dayPatches`. Derfor fanger Director denne siste legacy-wrapperen som sin terminal og legger de eksplisitte middleware-stegene rundt den. Det er siste overgangstilstand før ChoiceDirector er eneste answer-eier.',
  'docs legacy paragraph'
);
docs = replaceOnce(docs, '- Flytt `civicationMailRuntime` → priority 80.\n', '', 'docs remove mail runtime goal');
docs = replaceOnce(
  docs,
  '- Når disse to er borte, skal `CivicationChoiceDirector` være den eneste modulen som tilordner `CivicationEventEngine.prototype.answer` i den aktive produksjonsruntimen.',
  '- Når `dayPatches` answer-del er flyttet, skal `CivicationChoiceDirector` være den eneste modulen som tilordner `CivicationEventEngine.prototype.answer` i den aktive produksjonsruntimen.',
  'docs final goal'
);
fs.writeFileSync(docsFile, docs);

console.log('Patched MailRuntime answer ownership to ChoiceDirector middleware priority 80, updated integration tests and patch-order docs');
