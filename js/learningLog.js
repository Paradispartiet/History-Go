// js/learningLog.js
// HGLearningLog — én sannhet for quiz-historikk og observasjoner.
// All data ligger i hg_learning_log_v1 (append-only event-logg).
// Denne modulen eksponerer et lesegrensesnitt som gir tilbake
// entries i samme form som gamle quiz_history, slik at eksisterende
// lesere (badge-modal, mini-profile, Civication m.fl.) ikke trenger
// å kjenne til event-formatet direkte.
//
// Kontrakt:
// - getQuizHistory() → array av { id, targetId, categoryId, name,
//   image, date, correctCount, total, correctAnswers } sortert
//   stigende på date.
// - migrateLegacy() → flytter evt. gammel quiz_history inn som
//   events (én gang) og fjerner den gamle nøkkelen.
//
// Viktig arkitektur:
// - Denne filen eier kun læringslogg.
// - NextUp eies av js/hgNavigator.js + js/nextUpRuntime.js.

(function (global) {
  "use strict";

  const LEARNING_KEY = "hg_learning_log_v1";
  const LEGACY_KEY = "quiz_history";
  const MIGRATED_FLAG = "hg_learning_log_migrated_v1";

  function dispatchProfileUpdate() {
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function safeParse(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      const v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function safeWrite(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  function isQuizEvent(evt) {
    const t = evt && evt.type;
    return t === "quiz_perfect" || t === "quiz_set_complete" || t === "quiz_legacy";
  }

  function toHistoryEntry(evt) {
    const ts = Number.isFinite(evt.ts) ? evt.ts : null;
    const date = evt.date || (ts ? new Date(ts).toISOString() : "");

    return {
      id: evt.id || evt.targetId || "",
      targetId: evt.targetId || evt.id || "",
      categoryId: evt.categoryId || "",
      name: evt.name || "",
      image: evt.image || "",
      date,
      correctCount: Number.isFinite(evt.correctCount) ? evt.correctCount : 0,
      total: Number.isFinite(evt.total) ? evt.total : 0,
      correctAnswers: Array.isArray(evt.correctAnswers) ? evt.correctAnswers : []
    };
  }

  function getEvents() {
    const v = safeParse(LEARNING_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  function getQuizHistory() {
    return getEvents()
      .filter(isQuizEvent)
      .map(toHistoryEntry)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }

  function migrateLegacy() {
    if (localStorage.getItem(MIGRATED_FLAG) === "1") {
      return { migrated: 0, skipped: true };
    }

    const legacy = safeParse(LEGACY_KEY, null);
    if (!Array.isArray(legacy) || !legacy.length) {
      localStorage.setItem(MIGRATED_FLAG, "1");
      try { localStorage.removeItem(LEGACY_KEY); } catch {}
      return { migrated: 0, skipped: false };
    }

    const existing = getEvents();
    const extras = legacy.map((entry) => ({
      schema: 1,
      type: "quiz_legacy",
      ts: Date.parse(entry?.date || "") || Date.now(),
      id: entry?.id || entry?.targetId || "",
      targetId: entry?.targetId || entry?.id || "",
      categoryId: entry?.categoryId || "",
      name: entry?.name || "",
      image: entry?.image || "",
      date: entry?.date || new Date().toISOString(),
      correctCount: Number.isFinite(entry?.correctCount) ? entry.correctCount : 0,
      total: Number.isFinite(entry?.total) ? entry.total : 0,
      correctAnswers: Array.isArray(entry?.correctAnswers) ? entry.correctAnswers : []
    }));

    safeWrite(LEARNING_KEY, existing.concat(extras));
    localStorage.setItem(MIGRATED_FLAG, "1");
    try { localStorage.removeItem(LEGACY_KEY); } catch {}
    dispatchProfileUpdate();

    if (window.DEBUG) {
      console.log(`[HGLearningLog] migrerte ${extras.length} quiz_history-oppføringer`);
    }

    return { migrated: extras.length, skipped: false };
  }

  global.HGLearningLog = {
    getEvents,
    getQuizHistory,
    migrateLegacy,
    KEYS: {
      LEARNING: LEARNING_KEY,
      LEGACY: LEGACY_KEY,
      MIGRATED_FLAG
    }
  };
})(window);
