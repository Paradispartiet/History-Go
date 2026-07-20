// js/knowledgeV2.js
// Canonical read/capture model for the user's personal Knowledge universe.
// Knowledge is created by quiz-like assessment. Visits and observations may help
// explain provenance, but they do not become Knowledge entries on their own.
(function (root, factory) {
  "use strict";

  const api = factory(root || {});
  if (root) root.HGKnowledgeV2 = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis, function (global) {
  "use strict";

  const ENTRY_KEY = "hg_knowledge_entries_v2";
  const LEGACY_KEY = "knowledge_universe";
  const LEARNING_LOG_KEY = "hg_learning_log_v1";
  const SCHEMA = "history_go_knowledge_entry_v2";
  const VERSION = 2;

  const SUBJECT_LABELS = Object.freeze({
    historie: "Historie",
    vitenskap: "Vitenskap",
    kunst: "Kunst & kultur",
    natur: "Natur & miljø",
    musikk: "Musikk",
    populaerkultur: "Populærkultur",
    subkultur: "Subkultur",
    sport: "Sport",
    by: "By & arkitektur",
    politikk: "Politikk & samfunn",
    naeringsliv: "Næringsliv",
    litteratur: "Litteratur",
    psykologi: "Psykologi"
  });

  function s(value) {
    return String(value == null ? "" : value).trim();
  }

  function toArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function toObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function unique(values) {
    return Array.from(new Set(toArray(values).map(s).filter(Boolean)));
  }

  function readJson(key, fallback) {
    try {
      if (!global.localStorage) return fallback;
      const raw = global.localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed == null ? fallback : parsed;
    } catch (_error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      if (!global.localStorage) return false;
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function slug(value) {
    return s(value)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 120);
  }

  function normalizeSubjectId(value) {
    const raw = s(value);
    if (!raw) return "";
    try {
      if (global.DomainRegistry?.toRuntimeCategoryId) {
        return s(global.DomainRegistry.toRuntimeCategoryId(raw));
      }
      if (global.DomainRegistry?.resolve) return s(global.DomainRegistry.resolve(raw));
    } catch (_error) {}
    return raw === "popkultur" ? "populaerkultur" : raw;
  }

  function normalizeEmneIds(value) {
    const row = value && typeof value === "object" ? value : {};
    return unique([
      row.emne_id,
      ...toArray(row.emne_ids),
      ...toArray(row.related_emner),
      ...toArray(row.related_emners),
      ...toArray(row.relatedEmner),
      ...toArray(row.relatedEmneIds)
    ]);
  }

  function normalizeConcepts(value) {
    const row = value && typeof value === "object" ? value : {};
    return unique([
      ...toArray(row.concepts),
      ...toArray(row.core_concepts),
      ...toArray(row.conceptIds),
      ...toArray(row.tags),
      ...toArray(row.begreper)
    ]);
  }

  function normalizeTargetIds(event) {
    const row = event && typeof event === "object" ? event : {};
    return unique([
      row.parentTargetId,
      row.targetId,
      row.placeId,
      row.place_id,
      row.personId,
      row.person_id,
      row.id
    ]);
  }

  function getEntries() {
    const rows = readJson(ENTRY_KEY, []);
    return Array.isArray(rows) ? rows : [];
  }

  function saveEntries(entries) {
    return writeJson(ENTRY_KEY, Array.isArray(entries) ? entries : []);
  }

  function inferTargetKind(targetId) {
    const id = s(targetId);
    if (!id) return { place_id: null, person_id: null };

    const places = Array.isArray(global.PLACES) ? global.PLACES : [];
    if (places.some((place) => s(place?.id) === id)) {
      return { place_id: id, person_id: null };
    }

    const people = Array.isArray(global.PEOPLE) ? global.PEOPLE : [];
    if (people.some((person) => s(person?.id) === id)) {
      return { place_id: null, person_id: id };
    }

    return { place_id: null, person_id: null };
  }

  function upsertEntry(entry) {
    if (!entry || !entry.id) return null;

    const rows = getEntries();
    const index = rows.findIndex((row) => s(row?.id) === s(entry.id));
    const now = new Date().toISOString();

    if (index >= 0) {
      const previous = rows[index] || {};
      rows[index] = {
        ...previous,
        ...entry,
        learned_at: previous.learned_at || entry.learned_at || now,
        last_seen_at: now,
        times_seen: Number(previous.times_seen || 1) + 1,
        emne_ids: unique([...(previous.emne_ids || []), ...(entry.emne_ids || [])]),
        concepts: unique([...(previous.concepts || []), ...(entry.concepts || [])])
      };
      saveEntries(rows);
      return rows[index];
    }

    const next = {
      schema: SCHEMA,
      version: VERSION,
      learned_at: now,
      last_seen_at: now,
      times_seen: 1,
      ...entry
    };
    rows.push(next);
    saveEntries(rows);
    return next;
  }

  function captureQuizKnowledge(quizItem, context = {}) {
    if (!quizItem || typeof quizItem !== "object") return null;

    const subjectId = normalizeSubjectId(
      quizItem.fagkart_category_id ||
      quizItem.subject_id ||
      quizItem.categoryId ||
      quizItem.category ||
      context.categoryId ||
      context.subjectId
    );
    if (!subjectId) return null;

    const sourceQuizId = s(quizItem.quiz_id || quizItem.quizId || quizItem.id || context.id);
    const targetId = s(
      quizItem.targetId ||
      quizItem.placeId ||
      quizItem.personId ||
      context.targetId ||
      context.placeId ||
      context.personId
    );
    const text = s(quizItem.knowledge || quizItem.explanation || quizItem.text || quizItem.answer);
    if (!text) return null;

    const emneIds = normalizeEmneIds(quizItem);
    const concepts = normalizeConcepts(quizItem);
    const targetKind = inferTargetKind(targetId);
    const stableSource = sourceQuizId || [targetId, quizItem.topic, quizItem.question].map(slug).filter(Boolean).join("_");
    const id = `kv2_${slug(subjectId)}_${slug(stableSource || text.slice(0, 80))}`;

    return upsertEntry({
      id,
      subject_id: subjectId,
      fagkart_category_id: subjectId,
      emne_ids: emneIds,
      concepts,
      dimension: s(quizItem.dimension || context.dimension || "generelt") || "generelt",
      topic: s(quizItem.topic || quizItem.question || context.topic || "Lært gjennom quiz"),
      text,
      answer: s(quizItem.answer),
      source: {
        type: "quiz",
        quiz_id: sourceQuizId || null,
        target_id: targetId || null,
        place_id: s(quizItem.placeId || context.placeId || targetKind.place_id) || null,
        person_id: s(quizItem.personId || context.personId || targetKind.person_id) || null
      },
      link_status: emneIds.length ? "linked" : "pending_emne_link"
    });
  }

  function findLegacyTargetId(itemId, learningLog) {
    const id = s(itemId);
    if (!id) return "";

    const candidates = unique(
      toArray(learningLog).flatMap((event) => normalizeTargetIds(event))
    ).sort((a, b) => b.length - a.length);

    for (const targetId of candidates) {
      if (id === `quiz_${targetId}` || id.startsWith(`quiz_${targetId}_`)) return targetId;
    }
    return "";
  }

  function migrateLegacyKnowledge() {
    const legacy = toObject(readJson(LEGACY_KEY, {}));
    const learningLog = toArray(readJson(LEARNING_LOG_KEY, []));
    const existing = getEntries();
    const existingIds = new Set(existing.map((entry) => s(entry?.legacy?.legacy_entry_id)).filter(Boolean));
    let migrated = 0;

    for (const [rawSubjectId, dimensions] of Object.entries(legacy)) {
      const subjectId = normalizeSubjectId(rawSubjectId);
      for (const [dimension, items] of Object.entries(toObject(dimensions))) {
        for (const item of toArray(items)) {
          const legacyEntryId = `${subjectId}:${dimension}:${s(item?.id || item?.topic || item?.text)}`;
          if (!legacyEntryId || existingIds.has(legacyEntryId)) continue;

          const targetId = findLegacyTargetId(item?.id, learningLog);
          upsertEntry({
            id: `legacy_${slug(legacyEntryId)}`,
            subject_id: subjectId,
            fagkart_category_id: subjectId,
            emne_ids: [],
            concepts: [],
            dimension: s(dimension || "generelt") || "generelt",
            topic: s(item?.topic || "Lært gjennom quiz"),
            text: s(item?.text),
            source: {
              type: "legacy_quiz_knowledge",
              quiz_id: s(item?.id) || null,
              target_id: targetId || null,
              place_id: null,
              person_id: null
            },
            legacy: {
              legacy_entry_id: legacyEntryId,
              storage_key: LEGACY_KEY
            },
            link_status: "legacy_unresolved"
          });
          existingIds.add(legacyEntryId);
          migrated += 1;
        }
      }
    }

    return { migrated, total: getEntries().length };
  }

  function scoreConceptOverlap(entryConcepts, eventConcepts) {
    const eventSet = new Set(unique(eventConcepts).map((value) => value.toLowerCase()));
    return unique(entryConcepts).reduce((score, concept) => (
      eventSet.has(concept.toLowerCase()) ? score + 1 : score
    ), 0);
  }

  function reconcileEntriesFromLearningLog() {
    const entries = getEntries();
    const learningLog = toArray(readJson(LEARNING_LOG_KEY, []));
    let changed = 0;

    const next = entries.map((entry) => {
      if (toArray(entry?.emne_ids).length) return entry;

      const subjectId = normalizeSubjectId(entry?.subject_id || entry?.fagkart_category_id);
      const targetId = s(entry?.source?.target_id);
      const entryConcepts = normalizeConcepts(entry);

      const candidates = learningLog
        .map((event) => ({
          event,
          subjectId: normalizeSubjectId(event?.subjectId || event?.subject_id || event?.categoryId || event?.category || event?.domain),
          targetIds: normalizeTargetIds(event),
          emneIds: normalizeEmneIds(event),
          concepts: normalizeConcepts(event)
        }))
        .filter((candidate) => candidate.emneIds.length)
        .filter((candidate) => !subjectId || !candidate.subjectId || candidate.subjectId === subjectId)
        .filter((candidate) => !targetId || candidate.targetIds.includes(targetId))
        .map((candidate) => ({
          ...candidate,
          overlap: scoreConceptOverlap(entryConcepts, candidate.concepts)
        }))
        .filter((candidate) => !entryConcepts.length || candidate.overlap > 0)
        .sort((a, b) => b.overlap - a.overlap || Number(b.event?.ts || 0) - Number(a.event?.ts || 0));

      const best = candidates[0];
      if (!best) return entry;

      changed += 1;
      return {
        ...entry,
        emne_ids: unique(best.emneIds),
        link_status: "linked_from_learning_log",
        link_evidence: {
          event_type: s(best.event?.type),
          event_id: s(best.event?.id || best.event?.quizId),
          concept_overlap: best.overlap
        }
      };
    });

    if (changed) saveEntries(next);
    return { changed, total: next.length };
  }

  function installCaptureBridge() {
    if (!global || global.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__) return false;

    const legacySave = typeof global.saveKnowledgeFromQuiz === "function"
      ? global.saveKnowledgeFromQuiz.bind(global)
      : null;

    global.saveKnowledgeFromQuiz = function saveKnowledgeFromQuizV2(quizItem, context) {
      let legacyResult;
      if (legacySave) legacyResult = legacySave(quizItem, context);
      captureQuizKnowledge(quizItem, context || {});
      return legacyResult;
    };

    global.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__ = true;
    return true;
  }

  async function loadEmner(subjectId) {
    if (global.DataHub?.loadEmner) {
      try {
        const rows = await global.DataHub.loadEmner(subjectId, { cache: "default" });
        if (Array.isArray(rows)) return rows;
      } catch (_error) {}
    }
    if (global.Emner?.loadForSubject) {
      try {
        const rows = await global.Emner.loadForSubject(subjectId);
        if (Array.isArray(rows)) return rows;
      } catch (_error) {}
    }
    return [];
  }

  async function listSubjectIds(entries) {
    const ids = new Set(entries.map((entry) => normalizeSubjectId(entry?.subject_id || entry?.fagkart_category_id)).filter(Boolean));

    if (global.DataHub?.loadFagManifest) {
      try {
        const manifest = await global.DataHub.loadFagManifest({ cache: "default" });
        Object.keys(toObject(manifest)).forEach((id) => ids.add(normalizeSubjectId(id)));
      } catch (_error) {}
    }

    Object.keys(SUBJECT_LABELS).forEach((id) => ids.add(id));
    return Array.from(ids).filter(Boolean);
  }

  function inferEntryEmneIds(entry, emner, learningLog) {
    const explicit = normalizeEmneIds(entry);
    if (explicit.length) return { ids: explicit, method: entry.link_status || "explicit" };

    const entryConcepts = new Set(normalizeConcepts(entry).map((concept) => concept.toLowerCase()));
    if (entryConcepts.size) {
      const scored = toArray(emner)
        .map((emne) => {
          const concepts = unique([...(emne?.core_concepts || []), ...(emne?.keywords || [])]);
          const score = concepts.reduce((sum, concept) => sum + (entryConcepts.has(s(concept).toLowerCase()) ? 1 : 0), 0);
          return { id: s(emne?.emne_id || emne?.id), score };
        })
        .filter((row) => row.id && row.score > 0)
        .sort((a, b) => b.score - a.score);

      if (scored.length) {
        const top = scored[0].score;
        return { ids: scored.filter((row) => row.score === top).map((row) => row.id), method: "concept_overlap" };
      }
    }

    const targetId = s(entry?.source?.target_id);
    const subjectId = normalizeSubjectId(entry?.subject_id || entry?.fagkart_category_id);
    const fromLog = unique(
      toArray(learningLog)
        .filter((event) => {
          const eventSubject = normalizeSubjectId(event?.subjectId || event?.subject_id || event?.categoryId || event?.category || event?.domain);
          const subjectMatches = !subjectId || !eventSubject || eventSubject === subjectId;
          const targetMatches = !targetId || normalizeTargetIds(event).includes(targetId);
          return subjectMatches && targetMatches;
        })
        .flatMap((event) => normalizeEmneIds(event))
    );

    return { ids: fromLog, method: fromLog.length ? "learning_log_target" : "unresolved" };
  }

  async function buildProfile(options = {}) {
    migrateLegacyKnowledge();
    reconcileEntriesFromLearningLog();

    const entries = getEntries();
    const learningLog = toArray(readJson(LEARNING_LOG_KEY, []));
    const subjectIds = await listSubjectIds(entries);
    const requestedSubjectId = normalizeSubjectId(options.subjectId);
    const subjects = {};

    for (const subjectId of subjectIds) {
      if (requestedSubjectId && requestedSubjectId !== subjectId) continue;

      const emner = await loadEmner(subjectId);
      const subjectEntries = entries.filter((entry) => normalizeSubjectId(entry?.subject_id || entry?.fagkart_category_id) === subjectId);
      const conceptCounts = new Map();
      const enrichedEntries = subjectEntries.map((entry) => {
        normalizeConcepts(entry).forEach((concept) => {
          const key = concept.toLowerCase();
          const previous = conceptCounts.get(key) || { id: key, label: concept, count: 0 };
          previous.count += 1;
          conceptCounts.set(key, previous);
        });

        const resolved = inferEntryEmneIds(entry, emner, learningLog);
        return { ...entry, resolved_emne_ids: resolved.ids, resolved_link_method: resolved.method };
      });

      const emneRows = toArray(emner).map((emne) => {
        const emneId = s(emne?.emne_id || emne?.id);
        const linkedEntries = enrichedEntries.filter((entry) => toArray(entry.resolved_emne_ids).includes(emneId));
        return {
          emne_id: emneId,
          title: s(emne?.title || emne?.name || emneId),
          description: s(emne?.description || emne?.summary || emne?.ingress),
          core_concepts: unique(emne?.core_concepts),
          dimensions: unique(emne?.dimensions),
          knowledge_count: linkedEntries.length,
          entries: linkedEntries
        };
      });

      let course = null;
      if (global.HGCourses?.compute) {
        try {
          course = await global.HGCourses.compute({ subjectId, emnerAll: emner });
        } catch (_error) {}
      }

      subjects[subjectId] = {
        subject_id: subjectId,
        label: SUBJECT_LABELS[subjectId] || subjectId,
        knowledge_count: enrichedEntries.length,
        linked_count: enrichedEntries.filter((entry) => toArray(entry.resolved_emne_ids).length).length,
        unresolved_count: enrichedEntries.filter((entry) => !toArray(entry.resolved_emne_ids).length).length,
        concepts: Array.from(conceptCounts.values()).sort((a, b) => b.count - a.count),
        entries: enrichedEntries,
        emner: emneRows.sort((a, b) => b.knowledge_count - a.knowledge_count || a.title.localeCompare(b.title, "nb")),
        course
      };
    }

    const visibleSubjects = Object.values(subjects);
    const totalKnowledge = visibleSubjects.reduce((sum, subject) => sum + subject.knowledge_count, 0);
    const totalLinked = visibleSubjects.reduce((sum, subject) => sum + subject.linked_count, 0);
    const totalUnresolved = visibleSubjects.reduce((sum, subject) => sum + subject.unresolved_count, 0);
    const allConcepts = new Map();

    visibleSubjects.forEach((subject) => subject.concepts.forEach((concept) => {
      const previous = allConcepts.get(concept.id) || { ...concept, count: 0 };
      previous.count += concept.count;
      allConcepts.set(concept.id, previous);
    }));

    return {
      schema: "history_go_knowledge_profile_v2",
      version: VERSION,
      generated_at: new Date().toISOString(),
      summary: {
        knowledge_count: totalKnowledge,
        linked_count: totalLinked,
        unresolved_count: totalUnresolved,
        subject_count: visibleSubjects.filter((subject) => subject.knowledge_count > 0).length,
        concept_count: allConcepts.size
      },
      concepts: Array.from(allConcepts.values()).sort((a, b) => b.count - a.count),
      subjects
    };
  }

  function getContractHealth(entries = getEntries()) {
    const rows = toArray(entries);
    const missingSubject = rows.filter((entry) => !normalizeSubjectId(entry?.subject_id || entry?.fagkart_category_id));
    const missingEmne = rows.filter((entry) => !normalizeEmneIds(entry).length);
    const missingConcepts = rows.filter((entry) => !normalizeConcepts(entry).length);
    const missingText = rows.filter((entry) => !s(entry?.text));

    return {
      total: rows.length,
      missing_subject: missingSubject.length,
      missing_emne: missingEmne.length,
      missing_concepts: missingConcepts.length,
      missing_text: missingText.length,
      ok: missingSubject.length === 0 && missingEmne.length === 0 && missingText.length === 0
    };
  }

  function boot() {
    migrateLegacyKnowledge();
    installCaptureBridge();
    reconcileEntriesFromLearningLog();
  }

  if (global?.addEventListener) {
    global.addEventListener("hg:quizCompleted", () => {
      try { reconcileEntriesFromLearningLog(); } catch (_error) {}
    });
    global.addEventListener("hg:appReady", () => {
      try { installCaptureBridge(); } catch (_error) {}
    });
  }

  boot();

  return {
    SCHEMA,
    VERSION,
    KEYS: { ENTRIES: ENTRY_KEY, LEGACY: LEGACY_KEY, LEARNING_LOG: LEARNING_LOG_KEY },
    SUBJECT_LABELS,
    normalizeEmneIds,
    normalizeConcepts,
    captureQuizKnowledge,
    migrateLegacyKnowledge,
    reconcileEntriesFromLearningLog,
    installCaptureBridge,
    getEntries,
    buildProfile,
    getContractHealth
  };
});
