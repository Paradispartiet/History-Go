import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapDigitalScienceDataInfrastructureCoverage } from '../scripts/audit-fagverk-vitenskap-digital-science-data-infrastructure-coverage.mjs';

test('Vitenskap digital science/data batch has substantive canonical coverage', () => {
  const report = auditVitenskapDigitalScienceDataInfrastructureCoverage({ writeReport:false, checkReport:false });
  assert.equal(report.status,'pass');
  assert.equal(report.coverage.explicitTreatmentCount,11);
  assert.equal(report.coverage.sectionCount,6);
  assert.equal(report.coverage.paragraphCount,18);
  assert.equal(report.coverage.newClaimCount,11);
  assert.equal(report.coverage.newInspectableSourceCount,3);
});

test('Vitenskap digital science/data batch reduces only legitimate blockers', () => {
  const report = auditVitenskapDigitalScienceDataInfrastructureCoverage({ writeReport:false, checkReport:false });
  assert.equal(report.coverage.holisticOwnedAfterBatch,89);
  assert.equal(report.coverage.holisticUncoveredAfterBatch,28);
  assert.equal(report.guards.batchDidNotPrematurelyCompleteSubject,true);
  assert.equal(report.guards.qualityReviewDeferred,true);
});

test('Vitenskap digital science/data batch preserves evidence, originality and nested Teknologi', () => {
  const report = auditVitenskapDigitalScienceDataInfrastructureCoverage({ writeReport:false, checkReport:false });
  assert.equal(report.guards.allClaimsResolve,true);
  assert.equal(report.guards.fillerClean,true);
  assert.equal(report.guards.exactDuplicateParagraphCount,0);
  assert.equal(report.guards.technologyRemainsNested,true);
});
