// js/Civication/systems/day/dayProgressionController.js
// CivicationDayProgression — eier fasefremdriften gjennom maildagen: finner gjeldende/neste
// fase, avgjør om fasen kan avanseres og avanserer når dagen er klar.
// Dispatcher civi:dayPhaseChanged / civi:inboxChanged / updateProfile.
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

  const OPEN_STATUSES = new Set(["queued", "pending", "delivered", "open"]);

  function norm(value) {
    return String(value || "").trim();
  }

  function uniqueStrings(values) {
    return [...new Set((Array.isArray(values) ? values : []).map(norm).filter(Boolean))];
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
   * @returns {DayProgRuntimeItem|null}
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
      : ["morning", "forenoon", "workday", "lunch", "afternoon", "dinner", "evening", "day_end"];
  }

  function getNextPhase(phase) {
    const phases = getPhaseList();
    const idx = phases.indexOf(norm(phase));
    if (idx < 0) return phases[0] || "morning";
    return phases[idx + 1] || null;
  }

  function getPhaseItems(phase) {
    const wanted = norm(phase || getCurrentPhase());
    return getRuntimeItems().filter((row) => belongsToPhase(row, wanted));
  }

  function getQueuedItemsForPhase(phase) {
    return getPhaseItems(phase).filter((row) => norm(row?.status).toLowerCase() === "queued");
  }

  function getDeliveredItemsForPhase(phase) {
    return getPhaseItems(phase).filter((row) => ["delivered", "pending", "open"].includes(norm(row?.status).toLowerCase()));
  }

  function getAnsweredItemsForPhase(phase) {
    return getPhaseItems(phase).filter((row) => norm(row?.status).toLowerCase() === "answered" || row?.resolved === true || row?.answered_at || row?.answeredAt);
  }

  function isRequiredRow(row) {
    return norm(row?.required).toLowerCase() !== "false" && row?.optional !== true;
  }

  function summarizeRow(row) {
    return { id: norm(row?.event?.id || row?.id), subject: norm(row?.event?.subject || row?.subject), slot: norm(row?.slot || row?.event?.daily_mail_meta?.slot), status: norm(row?.status || "queued"), phase: getPhaseForRow(row), required: isRequiredRow(row) };
  }

  function getPhaseCompletion(phase) {
    const rows = getPhaseItems(phase);
    const required = rows.filter(isRequiredRow);
    const answered = getAnsweredItemsForPhase(phase);
    const completedRequired = required.filter((row) => answered.includes(row) || norm(row?.status).toLowerCase() === "answered");
    return { requiredCount: required.length, completedCount: completedRequired.length, isComplete: required.length === 0 || completedRequired.length >= required.length };
  }

  function getCurrentPhaseItems() {
    return getPhaseItems(getCurrentPhase()).map(summarizeRow);
  }

  function getCurrentPhaseBundle() {
    const phase = getCurrentPhase();
    const items = getPhaseItems(phase);
    const pendingItems = getDeliveredItemsForPhase(phase);
    const queuedItems = getQueuedItemsForPhase(phase);
    const answeredItems = getAnsweredItemsForPhase(phase);
    const completion = getPhaseCompletion(phase);
    return {
      phase,
      phaseLabel: getPhaseLabel(phase),
      items: items.map(summarizeRow),
      pendingItems: pendingItems.map(summarizeRow),
      queuedItems: queuedItems.map(summarizeRow),
      answeredItems: answeredItems.map(summarizeRow),
      requiredCount: completion.requiredCount,
      completedCount: completion.completedCount,
      isComplete: completion.isComplete && queuedItems.length === 0 && pendingItems.length === 0,
      nextPhase: getNextPhase(phase)
    };
  }

  /**
   * @returns {DayProgInspection}
   */
  function inspect() {
    const phase = getCurrentPhase();
    /** @type {DayProgRuntimeItem[]} */
    const items = getRuntimeItems();
    const openRows = items.filter((row) => belongsToPhase(row, phase) && isOpenRow(row));
    const queuedRows = items.filter((row) => belongsToPhase(row, phase) && norm(row?.status).toLowerCase() === "queued");
    const deliveredRows = items.filter((row) => belongsToPhase(row, phase) && ["delivered", "pending", "open"].includes(norm(row?.status).toLowerCase()));
    const nextQueuedRow = queuedRows[0] || null;
    const pendingRow = deliveredRows[0] || null;
    const nextPhase = getNextPhase(phase);

    let reason = "ready_to_advance";
    let canAdvance = true;

    if (!nextPhase) {
      canAdvance = false;
      reason = "at_last_phase";
    } else if (openRows.length > 0) {
      canAdvance = false;
      reason = "open_items_in_phase";
    } else if (queuedRows.length > 0) {
      canAdvance = false;
      reason = "queued_items_in_phase";
    } else if (deliveredRows.length > 0) {
      canAdvance = false;
      reason = "delivered_items_in_phase";
    }

    return {
      phase,
      phaseLabel: getPhaseLabel(phase),
      dayIndex: getDayIndex(),
      openItemsInPhase: openRows.length,
      queuedItemsInPhase: queuedRows.length,
      deliveredItemsInPhase: deliveredRows.length,
      completedItemsInPhase: items.filter((row) => belongsToPhase(row, phase) && norm(row?.status).toLowerCase() === "answered").length,
      openItemSubjects: openRows.map((row) => norm(row?.event?.subject || row?.subject || row?.event?.id)).filter(Boolean),
      pendingItem: pendingRow ? { id: norm(pendingRow?.event?.id || pendingRow?.id), subject: norm(pendingRow?.event?.subject || pendingRow?.subject), status: norm(pendingRow?.status), phase: getPhaseForRow(pendingRow) } : null,
      nextQueuedItem: nextQueuedRow ? { id: norm(nextQueuedRow?.event?.id || nextQueuedRow?.id), subject: norm(nextQueuedRow?.event?.subject || nextQueuedRow?.subject), status: norm(nextQueuedRow?.status), phase: getPhaseForRow(nextQueuedRow) } : null,
      phaseBundle: getCurrentPhaseBundle(),
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

    // PR F: dagsrullnings (day_end → ny dag) skal ferdigstille ukesoppsummeringen. For daily-events
    // kjører ikke lenger dayPatches.answer sin day_end-gren (PR A), så `saveDailySummaryToWeek` +
    // `finalizeWeekIfNeeded` var foreldreløse — uke-review ble aldri skrevet, og det inert-gjorde
    // det ukentlige carryover-signalet (visibility/process/fatigue). Vi lagrer dagens summary til
    // uken FØR rullnings, fordi `advancePhase()` ved day_end nullstiller dagen og fjerner
    // dailySummary. Begge helperne er idempotente (dag-oppdatering by index + applied-flagg).
    if (fromPhase === "day_end") {
      try {
        const summary = calendar?.getDailySummary?.();
        if (summary && typeof window.saveDailySummaryToWeek === "function") {
          window.saveDailySummaryToWeek(summary);
        }
        if (typeof window.finalizeWeekIfNeeded === "function") {
          const activePosition = /** @type {{ career_id?: unknown } | null | undefined} */ (
            window.CivicationState?.getActivePosition?.()
          );
          const careerId = activePosition?.career_id || "";
          window.finalizeWeekIfNeeded(careerId);
        }
      } catch {}
    }

    calendar?.advancePhase?.();
    const toPhase = getCurrentPhase();


    try { window.dispatchEvent(new Event("civi:dayPhaseChanged")); } catch {}
    try { window.dispatchEvent(new Event("civi:inboxChanged")); } catch {}
    try { await window.CivicationDailyMailBuilder?.enqueueNext?.(window.HG_CiviEngine || null, { ignorePending: false }); } catch {}
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}

    return { advanced: true, fromPhase, toPhase };
  }

  function getDayEndSummary() {
    const items = getRuntimeItems();
    const phases = getPhaseList();
    const phaseBundles = phases.map((phase) => {
      const rows = getPhaseItems(phase);
      const answered = getAnsweredItemsForPhase(phase);
      const required = rows.filter(isRequiredRow);
      const completedRequired = required.filter(row => answered.includes(row) || norm(row?.status).toLowerCase() === "answered");
      return { phase, phaseLabel: getPhaseLabel(phase), total: rows.length, answered: answered.length, required: required.length, complete: rows.length > 0 && completedRequired.length >= required.length && getQueuedItemsForPhase(phase).length === 0 && getDeliveredItemsForPhase(phase).length === 0 };
    });
    const answeredItems = items.filter(row => norm(row?.status).toLowerCase() === "answered");
    const openRequired = items.filter(row => isRequiredRow(row) && isOpenRow(row));
    const peopleContacts = new Set(answeredItems.filter(row => /people|person|kollega|friend|family/i.test(`${row?.event?.mail_type || ""} ${row?.slot || ""} ${row?.event?.mail_family || ""}`)).map(row => norm(row?.event?.source || row?.event?.from || row?.event?.id)).filter(Boolean));
    const tasksCompleted = answeredItems.filter(row => norm(row?.event?.mail_type) === "task_gate" || norm(row?.slot) === "task_gate").length;
    const learningTags = uniqueStrings(answeredItems.flatMap(row => [row?.event?.competency, ...(Array.isArray(row?.event?.mail_tags) ? row.event.mail_tags : []), ...(Array.isArray(row?.event?.choices) ? row.event.choices.flatMap(c => c.tags || []) : [])]).filter(tag => /learn|kompet|fag|jurid|plan|process|knowledge/i.test(norm(tag))));
    const relationshipTags = answeredItems.flatMap(row => Array.isArray(row?.event?.choices) ? row.event.choices.flatMap(c => c.tags || []) : []).filter(tag => /relasjon|trust|people|social|tillit/i.test(norm(tag))).length;
    const completedPhases = phaseBundles.filter(p => p.complete).length;
    const score = Math.max(0, Math.min(100, Math.round(answeredItems.length * 4 + completedPhases * 6 + tasksCompleted * 8 + learningTags.length * 2 + relationshipTags * 2 - openRequired.length * 8)));
    return {
      title: "Dagen er over",
      dayIndex: getDayIndex(),
      completedPhases,
      totalPhases: phases.length,
      handledItems: answeredItems.length,
      peopleMet: peopleContacts.size,
      tasksCompleted,
      importantChoices: answeredItems.map(row => norm(row?.event?.subject || row?.subject)).filter(Boolean).slice(0, 6),
      score,
      scoreExplanation: "Score = besvarte saker + fullførte bolker + task gates + læring/relasjon - åpne required saker.",
      roleDevelopment: learningTags.length ? `Rolleutvikling: Du har styrket ${learningTags.slice(0, 3).join(", ")}.` : "Ingen tydelig rolleutvikling i dag",
      learning: learningTags.slice(0, 8),
      effects: { psyche: null, energy: null, money: null },
      carryover: openRequired.length ? `${openRequired.length} required saker følger med.` : "Ingen åpne required saker følger med til i morgen.",
      phases: phaseBundles
    };
  }

  window.CivicationDayProgression = {
    inspect,
    canAdvancePhase,
    advancePhaseIfReady,
    getCurrentPhaseItems,
    getCurrentPhaseBundle,
    getOpenItemsForPhase: (phase) => getPhaseItems(phase).filter(isOpenRow).map(summarizeRow),
    getQueuedItemsForPhase: (phase) => getQueuedItemsForPhase(phase).map(summarizeRow),
    getDeliveredItemsForPhase: (phase) => getDeliveredItemsForPhase(phase).map(summarizeRow),
    getAnsweredItemsForPhase: (phase) => getAnsweredItemsForPhase(phase).map(summarizeRow),
    getPhaseCompletion,
    getDayEndSummary
  };
})();
