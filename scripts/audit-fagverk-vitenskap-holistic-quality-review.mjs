#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditVitenskapHolisticUniversityBreadthCompletion } from './audit-fagverk-vitenskap-holistic-university-breadth-completion.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  review: 'data/fag/vitenskap/vitenskap_holistic_quality_review_v1.json',
  medicine: 'data/fagverk/vitenskap/vitenskap-medisin-fra-mekanisme-til-folkehelse.json',
  society: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/06-samfunn-makt-etikk.json',
  report: 'reports/fagverk/vitenskap-holistic-quality-review-audit.json'
});
const DIMENSIONS = [
  'correctness_evidence',
  'coverage_completion',
  'editorial_quality',
  'technical_integrity',
  'safety_responsibility',
  'maintainability_auditability'
];
const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function auditVitenskapHolisticQualityReview({ writeReport = false, checkReport = true } = {}) {
  const readiness = read(P.readiness);
  const review = read(P.review);
  const medicine = read(P.medicine);
  const society = read(P.society);
  const holistic = auditVitenskapHolisticUniversityBreadthCompletion({ writeReport: false, checkReport: false });

  assert(review.schema === 'history_go_fagverk_vitenskap_holistic_quality_review_v1', 'Quality review har feil schema');
  assert(review.subject_id === 'vitenskap', 'Quality review har feil subject');
  assert(isDeepStrictEqual(review.dimensions, DIMENSIONS), 'Quality review har feil dimensjonsrekkefølge');
  assert(review.reviewed_against_main === '01668fd61a5e748b60067fff98f86d738e14b665', 'Quality review må være låst til canonical 117/0-baseline');
  const scores = review.scores || {};
  assert(DIMENSIONS.every((id) => Number.isInteger(scores[id]) && scores[id] >= 1 && scores[id] <= 5), 'Quality review har ugyldig score');
  const total = DIMENSIONS.reduce((sum, id) => sum + scores[id], 0);
  assert(review.total_score === total, 'Declared quality-review total matcher ikke dimensjonsscorene');
  assert(total >= readiness.quality_contract.minimum_total_score, 'Quality review er under minimum total score');
  assert(DIMENSIONS.every((id) => scores[id] >= readiness.quality_contract.minimum_dimension_score), 'Quality review har dimensjon under minimum');
  assert(review.decision === 'pass_for_completion_eligibility', 'Quality review må være eksplisitt completion-eligibility review');

  assert(holistic.subject.completeReady === false, 'Quality-review PR kan ikke flippe complete_ready');
  assert(holistic.status === 'eligible_for_completion', 'Bestått review skal gjøre holistic eligible_for_completion');
  assert(holistic.qualityReview.status === 'pass' && holistic.qualityReview.passes === true, 'Holistic audit må validere review som pass');
  assert(holistic.gates.eligibleForCompletion === true, 'Alle ti completion requirements må være grønne etter review');
  assert(holistic.blockers.length === 0, 'Bestått quality review skal fjerne siste holistic blocker');

  assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount === 117 && holistic.canonicalInventory.explicitUncoveredEmneCount === 0, 'Coverage score kan ikke bestå uten 117/117');
  assert(scores.coverage_completion === 5, '117/117 full editorial ownership skal være scoret som 5 i coverage_completion');
  assert(holistic.evidence.allClaimsResolve === true && holistic.chapters.totalClaimCount === 178 && holistic.chapters.totalSourceCount === 103, 'Correctness/evidence score mangler claim/source-integritet');
  assert(scores.correctness_evidence === 5, 'Correctness/evidence-score må samsvare med full claim/source-integritet');
  assert(holistic.evidence.methodsWithLimitsChapterCount === holistic.evidence.chapterCount, 'Alle kapitler må lære metodebegrensninger');

  assert(holistic.originality.exactDuplicateParagraphCount === 0, 'Editorial review kan ikke passere med duplikatavsnitt');
  assert(holistic.originality.maxCrossChapterFiveGramJaccard < holistic.originality.threshold, 'Editorial review bryter originality threshold');
  const hasLegacyQuestionDebt = holistic.canonicalInventory.oldGenericQuestionSetEmneCount > 0 || holistic.canonicalInventory.missingLegacyKeyQuestionEmneCount > 0;
  assert(hasLegacyQuestionDebt === true, 'Review forventer eksplisitt synlig legacy key-question-gjeld');
  assert(scores.editorial_quality === 4, 'Editorial quality skal ikke pyntes til 5 mens legacy key-question-gjeld står');
  assert(scores.maintainability_auditability === 4, 'Maintainability skal ikke pyntes til 5 mens legacy key-question-gjeld står');
  assert(review.residual_non_blocking_maintenance_items?.some((row) => row.id === 'legacy_key_question_metadata_refresh'), 'Review må registrere key-question-gjelden som maintenance item');

  assert(holistic.evidence.globalUniqueSectionIds === 87 && holistic.evidence.globalUniqueClaimIds === 178 && holistic.evidence.globalUniqueSourceIds === 103, 'Technical-integrity inventory har endret seg uten re-review');
  assert(holistic.completionRequirements.subject_status_and_release_artifacts_match_actual_materialized_content === true, 'Registry/release/status er ikke konsistent');
  assert(holistic.technology.passes === true && holistic.technology.topLevelSubject === false, 'Nested Teknologi må være grønn');
  assert(scores.technical_integrity === 5, 'Technical-integrity score må samsvare med grønne permanente porter');

  const medGuard = medicine.qualityGuard || {};
  for (const key of ['modelVsHumanClinicalEvidenceExplicit','biomarkerVsDiagnosisExplicit','analyticalVsClinicalValidationExplicit','relativeVsAbsoluteEffectExplicit','statisticalVsClinicalImportanceExplicit','benefitVsHarmsExplicit','associationVsCausationExplicit','confoundingAndBiasExplicit','noIndividualMedicalAdvice']) assert(medGuard[key] === true, `Safety review mangler medisinsk guard ${key}`);
  const societyGuard = society.qualityGuard || {};
  for (const key of ['noExpertAuthorityTruthShortcut','noFundingEqualsBiasShortcut','noUncertaintyEqualsIgnoranceShortcut','noStandardEqualsTruthShortcut','noDeficitModelCommunicationShortcut','philosophyBoundaryPreserved','politicsBoundaryPreserved']) assert(societyGuard[key] === true, `Safety review mangler samfunn/etikk-guard ${key}`);
  assert(scores.safety_responsibility === 5, 'Safety/responsibility score må samsvare med eksplisitte safety/ethics guards');

  const report = {
    schema: 'history_go_fagverk_vitenskap_holistic_quality_review_audit_v1',
    version: '1.0.0',
    status: 'pass',
    subject: 'vitenskap',
    reviewedAgainstMain: review.reviewed_against_main,
    totalScore: total,
    minimumTotalScore: readiness.quality_contract.minimum_total_score,
    minimumDimensionScore: readiness.quality_contract.minimum_dimension_score,
    scores,
    canonicalEvidence: {
      ownedEmnes: holistic.canonicalInventory.explicitChapterOwnedEmneCount,
      uncoveredEmnes: holistic.canonicalInventory.explicitUncoveredEmneCount,
      paragraphs: holistic.chapters.totalParagraphCount,
      claims: holistic.chapters.totalClaimCount,
      sources: holistic.chapters.totalSourceCount,
      exactDuplicateParagraphs: holistic.originality.exactDuplicateParagraphCount,
      maxCrossChapterFiveGramJaccard: holistic.originality.maxCrossChapterFiveGramJaccard,
      oldGenericQuestionSetEmnes: holistic.canonicalInventory.oldGenericQuestionSetEmneCount,
      missingLegacyKeyQuestionEmnes: holistic.canonicalInventory.missingLegacyKeyQuestionEmneCount
    },
    transition: {
      holisticStatus: holistic.status,
      qualityReviewStatus: holistic.qualityReview.status,
      eligibleForCompletion: holistic.gates.eligibleForCompletion,
      completeReadyStillFalse: holistic.subject.completeReady === false
    },
    nonBlockingDebtExplicit: true
  };
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), serialized);
  }
  if (checkReport && fs.existsSync(abs(P.report))) assert(fs.readFileSync(abs(P.report), 'utf8') === serialized, 'Quality-review audit report er stale');
  return report;
}

const args = new Set(process.argv.slice(2));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(auditVitenskapHolisticQualityReview({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') }), null, 2));
