import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapHolisticUniversityBreadthCompletion } from '../scripts/audit-fagverk-vitenskap-holistic-university-breadth-completion.mjs';

test('Vitenskap holistic audit beviser canonical bredde, evidens og redaksjonell integritet', () => {
  const report = auditVitenskapHolisticUniversityBreadthCompletion({ checkReport: false });
  assert.equal(report.gates.eligibleForCompletion, true);
  assert.equal(report.canonicalInventory.domainCount, 6);
  assert.equal(report.canonicalInventory.emneCount, 117);
  assert.equal(report.canonicalInventory.methodCount, 84);
  assert.equal(report.canonicalInventory.mappingCount, 117);
  assert.equal(report.canonicalInventory.hookCount, 64);
  assert.equal(report.chapters.count, 5);
  assert.equal(report.chapters.totals.sectionCount, 45);
  assert.equal(report.chapters.totals.paragraphCount, 135);
  assert.equal(report.evidence.reciprocalClaimTrace, true);
  assert.equal(report.evidence.inspectableSourceLocations, true);
  assert.equal(report.originality.exactDuplicateParagraphCount, 0);
  assert.ok(report.originality.maxCrossChapterFiveGramJaccard < report.originality.threshold);
});

test('Vitenskap holistic audit består alle ti readiness completion requirements', () => {
  const report = auditVitenskapHolisticUniversityBreadthCompletion({ checkReport: false });
  assert.equal(Object.keys(report.completionRequirements).length, 10);
  assert.ok(Object.values(report.completionRequirements).every(Boolean));
  assert.equal(report.gates.structuralCoverageGapsResolved, true);
  assert.equal(report.gates.neighborBoundariesResolvedWithoutDuplicateSubjectTruth, true);
  assert.equal(report.gates.canonicalEmnersEditoriallyTreated, true);
  assert.equal(report.gates.allClaimsResolveToInspectableSupportingSources, true);
  assert.equal(report.gates.methodsTeachLimitsAndUncertainty, true);
  assert.equal(report.gates.technologyRemainsNested, true);
  assert.equal(report.gates.gapOverlapAndFillerAuditClean, true);
  assert.equal(report.gates.crossChapterEditorialOriginalityPasses, true);
  assert.equal(report.gates.registryReleaseAndStatusStateConsistent, true);
});

test('Vitenskap holistic kvalitetsreview er minst 27/30 og ingen dimensjon under 4', () => {
  const report = auditVitenskapHolisticUniversityBreadthCompletion({ checkReport: false });
  assert.equal(report.qualityReview.totalScore, 29);
  assert.ok(Object.values(report.qualityReview.scores).every((score) => score >= 4));
  assert.equal(report.gates.fullSubjectQualityReviewPasses, true);
});

test('Vitenskap holistic audit er fase-monoton rundt separat completion-transition', () => {
  const report = auditVitenskapHolisticUniversityBreadthCompletion({ checkReport: false });
  assert.ok(['pending_final_audit', 'complete'].includes(report.subject.completionState));
  if (report.subject.completionState === 'pending_final_audit') {
    assert.equal(report.status, 'eligible_for_completion');
    assert.equal(report.subject.completeReady, false);
    assert.equal(report.subject.nextGate, 'final_holistic_university_breadth_completion_audit');
  } else {
    assert.equal(report.status, 'complete_and_holistically_audited');
    assert.equal(report.subject.completeReady, true);
    assert.equal(report.subject.editorialStatus, 'complete');
    assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  }
});
