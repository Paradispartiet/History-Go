// CivicationWorldMood.js
// Én visuell tolkning av spillklokkens åtte faser til fire rolige døgnstemninger.
// Leser kanonisk kalender; skriver aldri spillets klokke, progresjon eller lagring.
(function (root) {
  "use strict";
  if (root.CivicationWorldMood) return;

  const PERIODS = Object.freeze({
    morning: "morning",
    forenoon: "day",
    workday: "day",
    lunch: "day",
    afternoon: "day",
    dinner: "evening",
    evening: "evening",
    day_end: "night",
    morgen: "morning",
    formiddag: "day",
    arbeidsdag: "day",
    lunsj: "day",
    ettermiddag: "day",
    middag: "evening",
    kveld: "evening",
    natt: "night",
    day: "day",
    night: "night"
  });

  function classify(phase) {
    const key = String(phase == null ? "" : phase).trim().toLowerCase();
    return PERIODS[key] || "morning";
  }

  function readPhase() {
    const calendar = root.CivicationCalendar;
    try {
      return calendar?.getPhase?.() || calendar?.getClock?.()?.phase || "morning";
    } catch (_) {
      return "morning";
    }
  }

  function getPeriod() {
    return classify(readPhase());
  }

  let lastPeriod = null;
  function sync() {
    const period = getPeriod();
    const doc = root.document;
    if (!doc || !doc.body) return period;
    doc.body.setAttribute("data-civi-visual-period", period);
    const label = doc.querySelector?.(".civi-day-miniature-period");
    if (label) label.textContent = ({ morning: "Morgen", day: "Dag", evening: "Kveld", night: "Natt" })[period] || "Morgen";
    if (period !== lastPeriod) {
      lastPeriod = period;
      if (typeof root.dispatchEvent === "function" && typeof root.CustomEvent === "function") {
        root.dispatchEvent(new root.CustomEvent("civi:visualPeriodChanged", {
          detail: { period }
        }));
      }
    }
    return period;
  }

  function init() {
    const doc = root.document;
    if (!doc) return;
    root.addEventListener?.("civi:dayPhaseChanged", sync);
    root.addEventListener?.("civi:booted", sync);
    root.addEventListener?.("civi:lifestoryChanged", sync);
    root.addEventListener?.("storage", function (event) {
      if (event?.key === "hg_civi_calendar_v1") sync();
    });
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", sync);
    else sync();
  }

  root.CivicationWorldMood = { classify, getPeriod, sync };
  init();
})(typeof window !== "undefined" ? window : globalThis);
