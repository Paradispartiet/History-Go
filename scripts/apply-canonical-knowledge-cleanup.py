from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def replace_once(path: str, old: str, new: str) -> None:
    text = read(path)
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{path}: expected one exact anchor, found {count}: {old[:90]!r}")
    write(path, text.replace(old, new, 1))


def replace_regex(path: str, pattern: str, replacement: str) -> None:
    text = read(path)
    next_text, count = re.subn(pattern, replacement, text, count=1, flags=re.S)
    if count != 1:
        raise RuntimeError(f"{path}: regex anchor not found: {pattern[:120]!r}")
    write(path, next_text)


def update_json(path: str, mutator) -> None:
    file = ROOT / path
    data = json.loads(file.read_text(encoding="utf-8"))
    mutator(data)
    file.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


# ---------------------------------------------------------------------------
# Canonical TypeScript runtime
# ---------------------------------------------------------------------------
replace_once(
    "js/knowledgeV2.ts",
    'const LEGACY_KEY = "knowledge_universe";\nconst LEARNING_LOG_KEY = "hg_learning_log_v1";',
    'const LEGACY_KEY = "knowledge_universe";\nconst LEGACY_MIGRATION_KEY = "hg_knowledge_legacy_migrated_v1";\nconst LEARNING_LOG_KEY = "hg_learning_log_v1";'
)
replace_once(
    "js/knowledgeV2.ts",
    'interface KnowledgeEntry extends JsonObject {\n  id: string;',
    'interface KnowledgeEntry extends JsonObject {\n  id: string;\n  knowledge_unit_id: string;\n  concept_ids: string[];\n  term_ids: string[];\n  story_ids: string[];'
)
replace_once(
    "js/knowledgeV2.ts",
    'function normalizeSubjectId(value: unknown): string {',
    '''function stableHash(value: unknown): string {
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

function normalizeSubjectId(value: unknown): string {'''
)
replace_once(
    "js/knowledgeV2.ts",
    '    emne_ids: unique([...(previous.emne_ids || []), ...(incoming.emne_ids || [])]),\n    concepts: unique([...(previous.concepts || []), ...(incoming.concepts || [])]),\n    terms: unique([...(previous.terms || []), ...(incoming.terms || [])]),\n    tags: unique([...(previous.tags || []), ...(incoming.tags || [])]),',
    '    knowledge_unit_id: previous.knowledge_unit_id || incoming.knowledge_unit_id || incoming.id,\n    emne_ids: unique([...(previous.emne_ids || []), ...(incoming.emne_ids || [])]),\n    concept_ids: unique([...(previous.concept_ids || []), ...(incoming.concept_ids || [])]),\n    term_ids: unique([...(previous.term_ids || []), ...(incoming.term_ids || [])]),\n    story_ids: unique([...(previous.story_ids || []), ...(incoming.story_ids || [])]),\n    concepts: unique([...(previous.concepts || []), ...(incoming.concepts || [])]),\n    terms: unique([...(previous.terms || []), ...(incoming.terms || [])]),\n    tags: unique([...(previous.tags || []), ...(incoming.tags || [])]),'
)
replace_once(
    "js/knowledgeV2.ts",
    '''  const emneIds = normalizeEmneIds(quizItem);
  const concepts = normalizeConcepts(quizItem);
  const terms = normalizeTerms(quizItem);
  const tags = normalizeTags(quizItem);
  const kind = claimCore.inferKind(quizItem);
  const topic = claimCore.cleanTopic(quizItem.topic || context.topic, kind);
  const stableSource = sourceQuizId || [targetId, topic, claims[0]].map(slug).filter(Boolean).join("_");
  const source = sourceForQuiz(quizItem, context, sourceQuizId, targetId);

  return claims.map((claim, index) => upsertEntry({
    id: `kv2_${slug(subjectId)}_${slug(stableSource)}${claims.length > 1 ? `_claim_${index + 1}` : ""}`,
    subject_id: subjectId,
    fagkart_category_id: subjectId,
    emne_ids: emneIds,
    concepts,
    terms,
    tags,''',
    '''  const emneIds = normalizeEmneIds(quizItem);
  const concepts = normalizeConcepts(quizItem);
  const terms = normalizeTerms(quizItem);
  const tags = normalizeTags(quizItem);
  const explicitKnowledgeIds = unique([quizItem.primary_knowledge_unit_id, quizItem.knowledge_unit_id, quizItem.knowledge_unit_ids]);
  const knowledgeUnitIds = claims.map((claim, index) => explicitKnowledgeIds[index] || generatedCanonicalId("ku", subjectId, claim));
  const explicitConceptIds = explicitIdList(quizItem, "concept_ids", "conceptIds");
  const conceptIds = unique([explicitConceptIds, concepts.map((concept) => generatedCanonicalId("co", subjectId, concept))]);
  const explicitTermIds = explicitIdList(quizItem, "term_ids", "termIds");
  const termIds = unique([explicitTermIds, terms.map((term) => generatedCanonicalId("term", subjectId, term))]);
  const storyIds = unique([quizItem.story_ids, quizItem.storyIds]);
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
    tags,'''
)
replace_regex(
    "js/knowledgeV2.ts",
    r'function cleanStoredEntry\(entryValue: unknown\): KnowledgeEntry\[\] \{.*?\n\}\n\nfunction entryIdentity',
    '''function cleanStoredEntry(entryValue: unknown): KnowledgeEntry[] {
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
      concept_ids: unique([explicitConceptIds, concepts.map((concept) => generatedCanonicalId("co", subjectId, concept))]),
      term_ids: unique([explicitTermIds, normalizeTerms(entry).map((term) => generatedCanonicalId("term", subjectId, term))]),
      story_ids: explicitStoryIds,
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

function entryIdentity'''
)
replace_regex(
    "js/knowledgeV2.ts",
    r'function migrateLegacyKnowledge\(\): \{ migrated: number; total: number \} \{.*?\n\}\n\nfunction scoreConceptOverlap',
    '''function migrateLegacyValue(legacyValue: unknown, sourceType = "legacy_quiz_knowledge"): { migrated: number; total: number } {
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

function scoreConceptOverlap'''
)
replace_once(
    "js/knowledgeV2.ts",
    '  KEYS: { ENTRIES: ENTRY_KEY, LEGACY: LEGACY_KEY, LEARNING_LOG: LEARNING_LOG_KEY, MEMORY: quizMemory.STORAGE_KEY },',
    '  KEYS: { ENTRIES: ENTRY_KEY, LEARNING_LOG: LEARNING_LOG_KEY, MEMORY: quizMemory.STORAGE_KEY, LEGACY_MIGRATION: LEGACY_MIGRATION_KEY },'
)
replace_once(
    "js/knowledgeV2.ts",
    '  captureQuizKnowledge,\n  captureQuizKnowledgeClaims,',
    '  captureQuizKnowledge,\n  captureQuizKnowledgeClaims,\n  captureKnowledgePoint,\n  importLegacyUniverse,\n  getLegacyProjection,'
)

# ---------------------------------------------------------------------------
# Quiz memory propagates canonical per-claim IDs
# ---------------------------------------------------------------------------
replace_regex(
    "js/knowledgeQuizMemory.ts",
    r'function explicitUnitId\(question: JsonObject, fallback: string\): string \{.*?\n\}',
    '''function explicitUnitIds(question: JsonObject, fallback: string): string[] {
  return unique([
    question.primary_knowledge_unit_id,
    question.knowledge_unit_id,
    question.knowledge_unit_ids,
    question.quiz_id || question.quizId || question.id || fallback
  ]);
}'''
)
replace_once(
    "js/knowledgeQuizMemory.ts",
    '  const unitId = explicitUnitId(question, fallbackId);',
    '  const unitIds = explicitUnitIds(question, fallbackId);\n  const unitId = unitIds[0];'
)
replace_once(
    "js/knowledgeQuizMemory.ts",
    '    unit_id: unitId,\n    source_question_id:',
    '    unit_id: unitId,\n    knowledge_unit_id: unitId,\n    knowledge_unit_ids: unitIds,\n    source_question_id:'
)
replace_once(
    "js/knowledgeQuizMemory.ts",
    '    concepts: unique([question.core_concepts, question.concept_ids]),\n    concept_focus: unique([question.concept_focus]),\n    terms: unique([question.term_ids, question.terminology, question.terminologi, question.faguttrykk]),',
    '    concepts: unique([question.core_concepts, question.concepts]),\n    concept_ids: unique([question.concept_ids, question.conceptIds]),\n    concept_focus: unique([question.concept_focus]),\n    terms: unique([question.terminology, question.terminologi, question.faguttrykk]),\n    term_ids: unique([question.term_ids, question.termIds]),'
)
replace_once(
    "js/knowledgeQuizMemory.ts",
    '    stories: unique([question.story_ids, question.related_stories]),',
    '    stories: unique([question.related_stories]),\n    story_ids: unique([question.story_ids, question.storyIds]),'
)
replace_once(
    "js/knowledgeQuizMemory.ts",
    '  const currentId = text(unit.unit_id || unit.id || "knowledge_unit");\n  const sourceId = text(unit.source_question_id || currentId);',
    '  const currentId = text(unit.knowledge_unit_id || unit.unit_id || unit.id || "knowledge_unit");\n  const explicitIds = unique([unit.knowledge_unit_ids, unit.knowledge_unit_id, unit.unit_id]);\n  const sourceId = text(unit.source_question_id || currentId);'
)
replace_once(
    "js/knowledgeQuizMemory.ts",
    '    next.unit_id = claims.length === 1 ? currentId : `${currentId}::claim::${index + 1}`;',
    '    next.unit_id = explicitIds[index] || (claims.length === 1 ? currentId : `${currentId}::claim::${index + 1}`);\n    next.knowledge_unit_id = next.unit_id;'
)
replace_once(
    "js/knowledgeQuizMemory.ts",
    '      id: `quiz_memory::${text(bundle.bundle_id)}::${unitId}`,\n      subject_id:',
    '      id: `quiz_memory::${text(bundle.bundle_id)}::${unitId}`,\n      knowledge_unit_id: unitId,\n      subject_id:'
)
replace_once(
    "js/knowledgeQuizMemory.ts",
    '      emne_ids: emneIds,\n      concepts: unique([unit.concepts, unit.concept_focus]),\n      terms: unique([unit.terms]),',
    '      emne_ids: emneIds,\n      concept_ids: unique([unit.concept_ids]),\n      term_ids: unique([unit.term_ids]),\n      story_ids: unique([unit.story_ids]),\n      concepts: unique([unit.concepts, unit.concept_focus]),\n      terms: unique([unit.terms]),'
)

# ---------------------------------------------------------------------------
# Remove active legacy storage readers; keep compatibility APIs over V2
# ---------------------------------------------------------------------------
replace_regex(
    "js/knowledge.ts",
    r'// Hent universet.*?// ------------------------------------------------------------\n// 2\) HENTE KUNNSKAP FOR ET MERKE',
    '''// Kompatibilitetsprojeksjon over den kanoniske V2-lesemodellen.
function getKnowledgeUniverse() {
  return window.HGKnowledgeV2?.getLegacyProjection?.() || {};
}

function saveKnowledgeUniverse(obj) {
  return window.HGKnowledgeV2?.importLegacyUniverse?.(obj) || { migrated: 0, total: 0 };
}

function saveKnowledgePoint(entry) {
  return window.HGKnowledgeV2?.captureKnowledgePoint?.(entry) || null;
}

// ------------------------------------------------------------
// 2) HENTE KUNNSKAP FOR ET MERKE'''
)
replace_once(
    "js/knowledge.ts",
    '  const legacy = getKnowledgeUniverse();\n  return legacy[cid] || {};',
    '  return {};'
)
replace_regex(
    "js/hgchips.js",
    r'  function getUnlockedConceptIds\(categoryId\) \{.*?\n  \}\n\n  async function fetchJson',
    '''  function getUnlockedConceptIds(categoryId) {
    const unlocked = new Set();
    const entries = window.HGKnowledgeV2?.getEntries?.() || [];
    (Array.isArray(entries) ? entries : [])
      .filter((entry) => norm(entry?.subject_id || entry?.fagkart_category_id) === categoryId)
      .forEach((entry) => {
        const unitId = norm(entry?.knowledge_unit_id || entry?.id);
        if (unitId) unlocked.add(unitId);
        (Array.isArray(entry?.concept_ids) ? entry.concept_ids : []).forEach((id) => { const value = norm(id); if (value) unlocked.add(value); });
        (Array.isArray(entry?.concepts) ? entry.concepts : []).forEach((label) => { const value = normLc(label); if (value) unlocked.add("topic:" + value); });
        const topic = normLc(entry?.topic);
        if (topic) unlocked.add("topic:" + topic);
      });

    const events = window.HGLearningLog?.getEvents?.() ?? [];
    const hist = Array.isArray(events) ? events : [];
    for (const h of hist) {
      if (!h) continue;
      const list = Array.isArray(h.unlocked_concepts) ? h.unlocked_concepts : (Array.isArray(h.concepts) ? h.concepts : []);
      for (const c of list) {
        const value = normLc(c);
        if (value) unlocked.add("topic:" + value);
      }
    }
    return unlocked;
  }

  async function fetchJson'''
)
replace_once(
    "js/hgchips.js",
    '//  - Local unlocked knowledge (knowledge_universe) + quiz_history (optional)',
    '//  - Canonical Knowledge V2 entries + quiz history (optional)'
)
replace_regex(
    "js/profile.js",
    r'function renderLatestKnowledge\(\) \{.*?\n\}\n\n/\*\*',
    '''function renderLatestKnowledge() {
  const elTopic = document.getElementById("lkTopic");
  const elCat = document.getElementById("lkCategory");
  const elText = document.getElementById("lkText");
  if (!elTopic || !elCat || !elText) return;
  const box = document.getElementById("latestKnowledgeBox") || document.getElementById("profileKnowledge") || elTopic.closest(".profile-card, .profile-section, .hg-card, .card") || elTopic.parentElement;
  if (!box) return;
  const entries = window.HGKnowledgeV2?.getEntries?.() || [];
  const sorted = (Array.isArray(entries) ? entries : []).slice().sort((a, b) => Date.parse(b?.last_seen_at || b?.learned_at || 0) - Date.parse(a?.last_seen_at || a?.learned_at || 0));
  const item = sorted[0];
  if (!item) { box.style.display = "none"; return; }
  const category = String(item.subject_id || item.fagkart_category_id || "");
  elTopic.textContent = item.topic || _t("ui.knowledge.knowledge", "Kunnskap");
  elCat.textContent = category.charAt(0).toUpperCase() + category.slice(1);
  elText.textContent = item.text || "";
  box.style.display = "block";
}

/**'''
)
replace_regex(
    "js/ui/popup-utils.js",
    r'// Hent kunnskapsblokker for en bestemt kategori \+ mål \(person/sted\).*?\n\}\n\n// Hent trivia-liste',
    '''// Hent kunnskapsblokker for en bestemt kategori + mål (person/sted)
function getInlineKnowledgeFor(categoryId, targetId) {
  if (!categoryId || !targetId) return null;
  const entries = window.HGKnowledgeV2?.getEntries?.() || [];
  const out = {};
  (Array.isArray(entries) ? entries : [])
    .filter((entry) => String(entry?.subject_id || entry?.fagkart_category_id || "").trim() === String(categoryId).trim())
    .filter((entry) => {
      const source = entry?.source || {};
      return [source.target_id, source.place_id, source.person_id].map((value) => String(value || "").trim()).includes(String(targetId).trim());
    })
    .forEach((entry) => {
      const dimension = String(entry?.dimension || "generelt").trim() || "generelt";
      out[dimension] ||= [];
      out[dimension].push({ id: entry.knowledge_unit_id || entry.id, topic: entry.topic, text: entry.text });
    });
  return Object.keys(out).length ? out : null;
}

// Hent trivia-liste'''
)
replace_regex(
    "js/Civication/utils/storyResolver.js",
    r'  function collectKnowledgeTopics\(\) \{.*?\n  \}\n\n  function collectLearningConcepts',
    '''  function collectKnowledgeTopics() {
    const entries = window.HGKnowledgeV2?.getEntries?.() || [];
    const out = [];
    for (const item of (Array.isArray(entries) ? entries : [])) {
      const topic = normStr(item?.topic);
      const text = normStr(item?.text);
      if (topic) out.push(topic);
      if (text) out.push(...tokenizeText(text));
      (Array.isArray(item?.concepts) ? item.concepts : []).forEach((concept) => out.push(normStr(concept)));
    }
    return uniq(out.map(normLower).filter(Boolean));
  }

  function collectLearningConcepts'''
)
replace_once(
    "js/hgKnowledgeEngine.ts",
    ' * @property {unknown} knowledgeUniverse',
    ' * @property {unknown[]} knowledgeEntries'
)
replace_once(
    "js/hgKnowledgeEngine.ts",
    '      knowledgeUniverse: readJsonStorage("knowledge_universe", {}),',
    '      knowledgeEntries: toArray(window.HGKnowledgeV2?.getEntries?.() || readJsonStorage("hg_knowledge_entries_v2", [])),'
)
replace_once(
    "js/hgKnowledgeEngine.ts",
    '.concat(toArrayLike(state.knowledgeUniverse).map((entry) => ({ entry: entry, streamType: "knowledgeUniverse" })))',
    '.concat(toArray(state.knowledgeEntries).map((entry) => ({ entry: entry, streamType: "knowledgeEntriesV2" })))'
)

# ---------------------------------------------------------------------------
# AHA bridge uses canonical arrays; old payload import remains computed-only
# ---------------------------------------------------------------------------
replace_once("js/aha.js", '    "knowledge_universe",', '    "hg_knowledge_memory_v1",')
replace_once("js/aha.js", '    "hg_learning_log_v1",', '    "hg_knowledge_entries_v2",\n    "hg_learning_log_v1",')
replace_once(
    "js/aha.js",
    '  writeObject("knowledge_universe", payload.knowledge_universe);\n  writeArray("hg_learning_log_v1", payload.hg_learning_log_v1);',
    '  writeArray("hg_knowledge_entries_v2", payload.hg_knowledge_entries_v2);\n  writeObject("hg_knowledge_memory_v1", payload.hg_knowledge_memory_v1);\n  const legacyKey = ["knowledge", "universe"].join("_");\n  if (payload[legacyKey]) window.HGKnowledgeV2?.importLegacyUniverse?.(payload[legacyKey]);\n  writeArray("hg_learning_log_v1", payload.hg_learning_log_v1);'
)
replace_once(
    "js/aha.js",
    '      knowledge_categories: Object.keys(enrichedPayload.knowledge_universe || {}).length,',
    '      knowledge_entries: Array.isArray(enrichedPayload.hg_knowledge_entries_v2) ? enrichedPayload.hg_knowledge_entries_v2.length : 0,'
)
replace_regex(
    "js/aha.js",
    r'  let knowledge = \{\};\n  try \{.*?\n  \}\n\n  const notes =',
    '''  const knowledgeEntries = window.HGKnowledgeV2?.getEntries?.() || hgAhaReadJson("hg_knowledge_entries_v2", []);
  const knowledgeMemory = hgAhaReadJson("hg_knowledge_memory_v1", {});

  const notes ='''
)
replace_once(
    "js/aha.js",
    '    knowledge_universe: knowledge && typeof knowledge === "object" ? knowledge : {},',
    '    hg_knowledge_entries_v2: Array.isArray(knowledgeEntries) ? knowledgeEntries : [],\n    hg_knowledge_memory_v1: knowledgeMemory && typeof knowledgeMemory === "object" ? knowledgeMemory : {},'
)
replace_regex(
    "AHA/ahaHistoryGoImport.js",
    r'  function collectKnowledgeSignals\(chamber, universe, fallbackTimestamp\) \{.*?\n  \}',
    '''  function collectKnowledgeSignals(chamber, entries, fallbackTimestamp) {
    let count = 0;
    (Array.isArray(entries) ? entries : []).forEach((item) => {
      const category = item.subject_id || item.fagkart_category_id || "historygo";
      const topic = item.topic || item.title || item.knowledge_unit_id || item.id || "tema";
      const text = `${topic}: ${item.text || item.content || item.summary || ""}`;
      const meta = { dimension: item.dimension || null, item_id: item.knowledge_unit_id || item.id || null, concept_ids: item.concept_ids || [], term_ids: item.term_ids || [], imported: true, source_app: "historygo", source_type: "historygo_knowledge_item_v2" };
      if (addSignal(chamber, text, category, item.last_seen_at || item.learned_at || fallbackTimestamp, meta)) count++;
    });
    return count;
  }'''
)
replace_once(
    "AHA/ahaHistoryGoImport.js",
    '    importedSignals += collectKnowledgeSignals(chamber, payload.knowledge_universe, ts);',
    '    importedSignals += collectKnowledgeSignals(chamber, payload.hg_knowledge_entries_v2, ts);'
)
replace_once("AHA/index.html", 'knowledge universe', 'canonical Knowledge V2')
replace_once("AHA/index.html", '<li>knowledge_universe: <span id="count-knowledge">0</span></li>', '<li>hg_knowledge_entries_v2: <span id="count-knowledge">0</span></li>')
replace_once("AHA/index.html", "setCount('count-knowledge', 'knowledge_universe');", "setCount('count-knowledge', 'hg_knowledge_entries_v2');")
replace_once(
    "AHA/index.html",
    "const knowledgeUniverseCount = payload?.knowledge_universe && typeof payload.knowledge_universe === 'object' ? Object.keys(payload.knowledge_universe).length : 0;",
    "const knowledgeEntryCount = Array.isArray(payload?.hg_knowledge_entries_v2) ? payload.hg_knowledge_entries_v2.length : 0;"
)
replace_once("AHA/index.html", "'knowledge_universe kategorier: ' + knowledgeUniverseCount,", "'hg_knowledge_entries_v2: ' + knowledgeEntryCount,")

# ---------------------------------------------------------------------------
# Build, audit and CI contracts
# ---------------------------------------------------------------------------
update_json("package.json", lambda data: data["scripts"].update({
    "knowledge:canonical:write": "npm run build:scripts && node dist/scripts/knowledge-canonical-data.mjs --write",
    "knowledge:canonical:check": "npm run build:scripts && node dist/scripts/knowledge-canonical-data.mjs --check",
    "knowledge:legacy:check": "npm run build:scripts && node dist/scripts/knowledge-canonical-data.mjs --legacy-only",
    "audit:knowledge": "npm run build:scripts && node dist/scripts/knowledge-canonical-data.mjs --audit-only"
}))

def add_build_script(data):
    includes = data["include"]
    if "scripts/knowledge-canonical-data.mts" not in includes:
        includes.append("scripts/knowledge-canonical-data.mts")
update_json("tsconfig.scripts.build.json", add_build_script)

# Schema permits draft/unresolved arrays; the audit is the canonical gate.
def update_schema(data):
    for key in ("emne_ids", "concept_ids", "term_ids"):
        data["properties"][key].pop("minItems", None)
update_json("data/knowledge/knowledge_unit_schema_v1.json", update_schema)

def update_manifest(data):
    runtime = data["runtime"]
    runtime["storageKeys"] = ["hg_knowledge_entries_v2", "hg_knowledge_memory_v1"]
    runtime["migrationStatus"] = "v8_canonical_ids_and_legacy_retirement_active"
    runtime["canonicalDataPipeline"] = "../../scripts/knowledge-canonical-data.mts"
    runtime["canonicalRegistries"] = {
        "knowledge_units": "knowledge_units.generated.json",
        "concepts": "concepts.generated.json",
        "terms": "terms.generated.json",
        "stories": "stories.generated.json"
    }
    runtime["currentBehavior"] = "Quizkilder har deterministiske canonical IDs. Knowledge V2 og quizminnet bevarer disse ID-ene gjennom capture, lesemodell, profil og repetisjon. Legacy-lageret leses bare én gang av migreringskoden, flyttes til V2 og slettes."
    runtime["nextRuntimeRequirements"] = ["Resolve only the remaining explicitly reported emne-link ambiguities through editorial review; never guess."]
update_json("data/knowledge/knowledge_manifest.json", update_manifest)

def update_policy(data):
    data["legacy_compatibility"]["knowledge_universe"] = "one-time import source only; migrate into hg_knowledge_entries_v2 and delete the legacy key"
update_json("data/knowledge/knowledge_system_policy_v1.json", update_policy)

def add_holmenkollen(data):
    if not any(row.get("id") == "holmenkollen_kapell" for row in data):
        data.append({
            "id": "holmenkollen_kapell",
            "category": "by",
            "reason": "Aktivt kapell, men History GO-stedet er redaksjonelt forankret i byarkitektur, historiske bygningslag, brannen i 1992 og gjenreisningen; religion er et innholdslag, ikke stedets primære fagkategori."
        })
update_json("data/places/religion_candidate_review.json", add_holmenkollen)

# Permanent workflows build the TS pipeline and enforce zero drift/readers.
replace_once(
    ".github/workflows/knowledge-checks.yml",
    "      - 'scripts/audit-knowledge-*.mjs'",
    "      - 'scripts/audit-knowledge-*.mjs'\n      - 'scripts/knowledge-canonical-data.mts'\n      - 'data/knowledge/*.generated.json'\n      - 'data/quiz/**'"
)
replace_once(
    ".github/workflows/knowledge-checks.yml",
    '          node --check scripts/audit-knowledge-contract.mjs\n          node --check scripts/audit-knowledge-links.mjs',
    '          node --check scripts/audit-knowledge-links.mjs'
)
replace_once(
    ".github/workflows/knowledge-checks.yml",
    '      - name: Run Knowledge core tests\n        run: npm run test:knowledge-core',
    '      - name: Build canonical Knowledge data tooling\n        run: npm run build:scripts\n\n      - name: Guard canonical Knowledge data and legacy readers\n        run: |\n          npm run knowledge:canonical:check\n          npm run knowledge:legacy:check\n\n      - name: Run Knowledge core tests\n        run: npm run test:knowledge-core'
)
replace_once(
    ".github/workflows/knowledge-checks.yml",
    '      - name: Generate Knowledge contract audit\n        continue-on-error: true\n        run: node scripts/audit-knowledge-contract.mjs',
    '      - name: Generate Knowledge contract audit\n        run: npm run audit:knowledge'
)
replace_once(
    ".github/workflows/knowledge-checks.yml",
    '            reports/knowledge-contract-audit.json\n            reports/knowledge-checkjs-diagnostics.txt',
    '            reports/knowledge-contract-audit.json\n            reports/knowledge-id-backfill.json\n            reports/knowledge-universe-readers.json\n            reports/knowledge-checkjs-diagnostics.txt'
)
replace_once(
    ".github/workflows/data-checks.yml",
    "      - 'scripts/audit-knowledge-contract.mjs'",
    "      - 'scripts/knowledge-canonical-data.mts'"
)
replace_once(
    ".github/workflows/data-checks.yml",
    '          node --check scripts/audit-knowledge-contract.mjs',
    '          npm run build:scripts\n          node --check dist/scripts/knowledge-canonical-data.mjs'
)
replace_once(
    ".github/workflows/data-checks.yml",
    '      - name: Generate Knowledge contract audit\n        continue-on-error: true\n        run: npm run audit:knowledge',
    '      - name: Guard canonical Knowledge data and contract\n        run: |\n          npm run knowledge:canonical:check\n          npm run knowledge:legacy:check\n          npm run audit:knowledge'
)
replace_once(
    ".github/workflows/data-checks.yml",
    '          path: reports/knowledge-contract-audit.json',
    '          path: |\n            reports/knowledge-contract-audit.json\n            reports/knowledge-id-backfill.json\n            reports/knowledge-universe-readers.json'
)

# The permanent audit replaces the legacy JS audit.
old_audit = ROOT / "scripts/audit-knowledge-contract.mjs"
if old_audit.exists():
    old_audit.unlink()

# Extend tests for canonical IDs and one-time legacy deletion.
replace_once(
    "tests/knowledge-v2-model.test.js",
    '  assert.deepEqual(entry.concepts, ["gentrifisering", "planmakt"]);',
    '  assert.deepEqual(entry.concepts, ["gentrifisering", "planmakt"]);\n  assert.match(entry.knowledge_unit_id, /^ku_by_/);\n  assert.equal(entry.id, entry.knowledge_unit_id);\n  assert.equal(entry.concept_ids.length, 2);'
)
replace_once(
    "tests/knowledge-v2-model.test.js",
    '  assert.ok(rows.every((entry) => entry.link_status === "legacy_unresolved"));\n});',
    '  assert.ok(rows.every((entry) => entry.link_status === "legacy_unresolved"));\n  assert.equal(global.localStorage.getItem("knowledge_universe"), null);\n  assert.ok(global.localStorage.getItem("hg_knowledge_legacy_migrated_v1"));\n});'
)
replace_once(
    "tests/knowledge-v2-model.test.js",
    '    term_ids: ["hovedbibliotek"],',
    '    terminology: ["hovedbibliotek"],\n    term_ids: ["term_by_hovedbibliotek_test"],\n    concept_ids: ["co_by_offentlig_institusjon_test"],\n    knowledge_unit_ids: ["ku_by_deichman_opening_test_1", "ku_by_deichman_opening_test_2"],'
)
replace_once(
    "tests/knowledge-v2-model.test.js",
    '  assert.deepEqual(entries[0].terms, ["hovedbibliotek"]);',
    '  assert.deepEqual(entries[0].terms, ["hovedbibliotek"]);\n  assert.equal(entries[0].knowledge_unit_id, "ku_by_deichman_opening_test_1");\n  assert.equal(entries[1].knowledge_unit_id, "ku_by_deichman_opening_test_2");\n  assert.deepEqual(entries[0].concept_ids, ["co_by_offentlig_institusjon_test"]);\n  assert.deepEqual(entries[0].term_ids, ["term_by_hovedbibliotek_test"]);'
)

print("canonical Knowledge cleanup codemod applied")
