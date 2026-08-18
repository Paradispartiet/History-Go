import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapParadigmsTheoriesTruthCoverage } from '../scripts/audit-fagverk-vitenskap-paradigms-theories-truth-coverage.mjs';

test('Vitenskap final paradigms/theories/truth coverage closes material blockers without pre-scoring completion', () => {
  const report = auditVitenskapParadigmsTheoriesTruthCoverage({ writeReport: false, checkReport: true });
  assert.equal(report.status, 'pass');
  assert.equal(report.domain, 'paradigmer_teorier_sannhet');
  assert.equal(report.coverage.explicitTreatmentCount, 15);
  assert.equal(report.coverage.sectionCount, 8);
  assert.equal(report.coverage.paragraphCount, 24);
  assert.equal(report.coverage.newClaimCount, 15);
  assert.equal(report.coverage.newInspectableSourceCount, 9);
  assert.equal(report.coverage.holisticOwnedAfterBatch, 117);
  assert.equal(report.coverage.holisticUncoveredAfterBatch, 0);
  assert.equal(report.transition.completeReady, false);
  assert.equal(report.transition.qualityReviewStatus, 'missing_required_review');
  assert.equal(report.transition.nextRequiredAction, 'separate_explicit_six_dimension_holistic_quality_review');
  assert.equal(report.guards.allClaimsResolve, true);
  assert.equal(report.guards.philosophyBoundaryPreserved, true);
  assert.equal(report.guards.qualityReviewNotPreScored, true);
  assert.equal(report.guards.subjectCompletionNotFlipped, true);
});
