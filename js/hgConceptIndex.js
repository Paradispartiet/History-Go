// hgConceptIndex.js
// Bygger et globalt begrepskart fra emner + quizer

(function (global) {
  "use strict";

  // ── Normalisering av begreps-tekst ─────────────────────────────

  function normalizeConcept(raw) {
    if (!raw) return "";
    let t = String(raw).toLowerCase().trim();

    // fjern hermetegn og «» osv i kantene
    t = t
      .replace(/^[\s.,;:!?()[\]"'«»]+/, "")
      .replace(/[\s.,;:!?()[\]"'«»]+$/, "");

    // slå sammen flere mellomrom
    t = t.replace(/\s+/g, " ");

    if (t.length < 2) return "";
    return t;
  }

  // ── Hjelper: legg til ett begrep i map ─────────────────────────

  function addConcept(map, rawKey, payload) {
    const key = normalizeConcept(rawKey);
    if (!key) return;

    let entry = map.get(key);
    if (!entry) {
      entry = {
        key,                 // normalisert nøkkel
        labels: new Set(),   // ulike skrivemåter / synonymer
        total_weight: 0,
        sources: []          // { kind, weight, ...meta }
      };
      map.set(key, entry);
    }

    if (payload && payload.label) {
      entry.labels.add(normalizeConcept(payload.label));
    } else {
      entry.labels.add(key);
    }

    const w = payload && typeof payload.weight === "number"
      ? payload.weight
      : 1;

    entry.total_weight += w;
    entry.sources.push({
      kind: payload.kind || "unknown",
      weight: w,
      subject_id: payload.subject_id || null,
      area_id: payload.area_id || null,
      area_label: payload.area_label || null,
      emne_id: payload.emne_id || null,
      title: payload.title || null,
      categoryId: payload.categoryId || null,
      quiz_id: payload.quiz_id || null,
      personId: payload.personId || null,
      placeId: payload.placeId || null,
      field: payload.field || null // f.eks "core_concept", "keyword", "topic"
    });
  }

  // ── Indexer emner_* (emner_historie, emner_vitenskap ...) ──────
  //
  // emnerArray: array fra f.eks emner_vitenskap.json

  function indexEmner(emnerArray, subjectId, map) {
    if (!Array.isArray(emnerArray)) return;

    emnerArray.forEach((emne) => {
      if (!emne) return;
      const basePayload = {
        kind: "emne",
        subject_id: emne.subject_id || subjectId || null,
        area_id: emne.area_id || null,
        area_label: emne.area_label || null,
        emne_id: emne.emne_id || null,
        title: emne.title || emne.short_label || null
      };

      // core_concepts = kjerne-begreper (tyngst vekt)
      (emne.core_concepts || []).forEach((c) => {
        addConcept(map, c, {
          ...basePayload,
          field: "core_concept",
          weight: 5
        });
      });

      // key_terms: viktige arbeidsbegreper
      (emne.key_terms || []).forEach((c) => {
        addConcept(map, c, {
          ...basePayload,
          field: "key_term",
          weight: 3
        });
      });

      // keywords: temaord
      (emne.keywords || []).forEach((c) => {
        addConcept(map, c, {
          ...basePayload,
          field: "keyword",
          weight: 2
        });
      });

      // dimensions: faglige dimensjoner
      (emne.dimensions || []).forEach((c) => {
        addConcept(map, c, {
          ...basePayload,
          field: "dimension",
          weight: 1.5
        });
      });
    });
  }

  // ── Indexer quiz_* (quiz_historie, quiz_kunst, quiz_vitenskap) ─

  function indexQuizzes(quizArray, categoryId, map) {
    if (!Array.isArray(quizArray)) return;

    quizArray.forEach((q) => {
      if (!q) return;
      const basePayload = {
        kind: "quiz",
        categoryId: q.categoryId || categoryId || null,
        quiz_id: q.id || null,
        personId: q.personId || null,
        placeId: q.placeId || null,
        title: q.question || null
      };

      // topic fra quiz = mini-begrep / underemne
      if (q.topic) {
        addConcept(map, q.topic, {
          ...basePayload,
          field: "topic",
          weight: 3
        });
      }

      // dimension fra quiz (f.eks "kilder", "maktkamp")
      if (q.dimension) {
        addConcept(map, q.dimension, {
          ...basePayload,
          field: "dimension",
          weight: 2
        });
      }

      // kunnskapstekst kan ha ett eller flere begreper,
      // men vi lar det vente til senere hvis du vil ha automatisk ekstraksjon.
      // (Vi kan koble på AHA.extractConcepts her senere.)
      /*
      if (q.knowledge) {
        const concepts = extractConcepts(q.knowledge); // TODO: kobles på hvis du vil
        concepts.slice(0, 10).forEach((c) => {
          addConcept(map, c.key, {
            ...basePayload,
            field: "knowledge",
            weight: 1 + (c.count || 0) * 0.5
          });
        });
      }
      */

      // Selve riktig svar kan også brukes som et begrep
      if (q.answer) {
        addConcept(map, q.answer, {
          ...basePayload,
          field: "answer",
          weight: 1.2
        });
      }
    });
  }

  // ── Bygg globalt begrepskart ────────────────────────────────────
  //
  // sources = {
  //   emnerBySubject: {
  //     historie: EMNER_HISTORIE,
  //     vitenskap: EMNER_VITENSKAP,
  //     ...
  //   },
  //   quizzesByCategory: {
  //     historie: QUIZ_HISTORIE,
  //     vitenskap: QUIZ_VITENSKAP,
  //     kunst: QUIZ_KUNST
  //   }
  // }

  function buildGlobalConceptIndex(sources) {
    const map = new Map();
    const s = sources || {};

    const emnerBySubject = s.emnerBySubject || {};
    Object.keys(emnerBySubject).forEach((subjectId) => {
      indexEmner(emnerBySubject[subjectId], subjectId, map);
    });

    const quizzesByCategory = s.quizzesByCategory || {};
    Object.keys(quizzesByCategory).forEach((catId) => {
      indexQuizzes(quizzesByCategory[catId], catId, map);
    });

    // konverter Set -> Array før vi eksporterer
    const indexArray = Array.from(map.values())
      .map((e) => ({
        key: e.key,
        labels: Array.from(e.labels),
        total_weight: e.total_weight,
        sources: e.sources
      }))
      .sort((a, b) => b.total_weight - a.total_weight);

    return indexArray;
  }

  // ── Oppslag: finn info om ett begrep ───────────────────────────

  function getConceptSummary(conceptIndex, rawKey) {
    if (!Array.isArray(conceptIndex)) return null;
    const key = normalizeConcept(rawKey);
    if (!key) return null;

    return conceptIndex.find((c) => c.key === key) || null;
  }

  // ── Public API ─────────────────────────────────────────────────

  const HGConceptIndex = {
    buildGlobalConceptIndex,
    getConceptSummary,
    normalizeConcept
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = HGConceptIndex;
  } else {
    global.HGConceptIndex = HGConceptIndex;
  }
})(this);
