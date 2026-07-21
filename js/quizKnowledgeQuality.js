// js/quizKnowledgeQuality.js
// Renser quizminnet uten å opprette nye parallelle kunnskapslag.
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HGQuizKnowledgeQuality = api;
})(typeof window !== "undefined" ? window : globalThis, function (root) {
  "use strict";

  const STORAGE_KEY = "hg_knowledge_memory_v1";
  const QUALITY_VERSION = 1;
  const INSTALL_FLAG = "__HG_QUIZ_KNOWLEDGE_QUALITY_INSTALLED__";

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

  function overlap(a, b) {
    const aa = new Set(normalized(a).split(" ").filter((word) => word.length > 1));
    const bb = new Set(normalized(b).split(" ").filter((word) => word.length > 1));
    if (!aa.size || !bb.size) return 0;
    let common = 0;
    aa.forEach((word) => { if (bb.has(word)) common += 1; });
    return common / Math.min(aa.size, bb.size);
  }

  function splitClaims(value) {
    const raw = s(value)
      .replace(/\r\n?/g, "\n")
      .replace(/\n[•·*-]?\s*/g, ". ")
      .trim();
    if (!raw) return [];

    return unique(raw
      .split(/(?<=[.!?])\s+|;\s+(?=[A-ZÆØÅ0-9])/u)
      .map((claim) => s(claim)
        .replace(/^[•·*-]+\s*/, "")
        .replace(/^(kunnskap|forklaring|fakta?|fact)\s*:\s*/i, "")
        .replace(/\s+/g, " "))
      .filter((claim) => claim.length >= 12));
  }

  function isQuestionOrAnswerCopy(claim, unit = {}) {
    const candidate = normalized(claim);
    const question = normalized(unit.question);
    const answer = normalized(unit.answer);
    if (!candidate || /[?]\s*$/.test(s(claim))) return true;
    if (/^(riktig svar|svaret er|du svarte|spørsmålet er|spørsmålet viser)\b/.test(candidate)) return true;
    if ((question && candidate === question) || (answer && candidate === answer)) return true;

    const candidateWords = candidate.split(" ").filter(Boolean).length;
    const answerWords = answer.split(" ").filter(Boolean).length;
    if (answer && candidateWords <= answerWords + 1 && (candidate.includes(answer) || answer.includes(candidate))) return true;

    if (question) {
      const ratio = candidate.length / Math.max(1, question.length);
      if (ratio >= 0.72 && ratio <= 1.35 && overlap(candidate, question) >= 0.86) return true;
    }
    return false;
  }

  function unitKind(unit) {
    const current = normalized(unit?.kind);
    const type = normalized(unit?.question_type || unit?.question_family || unit?.dimension);
    if (/^(fact|fakta|faktum)$/.test(current) || /\b(fact|fakta|faktum)\b/.test(type)) return "fact";
    if (current && current !== "knowledge") return s(unit.kind);
    if (/\b(concept|begrep|terminologi)\b/.test(type)) return "concept";
    if (/\b(method|metode)\b/.test(type)) return "method";
    if (/\b(story|historie|fortelling)\b/.test(type)) return "story";
    if (/\b(analysis|analyse|theory|teori)\b/.test(type)) return "analysis";
    return "knowledge";
  }

  function unitTopic(unit, kind) {
    const topic = s(unit?.topic);
    if (topic && normalized(topic) !== normalized(unit?.question)) return topic;
    return ({ fact: "Fakta", concept: "Begrep", method: "Metode", story: "Historie", analysis: "Sammenheng" })[kind] || "Kunnskap";
  }

  function splitUnit(unit) {
    const claims = splitClaims(unit?.text).filter((claim) => !isQuestionOrAnswerCopy(claim, unit));
    if (!claims.length) return [];
    const kind = unitKind(unit);
    const sourceId = s(unit?.unit_id || unit?.id || "knowledge_unit");

    return claims.map((claim, index) => {
      const next = { ...unit };
      delete next.question;
      delete next.answer;
      delete next.trivia;
      next.unit_id = claims.length === 1 ? sourceId : `${sourceId}::claim::${index + 1}`;
      next.source_question_id = sourceId;
      next.kind = kind;
      next.topic = unitTopic(unit, kind);
      next.text = claim;
      next.quality = { version: QUALITY_VERSION, source: "quiz_knowledge_filter", split_from_question: claims.length > 1 };
      return next;
    });
  }

  function mergeAssessment(a, b) {
    const mastered = a?.state === "mastered" || b?.state === "mastered" || a?.correct === true || b?.correct === true;
    return { ...(a || {}), ...(b || {}), correct: mastered, state: mastered ? "mastered" : (a?.state || b?.state || "needs_review") };
  }

  function dedupeUnits(units) {
    const map = new Map();
    rows(units).forEach((unit) => {
      const key = normalized(unit?.text);
      if (!key) return;
      const previous = map.get(key);
      if (!previous) return map.set(key, unit);
      for (const field of ["emne_ids", "concepts", "concept_focus", "terms", "tags"]) {
        previous[field] = unique([...(previous[field] || []), ...(unit[field] || [])]);
      }
      previous.sources = rows(previous.sources).concat(rows(unit.sources));
      previous.assessment = mergeAssessment(previous.assessment, unit.assessment);
    });
    return Array.from(map.values());
  }

  function sanitizeFunFacts(items, blocked) {
    const output = [];
    rows(items).forEach((item, itemIndex) => {
      splitClaims(item?.text || item).forEach((claim, claimIndex) => {
        const key = normalized(claim);
        if (!key || blocked.has(key)) return;
        blocked.add(key);
        const raw = item && typeof item === "object" ? item : {};
        output.push({ ...raw, id: s(raw.id) || `fun_fact_${itemIndex + 1}_${claimIndex + 1}`, kind: "fun_fact", text: claim });
      });
    });
    return output;
  }

  function rebuildBundleIndexes(bundle) {
    const units = rows(bundle?.knowledge_units);
    bundle.indexes = {
      ...(bundle.indexes || {}),
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
    const original = rows(bundle.knowledge_units);
    const knowledgeUnits = dedupeUnits(original.flatMap(splitUnit));
    const blocked = new Set(knowledgeUnits.map((unit) => normalized(unit.text)));
    const next = {
      ...bundle,
      knowledge_units: knowledgeUnits,
      fun_facts: sanitizeFunFacts(bundle.fun_facts, blocked),
      content_quality: {
        version: QUALITY_VERSION,
        original_unit_count: original.length,
        precise_unit_count: knowledgeUnits.length,
        removed_or_merged_count: Math.max(0, original.length - knowledgeUnits.length),
        automatic_storage: true
      }
    };
    return rebuildBundleIndexes(next);
  }

  function addIndex(index, key, bundleId) {
    const id = s(key);
    if (!id) return;
    if (!Array.isArray(index[id])) index[id] = [];
    if (!index[id].includes(bundleId)) index[id].push(bundleId);
  }

  function rebuildMemoryIndexes(memory) {
    const indexes = { by_subject: {}, by_target: {}, by_emne: {}, by_concept: {}, mastered: [], needs_review: [] };
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
    const next = { ...(memory || {}), bundles: {} };
    Object.entries(memory?.bundles || {}).forEach(([id, bundle]) => { next.bundles[id] = sanitizeBundle(bundle); });
    return rebuildMemoryIndexes(next);
  }

  function sanitizeStoredMemory() {
    if (!root?.localStorage) return null;
    let current;
    try { current = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
    if (!current?.bundles) return current;
    const next = sanitizeMemory(current);
    if (JSON.stringify(next) !== JSON.stringify(current)) root.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  function cleanKnowledgeUi() {
    const document = root?.document;
    if (!document) return;
    const button = document.getElementById("quizSummaryKnowledge");
    if (button && button.textContent !== "Se kunnskapen som ble lagret") button.textContent = "Se kunnskapen som ble lagret";
    const line = document.getElementById("quizSummaryKnowledgeLine");
    const lineText = "Kunnskapen ble automatisk filtrert og lagt i Knowledge-minnekammeret.";
    if (line && line.textContent !== lineText) line.textContent = lineText;
    document.getElementById("quizKnowledgeMemoryRead")?.parentElement?.remove();
  }

  function scheduleUiCleanup() {
    cleanKnowledgeUi();
    if (typeof root?.setTimeout === "function") {
      root.setTimeout(cleanKnowledgeUi, 0);
      root.setTimeout(cleanKnowledgeUi, 100);
    }
  }

  function install() {
    if (!root || root[INSTALL_FLAG]) return false;
    root[INSTALL_FLAG] = true;
    const memoryApi = root.HGQuizKnowledgeMemory;
    if (memoryApi?.buildQuizKnowledgeBundle && !memoryApi.__qualityWrapped) {
      const originalBuild = memoryApi.buildQuizKnowledgeBundle.bind(memoryApi);
      memoryApi.buildQuizKnowledgeBundle = (input) => sanitizeBundle(originalBuild(input));
      root.buildQuizKnowledgeBundle = memoryApi.buildQuizKnowledgeBundle;
      memoryApi.__qualityWrapped = true;
    }
    sanitizeStoredMemory();
    root.addEventListener?.("hg:knowledgeMemoryUpdated", () => {
      sanitizeStoredMemory();
      scheduleUiCleanup();
    });
    root.document?.addEventListener?.("click", (event) => {
      if (event.target?.closest?.("#quizSummaryKnowledge")) scheduleUiCleanup();
    });
    scheduleUiCleanup();
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
