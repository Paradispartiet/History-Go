// hgInsights.js – v1: logger riktige quiz-svar som begreper

(function (global) {
  "use strict";

  const STORAGE_KEY = "hg_insights_events_v1";

  function loadEvents() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn("HGInsights: klarte ikke å lese events", e);
      return [];
    }
  }

  function saveEvents(events) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn("HGInsights: klarte ikke å lagre events", e);
    }
  }

// Kalles når bruker har svart riktig på et quiz-spørsmål
// quizItem: { id?, categoryId, personId, placeId, topic, core_concepts? }
function logCorrectQuizAnswer(userId, quizItem) {
  const u = userId || "anon";

  // ❗ Kun core_concepts regnes som begreper.
  // topic brukes IKKE lenger som fallback.
  const concepts = Array.isArray(quizItem.core_concepts)
    ? quizItem.core_concepts
        .map(c => String(c || "").trim())
        .filter(Boolean)
    : [];

  const evt = {
    userId: u,
    ts: Date.now(),
    type: "quiz_correct",
    quizId: quizItem.id || null,
    categoryId: quizItem.categoryId || null,
    personId: quizItem.personId || null,
    placeId: quizItem.placeId || null,
    concepts
  };

  const events = loadEvents();
  events.push(evt);
  saveEvents(events);
}

  // Hent begreper for en bruker
  function getUserConcepts(userId, options = {}) {
    const u = userId || "anon";
    const { categoryId } = options;

    const events = loadEvents().filter(e => e.userId === u);

    const counts = new Map();

    events.forEach(e => {
      if (categoryId && e.categoryId !== categoryId) return;
      (e.concepts || []).forEach(raw => {
        const key = String(raw).toLowerCase().trim();
        if (!key) return;
        const prev = counts.get(key) || { key, label: raw, count: 0 };
        prev.count += 1;
        counts.set(key, prev);
      });
    });

    return Array.from(counts.values()).sort((a, b) => b.count - a.count);
  }

  function clearAll() {
    saveEvents([]);
  }

  global.HGInsights = {
    logCorrectQuizAnswer,
    getUserConcepts,
    clearAll
  };
})(window);
