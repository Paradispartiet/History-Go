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

  // Prosjektrot beregnet fra denne scriptfilen, ikke fra HTML-siden.
  // Dette gjør loaderen trygg både fra index.html og fra /knowledge/*.html.
  const PROJECT_ROOT = (() => {
    const src = document.currentScript?.src || "";
    if (src) return new URL("../", src).toString();
    return new URL("./", location.href).toString();
  })();

  // Kart over alle emne-filer per fagfelt / merke-id
  // historie og vitenskap ligger direkte i data/fag/, resten i underfolder.
  // populaerkultur er alias for popkultur (fysisk fil).
  const EMNER_INDEX = {
    historie:       "data/fag/emner_historie.json",
    vitenskap:      "data/fag/emner_vitenskap.json",
    by:             "data/fag/by/emner_by.json",
    kunst:          "data/fag/kunst/emner_kunst.json",
    musikk:         "data/fag/musikk/emner_musikk.json",
    natur:          "data/fag/natur/emner_natur.json",
    litteratur:     "data/fag/litteratur/emner_litteratur.json",
    popkultur:      "data/fag/popkultur/emner_popkultur.json",
    populaerkultur: "data/fag/popkultur/emner_popkultur.json",
    naeringsliv:    "data/fag/naeringsliv/emner_naeringsliv.json",
    sport:          "data/fag/sport/emner_sport.json",
    politikk:       "data/fag/politikk/emner_politikk.json",
    subkultur:      "data/fag/subkultur/emner_subkultur.json",
    psykologi:      "data/fag/psykologi/emner_psykologi.json"
  };

  // cache[subjectId] = [emner...]
  const cache = {};

  function _norm(x) {
    return String(x || "").trim();
  }

  function getEmnerUrl(subjectId) {
    return EMNER_INDEX[_norm(subjectId)] || "";
  }

  async function loadForSubject(subjectId) {
    const sid = _norm(subjectId);
    const url = getEmnersUrlSafe(sid);

    if (!url) {
      if (DEBUG) console.warn("[Emner] Ingen emne-fil definert for subjectId:", sid);
      cache[sid] = cache[sid] || [];
      return cache[sid];
    }

    if (cache[sid]) return cache[sid];

    try {
      const abs = new URL(url, PROJECT_ROOT).toString();
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

  function getEmnersUrlSafe(sid) {
    return EMNER_INDEX[_norm(sid)] || "";
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

    if (Array.isArray(emne.checkpoints)) {
      const all = emne.checkpoints;
      if (!gid) return all;

      return all.filter(cp =>
        Array.isArray(cp?.related_goals) &&
        cp.related_goals.some(x => _norm(x) === gid)
      );
    }

    const goals = Array.isArray(emne.learning_goals)
      ? emne.learning_goals
      : (Array.isArray(emne.goals) ? emne.goals : []);

    const nested = goals.flatMap(g => Array.isArray(g.checkpoints) ? g.checkpoints : []);
    if (!gid) return nested;

    return nested.filter(cp => {
      const direct = _norm(cp?.goal_id);
      if (direct && direct === gid) return true;
      if (Array.isArray(cp?.related_goals) && cp.related_goals.some(x => _norm(x) === gid)) return true;
      return false;
    });
  }

  async function getCheckpoint(emne_id, subjectId, cp_id) {
    const cps = await getCheckpoints(emne_id, subjectId);
    const cid = _norm(cp_id);
    return cps.find(c => _norm(c?.cp_id) === cid) || null;
  }

  return {
    loadForSubject,
    loadForSubjects,
    listSubjects,
    getEmne,
    getGoals,
    getCheckpoints,
    getCheckpoint,
    getEmnerUrl,
    PROJECT_ROOT
  };
})();

// ------------------------------------------------------------
// Compatibility bridge
// Enkelte knowledge-komponenter forventer DataHub.loadEmner().
// Når full DataHub ikke er lastet, bruk Emner-loaderen som fallback.
// ------------------------------------------------------------
(function () {
  "use strict";

  window.DataHub = window.DataHub || {};

  if (typeof window.DataHub.loadEmner !== "function") {
    window.DataHub.loadEmner = function loadEmnerViaEmner(subjectId, opts = {}) {
      return window.Emner.loadForSubject(subjectId, opts);
    };
  }
})();
