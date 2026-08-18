import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapNaturalScienceMedicineEnvironmentCoverage } from '../scripts/audit-fagverk-vitenskap-natural-science-medicine-environment-coverage.mjs';

test('Vitenskap natural science medicine environment coverage stays substantive and completion-blocked', () => {
  const report = auditVitenskapNaturalScienceMedicineEnvironmentCoverage({ writeReport: false, checkReport: true });
  assert.equal(report.status, 'pass');
  assert.equal(report.domain, 'natur_medisin_miljo');
  assert.equal(report.coverage.explicitTreatmentCount, 13);
  assert.equal(report.coverage.sectionCount, 7);
  assert.equal(report.coverage.paragraphCount, 21);
  assert.equal(report.coverage.newClaimCount, 13);
  assert.equal(report.coverage.newInspectableSourceCount, 8);
  assert.equal(report.coverage.holisticOwnedAfterBatch, 102);
  assert.equal(report.coverage.holisticUncoveredAfterBatch, 15);
  assert.equal(report.guards.subjectCompleteRemainsFalse, true);
  assert.equal(report.guards.allClaimsResolve, true);
  assert.equal(report.guards.natureBoundaryPreserved, true);
  assert.equal(report.guards.technologyRemainsNested, true);
  assert.equal(report.guards.qualityReviewDeferred, true);
});
