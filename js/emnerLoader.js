// emnerLoader.js
// Felles, enkel loader for emne-filer (History GO / AHA)
// + Helpers for learning_goals + checkpoints (related_goals)

/**
 * HISTORY GO – STRUKTURKONTRAKT (LÅST)
 *
 * Systemets navigasjon og læringsflyt følger:
 *   Merke → Gren/type → Temaområde → Emne (mikro) → Quiz → Instanser
 *
 * - Merke = inngang/kategori/badge (grov paraply)
 * - Gren/type = orientering ("hva slags typer finnes her?")
 * - Temaområde = problemfelt (ofte area_id/area_label)
 * - Emne = konkrete pensumblokker (mikro) med core_concepts
 * - Quiz kobles alltid til emne_id (aldri direkte til merke/gren)
 *
 * Viktig: Ikke vis mikro-emner direkte under Merke i UI.
 */

window.Emner = (function () {
  const DEBUG = !!window.DEBUG;

  // Kart over alle emne-filer per fagfelt / merke-id
  const EMNER_INDEX = {
    historie:       "emner/emner_historie.json",
    by:             "emner/emner_by.json",
    kunst:          "emner/emner_kunst.json",
    musikk:         "emner/emner_musikk.json",
    natur:          "emner/emner_natur.json",
    vitenskap:      "emner/emner_vitenskap.json",
    litteratur:     "emner/emner_litteratur.json",
    populaerkultur: "emner/emner_populaerkultur.json",
    naeringsliv:    "emner/emner_naeringsliv.json",
    sport:          "emner/emner_sport.json",
    politikk:       "emner/emner_politikk.json",
    subkultur:      "emner/emner_subkultur.json",
    psykologi:      "emner/emner_psykologi.json"
  };

  // cache[subjectId] = [emner...]
  const cache = {};

  function _norm(x) {
    return String(x || "").trim();
  }

  async function loadForSubject(subjectId) {
    const sid = _norm(subjectId);
    const url = EMNER_INDEX[sid];

    if (!url) {
      if (DEBUG) console.warn("[Emner] Ingen emne-fil definert for subjectId:", sid);
      cache[sid] = cache[sid] || [];
      return cache[sid];
    }

    if (cache[sid]) return cache[sid];

    try {
      const abs = new URL(url, document.baseURI).toString();
      const res = await fetch(abs, { cache: "no-store" });
      if (!res.ok) {
        if (DEBUG) console.warn("[Emner] Kunne ikke laste emner for", sid, res.status, url);
        cache[sid] = [];
        return cache[sid];
      }
      const data = await res.json();
      cache[sid] = Array.isArray(data) ? data : [];
      return cache[sid];
    } catch (e) {
      if (DEBUG) console.warn("[Emner] Feil ved lasting av emner for", sid, e);
      cache[sid] = [];
      return cache[sid];
    }
  }

  async function loadForSubjects(subjectIds = []) {
    const result = {};
    for (const id of subjectIds) {
      result[_norm(id)] = await loadForSubject(id);
    }
    return result;
  }

  function listSubjects() {
    return Object.keys(EMNER_INDEX);
  }

  // ============================================================
  // Helpers (mål + milepæler)
  // Støtter både:
  // - emne.learning_goals[]  (din nye struktur)
  // - emne.goals[]           (kompat)
  //
  // Checkpoints:
  // - emne.checkpoints[] (flat) med related_goals: [goal_id...]
  // - (kompat) nested goals[].checkpoints[] med goal_id
  // ============================================================

  function _findInCache(subjectId, emne_id) {
    const sid = _norm(subjectId);
    const list = cache[sid];
    if (!Array.isArray(list)) return null;

    const eid = _norm(emne_id);
    return list.find(e => _norm(e?.emne_id) === eid) || null;
  }

  async function getEmne(emne_id, subjectId) {
    const sid = _norm(subjectId);
    const eid = _norm(emne_id);
    if (!sid || !eid) return null;

    await loadForSubject(sid);
    return _findInCache(sid, eid);
  }

  async function getGoals(emne_id, subjectId) {
    const emne = await getEmne(emne_id, subjectId);
    if (!emne) return [];

    if (Array.isArray(emne.learning_goals)) return emne.learning_goals;
    if (Array.isArray(emne.goals)) return emne.goals;

    return [];
  }

  async function getCheckpoints(emne_id, subjectId, goal_id = null) {
    const emne = await getEmne(emne_id, subjectId);
    if (!emne) return [];

    const gid = goal_id != null ? _norm(goal_id) : null;

    // A) Flat checkpoints (DIN struktur): checkpoints[] + related_goals[]
    if (Array.isArray(emne.checkpoints)) {
      const all = emne.checkpoints;
      if (!gid) return all;

      return all.filter(cp =>
        Array.isArray(cp?.related_goals) &&
        cp.related_goals.some(x => _norm(x) === gid)
      );
    }

    // B) Nested (kompat): goals[].checkpoints[]
    const goals = Array.isArray(emne.learning_goals)
      ? emne.learning_goals
      : (Array.isArray(emne.goals) ? emne.goals : []);

    const nested = goals.flatMap(g => Array.isArray(g.checkpoints) ? g.checkpoints : []);
    if (!gid) return nested;

    // Nested kan ha cp.goal_id eller cp.related_goals – støtt begge
    return nested.filter(cp => {
      const direct = _norm(cp?.goal_id);
      if (direct && direct === gid) return true;
      if (Array.isArray(cp?.related_goals) && cp.related_goals.some(x => _norm(x) === gid)) return true;
      return false;
    });
  }

  // (valgfritt men praktisk) Finn checkpoint ved id
  async function getCheckpoint(emne_id, subjectId, cp_id) {
    const cps = await getCheckpoints(emne_id, subjectId);
    const cid = _norm(cp_id);
    return cps.find(c => _norm(c?.cp_id) === cid) || null;
  }

  return {
    loadForSubject,
    loadForSubjects,
    listSubjects,

    // helpers
    getEmne,
    getGoals,
    getCheckpoints,
    getCheckpoint
  };
})();
