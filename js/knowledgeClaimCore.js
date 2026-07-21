// js/knowledgeClaimCore.js
// Canonical rules for turning quiz material into precise, self-contained knowledge claims.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.HGKnowledgeClaimCore = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const text = (value) => String(value == null ? "" : value).trim();
  const array = (value) => Array.isArray(value) ? value : [];
  const unique = (values) => Array.from(new Set(array(values).map(text).filter(Boolean)));

  function normalized(value) {
    return text(value)
      .toLocaleLowerCase("nb")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9æøå]+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function wordOverlap(a, b) {
    const aa = new Set(normalized(a).split(" ").filter((word) => word.length > 1));
    const bb = new Set(normalized(b).split(" ").filter((word) => word.length > 1));
    if (!aa.size || !bb.size) return 0;
    let common = 0;
    aa.forEach((word) => { if (bb.has(word)) common += 1; });
    return common / Math.min(aa.size, bb.size);
  }

  function splitClaims(value) {
    const raw = text(value)
      .replace(/\r\n?/g, "\n")
      .replace(/\n[•·*-]?\s*/g, ". ")
      .trim();
    if (!raw) return [];

    return unique(raw
      .split(/(?<=[.!?])\s+|;\s+(?=[A-ZÆØÅ0-9])/u)
      .map((claim) => text(claim)
        .replace(/^[•·*-]+\s*/, "")
        .replace(/^(kunnskap|forklaring|fakta?|fact)\s*:\s*/i, "")
        .replace(/\s+/g, " "))
      .filter((claim) => claim.length >= 8));
  }

  function isQuestion(value) {
    return /[?]\s*$/.test(text(value));
  }

  function isQuestionOrAnswerCopy(claim, context = {}) {
    const candidate = normalized(claim);
    const question = normalized(context.question);
    const answer = normalized(context.answer);
    if (!candidate || candidate === "ingen forklaring registrert") return true;
    if (isQuestion(claim)) return true;
    if (/^(riktig svar|svaret er|du svarte|spørsmålet er|spørsmålet viser)\b/.test(candidate)) return true;
    if ((question && candidate === question) || (answer && candidate === answer)) return true;

    const candidateWords = candidate.split(" ").filter(Boolean).length;
    const answerWords = answer.split(" ").filter(Boolean).length;
    if (question && candidateWords <= 3) return true;
    if (answer && candidateWords <= answerWords + 1 && (candidate.includes(answer) || answer.includes(candidate))) return true;

    if (question) {
      const ratio = candidate.length / Math.max(1, question.length);
      if (ratio >= 0.72 && ratio <= 1.35 && wordOverlap(candidate, question) >= 0.86) return true;
    }
    return false;
  }

  function extractTextClaims(value, context = {}) {
    return splitClaims(value).filter((claim) => !isQuestionOrAnswerCopy(claim, context));
  }

  function firstClaimSource(item) {
    const payload = item?.knowledge_payload && typeof item.knowledge_payload === "object"
      ? item.knowledge_payload
      : {};
    const candidates = [
      item?.canonical_claim,
      payload.canonical_claim,
      payload.summary,
      payload.claims,
      item?.knowledge,
      item?.explanation
    ];
    for (const candidate of candidates) {
      const values = Array.isArray(candidate) ? candidate : [candidate];
      const joined = values.map((value) => typeof value === "object" ? value?.text : value).map(text).filter(Boolean).join(" ");
      if (joined) return joined;
    }
    return "";
  }

  function extractQuizClaims(item) {
    if (!item || typeof item !== "object") return [];
    return extractTextClaims(firstClaimSource(item), {
      question: item.question || item.prompt,
      answer: item.answer || item.correct_answer || item.correctAnswer
    });
  }

  function explicitConcepts(value) {
    const row = value && typeof value === "object" ? value : {};
    return unique([
      ...array(row.concepts),
      ...array(row.core_concepts),
      ...array(row.conceptIds),
      ...array(row.concept_ids),
      ...array(row.begreper)
    ]);
  }

  function explicitTerms(value) {
    const row = value && typeof value === "object" ? value : {};
    return unique([
      ...array(row.terms),
      ...array(row.term_ids),
      ...array(row.terminology),
      ...array(row.terminologi),
      ...array(row.faguttrykk)
    ]);
  }

  function explicitTags(value) {
    return unique(array(value?.tags));
  }

  function inferKind(value) {
    const row = value && typeof value === "object" ? value : {};
    const current = normalized(row.kind);
    const type = normalized(row.question_type || row.question_family || row.dimension);
    if (/^(fact|fakta|faktum)$/.test(current) || /\b(fact|fakta|faktum)\b/.test(type)) return "fact";
    if (current && current !== "knowledge") return text(row.kind);
    if (/\b(concept|begrep|terminologi)\b/.test(type)) return "concept";
    if (/\b(method|metode)\b/.test(type)) return "method";
    if (/\b(story|historie|fortelling)\b/.test(type)) return "story";
    if (/\b(analysis|analyse|theory|teori)\b/.test(type)) return "analysis";
    if (/\b(observation|observasjon|place reading|stedslesning)\b/.test(type)) return "observation";
    return "knowledge";
  }

  function cleanTopic(value, kind = "knowledge") {
    const topic = text(value);
    if (topic && !isQuestion(topic)) return topic;
    return ({
      fact: "Fakta",
      concept: "Begrep",
      method: "Metode",
      story: "Historie",
      analysis: "Sammenheng",
      observation: "Observasjon"
    })[kind] || "Kunnskap";
  }

  return {
    text,
    array,
    unique,
    normalized,
    splitClaims,
    isQuestion,
    isQuestionOrAnswerCopy,
    extractTextClaims,
    extractQuizClaims,
    explicitConcepts,
    explicitTerms,
    explicitTags,
    inferKind,
    cleanTopic
  };
});
