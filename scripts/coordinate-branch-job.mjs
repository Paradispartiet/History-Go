import fs from 'node:fs';

const file = 'js/Civication/systems/civicationDailyMailBuilder.js';
let source = fs.readFileSync(file, 'utf8');

const constantsAnchor = '  const PATCHED_FLAG = "__civicationDailyMailBuilderPatched";\n';
const constantsInsert = `${constantsAnchor}  const ANSWER_MIDDLEWARE_NAME = "daily_mail_builder";\n  const ANSWER_MIDDLEWARE_PRIORITY = 40;\n  const ANSWER_MIDDLEWARE_QUEUE_KEY = "__civicationChoiceAnswerMiddlewareQueue";\n`;
if (!source.includes(constantsAnchor)) throw new Error('Daily constants anchor missing');
if (source.includes('const ANSWER_MIDDLEWARE_NAME = "daily_mail_builder"')) throw new Error('Daily middleware constants already present');
source = source.replace(constantsAnchor, constantsInsert);

const patchStart = source.indexOf('  function patchEventEngine() {\n');
const patchEnd = source.indexOf('\n  async function startToday(options = {}) {', patchStart);
if (patchStart < 0 || patchEnd < 0) throw new Error('Daily patchEventEngine block not found');

const replacement = `  async function dailyMailAnswerMiddleware(ctx, next) {
    const engine = ctx?.engine || null;
    const eventObj = ctx?.eventObj || null;
    const eventId = norm(eventObj?.id || ctx?.eventId);
    const choiceId = norm(ctx?.choiceId);
    const daily = isDailyEvent(eventObj);

    // Mark the daily runtime before the remaining inner answer pipeline runs so
    // dayPatches/onAppOpen can advance to the next runtime item, but keep the
    // inbox item pending until EventEngine has consumed it. Resolving the mail
    // here caused the inner answer chain to return not_found and forced
    // NextActionUI into its slow deliverQueuedAction fallback.
    if (daily) await markAnswered(eventId, choiceId, { resolveMail: false });

    let result;
    const typedEngine = /** @type {{ __civiSuppressImmediateFollowup?: boolean }} */ (engine || {});
    const previousSuppress = typedEngine.__civiSuppressImmediateFollowup;
    if (daily && engine) typedEngine.__civiSuppressImmediateFollowup = true;
    try {
      result = await next();
    } finally {
      if (daily && engine) typedEngine.__civiSuppressImmediateFollowup = previousSuppress === true;
    }

    if (daily && result?.ok !== false) {
      try { window.CivicationMailEngine?.markResolved?.(eventId, eventId, choiceId); } catch {}
      result = { ...(result || {}), dailyRuntimeAnswered: true };
    }

    if (daily && result?.ok === false) {
      // Restore as delivered if the answer did not go through.
      const runtime = getRuntime();
      if (runtime && Array.isArray(runtime.items)) {
        const items = runtime.items.map(row => {
          if (norm(row?.event?.id) !== eventId) return row;
          return { ...row, status: "delivered", choice_id: null, answered_at: null };
        });
        setRuntime({
          ...runtime,
          answered_ids: (Array.isArray(runtime.answered_ids) ? runtime.answered_ids : []).filter(x => norm(x) !== eventId),
          items
        });
      }
    }

    return result;
  }

  function registerAnswerMiddleware() {
    const director = window.CivicationChoiceDirector;
    if (director?.registerAnswerMiddleware) {
      return director.registerAnswerMiddleware(
        ANSWER_MIDDLEWARE_NAME,
        dailyMailAnswerMiddleware,
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
        fn: dailyMailAnswerMiddleware,
        priority: ANSWER_MIDDLEWARE_PRIORITY
      });
    }
    return true;
  }

  function patchEventEngine() {
    const proto = window.CivicationEventEngine?.prototype;
    if (!proto || typeof proto.onAppOpen !== "function") {
      registerAnswerMiddleware();
      return false;
    }
    if (proto[PATCHED_FLAG]) {
      registerAnswerMiddleware();
      return false;
    }

    const previousOnAppOpen = proto.onAppOpen;
    proto[PATCHED_FLAG] = true;

    proto.onAppOpen = async function dailyMailOnAppOpen(opts = {}) {
      const active = getActive();
      const skipDaily = opts && opts.skipDailyMailBuilder === true;

      if (active && !skipDaily && !hasPending(this)) {
        const result = await enqueueNext(this, { active, forceNew: opts.forceNewDailyMail === true });
        if (result?.enqueued || result?.reason === "day_complete") return result;
      }

      return previousOnAppOpen.call(this, opts);
    };

    registerAnswerMiddleware();
    return true;
  }
`;
source = source.slice(0, patchStart) + replacement + source.slice(patchEnd);

const inspectAnchor = '      patched: window.CivicationEventEngine?.prototype?.[PATCHED_FLAG] === true,\n';
const inspectInsert = `${inspectAnchor}      answer_middleware_registered: window.CivicationChoiceDirector?.listAnswerMiddlewares?.().some?.(entry => entry?.name === ANSWER_MIDDLEWARE_NAME) === true,\n`;
if (!source.includes(inspectAnchor)) throw new Error('Daily inspect anchor missing');
source = source.replace(inspectAnchor, inspectInsert);

const exportAnchor = '    answerBundleItem: markAnswered,\n';
const exportInsert = `${exportAnchor}    registerAnswerMiddleware,\n`;
if (!source.includes(exportAnchor)) throw new Error('Daily export anchor missing');
source = source.replace(exportAnchor, exportInsert);

if (source.includes('proto.answer = async function dailyMailAnswer')) throw new Error('Legacy Daily answer wrapper still present');
fs.writeFileSync(file, source);
console.log('Patched CivicationDailyMailBuilder answer ownership to ChoiceDirector middleware priority 40');
