// js/hg_nature_unlocks.js
// ------------------------------------------------------------
// HGNatureUnlocks v1 — samler flora/fauna-objekter fra QUIZ
// Kalles fra quizzes.js: HGNatureUnlocks.recordFromQuiz({ quizId })
// ------------------------------------------------------------
(function () {
  "use strict";

  const KEY = "hg_nature_unlocks_v1";
  const MAP_URL = "data/nature/nature_unlock_map.json";

  function loadDb() {
    try {
      const x = JSON.parse(localStorage.getItem(KEY) || "{}");
      return x && typeof x === "object" ? x : {};
    } catch {
      return {};
    }
  }

  function saveDb(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {}
  }

  function normId(s) { return String(s || "").trim(); }

  function uniqPush(arr, values) {
    const out = new Set(Array.isArray(arr) ? arr : []);
    const xs = Array.isArray(values) ? values : (values ? [values] : []);
    xs.forEach(v => {
      const id = normId(v);
      if (id) out.add(id);
    });
    return Array.from(out);
  }

  let _map = null;
  let _loading = null;

  async function ensureMapLoaded() {
    if (_map) return _map;
    if (_loading) return _loading;

    _loading = (async () => {
      const r = await fetch(new URL(MAP_URL, document.baseURI).toString(), { cache: "no-store" });
      if (!r.ok) throw new Error(`${r.status} ${MAP_URL}`);
      const j = await r.json();
      _map = j && typeof j === "object" ? j : {};
      return _map;
    })();

    return _loading;
  }

  async function recordFromQuiz({ quizId }) {
    const qid = normId(quizId);
    if (!qid) return { ok: false, reason: "missing quizId" };

    const map = await ensureMapLoaded();
    const hit = map[qid];
    if (!hit) return { ok: true, quizId: qid, added: { flora: [], fauna: [] }, reason: "no mapping" };

    const db = loadDb();
    db.collected = db.collected || { flora: [], fauna: [] };
    db.byQuiz = db.byQuiz || {};

    const floraAdd = Array.isArray(hit.flora) ? hit.flora : [];
    const faunaAdd = Array.isArray(hit.fauna) ? hit.fauna : [];

    const beforeFlora = db.collected.flora.length;
    const beforeFauna = db.collected.fauna.length;

    db.collected.flora = uniqPush(db.collected.flora, floraAdd);
    db.collected.fauna = uniqPush(db.collected.fauna, faunaAdd);

    db.byQuiz[qid] = db.byQuiz[qid] || { quizId: qid, ts_first: Date.now(), ts_last: Date.now(), flora: [], fauna: [] };
    db.byQuiz[qid].ts_last = Date.now();
    db.byQuiz[qid].flora = uniqPush(db.byQuiz[qid].flora, floraAdd);
    db.byQuiz[qid].fauna = uniqPush(db.byQuiz[qid].fauna, faunaAdd);

    saveDb(db);

    const added = {
      flora: db.collected.flora.slice(beforeFlora),
      fauna: db.collected.fauna.slice(beforeFauna)
    };

    try { window.dispatchEvent(new CustomEvent("hg:nature")); } catch {}
    return { ok: true, quizId: qid, added };
  }

  function load() { return loadDb(); }

  window.HGNatureUnlocks = {
    key: KEY,
    load,
    recordFromQuiz,
    ensureMapLoaded
  };
})();
