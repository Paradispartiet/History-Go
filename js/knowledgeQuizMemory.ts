import claimCore from "./knowledgeClaimCore";

type JsonObject = Record<string, any>;
type Root = typeof globalThis & Record<string, any>;
type UpsertOptions = { incrementSeen?: boolean };
type Dependencies = {
  root: Root;
  upsertEntry: (entry: JsonObject, options?: UpsertOptions) => JsonObject | null;
  normalizeSubjectId: (value: unknown) => string;
};

const STORAGE_KEY = "hg_knowledge_memory_v1";
const REVIEW_REQUEST_KEY = "hg_quiz_review_request_v1";
const SCHEMA = "hg_knowledge_memory_v1";
const MANIFEST_PATH = "data/quiz/manifest.json";
const QUALITY_VERSION = 3;

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function array<T = JsonObject>(value: unknown): T[] {
  return Array.isArray(value) ? value as T[] : [];
}

function object(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : {};
}

function unique(values: unknown[]): string[] {
  return Array.from(new Set(values.flatMap((value) => Array.isArray(value) ? value : [value]).map(text).filter(Boolean)));
}

function stableId(...parts: unknown[]): string {
  return parts.map(text).filter(Boolean).join("::");
}

function escapeHtml(value: unknown): string {
  return text(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function humanize(value: unknown): string {
  return text(value).replace(/^em_[a-z]+_/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function valueText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return text(value);
  const row = object(value);
  return text(row.text || row.knowledge || row.fact || row.fun_fact || row.funFact || row.summary || row.description || row.desc || row.title || row.name || row.label);
}

function normalizeSources(value: unknown): JsonObject[] {
  const seen = new Set<string>();
  const output: JsonObject[] = [];
  for (const item of Array.isArray(value) ? value : value == null ? [] : [value]) {
    const row = typeof item === "string"
      ? { name: text(item), type: "source", url: "", role: "" }
      : {
          name: text(object(item).name || object(item).title || object(item).label || object(item).url),
          type: text(object(item).type || "source"),
          url: text(object(item).url || object(item).href),
          role: text(object(item).role || object(item).note || object(item).description)
        };
    if (!row.name && !row.url) continue;
    const key = stableId(row.type, row.name, row.url);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(row);
  }
  return output;
}

function normalizeNamedRows(value: unknown, kind: string, origin: string): JsonObject[] {
  const rows = Array.isArray(value) ? value : value == null ? [] : [value];
  return rows.map((item, index) => {
    const raw = object(item);
    const itemText = valueText(item);
    if (!itemText) return null;
    return {
      id: text(raw.id || raw.key || raw.slug) || stableId(origin, kind, index + 1),
      kind,
      title: text(raw.title || raw.name || raw.label),
      text: itemText,
      target_id: text(raw.targetId || raw.target_id || raw.placeId || raw.place_id || raw.personId || raw.person_id),
      year: raw.year ?? null,
      tags: unique([raw.tags]),
      source: normalizeSources(raw.source || raw.sources),
      origin
    };
  }).filter(Boolean) as JsonObject[];
}

function mergeNamedRows(...groups: JsonObject[][]): JsonObject[] {
  const rows = new Map<string, JsonObject>();
  for (const row of groups.flat().filter(Boolean)) {
    const key = text(row.id) || stableId(row.kind, row.title, row.text);
    if (key && !rows.has(key)) rows.set(key, row);
  }
  return Array.from(rows.values());
}

function explicitUnitIds(question: JsonObject, fallback: string): string[] {
  return unique([
    question.primary_knowledge_unit_id,
    question.knowledge_unit_id,
    question.knowledge_unit_ids,
    question.quiz_id || question.quizId || question.id || fallback
  ]);
}

function buildCorrectQuestionKeys(result: JsonObject): Set<string> {
  const keys = new Set<string>();
  for (const row of array(result.correctAnswers)) {
    const question = text(row.question);
    const answer = text(row.answer || row.correctAnswer);
    if (question) keys.add(question);
    if (question) keys.add(stableId(question, answer));
  }
  for (const row of array(result.answers)) {
    if (row.correct !== true) continue;
    const id = text(row.question_id || row.questionId || row.quiz_id || row.quizId);
    const question = text(row.question);
    const answer = text(row.correct_answer || row.correctAnswer || row.answer);
    if (id) keys.add(id);
    if (question) keys.add(question);
    if (question) keys.add(stableId(question, answer));
  }
  return keys;
}

function questionWasCorrect(question: JsonObject, correctKeys: Set<string>, result: JsonObject, index: number): boolean {
  const id = text(question.quiz_id || question.quizId || question.id);
  const prompt = text(question.question || question.text);
  const answer = text(question.answer);
  return !!(
    (id && correctKeys.has(id)) ||
    (prompt && correctKeys.has(prompt)) ||
    (prompt && correctKeys.has(stableId(prompt, answer))) ||
    array(result.answers)[index]?.correct === true
  );
}

function collectTopLevelMaterial(setDataValue: unknown): JsonObject {
  const setData = object(setDataValue);
  const ext = object(setData.source_profile_extensions);
  return {
    funFacts: mergeNamedRows(
      normalizeNamedRows(setData.fun_facts, "fun_fact", "fun_facts"),
      normalizeNamedRows(setData.funFacts, "fun_fact", "funFacts"),
      normalizeNamedRows(ext.fun_facts, "fun_fact", "source_profile_extensions.fun_facts"),
      normalizeNamedRows(ext.funFacts, "fun_fact", "source_profile_extensions.funFacts")
    ),
    stories: mergeNamedRows(normalizeNamedRows(setData.stories, "story", "stories"), normalizeNamedRows(ext.stories, "story", "source_profile_extensions.stories")),
    people: mergeNamedRows(normalizeNamedRows(setData.related_people, "person", "related_people"), normalizeNamedRows(ext.related_people, "person", "source_profile_extensions.related_people")),
    events: mergeNamedRows(normalizeNamedRows(setData.related_events, "event", "related_events"), normalizeNamedRows(ext.related_events, "event", "source_profile_extensions.related_events")),
    institutions: mergeNamedRows(normalizeNamedRows(setData.institutions, "institution", "institutions"), normalizeNamedRows(ext.institutions, "institution", "source_profile_extensions.institutions")),
    artifacts: mergeNamedRows(normalizeNamedRows(setData.artifacts, "artifact", "artifacts"), normalizeNamedRows(ext.artifacts, "artifact", "source_profile_extensions.artifacts")),
    buildingStories: mergeNamedRows(normalizeNamedRows(setData.building_stories, "building_story", "building_stories"), normalizeNamedRows(ext.building_stories, "building_story", "source_profile_extensions.building_stories")),
    conflicts: mergeNamedRows(normalizeNamedRows(setData.local_conflicts, "conflict", "local_conflicts"), normalizeNamedRows(ext.local_conflicts, "conflict", "source_profile_extensions.local_conflicts"))
  };
}

function buildKnowledgeUnit(questionValue: unknown, index: number, correctKeys: Set<string>, result: JsonObject, context: JsonObject): JsonObject {
  const question = object(questionValue);
  const fallbackId = stableId(context.setId, "q", index + 1);
  const unitIds = explicitUnitIds(question, fallbackId);
  const unitId = unitIds[0];
  const correct = questionWasCorrect(question, correctKeys, result, index);
  return {
    unit_id: unitId,
    knowledge_unit_id: unitId,
    knowledge_unit_ids: unitIds,
    source_question_id: text(question.quiz_id || question.quizId || question.id || fallbackId),
    kind: claimCore.inferKind(question),
    subject_id: context.categoryId,
    target_id: context.targetId,
    set_id: context.setId,
    question: text(question.question || question.text),
    answer: text(question.answer),
    text: claimCore.extractQuizClaims(question).join(" "),
    topic: text(question.topic),
    dimension: text(question.dimension),
    question_type: text(question.question_type),
    question_family: text(question.question_family),
    question_layer: text(question.question_layer),
    year: question.year ?? null,
    epoke_id: text(question.epoke_id),
    emne_ids: unique([question.emne_id, question.emne_ids, question.related_emner, question.related_emnes]),
    concepts: unique([question.core_concepts, question.concepts]),
    concept_ids: unique([question.concept_ids, question.conceptIds]),
    concept_focus: unique([question.concept_focus]),
    terms: unique([question.terminology, question.terminologi, question.faguttrykk]),
    term_ids: unique([question.term_ids, question.termIds]),
    people: unique([question.personId, question.person_id, question.theorist_names, question.related_people]),
    events: unique([question.event_ids, question.related_events]),
    methods: unique([question.method_id, object(question.guidance_basis).method_id]),
    stories: unique([question.related_stories]),
    story_ids: unique([question.story_ids, question.storyIds]),
    theory_focus: unique([question.theory_focus]),
    tags: unique([question.tags]),
    sources: normalizeSources(question.source || question.sources),
    claim_basis: text(question.claim_basis),
    source_note: text(question.source_note),
    trivia: normalizeNamedRows(question.trivia, "fun_fact", unitId),
    assessment: { correct, state: correct ? "mastered" : "needs_review" },
    reading: { state: "collected" }
  };
}

function splitUnit(unitValue: unknown): JsonObject[] {
  const unit = object(unitValue);
  const claims = claimCore.extractTextClaims(unit.text, { question: unit.question, answer: unit.answer });
  if (!claims.length) return [];
  const kind = claimCore.inferKind(unit);
  const currentId = text(unit.knowledge_unit_id || unit.unit_id || unit.id || "knowledge_unit");
  const explicitIds = unique([unit.knowledge_unit_ids, unit.knowledge_unit_id, unit.unit_id]);
  const sourceId = text(unit.source_question_id || currentId);
  return claims.map((claim, index) => {
    const next = { ...unit };
    delete next.question;
    delete next.answer;
    delete next.trivia;
    next.unit_id = explicitIds[index] || (claims.length === 1 ? currentId : `${currentId}::claim::${index + 1}`);
    next.knowledge_unit_id = next.unit_id;
    next.source_question_id = sourceId;
    next.kind = kind;
    next.topic = claimCore.cleanTopic(unit.topic, kind);
    next.text = claim;
    next.quality = { version: QUALITY_VERSION, source: "canonical_typescript_quiz_memory", split_from_question: claims.length > 1 };
    return next;
  });
}

function mergeAssessment(aValue: unknown, bValue: unknown): JsonObject {
  const a = object(aValue);
  const b = object(bValue);
  const mastered = a.state === "mastered" || b.state === "mastered" || a.correct === true || b.correct === true;
  return { ...a, ...b, correct: mastered, state: mastered ? "mastered" : text(a.state || b.state || "needs_review") };
}

function dedupeUnits(units: JsonObject[]): JsonObject[] {
  const rows = new Map<string, JsonObject>();
  for (const unit of units) {
    const key = claimCore.normalized(unit.text);
    if (!key) continue;
    const previous = rows.get(key);
    if (!previous) {
      rows.set(key, unit);
      continue;
    }
    for (const field of ["emne_ids", "concepts", "concept_focus", "terms", "tags", "people", "events", "methods", "stories"]) {
      previous[field] = unique([previous[field], unit[field]]);
    }
    previous.sources = normalizeSources([previous.sources, unit.sources].flat());
    previous.assessment = mergeAssessment(previous.assessment, unit.assessment);
  }
  return Array.from(rows.values());
}

function sanitizeFunFacts(items: unknown, blocked: Set<string>): JsonObject[] {
  const output: JsonObject[] = [];
  array(items).forEach((item, itemIndex) => {
    claimCore.splitClaims(object(item).text || item).forEach((claim, claimIndex) => {
      const key = claimCore.normalized(claim);
      if (!key || blocked.has(key)) return;
      blocked.add(key);
      const raw = object(item);
      output.push({ ...raw, id: text(raw.id) || `fun_fact_${itemIndex + 1}_${claimIndex + 1}`, kind: "fun_fact", text: claim });
    });
  });
  return output;
}

function emptyMemory(): JsonObject {
  return {
    schema: SCHEMA,
    updated_at: null,
    bundles: {},
    indexes: { by_subject: {}, by_target: {}, by_emne: {}, by_concept: {}, mastered: [], needs_review: [] }
  };
}

function rebuildBundleIndexes(bundle: JsonObject): JsonObject {
  const units = array(bundle.knowledge_units);
  bundle.indexes = {
    ...object(bundle.indexes),
    emne_ids: unique(units.flatMap((unit) => array(unit.emne_ids))),
    concepts: unique(units.flatMap((unit) => array(unit.concepts))),
    concept_focus: unique(units.flatMap((unit) => array(unit.concept_focus))),
    terms: unique(units.flatMap((unit) => array(unit.terms))),
    people: unique(units.flatMap((unit) => array(unit.people))),
    events: unique(units.flatMap((unit) => array(unit.events))),
    methods: unique(units.flatMap((unit) => array(unit.methods))),
    stories: unique(units.flatMap((unit) => array(unit.stories)))
  };
  return bundle;
}

function sanitizeBundle(bundleValue: unknown): JsonObject {
  const bundle = object(bundleValue);
  if (!Object.keys(bundle).length) return bundle;
  const original = array(bundle.knowledge_units);
  const knowledgeUnits = dedupeUnits(original.flatMap(splitUnit));
  const blocked = new Set(knowledgeUnits.map((unit) => claimCore.normalized(unit.text)));
  return rebuildBundleIndexes({
    ...bundle,
    knowledge_units: knowledgeUnits,
    fun_facts: sanitizeFunFacts(bundle.fun_facts, blocked),
    content_quality: {
      version: QUALITY_VERSION,
      original_unit_count: original.length,
      precise_unit_count: knowledgeUnits.length,
      removed_or_merged_count: Math.max(0, original.length - knowledgeUnits.length),
      automatic_storage: true,
      canonical_builder: true,
      canonical_typescript_runtime: true
    }
  });
}

function buildQuizKnowledgeBundle(inputValue: unknown = {}): JsonObject {
  const input = object(inputValue);
  const setBlock = object(input.setBlock);
  const setData = object(input.setData);
  const questions = array(input.questions || setBlock.questions);
  const result = object(input.result);
  const correctKeys = buildCorrectQuestionKeys(result);
  const targetId = text(input.targetId || setData.targetId || questions[0]?.targetId || questions[0]?.placeId || questions[0]?.personId);
  const categoryId = text(input.categoryId || setData.categoryId || questions[0]?.categoryId || questions[0]?.category_id);
  const setId = text(input.setId || setBlock.set_id || result.setId || result.set_id || targetId);
  const top = collectTopLevelMaterial(setData);
  const units = questions.map((question, index) => buildKnowledgeUnit(question, index, correctKeys, result, { targetId, categoryId, setId }));
  const unitTrivia = mergeNamedRows(...units.map((unit) => array<JsonObject>(unit.trivia)));
  const correctCount = Number.isFinite(Number(result.correct)) ? Number(result.correct) : units.filter((unit) => unit.assessment.correct).length;
  const total = Number.isFinite(Number(result.total)) ? Number(result.total) : units.length;
  const now = new Date().toISOString();
  return sanitizeBundle({
    schema: SCHEMA,
    bundle_id: stableId(targetId, setId),
    target_id: targetId,
    subject_id: categoryId,
    set_id: setId,
    set_title: text(setBlock.title || setBlock.name || setBlock.label),
    source_file: text(input.sourceFile),
    collected_at: now,
    updated_at: now,
    result: { correct: correctCount, total, percent: total > 0 ? Math.round((correctCount / total) * 100) : null },
    reading: { state: "collected", presented_at: null, read_at: null },
    knowledge_units: units,
    fun_facts: mergeNamedRows(top.funFacts, unitTrivia),
    stories: top.stories,
    people: top.people,
    events: top.events,
    institutions: top.institutions,
    artifacts: top.artifacts,
    building_stories: top.buildingStories,
    conflicts: top.conflicts
  });
}

export function createQuizKnowledgeMemory({ root, upsertEntry, normalizeSubjectId }: Dependencies) {
  const fetchCache = new Map<string, Promise<JsonObject>>();
  let pendingBundle: JsonObject | null = null;
  let summaryObserver: MutationObserver | null = null;

  function addIndex(index: JsonObject, keyValue: unknown, bundleId: string): void {
    const key = text(keyValue);
    if (!key) return;
    if (!Array.isArray(index[key])) index[key] = [];
    if (!index[key].includes(bundleId)) index[key].push(bundleId);
  }

  function rebuildIndexes(memory: JsonObject): JsonObject {
    const indexes = emptyMemory().indexes;
    for (const bundle of Object.values(object(memory.bundles)) as JsonObject[]) {
      const bundleId = text(bundle.bundle_id);
      addIndex(indexes.by_subject, bundle.subject_id, bundleId);
      addIndex(indexes.by_target, bundle.target_id, bundleId);
      array(bundle.indexes?.emne_ids).forEach((id) => addIndex(indexes.by_emne, id, bundleId));
      array(bundle.indexes?.concepts).forEach((id) => addIndex(indexes.by_concept, id, bundleId));
      array(bundle.knowledge_units).forEach((unit) => {
        const row = { bundle_id: bundleId, unit_id: unit.unit_id, target_id: bundle.target_id, subject_id: bundle.subject_id };
        if (unit.assessment?.state === "mastered") indexes.mastered.push(row);
        if (unit.assessment?.state === "needs_review") indexes.needs_review.push(row);
      });
    }
    memory.indexes = indexes;
    return memory;
  }

  function readMemory(): JsonObject {
    if (!root.localStorage) return emptyMemory();
    try {
      const parsed = JSON.parse(root.localStorage.getItem(STORAGE_KEY) || "null");
      if (!parsed || parsed.schema !== SCHEMA || !parsed.bundles) return emptyMemory();
      const next = { ...parsed, bundles: { ...parsed.bundles } };
      let changed = false;
      for (const [bundleId, bundle] of Object.entries(next.bundles)) {
        const clean = sanitizeBundle(bundle);
        next.bundles[bundleId] = clean;
        if (JSON.stringify(clean) !== JSON.stringify(bundle)) changed = true;
      }
      rebuildIndexes(next);
      if (changed) root.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    } catch {
      return emptyMemory();
    }
  }

  function sourceFor(bundle: JsonObject, extra: JsonObject = {}): JsonObject {
    return { type: "quiz_memory", target_id: text(bundle.target_id), quiz_id: text(bundle.set_id), source_file: text(bundle.source_file), ...extra };
  }

  function unitEntry(bundle: JsonObject, unit: JsonObject): JsonObject {
    const unitId = text(unit.unit_id || unit.id);
    const emneIds = unique([unit.emne_ids]);
    return {
      schema: "history_go_knowledge_entry_v2",
      version: 2,
      id: `quiz_memory::${text(bundle.bundle_id)}::${unitId}`,
      knowledge_unit_id: unitId,
      subject_id: normalizeSubjectId(bundle.subject_id),
      fagkart_category_id: normalizeSubjectId(bundle.subject_id),
      emne_ids: emneIds,
      concept_ids: unique([unit.concept_ids]),
      term_ids: unique([unit.term_ids]),
      story_ids: unique([unit.story_ids]),
      concepts: unique([unit.concepts, unit.concept_focus]),
      terms: unique([unit.terms]),
      tags: unique([unit.tags]),
      kind: text(unit.kind || "knowledge"),
      dimension: text(unit.dimension || unit.kind || "kunnskap"),
      topic: claimCore.cleanTopic(unit.topic || unit.question_family || unit.question_type, unit.kind),
      text: text(unit.text),
      source: sourceFor(bundle, { unit_id: unitId }),
      learned_at: bundle.collected_at || null,
      last_seen_at: bundle.updated_at || bundle.collected_at || null,
      times_seen: 1,
      link_status: emneIds.length ? "explicit_quiz_memory" : "quiz_memory_unresolved",
      memory_kind: text(unit.kind || "knowledge"),
      memory_evidence: {
        bundle_id: text(bundle.bundle_id),
        unit_id: unitId,
        reading_state: text(unit.reading?.state || bundle.reading?.state || "collected"),
        assessment_state: text(unit.assessment?.state),
        correct: unit.assessment?.correct === true
      }
    };
  }

  function materialEntry(bundle: JsonObject, item: JsonObject, kind: string, index: number): JsonObject {
    const itemId = text(item.id) || `${kind}_${index + 1}`;
    return {
      schema: "history_go_knowledge_entry_v2",
      version: 2,
      id: `quiz_memory::${text(bundle.bundle_id)}::${kind}::${itemId}`,
      subject_id: normalizeSubjectId(bundle.subject_id),
      fagkart_category_id: normalizeSubjectId(bundle.subject_id),
      emne_ids: [],
      concepts: [],
      terms: [],
      tags: unique([item.tags]),
      kind,
      dimension: kind,
      topic: text(item.title || humanize(kind) || "Kunnskap"),
      text: text(item.text),
      source: sourceFor(bundle, { material_id: itemId, material_kind: kind }),
      learned_at: bundle.collected_at || null,
      last_seen_at: bundle.updated_at || bundle.collected_at || null,
      times_seen: 1,
      link_status: "quiz_memory_material",
      memory_kind: kind,
      memory_evidence: { bundle_id: text(bundle.bundle_id), reading_state: text(bundle.reading?.state || "collected"), assessment_state: "not_assessed" }
    };
  }

  function bundleEntries(bundleValue: unknown): JsonObject[] {
    const bundle = object(bundleValue);
    const output = array<JsonObject>(bundle.knowledge_units).map((unit) => unitEntry(bundle, unit)).filter((entry) => entry.text);
    const groups: [string, unknown][] = [
      ["fun_fact", bundle.fun_facts], ["story", bundle.stories], ["building_story", bundle.building_stories], ["conflict", bundle.conflicts]
    ];
    for (const [kind, items] of groups) {
      array<JsonObject>(items).forEach((item, index) => {
        const entry = materialEntry(bundle, item, kind, index);
        if (entry.text) output.push(entry);
      });
    }
    return output;
  }

  function syncBundleEntries(bundle: JsonObject): JsonObject[] {
    return bundleEntries(bundle).map((entry) => upsertEntry(entry, { incrementSeen: false })).filter(Boolean) as JsonObject[];
  }

  function syncMemoryEntries(memory: JsonObject = readMemory()): { bundles: number; entries: number } {
    let entries = 0;
    const bundles = Object.values(object(memory.bundles)) as JsonObject[];
    bundles.forEach((bundle) => { entries += syncBundleEntries(bundle).length; });
    return { bundles: bundles.length, entries };
  }

  function saveBundle(bundleValue: unknown): JsonObject | null {
    const bundle = sanitizeBundle(bundleValue);
    if (!bundle.bundle_id) return null;
    const memory = readMemory();
    const previous = object(memory.bundles?.[bundle.bundle_id]);
    const saved = {
      ...previous,
      ...bundle,
      reading: { ...object(previous.reading), ...object(bundle.reading) },
      updated_at: new Date().toISOString()
    };
    memory.bundles[bundle.bundle_id] = saved;
    memory.updated_at = saved.updated_at;
    rebuildIndexes(memory);
    try { root.localStorage?.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch {}
    syncBundleEntries(saved);
    try { root.dispatchEvent?.(new CustomEvent("hg:knowledgeMemoryUpdated", { detail: { bundle_id: bundle.bundle_id } })); } catch {}
    return saved;
  }

  function updateReadingState(bundleIdValue: unknown, stateValue: unknown): JsonObject | null {
    const bundleId = text(bundleIdValue);
    const state = text(stateValue);
    const memory = readMemory();
    const bundle = memory.bundles?.[bundleId];
    if (!bundle) return null;
    const now = new Date().toISOString();
    bundle.reading ||= {};
    bundle.reading.state = state;
    if (state === "presented" && !bundle.reading.presented_at) bundle.reading.presented_at = now;
    if (state === "read") {
      bundle.reading.presented_at ||= now;
      bundle.reading.read_at = now;
    }
    array(bundle.knowledge_units).forEach((unit) => { unit.reading ||= {}; unit.reading.state = state; });
    bundle.updated_at = now;
    memory.updated_at = now;
    rebuildIndexes(memory);
    try { root.localStorage?.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch {}
    syncBundleEntries(bundle);
    return bundle;
  }


  function reviewQuestionIds(bundleValue: unknown): string[] {
    return unique(array<JsonObject>(object(bundleValue).knowledge_units)
      .filter((unit) => unit.assessment?.state === "needs_review")
      .map((unit) => unit.source_question_id || unit.unit_id));
  }

  function reviewCount(bundleValue: unknown): number {
    return array<JsonObject>(object(bundleValue).knowledge_units)
      .filter((unit) => unit.assessment?.state === "needs_review").length;
  }

  function applyReviewBundle(bundleIdValue: unknown, reviewedValue: unknown): JsonObject | null {
    const bundleId = text(bundleIdValue);
    const memory = readMemory();
    const existing = object(memory.bundles?.[bundleId]);
    if (!bundleId || !Object.keys(existing).length) return null;

    const reviewed = sanitizeBundle(reviewedValue);
    const reviewedByQuestion = new Map<string, JsonObject>();
    array<JsonObject>(reviewed.knowledge_units).forEach((unit) => {
      const questionId = text(unit.source_question_id || unit.unit_id);
      if (questionId && !reviewedByQuestion.has(questionId)) reviewedByQuestion.set(questionId, unit);
    });
    if (!reviewedByQuestion.size) return existing;

    const now = new Date().toISOString();
    const knowledgeUnits = array<JsonObject>(existing.knowledge_units).map((unit) => {
      const questionId = text(unit.source_question_id || unit.unit_id);
      const reviewedUnit = reviewedByQuestion.get(questionId);
      if (!reviewedUnit) return unit;
      const previousReview = object(unit.review);
      return {
        ...unit,
        assessment: { ...object(unit.assessment), ...object(reviewedUnit.assessment) },
        review: {
          attempt_count: Number(previousReview.attempt_count || 0) + 1,
          last_reviewed_at: now,
          last_result: text(reviewedUnit.assessment?.state),
          correct: reviewedUnit.assessment?.correct === true
        }
      };
    });

    const previousReview = object(existing.review);
    return saveBundle({
      ...existing,
      knowledge_units: knowledgeUnits,
      review: {
        attempt_count: Number(previousReview.attempt_count || 0) + 1,
        last_reviewed_at: now,
        correct: Number(reviewed.result?.correct || 0),
        total: Number(reviewed.result?.total || 0)
      },
      updated_at: now
    });
  }

  function startReview(bundleOrId: unknown): boolean {
    const memory = readMemory();
    const bundle = typeof bundleOrId === "string" ? object(memory.bundles?.[bundleOrId]) : object(bundleOrId);
    const questionIds = reviewQuestionIds(bundle);
    if (!bundle.bundle_id || !bundle.target_id || !bundle.set_id || !questionIds.length) return false;

    const request = {
      bundleId: text(bundle.bundle_id),
      targetId: text(bundle.target_id),
      setId: text(bundle.set_id),
      questionIds,
      requestedAt: new Date().toISOString()
    };

    closeKnowledgePopup();
    root.document?.getElementById("quizSummaryModal")?.remove();
    if (typeof root.QuizEngine?.startReview === "function") {
      void Promise.resolve(root.QuizEngine.startReview(request));
      return true;
    }

    try { root.localStorage?.setItem(REVIEW_REQUEST_KEY, JSON.stringify(request)); } catch { return false; }
    if (root.location) root.location.href = new URL("index.html", root.location.href).toString();
    return true;
  }

  function consumePendingReview(): boolean {
    if (typeof root.QuizEngine?.startReview !== "function") return false;
    let request: JsonObject = {};
    try { request = JSON.parse(root.localStorage?.getItem(REVIEW_REQUEST_KEY) || "null") || {}; } catch {}
    if (!request.targetId || !request.setId || !array(request.questionIds).length) return false;
    try { root.localStorage?.removeItem(REVIEW_REQUEST_KEY); } catch {}
    void Promise.resolve(root.QuizEngine.startReview(request));
    return true;
  }

  function memorySummary(memory: JsonObject = readMemory()): JsonObject {
    const bundles = Object.values(object(memory.bundles)) as JsonObject[];
    const units = bundles.flatMap((bundle) => array(bundle.knowledge_units));
    return {
      bundle_count: bundles.length,
      knowledge_unit_count: units.length,
      mastered_count: units.filter((unit) => unit.assessment?.state === "mastered").length,
      review_count: units.filter((unit) => unit.assessment?.state === "needs_review").length,
      read_bundle_count: bundles.filter((bundle) => bundle.reading?.state === "read").length,
      presented_bundle_count: bundles.filter((bundle) => bundle.reading?.state === "presented").length,
      fun_fact_count: bundles.reduce((sum, bundle) => sum + array(bundle.fun_facts).length, 0),
      story_count: bundles.reduce((sum, bundle) => sum + array(bundle.stories).length + array(bundle.building_stories).length, 0)
    };
  }

  function attachMemoryToProfile(profileValue: unknown, memory: JsonObject = readMemory()): JsonObject {
    const profile = object(profileValue);
    const bundles = Object.values(object(memory.bundles)) as JsonObject[];
    return {
      ...profile,
      quiz_memory: {
        schema: text(memory.schema || SCHEMA),
        summary: memorySummary(memory),
        bundles: bundles.slice().sort((a, b) => (Date.parse(b.updated_at || b.collected_at || 0) || 0) - (Date.parse(a.updated_at || a.collected_at || 0) || 0))
      }
    };
  }

  async function fetchJson(pathValue: unknown): Promise<JsonObject> {
    const url = new URL(text(pathValue), root.document?.baseURI || root.location?.href || "http://localhost/").toString();
    if (!fetchCache.has(url)) {
      fetchCache.set(url, root.fetch(url, { cache: "no-store" }).then((response: Response) => {
        if (!response.ok) throw new Error(`${response.status} ${url}`);
        return response.json();
      }));
    }
    return fetchCache.get(url)!;
  }

  async function resolveLegacyContext(detail: JsonObject, manifest: JsonObject, targetId: string): Promise<JsonObject> {
    for (const file of array<string>(manifest.files)) {
      const data = await fetchJson(file);
      if (!Array.isArray(data)) continue;
      const questions = data.filter((question: JsonObject) => text(question.targetId || question.placeId || question.personId) === targetId);
      if (questions.length) return { targetId, setId: text(detail.quizId || targetId), sourceFile: file, setData: null, setBlock: null, questions };
    }
    return { targetId, setId: text(detail.quizId || targetId), sourceFile: "", setData: null, setBlock: null, questions: [] };
  }

  async function resolveSetContext(detailValue: unknown): Promise<JsonObject> {
    const detail = object(detailValue);
    const targetId = text(detail.targetId || detail.placeId || text(detail.quizId).split("::")[0]);
    const compositeQuizId = text(detail.quizId);
    const setId = compositeQuizId.includes("::") ? compositeQuizId.split("::").slice(1).join("::") : "";
    const manifest = await fetchJson(MANIFEST_PATH);
    const entries = array<JsonObject>(manifest.sets);
    for (const entry of entries) {
      if (targetId && text(entry.targetId) !== targetId) continue;
      if (setId && entry.set_id && text(entry.set_id) !== setId) continue;
      const setData = await fetchJson(entry.file);
      const block = array<JsonObject>(setData.sets).find((item) => text(item.set_id) === (setId || text(entry.set_id)));
      if (block) return { targetId, setId: text(block.set_id), sourceFile: text(entry.file), setData, setBlock: block, questions: array(block.questions) };
    }
    return resolveLegacyContext(detail, manifest, targetId);
  }

  function latestResult(detailValue: unknown): JsonObject {
    const detail = object(detailValue);
    let rows: JsonObject[] = [];
    try { rows = JSON.parse(root.localStorage?.getItem("hg_learning_log_v1") || "[]"); } catch {}
    const quizId = text(detail.quizId);
    const targetId = text(detail.targetId || detail.placeId);
    const matching = rows.filter((row) => text(row.id) === quizId || text(row.targetId) === quizId || (targetId && text(row.parentTargetId) === targetId && (!quizId || quizId.endsWith(text(row.setId)))));
    const row = matching[matching.length - 1] || {};
    return {
      correct: Number.isFinite(Number(detail.correct)) ? Number(detail.correct) : Number(row.correctCount || 0),
      total: Number.isFinite(Number(detail.total)) ? Number(detail.total) : Number(row.total || 0),
      correctAnswers: array(row.correctAnswers),
      answers: array(row.answers),
      setId: text(row.setId),
      completed_at: row.date || null
    };
  }

  function renderChips(values: unknown[]): string {
    const list = unique(values).slice(0, 18);
    return list.length ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${list.map((item) => `<span style="border:1px solid rgba(255,255,255,.2);border-radius:999px;padding:4px 8px;font-size:.78rem">${escapeHtml(item)}</span>`).join("")}</div>` : "";
  }

  function knowledgePopupHtml(bundle: JsonObject): string {
    const units = array<JsonObject>(bundle.knowledge_units);
    const facts = array<JsonObject>(bundle.fun_facts);
    const stories = array<JsonObject>(bundle.stories);
    const mastered = units.filter((unit) => unit.assessment?.state === "mastered").length;
    const review = reviewCount(bundle);
    const unitHtml = units.map((unit) => `<article style="padding:11px 0;border-bottom:1px solid rgba(255,255,255,.12)"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><strong>${escapeHtml(unit.topic || unit.dimension || "Kunnskap")}</strong><small style="white-space:nowrap">${unit.assessment?.state === "mastered" ? "Mestret" : "Til repetisjon"}</small></div><p style="margin:6px 0 0;line-height:1.45">${escapeHtml(unit.text)}</p>${renderChips([unit.emne_ids, unit.concepts, unit.concept_focus, unit.terms])}</article>`).join("");
    const reviewAction = review > 0 ? `<div style="display:flex;justify-content:flex-end;margin:14px 0"><button class="ghost" id="quizKnowledgeMemoryReview" type="button">Gjenta feil (${review})</button></div>` : "";
    return `<div class="modal-body" style="max-height:min(86vh,900px);overflow:hidden"><div class="modal-head"><div><small class="muted">Knowledge-minnekammer</small><strong style="display:block">${escapeHtml(bundle.set_title || bundle.target_id || "Kunnskapen du samlet")}</strong></div><button class="ghost" id="quizKnowledgeMemoryClose">Lukk</button></div><div class="sheet-body" style="overflow:auto;max-height:68vh"><p class="muted" style="margin-top:0">${mastered} mestret • ${review} til repetisjon • ${units.length} kunnskapspunkter</p>${reviewAction}${unitHtml || "<p>Ingen strukturerte kunnskapspunkter ble funnet.</p>"}${facts.length ? `<section style="margin-top:18px"><h3>Funfacts og trivia</h3>${facts.map((row) => `<p>• ${escapeHtml(row.text)}</p>`).join("")}</section>` : ""}${stories.length ? `<section style="margin-top:18px"><h3>Historier</h3>${stories.map((row) => `<p>• ${escapeHtml(row.text)}</p>`).join("")}</section>` : ""}</div></div>`;
  }

  function closeKnowledgePopup(): void {
    root.document?.getElementById("quizKnowledgeMemoryModal")?.remove();
  }

  function openKnowledgePopup(bundleOrId: unknown): HTMLElement | null {
    if (!root.document) return null;
    const memory = readMemory();
    const bundle = typeof bundleOrId === "string" ? memory.bundles?.[bundleOrId] : object(bundleOrId);
    if (!bundle) return null;
    closeKnowledgePopup();
    const modal = root.document.createElement("div");
    modal.id = "quizKnowledgeMemoryModal";
    modal.className = "modal";
    modal.style.display = "flex";
    modal.innerHTML = knowledgePopupHtml(bundle);
    root.document.body.appendChild(modal);
    updateReadingState(bundle.bundle_id, "presented");
    const close = modal.querySelector<HTMLElement>("#quizKnowledgeMemoryClose");
    if (close) close.onclick = closeKnowledgePopup;
    const reviewButton = modal.querySelector<HTMLElement>("#quizKnowledgeMemoryReview");
    if (reviewButton) reviewButton.onclick = () => { startReview(bundle.bundle_id); };
    modal.addEventListener("click", (event: MouseEvent) => { if (event.target === modal) closeKnowledgePopup(); });
    return modal;
  }

  function attachBundleToSummary(bundleValue: unknown): boolean {
    const bundle = object(bundleValue);
    const modal = root.document?.getElementById("quizSummaryModal");
    const primary = modal?.querySelector<HTMLElement>("#quizSummaryPrimary");
    const actions = primary?.parentElement;
    if (!modal || !actions || !bundle.bundle_id) return false;
    let button = modal.querySelector<HTMLButtonElement>("#quizSummaryKnowledge");
    if (!button) {
      button = root.document.createElement("button");
      button.id = "quizSummaryKnowledge";
      button.className = "ghost";
      actions.insertBefore(button, primary);
    }
    button.textContent = `Kunnskapen du samlet (${array(bundle.knowledge_units).length})`;
    button.onclick = () => { openKnowledgePopup(bundle.bundle_id); };

    const review = reviewCount(bundle);
    let reviewButton = modal.querySelector<HTMLButtonElement>("#quizSummaryReview");
    if (review > 0) {
      if (!reviewButton) {
        reviewButton = root.document.createElement("button");
        reviewButton.id = "quizSummaryReview";
        reviewButton.className = "ghost";
        actions.insertBefore(reviewButton, primary);
      }
      reviewButton.textContent = `Gjenta feil (${review})`;
      reviewButton.onclick = () => { startReview(bundle.bundle_id); };
    } else {
      reviewButton?.remove();
    }

    const meta = modal.querySelector("#quizSummaryMeta");
    if (meta && !modal.querySelector("#quizSummaryKnowledgeLine")) {
      const line = root.document.createElement("div");
      line.id = "quizSummaryKnowledgeLine";
      line.className = "muted";
      line.style.margin = "-6px 0 14px";
      line.textContent = `${array(bundle.knowledge_units).length} kunnskapspunkter er automatisk lagt til i Knowledge.`;
      meta.insertAdjacentElement("afterend", line);
    }
    return true;
  }

  function watchForSummary(): void {
    if (!root.document || summaryObserver) return;
    summaryObserver = new MutationObserver(() => {
      if (pendingBundle && attachBundleToSummary(pendingBundle)) pendingBundle = null;
    });
    summaryObserver.observe(root.document.documentElement, { childList: true, subtree: true });
  }

  async function captureCompletion(detailValue: unknown = {}): Promise<JsonObject | null> {
    try {
      const detail = object(detailValue);
      const context = await resolveSetContext(detail);
      const result = latestResult(detail);
      const bundle = buildQuizKnowledgeBundle({
        targetId: context.targetId,
        categoryId: text(detail.categoryId || detail.domain || context.setData?.categoryId),
        setId: context.setId,
        sourceFile: context.sourceFile,
        setData: context.setData,
        setBlock: context.setBlock,
        questions: context.questions,
        result
      });
      const saved = saveBundle(bundle);
      pendingBundle = saved;
      if (saved && attachBundleToSummary(saved)) pendingBundle = null;
      return saved;
    } catch (error) {
      if (root.DEBUG) console.warn("[HGKnowledgeV2.quizMemory] capture failed", error, detailValue);
      return null;
    }
  }


  async function captureReviewCompletion(detailValue: unknown = {}): Promise<JsonObject | null> {
    try {
      const detail = object(detailValue);
      const context = await resolveSetContext(detail);
      const questionIds = new Set(array(detail.questionIds).map(text).filter(Boolean));
      const questions = array<JsonObject>(context.questions).filter((question) => questionIds.has(text(question.quiz_id || question.quizId || question.id)));
      const reviewed = buildQuizKnowledgeBundle({
        targetId: context.targetId,
        categoryId: text(detail.categoryId || detail.domain || context.setData?.categoryId),
        setId: context.setId,
        sourceFile: context.sourceFile,
        setData: context.setData,
        setBlock: context.setBlock,
        questions,
        result: {
          correct: Number(detail.correct || 0),
          total: Number(detail.total || 0),
          correctAnswers: array(detail.correctAnswers),
          answers: array(detail.answers)
        }
      });
      const saved = applyReviewBundle(stableId(context.targetId, context.setId), reviewed);
      pendingBundle = saved;
      if (saved && attachBundleToSummary(saved)) pendingBundle = null;
      return saved;
    } catch (error) {
      if (root.DEBUG) console.warn("[HGKnowledgeV2.quizMemory] review capture failed", error, detailValue);
      return null;
    }
  }

  function renderOverview(profileValue: unknown): void {
    if (!root.document) return;
    const profile = object(profileValue);
    const content = root.document.getElementById("knowledgeContent");
    if (!content) return;
    let panel = root.document.getElementById("knowledgeMemoryOverview");
    if (!panel) {
      panel = root.document.createElement("section");
      panel.id = "knowledgeMemoryOverview";
      panel.className = "kv2-panel";
      panel.style.marginBottom = "18px";
      content.parentElement?.insertBefore(panel, content);
    }
    const memory = object(profile.quiz_memory);
    const summary = object(memory.summary);
    const selectedSubject = text(new URLSearchParams(root.location?.search || "").get("subject"));
    const bundles = array<JsonObject>(memory.bundles).filter((bundle) => !selectedSubject || text(bundle.subject_id) === selectedSubject).slice(0, 8);
    if (!Number(summary.bundle_count || 0)) {
      panel.innerHTML = `<div class="kv2-panel-head"><div><span class="kv2-eyebrow">Quiz-minnekammer</span><h2>Kunnskap fra fullførte quizzer</h2></div></div><p class="kv2-empty">Ingen kunnskapsbundle er samlet ennå.</p>`;
      return;
    }
    panel.innerHTML = `<div class="kv2-panel-head"><div><span class="kv2-eyebrow">Quiz-minnekammer</span><h2>Kunnskap samlet i quiz</h2></div><span class="kv2-panel-meta">Kunnskap, historier, funfacts og vurderingsevidens er separate roller i samme TypeScript-motor.</span></div><div class="kv2-summary" style="margin:0 0 16px"><article class="kv2-stat"><strong>${Number(summary.bundle_count || 0)}</strong><span>Quizforløp</span></article><article class="kv2-stat"><strong>${Number(summary.knowledge_unit_count || 0)}</strong><span>Kunnskapsenheter</span></article><article class="kv2-stat"><strong>${Number(summary.mastered_count || 0)}</strong><span>Mestret</span></article><article class="kv2-stat"><strong>${Number(summary.review_count || 0)}</strong><span>Til repetisjon</span></article></div>${bundles.length ? `<div class="kv2-recent-list">${bundles.map((bundle) => { const review = reviewCount(bundle); return `<article class="kv2-recent-item"><span class="kv2-recent-meta">${escapeHtml(root.HGKnowledgeV2?.SUBJECT_LABELS?.[bundle.subject_id] || bundle.subject_id)} · ${escapeHtml(bundle.reading?.state || "Samlet")}</span><button type="button" data-knowledge-bundle="${escapeHtml(bundle.bundle_id)}" style="appearance:none;border:0;background:none;color:inherit;padding:0;text-align:left;font:inherit;cursor:pointer;font-weight:700">${escapeHtml(bundle.set_title || humanize(bundle.target_id) || "Quizkunnskap")}</button><p>${Number(bundle.result?.correct || 0)} av ${Number(bundle.result?.total || 0)} riktig · ${array(bundle.knowledge_units).length} kunnskapspunkter</p>${review > 0 ? `<button type="button" class="ghost" data-knowledge-review="${escapeHtml(bundle.bundle_id)}">Gjenta feil (${review})</button>` : ""}</article>`; }).join("")}</div>` : ""}`;
    panel.querySelectorAll<HTMLElement>("[data-knowledge-bundle]").forEach((button) => {
      button.addEventListener("click", () => openKnowledgePopup(button.getAttribute("data-knowledge-bundle") || ""));
    });
    panel.querySelectorAll<HTMLElement>("[data-knowledge-review]").forEach((button) => {
      button.addEventListener("click", () => startReview(button.getAttribute("data-knowledge-review") || ""));
    });
  }

  function initBrowserIntegration(): void {
    if (!root.addEventListener || !root.document || !root.fetch || root.__HG_KNOWLEDGE_MEMORY_BROWSER_INTEGRATION__) return;
    root.__HG_KNOWLEDGE_MEMORY_BROWSER_INTEGRATION__ = true;
    watchForSummary();
    root.addEventListener("hg:quizCompleted", (event: CustomEvent) => { void captureCompletion(event.detail || {}); });
    root.addEventListener("hg:quizReviewCompleted", (event: CustomEvent) => { void captureReviewCompletion(event.detail || {}); });
    root.addEventListener("hg:appReady", () => { consumePendingReview(); });
  }

  return {
    STORAGE_KEY,
    SCHEMA,
    QUALITY_VERSION,
    buildQuizKnowledgeBundle,
    sanitizeBundle,
    readMemory,
    saveBundle,
    rebuildIndexes,
    updateReadingState,
    bundleEntries,
    syncBundleEntries,
    syncMemoryEntries,
    memorySummary,
    attachMemoryToProfile,
    reviewQuestionIds,
    reviewCount,
    applyReviewBundle,
    startReview,
    consumePendingReview,
    openKnowledgePopup,
    attachBundleToSummary,
    captureCompletion,
    captureReviewCompletion,
    renderOverview,
    initBrowserIntegration
  };
}

export default createQuizKnowledgeMemory;
