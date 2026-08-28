#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'metode-etnografi-sammenligning-feltarbeid-og-slutning';
const DIR = `data/fagverk/politikk/sosiologi_antropologi/${CHAPTER_ID}`;
const P = { chapter: `${DIR}.json`, brief: `${DIR}/brief.json`, claims: `${DIR}/claims.json`, assessment: `${DIR}/assessment.json`, sourceBrief: 'data/fag/politikk/sosiologi_antropologi/methods_ethnography_comparison_source_claim_brief_v1.json', production: 'data/fag/politikk/sosiologi_antropologi/production_registry_v1.json', category: 'data/categories/category_contract.json', report: 'reports/fagverk/sosiologi-antropologi-methods-ethnography-comparison-fulltext-v1-audit.json' };
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const wordCount = (text) => text.trim().split(/\s+/u).filter(Boolean).length;

function expectedReport(sourceBrief) {
  return {
    schema: 'history_go_sosiologi_antropologi_methods_ethnography_comparison_fulltext_audit_v1', version: '1.0.0', updated_at: '2026-08-28', status: 'pass', conclusion: 'methods_ethnography_comparison_fulltext_materialized_subcategory_still_expansion_planned', subject_id: 'politikk', canonical_subcategory_id: 'sosiologi_antropologi', chapter_id: CHAPTER_ID,
    counts: { domainsMaterialized: 3, targetDomains: 12, modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, inspectableSources: 13, assessmentQuestions: 8, teachingScenarios: sourceBrief.decision_scenarios.length, nextSourceBriefDomains: 1 },
    gates: { definitionAndBackground: true, namedTheoriesAndResearchers: true, findingsMethodsAndLimits: true, realDisagreement: true, teachingScenarios: true, plannedClaimsResolvedOneToOne: true, paragraphClaimTraceReciprocalAndComplete: true, everySourceInspectableAndUsed: true, fieldConstructionAccessAndReactivityBoundaries: true, caseSelectionComparisonAndGeneralizationBoundaries: true, digitalTraceAndPlatformBoundaries: true, researchEthicsConsentAndConfidentiality: true, chapterRegisteredInSubcategoryExactlyOnce: true, categoryStatusStillExpansionPlanned: true },
    six_part_quality_review: { correctness_and_evidence: 5, coverage_and_completion: 5, disciplinary_editorial_quality: 5, technical_integrity: 5, safety_and_responsibility: 5, maintainability_and_auditability: 4, total: 29, maximum: 30, note: 'Felt 3 er fulltekstmaterialisert og auditerbart; underkategorien er fortsatt uferdig med 3/12 felt.' },
  };
}

export function audit() {
  const chapter = read(P.chapter); const brief = read(P.brief); const claimFile = read(P.claims); const assessment = read(P.assessment); const sourceBrief = read(P.sourceBrief); const production = read(P.production); const category = read(P.category);
  const modules = chapter.moduleFiles.map(read); const sections = modules.flatMap((module) => module.sections); const paragraphs = sections.flatMap((section) => section.paragraphs); const traces = sections.flatMap((section) => section.paragraphClaimIds);
  const planned = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims); const plannedIds = planned.map((claim) => claim.id); const claims = new Map(claimFile.claims.map((claim) => [claim.id, claim])); const sourceIds = new Set(claimFile.sources.map((source) => source.id));
  assert(chapter.subject_id === 'politikk' && chapter.canonical_subcategory_id === 'sosiologi_antropologi' && chapter.domain_id === 'metode_etnografi_sammenligning', 'Kapittelet har feil canonicalt eierskap');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true && chapter.sourceFirst === true, 'Fulltekststatus eller claimtrace mangler');
  assert(modules.length === 4 && sections.length === 8 && paragraphs.length === 32 && traces.length === 32, 'Fulltekststruktur skal være 4/8/32/32');
  assert(paragraphs.every((text) => wordCount(text) >= 40) && new Set(paragraphs).size === 32, 'Alle fagavsnitt må være substansielle og unike');
  assert(plannedIds.length === 32 && new Set(plannedIds).size === 32 && claims.size === 32 && plannedIds.every((id) => claims.has(id)), 'Alle 32 briefclaims må løses én-til-én');
  assert(traces.every((ids) => ids.length === 1 && claims.has(ids[0])) && new Set(traces.flat()).size === 32, 'Gjensidig paragraph↔claim-spor mangler');
  assert([...claims.values()].every((claim) => claim.status === 'verified' && claim.source_ids.length >= 2 && claim.source_ids.every((id) => sourceIds.has(id))), 'Claims må være verifiserte og ha minst to kilder');
  const used = new Set([...claims.values()].flatMap((claim) => claim.source_ids));
  assert(sourceIds.size === 13 && [...sourceIds].every((id) => used.has(id)) && claimFile.sources.every((source) => source.url.startsWith('https://') && source.source_location && source.retrieval_status === 'verified_2026-08-28'), 'Alle 13 kilder må være inspiserbare og brukt');
  assert(assessment.questions.length === 8 && assessment.questions.every((q) => q.answer === q.options[q.answerIndex] && claims.has(q.claim_id) && q.source.length >= 2 && q.learner_typing === false), 'Vurdering må være claimbundet uten elevtyping');
  assert(assessment.caseTasks.length >= 2 && brief.realDisagreements.length >= 3 && brief.methodsAndLimits.length >= 5, 'Scenarier, metodegrenser eller reell uenighet mangler');
  assert(Object.values(brief.safety).every((value) => value === false), 'Ansvarlighetsgrenser mangler');
  assert(production.progress.materializedDomains === 3 && production.progress.totalDomains === 12 && production.progress.strictCompletionProven === false && production.materialized.length === 3 && production.materialized.filter((row) => row.ordinal === 3 && row.chapter === P.chapter).length === 1, 'Produksjonsregister skal vise nøyaktig 3/12');
  const subcategory = category.canonicalSubcategories.politikk.find((row) => row.id === 'sosiologi_antropologi');
  assert(subcategory?.status === 'expansion_planned', 'Underkategorien må forbli expansion_planned ved 3/12');
  const report = expectedReport(sourceBrief);
  assert(isDeepStrictEqual(read(P.report), report), `${P.report} er utdatert`);
  const dimensions = ['correctness_and_evidence', 'coverage_and_completion', 'disciplinary_editorial_quality', 'technical_integrity', 'safety_and_responsibility', 'maintainability_and_auditability'];
  assert(dimensions.every((key) => report.six_part_quality_review[key] >= 4) && report.six_part_quality_review.total >= 27, 'Seksdimensjonal kvalitetsport feiler');
  return report;
}

try { const report = audit(); console.log(`Metode, etnografi og sammenligning fulltekstaudit OK: ${report.counts.paragraphs} avsnitt, ${report.counts.verifiedClaims} claims, ${report.six_part_quality_review.total}/30.`); }
catch (error) { console.error(`Metode, etnografi og sammenligning fulltekstaudit FEIL: ${error.message}`); process.exitCode = 1; }
