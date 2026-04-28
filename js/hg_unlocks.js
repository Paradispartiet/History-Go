// js/hg_unlocks.js
// ------------------------------------------------------------
// HGUnlocks v1 — samler "unlock" fra quiz (chips/begreper/tenkere/hooks)
// Lagrer kun det som faktisk var riktig (du kaller recordFromQuiz kun ved correct).
// Ingen ny “kilde”, bare en logg du kan bruke i UI.
// ------------------------------------------------------------

(function () {
  "use strict";

  const KEY = "hg_unlocks_v1";
  function dispatchProfileUpdate() {
    try { window.dispatchEvent(new Event("updateProfile")); } catch {}
  }

  function load() {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (!x || typeof x !== "object") return {};
      return x;
    } catch {
      return {};
    }
  }

  function save(x) {
    try {
      localStorage.setItem(KEY, JSON.stringify(x));
    } catch {}
  }

  function asArr(x) {
    if (!x) return [];
    if (Array.isArray(x)) return x.filter(Boolean).map(String);
    return [String(x)];
  }

  function uniqPush(arr, values) {
    const set = new Set(Array.isArray(arr) ? arr : []);
    asArr(values).forEach((v) => {
      const s = String(v || "").trim();
      if (s) set.add(s);
    });
    return Array.from(set);
  }

  // normaliser ID-strenger lett (ikke “smart”, bare trim)
  function normId(s) {
    return String(s || "").trim();
  }

  // recordFromQuiz({ quizId, categoryId, item, targetId })
  function recordFromQuiz({ quizId, categoryId, item, targetId }) {
    const db = load();

    const qid = normId(quizId || targetId || item?.quiz_id || item?.id || "unknown");
    const cat = normId(categoryId || item?.categoryId || item?.category_id || item?.category || "");

    db.byQuiz = db.byQuiz || {};
    const rowWasNew = !db.byQuiz[qid];
    db.byQuiz[qid] = db.byQuiz[qid] || {
      quizId: qid,
      categoryId: cat || null,
      ts_first: Date.now(),
      ts_last: Date.now(),
      hooks: [],
      concepts: [],
      thinkers: [],
      knowledge_ids: [],
      trivia_ids: [],
      emne_ids: []
    };

    const row = db.byQuiz[qid];
    let categoryChanged = false;
    if (!row.categoryId && cat) {
      row.categoryId = cat;
      categoryChanged = true;
    }

    // ---- hent ting fra item (støtter flere feltnavn) ----
    const hooks =
      item?.topic_hook ||
      item?.topic_hooks ||
      item?.hook ||
      item?.hooks ||
      item?.emne_hook ||
      item?.topicHook ||
      "";

    const concepts =
      item?.core_concepts ||
      item?.concepts ||
      item?.keywords ||
      "";

    const thinkers =
      item?.thinkers ||
      item?.canon_thinkers ||
      item?.canon?.thinkers ||
      item?.canonThinkers ||
      "";

    const knowledgeIds =
      item?.knowledge_ids ||
      item?.knowledgeIds ||
      item?.knowledge ||
      [];

    const triviaIds =
      item?.trivia_ids ||
      item?.triviaIds ||
      item?.trivia ||
      [];

    const emneIds =
      item?.emne_id ||
      item?.emneId ||
      item?.emne_ids ||
      item?.related_emner ||
      item?.relatedEmner ||
      [];

    // ---- merge (unik) ----
    const nextHooks = uniqPush(row.hooks, hooks);
    const nextConcepts = uniqPush(row.concepts, concepts);
    const nextThinkers = uniqPush(row.thinkers, thinkers);
    const nextKnowledgeIds = uniqPush(row.knowledge_ids, knowledgeIds);
    const nextTriviaIds = uniqPush(row.trivia_ids, triviaIds);
    const nextEmneIds = uniqPush(row.emne_ids, emneIds);

    const metadataChanged =
      nextHooks.length !== row.hooks.length ||
      nextConcepts.length !== row.concepts.length ||
      nextThinkers.length !== row.thinkers.length ||
      nextKnowledgeIds.length !== row.knowledge_ids.length ||
      nextTriviaIds.length !== row.trivia_ids.length ||
      nextEmneIds.length !== row.emne_ids.length;

    row.hooks = nextHooks;
    row.concepts = nextConcepts;
    row.thinkers = nextThinkers;
    row.knowledge_ids = nextKnowledgeIds;
    row.trivia_ids = nextTriviaIds;
    row.emne_ids = nextEmneIds;

    // ---- “global index” for rask UI ----
    db.index = db.index || { hooks: [], concepts: [], thinkers: [] };
    const beforeIndexHooks = Array.isArray(db.index.hooks) ? db.index.hooks.length : 0;
    const beforeIndexConcepts = Array.isArray(db.index.concepts) ? db.index.concepts.length : 0;
    const beforeIndexThinkers = Array.isArray(db.index.thinkers) ? db.index.thinkers.length : 0;
    db.index.hooks = uniqPush(db.index.hooks, row.hooks);
    db.index.concepts = uniqPush(db.index.concepts, row.concepts);
    db.index.thinkers = uniqPush(db.index.thinkers, row.thinkers);
    const indexChanged =
      db.index.hooks.length !== beforeIndexHooks ||
      db.index.concepts.length !== beforeIndexConcepts ||
      db.index.thinkers.length !== beforeIndexThinkers;

    const changed = rowWasNew || categoryChanged || metadataChanged || indexChanged;
    if (changed) {
      row.ts_last = Date.now();
      save(db);
      dispatchProfileUpdate();
    }

    // ping UI
    try { window.dispatchEvent(new CustomEvent("hg:unlocks")); } catch {}
  }

  window.HGUnlocks = {
    key: KEY,
    load,
    recordFromQuiz
  };
})();
