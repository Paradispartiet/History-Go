// js/hg_nature_unlocks.js
// ------------------------------------------------------------
// HGNatureUnlocks v2 — samler flora/fauna-objekter fra QUIZ
// Kalles fra quizzes.js: HGNatureUnlocks.recordFromQuiz({ quizId, placeId })
//
// Kontrakt:
// - Samler kun hvis mapping finnes i nature_unlock_map.json
// - Samler kun hvis artens places[] inneholder placeId
//   (men: hvis art mangler places[], tillates unlock for ikke å blokkere piloter)
// ------------------------------------------------------------
(function () {
  "use strict";

  const KEY = "hg_nature_unlocks_v2";

  const MAP_URL   = "data/nature/nature_unlock_map.json";
  const FLORA_URL = "data/nature/flora.json";
  const FAUNA_URL = "data/nature/fauna.json";

  // ---------- storage ----------
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

  // ---------- utils ----------
  function normId(s) { return String(s || "").trim(); }

  function uniqPush(arr, values) {
    const out = new Set(Array.isArray(arr) ? arr : []);
    const xs = Array.isArray(values) ? values : (values ? [values] : []);
    xs.forEach((v) => {
      const id = normId(v);
      if (id) out.add(id);
    });
    return Array.from(out);
  }

  async function fetchJson(path) {
    const url = new URL(String(path || ""), document.baseURI).toString();
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${path}`);
    return await r.json();
  }

  // ---------- caches ----------
  let _map = null;
  let _mapLoading = null;

  let _floraIndex = null;
  let _faunaIndex = null;
  let _bioLoading = null;

  function toIndex(arr) {
    const idx = {};
    (Array.isArray(arr) ? arr : []).forEach((o) => {
      const id = normId(o && o.id);
      if (id) idx[id] = o;
    });
    return idx;
  }

  async function ensureMapLoaded() {
    if (_map) return _map;
    if (_mapLoading) return _mapLoading;

    _mapLoading = (async () => {
      const j = await fetchJson(MAP_URL);
      _map = j && typeof j === "object" ? j : {};
      return _map;
    })();

    return _mapLoading;
  }

  async function ensureBioLoaded() {
    if (_floraIndex && _faunaIndex) return { flora: _floraIndex, fauna: _faunaIndex };
    if (_bioLoading) return _bioLoading;

    _bioLoading = (async () => {
      let floraArr = [];
      let faunaArr = [];

      try { floraArr = await fetchJson(FLORA_URL); } catch { floraArr = []; }
      try { faunaArr = await fetchJson(FAUNA_URL); } catch { faunaArr = []; }

      _floraIndex = toIndex(floraArr);
      _faunaIndex = toIndex(faunaArr);

      return { flora: _floraIndex, fauna: _faunaIndex };
    })();

    return _bioLoading;
  }

  // ---------- rule: can collect at place? ----------
  function allowedAtPlace(kind, id, placeId) {
    const pid = normId(placeId);
    if (!pid) return false; // krever sted for å samle (hvis du vil løsne dette senere: return true)

    const idx = (kind === "flora") ? _floraIndex : _faunaIndex;
    const obj = idx ? idx[normId(id)] : null;
    if (!obj) return false;

    const places = Array.isArray(obj.places) ? obj.places.map(normId).filter(Boolean) : [];
    if (!places.length) return true; // pilot-safe: ikke blokkér hvis places mangler
    return places.includes(pid);
  }

  // ---------- main ----------
  async function recordFromQuiz({ quizId, placeId }) {
    const qid = normId(quizId);
    const pid = normId(placeId);

    if (!qid) return { ok: false, reason: "missing quizId" };
    if (!pid) return { ok: false, reason: "missing placeId" };

    const map = await ensureMapLoaded();
    const hit = map[qid];

    if (!hit) {
      return { ok: true, quizId: qid, placeId: pid, added: { flora: [], fauna: [] }, reason: "no mapping" };
    }

    await ensureBioLoaded();

    const floraRaw = Array.isArray(hit.flora) ? hit.flora : [];
    const faunaRaw = Array.isArray(hit.fauna) ? hit.fauna : [];

    // sted-filter
    const floraAdd = floraRaw.filter((id) => allowedAtPlace("flora", id, pid));
    const faunaAdd = faunaRaw.filter((id) => allowedAtPlace("fauna", id, pid));

    if (!floraAdd.length && !faunaAdd.length) {
      return { ok: true, quizId: qid, placeId: pid, added: { flora: [], fauna: [] }, reason: "filtered_by_place" };
    }

    const db = loadDb();
    db.collected = db.collected || { flora: [], fauna: [] };
    db.byQuiz = db.byQuiz || {};
    db.byPlace = db.byPlace || {};

    const beforeFlora = db.collected.flora.length;
    const beforeFauna = db.collected.fauna.length;

    db.collected.flora = uniqPush(db.collected.flora, floraAdd);
    db.collected.fauna = uniqPush(db.collected.fauna, faunaAdd);

    // audit per quiz
    db.byQuiz[qid] = db.byQuiz[qid] || { quizId: qid, ts_first: Date.now(), ts_last: Date.now(), flora: [], fauna: [], places: [] };
    db.byQuiz[qid].ts_last = Date.now();
    db.byQuiz[qid].flora = uniqPush(db.byQuiz[qid].flora, floraAdd);
    db.byQuiz[qid].fauna = uniqPush(db.byQuiz[qid].fauna, faunaAdd);
    db.byQuiz[qid].places = uniqPush(db.byQuiz[qid].places, [pid]);

    // audit per place
    db.byPlace[pid] = db.byPlace[pid] || { placeId: pid, ts_first: Date.now(), ts_last: Date.now(), flora: [], fauna: [], quizzes: [] };
    db.byPlace[pid].ts_last = Date.now();
    db.byPlace[pid].flora = uniqPush(db.byPlace[pid].flora, floraAdd);
    db.byPlace[pid].fauna = uniqPush(db.byPlace[pid].fauna, faunaAdd);
    db.byPlace[pid].quizzes = uniqPush(db.byPlace[pid].quizzes, [qid]);

    saveDb(db);

    const added = {
      flora: db.collected.flora.slice(beforeFlora),
      fauna: db.collected.fauna.slice(beforeFauna)
    };

    try { window.dispatchEvent(new CustomEvent("hg:nature", { detail: { quizId: qid, placeId: pid, added } })); } catch {}
    return { ok: true, quizId: qid, placeId: pid, added };
  }

  function load() { return loadDb(); }
  function reset() { try { localStorage.removeItem(KEY); } catch {} }

  window.HGNatureUnlocks = {
    key: KEY,
    load,
    reset,
    recordFromQuiz,
    ensureMapLoaded,
    ensureBioLoaded
  };
})();
