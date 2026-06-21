// js/Civication/systems/civicationHistoryGoTaskBridge.js
// CivicationHistoryGoTaskBridge — tynn reconciler: leser History Go-state og markerer den
// History Go-delen av åpne Civication-oppgaver fullført. Eier ikke task-state — kaller
// CivicationTaskEngine.markHistoryGoComplete. index.html og Civication.html er separate
// window-er som kun deler localStorage, så hovedmekanismen er reconcile ved app-open
// (civi:booted / visibilitychange / storage), ikke in-page events.
// Se docs/CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md.
(function () {
  "use strict";

  // Testmodus er isolert: broen skal aldri skrive progresjon i testmodus.
  function isTestMode() {
    try {
      if (typeof window.CivicationState?.isTestMode === "function") {
        return !!window.CivicationState.isTestMode();
      }
    } catch {}
    try {
      if (window.OPEN_MODE === true) return true;
    } catch {}
    return false;
  }

  function asSet(value) {
    const set = new Set();
    if (Array.isArray(value)) {
      value.forEach(function (v) {
        const id = String(v || "").trim();
        if (id) set.add(id);
      });
    } else if (value && typeof value === "object") {
      Object.keys(value).forEach(function (k) {
        if (value[k]) set.add(String(k).trim());
      });
    }
    return set;
  }

  function safeParse(raw, fallback) {
    try {
      const v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  // Snapshot av relevant, persistert History Go-state (delt localStorage).
  function readHistoryGoState() {
    let unlockByQuiz = {};
    try {
      unlockByQuiz = window.HGUnlocks?.load?.()?.byQuiz || {};
    } catch {
      unlockByQuiz = {};
    }

    return {
      visitedPlaces: asSet(safeParse(localStorage.getItem("visited_places"), [])),
      unlockByQuiz: unlockByQuiz && typeof unlockByQuiz === "object" ? unlockByQuiz : {},
      quizProgress: safeParse(localStorage.getItem("quiz_progress"), {}) || {},
      merits: safeParse(localStorage.getItem("merits_by_category"), {}) || {}
    };
  }

  function quizIsUnlocked(state, quizId) {
    const id = String(quizId || "").trim();
    if (!id) return false;
    return !!state.unlockByQuiz[id];
  }

  function quizHasProgress(state, quizId) {
    const id = String(quizId || "").trim();
    if (!id) return false;
    return !!state.quizProgress[id] || quizIsUnlocked(state, quizId);
  }

  function categoryHasPoints(state, categoryId) {
    const id = String(categoryId || "").trim();
    if (!id) return false;
    return Number(state.merits?.[id]?.points || 0) > 0;
  }

  // Avgjør om en åpen task er oppfylt av History Go-state.
  // Returnerer { source, correct } eller null (= ikke oppfylt ennå).
  // Modes uten stabil persistert markør (read_story, read_leksikon, person-open, debate)
  // returnerer null med vilje — tasken står åpen til History Go har et signal.
  function evaluate(task, state) {
    const p = task && task.task_payload;
    if (!p) return null;

    const mode = String(p.completion_mode || "").trim();
    const type = String(p.target_type || "").trim();

    if (type === "place") {
      if (mode === "open_place" || mode === "visit_place") {
        if (p.place_id && state.visitedPlaces.has(String(p.place_id))) {
          return { source: "visited_places", correct: true };
        }
        return null;
      }
      if (mode === "place_quiz") {
        if (quizIsUnlocked(state, p.quiz_id)) {
          return { source: "unlock_index", correct: true };
        }
        if (p.place_id && state.visitedPlaces.has(String(p.place_id))) {
          return { source: "visited_places", correct: false };
        }
        return null;
      }
      return null; // read_story: ingen signal ennå
    }

    if (type === "person") {
      if (mode === "person_quiz" && quizIsUnlocked(state, p.quiz_id)) {
        return { source: "unlock_index", correct: true };
      }
      return null; // open_person / read_profile: ingen persistert markør ennå
    }

    if (type === "knowledge") {
      if (mode === "correct_answer") {
        if (quizIsUnlocked(state, p.quiz_id)) {
          return { source: "unlock_index", correct: true };
        }
        return null;
      }
      if (mode === "quiz_completed") {
        if (quizIsUnlocked(state, p.quiz_id)) {
          return { source: "unlock_index", correct: true };
        }
        if (quizHasProgress(state, p.quiz_id)) {
          return { source: "quiz_progress", correct: false };
        }
        if (categoryHasPoints(state, p.category_id)) {
          return { source: "merits", correct: true };
        }
        return null;
      }
      if (categoryHasPoints(state, p.category_id)) {
        return { source: "merits", correct: true };
      }
      return null; // read_leksikon: ingen signal ennå
    }

    if (type === "unlock") {
      const unlockId = String(p.unlock_id || "").trim();
      if (!unlockId) return null;
      if (quizIsUnlocked(state, unlockId)) {
        return { source: "unlock_index", correct: true };
      }
      if (state.visitedPlaces.has(unlockId)) {
        return { source: "visited_places", correct: true };
      }
      return null;
    }

    // debate: forutsetter et History Go-debatt-signal som ikke finnes ennå
    return null;
  }

  // Hovedinngang: sammenlign åpne History Go-tasks mot History Go-state og markér treff.
  // Returnerer antall tasks som ble markert i denne kjøringen.
  function reconcile() {
    if (isTestMode()) return 0;

    const engine = window.CivicationTaskEngine;
    if (!engine?.findOpenHistoryGoTasks || !engine.markHistoryGoComplete) return 0;

    const tasks = engine.findOpenHistoryGoTasks();
    if (!tasks.length) return 0;

    const state = readHistoryGoState();
    let marked = 0;

    tasks.forEach(function (task) {
      if (task.history_go && task.history_go.completed_at) return; // idempotent
      const hit = evaluate(task, state);
      if (!hit) return;

      const p = task.task_payload;
      const updated = engine.markHistoryGoComplete(task.id, {
        completion_source: hit.source,
        completion_mode: p.completion_mode || null,
        matched_target: { target_type: p.target_type, target_id: p.target_id },
        correct: hit.correct
      });

      if (updated && updated.history_go) {
        marked += 1;
        try {
          window.dispatchEvent(
            new CustomEvent("civi:taskHistoryGoCompleted", {
              detail: {
                task_id: task.id,
                mail_id: task.mail_id || null,
                matched_target: updated.history_go.matched_target,
                correct: updated.history_go.correct
              }
            })
          );
        } catch {}
      }
    });

    return marked;
  }

  let scheduled = false;
  function scheduleReconcile() {
    if (scheduled) return;
    scheduled = true;
    const run = function () {
      scheduled = false;
      try {
        reconcile();
      } catch {}
    };
    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(run);
    } else {
      setTimeout(run, 0);
    }
  }

  function register() {
    // Primær: reconcile ved app-open.
    window.addEventListener("civi:booted", scheduleReconcile);
    window.addEventListener("civi:dataReady", scheduleReconcile);
    // Opportunistisk live-oppdatering når begge sider er åpne / fanen blir synlig.
    window.addEventListener("storage", scheduleReconcile);
    window.addEventListener("updateProfile", scheduleReconcile);
    try {
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") scheduleReconcile();
      });
    } catch {}
  }

  if (typeof document !== "undefined" && document.addEventListener) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", register, { once: true });
    } else {
      register();
    }
  }

  window.CivicationHistoryGoTaskBridge = {
    reconcile,
    evaluate,
    readHistoryGoState,
    isTestMode
  };
})();
