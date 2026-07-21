// js/quizKnowledgeQuality.js
// Kvalitetsport for quizminnet: bevarer eksisterende modell, men fjerner
// spørsmåls-/svarkopier og deler lange forklaringer i små kunnskapspåstander.
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HGQuizKnowledgeQuality = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const STORAGE_KEY = "hg_knowledge_memory_v1";
  const QUALITY_VERSION = 1;
  const INSTALL_FLAG = "__HG_QUIZ_KNOWLEDGE_QUALITY_INSTALLED__";

  function s(value) {
    return String(value == null ? "" : value).trim();
  }

  function rows(value) {
    return Array.isArray(value) ? value : [];
  }

  function unique(values) {
    return Array.from(new Set(rows(values).map(s).filter(Boolean)));
  }

  function normalize(value) {
    return s(value)
      .toLocaleLowerCase("nb")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9æøå]+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function wordSet(value) {
    return new Set(normalize(value).split(" ").filter((word) => word.length > 1));
  }

  function overlap(a, b) {
    const aa = wordSet(a);
    const bb = wordSet(b);
    if (!aa.size || !bb.size) return 0;
    let common = 0;
    aa.forEach((word) => { if (bb.has(word)) common += 1; });
    return common / Math.min(aa.size, bb.size);
  }

  function cleanClaim(value) {
    return s(value)
      .replace(/^[•·*-]+\s*/, "")
      .replace(/^(kunnskap|forklaring|fakta?|fact)\s*:\s*/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function splitClaims(value) {
    const raw = s(value)
      .replace(/\r\n?/g, "\n")
      .replace(/\n[•·*-]?\s*/g, ". ")
      .trim();
    if (!raw) return [];

    return unique(
      raw
        .split(/(?<=[.!?])\s+|;\s+(?=[A-ZÆØÅ0-9])/u)
        .map(cleanClaim)
        .filter((claim) => claim.length >= 12)
    );
  }

  function isQuestionOrAnswerCopy(claim, unit = {}) {
    const candidate = normalize(claim);
    const question = normalize(unit.question);
    const answer = normalize(unit.answer);
    if (!candidate) return true;
    if (/[?]\s*$/.test(s(claim))) return true;
    if (/^(riktig svar|svaret er|du svarte|spørsmålet er|spørsmålet viser)\b/.test(candidate)) return true;
    if (question && candidate === question) return true;
    if (answer && candidate === answer) return true;

    const candidateWords = candidate.split(" ").filter(Boolean).length;
    const answerWords = answer.split(" ").filter(Boolean).length;
    if (answer && candidateWords <= Math.max(5, answerWords + 2) && (candidate.includes(answer) || answer.includes(candidate))) {
      return true;
    }

    if (question) {
      const lengthRatio = candidate.length / Math.max(1, question.length);
      if (lengthRatio >= 0.72 && lengthRatio <= 1.35 && overlap(candidate, question) >= 0.86) return true;
    }
    return false;
  }

  function kindFor(unit) {
    const current = normalize(unit?.kind);
    const type = normalize(unit?.question_type || unit?.question_family || unit?.dimension);
    if (/^(fact|fakta|faktum)$/.test(current) || /\b(fact|fakta|faktum)\b/.test(type)) return "fact";
    if (current && current !== "knowledge") return s(unit.kind);
    if (/\b(concept|begrep|terminologi)\b/.test(type)) return "concept";
    if (/\b(method|metode)\b/.test(type)) return "method";
    if (/\b(story|historie|fortelling)\b/.test(type)) return "story";
    if (/\b(analysis|analyse|theory|teori)\b/.test(type)) return "analysis";
    return "knowledge";
  }

  function topicFor(unit, kind) {
    const topic = s(unit?.topic);
    if (topic && normalize(topic) !== normalize(unit?.question)) return topic;
    const labels = {
      fact: "Fakta",
      concept: "Begrep",
      method: "Metode",
      story: "Historie",
      analysis: "Sammenheng",
      observation: "Observasjon",
      knowledge: "Kunnskap"
    };
    return labels[kind] || "Kunnskap";
  }

  function mergeAssessment(a, b) {
    const mastered = a?.state === "mastered" || b?.state === "mastered" || a?.correct === true || b?.correct === true;
    return {
      ...(a || {}),
      ...(b || {}),
      correct: mastered,
      state: mastered ? "mastered" : (a?.state || b?.state || "needs_review")
    };
  }

  function splitUnit(unit) {
    const claims = splitClaims(unit?.text).filter((claim) => !isQuestionOrAnswerCopy(claim, unit));
    if (!claims.length) return [];

    const kind = kindFor(unit);
    const baseId = s(unit?.unit_id || unit?.id || "knowledge_unit");
    return claims.map((claim, index) => {
      const next = { ...unit };
      delete next.question;
      delete next.answer;
      delete next.trivia;
      next.unit_id = claims.length === 1 ? baseId : `${baseId}::claim::${index + 1}`;
      next.source_question_id = baseId;
      next.kind = kind;
      next.topic = topicFor(unit, kind);
      next.text = claim;
      next.quality = {
        version: QUALITY_VERSION,
        source: "quiz_knowledge_filter",
        split_from_question: claims.length > 1
      };
      return next;
    });
  }

  function dedupeUnits(units) {
    const byClaim = new Map();
    rows(units).forEach((unit) => {
      const key = normalize(unit?.text);
      if (!key) return;
      const previous = byClaim.get(key);
      if (!previous) {
        byClaim.set(key, unit);
        return;
      }
      previous.emne_ids = unique([...(previous.emne_ids || []), ...(unit.emne_ids || [])]);
      previous.concepts = unique([...(previous.concepts || []), ...(unit.concepts || [])]);
      previous.concept_focus = unique([...(previous.concept_focus || []), ...(unit.concept_focus || [])]);
      previous.terms = unique([...(previous.terms || []), ...(unit.terms || [])]);
      previous.tags = unique([...(previous.tags || []), ...(unit.tags || [])]);
      previous.sources = rows(previous.sources).concat(rows(unit.sources));
      previous.assessment = mergeAssessment(previous.assessment, unit.assessment);
    });
    return Array.from(byClaim.values());
  }

  function sanitizeNamedRows(items, kind, blockedClaims = new Set()) {
    const out = [];
    rows(items).forEach((item, itemIndex) => {
      splitClaims(item?.text || item).forEach((claim, claimIndex) => {
        const key = normalize(claim);
        if (!key || blockedClaims.has(key)) return;
        blockedClaims.add(key);
        const raw = item && typeof item === "object" ? item : {};
        out.push({
          ...raw,
          id: s(raw.id) || `${kind}_${itemIndex + 1}_${claimIndex + 1}`,
          kind,
          text: claim
        });
      });
    });
    return out;
  }

  function rebuildBundleIndexes(bundle) {
    const units = rows(bundle?.knowledge_units);
    const existing = bundle?.indexes || {};
    bundle.indexes = {
      ...existing,
      emne_ids: unique(units.flatMap((unit) => rows(unit?.emne_ids))),
      concepts: unique(units.flatMap((unit) => rows(unit?.concepts))),
      concept_focus: unique(units.flatMap((unit) => rows(unit?.concept_focus))),
      terms: unique(units.flatMap((unit) => rows(unit?.terms))),
      people: unique(units.flatMap((unit) => rows(unit?.people))),
      events: unique(units.flatMap((unit) => rows(unit?.events))),
      methods: unique(units.flatMap((unit) => rows(unit?.methods))),
      stories: unique(units.flatMap((unit) => rows(unit?.stories)))
    };
    return bundle;
  }

  function sanitizeBundle(bundle) {
    if (!bundle || typeof bundle !== "object") return bundle;
    const beforeUnits = rows(bundle.knowledge_units);
    const splitUnits = beforeUnits.flatMap(splitUnit);
    const knowledgeUnits = dedupeUnits(splitUnits);
    const blockedClaims = new Set(knowledgeUnits.map((unit) => normalize(unit.text)));
    const funFacts = sanitizeNamedRows(bundle.fun_facts, "fun_fact", blockedClaims);

    const next = {
      ...bundle,
      knowledge_units: knowledgeUnits,
      fun_facts: funFacts,
      content_quality: {
        version: QUALITY_VERSION,
        original_unit_count: beforeUnits.length,
        precise_unit_count: knowledgeUnits.length,
        removed_or_merged_count: Math.max(0, beforeUnits.length - knowledgeUnits.length),
        automatic_storage: true
      }
    };
    return rebuildBundleIndexes(next);
  }

  function emptyIndexes() {
    return {
      by_subject: {},
      by_target: {},
      by_emne: {},
      by_concept: {},
      mastered: [],
      needs_review: []
    };
  }

  function addIndex(index, key, bundleId) {
    const id = s(key);
    if (!id) return;
    if (!Array.isArray(index[id])) index[id] = [];
    if (!index[id].includes(bundleId)) index[id].push(bundleId);
  }

  function rebuildMemoryIndexes(memory) {
    const indexes = emptyIndexes();
    Object.values(memory?.bundles || {}).forEach((bundle) => {
      const bundleId = s(bundle?.bundle_id);
      addIndex(indexes.by_subject, bundle?.subject_id, bundleId);
      addIndex(indexes.by_target, bundle?.target_id, bundleId);
      rows(bundle?.indexes?.emne_ids).forEach((id) => addIndex(indexes.by_emne, id, bundleId));
      rows(bundle?.indexes?.concepts).forEach((id) => addIndex(indexes.by_concept, id, bundleId));
      rows(bundle?.knowledge_units).forEach((unit) => {
        const row = { bundle_id: bundleId, unit_id: unit.unit_id, target_id: bundle.target_id, subject_id: bundle.subject_id };
        if (unit?.assessment?.state === "mastered") indexes.mastered.push(row);
        if (unit?.assessment?.state === "needs_review") indexes.needs_review.push(row);
      });
    });
    memory.indexes = indexes;
    return memory;
  }

  function sanitizeMemory(memory) {
    const next = {
      ...(memory || {}),
      bundles: {}
    };
    Object.entries(memory?.bundles || {}).forEach(([bundleId, bundle]) => {
      next.bundles[bundleId] = sanitizeBundle(bundle);
    });
    return rebuildMemoryIndexes(next);
  }

  function sanitizeStoredMemory() {
    if (!root?.localStorage) return null;
    let current;
    try {
      current = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      return null;
    }
    if (!current?.bundles) return current;
    const next = sanitizeMemory(current);
    if (JSON.stringify(next) !== JSON.stringify(current)) {
      root.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      try {
        root.dispatchEvent?.(new CustomEvent("hg:knowledgeMemoryQualityUpdated", {
          detail: { storage_key: STORAGE_KEY }
        }));
      } catch {}
    }
    return next;
  }

  function cleanKnowledgeUi() {
    const document = root?.document;
    if (!document) return;

    const summaryButton = document.getElementById("quizSummaryKnowledge");
    if (summaryButton) summaryButton.textContent = "Se kunnskapen som ble lagret";

    const summaryLine = document.getElementById("quizSummaryKnowledgeLine");
    if (summaryLine) summaryLine.textContent = "Kunnskapen ble automatisk filtrert og lagt i Knowledge-minnekammeret.";

    const readButton = document.getElementById("quizKnowledgeMemoryRead");
    if (readButton) readButton.parentElement?.remove();
  }

  function install() {
    if (!root || root[INSTALL_FLAG]) return false;
    root[INSTALL_FLAG] = true;

    const memoryApi = root.HGQuizKnowledgeMemory;
    if (memoryApi?.buildQuizKnowledgeBundle && !memoryApi.__qualityWrapped) {
      const originalBuild = memoryApi.buildQuizKnowledgeBundle.bind(memoryApi);
      memoryApi.buildQuizKnowledgeBundle = function buildPreciseQuizKnowledgeBundle(input) {
        return sanitizeBundle(originalBuild(input));
      };
      root.buildQuizKnowledgeBundle = memoryApi.buildQuizKnowledgeBundle;
      memoryApi.__qualityWrapped = true;
    }

    sanitizeStoredMemory();
    root.addEventListener?.("hg:knowledgeMemoryUpdated", sanitizeStoredMemory);

    if (root.document && typeof MutationObserver !== "undefined") {
      const observer = new MutationObserver(cleanKnowledgeUi);
      observer.observe(root.document.documentElement, { childList: true, subtree: true });
      cleanKnowledgeUi();
    }
    return true;
  }

  const api = {
    STORAGE_KEY,
    QUALITY_VERSION,
    splitClaims,
    isQuestionOrAnswerCopy,
    splitUnit,
    sanitizeBundle,
    sanitizeMemory,
    sanitizeStoredMemory,
    cleanKnowledgeUi,
    install
  };

  install();
  return api;
});
