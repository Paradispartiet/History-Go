// js/Civication/systems/civicationDayFlow.js
// CivicationDayFlow — controller for LIVSRYTMEN gjennom et døgn.
//
// Prinsipp (se js/Civication/README.md «To rytmer»):
//   Civication har to rytmer:
//     - Døgnrytme: privat livsfase (morgen, lunsj, middag, kveld, natt/dagslutt)
//     - Arbeidsrytme: jobbøkt hos arbeidsgiver
//   Jobbinnhold lever i arbeidsrytmen, ikke i alle døgnfaser.
//
// DayFlow eier ikke tid (CivicationCalendar) og ikke mailene
// (CivicationDailyMailBuilder). Den vet hvor i livsrytmen spilleren er, om det
// finnes en aktiv jobb, og om dagens arbeidsdag er fullført — og oversetter det
// til én tydelig neste handling: i morgenfasen med aktiv, ufullført arbeidsdag
// er neste handling «Gå til jobb».

(function () {
  "use strict";

  // Private døgnfaser eier livsrytmen og skal ALDRI inneholde jobbmailer.
  const PRIVATE_PHASES = ["morning", "lunch", "afternoon", "dinner", "evening", "day_end"];
  // Arbeidsfaser eier jobbøkten; det er her arbeidsdag-mailene lever.
  const WORK_PHASES = ["forenoon", "workday"];

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function calendar() {
    return window.CivicationCalendar || null;
  }

  function workday() {
    return window.CivicationWorkdayRuntime || null;
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  function getCurrentPhase() {
    return norm(calendar()?.getPhase?.()) || "morning";
  }

  function isPrivatePhase(phase) {
    return PRIVATE_PHASES.includes(norm(phase));
  }

  function isWorkPhase(phase) {
    return WORK_PHASES.includes(norm(phase));
  }

  function hasActiveJob(active) {
    const wr = workday();
    if (wr?.hasActiveJob) return wr.hasActiveJob(active || getActive());
    const pos = active || getActive();
    return !!(pos && norm(pos.career_id));
  }

  function isWorkdayCompletedToday() {
    return workday()?.isWorkdayCompletedToday?.() === true;
  }

  function getEmployerId(active) {
    return workday()?.getEmployerId?.(active || getActive()) || "";
  }

  // Neste handling i livsrytmen. I morgenfasen med aktiv jobb som ennå ikke er
  // gjort i dag: gå til jobb. Ellers driver de private fasene seg selv.
  function getNextAction(state) {
    const s = state || getFlowState();
    if (s.current_day_phase === "morning" && s.has_active_job && !s.workday_completed_today) {
      return "go_to_work";
    }
    if (isWorkPhase(s.current_day_phase) && !s.workday_completed_today) {
      return "continue_workday";
    }
    return "continue_day";
  }

  function getFlowState() {
    const active = /** @type {any} */ (getActive());
    const phase = getCurrentPhase();
    const state = {
      current_day_phase: phase,
      is_private_phase: isPrivatePhase(phase),
      is_work_phase: isWorkPhase(phase),
      has_active_job: hasActiveJob(active),
      workday_completed_today: isWorkdayCompletedToday(),
      employer_id: getEmployerId(active),
      role_title: norm(active?.title)
    };
    state.next_action = getNextAction(state);
    return state;
  }

  // Spilleren går til jobb fra morgenfasen: start arbeidsdag-runtime og flytt
  // livsrytmen inn i arbeidsfasen. Selve arbeidsdag-køen bygges av
  // CivicationDailyMailBuilder for arbeidsfasen.
  function goToWork(options = {}) {
    const active = options.active || getActive();
    if (!hasActiveJob(active)) return { ok: false, reason: "no_active_job" };
    if (isWorkdayCompletedToday()) return { ok: false, reason: "workday_already_completed" };
    workday()?.startWorkday?.(active, options);
    try { calendar()?.setPhase?.("forenoon"); } catch {}
    try { window.dispatchEvent(new Event("civi:workdayStarted")); } catch {}
    return { ok: true, phase: "forenoon", employer_id: getEmployerId(active) };
  }

  // Arbeidsdagen er ferdig: registrer fullføring (øker arbeidsdag-telleren) og
  // returner spilleren til privat rytme (lunsj).
  function finishWorkday(options = {}) {
    const result = workday()?.completeWorkday?.(options) || null;
    try { calendar()?.setPhase?.("lunch"); } catch {}
    try { window.dispatchEvent(new Event("civi:backToPrivate")); } catch {}
    return { ok: true, workday: result, phase: "lunch" };
  }

  window.CivicationDayFlow = {
    PRIVATE_PHASES: PRIVATE_PHASES.slice(),
    WORK_PHASES: WORK_PHASES.slice(),
    isPrivatePhase,
    isWorkPhase,
    hasActiveJob,
    isWorkdayCompletedToday,
    getEmployerId,
    getCurrentPhase,
    getNextAction,
    getFlowState,
    goToWork,
    finishWorkday
  };
})();
