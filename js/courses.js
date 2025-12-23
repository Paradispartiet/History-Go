// js/courses.js — HGCourses (kurs + diplom) bygget på learning log + pensum_*.json
// STRICT: ingen normalisering (kun trim). window.DEBUG styrer warnings.

(function () {
  "use strict";

  function dlog(...a) { if (window.DEBUG) console.log("[HGCourses]", ...a); }
  function dwarn(...a) { if (window.DEBUG) console.warn("[HGCourses]", ...a); }

  function s(x) { return String(x ?? "").trim(); }
  function arr(x) { return Array.isArray(x) ? x : []; }

  function safeParse(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "null");
      return v == null ? fallback : v;
    } catch (e) {
      dwarn("bad json in", key, e);
      return fallback;
    }
  }

  function absUrl(path) {
    return new URL(String(path || ""), document.baseURI).toString();
  }

  async function fetchJson(path) {
    const url = absUrl(path);
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error(`${r.status} ${url}`);
    return await r.json();
  }

  // --------------------------------------------
  // Learning log
  // --------------------------------------------
  const LEARNING_KEY = "hg_learning_log_v1";

  function getLearningLog() {
    const v = safeParse(LEARNING_KEY, []);
    return Array.isArray(v) ? v : [];
  }

  function buildLearningIndex(log) {
    // strict: keys = exact strings (trim)
    const emneHits = new Set();        // emne_id
    const conceptCounts = new Map();   // concept -> count
    const perfectByCat = new Map();    // categoryId -> count

    for (const evt of arr(log)) {
      const type = s(evt?.type);
      const cat = s(evt?.categoryId);
      if (type === "quiz_perfect" && cat) {
        perfectByCat.set(cat, (perfectByCat.get(cat) || 0) + 1);
      }

      for (const eid of arr(evt?.related_emner)) {
        const k = s(eid);
        if (k) emneHits.add(k);
      }

      for (const c of arr(evt?.concepts)) {
        const k = s(c);
        if (!k) continue;
        conceptCounts.set(k, (conceptCounts.get(k) || 0) + 1);
      }
    }

    return { emneHits, conceptCounts, perfectByCat };
  }

  function getUserConceptsFromIndex(conceptCounts) {
    return Array.from(conceptCounts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => (b.count || 0) - (a.count || 0));
  }

  // --------------------------------------------
  // Pensum loader
  // --------------------------------------------
  async function loadPensum(subjectId) {
    const sid = s(subjectId);
    if (!sid) throw new Error("subjectId missing");

    // primær: data/pensum_<subjectId>.json
    const primary = `data/pensum_${sid}.json`;

    try {
      const p = await fetchJson(primary);
      if (p && typeof p === "object") return p;
    } catch (e) {
      dwarn("could not load", primary, e);
    }

    // fallback: hvis du fortsatt har gamle filer med annet navn,
    // kan du legge en eksplisitt map i app.js senere. Ikke her.
    throw new Error(`Fant ikke pensumfil: ${primary}`);
  }

  // --------------------------------------------
  // Emne-dekning (bruk V2 hvis den finnes)
  // --------------------------------------------
  function computeEmneCoverageForModule(module, userConcepts, emnerAll, emneHits) {
    const moduleEmner = arr(module?.emner).map(s).filter(Boolean);
    if (!moduleEmner.length) {
      return {
        moduleEmner,
        directHitCount: 0,
        coveredCount: 0,
        requiredCount: 0,
        percentAvg: 0,
        detail: []
      };
    }

    // filtrer emne-objekter for module
    const emneObjs = arr(emnerAll).filter(e => moduleEmner.includes(s(e?.emne_id)));

    const threshold = Number.isFinite(module?.pass_percent) ? module.pass_percent : 70;

    let detail = [];
    if (typeof window.computeEmneDekningV2 === "function") {
      detail = window.computeEmneDekningV2(userConcepts, emneObjs, { emneHits });
    } else if (typeof window.computeEmneDekning === "function") {
      detail = window.computeEmneDekning(userConcepts, emneObjs);
    } else {
      // ingen dekning-funksjon tilgjengelig => vi teller bare direct hits
      detail = emneObjs.map(e => ({
        emne_id: s(e?.emne_id),
        title: e?.title,
        matchCount: 0,
        total: arr(e?.core_concepts).length,
        percent: 0,
        missing: arr(e?.core_concepts),
        directHit: !!(s(e?.emne_id) && emneHits.has(s(e?.emne_id)))
      }));
    }

    const requiredCount = moduleEmner.length;

    const directHitCount = detail.filter(x => x.directHit).length;
    const coveredCount = detail.filter(x => (Number(x.percent) || 0) >= threshold || x.directHit).length;

    const percentAvg = detail.length
      ? Math.round(detail.reduce((a, x) => a + (Number(x.percent) || 0), 0) / detail.length)
      : 0;

    return {
      moduleEmner,
      directHitCount,
      coveredCount,
      requiredCount,
      percentAvg,
      threshold,
      detail
    };
  }

  // --------------------------------------------
  // Konsept-dekning per modul
  // --------------------------------------------
  function computeConceptCoverageForModule(module, conceptCounts) {
    const required = arr(module?.konsepter).map(s).filter(Boolean);
    if (!required.length) {
      return { required, hit: 0, requiredCount: 0, missing: [] };
    }

    let hit = 0;
    const missing = [];

    for (const k of required) {
      if (conceptCounts.has(k)) hit++;
      else missing.push(k);
    }

    const requiredCount = required.length;
    return { required, hit, requiredCount, missing };
  }

  // --------------------------------------------
  // Module completion rule (solid default)
  // --------------------------------------------
  function computeModuleStatus(module, subjectId, idx, emnerAll) {
    const moduleId = s(module?.module_id);
    const title = s(module?.title) || moduleId || "Modul";

    const minPerfectQuizzes = Number.isFinite(module?.min_perfect_quizzes)
      ? module.min_perfect_quizzes
      : 1;

    const passPercent = Number.isFinite(module?.pass_percent) ? module.pass_percent : 70;

    const byCat = idx.perfectByCat.get(s(subjectId)) || 0;

    const userConcepts = getUserConceptsFromIndex(idx.conceptCounts);
    const emneCoverage = computeEmneCoverageForModule(module, userConcepts, emnerAll, idx.emneHits);
    const conceptCoverage = computeConceptCoverageForModule(module, idx.conceptCounts);

    // Regel:
    // A) Emner: alle module.emner må være covered (>=passPercent OR directHit)
    // B) Konsepter: minst 35% av module.konsepter må være truffet (justerbart)
    // C) Quiz: minst minPerfectQuizzes i subject-kategorien (by/historie/...)
    const conceptMinPct = Number.isFinite(module?.concept_min_percent) ? module.concept_min_percent : 35;
    const conceptPct = conceptCoverage.requiredCount
      ? Math.round((conceptCoverage.hit / conceptCoverage.requiredCount) * 100)
      : 0;

    const emnerOk = emneCoverage.requiredCount
      ? emneCoverage.coveredCount >= emneCoverage.requiredCount
      : true;

    const conceptsOk = conceptCoverage.requiredCount
      ? conceptPct >= conceptMinPct
      : true;

    const quizOk = byCat >= minPerfectQuizzes;

    const completed = !!(emnerOk && conceptsOk && quizOk);

    return {
      module_id: moduleId,
      title,
      level: Number(module?.level || 0),
      estimated_minutes: Number(module?.estimated_minutes || 0),

      rule: {
        passPercent,
        conceptMinPct,
        minPerfectQuizzes
      },

      stats: {
        perfectQuizzesInCategory: byCat,
        emner: emneCoverage,
        concepts: {
          ...conceptCoverage,
          percent: conceptPct
        }
      },

      completed
    };
  }

  function computeCourseProgress(pensum, subjectId, idx, emnerAll) {
    const modules = arr(pensum?.modules);
    const statuses = modules.map(m => computeModuleStatus(m, subjectId, idx, emnerAll));

    const done = statuses.filter(x => x.completed).length;
    const total = statuses.length;
    const percent = total ? Math.round((done / total) * 100) : 0;

    return { done, total, percent, modules: statuses };
  }

  function computeDiplomaStatus(courseProgress) {
    // Diplom = 100% moduler fullført
    const ok = !!(courseProgress && courseProgress.total > 0 && courseProgress.done === courseProgress.total);
    return {
      eligible: ok,
      done: courseProgress?.done || 0,
      total: courseProgress?.total || 0,
      percent: courseProgress?.percent || 0
    };
  }

  // --------------------------------------------
  // Public API
  // --------------------------------------------
  const HGCourses = {};

  HGCourses.loadPensum = loadPensum;

  HGCourses.compute = async function ({ subjectId, emnerAll }) {
    const sid = s(subjectId);
    const pensum = await loadPensum(sid);

    const log = getLearningLog();
    const idx = buildLearningIndex(log);

    const course = computeCourseProgress(pensum, sid, idx, arr(emnerAll));
    const diploma = computeDiplomaStatus(course);

    return {
      subjectId: sid,
      pensum,
      learning: {
        logCount: log.length,
        emneHitsCount: idx.emneHits.size,
        topConcepts: getUserConceptsFromIndex(idx.conceptCounts).slice(0, 15)
      },
      course,
      diploma
    };
  };

  window.HGCourses = HGCourses;
})();
