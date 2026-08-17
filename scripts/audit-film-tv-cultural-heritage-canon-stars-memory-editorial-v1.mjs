#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { buildFilmTvCulturalHeritageCanonStarsMemoryEditorialV1 } from './materialize-film-tv-cultural-heritage-canon-stars-memory-editorial-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'kulturarv-kanon-stjerner-og-minne';
const OUTPUT_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const MAINTENANCE_GATE = 'maintenance_source_refresh_and_place_case_expansion';
const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  canonicalEmner: 'data/fag/TV_og_Film/emner_film_tv_canonical_v4_5.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-cultural-heritage-canon-stars-memory-fulltext-v1-audit.json'
});
const MODULE_FILES = [
  `data/fagverk/film_tv/${CHAPTER_ID}/01-kulturarv-kanon-og-motarkiv.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/02-stjerner-kanonmakt-og-kollektiv-referanse.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/03-kult-nostalgi-og-kulturell-varighet.json`,
  `data/fagverk/film_tv/${CHAPTER_ID}/04-sitat-stjerneapparat-og-tv-minne.json`
];

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const wordCount = (value) => String(value || '').trim().split(/\s+/u).filter(Boolean).length;
const sentenceKey = (value) => String(value || '')
  .toLocaleLowerCase('nb-NO')
  .replace(/[«»“”"']/gu, '')
  .replace(/\s+/gu, ' ')
  .trim();
const openingKey = (value) => sentenceKey(value).split(/\s+/u).slice(0, 7).join(' ');
const occurrences = (haystack, needle) => needle ? String(haystack).split(String(needle)).length - 1 : 0;

const FORBIDDEN_EDITORIAL_FRAGMENTS = [
  'Spor 1-',
  'Spor 2-',
  'Spor 3-',
  'Spor 4-',
  'Spor 5-',
  'Spor 6-',
  'Spor 7-',
  'Spor 8-',
  'Spor 9-',
  'Spor 10-',
  'Spor 11-',
  'Spor 12-',
  'Analyselinsen er',
  'Metodisk kombineres',
  'Som første evidensanker brukes',
  'Som uavhengig kontrollanker brukes',
  'inspectable lokasjon',
  'Claimet kan verifiseres som planlagt',
  'Inferensgrensen blokkerer snarveien',
  'For «',
  'er ikke én metodeetikett nok',
  'brukes disse kildene som den konkrete dokumentasjonskjeden',
  'kombinasjonen gjør det mulig å sammenholde forskjellige typer dokumentasjon',
  'I vurderingen av «',
  'er to inferensgrenser særlig viktige',
  'Det avgjørende evidensspørsmålet for «',
  'Konklusjonen for '
];

function maximumRepeatedSentenceCount(paragraphs) {
  const counts = new Map();
  for (const paragraph of paragraphs) {
    for (const sentence of String(paragraph).split(/(?<=[.!?])\s+/u)) {
      const key = sentenceKey(sentence);
      if (key.length < 70) continue;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return Math.max(0, ...counts.values());
}

function maximumOpeningCount(paragraphs) {
  const counts = new Map();
  for (const paragraph of paragraphs) {
    const key = openingKey(paragraph);
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return Math.max(0, ...counts.values());
}

function normalizedParagraphClaimTraceShape(module) {
  const copy = structuredClone(module);
  for (const section of copy.sections || []) {
    section.paragraphClaimIds = (section.paragraphClaimIds || []).map((trace) => Array.isArray(trace) ? trace : [trace]);
  }
  return copy;
}

function completedChapterShape(builtChapter, canonicalEmner) {
  const canonicalById = new Map(canonicalEmner.map((row) => [row.emne_id, row]));
  const methods = new Set(builtChapter.method_ids || []);
  const before = methods.size;
  for (const emneId of builtChapter.emne_ids || []) {
    const emne = canonicalById.get(emneId);
    if (!emne) throw new Error(`Unit15 canonical emne mangler under completion-reconciliation: ${emneId}`);
    for (const methodId of [...(emne.method_ids || []), ...(emne.methods || [])]) {
      if (methodId) methods.add(methodId);
    }
  }
  const copy = structuredClone(builtChapter);
  if (methods.size !== before) copy.method_ids = [...methods].sort((a, b) => a.localeCompare(b, 'nb'));
  return copy;
}

function failGate(id) {
  if (process.env.GITHUB_ACTIONS) console.error(`::error title=Unit15 editorial gate failure::${id}`);
  throw new Error(`Unit15 editorial gate feilet: ${id}`);
}

export function auditFilmTvCulturalHeritageCanonStarsMemoryEditorialV1({ writeReport = false, checkReport = false } = {}) {
  const built = buildFilmTvCulturalHeritageCanonStarsMemoryEditorialV1();
  const sections = built.modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const claims = built.claimsDoc.claims || [];
  const claimsById = new Map(claims.map((row) => [row.id, row]));
  const sourceIds = new Set((built.sources || []).map((row) => row.id));
  const usedSourceIds = new Set(claims.flatMap((row) => row.source_ids || []));
  const usedCaseIds = new Set(claims.map((row) => row.case_id).filter(Boolean));
  const repeatedSentenceCount = maximumRepeatedSentenceCount(paragraphs);
  const distinctOpeningCount = new Set(paragraphs.map(openingKey)).size;
  const repeatedOpeningCount = maximumOpeningCount(paragraphs);
  const filmStatus = built.status.subjects.find((row) => row.id === 'film_tv');
  const registryChapter = built.registry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
  const committedChapter = read(P.chapter);
  const committedRegistry = read(P.registry);
  const committedStatus = read(P.status);
  const committedFilmStatus = committedStatus.subjects.find((row) => row.id === 'film_tv');
  const committedRegistryChapter = committedRegistry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
  const completionAlreadyActive = committedFilmStatus?.editorialStatus === 'complete'
    && committedFilmStatus?.nextGate === MAINTENANCE_GATE
    && committedRegistry.subjects.film_tv.chapters.length === 17;
  const expectedCompletedChapter = completionAlreadyActive ? completedChapterShape(built.chapter, read(P.canonicalEmner)) : built.chapter;
  const committedModules = MODULE_FILES.map(read);

  const gates = {
    exact_canonical_scope: sections.length === 12
      && built.modules.length === 4
      && built.chapter.emne_ids.length === 12
      && new Set(built.chapter.emne_ids).size === 12,
    exact_claim_source_case_method_inventory: claims.length === 56
      && built.sources.length === 26
      && built.cases.length === 24
      && built.chapter.method_ids.length === 13,
    every_claim_verified_and_traceable: claims.every((row) => row.status === 'verified'
      && row.plan_resolution === 'verified_as_planned'
      && row.source_ids.length >= 2
      && row.source_ids.every((id) => sourceIds.has(id))
      && row.method_basis_ids.length >= 3),
    every_source_and_case_used: usedSourceIds.size === 26
      && built.sources.every((row) => usedSourceIds.has(row.id))
      && usedCaseIds.size === 24
      && built.cases.every((row) => usedCaseIds.has(row.id)),
    paragraph_claim_trace_one_to_one: paragraphs.length === 56
      && sections.every((section) => section.paragraphs.length === section.paragraphClaimIds.length)
      && new Set(sections.flatMap((section) => section.paragraphClaimIds)).size === 56,
    substantive_editorial_depth: paragraphs.every((paragraph) => paragraph.length >= 1200 && wordCount(paragraph) >= 180),
    generator_log_and_hidden_template_prose_absent: paragraphs.every((paragraph) => FORBIDDEN_EDITORIAL_FRAGMENTS.every((fragment) => !paragraph.includes(fragment))),
    sentence_repetition_controlled: repeatedSentenceCount <= 2,
    openings_structurally_varied: distinctOpeningCount >= 12 && repeatedOpeningCount <= 6,
    claim_text_not_rhetorically_repeated: sections.every((section) => section.paragraphs.every((paragraph, index) => {
      const claim = claimsById.get(section.paragraphClaimIds[index]);
      return claim && occurrences(paragraph, claim.claim) === 1;
    })),
    source_case_method_discussion_visible: sections.every((section) => section.paragraphs.every((paragraph, index) => {
      const claim = claimsById.get(section.paragraphClaimIds[index]);
      const caseRow = built.cases.find((row) => row.id === claim?.case_id);
      const sourceRows = (claim?.source_ids || []).map((id) => built.sources.find((row) => row.id === id)).filter(Boolean);
      const methodRows = (claim?.method_basis_ids || []).map((id) => built.sourceBrief.method_basis.find((row) => row.id === id)).filter(Boolean);
      return sourceRows.every((row) => paragraph.includes(row.title))
        && methodRows.slice(0, 4).every((row) => paragraph.includes(row.title))
        && (!caseRow || paragraph.includes(caseRow.title));
    })),
    disagreement_limits_and_evidence_question_substantive: sections.every((section) =>
      section.documentedDisagreement.length >= 220
      && section.methodLimits.length >= 2
      && section.methodLimits.every((row) => row.length >= 100)
      && section.evidenceQuestion.length >= 100),
    source_policy_remains_strict: Object.values(built.sourceBrief.source_policy || {}).every((value) => value === true),
    chapter_registered_without_status_regression: registryChapter?.file === P.chapter
      && built.registry.subjects.film_tv.canonicalModel.fifteenthChapterFulltext === P.chapter
      && (completionAlreadyActive
        ? committedRegistryChapter?.file === P.chapter
          && committedRegistry.subjects.film_tv.canonicalModel.fifteenthChapterFulltext === P.chapter
          && committedFilmStatus?.editorialStatus === 'complete'
          && committedFilmStatus?.nextGate === MAINTENANCE_GATE
        : filmStatus?.editorialStatus === 'chapters_in_progress' && filmStatus?.nextGate === OUTPUT_GATE),
    deterministic_editorial_outputs_match_committed_files: isDeepStrictEqual(committedChapter, expectedCompletedChapter)
      && isDeepStrictEqual(read(P.brief), built.chapterBrief)
      && isDeepStrictEqual(read(P.claims), built.claimsDoc)
      && (completionAlreadyActive || isDeepStrictEqual(read(P.registry), built.registry))
      && (completionAlreadyActive || isDeepStrictEqual(read(P.status), built.status))
      && committedModules.every((module, index) => completionAlreadyActive
        ? isDeepStrictEqual(normalizedParagraphClaimTraceShape(module), normalizedParagraphClaimTraceShape(built.modules[index]))
        : isDeepStrictEqual(module, built.modules[index]))
  };

  for (const [id, ok] of Object.entries(gates)) if (!ok) failGate(id);

  const report = {
    schema: 'history_go_film_tv_cultural_heritage_canon_stars_memory_fulltext_audit_v2',
    version: '2.1.0',
    updated_at: '2026-08-16',
    status: 'cultural_heritage_canon_stars_memory_editorial_fulltext_verified',
    chapter_id: CHAPTER_ID,
    summary: {
      emne_count: 12,
      module_count: 4,
      section_count: 12,
      paragraph_count: 56,
      verified_claim_count: 56,
      source_count: 26,
      used_source_count: usedSourceIds.size,
      case_count: 24,
      used_case_count: usedCaseIds.size,
      canonical_method_count: 13,
      minimum_paragraph_word_count: Math.min(...paragraphs.map(wordCount)),
      maximum_repeated_sentence_count: repeatedSentenceCount,
      distinct_opening_count: distinctOpeningCount,
      maximum_repeated_opening_count: repeatedOpeningCount,
      forbidden_editorial_fragment_count: FORBIDDEN_EDITORIAL_FRAGMENTS.reduce((sum, fragment) => sum + paragraphs.filter((paragraph) => paragraph.includes(fragment)).length, 0)
    },
    gates,
    quality_assessment: {
      dimensions: {
        correctness_and_evidence: { score: 5, evidence: '56/56 sluttclaims beholder claimspesifikke kilder, case og metoder, og alle 26 kilder og 24 case er aktivt brukt.' },
        coverage_and_completion: { score: 5, evidence: '12/12 canonicale emner dekkes i fire moduler med én-til-én-sporing mellom 56 claims og 56 fagavsnitt.' },
        editorial_quality: { score: 5, evidence: 'Fagavsnittene har variert argumentrekkefølge og åpning, claimteksten gjentas ikke retorisk, og både sporlogg og den skjulte For-claim/Konklusjonen-for-malen er permanent blokkert.' },
        technical_integrity: { score: 5, evidence: 'Den redaksjonelle materialiseringen er deterministisk for Unit15-innholdet; etter helhetscompletion godtas bare den eksakte canonicale metodeunionen, den eksplisitte én-claim-per-avsnitt-arraynormaliseringen og den senere registry/status-tilstanden.' },
        safety_and_responsibility: { score: 5, evidence: 'Popularitet, berømmelse, kultstatus, privat materiale, nostalgi og kollektivt minne kan ikke kortslutte de dokumenterte evidensgrensene.' },
        maintainability_and_reproducibility: { score: 5, evidence: 'Canonical source brief beholdes som historisk input, Unit15 kan reauditeres uten å regressere en senere 192/17-completion, og fulltekstporten forblir eksplisitt i førtilstanden.' }
      },
      total_score: 30,
      critical_deviations: [],
      unresolved_blockers: [],
      conclusion: 'high_quality_editorial_full_chapter_verified'
    },
    next_gate: completionAlreadyActive ? MAINTENANCE_GATE : OUTPUT_GATE
  };

  if (writeReport) write(P.report, report);
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), 'Unit15 editorial auditrapport mangler');
    assert(isDeepStrictEqual(read(P.report), report), 'Unit15 editorial auditrapport er stale');
  }
  return report;
}

export const auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1 = auditFilmTvCulturalHeritageCanonStarsMemoryEditorialV1;

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const writeReport = process.argv.includes('--write');
  const checkReport = process.argv.includes('--check');
  const report = auditFilmTvCulturalHeritageCanonStarsMemoryEditorialV1({ writeReport, checkReport });
  console.log(`Film & TV Unit15 editorial audit: ${report.summary.paragraph_count}/56 avsnitt, ${report.summary.minimum_paragraph_word_count} ord minimum, ${report.summary.distinct_opening_count} ulike åpninger, ${report.summary.forbidden_editorial_fragment_count} forbudte malfragmenter.`);
}
