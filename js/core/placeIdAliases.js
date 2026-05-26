(function(){
  "use strict";
  const PLACE_ID_ALIASES = Object.freeze({
    sagene_film: "sagene",
    kampen_film: "kampen",
    psykologirommet_oslo: "psykologisk_institutt_uio"
  });
  function normalizePlaceId(id){
    const key = String(id || "").trim();
    return PLACE_ID_ALIASES[key] || key;
  }
  function normalizeCompositeId(id) {
    const key = String(id || "").trim();
    if (!key) return key;
    const idx = key.indexOf("::");
    if (idx === -1) return normalizePlaceId(key);
    const head = key.slice(0, idx);
    const tail = key.slice(idx);
    return `${normalizePlaceId(head)}${tail}`;
  }
  function mergeObjectsConservative(target, source) {
    const out = { ...(target || {}) };
    for (const [k, v] of Object.entries(source || {})) {
      if (!(k in out)) out[k] = v;
      else if (Array.isArray(out[k]) && Array.isArray(v)) out[k] = Array.from(new Set([...out[k], ...v]));
      else if (out[k] && typeof out[k] === "object" && v && typeof v === "object") out[k] = mergeObjectsConservative(out[k], v);
    }
    return out;
  }
  function migrateProgressStorage(localStorageRef = window.localStorage) {
    const read = (k, fallback) => {
      try { const v = JSON.parse(localStorageRef.getItem(k) || "null"); return v == null ? fallback : v; } catch { return fallback; }
    };
    const write = (k, v) => { try { localStorageRef.setItem(k, JSON.stringify(v)); } catch {} };

    // quiz_progress
    const quizProgress = read("quiz_progress", {});
    if (quizProgress && typeof quizProgress === "object") {
      for (const row of Object.values(quizProgress)) {
        if (!row || typeof row !== "object") continue;
        const list = Array.isArray(row.completed) ? row.completed : [];
        row.completed = Array.from(new Set(list.map(normalizeCompositeId).filter(Boolean)));
      }
      write("quiz_progress", quizProgress);
    }

    // hg_learning_log_v1
    const log = read("hg_learning_log_v1", []);
    if (Array.isArray(log)) {
      for (const evt of log) {
        if (!evt || typeof evt !== "object") continue;
        if ("id" in evt) evt.id = normalizeCompositeId(evt.id);
        if ("targetId" in evt) evt.targetId = normalizeCompositeId(evt.targetId);
        if ("parentTargetId" in evt) evt.parentTargetId = normalizeCompositeId(evt.parentTargetId);
      }
      write("hg_learning_log_v1", log);
    }

    // hg_quiz_sets_v1
    const sets = read("hg_quiz_sets_v1", {});
    if (sets && typeof sets === "object" && !Array.isArray(sets)) {
      const migrated = {};
      for (const [k, v] of Object.entries(sets)) {
        const nk = normalizeCompositeId(k);
        migrated[nk] = mergeObjectsConservative(migrated[nk], v);
      }
      write("hg_quiz_sets_v1", migrated);
    }

    // hg_unlocks_v1
    const unlocks = read("hg_unlocks_v1", {});
    if (unlocks && typeof unlocks === "object") {
      const byQuiz = unlocks.byQuiz;
      if (byQuiz && typeof byQuiz === "object" && !Array.isArray(byQuiz)) {
        const migrated = {};
        for (const [k, row] of Object.entries(byQuiz)) {
          const nk = normalizeCompositeId(k);
          migrated[nk] = mergeObjectsConservative(migrated[nk], row);
          if (migrated[nk] && typeof migrated[nk] === "object" && !Array.isArray(migrated[nk])) {
            migrated[nk].quizId = nk;
          }
        }
        unlocks.byQuiz = migrated;
        write("hg_unlocks_v1", unlocks);
      }
    }
  }
  function getPlaceIdAliases(){ return PLACE_ID_ALIASES; }
  window.HGPlaceIds = { normalizePlaceId, normalizeCompositeId, getPlaceIdAliases, migrateProgressStorage };
})();
