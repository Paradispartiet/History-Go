import fs from 'node:fs';

function replaceOnce(source, needle, replacement, label) {
  const count = source.split(needle).length - 1;
  if (count !== 1) throw new Error(`${label}: expected exactly one anchor, found ${count}`);
  return source.replace(needle, replacement);
}

// -----------------------------------------------------------------------------
// 1. dayPatches answer ownership -> ChoiceDirector middleware priority 90.
//    onAppOpen, TaskEngine and Jobs patches remain owned by dayPatches.
// -----------------------------------------------------------------------------
const runtimeFile = 'js/Civication/systems/day/dayPatches.js';
let runtime = fs.readFileSync(runtimeFile, 'utf8');

const phasesAnchor = '  const PHASES = ["morning", "lunch", "work", "afternoon", "evening"];\n';
runtime = replaceOnce(
  runtime,
  phasesAnchor,
  `${phasesAnchor}  const ANSWER_MIDDLEWARE_NAME = "day_patches";\n  const ANSWER_MIDDLEWARE_PRIORITY = 90;\n  const ANSWER_MIDDLEWARE_QUEUE_KEY = "__civicationChoiceAnswerMiddlewareQueue";\n`,
  'dayPatches constants'
);

const patchAnchor = '  function patchEventEngine() {\n';
const middlewareBlock = `  async function dayPatchesAnswerMiddleware(ctx, next) {
    const engine = ctx?.engine || null;
    const eventId = ctx?.eventId;
    const choiceId = ctx?.choiceId;
    const pending = ctx?.pending || null;
    const pendingEventId = pending?.event?.id;
    const active = getActive();
    const isOnboarding = !!pending?.event?.onboarding_meta;
    const isRecovery = !!pending?.event?.recovery_meta;
    const phaseTag = inferPhase(pending?.event);

    // Legacy immediate follow-up scenes can fight with phase-owned progression. Preserve
    // the historical dayPatches suppression only around the inner answer call.
    const originalFollowup = engine?.enqueueImmediateFollowupEvent;
    if (engine && phaseTag && typeof originalFollowup === "function") {
      engine.enqueueImmediateFollowupEvent = async () => null;
    }

    const result = await next();

    if (engine && phaseTag && typeof originalFollowup === "function") {
      engine.enqueueImmediateFollowupEvent = originalFollowup;
    }

    if (result?.ok === false) return result;

    if (isOnboarding) {
      let state = getOnboardingState();
      if (pending?.event?.onboarding_meta?.step === "goal") {
        const selectedGoal = String(choiceId || "").trim();
        if (selectedGoal) state = { ...state, goal: selectedGoal };
      }
      state = { ...state, completed: true, completedAt: new Date().toISOString() };
      setOnboardingState(state);

      if (engine && pendingEventId && typeof engine.clearPending === "function") {
        engine.clearPending(pendingEventId);
      }
      if (engine && typeof engine.getPendingEvent === "function" && !engine.getPendingEvent() && typeof engine.onAppOpen === "function") {
        await engine.onAppOpen({ force: true });
      }

      rerenderInbox();
      try { window.dispatchEvent(new Event("updateProfile")); } catch {}
      return result;
    }

    if (!phaseTag) return result;

    const choice = pending?.event?.choices?.find?.(c => c.id === choiceId) || null;
    const phaseBefore = phaseTag;
    const isDaily = isDailyEvent(pending?.event);
    if (choice) {
      window.appendDayChoiceLog?.(phaseBefore, choice, pending?.event || null);
      window.applyPhaseChoiceEffects?.(phaseBefore, choice);
      applyTaskCapitalEffectsIfNeeded(pending?.event || null, choice);
      markCompletedTaskIfNeeded(active, pending?.event || null);
      window.maybeCreateContactFromChoice?.(choice, pending?.event || null);
      maybeRegisterCareerProgression(active, pending?.event || null, choice);
    }

    if (isRecovery) {
      if (engine && pendingEventId && typeof engine.clearPending === "function") {
        engine.clearPending(pendingEventId);
      }
      if (engine && typeof engine.getPendingEvent === "function" && !engine.getPendingEvent() && typeof engine.onAppOpen === "function") {
        await engine.onAppOpen({ force: true });
      }
      rerenderInbox();
      try { window.dispatchEvent(new Event("updateProfile")); } catch {}
      return result;
    }

    const cal = window.CivicationCalendar;
    if (!cal) return result;

    if (!isDaily) {
      const nextPhase = next(phaseBefore);
      if (nextPhase) cal.setPhase(nextPhase);
      else cal.advancePhase?.();
    }

    if (engine && pendingEventId && typeof engine.clearPending === "function") {
      engine.clearPending(pendingEventId);
    }

    // Enqueue next phase item immediately if inbox is empty.
    try {
      if (engine && pendingEventId && typeof engine.clearPending === "function") engine.clearPending(pendingEventId);
      if (engine && typeof engine.getPendingEvent === "function" && !engine.getPendingEvent() && typeof engine.onAppOpen === "function") {
        await engine.onAppOpen({ force: true });
      }
    } catch (_e) {}

    rerenderInbox();
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
    return result;
  }

  function registerAnswerMiddleware() {
    const director = window.CivicationChoiceDirector;
    if (director?.registerAnswerMiddleware) {
      return director.registerAnswerMiddleware(
        ANSWER_MIDDLEWARE_NAME,
        dayPatchesAnswerMiddleware,
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
        fn: dayPatchesAnswerMiddleware,
        priority: ANSWER_MIDDLEWARE_PRIORITY
      });
    }
    return true;
  }

`;
runtime = replaceOnce(runtime, patchAnchor, middlewareBlock + patchAnchor, 'dayPatches middleware insertion');

runtime = replaceOnce(
  runtime,
  '    const legacyOnAppOpen = proto.onAppOpen;\n    const legacyAnswer = proto.answer;\n',
  '    const legacyOnAppOpen = proto.onAppOpen;\n',
  'dayPatches remove legacy answer capture'
);

const answerStart = runtime.indexOf('    proto.answer = async function phasedAnswer(eventId, choiceId) {\n');
const answerEnd = runtime.indexOf('\n    if (!proto.__civiOnAppOpenPatched && typeof proto.onAppOpen === "function") {', answerStart);
if (answerStart < 0 || answerEnd <= answerStart) throw new Error('dayPatches direct answer wrapper block not found');
runtime = runtime.slice(0, answerStart) + runtime.slice(answerEnd);

runtime = replaceOnce(
  runtime,
  '  function initPatches() {\n  patchEventEngine();\n  patchTaskEngine();\n  patchJobs();\n}',
  '  function initPatches() {\n  patchEventEngine();\n  registerAnswerMiddleware();\n  patchTaskEngine();\n  patchJobs();\n}',
  'dayPatches init registration'
);

if (runtime.includes('proto.answer = async function phasedAnswer')) {
  throw new Error('legacy dayPatches answer wrapper still present');
}
fs.writeFileSync(runtimeFile, runtime);

// -----------------------------------------------------------------------------
// 2. Final patch-order documentation: zero active legacy answer wrappers.
// -----------------------------------------------------------------------------
const docsFile = 'docs/CIVICATION_PATCH_ORDER.md';
let docs = fs.readFileSync(docsFile, 'utf8');
const mailRow = '| 80 | `systems/civicationMailRuntime.js` | Skriver planned/thread mailplan-state før inner svar uten rollback; anvender brandkonsekvens og triggered thread etter vellykket svar | innenfor CareerOutcome / utenfor siste legacy-wrapper |\n';
docs = replaceOnce(
  docs,
  mailRow,
  `${mailRow}| 90 | \`systems/day/dayPatches.js\` | Undertrykker legacy immediate-followup rundt inner svar; anvender onboarding/recovery, choice-logg, faseeffekter, task-kapital, kontakter og fase/followup-koordinering etter vellykket svar | innerst før base EventEngine.answer |\n`,
  'docs dayPatches row'
);

docs = replaceOnce(
  docs,
  '            → MailRuntime pre (planned/thread state ved behov)\n              → siste legacy answer-wrapper\n            ← MailRuntime post (brand / triggered thread ved success)',
  '            → MailRuntime pre (planned/thread state ved behov)\n              → dayPatches pre (suppress immediate followup ved fase-event)\n                → base `CivicationEventEngine.answer`\n              ← dayPatches post (onboarding/recovery/fase/task/choice-effekter ved success)\n            ← MailRuntime post (brand / triggered thread ved success)',
  'docs final nesting'
);

const legacyStart = docs.indexOf('### Gjenværende legacy `answer`-wrappere\n');
const legacyEnd = docs.indexOf('\n### Valg-handler-registeret\n', legacyStart);
if (legacyStart < 0 || legacyEnd <= legacyStart) throw new Error('docs legacy answer section not found');
const finalOwnership = `### Gjenværende legacy \`answer\`-wrappere

**Ingen i standard Civication-runtime.** \`CivicationChoiceDirector\` er nå eneste aktive modul som tilordner \`CivicationEventEngine.prototype.answer\`. Alle tidligere rundt-svar-wrappere er eksplisitte middleware-steg med prioritet 10–90, og Director kaller den opprinnelige \`EventEngine.answer\` som terminal.

Dette er låst av en egen eierskapsregresjon som leser den faktiske \`DAY_SCRIPTS\`-lista i \`civicationShellLoader.js\` og krever at bare \`dayChoiceDirector.js\` inneholder en direkte \`proto.answer = ...\`-tilordning.
`;
docs = docs.slice(0, legacyStart) + finalOwnership + docs.slice(legacyEnd);

docs = docs.replace('- Flytt `dayPatches` answer-del → priority 90.\n', '');
docs = docs.replace('- Når `dayPatches` answer-del er flyttet, skal `CivicationChoiceDirector` være den eneste modulen som tilordner `CivicationEventEngine.prototype.answer` i den aktive produksjonsruntimen.', '- **Fullført:** `CivicationChoiceDirector` er eneste aktive produksjonsmodul som tilordner `CivicationEventEngine.prototype.answer`; base-implementasjonen er terminalen under middleware 90.');
fs.writeFileSync(docsFile, docs);

console.log('Patched dayPatches answer ownership to ChoiceDirector middleware priority 90 and finalized answer ownership docs');
