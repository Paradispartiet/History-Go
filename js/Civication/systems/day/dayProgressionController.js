(function () {
  "use strict";

  const OPEN_STATUSES = new Set(["queued", "pending", "delivered", "open"]);

  function norm(value) {
    return String(value || "").trim();
  }

  function getCalendar() {
    return window.CivicationCalendar || null;
  }

  function getBuilderInspect() {
    return window.CivicationDailyMailBuilder?.inspect?.() || null;
  }

  function getRuntimeItems() {
    const inspected = getBuilderInspect();
    const runtime = inspected?.runtime;
    return Array.isArray(runtime?.items) ? runtime.items : [];
  }

  function getCurrentPhase() {
    return norm(getCalendar()?.getPhase?.() || "morning") || "morning";
  }

  function getPhaseLabel(phase) {
    const calendar = getCalendar();
    if (typeof calendar?.getPhaseLabel === "function") return calendar.getPhaseLabel(phase);
    return norm(phase || "morning") || "morning";
  }

  function getDayIndex() {
    const clock = getCalendar()?.getClock?.() || {};
    return Number(clock.dayIndex || 1);
  }

  function getPhaseForRow(row) {
    if (!row || typeof row !== "object") return "";
    return norm(row.phase || row?.event?.phase_tag || row?.event?.daily_mail_meta?.phase);
  }

  function belongsToPhase(row, phase) {
    const wanted = norm(phase);
    if (!wanted) return false;
    return getPhaseForRow(row) === wanted;
  }

  function isOpenRow(row) {
    if (!row || typeof row !== "object") return false;
    const status = norm(row.status || "queued").toLowerCase();
    if (!OPEN_STATUSES.has(status)) return false;
    if (row.resolved === true) return false;
    if (row.answered_at || row.answeredAt) return false;
    return true;
  }

  function getPhaseList() {
    const phases = getCalendar()?.DAY_PHASES;
    return Array.isArray(phases) && phases.length
      ? phases.map(norm).filter(Boolean)
      : ["morning", "lunch", "afternoon", "evening", "day_end"];
  }

  function getNextPhase(phase) {
    const phases = getPhaseList();
    const idx = phases.indexOf(norm(phase));
    if (idx < 0) return phases[0] || "morning";
    return phases[idx + 1] || null;
  }

  function inspect() {
    const phase = getCurrentPhase();
    const items = getRuntimeItems();
    const openRows = items.filter((row) => belongsToPhase(row, phase) && isOpenRow(row));
    const nextPhase = getNextPhase(phase);

    let reason = "ready_to_advance";
    let canAdvance = true;

    if (!nextPhase) {
      canAdvance = false;
      reason = "at_last_phase";
    } else if (openRows.length > 0) {
      canAdvance = false;
      reason = "open_items_in_phase";
    }

    return {
      phase,
      phaseLabel: getPhaseLabel(phase),
      dayIndex: getDayIndex(),
      openItemsInPhase: openRows.length,
      openItemSubjects: openRows.map((row) => norm(row?.event?.subject || row?.subject || row?.event?.id)).filter(Boolean),
      nextPhase,
      canAdvance,
      reason
    };
  }

  function canAdvancePhase() {
    return !!inspect().canAdvance;
  }

  async function advancePhaseIfReady() {
    const state = inspect();
    if (!state.canAdvance) return { advanced: false, reason: state.reason };

    const calendar = getCalendar();
    const fromPhase = state.phase;
    calendar?.advancePhase?.();
    const toPhase = getCurrentPhase();

    if (window.CivicationDailyMailBuilder?.enqueueNext) {
      try {
        await window.CivicationDailyMailBuilder.enqueueNext(window.HG_CiviEngine || null, {
          ignorePending: true
        });
      } catch (error) {
        if (window.DEBUG) {
          console.warn("[CivicationDayProgression] enqueueNext feilet", error);
        }
      }
    }

    try { window.dispatchEvent(new Event("civi:dayPhaseChanged")); } catch {}
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}

    return { advanced: true, fromPhase, toPhase };
  }

  window.CivicationDayProgression = {
    inspect,
    canAdvancePhase,
    advancePhaseIfReady
  };
})();
