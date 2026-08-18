import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapHolisticQualityReview } from '../scripts/audit-fagverk-vitenskap-holistic-quality-review.mjs';

test('Vitenskap holistic quality review is evidence-based and completion-eligible without flipping readiness', () => {
  const report = auditVitenskapHolisticQualityReview({ writeReport: false, checkReport: true });
  assert.equal(report.status, 'pass');
  assert.equal(report.totalScore, 28);
  assert.equal(report.scores.correctness_evidence, 5);
  assert.equal(report.scores.coverage_completion, 5);
  assert.equal(report.scores.editorial_quality, 4);
  assert.equal(report.scores.technical_integrity, 5);
  assert.equal(report.scores.safety_responsibility, 5);
  assert.equal(report.scores.maintainability_auditability, 4);
  assert.equal(report.canonicalEvidence.ownedEmnes, 117);
  assert.equal(report.canonicalEvidence.uncoveredEmnes, 0);
  assert.equal(report.canonicalEvidence.exactDuplicateParagraphs, 0);
  assert.equal(report.canonicalEvidence.oldGenericQuestionSetEmnes, 89);
  assert.equal(report.canonicalEvidence.missingLegacyKeyQuestionEmnes, 4);
  assert.equal(report.transition.holisticStatus, 'eligible_for_completion');
  assert.equal(report.transition.qualityReviewStatus, 'pass');
  assert.equal(report.transition.eligibleForCompletion, true);
  assert.equal(report.transition.completeReadyStillFalse, true);
  assert.equal(report.nonBlockingDebtExplicit, true);
});
