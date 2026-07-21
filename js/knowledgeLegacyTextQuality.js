// js/knowledgeLegacyTextQuality.js
// Renser de eksisterende knowledge_universe- og hg_knowledge_entries_v2-lagrene.
// Oppretter ingen ny datakilde.
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HGKnowledgeLegacyTextQuality = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const LEGACY_KEY = "knowledge_universe";
  const V2_KEY = "hg_knowledge_entries_v2";
  const QUALITY_VERSION = 1;
  const INSTALL_FLAG = "__HG_KNOWLEDGE_LEGACY_TEXT_QUALITY_INSTALLED__";

  const s = (value) => String(value == null ? "" : value).trim();
  const rows = (value) => Array.isArray(value) ? value : [];
  const unique = (values) => Array.from(new Set(rows(values).map(s).filter(Boolean)));

  function normalized(value) {
    return s(value)
      .toLocaleLowerCase("nb")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9æøå]+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function splitClaims(value) {
    if (root?.HGQuizKnowledgeQuality?.splitClaims) {
      return root.HGQuizKnowledgeQuality.splitClaims(value);
    }
    const raw = s(value).replace(/\r\n?/g, "\n").replace(/\n[•·*-]?\s*/g, ". ");
    if (!raw) return [];
    return unique(raw
      .split(/(?<=[.!?])\s+|;\s+(?=[A-ZÆØÅ0-9])/u)
      .map((claim) => s(claim).replace(/^[•·*-]+\s*/, "").replace(/\s+/g, " "))
      .filter((claim) => claim.length >= 12));
  }

  function isCopy(claim, question, answer) {
    if (root?.HGQuizKnowledgeQuality?.isQuestionOrAnswerCopy) {
      return root.HGQuizKnowledgeQuality.isQuestionOrAnswerCopy(claim, { question, answer });
    }
    const candidate = normalized(claim);
    return !candidate || candidate === normalized(question) || candidate === normalized(answer) || /[?]\s*$/.test(s(claim));
  }

  function isQuestion(value) {
    return /[?]\s*$/.test(s(value));
  }

  function cleanTopic(value) {
    const topic = s(value);
    return !topic || isQuestion(topic) ? "Kunnskap" : topic;
  }

  function explicitConcepts(quizItem) {
    const item = quizItem && typeof quizItem === "object" ? quizItem : {};
    return unique([
      ...rows(item.concepts),
      ...rows(item.core_concepts),
      ...rows(item.conceptIds),
      ...rows(item.concept_ids),
      ...rows(item.begreper)
    ]);
  }

  function sameQuizEntry(entry, quizItem) {
    if (!quizItem) return false;
    const quizId = s(quizItem.quiz_id || quizItem.quizId || quizItem.id);
    return !!quizId && s(entry?.source?.quiz_id) === quizId;
  }

  function sanitizeV2Entries(entries, quizItem = null) {
    const output = [];
    const seen = new Map();
    const concepts = explicitConcepts(quizItem);

    rows(entries).forEach((entry) => {
      const question = isQuestion(entry?.topic) ? s(entry.topic) : "";
      const claims = splitClaims(entry?.text).filter((claim) => !isCopy(claim, question, entry?.answer));
      if (!claims.length) return;

      claims.forEach((claim, index) => {
        const originalId = s(entry?.source_entry_id || entry?.id || "knowledge_entry");
        const next = { ...entry };
        delete next.answer;
        next.id = claims.length === 1 ? s(entry?.id || originalId) : `${originalId}::claim::${index + 1}`;
        next.source_entry_id = originalId;
        next.topic = cleanTopic(entry?.topic);
        next.text = claim;
        next.content_quality = { version: QUALITY_VERSION, precise_claim: true };
        if (sameQuizEntry(entry, quizItem)) next.concepts = concepts;

        const key = [
          s(next.subject_id || next.fagkart_category_id),
          s(next?.source?.target_id || next?.source?.place_id || next?.source?.person_id),
          normalized(next.text)
        ].join("::");
        const previous = seen.get(key);
        if (!previous) {
          seen.set(key, next);
          output.push(next);
          return;
        }
        previous.emne_ids = unique([...(previous.emne_ids || []), ...(next.emne_ids || [])]);
        previous.concepts = unique([...(previous.concepts || []), ...(next.concepts || [])]);
      });
    });
    return output;
  }

  function sanitizeLegacyUniverse(universe) {
    const next = {};
    Object.entries(universe && typeof universe === "object" ? universe : {}).forEach(([category, dimensions]) => {
      const cleanDimensions = {};
      Object.entries(dimensions && typeof dimensions === "object" ? dimensions : {}).forEach(([dimension, items]) => {
        const cleanItems = [];
        const seen = new Set();
        rows(items).forEach((item) => {
          const question = isQuestion(item?.topic) ? s(item.topic) : "";
          const claims = splitClaims(item?.text).filter((claim) => !isCopy(claim, question, ""));
          claims.forEach((claim, index) => {
            const key = normalized(claim);
            if (!key || seen.has(key)) return;
            seen.add(key);
            const originalId = s(item?.source_entry_id || item?.id || "legacy_knowledge");
            cleanItems.push({
              ...item,
              id: claims.length === 1 ? s(item?.id || originalId) : `${originalId}::claim::${index + 1}`,
              source_entry_id: originalId,
              topic: cleanTopic(item?.topic),
              text: claim,
              content_quality: { version: QUALITY_VERSION, precise_claim: true }
            });
          });
        });
        if (cleanItems.length) cleanDimensions[dimension] = cleanItems;
      });
      if (Object.keys(cleanDimensions).length) next[category] = cleanDimensions;
    });
    return next;
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(root?.localStorage?.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function writeIfChanged(key, before, after) {
    if (!root?.localStorage) return false;
    if (JSON.stringify(before) === JSON.stringify(after)) return false;
    root.localStorage.setItem(key, JSON.stringify(after));
    return true;
  }

  function sanitizeStoredKnowledge(quizItem = null) {
    const legacyBefore = readJson(LEGACY_KEY, {});
    const v2Before = readJson(V2_KEY, []);
    const legacyAfter = sanitizeLegacyUniverse(legacyBefore);
    const v2After = sanitizeV2Entries(v2Before, quizItem);
    const changed = writeIfChanged(LEGACY_KEY, legacyBefore, legacyAfter) || writeIfChanged(V2_KEY, v2Before, v2After);
    if (changed) {
      try { root.dispatchEvent?.(new CustomEvent("hg:knowledgeTextQualityUpdated")); } catch {}
    }
    return { legacy: legacyAfter, v2: v2After, changed };
  }

  function wrapSaveKnowledgeFromQuiz() {
    const current = root?.saveKnowledgeFromQuiz;
    if (typeof current !== "function" || current.__hgPreciseKnowledgeWrapped) return false;
    const wrapped = function savePreciseKnowledgeFromQuiz(quizItem, context) {
      const result = current.call(this, quizItem, context);
      sanitizeStoredKnowledge(quizItem);
      return result;
    };
    wrapped.__hgPreciseKnowledgeWrapped = true;
    wrapped.__hgPreviousSaveKnowledgeFromQuiz = current;
    root.saveKnowledgeFromQuiz = wrapped;
    return true;
  }

  function install() {
    if (!root || root[INSTALL_FLAG]) return false;
    root[INSTALL_FLAG] = true;
    sanitizeStoredKnowledge();
    wrapSaveKnowledgeFromQuiz();
    root.addEventListener?.("hg:appReady", wrapSaveKnowledgeFromQuiz);
    return true;
  }

  const api = {
    LEGACY_KEY,
    V2_KEY,
    QUALITY_VERSION,
    sanitizeV2Entries,
    sanitizeLegacyUniverse,
    sanitizeStoredKnowledge,
    wrapSaveKnowledgeFromQuiz,
    install
  };

  install();
  return api;
});
