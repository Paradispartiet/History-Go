// js/hgKnowledgeEngine.js
// History Go Knowledge Engine v1.2 (read-only analysis)
(function () {
  "use strict";

  function toArray(value) { return Array.isArray(value) ? value : []; }
  function toObject(value) { return value && typeof value === "object" && !Array.isArray(value) ? value : {}; }
  function safeNumber(value, fallback) {
    const fb = Number.isFinite(fallback) ? fallback : 0;
    const n = Number(value);
    return Number.isFinite(n) ? n : fb;
  }
  function unique(array) {
    return Array.from(new Set(toArray(array).filter(Boolean)));
  }
  function nowIso() { return new Date().toISOString(); }

  function readJsonStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_e) {
      return fallback;
    }
  }

  function s(value) { return String(value == null ? "" : value).trim(); }


  function normalizeIdCollection(value) {
    const ids = new Set();

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") {
          const id = s(item);
          if (id) ids.add(id);
          continue;
        }
        if (!item || typeof item !== "object") continue;
        const id = s(item.id || item.place_id || item.placeId || item.targetId);
        if (id) ids.add(id);
      }
      return Array.from(ids);
    }

    if (value && typeof value === "object") {
      for (const [key, raw] of Object.entries(value)) {
        if (!raw) continue;
        const id = s(key);
        if (id) ids.add(id);
      }
    }

    return Array.from(ids);
  }


  function readState() {
    const visitedPlacesRaw = readJsonStorage("visited_places", {});
    const todayVisitedRaw = readJsonStorage("hg_today_visited_v1", []);
    const todayVisitedSource = (todayVisitedRaw && typeof todayVisitedRaw === "object" && !Array.isArray(todayVisitedRaw))
      ? todayVisitedRaw.ids
      : todayVisitedRaw;

    return {
      learningLog: toArray(readJsonStorage("hg_learning_log_v1", [])),
      learningLogMigrated: toArray(readJsonStorage("hg_learning_log_migrated_v1", [])),
      knowledgeLearning: toObject(readJsonStorage("hg_learning_v1", {})),
      insightEvents: toArray(readJsonStorage("hg_insights_events_v1", [])),
      knowledgeUniverse: toArray(readJsonStorage("knowledge_universe", [])),
      quizProgress: toArray(readJsonStorage("quiz_progress", [])),
      visitedPlacesRaw: visitedPlacesRaw,
      visitedPlaceIds: normalizeIdCollection(visitedPlacesRaw),
      visitedPlaces: normalizeIdCollection(visitedPlacesRaw),
      todayVisitedRaw: todayVisitedRaw,
      todayVisitedIds: normalizeIdCollection(todayVisitedSource),
      todayVisited: normalizeIdCollection(todayVisitedSource),
      peopleCollected: toArray(readJsonStorage("people_collected", [])),
      meritsByCategory: toObject(readJsonStorage("merits_by_category", {})),
      historygoProgress: toObject(readJsonStorage("historygo_progress", {})),
      unlocks: toArray(readJsonStorage("hg_unlocks_v1", []))
    };
  }

  function extractSubjectFromEntry(entry) {
    const subject = s(entry?.subjectId || entry?.subject_id);
    if (subject) return subject;

    const raw = s(entry?.category || entry?.theme_id);
    if (!raw) return "";

    try {
      if (window.DomainRegistry?.resolve) return s(window.DomainRegistry.resolve(raw));
    } catch (_e) { }
    return raw;
  }

  function collectSignalsForSubject(subjectId, emnerAll, state, placeById) {
    const emneById = new Map();
    const subjectConcepts = new Set();

    for (const emne of emnerAll) {
      const eid = s(emne?.emne_id);
      if (eid) emneById.set(eid, emne);
      unique([].concat(toArray(emne?.core_concepts), toArray(emne?.keywords)).map(s)).forEach((c) => subjectConcepts.add(c));
    }

    const emneSignals = new Map();
    const conceptSignals = new Map();
    let quizSignals = 0;
    let visitedSignals = 0;
    let peopleSignals = 0;

    const streams = []
      .concat(toArray(state.learningLog))
      .concat(toArray(state.learningLogMigrated))
      .concat(toArray(state.insightEvents))
      .concat(toArray(state.knowledgeUniverse))
      .concat(toArray(state.quizProgress))
      .concat(toArray(state.unlocks));

    for (const entry of streams) {
      const sid = extractSubjectFromEntry(entry);
      if (sid && s(sid) !== s(subjectId)) continue;

      const emneIds = unique([entry?.emne_id].concat(toArray(entry?.emne_ids)).map(s));
      for (const eid of emneIds) {
        if (!eid || !emneById.has(eid)) continue;
        emneSignals.set(eid, (emneSignals.get(eid) || 0) + 1);
      }

      const concepts = unique([].concat(toArray(entry?.concepts), toArray(entry?.core_concepts)).map(s));
      for (const c of concepts) {
        if (!c) continue;
        if (subjectConcepts.has(c)) conceptSignals.set(c, (conceptSignals.get(c) || 0) + 1);
      }

      if (entry && (entry.place_id || entry.placeId)) visitedSignals += 1;
      if (entry && (entry.person_id || entry.personId)) peopleSignals += 1;
      if (entry && (entry.quiz_id || entry.quizId || entry.score != null || entry.correct != null)) quizSignals += 1;
    }

    const visitedEmneSignalKeys = new Set();
    for (const placeId of toArray(state.visitedPlaceIds)) {
      const normalizedPlaceId = s(placeId);
      if (!normalizedPlaceId) continue;
      const place = placeById?.get(normalizedPlaceId);
      if (!place) continue;
      for (const emneIdRaw of toArray(place?.emne_ids)) {
        const emneId = s(emneIdRaw);
        if (!emneId || !emneById.has(emneId)) continue;
        const signalKey = normalizedPlaceId + ":" + emneId;
        if (visitedEmneSignalKeys.has(signalKey)) continue;
        visitedEmneSignalKeys.add(signalKey);
        emneSignals.set(emneId, (emneSignals.get(emneId) || 0) + 1);
        visitedSignals += 1;
      }
    }

    const learningEntries = toObject(state.knowledgeLearning?.learning);
    for (const emne of emnerAll) {
      const eid = s(emne?.emne_id);
      if (!eid || !emneById.has(eid)) continue;
      const learned = toObject(learningEntries[eid]);
      let score = 0;
      if (learned.seen === true) score += 1;
      if (learned.understood === true) score += 2;
      if (learned.applied === true) score += 3;
      if (score > 0) emneSignals.set(eid, (emneSignals.get(eid) || 0) + score);
    }

    return { emneSignals, conceptSignals, quizSignals, visitedSignals, peopleSignals };
  }

  async function analyzeSubjects(opts) {
    const options = opts || {};
    const state = readState();
    const manifest = window.DataHub?.loadFagManifest ? await window.DataHub.loadFagManifest(options) : {};
    const healthReport = window.FagHealthReport?.run ? await window.FagHealthReport.run(options) : null;
    const placesAll = window.DataHub?.loadPlacesBase
      ? toArray(await window.DataHub.loadPlacesBase(options))
      : [];
    const placeById = new Map();
    for (const place of placesAll) {
      const id = s(place?.id);
      if (id) placeById.set(id, place);
    }

    const subjectIds = Object.keys(toObject(manifest));
    const by = {};

    for (const subjectId of subjectIds) {
      const emnerAll = window.DataHub?.loadEmner ? toArray(await window.DataHub.loadEmner(subjectId, options)) : [];
      const pensum = window.DataHub?.loadPensum ? toObject(await window.DataHub.loadPensum(subjectId, options)) : {};

      let courseResult = null;
      if (window.HGCourses?.compute) {
        try {
          courseResult = await window.HGCourses.compute({ subjectId: subjectId, emnerAll: emnerAll });
        } catch (_e1) {
          try { courseResult = await window.HGCourses.compute({ subjectId: subjectId, emnersAll: emnerAll }); } catch (_e2) { }
        }
      }

      const modules = toArray(pensum.modules);
      const domains = toArray(pensum.domains);
      const signals = collectSignalsForSubject(subjectId, emnerAll, state, placeById);

      const learningEntries = toObject(state.knowledgeLearning?.learning);
      let seenEmner = 0;
      let understoodEmner = 0;
      let appliedEmner = 0;
      let knownEmner = 0;
      for (const emne of emnerAll) {
        const eid = s(emne?.emne_id);
        if (!eid) continue;
        const node = toObject(learningEntries[eid]);
        const seen = node.seen === true;
        const understood = node.understood === true;
        const applied = node.applied === true;
        const signalSeen = signals.emneSignals.has(eid);
        if (seen || signalSeen) seenEmner += 1;
        if (understood) understoodEmner += 1;
        if (applied) appliedEmner += 1;
        if (seen || understood || applied || signalSeen) knownEmner += 1;
      }
      const knownConcepts = signals.conceptSignals.size;
      const emnerCount = emnerAll.length;
      const estimatedCoverage = Math.max(0, Math.min(100, Math.round(emnerCount > 0 ? (knownEmner / emnerCount) * 100 : 0)));

      const emneStrengths = Array.from(signals.emneSignals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id, n]) => ({ id: id, label: s(emnerAll.find(e => s(e?.emne_id) === id)?.title || id), signals: n, type: "emne" }));

      const conceptStrengths = Array.from(signals.conceptSignals.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([id, n]) => ({ id: id, label: id, signals: n, type: "concept" }));

      const gaps = emnerAll
        .filter((e) => !signals.emneSignals.has(s(e?.emne_id)))
        .slice(0, 5)
        .map((e) => ({
          emne_id: s(e?.emne_id),
          title: s(e?.title || e?.label || e?.name || e?.emne_id),
          reason: "no_learning_signal"
        }));

      const subjectHealth = healthReport?.subjects?.[subjectId] || {};
      const files = { pensum: "unknown", emner: "unknown", fagkart: "unknown", methods: "unknown", supersetQuizMal: "unknown" };
      let fileErrors = 0;
      let fileWarnings = 0;
      Object.keys(files).forEach((k) => {
        const st = s(subjectHealth?.[k]?.status || "unknown");
        if (st) files[k] = st;
        if (/error|invalid|missing|empty|http/i.test(st)) fileErrors += 1;
        if (/warn|mismatch/i.test(st)) fileWarnings += 1;
      });

      by[subjectId] = {
        subjectId: subjectId,
        health: { ok: fileErrors === 0, errors: fileErrors, warnings: fileWarnings },
        files: files,
        structure: {
          emnerCount: emnerCount,
          modulesCount: modules.length,
          domainsCount: domains.length,
          courseReady: !!(courseResult?.course?.total > 0 || modules.length > 0),
          domainAdapted: !!(pensum?.course_adapter || (!modules.length && domains.length))
        },
        progress: {
          knownEmner: knownEmner,
          seenEmner: seenEmner,
          understoodEmner: understoodEmner,
          appliedEmner: appliedEmner,
          knownConcepts: knownConcepts,
          quizSignals: signals.quizSignals,
          visitedSignals: signals.visitedSignals,
          peopleSignals: signals.peopleSignals,
          estimatedCoverage: estimatedCoverage
        },
        strengths: unique([].concat(emneStrengths, conceptStrengths)).slice(0, 5),
        gaps: gaps,
        next: gaps.slice(0, 3)
      };
    }

    return { by: by, healthReport: healthReport, manifest: manifest, state: state, placesLoadedCount: placesAll.length };
  }

  function buildRecommendations(analysis) {
    const subjects = Object.values(toObject(analysis?.subjects));
    const recommendations = [];

    const sortedByCoverage = subjects.slice().sort((a, b) => safeNumber(a?.progress?.estimatedCoverage) - safeNumber(b?.progress?.estimatedCoverage));
    const weakest = sortedByCoverage[0];
    if (weakest) {
      recommendations.push({
        type: "subject_focus",
        subjectId: weakest.subjectId,
        title: "Jobb videre med " + weakest.subjectId,
        reason: "Lav registrert dekning i faget.",
        priority: 1
      });
    }

    const largeLow = subjects
      .filter((s0) => safeNumber(s0?.structure?.emnerCount) >= 10 && safeNumber(s0?.progress?.estimatedCoverage) <= 30)
      .sort((a, b) => safeNumber(b?.structure?.emnerCount) - safeNumber(a?.structure?.emnerCount))[0];

    if (largeLow && (!weakest || largeLow.subjectId !== weakest.subjectId)) {
      recommendations.push({
        type: "subject_focus",
        subjectId: largeLow.subjectId,
        title: "Prioriter " + largeLow.subjectId,
        reason: "Mange emner, lav registrert dekning.",
        priority: 2
      });
    }

    const gapItems = [];
    for (const subject of sortedByCoverage) {
      for (const gap of toArray(subject?.gaps)) {
        gapItems.push({ subject: subject, gap: gap });
      }
    }

    gapItems.slice(0, 3).forEach((item, idx) => {
      recommendations.push({
        type: "emne_gap",
        subjectId: item.subject.subjectId,
        emne_id: item.gap.emne_id,
        title: item.gap.title,
        reason: "Ingen læringssignal registrert ennå.",
        priority: idx + 2
      });
    });

    return recommendations;
  }

  async function run(opts) {
    const analyzed = await analyzeSubjects(opts || {});
    const by = analyzed.by;
    const subjects = Object.values(by);

    const totalEmner = subjects.reduce((a, s0) => a + safeNumber(s0?.structure?.emnerCount), 0);
    const totalKnownEmner = subjects.reduce((a, s0) => a + safeNumber(s0?.progress?.knownEmner), 0);
    const avgCoverage = subjects.length
      ? Math.round(subjects.reduce((a, s0) => a + safeNumber(s0?.progress?.estimatedCoverage), 0) / subjects.length)
      : 0;

    const strongestSubjects = subjects.slice().sort((a, b) => safeNumber(b?.progress?.estimatedCoverage) - safeNumber(a?.progress?.estimatedCoverage)).slice(0, 3).map((s0) => s0.subjectId);
    const weakestSubjects = subjects.slice().sort((a, b) => safeNumber(a?.progress?.estimatedCoverage) - safeNumber(b?.progress?.estimatedCoverage)).slice(0, 3).map((s0) => s0.subjectId);

    const result = {
      ok: true,
      generatedAt: nowIso(),
      summary: {
        subjects: subjects.length,
        healthErrors: safeNumber(analyzed.healthReport?.summary?.errors),
        healthWarnings: safeNumber(analyzed.healthReport?.summary?.warnings),
        totalEmner: totalEmner,
        totalKnownEmner: totalKnownEmner,
        averageCoverage: Math.max(0, Math.min(100, avgCoverage)),
        strongestSubjects: strongestSubjects,
        weakestSubjects: weakestSubjects,
        courseReadySubjects: subjects.filter((x) => x?.structure?.courseReady).length,
        domainAdaptedSubjects: subjects.filter((x) => x?.structure?.domainAdapted).length
      },
      subjects: by,
      recommendations: [],
      sourceState: {
        learningLogCount: toArray(analyzed.state.learningLog).length,
        knowledgeLearningCount: Object.keys(toObject(analyzed.state.knowledgeLearning?.learning)).length,
        insightEventsCount: toArray(analyzed.state.insightEvents).length,
        visitedPlacesCount: toArray(analyzed.state.visitedPlaceIds).length,
        todayVisitedCount: toArray(analyzed.state.todayVisitedIds).length,
        placesLoadedCount: safeNumber(analyzed.placesLoadedCount),
        peopleCollectedCount: toArray(analyzed.state.peopleCollected).length,
        quizProgressCount: toArray(analyzed.state.quizProgress).length
      },
      healthReport: analyzed.healthReport
    };

    result.recommendations = buildRecommendations(result);

    if (typeof console !== "undefined") {
      console.group("[HGKnowledgeEngine]");
      console.table(subjects.map((item) => ({
        subjectId: item.subjectId,
        emnerCount: item.structure.emnerCount,
        knownEmner: item.progress.knownEmner,
        estimatedCoverage: item.progress.estimatedCoverage,
        modulesCount: item.structure.modulesCount,
        domainsCount: item.structure.domainsCount,
        courseReady: item.structure.courseReady,
        domainAdapted: item.structure.domainAdapted,
        gaps: toArray(item.gaps).length,
        strengths: toArray(item.strengths).length
      })));
      console.groupEnd();
    }

    return result;
  }

  window.HGKnowledgeEngine = {
    run: run,
    readState: readState,
    analyzeSubjects: analyzeSubjects,
    buildRecommendations: buildRecommendations
  };
})();
