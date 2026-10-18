// The wave-A Life Story adapter projects the *current, validated* Life Story
// scene into the existing Civication inbox. It owns no story save or day clock.
(function () {
  "use strict";

  const SOURCE = "lifestory_wave_a";
  const DIRECTOR_NAME = "wave_a_lifestory_answer";
  let synchronizing = false;

  function isWaveEvent(event) {
    return event?.source_type === SOURCE && typeof event?.id === "string";
  }

  function sync() {
    const mail = window.CivicationMailEngine;
    const ui = window.CivicationLifestoryUI;
    if (!mail?.getInbox || !mail?.getMail || !ui?.getPendingWaveAEvent || synchronizing) return false;
    synchronizing = true;
    try {
      const pending = ui.getPendingWaveAEvent() || window.CivicationWaveAPrivateRoleBridge?.getPendingEvent?.() || null;
      // Never keep an unreachable Life Story action blocking a new job or
      // day. Archiving is NOT answering, canceling or claiming completion.
      for (const item of mail.getInbox()) {
        const event = item?.event;
        if (!isWaveEvent(event) || item?.resolved === true) continue;
        if (event.id !== pending?.id) mail.setArchived?.(event.id, true);
      }
      if (!pending) return false;
      const existing = mail.getMail(pending.id);
      if (existing) {
        if (!existing.resolved && existing.archived) mail.setArchived?.(pending.id, false);
        return !existing.resolved;
      }
      return mail.sendMail(pending)?.ok === true;
    } finally {
      synchronizing = false;
    }
  }

  function afterChoice(roleId, sceneId, choiceId) {
    const id = "wa_lifestory__" + String(roleId) + "__" + String(sceneId);
    // This is called ONLY after the canonical runner has accepted and saved
    // the choice. The archived envelope is the inbox projection of that truth.
    window.CivicationMailEngine?.markResolved?.(id, id, choiceId);
    sync();
  }

  async function answer(eventId, choiceId) {
    const ui = window.CivicationLifestoryUI;
    const event = ui?.getPendingWaveAEvent?.() || window.CivicationWaveAPrivateRoleBridge?.getPendingEvent?.() || null;
    const id = String(eventId || "").trim();
    const choice = String(choiceId || "").trim();
    if (!event || event.id !== id) return { ok: false, reason: "story_scene_not_current" };
    if (!event.choices.some(row => row.id === choice)) return { ok: false, reason: "bad_choice" };
    const mail = window.CivicationMailEngine?.getMail?.(id);
    if (!mail || mail.resolved || mail.archived) return { ok: false, reason: "mail_not_open" };
    const result = event.lifestory_inactive_role === true
      ? await window.CivicationWaveAPrivateRoleBridge?.answer?.(id, choice)
      : ui.answerWaveAChoice?.(id, choice);
    return result?.ok === true ? { ...result, waveAInboxAnswered: true } :
      { ok: false, reason: result?.reason || "story_answer_rejected" };
  }

  // EventEngine.answer also passes the same boundary when invoked from
  // legacy player surfaces, while normal inbox and Next Action use
  // CivicationMailEngine.answerMail.
  async function answerMiddleware(ctx, next) {
    if (!isWaveEvent(ctx?.eventObj)) return next();
    if (ctx.eventObj.id !== ctx?.eventId) return { ok: false, reason: "not_found" };
    return answer(ctx.eventId, ctx.choiceId);
  }

  function registerMiddleware() {
    const director = window.CivicationChoiceDirector;
    if (director?.registerAnswerMiddleware) {
      return director.registerAnswerMiddleware(DIRECTOR_NAME, answerMiddleware, 30);
    }
    const key = "__civicationChoiceAnswerMiddlewareQueue";
    const queue = window[key] ||= [];
    if (!queue.some(entry => entry?.name === DIRECTOR_NAME)) {
      queue.push({ name: DIRECTOR_NAME, fn: answerMiddleware, priority: 30 });
    }
    return true;
  }

  window.CivicationWaveAInboxBridge = Object.freeze({
    sync, answer, afterChoice, registerMiddleware, isWaveEvent
  });

  registerMiddleware();
  for (const eventName of ["civi:lifestoryChanged", "civi:booted", "civi:dayPhaseChanged", "updateProfile"]) {
    window.addEventListener(eventName, sync);
  }
  // The Life Story UI initializes before the shell loader; the boot event
  // creates the first inbox projection once MailEngine is available.
})();
