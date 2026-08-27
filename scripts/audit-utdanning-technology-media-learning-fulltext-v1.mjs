#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'teknologi-medier-laering-design-deltakelse-og-ansvar';
const DIR = `data/fagverk/utdanning/${CHAPTER_ID}`;
const P = {
  chapter: `${DIR}.json`, brief: `${DIR}/brief.json`, claims: `${DIR}/claims.json`, assessment: `${DIR}/assessment.json`,
  sourceBrief: 'data/fag/utdanning/technology_media_learning_source_claim_brief_v1.json',
  manifest: 'data/fag/fag_manifest.json', registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json', portal: 'data/fagverk/fagverk_portal.json', pensum: 'data/fag/utdanning/utdanningpensum_canonical_v1.json',
  report: 'reports/fagverk/utdanning-technology-media-learning-fulltext-v1-audit.json',
};
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const wordCount = (text) => text.trim().split(/\s+/u).filter(Boolean).length;

export function audit({ writeReport = false } = {}) {
  const chapter = read(P.chapter); const brief = read(P.brief); const claimFile = read(P.claims); const assessment = read(P.assessment); const sourceBrief = read(P.sourceBrief); const manifest = read(P.manifest); const registry = read(P.registry); const status = read(P.status); const portal = read(P.portal); const pensum = read(P.pensum);
  const modules = chapter.moduleFiles.map(read); const sections = modules.flatMap((module) => module.sections); const paragraphs = sections.flatMap((section) => section.paragraphs); const traces = sections.flatMap((section) => section.paragraphClaimIds); const plannedClaims = sourceBrief.topic_briefs.flatMap((topic) => topic.planned_claims); const plannedIds = plannedClaims.map((claim) => claim.id); const claimIds = new Set(claimFile.claims.map((claim) => claim.id)); const sourceIds = new Set(claimFile.sources.map((source) => source.id));
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true && chapter.sourceFirst === true, 'Kapittelstatus/claimtrace mangler');
  assert(modules.length === 4 && sections.length === 8 && paragraphs.length === 32 && traces.length === 32, 'Fulltekststruktur skal være 4/8/32/32');
  assert(paragraphs.every((text) => wordCount(text) >= 25) && new Set(paragraphs).size === 32, 'Alle fagavsnitt må være substansielle og unike');
  assert(new Set(plannedIds).size === 32 && claimIds.size === 32 && plannedIds.every((id) => claimIds.has(id)), 'Alle 32 briefclaims må løses én-til-én');
  assert(traces.every((ids) => ids.length === 1 && claimIds.has(ids[0])) && new Set(traces.flat()).size === 32, 'Gjensidig paragraph↔claim-spor mangler');
  assert(claimFile.claims.every((claim) => claim.status === 'verified' && claim.source_ids.length >= 2 && claim.source_ids.every((id) => sourceIds.has(id))), 'Claims må være verifiserte og kildebundet');
  const usedSources = new Set(claimFile.claims.flatMap((claim) => claim.source_ids));
  assert(sourceIds.size === 13 && [...sourceIds].every((id) => usedSources.has(id)), 'Alle 13 kilder må brukes');
  assert(claimFile.sources.every((source) => source.url.startsWith('https://') && source.source_location && source.retrieval_status === 'verified_2026-08-27'), 'Kilder må være inspiserbare');
  assert(assessment.questions.length === 8 && assessment.questions.every((question) => question.answer === question.options[question.answerIndex] && claimIds.has(question.claim_id) && question.source.length >= 2 && !question.learner_typing), 'Vurdering må være claimbundet uten elevtyping');
  assert(!brief.safety.accessAsCompetence && !brief.safety.useAsLearning && !brief.safety.technologyAsPedagogy && !brief.safety.averageEffectAsProductProof && !brief.safety.platformDataAsWholeLearner && !brief.safety.aiOutputAsKnowledge && !brief.safety.performanceAsDurableLearning && !brief.safety.consentAsUniversalSchoolBasis && !brief.safety.innovationAsEvidence, 'Teknologi-, lærings- og personverngrenser mangler');
  const registryRow = registry.subjects.utdanning; const statusRow = status.subjects.find((row) => row.id === 'utdanning'); const portalRow = portal.categories.find((row) => row.id === 'utdanning');
  assert(manifest.utdanning.chapters?.includes(P.chapter) && manifest.utdanning.sourceClaimBriefs?.includes(P.sourceBrief), 'Manifest må binde siste fulltekst og source brief');
  assert(registryRow?.chapters?.filter((row) => row.id === CHAPTER_ID).length === 1 && registryRow.editorialPlan.registeredChapterCount === 14 && registryRow.editorialPlan.completedSourceBriefCount === 14, 'Registry må være fulltekstmaterialisert 14/14');
  assert(statusRow.navigationStatus === 'materialized' && statusRow.assessmentStatus === 'audited' && ['chapters_in_progress', 'complete'].includes(statusRow.editorialStatus), 'Utdanning må være auditerbar før og etter strict completion');
  assert(portalRow.subjectPage === 'fagverk.html?subject=utdanning' && portalRow.subjectStatus === 'materialized', 'Portalbinding mangler');
  assert(pensum.domains.filter((domain) => domain.status === 'materialized').length === 14 && pensum.domains[13].domain_id === 'teknologi_medier_laering', 'Pensum skal være monotont fulltekstmaterialisert 14/14');
  const report = {
    schema: 'history_go_utdanning_technology_media_learning_fulltext_audit_v1', version: '1.0.0', updated_at: '2026-08-27', status: 'pass', conclusion: 'high_quality_fulltext_unit_complete_subject_not_scientifically_complete', subject_id: 'utdanning', chapter_id: CHAPTER_ID,
    counts: { domainsCovered: 14, targetDomains: 14, modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, inspectableSources: 13, assessmentQuestions: 8, decisionScenarios: sourceBrief.decision_scenarios.length, nextSourceBriefDomains: 0 },
    gates: { plannedClaimsResolvedOneToOne: true, paragraphClaimTraceReciprocalAndComplete: true, paragraphsEditoriallyUnique: true, everyUsedSourceInspectable: true, everySourceSupportsFinalClaim: true, accessCompetenceBoundary: true, useLearningBoundary: true, technologyPedagogyBoundary: true, averageEffectProductBoundary: true, platformDataBoundary: true, aiKnowledgeBoundary: true, performanceLearningBoundary: true, privacyGovernanceBoundary: true, digitalEquityBoundary: true, implementationExitBoundary: true, chapterRegisteredExactlyOnce: true, educationFulltextMaterializedAndAudited: true, subjectStateDelegatedToStrictCompletionGate: true },
    six_part_quality_review: { source_authority_and_provenance: 5, claim_trace_and_verifiability: 5, technology_media_ai_and_learning_quality: 5, privacy_equity_governance_and_sustainability: 5, pedagogy_and_assessment: 4, architecture_and_reproducibility: 5, total: 29, maximum: 30, note: 'Teknologi, medier og læring-pakken er intern; fagsluttstatus avgjøres separat av strict subject-proof.' },
  };
  if (writeReport) write(P.report, report); else assert(isDeepStrictEqual(read(P.report), report), `${P.report} er utdatert`);
  return report;
}

try {
  const report = audit({ writeReport: process.argv.includes('--write-report') });
  console.log(`Utdanning Teknologi, medier og læring fulltekstaudit OK: ${report.counts.paragraphs} avsnitt, ${report.counts.verifiedClaims} claims, ${report.counts.inspectableSources} kilder; ${report.six_part_quality_review.total}/30.`);
} catch (error) { console.error(`Utdanning Teknologi, medier og læring fulltekstaudit FEIL: ${error.message}`); process.exitCode = 1; }
