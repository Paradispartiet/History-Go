import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapHolisticUniversityBreadthCompletion } from '../scripts/audit-fagverk-vitenskap-holistic-university-breadth-completion.mjs';

test('Vitenskap holistic audit er inventar- og fasekonsistent', () => {
  const report = auditVitenskapHolisticUniversityBreadthCompletion({ checkReport: false });
  assert.equal(report.canonicalInventory.domainCount, 6);
  assert.equal(report.canonicalInventory.emneCount, 117);
  assert.equal(report.canonicalInventory.methodCount, 84);
  assert.equal(report.canonicalInventory.mappingCount, 117);
  assert.equal(report.canonicalInventory.hookCount, 64);
  assert.equal(report.subject.completeReady, true);
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.equal(report.status, 'complete_and_holistically_audited');
});

test('Vitenskap kan ikke bli completion-eligible uten eksplisitt editorial treatment for canonicale emner', () => {
  const report = auditVitenskapHolisticUniversityBreadthCompletion({ checkReport: false });
  const covered = report.canonicalInventory.explicitChapterOwnedEmneCount;
  const uncovered = report.canonicalInventory.explicitUncoveredEmneCount;
  assert.equal(covered + uncovered, 117);
  assert.equal(report.gates.canonicalEmnersEditoriallyTreated, uncovered === 0);
  if (uncovered > 0) {
    assert.equal(report.gates.eligibleForCompletion, false);
    assert.equal(report.status, 'blocked');
    assert.ok(report.blockers.some((row) => row.id === 'canonical_emne_full_editorial_treatment_gap'));
  }
});

test('Vitenskap holistic audit måler legacy template-risk uten å omskrive baseline-kontrakten', () => {
  const report = auditVitenskapHolisticUniversityBreadthCompletion({ checkReport: false });
  assert.equal(report.canonicalInventory.legacyEmneCount, 93);
  assert.ok(report.canonicalInventory.oldGenericQuestionSetEmneCount >= 0);
  assert.ok(report.canonicalInventory.missingLegacyKeyQuestionEmneCount >= 0);
  assert.ok(report.canonicalInventory.largestLegacyQuestionTemplateReuse >= 1);
  assert.ok(report.canonicalInventory.uncoveredWithLegacyTemplateMetadata >= 0);
});

test('Vitenskap holistic audit krever ekte 27/30-review først etter materielle blockers', () => {
  const report = auditVitenskapHolisticUniversityBreadthCompletion({ checkReport: false });
  if (!report.gates.canonicalEmnersEditoriallyTreated) {
    assert.equal(report.qualityReview.status, 'deferred_until_material_blockers_close');
    assert.equal(report.qualityReview.passes, false);
    assert.equal(report.gates.fullSubjectQualityReviewPasses, false);
    assert.equal(report.gates.eligibleForCompletion, false);
  } else if (report.qualityReview.status === 'missing_required_review') {
    assert.equal(report.gates.eligibleForCompletion, false);
  } else {
    assert.ok(report.qualityReview.totalScore >= 27);
    assert.ok(Object.values(report.qualityReview.scores).every((score) => score >= 4));
  }
});

test('Vitenskap holistic audit bevarer claim/source-, metodegrense-, originalitets- og Teknologi-gates', () => {
  const report = auditVitenskapHolisticUniversityBreadthCompletion({ checkReport: false });
  assert.equal(report.gates.allClaimsResolveToInspectableSupportingSources, true);
  assert.equal(report.gates.methodsTeachLimitsAndUncertainty, true);
  assert.equal(report.gates.technologyRemainsNested, true);
  assert.equal(report.gates.gapOverlapAndFillerAuditClean, true);
  assert.equal(report.gates.crossChapterEditorialOriginalityPasses, true);
  assert.equal(report.gates.registryReleaseAndStatusStateConsistent, true);
  assert.equal(report.originality.exactDuplicateParagraphCount, 0);
  assert.ok(report.originality.maxCrossChapterFiveGramJaccard < report.originality.threshold);
});
