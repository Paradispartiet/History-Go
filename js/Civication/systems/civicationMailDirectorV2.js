(function () {
  "use strict";

  const DIRECTOR_KEY = "mail_director_v2";
  const VALID_MAIL_TYPES = new Set(["job", "faction_choice", "people", "story", "conflict", "event"]);

  function normStr(v) {
    return String(v || "").trim();
  }

  function unique(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(normStr).filter(Boolean))];
  }

  function getState() {
    return window.CivicationState?.getState?.() || {};
  }

  function setState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
  }

  function getInbox() {
    return window.CivicationState?.getInbox?.() || [];
  }

  function setInbox(arr) {
    window.CivicationState?.setInbox?.(Array.isArray(arr) ? arr : []);
    window.dispatchEvent(new Event("updateProfile"));
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function isPhaseEvent(ev) {
    const id = normStr(ev?.id);
    return id.startsWith("phase_") || !!normStr(ev?.phase_tag);
  }

  function isNavEvent(ev) {
    return normStr(ev?.source) === "NAV" || normStr(ev?.id).startsWith("nav_auto_") || normStr(ev?.stage) === "unemployed";
  }

  function isCivicationMail(ev) {
    const id = normStr(ev?.id);
    const type = normStr(ev?.mail_type);
    if (!id || !type) return false;
    if (isPhaseEvent(ev) || isNavEvent(ev)) return false;
    return VALID_MAIL_TYPES.has(type);
  }

  function getDirectorState(state) {
    const src = state?.[DIRECTOR_KEY] && typeof state[DIRECTOR_KEY] === "object" ? state[DIRECTOR_KEY] : {};
    return {
      version: 2,
      shown_ids: unique(src.shown_ids),
      answered_ids: unique(src.answered_ids),
      blocked_recent_ids: unique(src.blocked_recent_ids).slice(-12),
      last_event_id: normStr(src.last_event_id) || null,
      last_mail_type: normStr(src.last_mail_type) || null,
      last_family: normStr(src.last_family) || null,
      last_phase: normStr(src.last_phase) || null,
      turn_index: Number(src.turn_index || 0),
      updated_at: src.updated_at || null
    };
  }

  function getConsumedIds(state) {
    const consumed = state?.consumed && typeof state.consumed === "object" ? Object.keys(state.consumed) : [];
    const mailSystem = state?.mail_system && typeof state.mail_system === "object" ? state.mail_system : {};
    const historyIds = Array.isArray(mailSystem.history) ? mailSystem.history.map((row) => row?.id) : [];
    const director = getDirectorState(state);
    const pendingIds = getInbox().map((item) => item?.event?.id || item?.id);
    return unique([
      ...consumed,
      ...(Array.isArray(mailSystem.consumed_mail_ids) ? mailSystem.consumed_mail_ids : []),
      ...historyIds,
      ...director.shown_ids,
      ...director.answered_ids,
      ...pendingIds.filter(Boolean)
    ]);
  }

  function stateWithMergedConsumed(state) {
    const merged = { ...(state || {}) };
    const consumedMap = {
      ...(state?.consumed && typeof state.consumed === "object" ? state.consumed : {})
    };
    getConsumedIds(state).forEach((id) => {
      consumedMap[id] = true;
    });
    merged.consumed = consumedMap;
    return merged;
  }

  function syncPlanProgressFromMailSystem() {
    const state = getState();
    const ms = state.mail_system && typeof state.mail_system === "object" ? state.mail_system : null;
    const planId = normStr(ms?.role_plan_id);
    if (!planId) return null;

    const next = {
      role_plan_id: planId,
      step_index: Math.max(0, Number(ms?.step_index || 0)),
      current_step_type: normStr(state.mail_plan_progress?.current_step_type)
    };

    const cur = state.mail_plan_progress || {};
    if (normStr(cur.role_plan_id) !== next.role_plan_id || Number(cur.step_index || 0) !== next.step_index) {
      setState({ mail_plan_progress: next });
    }
    return next;
  }

  function phase() {
    return normStr(window.CivicationCalendar?.getPhase?.()) || "morning";
  }

  function phaseLabel(p) {
    switch (normStr(p)) {
      case "morning": return "morgen";
      case "lunch": return "lunsj";
      case "afternoon": return "ettermiddag";
      case "evening": return "kveld";
      case "day_end": return "dagslutt";
      default: return "arbeidsdagen";
    }
  }

  function contextualLine(mail, state, p) {
    const parts = [];
    const faction = normStr(state.activeFaction);
    if (faction) parts.push(`Fraksjonsvalget ditt (${faction}) ligger i bakgrunnen for saken.`);
    if (normStr(mail?.people_ref)) parts.push("Dette er ikke en løs oppgave, men en persontråd som kan utvikle tillit, motstand eller allianse.");
    if (normStr(mail?.source_place_ref)) parts.push(`Saken er koblet til et sted du har åpnet: ${normStr(mail.source_place_ref)}.`);
    const last = Array.isArray(state?.mail_system?.history) ? state.mail_system.history[state.mail_system.history.length - 1] : null;
    if (last?.id) parts.push(`Forrige sak i rollen var ${normStr(last.mail_family || last.id)}.`);
    parts.push(`Den kommer inn i ${phaseLabel(p)}sfasen av arbeidsdagen.`);
    return parts.join(" ");
  }

  function enrichMail(mail, state, active) {
    const p = phase();
    const baseSituation = Array.isArray(mail?.situation) ? mail.situation.map(normStr).filter(Boolean) : [];
    const line = contextualLine(mail, state, p);
    const alreadyHasLine = baseSituation.includes(line);
    const situation = alreadyHasLine ? baseSituation : [line, ...baseSituation];

    const choices = Array.isArray(mail?.choices) ? mail.choices.map((choice) => ({ ...choice })) : [];

    return {
      ...mail,
      phase_tag: p,
      situation,
      choices,
      director_v2: {
        active: {
          career_id: normStr(active?.career_id),
          title: normStr(active?.title),
          role_key: normStr(active?.role_key),
          role_id: normStr(active?.role_id)
        },
        activeFaction: normStr(state.activeFaction),
        phase: p,
        selected_at: new Date().toISOString(),
        source_place_ref: normStr(mail?.source_place_ref),
        people_ref: normStr(mail?.people_ref),
        mail_family: normStr(mail?.mail_family),
        mail_type: normStr(mail?.mail_type)
      },
      role_content_meta: {
        ...(mail?.role_content_meta || {}),
        director_v2: true,
        phase: p,
        activeFaction: normStr(state.activeFaction)
      }
    };
  }

  function markShown(eventObj) {
    if (!isCivicationMail(eventObj)) return null;
    const state = getState();
    const d = getDirectorState(state);
    const next = {
      ...d,
      shown_ids: unique([...d.shown_ids, eventObj.id]),
      blocked_recent_ids: unique([...d.blocked_recent_ids, eventObj.id]).slice(-12),
      last_event_id: normStr(eventObj.id),
      last_mail_type: normStr(eventObj.mail_type),
      last_family: normStr(eventObj.mail_family),
      last_phase: normStr(eventObj.phase_tag || phase()),
      turn_index: Number(d.turn_index || 0) + 1,
      updated_at: new Date().toISOString()
    };
    setState({ [DIRECTOR_KEY]: next });
    return next;
  }

  function markAnswered(eventObj) {
    if (!isCivicationMail(eventObj)) return null;
    const state = getState();
    const d = getDirectorState(state);
    const next = {
      ...d,
      answered_ids: unique([...d.answered_ids, eventObj.id]),
      updated_at: new Date().toISOString()
    };
    setState({ [DIRECTOR_KEY]: next });
    return next;
  }

  function getPending() {
    return getInbox().find((item) => item && item.status === "pending") || null;
  }

  async function ensureBase(engine, active) {
    window.CivicationActiveRoleStateSync?.syncActiveRoleState?.();
    syncPlanProgressFromMailSystem();
    if (engine?.ensureConflictState) await engine.ensureConflictState(active);
    if (engine?.ensureMailSystemState) await engine.ensureMailSystemState(active);
    syncPlanProgressFromMailSystem();
  }

  async function chooseNextMail(engine, opts = {}) {
    const active = getActive();
    if (!active) return null;
    await ensureBase(engine, active);

    const state = stateWithMergedConsumed(getState());
    const candidates = await window.CiviMailPlanBridge?.makeCandidateMailsForActiveRole?.(active, state) || [];
    const consumedIds = new Set(getConsumedIds(state));
    const d = getDirectorState(state);
    const recent = new Set(d.blocked_recent_ids || []);

    let filtered = candidates.filter((mail) => {
      const id = normStr(mail?.id);
      if (!id) return false;
      if (consumedIds.has(id)) return false;
      if (recent.has(id) && candidates.length > 1) return false;
      return true;
    });

    if (!filtered.length && opts.allowExhaustedFallback === true) {
      filtered = candidates.filter((mail) => !!normStr(mail?.id));
    }

    const chosen = filtered[0] || null;
    if (!chosen) return null;

    return enrichMail(chosen, getState(), active);
  }

  async function enqueueNext(engine, opts = {}) {
    const active = getActive();
    if (!active) return null;

    const pending = getPending();
    const pendingEvent = pending?.event || null;
    const shouldReplacePending =
      opts.force === true ||
      !pendingEvent ||
      isNavEvent(pendingEvent) ||
      isPhaseEvent(pendingEvent);

    if (!shouldReplacePending) return pendingEvent;

    const mail = await chooseNextMail(engine, opts);
    if (!mail) return pendingEvent || null;

    const eventObj = typeof engine?.decorateWorkMail === "function"
      ? engine.decorateWorkMail(mail, active, "mail_director_v2")
      : mail;

    setInbox([{ status: "pending", enqueued_at: new Date().toISOString(), event: eventObj }]);
    markShown(eventObj);
    return eventObj;
  }

  function patchBridgeConsumed() {
    const bridge = window.CiviMailPlanBridge;
    if (!bridge || typeof bridge.makeCandidateMailsForActiveRole !== "function") return false;
    if (bridge.__directorV2ConsumedPatched) return true;

    const original = bridge.makeCandidateMailsForActiveRole.bind(bridge);
    bridge.makeCandidateMailsForActiveRole = async function directorV2MakeCandidateMailsForActiveRole(active, state) {
      const mergedState = stateWithMergedConsumed(state || getState());
      return await original(active, mergedState);
    };

    bridge.__directorV2ConsumedPatched = true;
    return true;
  }

  function patchEngine() {
    const Engine = window.CivicationEventEngine;
    if (!Engine || !Engine.prototype) return false;
    const proto = Engine.prototype;
    if (proto.__mailDirectorV2Patched) return true;

    const originalOnAppOpen = proto.onAppOpen;
    if (typeof originalOnAppOpen === "function") {
      proto.onAppOpen = async function directorV2OnAppOpen(opts) {
        const res = await originalOnAppOpen.call(this, opts || {});
        await enqueueNext(this, { allowExhaustedFallback: false });
        return res;
      };
    }

    const originalFollowup = proto.enqueueImmediateFollowupEvent;
    if (typeof originalFollowup === "function") {
      proto.enqueueImmediateFollowupEvent = async function directorV2Followup() {
        const res = await originalFollowup.call(this);
        await enqueueNext(this, { allowExhaustedFallback: false });
        return res;
      };
    }

    const originalAnswer = proto.answer;
    if (typeof originalAnswer === "function") {
      proto.answer = async function directorV2Answer(eventId, choiceId) {
        const pending = typeof this.getPendingEvent === "function" ? this.getPendingEvent() : getPending();
        const pendingEvent = pending?.event ? { ...pending.event } : null;
        const res = await originalAnswer.call(this, eventId, choiceId);
        if (res?.ok && pendingEvent) markAnswered(pendingEvent);
        return res;
      };
    }

    proto.__mailDirectorV2Patched = true;
    return true;
  }

  function boot() {
    patchBridgeConsumed();
    patchEngine();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }

  window.addEventListener("civi:dataReady", boot);
  window.addEventListener("civi:booted", boot);

  window.CivicationMailDirectorV2 = {
    boot,
    patchBridgeConsumed,
    patchEngine,
    chooseNextMail,
    enqueueNext,
    markShown,
    markAnswered,
    getConsumedIds,
    stateWithMergedConsumed,
    syncPlanProgressFromMailSystem,
    getDirectorState
  };
})();
