// js/hg_unlocks.js
// ------------------------------------------------------------
// HGUnlocks v1 — samler "unlock" fra quiz (chips/begreper/tenkere/hooks)
// Lagrer kun det som faktisk var riktig (du kaller recordFromQuiz kun ved correct).
// Ingen ny “kilde”, bare en logg du kan bruke i UI.
// ------------------------------------------------------------

(function () {
  "use strict";

  const KEY = "hg_unlocks_v1";

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
    const set = new Set(arr || []);
    asArr(values).forEach(v => set.add(v));
    return Array.from(set);
  }

  // normaliser ID-strenger lett (ikke “smart”, bare trim)
  function normId(s) {
    return String(s || "").trim();
  }

  function recordFromQuiz({ quizId, categoryId, item, targetId }) {
    const db = load();
    const qid = normId(quizId || targetId || item?.quiz_id || item?.id || "unknown");
    const cat = normId(categoryId || item?.categoryId || item?.category_id || "");

    db.byQuiz = db.byQuiz || {};
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
    row.ts_last = Date.now();
    if (!row.categoryId && cat) row.categoryId = cat;

    // ---- hent ting fra item (støtter flere feltnavn) ----
    const hooks =
      item?.topic_hook ||
      item?.topic_hooks ||
      item?.hook ||
      item?.hooks ||
      item?.emne_hook ||
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
      [];

    // ---- merge (unik) ----
    row.hooks = uniqPush(row.hooks, hooks);
    row.concepts = uniqPush(row.concepts, concepts);
    row.thinkers = uniqPush(row.thinkers, thinkers);
    row.knowledge_ids = uniqPush(row.knowledge_ids, knowledgeIds);
    row.trivia_ids = uniqPush(row.trivia_ids, triviaIds);
    row.emne_ids = uniqPush(row.emne_ids, emneIds);

    // ---- “global index” for rask UI ----
    db.index = db.index || { hooks: [], concepts: [], thinkers: [] };
    db.index.hooks = uniqPush(db.index.hooks, row.hooks);
    db.index.concepts = uniqPush(db.index.concepts, row.concepts);
    db.index.thinkers = uniqPush(db.index.thinkers, row.thinkers);

    save(db);

    // ping UI
    try { window.dispatchEvent(new CustomEvent("hg:unlocks")); } catch {}
  }

  window.HGUnlocks = {
    key: KEY,
    load,
    recordFromQuiz
  };
})();
