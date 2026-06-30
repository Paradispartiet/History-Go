// ============================================================
// CIVICATION NEXT ACTION SELECTOR
// Hensikt:
// - Én autoritativ kilde for "hvilken mail er aktiv akkurat nå".
// - Leser primært CivicationDayProgression.inspect() slik at Dagens fase og
//   NextAction alltid peker på samme sak (samme id/tittel).
// - Faller bare tilbake til ikke-fasebaserte innboks-handlinger når ingen
//   fasehandling finnes.
// - Dette er ren utvelgelse (read-only) — ingen state-mutasjon, ingen DOM.
// ============================================================

(function () {
  "use strict";

  function norm(value) {
    return String(value ?? "").trim();
  }

  function normalizeChoices(rawChoices) {
    if (!Array.isArray(rawChoices)) return [];
    return rawChoices
      .map(function (choice) {
        return { id: norm(choice?.id), label: norm(choice?.label || choice?.text || choice?.id) };
      })
      .filter(function (choice) { return choice.id; });
  }

  function normalizeSituation(raw) {
    if (Array.isArray(raw)) return raw.map(norm).filter(Boolean);
    const single = norm(raw);
    return single ? [single] : [];
  }

  function isTaskGate(item) {
    return [item?.mail_type, item?.type, item?.slot, item?.kind]
      .map(function (value) { return String(value || "").toLowerCase(); })
      .join(" ")
      .includes("task_gate");
  }

  function actionabilityForStatus(status, fallbackStatus) {
    const normalized = norm(status || fallbackStatus || "").toLowerCase();
    return {
      status: normalized,
      isQueued: normalized === "queued",
      isAnswerable: normalized === "delivered" || normalized === "pending" || normalized === "open"
    };
  }

  function getInspection() {
    const prog = window.CivicationDayProgression;
    if (!prog || typeof prog.inspect !== "function") return null;
    try {
      return prog.inspect() || null;
    } catch (_e) {
      return null;
    }
  }

  // The day-phase rows are summarized by CivicationDayProgression.summarizeRow, so they
  // already carry choices, body, situation, slot, mail_type, status and task_id.
  function buildPhaseAction(item, inspection) {
    const id = norm(item?.id);
    if (!id) return null;
    const fallbackStatus = norm(item?.id) && norm(item?.id) === norm(inspection?.nextQueuedItem?.id)
      ? "queued"
      : (norm(item?.id) && norm(item?.id) === norm(inspection?.pendingItem?.id) ? "pending" : "delivered");
    const actionability = actionabilityForStatus(item?.status, fallbackStatus);
    return {
      source: "day_phase",
      id,
      subject: norm(item.subject) || norm(item.slot) || "Hendelse",
      body: norm(item.body || item.text || item.summary || item.description || item.prompt),
      situation: normalizeSituation(item.situation),
      summary: norm(item.summary),
      phase: norm(item.phase || inspection?.phase),
      phaseLabel: norm(inspection?.phaseLabel),
      mail_type: norm(item.mail_type || item.type),
      slot: norm(item.slot),
      status: actionability.status,
      isQueued: actionability.isQueued,
      isAnswerable: actionability.isAnswerable,
      choices: normalizeChoices(item.choices),
      isTaskGate: isTaskGate(item),
      taskId: norm(item.task_id)
    };
  }

  // The full summarized row (with choices) lives in the phase bundle. inspect() also exposes
  // nextActionableItem (delivered-first, then next queued) which is the same selection logic
  // Dagens fase uses (pendingItem || nextQueuedItem) — so the id/subject line up.
  function findFullRow(inspection, id) {
    const wanted = norm(id);
    if (!wanted) return null;
    const bundle = inspection?.phaseBundle || {};
    const pools = [bundle.pendingItems, bundle.queuedItems, bundle.items];
    for (const pool of pools) {
      if (!Array.isArray(pool)) continue;
      const hit = pool.find(function (row) { return norm(row?.id) === wanted; });
      if (hit) return hit;
    }
    const actionable = inspection?.nextActionableItem;
    if (actionable && norm(actionable.id) === wanted) return actionable;
    return null;
  }

  function getNextPhaseLabel(nextPhase) {
    if (!nextPhase) return "";
    const fromCalendar = window.CivicationCalendar?.getPhaseLabel?.(nextPhase);
    return norm(fromCalendar || nextPhase);
  }

  function buildStartNewDayAction(inspection) {
    // Day_end: dagen er ferdig besvart, men ruller IKKE automatisk videre (spilleren skal rekke
    // å se dagsoppsummeringen). NextAction eier det ene eksplisitte «Start ny dag»-valget. Det
    // gjenbruker advance-knappen/-handleren; advancePhaseIfReady ruller dagen (canResetAtDayEnd).
    const atDayEndComplete = norm(inspection?.reason) === "at_last_phase"
      && norm(inspection?.phase) === "day_end"
      && Number(inspection?.openItemsInPhase || 0) === 0;
    if (!atDayEndComplete) return null;
    return {
      source: "day_phase_advance",
      id: "start_new_day:" + norm(inspection.phase),
      subject: "Start ny dag",
      body: "Du har svart på alt i dag. Start en ny dag når du er klar.",
      situation: [],
      summary: "Dagslutt",
      phase: norm(inspection.phase),
      phaseLabel: norm(inspection.phaseLabel),
      mail_type: "phase_advance",
      slot: "",
      status: "ready",
      isQueued: false,
      isAnswerable: false,
      choices: [],
      isTaskGate: false,
      taskId: "",
      canAdvancePhase: true,
      canStartNewDay: true,
      nextPhase: "",
      nextPhaseLabel: ""
    };
  }

  function buildAdvancePhaseAction(inspection) {
    if (!inspection) return null;
    const startNewDay = buildStartNewDayAction(inspection);
    if (startNewDay) return startNewDay;
    if (!inspection.canAdvance || !inspection.nextPhase) return null;
    const nextPhaseLabel = getNextPhaseLabel(inspection.nextPhase);
    return {
      source: "day_phase_advance",
      id: "advance_phase:" + norm(inspection.phase) + ":" + norm(inspection.nextPhase),
      subject: nextPhaseLabel ? "Gå til neste fase: " + nextPhaseLabel : "Gå til neste fase",
      body: "Alle saker i nåværende fase er håndtert. Du kan gå videre til neste fase.",
      situation: [],
      summary: "Faseklarering",
      phase: norm(inspection.phase),
      phaseLabel: norm(inspection.phaseLabel),
      mail_type: "phase_advance",
      slot: norm(inspection.nextPhase),
      status: "ready",
      isQueued: false,
      isAnswerable: false,
      choices: [],
      isTaskGate: false,
      taskId: "",
      canAdvancePhase: true,
      nextPhase: norm(inspection.nextPhase),
      nextPhaseLabel
    };
  }

  function getPhaseAction(inspection) {
    if (!inspection) return null;
    // Primary: the delivered/pending item; secondary: the next queued item. This mirrors
    // exactly what CivicationDayPhaseUi renders as "Neste sak", so the surfaces never diverge.
    const ref = inspection.pendingItem || inspection.nextQueuedItem || null;
    if (ref && norm(ref.id)) {
      const full = findFullRow(inspection, ref.id);
      return buildPhaseAction(full || ref, inspection);
    }
    // Defensive: nextActionableItem may still resolve when pending/next refs are missing.
    const actionable = inspection.nextActionableItem;
    if (actionable && norm(actionable.id)) return buildPhaseAction(actionable, inspection);
    // When the phase has no mail to answer but is ready to advance, NextAction still owns
    // the single active action instead of letting inbox fallbacks steal focus.
    return buildAdvancePhaseAction(inspection);
  }

  function getInbox() {
    const fromEngine = window.CivicationMailEngine?.getInbox?.();
    if (Array.isArray(fromEngine)) return fromEngine;
    const fromState = window.CivicationState?.getInbox?.();
    if (Array.isArray(fromState)) return fromState;
    try {
      const stored = JSON.parse(localStorage.getItem("hg_civi_inbox_v1") || "[]");
      return Array.isArray(stored) ? stored : [];
    } catch (_e) {
      return [];
    }
  }

  function eventOf(item) {
    return item?.event || item || null;
  }

  function isOpenInboxItem(item) {
    if (!item) return false;
    if (item.deleted === true || item.archived === true || item.resolved === true) return false;
    const status = norm(item.status || "pending").toLowerCase();
    return status === "pending" || status === "open";
  }

  // Fallback only: an actionable inbox mail that is NOT already covered by a day-phase action.
  function getInboxAction() {
    const inbox = getInbox();
    const hit = (Array.isArray(inbox) ? inbox : []).find(function (item) {
      if (!isOpenInboxItem(item)) return false;
      const ev = eventOf(item);
      return Array.isArray(ev?.choices) && ev.choices.length > 0;
    });
    if (!hit) return null;

    const ev = eventOf(hit) || {};
    const actionability = actionabilityForStatus(hit.status || "open");
    return {
      source: "inbox",
      id: norm(hit.id || ev.id),
      subject: norm(ev.subject || ev.title || ev.kind || "Innkommende"),
      body: norm(ev.body || ev.summary),
      situation: normalizeSituation(ev.situation),
      summary: norm(ev.summary),
      phase: norm(ev.phase || ev.phase_tag),
      phaseLabel: "",
      mail_type: norm(ev.mail_type || ev.type || ev.kind),
      slot: norm(ev.slot),
      status: actionability.status,
      isQueued: actionability.isQueued,
      isAnswerable: actionability.isAnswerable,
      choices: normalizeChoices(ev.choices),
      isTaskGate: isTaskGate(ev),
      taskId: norm(ev.task_id)
    };
  }

  /**
   * Returns exactly one active action, or null when nothing needs answering.
   * Day-phase actions always win over inbox fallbacks.
   */
  function getCurrent() {
    const inspection = getInspection();
    const phaseAction = getPhaseAction(inspection);
    if (phaseAction) return phaseAction;
    return getInboxAction();
  }

  window.CivicationNextActionSelector = {
    getCurrent
  };
})();
