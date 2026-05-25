(function () {
  "use strict";

  /**
   * @typedef {Record<string, unknown>} DayProgRecord
   * @typedef {DayProgRecord & {
   *  id?: string,
   *  status?: string,
   *  subject?: string,
   *  phase?: string,
   *  resolved?: boolean,
   *  answered_at?: string,
   *  answeredAt?: string,
   *  event?: DayProgMailEvent
   * }} DayProgRuntimeItem
   * @typedef {DayProgRecord & {
   *  id?: string,
   *  subject?: string,
   *  phase?: string,
   *  phase_tag?: string,
   *  daily_mail_meta?: DayProgRecord
   * }} DayProgMailEvent
   * @typedef {DayProgRecord & {
   *  phase: string,
   *  phaseLabel: string,
   *  dayIndex: number,
   *  openItemsInPhase: number,
   *  openItemSubjects: string[],
   *  nextPhase: string|null,
   *  canAdvance: boolean,
   *  reason: string
   * }} DayProgInspection
   * @typedef {DayProgRecord & {
   *  advanced: boolean,
   *  reason?: string,
   *  fromPhase?: string,
   *  toPhase?: string
   * }} DayProgAdvanceResult
   */

  const OPEN_STATUSES = new Set(["pending", "delivered", "open"]);

  function norm(value) {
    return String(value || "").trim();
  }

  function getCalendar() {
    return window.CivicationCalendar || null;
  }

  function getBuilderInspect() {
    return window.CivicationDailyMailBuilder?.inspect?.() || null;
  }

  /**
   * @returns {DayProgRuntimeItem[]}
   */
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

  /**
   * @param {DayProgRuntimeItem} row
   * @returns {string}
   */
  function getPhaseForRow(row) {
    if (!row || typeof row !== "object") return "";
    return norm(row.phase || row?.event?.phase_tag || row?.event?.daily_mail_meta?.phase);
  }

  /**
   * @param {DayProgRuntimeItem} row
   * @param {string} phase
   * @returns {boolean}
   */
  function belongsToPhase(row, phase) {
    const wanted = norm(phase);
    if (!wanted) return false;
    return getPhaseForRow(row) === wanted;
  }


  /**
   * @param {DayProgRuntimeItem} row
   * @returns {DayProgRecord|null}
   */
  function findInboxItemForRow(row) {
    const rowId = norm(row?.id || row?.event?.id);
    if (!rowId) return null;

    const inbox = window.CivicationState?.getInbox?.();
    if (!Array.isArray(inbox)) return null;

    return inbox.find((item) => norm(item?.event?.id || item?.id) === rowId) || null;
  }

  /**
   * @param {DayProgRuntimeItem} row
   * @returns {boolean}
   */
  function isOpenRow(row) {
    if (!row || typeof row !== "object") return false;
    const status = norm(row.status || "queued").toLowerCase();
    if (!OPEN_STATUSES.has(status)) return false;
    if (row.resolved === true) return false;

    const inboxItem = findInboxItemForRow(row);
    const inboxStatus = norm(inboxItem?.status).toLowerCase();
    const inboxEventStatus = norm(inboxItem?.event?.status).toLowerCase();
    if (
      inboxItem?.resolved === true
      || inboxStatus === "resolved"
      || inboxItem?.event?.resolved === true
      || inboxEventStatus === "resolved"
    ) return false;

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

  /**
   * @returns {DayProgInspection}
   */
  function inspect() {
    const phase = getCurrentPhase();
    /** @type {DayProgRuntimeItem[]} */
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

  /**
   * @returns {boolean}
   */
  function canAdvancePhase() {
    return !!inspect().canAdvance;
  }

  /**
   * @returns {Promise<DayProgAdvanceResult>}
   */
  async function advancePhaseIfReady() {
    const state = inspect();
    const canAdvanceToNextPhase = state.canAdvance;
    const canResetAtDayEnd = state.reason === "at_last_phase"
      && state.phase === "day_end"
      && Number(state.openItemsInPhase || 0) === 0;

    if (!canAdvanceToNextPhase && !canResetAtDayEnd) {
      return { advanced: false, reason: state.reason };
    }

    const calendar = getCalendar();
    const fromPhase = state.phase;
    calendar?.advancePhase?.();
    const toPhase = getCurrentPhase();


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
