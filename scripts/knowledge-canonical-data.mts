#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

type JsonObject = Record<string, any>;
type QuestionRow = {
  question: JsonObject;
  file: string;
  location: string;
  set: JsonObject | null;
  root: JsonObject | JsonObject[];
};
type EmneRow = {
  id: string;
  subjectId: string;
  title: string;
  concepts: string[];
  searchable: string[];
};
type Inference = { ids: string[]; method: string; confidence: number; evidence?: JsonObject };

const ROOT = process.cwd();
const QUIZ_MANIFEST = path.join(ROOT, 'data/quiz/manifest.json');
const FAG_MANIFEST = path.join(ROOT, 'data/fag/fag_manifest.json');
const KNOWLEDGE_ROOT = path.join(ROOT, 'data/knowledge');
const UNIT_REGISTRY_PATH = path.join(KNOWLEDGE_ROOT, 'knowledge_units.generated.json');
const CONCEPT_REGISTRY_PATH = path.join(KNOWLEDGE_ROOT, 'concepts.generated.json');
const TERM_REGISTRY_PATH = path.join(KNOWLEDGE_ROOT, 'terms.generated.json');
const STORY_REGISTRY_PATH = path.join(KNOWLEDGE_ROOT, 'stories.generated.json');
const BACKFILL_REPORT_PATH = path.join(ROOT, 'reports/knowledge-id-backfill.json');
const CONTRACT_REPORT_PATH = path.join(ROOT, 'reports/knowledge-contract-audit.json');
const LEGACY_REPORT_PATH = path.join(ROOT, 'reports/knowledge-universe-readers.json');
const REVIEW_QUEUE_PATH = path.join(KNOWLEDGE_ROOT, 'knowledge_emne_review_queue.generated.json');
const ID_PATTERN = {
  knowledge: /^ku_[a-z0-9_]+$/,
  concept: /^co_[a-z0-9_]+$/,
  term: /^term_[a-z0-9_]+$/,
  story: /^story_[a-z0-9_]+$/,
};
const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
const AUDIT_ONLY = process.argv.includes('--audit-only');
const LEGACY_ONLY = process.argv.includes('--legacy-only');

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
function clean(value: unknown): string { return String(value ?? '').trim(); }
function list(value: unknown): string[] {
  return Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
}
function unique(values: unknown[]): string[] {
  return [...new Set(values.flatMap((value) => Array.isArray(value) ? value : [value]).map(clean).filter(Boolean))];
}
function normalize(value: unknown): string {
  return clean(value).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function slug(value: unknown, max = 48): string {
  return normalize(value).replace(/\s+/g, '_').replace(/^_+|_+$/g, '').slice(0, max);
}
function digest(value: unknown, length = 12): string {
  return createHash('sha256').update(clean(value), 'utf8').digest('hex').slice(0, length);
}
function stableId(prefix: 'ku' | 'co' | 'term' | 'story', subjectId: string, value: unknown): string {
  const readable = slug(value, prefix === 'ku' ? 24 : 36) || 'item';
  return `${prefix}_${slug(subjectId, 24) || 'unknown'}_${readable}_${digest(`${subjectId}\0${normalize(value)}`, 10)}`;
}
function canonicalIdsForLabels(prefix: 'co' | 'term' | 'story', subject: string, labels: string[], explicitIds: string[]): string[] {
  const used = new Set<string>();
  const aligned = labels.map((label, index) => {
    const explicitId = explicitIds[index];
    const generatedId = stableId(prefix, subject, label);
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
function splitClaims(value: unknown): string[] {
  const source = clean(value).replace(/\s+/g, ' ');
  if (!source) return [];
  const protectedText = source
    .replace(/\b(bl|ca|dvs|dr|f\.eks|mfl|mr|nr|osv|prof|st)\./gi, (match) => match.replace('.', '∯'))
    .replace(/(\d)\.(\d)/g, '$1∯$2');
  return protectedText
    .split(/(?<=[.!?])\s+(?=[A-ZÆØÅ0-9])/)
    .map((part) => part.replaceAll('∯', '.').trim())
    .filter((part) => part.length >= 12 && !part.endsWith('?'));
}
function subjectId(question: JsonObject, rootValue: JsonObject | JsonObject[]): string {
  const rootObject: JsonObject = isObject(rootValue) ? rootValue : {};
  const raw = clean(question.fagkart_category_id || question.subject_id || question.categoryId || question.category || rootObject.categoryId || rootObject.subject_id);
  return raw === 'populaerkultur' ? 'popkultur' : raw;
}
function targetId(question: JsonObject, rootValue: JsonObject | JsonObject[]): string {
  const rootObject: JsonObject = isObject(rootValue) ? rootValue : {};
  return clean(question.targetId || question.placeId || question.personId || rootObject.targetId || rootObject.placeId || rootObject.personId);
}
function questionId(question: JsonObject, file: string, location: string): string {
  return clean(question.quiz_id || question.quizId || question.id || question.question_id) || `q_${digest(`${file}\0${location}\0${clean(question.question || question.text)}`, 16)}`;
}
function knowledgeText(question: JsonObject): string {
  const payload = isObject(question.knowledge_payload) ? question.knowledge_payload : {};
  return clean(question.canonical_claim || payload.canonical_claim || payload.summary || payload.explanation || question.knowledge || question.explanation);
}
function emneIds(question: JsonObject): string[] {
  return unique([question.emne_id, question.emne_ids, question.related_emner, question.related_emners, question.relatedEmner, question.relatedEmneIds]);
}
function conceptLabels(question: JsonObject): string[] {
  const legacyIdsAsLabels = unique([question.concept_ids, question.conceptIds]).filter((id) => !ID_PATTERN.concept.test(id));
  return unique([question.concepts, question.core_concepts, question.concept_focus, question.begreper, legacyIdsAsLabels]);
}
function conceptIds(question: JsonObject): string[] {
  return unique([question.concept_ids, question.conceptIds]).filter((id) => ID_PATTERN.concept.test(id));
}
function termLabels(question: JsonObject): string[] {
  const legacyIdsAsLabels = unique([question.term_ids, question.termIds]).filter((id) => !ID_PATTERN.term.test(id));
  return unique([question.terms, question.terminology, question.terminologi, question.faguttrykk, legacyIdsAsLabels]);
}
function termIds(question: JsonObject): string[] {
  return unique([question.term_ids, question.termIds]).filter((id) => ID_PATTERN.term.test(id));
}
function storyLabels(question: JsonObject): string[] {
  const legacyIdsAsLabels = unique([question.story_ids, question.storyIds]).filter((id) => !ID_PATTERN.story.test(id));
  return unique([question.related_stories, question.stories, legacyIdsAsLabels]);
}
function storyIds(question: JsonObject): string[] {
  return unique([question.story_ids, question.storyIds]).filter((id) => ID_PATTERN.story.test(id));
}
function collectQuestions(data: JsonObject | JsonObject[], file: string): QuestionRow[] {
  const output: QuestionRow[] = [];
  if (Array.isArray(data)) {
    data.forEach((question, index) => { if (isObject(question)) output.push({ question, file, location: `array[${index}]`, set: null, root: data }); });
    return output;
  }
  if (Array.isArray(data.questions)) {
    data.questions.forEach((question: unknown, index: number) => { if (isObject(question)) output.push({ question, file, location: `questions[${index}]`, set: null, root: data }); });
  }
  if (Array.isArray(data.sets)) {
    data.sets.forEach((set: unknown, setIndex: number) => {
      if (!isObject(set) || !Array.isArray(set.questions)) return;
      set.questions.forEach((question: unknown, questionIndex: number) => {
        if (isObject(question)) output.push({ question, file, location: `sets[${setIndex}](${clean(set.set_id) || 'uten_id'}).questions[${questionIndex}]`, set, root: data });
      });
    });
  }
  return output;
}
function manifestFiles(manifest: JsonObject): string[] {
  return unique([
    ...(Array.isArray(manifest.files) ? manifest.files : []),
    ...(Array.isArray(manifest.sets) ? manifest.sets.map((entry: unknown) => isObject(entry) ? entry.file : '') : []),
  ]);
}
async function readJson<T = unknown>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
}
function jsonText(value: unknown): string { return `${JSON.stringify(value, null, 2)}\n`; }
async function writeOrCheck(filePath: string, value: unknown, changedFiles: string[]): Promise<void> {
  const next = jsonText(value);
  let previous = '';
  try { previous = await fs.readFile(filePath, 'utf8'); } catch {}
  if (previous === next) return;
  changedFiles.push(path.relative(ROOT, filePath).split(path.sep).join('/'));
  if (WRITE) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, next, 'utf8');
  }
}
function emneRowsFromData(data: unknown, subject: string): EmneRow[] {
  const rows = Array.isArray(data) ? data : (isObject(data) && Array.isArray(data.emner) ? data.emner : []);
  return rows.filter(isObject).map((row) => {
    const id = clean(row.emne_id || row.id);
    const title = clean(row.title || row.name || id);
    const concepts = unique([row.core_concepts, row.concepts, row.keywords]);
    const searchable = unique([title, row.description, row.summary, row.ingress, row.dimensions, concepts]).map(normalize).filter(Boolean);
    return { id, subjectId: subject, title, concepts, searchable };
  }).filter((row) => row.id);
}
async function loadEmner(): Promise<Map<string, EmneRow[]>> {
  const result = new Map<string, EmneRow[]>();
  const manifest = await readJson<JsonObject>(FAG_MANIFEST);
  for (const [subject, configValue] of Object.entries(manifest)) {
    const config = isObject(configValue) ? configValue : {};
    const relative = clean(config.emner);
    if (!relative) continue;
    try {
      const data = await readJson(path.join(ROOT, 'data/fag', relative));
      result.set(subject, emneRowsFromData(data, subject));
    } catch {}
  }
  return result;
}
function searchableQuestion(row: QuestionRow): string {
  const q = row.question;
  return normalize(unique([
    q.question, q.text, knowledgeText(q), q.topic, q.dimension, q.question_family, q.question_type,
    q.angle, q.tags, q.required_tags, conceptLabels(q), termLabels(q), row.set?.title, row.set?.name,
  ]).join(' '));
}
function inferEmne(row: QuestionRow, targetExplicit: Map<string, Set<string>>, setExplicit: Map<string, Set<string>>, catalogs: Map<string, EmneRow[]>): Inference {
  const q = row.question;
  const explicit = emneIds(q);
  if (explicit.length) return { ids: explicit, method: 'explicit', confidence: 1 };
  const subject = subjectId(q, row.root);
  const target = targetId(q, row.root);
  const setKey = `${row.file}::${clean(row.set?.set_id)}`;
  const fromSet = [...(setExplicit.get(setKey) || new Set())];
  if (fromSet.length === 1) return { ids: fromSet, method: 'single_explicit_emne_in_set', confidence: 0.98 };
  const fromTarget = [...(targetExplicit.get(`${subject}::${target}`) || new Set())];
  if (fromTarget.length === 1) return { ids: fromTarget, method: 'single_explicit_emne_for_target', confidence: 0.96 };

  const haystack = searchableQuestion(row);
  const candidates = (catalogs.get(subject) || []).map((emne) => {
    let score = 0;
    const matched: string[] = [];
    for (const phrase of emne.searchable) {
      if (!phrase || phrase.length < 3) continue;
      if (haystack.includes(phrase)) { score += phrase.includes(' ') ? 6 : 3; matched.push(phrase); continue; }
      for (const token of phrase.split(' ').filter((part) => part.length >= 5)) {
        if (haystack.includes(token)) score += 1;
      }
    }
    return { emne, score, matched };
  }).filter((candidate) => candidate.score > 0).sort((a, b) => b.score - a.score || a.emne.id.localeCompare(b.emne.id, 'nb'));
  if (!candidates.length) return { ids: [], method: 'unresolved', confidence: 0 };
  const [first, second] = candidates;
  const uniqueTop = first.score >= 6 && (!second || first.score >= second.score + 3);
  if (!uniqueTop) return { ids: [], method: 'unresolved', confidence: 0, evidence: { top: candidates.slice(0, 3).map((item) => ({ emne_id: item.emne.id, score: item.score })) } };
  return { ids: [first.emne.id], method: 'unique_lexical_emne_match', confidence: Math.min(0.94, 0.75 + first.score / 100), evidence: { score: first.score, matched: first.matched.slice(0, 6) } };
}
function inferUnitType(question: JsonObject, claim: string): string {
  const raw = normalize(question.unit_type || question.question_type || question.kind || question.dimension);
  const allowed = new Set(['definition','fact','process','cause_effect','relation','comparison','method','event','biography','place_reading','story_fragment','interpretation']);
  if (allowed.has(raw.replaceAll(' ', '_'))) return raw.replaceAll(' ', '_');
  if (/\b(hvorfor|fører til|derfor|årsak|virkning)\b/.test(normalize(`${question.question} ${claim}`))) return 'cause_effect';
  if (/\b(hvordan|prosess|utviklet|endret)\b/.test(normalize(`${question.question} ${claim}`))) return 'process';
  if (/\b(hvem|født|levde|forfatter|kunstner|arkitekt)\b/.test(normalize(question.question))) return 'biography';
  if (/\b(når|år|dato|åpnet|bygget|skjedde)\b/.test(normalize(question.question))) return 'fact';
  return 'fact';
}
function normalizeSources(row: QuestionRow, claim: string): JsonObject[] {
  const q = row.question;
  const raw = Array.isArray(q.sources) ? q.sources : (Array.isArray(q.source) ? q.source : q.source ? [q.source] : []);
  const result: JsonObject[] = [];
  for (const item of raw) {
    if (typeof item === 'string') {
      const title = clean(item);
      if (!title) continue;
      result.push({ source_id: `src_${digest(title, 16)}`, source_type: /^https?:\/\//i.test(title) ? 'web' : 'reference', title, ...( /^https?:\/\//i.test(title) ? { url: title } : {} ), claim_basis: clean(q.claim_basis || q.source_note) || 'Oppført som kilde i quizdata.' });
    } else if (isObject(item)) {
      const title = clean(item.title || item.name || item.label || item.url);
      if (!title) continue;
      const url = clean(item.url || item.href);
      result.push({ source_id: clean(item.source_id) || `src_${digest(`${title}\0${url}`, 16)}`, source_type: clean(item.source_type || item.type) || (url ? 'web' : 'reference'), title, ...(url ? { url } : {}), claim_basis: clean(item.claim_basis || item.role || item.note || q.claim_basis || q.source_note) || 'Oppført som kilde i quizdata.' });
    }
  }
  result.push({
    source_id: `src_quiz_${digest(`${row.file}\0${questionId(q, row.file, row.location)}`, 16)}`,
    source_type: 'history_go_quiz_source',
    title: `${row.file} · ${questionId(q, row.file, row.location)}`,
    claim_basis: result.length ? 'Quizleveranse som peker til registrerte kilder.' : `Migrert fra eksisterende quiztekst; ekstern faktakilde er ikke eksplisitt registrert for påstanden «${claim.slice(0, 120)}».`,
  });
  const seen = new Set<string>();
  return result.filter((source) => !seen.has(source.source_id) && seen.add(source.source_id));
}
function registrySourceStatus(sources: JsonObject[]): 'draft' | 'reviewed' | 'canonical' {
  return sources.some((source) => source.source_type !== 'history_go_quiz_source') ? 'reviewed' : 'draft';
}

async function runCanonicalPipeline(): Promise<{ changedFiles: string[]; report: JsonObject }> {
  const changedFiles: string[] = [];
  const quizManifest = await readJson<JsonObject>(QUIZ_MANIFEST);
  const files = manifestFiles(quizManifest);
  const fileData = new Map<string, JsonObject | JsonObject[]>();
  const rows: QuestionRow[] = [];
  for (const relative of files) {
    const full = path.resolve(ROOT, relative);
    const data = await readJson<JsonObject | JsonObject[]>(full);
    fileData.set(relative, data);
    rows.push(...collectQuestions(data, relative));
  }
  const catalogs = await loadEmner();
  const targetExplicit = new Map<string, Set<string>>();
  const setExplicit = new Map<string, Set<string>>();
  const addInferenceSignals = (row: QuestionRow, ids: string[]): void => {
    const subject = subjectId(row.question, row.root);
    const target = targetId(row.question, row.root);
    if (subject && target) {
      const key = `${subject}::${target}`;
      if (!targetExplicit.has(key)) targetExplicit.set(key, new Set());
      ids.forEach((id) => targetExplicit.get(key)!.add(id));
    }
    if (row.set) {
      const key = `${row.file}::${clean(row.set.set_id)}`;
      if (!setExplicit.has(key)) setExplicit.set(key, new Set());
      ids.forEach((id) => setExplicit.get(key)!.add(id));
    }
  };
  rows.forEach((row) => {
    const ids = emneIds(row.question);
    if (ids.length) addInferenceSignals(row, ids);
  });

  const plannedInference = new Map<QuestionRow, Inference>();
  for (let iteration = 0; iteration < rows.length; iteration += 1) {
    const additions = rows
      .filter((row) => knowledgeText(row.question))
      .filter((row) => !emneIds(row.question).length && !plannedInference.has(row))
      .map((row) => ({ row, inference: inferEmne(row, targetExplicit, setExplicit, catalogs) }))
      .filter((candidate) => candidate.inference.ids.length)
      .sort((a, b) => a.row.file.localeCompare(b.row.file, 'en') || a.row.location.localeCompare(b.row.location, 'en'));
    if (!additions.length) break;
    additions.forEach(({ row, inference }) => {
      plannedInference.set(row, inference);
      addInferenceSignals(row, inference.ids);
    });
  }

  const units = new Map<string, JsonObject>();
  const concepts = new Map<string, JsonObject>();
  const terms = new Map<string, JsonObject>();
  const stories = new Map<string, JsonObject>();
  const unresolved: JsonObject[] = [];
  let knowledgeQuestions = 0;
  let questionsChanged = 0;
  let inferredEmneLinks = 0;
  let generatedKnowledgeIds = 0;
  let generatedConceptIds = 0;
  let generatedTermIds = 0;
  let generatedStoryIds = 0;

  for (const row of rows) {
    const q = row.question;
    const text = knowledgeText(q);
    if (!text) continue;
    knowledgeQuestions += 1;
    const before = JSON.stringify(q);
    const subject = subjectId(q, row.root);
    const claims = splitClaims(text);
    const effectiveClaims = claims.length ? claims : [text];
    const existingEmneIds = emneIds(q);
    const inference = existingEmneIds.length
      ? { ids: existingEmneIds, method: 'explicit', confidence: 1 }
      : (plannedInference.get(row) || inferEmne(row, targetExplicit, setExplicit, catalogs));
    const eids = inference.ids;
    if (!existingEmneIds.length && eids.length) {
      q.emne_ids = eids;
      q.knowledge_link_evidence = { method: inference.method, confidence: inference.confidence, ...(inference.evidence || {}) };
    }
    const linkMethod = clean(q.knowledge_link_evidence?.method || inference.method);
    if (eids.length && linkMethod && linkMethod !== 'explicit') inferredEmneLinks += 1;

    const existingKnowledgeIds = unique([q.knowledge_unit_ids]).filter((id) => ID_PATTERN.knowledge.test(id));
    const generatedIds = effectiveClaims.map((claim) => stableId('ku', subject, claim));
    const kuIds = effectiveClaims.map((_, index) => existingKnowledgeIds[index] || generatedIds[index]);
    if (!clean(q.primary_knowledge_unit_id)) q.primary_knowledge_unit_id = kuIds[0];
    q.knowledge_unit_ids = unique([q.primary_knowledge_unit_id, kuIds]);
    generatedKnowledgeIds += generatedIds.filter((id) => !existingKnowledgeIds.includes(id)).length;

    const legacyConceptLabels = unique([q.concept_ids, q.conceptIds]).filter((id) => !ID_PATTERN.concept.test(id));
    if (legacyConceptLabels.length) q.concepts = unique([q.concepts, legacyConceptLabels]);
    const labels = conceptLabels(q);
    const existingCoIds = conceptIds(q);
    const canonicalCoIds = canonicalIdsForLabels('co', subject, labels, existingCoIds);
    q.concept_ids = canonicalCoIds;
    generatedConceptIds += canonicalCoIds.filter((id) => !existingCoIds.includes(id)).length;
    labels.forEach((label, index) => {
      const id = canonicalCoIds[index];
      if (!concepts.has(id)) concepts.set(id, { concept_id: id, subject_id: subject, label, status: 'generated_from_quiz_source' });
    });

    const legacyTermLabels = unique([q.term_ids, q.termIds]).filter((id) => !ID_PATTERN.term.test(id));
    if (legacyTermLabels.length) q.terms = unique([q.terms, legacyTermLabels]);
    const tLabels = termLabels(q);
    const existingTermIds = termIds(q);
    const canonicalTermIds = canonicalIdsForLabels('term', subject, tLabels, existingTermIds);
    q.term_ids = canonicalTermIds;
    generatedTermIds += canonicalTermIds.filter((id) => !existingTermIds.includes(id)).length;
    tLabels.forEach((label, index) => {
      const id = canonicalTermIds[index];
      if (!terms.has(id)) terms.set(id, { term_id: id, subject_id: subject, label, definition: '', status: 'definition_required' });
    });

    const legacyStoryLabels = unique([q.story_ids, q.storyIds]).filter((id) => !ID_PATTERN.story.test(id));
    if (legacyStoryLabels.length) q.related_stories = unique([q.related_stories, legacyStoryLabels]);
    const sLabels = storyLabels(q);
    const existingStoryIds = storyIds(q);
    const canonicalStoryIds = canonicalIdsForLabels('story', subject, sLabels, existingStoryIds);
    if (canonicalStoryIds.length) q.story_ids = canonicalStoryIds;
    generatedStoryIds += canonicalStoryIds.filter((id) => !existingStoryIds.includes(id)).length;
    sLabels.forEach((label, index) => {
      const id = canonicalStoryIds[index];
      if (!stories.has(id)) stories.set(id, { story_id: id, subject_id: subject, title: label, status: 'generated_reference' });
    });
    q.knowledge_contract_version = 1;

    effectiveClaims.forEach((claim, index) => {
      const id = kuIds[index];
      const sources = normalizeSources(row, claim);
      const status = eids.length ? registrySourceStatus(sources) : 'draft';
      const incoming: JsonObject = {
        schema: 'history_go_knowledge_unit_v1',
        version: 1,
        knowledge_unit_id: id,
        subject_id: subject,
        emne_ids: eids,
        unit_type: inferUnitType(q, claim),
        title: clean(q.topic || q.dimension || q.question || q.text || id).slice(0, 160),
        summary: claim,
        canonical_claim: claim,
        concept_ids: q.concept_ids,
        term_ids: q.term_ids,
        ...(q.story_ids?.length ? { story_ids: q.story_ids } : {}),
        delivery_surfaces: ['quiz', 'knowledge_page'],
        quiz_refs: [questionId(q, row.file, row.location)],
        sources,
        status,
      };
      const previous = units.get(id);
      if (!previous) units.set(id, incoming);
      else {
        if (normalize(previous.canonical_claim) !== normalize(claim)) throw new Error(`Knowledge ID collision: ${id} maps to different claims.`);
        previous.emne_ids = unique([previous.emne_ids, incoming.emne_ids]);
        previous.concept_ids = unique([previous.concept_ids, incoming.concept_ids]);
        previous.term_ids = unique([previous.term_ids, incoming.term_ids]);
        previous.story_ids = unique([previous.story_ids, incoming.story_ids]);
        previous.quiz_refs = unique([previous.quiz_refs, incoming.quiz_refs]);
        previous.sources = [...previous.sources, ...incoming.sources].filter((source: JsonObject, sourceIndex: number, all: JsonObject[]) => all.findIndex((candidate) => candidate.source_id === source.source_id) === sourceIndex);
        if (previous.status === 'draft' && incoming.status !== 'draft') previous.status = incoming.status;
      }
    });

    if (!eids.length) {
      q.knowledge_link_status = 'editorial_review_required';
      q.knowledge_link_evidence = { method: inference.method, confidence: inference.confidence, ...(inference.evidence || {}) };
      unresolved.push({ file: row.file, location: row.location, question_id: questionId(q, row.file, row.location), subject_id: subject, target_id: targetId(q, row.root), reason: 'missing_emne_link', inference });
    } else {
      q.knowledge_link_status = 'linked';
    }
    if (before !== JSON.stringify(q)) questionsChanged += 1;
  }

  for (const [relative, data] of fileData) await writeOrCheck(path.resolve(ROOT, relative), data, changedFiles);
  const unitList = [...units.values()].sort((a, b) => a.knowledge_unit_id.localeCompare(b.knowledge_unit_id, 'en'));
  const conceptList = [...concepts.values()].sort((a, b) => a.concept_id.localeCompare(b.concept_id, 'en'));
  const termList = [...terms.values()].sort((a, b) => a.term_id.localeCompare(b.term_id, 'en'));
  const storyList = [...stories.values()].sort((a, b) => a.story_id.localeCompare(b.story_id, 'en'));
  await writeOrCheck(UNIT_REGISTRY_PATH, { schema: 'history_go_knowledge_unit_registry_v1', version: 1, generated_by: 'scripts/knowledge-canonical-data.mts', units: unitList }, changedFiles);
  await writeOrCheck(CONCEPT_REGISTRY_PATH, { schema: 'history_go_concept_registry_v1', version: 1, generated_by: 'scripts/knowledge-canonical-data.mts', concepts: conceptList }, changedFiles);
  await writeOrCheck(TERM_REGISTRY_PATH, { schema: 'history_go_term_registry_v1', version: 1, generated_by: 'scripts/knowledge-canonical-data.mts', terms: termList }, changedFiles);
  await writeOrCheck(STORY_REGISTRY_PATH, { schema: 'history_go_story_registry_v1', version: 1, generated_by: 'scripts/knowledge-canonical-data.mts', stories: storyList }, changedFiles);
  await writeOrCheck(REVIEW_QUEUE_PATH, { schema: 'history_go_knowledge_emne_review_queue_v1', version: 1, policy: 'Do not infer ambiguous emne links automatically.', items: unresolved }, changedFiles);
  const report = {
    schema: 'history_go_knowledge_id_backfill_v1',
    manifest: 'data/quiz/manifest.json',
    files_scanned: files.length,
    knowledge_questions: knowledgeQuestions,
    questions_with_canonical_contract: rows.filter((row) => knowledgeText(row.question) && Number(row.question.knowledge_contract_version) === 1).length,
    canonical_units: unitList.length,
    concepts: conceptList.length,
    terms: termList.length,
    stories: storyList.length,
    inferred_emne_links: inferredEmneLinks,
    unresolved_emne_links: unresolved.length,
    canonical_id_counts: { knowledge: unitList.length, concepts: conceptList.length, terms: termList.length, stories: storyList.length },
    unresolved,
  };
  await writeOrCheck(BACKFILL_REPORT_PATH, report, changedFiles);
  return { changedFiles, report };
}

function refsFromQuestion(row: QuestionRow): JsonObject {
  const q = row.question;
  return {
    file: row.file,
    location: row.location,
    question_id: questionId(q, row.file, row.location),
    subject_id: subjectId(q, row.root),
    target_id: targetId(q, row.root),
    emne_ids: emneIds(q),
    knowledge_unit_ids: unique([q.primary_knowledge_unit_id, q.knowledge_unit_ids]),
    concept_ids: unique([q.concept_ids, q.conceptIds]),
    term_ids: unique([q.term_ids, q.termIds]),
    story_ids: unique([q.story_ids, q.storyIds]),
  };
}
async function runContractAudit(): Promise<JsonObject> {
  const manifest = await readJson<JsonObject>(QUIZ_MANIFEST);
  const files = manifestFiles(manifest);
  const unitRegistry = await readJson<JsonObject>(UNIT_REGISTRY_PATH).catch(() => ({ units: [] }));
  const conceptRegistry = await readJson<JsonObject>(CONCEPT_REGISTRY_PATH).catch(() => ({ concepts: [] }));
  const termRegistry = await readJson<JsonObject>(TERM_REGISTRY_PATH).catch(() => ({ terms: [] }));
  const storyRegistry = await readJson<JsonObject>(STORY_REGISTRY_PATH).catch(() => ({ stories: [] }));
  const unitIds = new Set((Array.isArray(unitRegistry.units) ? unitRegistry.units : []).map((row: JsonObject) => clean(row.knowledge_unit_id)));
  const coIds = new Set((Array.isArray(conceptRegistry.concepts) ? conceptRegistry.concepts : []).map((row: JsonObject) => clean(row.concept_id)));
  const tIds = new Set((Array.isArray(termRegistry.terms) ? termRegistry.terms : []).map((row: JsonObject) => clean(row.term_id)));
  const sIds = new Set((Array.isArray(storyRegistry.stories) ? storyRegistry.stories : []).map((row: JsonObject) => clean(row.story_id)));
  const failures: JsonObject[] = [];
  const warnings: JsonObject[] = [];
  let knowledgeQuestions = 0;
  for (const relative of files) {
    const data = await readJson<JsonObject | JsonObject[]>(path.resolve(ROOT, relative));
    for (const row of collectQuestions(data, relative)) {
      if (!knowledgeText(row.question)) continue;
      knowledgeQuestions += 1;
      const refs = refsFromQuestion(row);
      const errors: string[] = [];
      const notes: string[] = [];
      if (!refs.subject_id) errors.push('missing_subject');
      if (!refs.emne_ids.length) {
        if (clean(row.question.knowledge_link_status) === 'editorial_review_required') notes.push('editorial_emne_review_required');
        else errors.push('missing_emne_link');
      }
      if (!refs.knowledge_unit_ids.length) errors.push('missing_knowledge_unit_ids');
      refs.knowledge_unit_ids.forEach((id: string) => {
        if (!ID_PATTERN.knowledge.test(id)) errors.push(`invalid_knowledge_unit_id:${id}`);
        else if (!unitIds.has(id)) errors.push(`unknown_knowledge_unit_id:${id}`);
      });
      if (!refs.concept_ids.length) notes.push('missing_concept_ids');
      refs.concept_ids.forEach((id: string) => {
        if (!ID_PATTERN.concept.test(id)) errors.push(`invalid_concept_id:${id}`);
        else if (!coIds.has(id)) errors.push(`unknown_concept_id:${id}`);
      });
      refs.term_ids.forEach((id: string) => {
        if (!ID_PATTERN.term.test(id)) errors.push(`invalid_term_id:${id}`);
        else if (!tIds.has(id)) errors.push(`unknown_term_id:${id}`);
      });
      refs.story_ids.forEach((id: string) => {
        if (!ID_PATTERN.story.test(id)) errors.push(`invalid_story_id:${id}`);
        else if (!sIds.has(id)) errors.push(`unknown_story_id:${id}`);
      });
      if (errors.length) failures.push({ ...refs, errors });
      if (notes.length) warnings.push({ ...refs, warnings: notes });
    }
  }
  const report = {
    schema: 'history_go_knowledge_contract_audit_v2',
    manifest: 'data/quiz/manifest.json',
    files_scanned: files.length,
    knowledge_questions: knowledgeQuestions,
    questions_with_errors: failures.length,
    questions_with_warnings: warnings.length,
    summary: {
      missing_emne_link: failures.filter((row) => row.errors.includes('missing_emne_link')).length,
      missing_knowledge_unit_ids: failures.filter((row) => row.errors.includes('missing_knowledge_unit_ids')).length,
      invalid_or_unknown_ids: failures.filter((row) => row.errors.some((error: string) => error.includes('_id:'))).length,
      missing_concept_ids: warnings.filter((row) => row.warnings.includes('missing_concept_ids')).length,
      editorial_emne_review_required: warnings.filter((row) => row.warnings.includes('editorial_emne_review_required')).length,
    },
    failures,
    warnings,
  };
  await fs.mkdir(path.dirname(CONTRACT_REPORT_PATH), { recursive: true });
  await fs.writeFile(CONTRACT_REPORT_PATH, jsonText(report), 'utf8');
  return report;
}

async function walkFiles(directory: string): Promise<string[]> {
  const output: string[] = [];
  let entries: import('node:fs').Dirent[] = [];
  try { entries = await fs.readdir(directory, { withFileTypes: true }); } catch { return output; }
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walkFiles(full));
    else output.push(full);
  }
  return output;
}
async function runLegacyReaderAudit(): Promise<JsonObject> {
  const roots = ['js', 'AHA', 'knowledge', '.github/workflows', 'tests'].map((relative) => path.join(ROOT, relative));
  const candidates = (await Promise.all(roots.map(walkFiles))).flat().filter((file) => /\.(?:js|ts|mjs|mts|html|yml|yaml)$/.test(file));
  const allowed = new Set([
    'js/knowledgeV2.ts',
    'tests/knowledge-v2-model.test.js',
    'tests/knowledge-profile-memory-integration.test.js',
    'tests/knowledge-canonical-storage-contract.test.js',
    'scripts/knowledge-canonical-data.mts',
  ]);
  const references: JsonObject[] = [];
  for (const file of candidates) {
    const relative = path.relative(ROOT, file).split(path.sep).join('/');
    const lines = (await fs.readFile(file, 'utf8')).split(/\r?\n/);
    lines.forEach((line, index) => {
      if (!line.includes('knowledge_universe')) return;
      references.push({ file: relative, line: index + 1, allowed: allowed.has(relative), text: line.trim().slice(0, 240) });
    });
  }
  const active = references.filter((row) => !row.allowed);
  const report = { schema: 'history_go_legacy_knowledge_reader_audit_v1', references, active, ok: active.length === 0 };
  await fs.mkdir(path.dirname(LEGACY_REPORT_PATH), { recursive: true });
  await fs.writeFile(LEGACY_REPORT_PATH, jsonText(report), 'utf8');
  return report;
}

async function main(): Promise<void> {
  if (LEGACY_ONLY) {
    const legacy = await runLegacyReaderAudit();
    console.log(`Legacy Knowledge audit: ${legacy.active.length} active reference(s).`);
    if (!legacy.ok) process.exitCode = 1;
    return;
  }
  let pipeline: { changedFiles: string[]; report: JsonObject } | null = null;
  if (!AUDIT_ONLY) pipeline = await runCanonicalPipeline();
  const contract = await runContractAudit();
  const legacy = await runLegacyReaderAudit();
  if (pipeline) {
    console.log(`Knowledge canonical data: ${pipeline.report.knowledge_questions} questions, ${pipeline.report.canonical_units} units, ${pipeline.report.unresolved_emne_links} unresolved emne links.`);
    if (pipeline.changedFiles.length) console.log(`${WRITE ? 'Updated' : 'Drift'}: ${pipeline.changedFiles.join(', ')}`);
    if (CHECK && pipeline.changedFiles.length) process.exitCode = 1;
  }
  console.log(`Knowledge contract audit: ${contract.questions_with_errors} error question(s), ${contract.questions_with_warnings} warning question(s).`);
  console.log(`Legacy Knowledge audit: ${legacy.active.length} active reference(s).`);
  if (!legacy.ok || contract.questions_with_errors > 0) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error('Knowledge canonical data pipeline failed.');
  console.error(error);
  process.exit(1);
});
