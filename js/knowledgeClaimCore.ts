// Canonical Knowledge claim rules shared by quiz capture and the Knowledge read model.

export type UnknownRecord = Record<string, unknown>;

export interface ClaimContext {
  question?: unknown;
  answer?: unknown;
}

export interface KnowledgeClaimCore {
  text(value: unknown): string;
  array<T = unknown>(value: unknown): T[];
  unique(values: unknown[]): string[];
  normalized(value: unknown): string;
  splitClaims(value: unknown): string[];
  isQuestion(value: unknown): boolean;
  isQuestionOrAnswerCopy(claim: unknown, context?: ClaimContext): boolean;
  extractTextClaims(value: unknown, context?: ClaimContext): string[];
  extractQuizClaims(item: unknown): string[];
  explicitConcepts(value: unknown): string[];
  explicitTerms(value: unknown): string[];
  explicitTags(value: unknown): string[];
  inferKind(value: unknown): string;
  cleanTopic(value: unknown, kind?: string): string;
}

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function text(value: unknown): string {
  return String(value == null ? "" : value).trim();
}

function array<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function unique(values: unknown[]): string[] {
  return Array.from(new Set(values.map(text).filter(Boolean)));
}

function normalized(value: unknown): string {
  return text(value)
    .toLocaleLowerCase("nb")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9æøå]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordOverlap(a: unknown, b: unknown): number {
  const aa = new Set(normalized(a).split(" ").filter((word) => word.length > 1));
  const bb = new Set(normalized(b).split(" ").filter((word) => word.length > 1));
  if (!aa.size || !bb.size) return 0;
  let common = 0;
  aa.forEach((word) => { if (bb.has(word)) common += 1; });
  return common / Math.min(aa.size, bb.size);
}

function splitClaims(value: unknown): string[] {
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

function isQuestion(value: unknown): boolean {
  return /[?]\s*$/.test(text(value));
}

function isQuestionOrAnswerCopy(claim: unknown, context: ClaimContext = {}): boolean {
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

function extractTextClaims(value: unknown, context: ClaimContext = {}): string[] {
  return splitClaims(value).filter((claim) => !isQuestionOrAnswerCopy(claim, context));
}

function claimSourceValues(item: UnknownRecord): unknown[] {
  const payload = record(item.knowledge_payload);
  return [
    item.canonical_claim,
    payload.canonical_claim,
    payload.summary,
    payload.claims,
    item.knowledge,
    item.explanation
  ];
}

function sourceText(value: unknown): string {
  const values = Array.isArray(value) ? value : [value];
  return values
    .map((item) => typeof item === "object" && item !== null ? record(item).text : item)
    .map(text)
    .filter(Boolean)
    .join(" ");
}

function extractQuizClaims(value: unknown): string[] {
  const item = record(value);
  for (const candidate of claimSourceValues(item)) {
    const raw = sourceText(candidate);
    if (!raw) continue;
    return extractTextClaims(raw, {
      question: item.question || item.prompt,
      answer: item.answer || item.correct_answer || item.correctAnswer
    });
  }
  return [];
}

function explicitConcepts(value: unknown): string[] {
  const row = record(value);
  return unique([
    ...array(row.concepts),
    ...array(row.core_concepts),
    ...array(row.conceptIds),
    ...array(row.concept_ids),
    ...array(row.begreper)
  ]);
}

function explicitTerms(value: unknown): string[] {
  const row = record(value);
  return unique([
    ...array(row.terms),
    ...array(row.term_ids),
    ...array(row.terminology),
    ...array(row.terminologi),
    ...array(row.faguttrykk)
  ]);
}

function explicitTags(value: unknown): string[] {
  return unique(array(record(value).tags));
}

function inferKind(value: unknown): string {
  const row = record(value);
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

function cleanTopic(value: unknown, kind = "knowledge"): string {
  const topic = text(value);
  if (topic && !isQuestion(topic)) return topic;
  return ({
    fact: "Fakta",
    concept: "Begrep",
    method: "Metode",
    story: "Historie",
    analysis: "Sammenheng",
    observation: "Observasjon"
  } as Record<string, string>)[kind] || "Kunnskap";
}

const claimCore: KnowledgeClaimCore = {
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

export default claimCore;
