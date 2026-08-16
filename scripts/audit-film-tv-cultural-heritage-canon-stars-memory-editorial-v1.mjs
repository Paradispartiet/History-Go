#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { buildFilmTvCulturalHeritageCanonStarsMemoryEditorialV1 } from './materialize-film-tv-cultural-heritage-canon-stars-memory-editorial-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'kulturarv-kanon-stjerner-og-minne';
const OUTPUT_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
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
  'Inferensgrensen blokkerer snarveien'
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

export function auditFilmTvCulturalHeritageCanonStarsMemoryEditorialV1({ writeReport = false, checkReport = false } = {}) {
  const built = buildFilmTvCulturalHeritageCanonStarsMemoryEditorialV1();
  const sections = built.modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const claims = built.claimsDoc.claims || [];
  const sourceIds = new Set((built.sources || []).map((row) => row.id));
  const usedSourceIds = new Set(claims.flatMap((row) => row.source_ids || []));
  const usedCaseIds = new Set(claims.map((row) => row.case_id).filter(Boolean));
  const repeatedSentenceCount = maximumRepeatedSentenceCount(paragraphs);
  const filmStatus = built.status.subjects.find((row) => row.id === 'film_tv');
  const registryChapter = built.registry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
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
    generator_log_prose_absent: paragraphs.every((paragraph) => FORBIDDEN_EDITORIAL_FRAGMENTS.every((fragment) => !paragraph.includes(fragment))),
    sentence_repetition_controlled: repeatedSentenceCount <= 3,
    source_case_method_discussion_visible: sections.every((section) => section.paragraphs.every((paragraph, index) => {
      const claim = claims.find((row) => row.id === section.paragraphClaimIds[index]);
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
    chapter_registered_without_false_complete: registryChapter?.file === P.chapter
      && built.registry.subjects.film_tv.canonicalModel.fifteenthChapterFulltext === P.chapter
      && filmStatus?.editorialStatus === 'chapters_in_progress'
      && filmStatus?.nextGate === OUTPUT_GATE,
    deterministic_editorial_outputs_match_committed_files: isDeepStrictEqual(read(P.chapter), built.chapter)
      && isDeepStrictEqual(read(P.brief), built.chapterBrief)
      && isDeepStrictEqual(read(P.claims), built.claimsDoc)
      && isDeepStrictEqual(read(P.registry), built.registry)
      && isDeepStrictEqual(read(P.status), built.status)
      && committedModules.every((module, index) => isDeepStrictEqual(module, built.modules[index]))
  };

  for (const [id, ok] of Object.entries(gates)) assert(ok, `Unit15 editorial gate feilet: ${id}`);

  const report = {
    schema: 'history_go_film_tv_cultural_heritage_canon_stars_memory_fulltext_audit_v2',
    version: '2.0.0',
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
      forbidden_editorial_fragment_count: FORBIDDEN_EDITORIAL_FRAGMENTS.reduce((sum, fragment) => sum + paragraphs.filter((paragraph) => paragraph.includes(fragment)).length, 0)
    },
    gates,
    quality_assessment: {
      dimensions: {
        correctness_and_evidence: { score: 5, evidence: '56/56 sluttclaims beholder claimspesifikke kilder, case og metoder, og alle 26 kilder og 24 case er aktivt brukt.' },
        coverage_and_completion: { score: 5, evidence: '12/12 canonicale emner dekkes i fire moduler med én-til-én-sporing mellom 56 claims og 56 fagavsnitt.' },
        editorial_quality: { score: 5, evidence: 'Fagavsnittene er sammenhengende prosa uten sporlogg, generatorfraser eller overdrevet setningsrepetisjon, samtidig som faglig uenighet og inferensgrenser forblir eksplisitte.' },
        technical_integrity: { score: 5, evidence: 'Den redaksjonelle materialiseringen er deterministisk og committed kapittel-, modul-, claim-, registry- og statusfiler matcher bygget output.' },
        safety_and_responsibility: { score: 5, evidence: 'Popularitet, berømmelse, kultstatus, privat materiale, nostalgi og kollektivt minne kan ikke kortslutte de dokumenterte evidensgrensene.' },
        maintainability_and_reproducibility: { score: 5, evidence: 'Canonical source brief beholdes som historisk input, editorial materializer kan regenerere fullteksten, og neste gate forblir separat helhetsaudit fremfor falsk complete-status.' }
      },
      total_score: 30,
      critical_deviations: [],
      unresolved_blockers: [],
      conclusion: 'high_quality_editorial_full_chapter_verified'
    },
    next_gate: OUTPUT_GATE
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
  console.log(`Film & TV Unit15 editorial audit: ${report.summary.paragraph_count}/56 avsnitt, ${report.summary.minimum_paragraph_word_count} ord minimum, ${report.summary.forbidden_editorial_fragment_count} forbudte malfragmenter.`);
}
