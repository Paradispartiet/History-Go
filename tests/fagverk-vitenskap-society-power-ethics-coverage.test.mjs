import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapSocietyPowerEthicsCoverage } from '../scripts/audit-fagverk-vitenskap-society-power-ethics-coverage.mjs';

test('Vitenskap society power ethics batch has substantive canonical coverage', () => {
  const report = auditVitenskapSocietyPowerEthicsCoverage({ writeReport: false, checkReport: false });
  assert.equal(report.status, 'pass');
  assert.equal(report.coverage.explicitTreatmentCount, 15);
  assert.equal(report.coverage.sectionCount, 7);
  assert.equal(report.coverage.paragraphCount, 21);
  assert.equal(report.coverage.newClaimCount, 15);
  assert.equal(report.coverage.newInspectableSourceCount, 10);
});

test('Vitenskap society power ethics batch reduces only legitimate holistic blockers', () => {
  const report = auditVitenskapSocietyPowerEthicsCoverage({ writeReport: false, checkReport: false });
  assert.equal(report.coverage.holisticOwnedAfterBatch, 78);
  assert.equal(report.coverage.holisticUncoveredAfterBatch, 39);
  assert.equal(report.guards.subjectCompleteRemainsFalse, true);
  assert.equal(report.guards.qualityReviewDeferred, true);
});

test('Vitenskap society power ethics batch preserves evidence and architecture guards', () => {
  const report = auditVitenskapSocietyPowerEthicsCoverage({ writeReport: false, checkReport: false });
  assert.equal(report.guards.allClaimsResolve, true);
  assert.equal(report.guards.fillerClean, true);
  assert.equal(report.guards.exactDuplicateParagraphCount, 0);
  assert.equal(report.guards.technologyRemainsNested, true);
});
