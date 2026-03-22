// ============================================================
// storyResolver.js
// History Go / Civication
// Resolver historiske story flags fra faktisk spillerdata
// ============================================================

(function () {
  "use strict";

  const LS_STORY_STATE = "hg_story_state_v1";
  const STORY_THREADS_URL = "data/Civication/storyThreads.json";

  function safeParse(raw, fallback) {
    try {
      const v = JSON.parse(raw);
      return v == null ? fallback : v;
    } catch {
      return fallback;
    }
  }

  function readLS(key, fallback) {
    return safeParse(localStorage.getItem(key), fallback);
  }

  function uniq(arr) {
    return Array.from(new Set((Array.isArray(arr) ? arr : []).filter(Boolean)));
  }

  function normStr(v) {
    return String(v || "").trim();
  }

  function normLower(v) {
    return normStr(v).toLowerCase();
  }

  function tokenizeText(text) {
    return normLower(text)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9æøå]+/gi, " ")
      .split(/\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  function collectUnlockIds() {
    const unlocks = readLS("hg_unlocks_v1", {});
    const byQuiz = unlocks && typeof unlocks === "object" ? (unlocks.byQuiz || {}) : {};
    return uniq(Object.keys(byQuiz).map(normStr).filter(Boolean));
  }

  function collectVisitedPlaceIds() {
    const ids = collectUnlockIds();
    const placeIds = new Set(
      (Array.isArray(window.PLACES) ? window.PLACES : [])
        .map(p => normStr(p && p.id))
        .filter(Boolean)
    );

    return ids.filter(id => placeIds.has(id));
  }

  function collectUnlockedPeopleIds() {
    const ids = collectUnlockIds();
    const peopleIds = new Set(
      (Array.isArray(window.PEOPLE) ? window.PEOPLE : [])
        .map(p => normStr(p && p.id))
        .filter(Boolean)
    );

    return ids.filter(id => peopleIds.has(id));
  }

  function collectQuizCategoryIds() {
    const hist = readLS("quiz_history", []);
    if (!Array.isArray(hist)) return [];

    return uniq(
      hist
        .map(h => normStr(h && h.categoryId))
        .filter(Boolean)
    );
  }

  function collectMeritCategoryIds() {
    const merits = readLS("merits_by_category", {});
    if (!merits || typeof merits !== "object") return [];

    return uniq(
      Object.keys(merits)
        .map(normStr)
        .filter(Boolean)
    );
  }

  function collectKnowledgeTopics() {
    const uni = readLS("knowledge_universe", {});
    const out = [];

    if (uni && typeof uni === "object") {
      for (const cat of Object.keys(uni)) {
        const dims = uni[cat];
        if (!dims || typeof dims !== "object") continue;

        for (const dim of Object.keys(dims)) {
          const items = Array.isArray(dims[dim]) ? dims[dim] : [];
          for (const item of items) {
            const topic = normStr(item && item.topic);
            const text = normStr(item && item.text);

            if (topic) out.push(topic);
            if (text) out.push(...tokenizeText(text));
          }
        }
      }
    }

    return uniq(out.map(normLower).filter(Boolean));
  }

  function collectLearningConcepts() {
    const log = readLS("hg_learning_log_v1", []);
    if (!Array.isArray(log)) return [];

    const out = [];

    for (const evt of log) {
      const concepts = Array.isArray(evt && evt.concepts) ? evt.concepts : [];
      for (const c of concepts) {
        const v = normStr(c);
        if (v) out.push(v);
      }
    }

    return uniq(out.map(normLower).filter(Boolean));
  }

  function collectLearningEmner() {
    const log = readLS("hg_learning_log_v1", []);
    if (!Array.isArray(log)) return [];

    const out = [];

    for (const evt of log) {
      const emner = Array.isArray(evt && evt.related_emner) ? evt.related_emner : [];
      for (const id of emner) {
        const v = normStr(id);
        if (v) out.push(v);
      }
    }

    return uniq(out.map(normLower).filter(Boolean));
  }

  function buildSnapshot() {
    const visitedPlaceIds = collectVisitedPlaceIds();
    const unlockedPeopleIds = collectUnlockedPeopleIds();
    const quizCategoryIds = collectQuizCategoryIds();
    const meritCategoryIds = collectMeritCategoryIds();
    const knowledgeTopics = collectKnowledgeTopics();
    const learningConcepts = collectLearningConcepts();
    const learningEmner = collectLearningEmner();

    const categoryIds = uniq(
      quizCategoryIds.concat(meritCategoryIds).map(normStr).filter(Boolean)
    );

    return {
      visited_place_ids: visitedPlaceIds,
      unlocked_people_ids: unlockedPeopleIds,
      category_ids: categoryIds,
      knowledge_topics: knowledgeTopics,
      learning_concepts: learningConcepts,
      emne_hits: learningEmner
    };
  }

  function hasAll(requiredValues, actualValues, lower = false) {
    const req = Array.isArray(requiredValues) ? requiredValues : [];
    if (!req
