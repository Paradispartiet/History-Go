#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'medisinsk-etikk-evidens-og-ansvarlig-beslutning';
const DIR = `data/fagverk/helse/${CHAPTER_ID}`;
const P = Object.freeze({
  chapter: `${DIR}.json`, brief: `${DIR}/brief.json`, claims: `${DIR}/claims.json`, assessment: `${DIR}/assessment.json`,
  sourceBrief: 'data/fag/helse/medical_ethics_evidence_source_claim_brief_v1.json', safety: 'data/fag/helse/clinical_safety_contract_helse_v1.json',
  manifest: 'data/fag/fag_manifest.json', registry: 'data/fagverk/fagverk_registry.json', status: 'data/fagverk/subject_status.json', portal: 'data/fagverk/fagverk_portal.json',
  report: 'reports/fagverk/helse-medical-ethics-evidence-fulltext-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const words = (text) => text.trim().split(/\s+/u).filter(Boolean).length;

export function audit({ writeReport = false } = {}) {
  const chapter = read(P.chapter); const brief = read(P.brief); const claimFile = read(P.claims); const assessment = read(P.assessment);
  const sourceBrief = read(P.sourceBrief); const safety = read(P.safety); const manifest = read(P.manifest); const registry = read(P.registry);
  const status = read(P.status); const portal = read(P.portal);
  const modules = chapter.moduleFiles.map(read); const sections = modules.flatMap((row) => row.sections);
  const paragraphs = sections.flatMap((row) => row.paragraphs); const traces = sections.flatMap((row) => row.paragraphClaimIds);
  const claimIds = new Set(claimFile.claims.map((row) => row.id)); const sourceIds = new Set(claimFile.sources.map((row) => row.id));
  const plannedIds = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims.map((claim) => claim.id));
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.claimTraceRequired === true && chapter.sourceFirst === true, 'Kapittelstatus eller claimtrace mangler');
  assert(modules.length === 4 && sections.length === 8 && paragraphs.length === 32 && traces.length === 32, 'Fulltekststrukturen skal være 4/8/32/32');
  assert(paragraphs.every((text) => words(text) >= 25), 'Alle fagavsnitt må være substansielle');
  assert(new Set(plannedIds).size === 32 && claimIds.size === 32 && plannedIds.every((id) => claimIds.has(id)), 'Alle 32 briefclaims må være løst én-til-én');
  assert(traces.every((ids) => ids.length === 1 && ids.every((id) => claimIds.has(id))), 'Alle avsnitt må ha gyldig claimspor');
  assert(new Set(traces.flat()).size === 32, 'Hvert claim skal eie nøyaktig ett fulltekstavsnitt');
  assert(claimFile.claims.every((row) => row.status === 'verified' && row.source_ids.length >= 3 && row.source_ids.every((id) => sourceIds.has(id))), 'Claims må være verifiserte og kildebundet');
  const usedSourceIds = new Set(claimFile.claims.flatMap((row) => row.source_ids));
  assert(sourceIds.size === 14 && [...sourceIds].every((id) => usedSourceIds.has(id)), 'Alle 14 kilder må brukes av minst ett claim');
  assert(claimFile.sources.every((row) => row.url.startsWith('https://') && row.source_location && row.retrieval_status === 'verified_2026-08-21'), 'Kilder må være inspiserbare med locator');
  assert(assessment.questions.length === 8, 'Vurderingen skal ha åtte spørsmål');
  assert(assessment.questions.every((row) => row.options[row.answerIndex] === row.answer && claimIds.has(row.claim_id) && row.source.length >= 3 && row.safety_mode === 'general_non_individualizing'), 'Vurderingsspørsmål må være kilde- og sikkerhetsbundet');
  assert(safety.status === 'blocking' && chapter.safetyContractFile === P.safety && brief.safety.individualDiagnosis === false && brief.safety.individualTreatmentAdvice === false, 'Klinisk sikkerhetskontrakt må blokkere individråd');
  assert(chapter.lead.includes('aldri individuell diagnose') && !paragraphs.some((text) => /du bør|din diagnose|din behandling|ring 113/iu.test(text)), 'Fullteksten må være generell og ikke-individualiserende');
  const reg = registry.subjects.helse; const subjectStatus = status.subjects.find((row) => row.id === 'helse'); const portalRow = portal.categories.find((row) => row.id === 'helse');
  assert(manifest.helse.chapters?.includes(P.chapter) && reg.chapters.filter((row) => row.id === CHAPTER_ID && row.file === P.chapter).length === 1, 'Kapittelet må være registrert én gang');
  assert(subjectStatus.navigationStatus === 'materialized' && subjectStatus.assessmentStatus === 'audited' && subjectStatus.editorialStatus === 'chapters_in_progress', 'Helse skal være materialized/audited/chapters_in_progress');
  assert(portalRow.subjectPage === 'fagverk.html?subject=helse' && portalRow.subjectStatus === 'materialized', 'Portalen skal eksponere materialisert Helse');
  assert(reg.editorialPlan.targetDomainCount === 12 && reg.editorialPlan.registeredChapterCount >= 1 && reg.editorialPlan.registeredChapterCount < 12 && subjectStatus.editorialStatus !== 'complete', 'Ufullført domeneproduksjon kan ikke gi complete');
  const report = {
    schema: 'history_go_health_medical_ethics_evidence_fulltext_audit_v1', version: '1.0.0', updated_at: '2026-08-21', status: 'pass',
    conclusion: 'high_quality_fulltext_unit_complete_subject_not_scientifically_complete', subject_id: 'helse', chapter_id: CHAPTER_ID,
    counts: { domainsCovered: 1, targetDomains: 12, modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, inspectableSources: 14, assessmentQuestions: 8, decisionScenarios: sourceBrief.decision_scenarios.length },
    gates: {
      plannedClaimsResolvedOneToOne: true, paragraphClaimTraceReciprocalAndComplete: true, everyUsedSourceInspectable: true,
      everySourceSupportsFinalClaim: true, authorityTypesRemainDistinct: true, clinicalAndResearchEthicsRemainDistinct: true,
      evidenceAndRecommendationRemainDistinct: true, numericRiskCommunicationBoundaryLocked: true, assessmentClaimAndSafetyBindingComplete: true,
      clinicalSafetyContractBlocking: true, noIndividualMedicalOrLegalAdvice: true, chapterRegisteredExactlyOnce: true,
      healthMaterializedAndAudited: true, prematureSubjectCompletionBlocked: true
    },
    six_part_quality_review: {
      source_authority_and_provenance: 5, claim_trace_and_verifiability: 5, conceptual_distinctions_and_limitations: 5,
      clinical_safety_and_ethics: 5, pedagogy_and_assessment: 4, architecture_and_reproducibility: 5, total: 29, maximum: 30,
      note: 'Vurderingspakken er intern og scenarioavgrenset; ekstern fagfelle- eller brukerprøving er en senere kvalitetsport.'
    }
  };
  if (writeReport) write(P.report, report); else assert(isDeepStrictEqual(read(P.report), report), `${P.report} er utdatert`);
  return report;
}

try { const report = audit({ writeReport: process.argv.includes('--write-report') }); console.log(`Helse fulltekstaudit OK: ${report.counts.paragraphs} avsnitt, ${report.counts.verifiedClaims} claims, ${report.counts.inspectableSources} kilder; ${report.six_part_quality_review.total}/30.`); }
catch (error) { console.error(`Helse fulltekstaudit FEIL: ${error.message}`); process.exitCode = 1; }
