// Canonical TypeScript capture/read model for the user's personal Knowledge universe.
// Quiz memory is the evidence store. These entries are the durable, queryable read model.

import claimCore from "./knowledgeClaimCore";
import { createQuizKnowledgeMemory } from "./knowledgeQuizMemory";

const root = globalThis as typeof globalThis & Record<string, any>;

const ENTRY_KEY = "hg_knowledge_entries_v2";
const LEGACY_KEY = "knowledge_universe";
const LEGACY_MIGRATION_KEY = "hg_knowledge_legacy_migrated_v1";
const LEARNING_LOG_KEY = "hg_learning_log_v1";
const SCHEMA = "history_go_knowledge_entry_v2";
const VERSION = 2;
const QUALITY_VERSION = 2;

type JsonObject = Record<string, any>;

interface KnowledgeSource {
  type: string;
  quiz_id: string | null;
  target_id: string | null;
  place_id: string | null;
  person_id: string | null;
  source_file?: string | null;
  unit_id?: string | null;
}

interface KnowledgeEntry extends JsonObject {
  id: string;
  knowledge_unit_id: string;
  concept_ids: string[];
  term_ids: string[];
  story_ids: string[];
  schema?: string;
  version?: number;
  subject_id: string;
  fagkart_category_id: string;
  emne_ids: string[];
  concepts: string[];
  terms: string[];
  tags: string[];
  dimension: string;
  topic: string;
  text: string;
  source: KnowledgeSource;
  learned_at?: string;
  last_seen_at?: string;
  times_seen?: number;
  link_status: string;
}

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

function s(value: unknown): string {
  return claimCore.text(value);
}

function toArray<T = any>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function toObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
}

function unique(values: unknown[]): string[] {
  return claimCore.unique(values);
}

function readJson<T>(key: string, fallback: T): T {
  try {
    if (!root.localStorage) return fallback;
    const raw = root.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): boolean {
  try {
    if (!root.localStorage) return false;
    root.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function slug(value: unknown): string {
  return s(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

function stableHash(value: unknown): string {
  let hash = 2166136261;
  const source = s(value);
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, "0");
}

function generatedCanonicalId(prefix: "ku" | "co" | "term" | "story", subjectId: unknown, value: unknown): string {
  const subject = slug(subjectId) || "unknown";
  const label = slug(value).slice(0, prefix === "ku" ? 24 : 36) || "item";
  return `${prefix}_${subject}_${label}_${stableHash(`${subject}::${s(value).toLowerCase()}`)}`;
}

function explicitIdList(value: unknown, ...keys: string[]): string[] {
  const row = toObject(value);
  return unique(keys.flatMap((key) => toArray(row[key])));
}

function canonicalIdsForLabels(
  prefix: "co" | "term" | "story",
  subjectId: string,
  labels: string[],
  explicitIds: string[]
): string[] {
  const used = new Set<string>();
  const aligned = labels.map((label, index) => {
    const explicitId = explicitIds[index];
    const generatedId = generatedCanonicalId(prefix, subjectId, label);
    const id = explicitId && !used.has(explicitId) ? explicitId : generatedId;
    used.add(id);
    return id;
  });
  const extras = explicitIds.slice(labels.length).filter((id) => {
    if (!id || used.has(id)) return false;
    used.add(id);
    return true;
  });
  return [...aligned, ...extras];
}

function normalizeSubjectId(value: unknown): string {
  const raw = s(value);
  if (!raw) return "";
  try {
    if (root.DomainRegistry?.toRuntimeCategoryId) return s(root.DomainRegistry.toRuntimeCategoryId(raw));
    if (root.DomainRegistry?.resolve) return s(root.DomainRegistry.resolve(raw));
  } catch {}
  return raw === "popkultur" ? "populaerkultur" : raw;
}

function normalizeEmneIds(value: unknown): string[] {
  const row = toObject(value);
  return unique([
    row.emne_id,
    ...toArray(row.emne_ids),
    ...toArray(row.related_emner),
    ...toArray(row.related_emners),
    ...toArray(row.relatedEmner),
    ...toArray(row.relatedEmneIds)
  ]);
}

function normalizeConcepts(value: unknown): string[] {
  return claimCore.explicitConcepts(value);
}

function normalizeTerms(value: unknown): string[] {
  return claimCore.explicitTerms(value);
}

function normalizeTags(value: unknown): string[] {
  return claimCore.explicitTags(value);
}

function normalizeTargetIds(event: unknown): string[] {
  const row = toObject(event);
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

function getEntries(): KnowledgeEntry[] {
  const rows = readJson<unknown>(ENTRY_KEY, []);
  return Array.isArray(rows) ? rows as KnowledgeEntry[] : [];
}

function saveEntries(entries: KnowledgeEntry[]): boolean {
  return writeJson(ENTRY_KEY, Array.isArray(entries) ? entries : []);
}

function inferTargetKind(targetId: unknown): { place_id: string | null; person_id: string | null } {
  const id = s(targetId);
  if (!id) return { place_id: null, person_id: null };
  if (toArray(root.PLACES).some((place) => s(place?.id) === id)) return { place_id: id, person_id: null };
  if (toArray(root.PEOPLE).some((person) => s(person?.id) === id)) return { place_id: null, person_id: id };
  return { place_id: null, person_id: null };
}

function mergeEntry(previous: KnowledgeEntry, incoming: KnowledgeEntry, now: string, incrementSeen = true): KnowledgeEntry {
  return {
    ...previous,
    ...incoming,
    learned_at: previous.learned_at || incoming.learned_at || now,
    last_seen_at: incrementSeen ? now : (incoming.last_seen_at || previous.last_seen_at || now),
    times_seen: incrementSeen
      ? Number(previous.times_seen || 1) + 1
      : Math.max(Number(previous.times_seen || 1), Number(incoming.times_seen || 1)),
    knowledge_unit_id: previous.knowledge_unit_id || incoming.knowledge_unit_id || incoming.id,
    emne_ids: unique([...(previous.emne_ids || []), ...(incoming.emne_ids || [])]),
    concept_ids: unique([...(previous.concept_ids || []), ...(incoming.concept_ids || [])]),
    term_ids: unique([...(previous.term_ids || []), ...(incoming.term_ids || [])]),
    story_ids: unique([...(previous.story_ids || []), ...(incoming.story_ids || [])]),
    concepts: unique([...(previous.concepts || []), ...(incoming.concepts || [])]),
    terms: unique([...(previous.terms || []), ...(incoming.terms || [])]),
    tags: unique([...(previous.tags || []), ...(incoming.tags || [])]),
    memory_evidence: { ...(previous.memory_evidence || {}), ...(incoming.memory_evidence || {}) }
  };
}

function upsertEntry(entry: KnowledgeEntry, options: { incrementSeen?: boolean } = {}): KnowledgeEntry | null {
  if (!entry?.id || !entry?.text) return null;
  const rows = getEntries();
  const identity = entryIdentity(entry);
  const index = rows.findIndex((row) => s(row?.id) === s(entry.id) || (!!identity && entryIdentity(row) === identity));
  const now = new Date().toISOString();
  const incrementSeen = options.incrementSeen !== false;

  if (index >= 0) {
    rows[index] = mergeEntry(rows[index], entry, now, incrementSeen);
    saveEntries(rows);
    return rows[index];
  }

  const next: KnowledgeEntry = {
    schema: SCHEMA,
    version: VERSION,
    learned_at: entry.learned_at || now,
    last_seen_at: entry.last_seen_at || now,
    times_seen: Number(entry.times_seen || 1),
    ...entry
  };
  rows.push(next);
  saveEntries(rows);
  return next;
}

function sourceForQuiz(quizItem: JsonObject, context: JsonObject, sourceQuizId: string, targetId: string): KnowledgeSource {
  const targetKind = inferTargetKind(targetId);
  return {
    type: "quiz",
    quiz_id: sourceQuizId || null,
    target_id: targetId || null,
    place_id: s(quizItem.placeId || context.placeId || targetKind.place_id) || null,
    person_id: s(quizItem.personId || context.personId || targetKind.person_id) || null,
    source_file: s(quizItem.source_file || context.sourceFile) || null
  };
}

function captureQuizKnowledgeClaims(quizValue: unknown, contextValue: unknown = {}): KnowledgeEntry[] {
  const quizItem = toObject(quizValue);
  const context = toObject(contextValue);
  if (!Object.keys(quizItem).length) return [];

  const subjectId = normalizeSubjectId(
    quizItem.fagkart_category_id || quizItem.subject_id || quizItem.categoryId ||
    quizItem.category || context.categoryId || context.subjectId
  );
  if (!subjectId) return [];

  const claims = claimCore.extractQuizClaims(quizItem);
  if (!claims.length) return [];

  const sourceQuizId = s(quizItem.quiz_id || quizItem.quizId || quizItem.id || context.id);
  const targetId = s(
    quizItem.targetId || quizItem.placeId || quizItem.personId ||
    context.targetId || context.placeId || context.personId
  );
  const emneIds = normalizeEmneIds(quizItem);
  const concepts = normalizeConcepts(quizItem);
  const terms = normalizeTerms(quizItem);
  const tags = normalizeTags(quizItem);
  const explicitKnowledgeIds = unique([quizItem.primary_knowledge_unit_id, quizItem.knowledge_unit_id, quizItem.knowledge_unit_ids]);
  const knowledgeUnitIds = claims.map((claim, index) => explicitKnowledgeIds[index] || generatedCanonicalId("ku", subjectId, claim));
  const explicitConceptIds = explicitIdList(quizItem, "concept_ids", "conceptIds");
  const conceptIds = canonicalIdsForLabels("co", subjectId, concepts, explicitConceptIds);
  const explicitTermIds = explicitIdList(quizItem, "term_ids", "termIds");
  const termIds = canonicalIdsForLabels("term", subjectId, terms, explicitTermIds);
  const explicitStoryIds = explicitIdList(quizItem, "story_ids", "storyIds");
  const storyLabels = unique([quizItem.stories, quizItem.related_stories]);
  const storyIds = canonicalIdsForLabels("story", subjectId, storyLabels, explicitStoryIds);
  const kind = claimCore.inferKind(quizItem);
  const topic = claimCore.cleanTopic(quizItem.topic || context.topic, kind);
  const source = sourceForQuiz(quizItem, context, sourceQuizId, targetId);

  return claims.map((claim, index) => upsertEntry({
    id: knowledgeUnitIds[index],
    knowledge_unit_id: knowledgeUnitIds[index],
    subject_id: subjectId,
    fagkart_category_id: subjectId,
    emne_ids: emneIds,
    concept_ids: conceptIds,
    term_ids: termIds,
    story_ids: storyIds,
    concepts,
    terms,
    tags,
    kind,
    dimension: s(quizItem.dimension || context.dimension || "generelt") || "generelt",
    topic,
    text: claim,
    source,
    content_quality: {
      version: QUALITY_VERSION,
      precise_claim: true,
      canonical_capture: true
    },
    link_status: emneIds.length ? "linked" : "pending_emne_link"
  })).filter(Boolean) as KnowledgeEntry[];
}

function captureQuizKnowledge(quizItem: unknown, context: unknown = {}): KnowledgeEntry | null {
  return captureQuizKnowledgeClaims(quizItem, context)[0] || null;
}

function findLegacyTargetId(itemId: unknown, learningLog: unknown[]): string {
  const id = s(itemId);
  if (!id) return "";
  const candidates = unique(learningLog.flatMap((event) => normalizeTargetIds(event))).sort((a, b) => b.length - a.length);
  for (const targetId of candidates) {
    if (id === `quiz_${targetId}` || id.startsWith(`quiz_${targetId}_`)) return targetId;
  }
  return "";
}

function cleanStoredEntry(entryValue: unknown): KnowledgeEntry[] {
  const entry = toObject(entryValue) as KnowledgeEntry;
  const question = claimCore.isQuestion(entry.topic) ? s(entry.topic) : "";
  const claims = claimCore.extractTextClaims(entry.text, { question, answer: entry.answer });
  const tags = normalizeTags(entry);
  const concepts = normalizeConcepts(entry).filter((concept) => !tags.includes(concept));
  const subjectId = normalizeSubjectId(entry.subject_id || entry.fagkart_category_id);
  const explicitKnowledgeIds = unique([entry.knowledge_unit_id, entry.knowledge_unit_ids]);
  const explicitConceptIds = explicitIdList(entry, "concept_ids", "conceptIds");
  const explicitTermIds = explicitIdList(entry, "term_ids", "termIds");
  const explicitStoryIds = explicitIdList(entry, "story_ids", "storyIds");
  return claims.map((claim, index) => {
    const sourceId = s(entry.source_entry_id || entry.id || "knowledge_entry");
    const knowledgeUnitId = explicitKnowledgeIds[index] || generatedCanonicalId("ku", subjectId, claim);
    const next = {
      ...entry,
      id: knowledgeUnitId,
      knowledge_unit_id: knowledgeUnitId,
      source_entry_id: sourceId,
      topic: claimCore.cleanTopic(entry.topic, entry.kind),
      text: claim,
      concept_ids: canonicalIdsForLabels("co", subjectId, concepts, explicitConceptIds),
      term_ids: canonicalIdsForLabels("term", subjectId, normalizeTerms(entry), explicitTermIds),
      story_ids: canonicalIdsForLabels("story", subjectId, unique([entry.stories, entry.related_stories]), explicitStoryIds),
      concepts,
      terms: normalizeTerms(entry),
      tags,
      content_quality: {
        ...(entry.content_quality || {}),
        version: QUALITY_VERSION,
        precise_claim: true,
        canonical_ids: true
      }
    } as KnowledgeEntry;
    delete next.answer;
    return next;
  });
}

function entryIdentity(entry: KnowledgeEntry): string {
  return [
    normalizeSubjectId(entry.subject_id || entry.fagkart_category_id),
    s(entry.source?.target_id || entry.source?.place_id || entry.source?.person_id),
    claimCore.normalized(entry.text)
  ].join("::");
}

function sanitizeStoredEntries(): { changed: boolean; total: number } {
  const before = getEntries();
  const output: KnowledgeEntry[] = [];
  const seen = new Map<string, KnowledgeEntry>();

  before.flatMap(cleanStoredEntry).forEach((entry) => {
    const key = entryIdentity(entry);
    const previous = seen.get(key);
    if (!previous) {
      seen.set(key, entry);
      output.push(entry);
      return;
    }
    previous.emne_ids = unique([...(previous.emne_ids || []), ...(entry.emne_ids || [])]);
    previous.concepts = unique([...(previous.concepts || []), ...(entry.concepts || [])]);
    previous.terms = unique([...(previous.terms || []), ...(entry.terms || [])]);
    previous.tags = unique([...(previous.tags || []), ...(entry.tags || [])]);
    previous.times_seen = Number(previous.times_seen || 1) + Number(entry.times_seen || 1);
  });

  const changed = JSON.stringify(before) !== JSON.stringify(output);
  if (changed) saveEntries(output);
  return { changed, total: output.length };
}

function migrateLegacyValue(legacyValue: unknown, sourceType = "legacy_quiz_knowledge"): { migrated: number; total: number } {
  const legacy = toObject(legacyValue);
  const learningLog = toArray(readJson(LEARNING_LOG_KEY, []));
  const existingIds = new Set(getEntries().map((entry) => s(entry?.legacy?.legacy_entry_id)).filter(Boolean));
  let migrated = 0;

  for (const [rawSubjectId, dimensionsValue] of Object.entries(legacy)) {
    const subjectId = normalizeSubjectId(rawSubjectId);
    for (const [dimension, itemsValue] of Object.entries(toObject(dimensionsValue))) {
      for (const itemValue of toArray(itemsValue)) {
        const item = toObject(itemValue);
        const question = claimCore.isQuestion(item.topic) ? s(item.topic) : "";
        const claims = claimCore.extractTextClaims(item.text, { question, answer: item.answer });
        claims.forEach((claim, index) => {
          const base = s(item.source_entry_id || item.id || item.topic || "legacy_knowledge");
          const legacyEntryId = `${subjectId}:${dimension}:${base}:${index + 1}`;
          if (existingIds.has(legacyEntryId)) return;
          const targetId = findLegacyTargetId(item.id, learningLog);
          const knowledgeUnitId = generatedCanonicalId("ku", subjectId, claim);
          upsertEntry({
            id: knowledgeUnitId,
            knowledge_unit_id: knowledgeUnitId,
            subject_id: subjectId,
            fagkart_category_id: subjectId,
            emne_ids: [],
            concept_ids: [],
            term_ids: [],
            story_ids: [],
            concepts: [],
            terms: [],
            tags: [],
            dimension: s(dimension || "generelt") || "generelt",
            topic: claimCore.cleanTopic(item.topic),
            text: claim,
            source: {
              type: sourceType,
              quiz_id: s(item.id) || null,
              target_id: targetId || null,
              place_id: null,
              person_id: null
            },
            legacy: { legacy_entry_id: legacyEntryId },
            content_quality: { version: QUALITY_VERSION, precise_claim: true, migrated: true, canonical_ids: true },
            link_status: "legacy_unresolved"
          }, { incrementSeen: false });
          existingIds.add(legacyEntryId);
          migrated += 1;
        });
      }
    }
  }
  return { migrated, total: getEntries().length };
}

function importLegacyUniverse(value: unknown): { migrated: number; total: number } {
  return migrateLegacyValue(value, "legacy_external_import");
}

function migrateLegacyKnowledge(): { migrated: number; total: number } {
  const legacy = toObject(readJson(LEGACY_KEY, {}));
  if (!Object.keys(legacy).length) return { migrated: 0, total: getEntries().length };
  const result = migrateLegacyValue(legacy);
  try { root.localStorage?.removeItem(LEGACY_KEY); } catch {}
  writeJson(LEGACY_MIGRATION_KEY, { migrated_at: new Date().toISOString(), migrated: result.migrated });
  return result;
}

function getLegacyProjection(): JsonObject {
  const grouped: JsonObject = {};
  getEntries().forEach((entry) => {
    const subject = normalizeSubjectId(entry.subject_id || entry.fagkart_category_id);
    const dimension = s(entry.dimension || "generelt") || "generelt";
    if (!subject) return;
    grouped[subject] ||= {};
    grouped[subject][dimension] ||= [];
    grouped[subject][dimension].push({
      id: entry.knowledge_unit_id || entry.id,
      topic: entry.topic,
      text: entry.text,
      knowledge_unit_id: entry.knowledge_unit_id || entry.id,
      concept_ids: entry.concept_ids || [],
      term_ids: entry.term_ids || [],
      story_ids: entry.story_ids || []
    });
  });
  return grouped;
}

function captureKnowledgePoint(entryValue: unknown): KnowledgeEntry | null {
  const entry = toObject(entryValue);
  return captureQuizKnowledge({
    ...entry,
    categoryId: entry.categoryId || entry.category || entry.subject_id,
    knowledge: entry.knowledge || entry.text,
    primary_knowledge_unit_id: entry.knowledge_unit_id || entry.id
  }, { categoryId: entry.categoryId || entry.category || entry.subject_id, targetId: entry.targetId });
}

function scoreConceptOverlap(entryConcepts: unknown[], eventConcepts: unknown[]): number {
  const eventSet = new Set(unique(eventConcepts).map((value) => value.toLowerCase()));
  return unique(entryConcepts).reduce((score, concept) => eventSet.has(concept.toLowerCase()) ? score + 1 : score, 0);
}

function reconcileEntriesFromLearningLog(): { changed: number; total: number } {
  const entries = getEntries();
  const learningLog = toArray(readJson(LEARNING_LOG_KEY, []));
  let changed = 0;

  const next = entries.map((entry) => {
    if (toArray(entry.emne_ids).length) return entry;
    const subjectId = normalizeSubjectId(entry.subject_id || entry.fagkart_category_id);
    const targetId = s(entry.source?.target_id);
    const entryConcepts = normalizeConcepts(entry);

    const candidates = learningLog
      .map((eventValue) => {
        const event = toObject(eventValue);
        return {
          event,
          subjectId: normalizeSubjectId(event.subjectId || event.subject_id || event.categoryId || event.category || event.domain),
          targetIds: normalizeTargetIds(event),
          emneIds: normalizeEmneIds(event),
          concepts: normalizeConcepts(event)
        };
      })
      .filter((candidate) => candidate.emneIds.length)
      .filter((candidate) => !subjectId || !candidate.subjectId || candidate.subjectId === subjectId)
      .filter((candidate) => !targetId || candidate.targetIds.includes(targetId))
      .map((candidate) => ({ ...candidate, overlap: scoreConceptOverlap(entryConcepts, candidate.concepts) }))
      .filter((candidate) => !entryConcepts.length || candidate.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap || Number(b.event.ts || 0) - Number(a.event.ts || 0));

    const best = candidates[0];
    if (!best) return entry;
    changed += 1;
    return {
      ...entry,
      emne_ids: unique(best.emneIds),
      link_status: "linked_from_learning_log",
      link_evidence: {
        event_type: s(best.event.type),
        event_id: s(best.event.id || best.event.quizId),
        concept_overlap: best.overlap
      }
    };
  });

  if (changed) saveEntries(next);
  return { changed, total: next.length };
}

function installCaptureBridge(): boolean {
  if (root.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__) return false;
  root.saveKnowledgeFromQuiz = (quizItem: unknown, context: unknown) => captureQuizKnowledge(quizItem, context || {});
  root.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__ = true;
  return true;
}

const quizMemory = createQuizKnowledgeMemory({ root, upsertEntry, normalizeSubjectId });

async function loadEmner(subjectId: string): Promise<JsonObject[]> {
  if (root.DataHub?.loadEmner) {
    try {
      const rows = await root.DataHub.loadEmner(subjectId, { cache: "default" });
      if (Array.isArray(rows)) return rows;
    } catch {}
  }
  if (root.Emner?.loadForSubject) {
    try {
      const rows = await root.Emner.loadForSubject(subjectId);
      if (Array.isArray(rows)) return rows;
    } catch {}
  }
  return [];
}

async function listSubjectIds(entries: KnowledgeEntry[]): Promise<string[]> {
  const ids = new Set(entries.map((entry) => normalizeSubjectId(entry.subject_id || entry.fagkart_category_id)).filter(Boolean));
  if (root.DataHub?.loadFagManifest) {
    try {
      const manifest = await root.DataHub.loadFagManifest({ cache: "default" });
      Object.keys(toObject(manifest)).forEach((id) => ids.add(normalizeSubjectId(id)));
    } catch {}
  }
  Object.keys(SUBJECT_LABELS).forEach((id) => ids.add(id));
  return Array.from(ids).filter(Boolean);
}

function inferEntryEmneIds(entry: KnowledgeEntry, emner: JsonObject[], learningLog: JsonObject[]): { ids: string[]; method: string } {
  const explicit = normalizeEmneIds(entry);
  if (explicit.length) return { ids: explicit, method: entry.link_status || "explicit" };

  const entryConcepts = new Set(normalizeConcepts(entry).map((concept) => concept.toLowerCase()));
  if (entryConcepts.size) {
    const scored = emner
      .map((emne) => {
        const concepts = unique([...(emne.core_concepts || []), ...(emne.keywords || [])]);
        const score = concepts.reduce((sum, concept) => sum + (entryConcepts.has(s(concept).toLowerCase()) ? 1 : 0), 0);
        return { id: s(emne.emne_id || emne.id), score };
      })
      .filter((row) => row.id && row.score > 0)
      .sort((a, b) => b.score - a.score);
    if (scored.length) {
      const top = scored[0].score;
      return { ids: scored.filter((row) => row.score === top).map((row) => row.id), method: "concept_overlap" };
    }
  }

  const targetId = s(entry.source?.target_id);
  const subjectId = normalizeSubjectId(entry.subject_id || entry.fagkart_category_id);
  const fromLog = unique(learningLog
    .filter((event) => {
      const eventSubject = normalizeSubjectId(event.subjectId || event.subject_id || event.categoryId || event.category || event.domain);
      return (!subjectId || !eventSubject || eventSubject === subjectId) && (!targetId || normalizeTargetIds(event).includes(targetId));
    })
    .flatMap((event) => normalizeEmneIds(event)));
  return { ids: fromLog, method: fromLog.length ? "learning_log_target" : "unresolved" };
}

async function buildProfile(options: JsonObject = {}): Promise<JsonObject> {
  sanitizeStoredEntries();
  migrateLegacyKnowledge();
  reconcileEntriesFromLearningLog();
  quizMemory.syncMemoryEntries();

  const entries = getEntries();
  const learningLog = toArray<JsonObject>(readJson(LEARNING_LOG_KEY, []));
  const subjectIds = await listSubjectIds(entries);
  const requestedSubjectId = normalizeSubjectId(options.subjectId);
  const subjects: JsonObject = {};

  for (const subjectId of subjectIds) {
    if (requestedSubjectId && requestedSubjectId !== subjectId) continue;
    const emner = await loadEmner(subjectId);
    const subjectEntries = entries.filter((entry) => normalizeSubjectId(entry.subject_id || entry.fagkart_category_id) === subjectId);
    const conceptCounts = new Map<string, JsonObject>();
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

    const emneRows = emner.map((emne) => {
      const emneId = s(emne.emne_id || emne.id);
      const linkedEntries = enrichedEntries.filter((entry) => toArray(entry.resolved_emne_ids).includes(emneId));
      return {
        emne_id: emneId,
        title: s(emne.title || emne.name || emneId),
        description: s(emne.description || emne.summary || emne.ingress),
        core_concepts: unique(emne.core_concepts || []),
        dimensions: unique(emne.dimensions || []),
        knowledge_count: linkedEntries.length,
        entries: linkedEntries
      };
    });

    let course = null;
    if (root.HGCourses?.compute) {
      try { course = await root.HGCourses.compute({ subjectId, emnerAll: emner }); } catch {}
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

  const visibleSubjects = Object.values(subjects) as JsonObject[];
  const allConcepts = new Map<string, JsonObject>();
  visibleSubjects.forEach((subject) => toArray<JsonObject>(subject.concepts).forEach((concept) => {
    const previous = allConcepts.get(concept.id) || { ...concept, count: 0 };
    previous.count += concept.count;
    allConcepts.set(concept.id, previous);
  }));

  const profile = {
    schema: "history_go_knowledge_profile_v2",
    version: VERSION,
    generated_at: new Date().toISOString(),
    summary: {
      knowledge_count: visibleSubjects.reduce((sum, subject) => sum + subject.knowledge_count, 0),
      linked_count: visibleSubjects.reduce((sum, subject) => sum + subject.linked_count, 0),
      unresolved_count: visibleSubjects.reduce((sum, subject) => sum + subject.unresolved_count, 0),
      subject_count: visibleSubjects.filter((subject) => subject.knowledge_count > 0).length,
      concept_count: allConcepts.size
    },
    concepts: Array.from(allConcepts.values()).sort((a, b) => b.count - a.count),
    subjects
  };
  return quizMemory.attachMemoryToProfile(profile);
}

function getContractHealth(entries: KnowledgeEntry[] = getEntries()): JsonObject {
  const missingSubject = entries.filter((entry) => !normalizeSubjectId(entry.subject_id || entry.fagkart_category_id));
  const missingEmne = entries.filter((entry) => !normalizeEmneIds(entry).length);
  const missingConcepts = entries.filter((entry) => !normalizeConcepts(entry).length);
  const missingText = entries.filter((entry) => !s(entry.text));
  return {
    total: entries.length,
    missing_subject: missingSubject.length,
    missing_emne: missingEmne.length,
    missing_concepts: missingConcepts.length,
    missing_text: missingText.length,
    ok: missingSubject.length === 0 && missingEmne.length === 0 && missingText.length === 0
  };
}

function boot(): void {
  sanitizeStoredEntries();
  migrateLegacyKnowledge();
  installCaptureBridge();
  reconcileEntriesFromLearningLog();
  quizMemory.syncMemoryEntries();
  quizMemory.initBrowserIntegration();
}

const api = {
  SCHEMA,
  VERSION,
  QUALITY_VERSION,
  KEYS: { ENTRIES: ENTRY_KEY, LEARNING_LOG: LEARNING_LOG_KEY, MEMORY: quizMemory.STORAGE_KEY, LEGACY_MIGRATION: LEGACY_MIGRATION_KEY },
  SUBJECT_LABELS,
  claimCore,
  normalizeEmneIds,
  normalizeConcepts,
  normalizeTerms,
  normalizeTags,
  captureQuizKnowledge,
  captureQuizKnowledgeClaims,
  captureKnowledgePoint,
  importLegacyUniverse,
  getLegacyProjection,
  sanitizeStoredEntries,
  migrateLegacyKnowledge,
  reconcileEntriesFromLearningLog,
  installCaptureBridge,
  getEntries,
  buildProfile,
  getContractHealth,
  quizMemory,
  renderQuizMemoryOverview: quizMemory.renderOverview
};

root.HGKnowledgeV2 = api;
root.HGQuizKnowledgeMemory = quizMemory;
root.buildQuizKnowledgeBundle = quizMemory.buildQuizKnowledgeBundle;
if (typeof root.addEventListener === "function") {
  root.addEventListener("hg:quizCompleted", () => { try { reconcileEntriesFromLearningLog(); } catch {} });
  root.addEventListener("hg:appReady", () => { try { installCaptureBridge(); } catch {} });
}
boot();

export default api;
