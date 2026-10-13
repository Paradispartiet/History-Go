// js/Civication/systems/civicationWorkdayRuntime.js
// CivicationWorkdayRuntime — eier ARBEIDSDAGEN som en egen økt, adskilt fra
// den private døgnrytmen.
//
// Prinsipp (se js/Civication/README.md «To rytmer»):
// - Døgnrytmen (morgen/lunsj/middag/kveld/natt) eies av CivicationCalendar +
//   dagsfase-broen. Den er PRIVAT og skal ikke inneholde jobbmailer.
// - Arbeidsrytmen (jobbøkten hos arbeidsgiver) eies av DENNE filen. Den har sin
//   EGEN teller (workday_day_index) som er frikoblet fra døgnfase-telleren
//   (calendar.dayIndex). En jobbmail lever i arbeidsrytmen, ikke i alle
//   døgnfaser.
// - Telleren økes KUN når arbeidsdagen faktisk fullføres (completeWorkday),
//   aldri bare fordi en ny døgnfase starter.
//
// Denne filen eier ikke selve jobbmailene (det gjør CivicationDailyMailBuilder
// sin arbeidsdag-kø) og ikke career outcome (CivicationCareerOutcomeRuntime).
// Den eier arbeidsdag-STATUS: hvilken arbeidsgiver/rolle, hvilken arbeidsdag i
// rekken, og om dagens arbeidsdag er fullført.

(function () {
  "use strict";

  const WORKDAY_KEY = "workday_runtime_v1";

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  const COMPLETION_BASIS = "calendar_day_v1";

  // A played Civication day is not necessarily a new real-world date. Use
  // canonical game-day identity when the shell calendar is available; keep
  // the previous UTC-date fallback for standalone/legacy workday tests.
  function calendarDayKey() {
    const index = Number(window.CivicationCalendar?.getClock?.()?.dayIndex);
    return Number.isInteger(index) && index > 0 ? "calendar-day:" + index : "";
  }

  function todayKey() {
    return calendarDayKey() || new Date().toISOString().slice(0, 10);
  }

  function getStateBag() {
    return window.CivicationState?.getState?.() || {};
  }

  function patchState(patch) {
    return window.CivicationState?.setState?.(patch || {}) || null;
  }

  function getActive() {
    return window.CivicationState?.getActivePosition?.() || null;
  }

  const DEFAULT_RUNTIME = {
    schema: WORKDAY_KEY,
    workday_day_index: 0,
    employer_id: "",
    role_scope: "",
    active: false,
    started_date: "",
    completed_dates: {},
    completion_basis: ""
  };

  function getRuntime() {
    const raw = getStateBag()?.[WORKDAY_KEY];
    const rt = raw && typeof raw === "object" ? raw : {};
    const normalized = {
      ...DEFAULT_RUNTIME,
      ...rt,
      completed_dates:
        rt.completed_dates && typeof rt.completed_dates === "object"
          ? rt.completed_dates
          : {}
    };
    const key = calendarDayKey();
    if (!key || normalized.completion_basis === COMPLETION_BASIS) return normalized;

    // Legacy saves used today's UTC date for workday deduplication, even if
    // the player had already moved to another in-game day. Adopt the existing
    // completed flag for the CURRENT game day once. Subsequent game days get
    // independent keys, without replaying past shifts or increasing salary.
    const utcToday = new Date().toISOString().slice(0, 10);
    const completedDates = { ...normalized.completed_dates };
    if (completedDates[utcToday] === true) completedDates[key] = true;
    const migrated = {
      ...normalized,
      completed_dates: completedDates,
      completion_basis: COMPLETION_BASIS
    };
    if (raw && typeof window.CivicationState?.setState === "function") {
      setRuntime(migrated);
    }
    return migrated;
  }

  function setRuntime(next) {
    patchState({ [WORKDAY_KEY]: next });
    return next;
  }

  // Arbeidsgiver = brand_id (samme nøkkelbegrep som CivicationCalendar.getJobKey).
  function getEmployerId(active) {
    const pos = active || getActive();
    return norm(pos?.brand_id || pos?.employer_id);
  }

  function getRoleScope(active) {
    const pos = active || getActive();
    const resolver = window.CivicationCareerRoleResolver?.resolveCareerRoleScope;
    if (typeof resolver === "function") {
      const resolved = norm(resolver(pos));
      if (resolved && resolved !== "unknown") return resolved;
    }
    return norm(pos?.role_scope || pos?.role_key || pos?.role_id);
  }

  // Har spilleren en aktiv jobb i det hele tatt? Uten jobb finnes det ingen
  // arbeidsdag å gå til, og morgenfasen skal da ikke tilby «Gå til jobb».
  function hasActiveJob(active) {
    const pos = active || getActive();
    if (!pos) return false;
    return !!(norm(pos?.career_id) || getRoleScope(pos));
  }

  function isWorkdayCompletedToday(date) {
    const key = norm(date) || todayKey();
    return getRuntime().completed_dates?.[key] === true;
  }

  function getWorkdayDayIndex() {
    return Number(getRuntime().workday_day_index || 0);
  }

  // Start arbeidsdagen hos aktiv arbeidsgiver. Setter status active=true og
  // registrerer arbeidsgiver/rolle for økten. Øker IKKE telleren — den økes
  // først når arbeidsdagen fullføres.
  function startWorkday(active, options = {}) {
    const pos = active || getActive();
    const date = norm(options.date) || todayKey();
    const rt = getRuntime();
    const next = {
      ...rt,
      employer_id: getEmployerId(pos),
      role_scope: getRoleScope(pos),
      active: true,
      started_date: date
    };
    return setRuntime(next);
  }

  // Fullfør arbeidsdagen. Idempotent per dato: telleren økes bare første gang en
  // gitt arbeidsdag fullføres, slik at gjentatte kall (eller flere private faser
  // etterpå) ikke blåser opp workday_day_index.
  function completeWorkday(options = {}) {
    const date = norm(options.date) || todayKey();
    const rt = getRuntime();
    if (rt.completed_dates?.[date] === true) {
      return { ...rt, active: false, changed: false };
    }
    const next = {
      ...rt,
      active: false,
      workday_day_index: Number(rt.workday_day_index || 0) + 1,
      completed_dates: { ...(rt.completed_dates || {}), [date]: true }
    };
    setRuntime(next);
    try { window.dispatchEvent(new Event("civi:workdayCompleted")); } catch {}
    return { ...next, changed: true };
  }

  function isWorkdayActive() {
    return getRuntime().active === true;
  }

  // Tilbakestiller arbeidsdag-telleren (ny karriere/nytt spill). Skriver et helt
  // ferskt objekt slik at ingen gamle completed_dates blir liggende igjen.
  function reset() {
    return setRuntime({ ...DEFAULT_RUNTIME, completed_dates: {} });
  }

  window.CivicationWorkdayRuntime = {
    WORKDAY_KEY,
    getRuntime,
    getEmployerId,
    getRoleScope,
    hasActiveJob,
    isWorkdayActive,
    isWorkdayCompletedToday,
    getWorkdayDayIndex,
    startWorkday,
    completeWorkday,
    reset
  };
})();
