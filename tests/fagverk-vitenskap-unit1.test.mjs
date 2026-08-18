import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapUnit1 } from '../scripts/audit-fagverk-vitenskap-unit1.mjs';

test('Vitenskap Unit 1 bevares gjennom senere breadth-kapitler uten premature complete', () => {
  const report = auditVitenskapUnit1();
  assert.equal(report.status, 'pass');
  assert.equal(report.subject, 'vitenskap');
  assert.equal(report.chapterId, 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap');
  assert.ok(report.summary.emneCount >= 8);
  assert.ok(report.summary.methodCount >= 5);
  assert.ok(report.summary.moduleCount >= 3);
  assert.ok(report.summary.sectionCount >= 9);
  assert.ok(report.summary.paragraphCount >= 27);
  assert.ok(report.summary.sourceCount >= 10);
  assert.ok(report.summary.claimCount >= 18);
  assert.ok(report.summary.workedExampleCount >= 2);
  assert.ok(report.summary.applicationTaskCount >= 4);
  assert.ok(report.summary.selfCheckCount >= 6);
  assert.equal(report.gates.readinessUnitMatched, true);
  assert.equal(report.gates.canonicalEmnersAndMethodsResolved, true);
  assert.equal(report.gates.structuralCoverageGapsReconciled, true);
  assert.equal(report.gates.breadthProgressionMonotone, true);
  assert.equal(typeof report.gates.breadthEditorialBlockersRemainOpen, 'boolean');
  assert.equal(report.gates.prematureCompleteBlocked, true);
  assert.equal(report.gates.technologyRemainsNested, true);
  assert.equal(report.gates.originalCoreContractPreserved, true);
  assert.equal(report.gates.laterEditorialCoverageExtensionsAllowed, true);
});

test('Vitenskap Unit 1 krever claimsporet og inspectable evidens', () => {
  const report = auditVitenskapUnit1();
  assert.equal(report.gates.paragraphClaimsResolved, true);
  assert.equal(report.gates.sourceLocatorsInspectable, true);
  assert.ok(report.summary.sourceCount >= 10);
  assert.ok(report.summary.claimCount >= 18);
});

test('Vitenskap Unit 1 blokkerer de tre sentrale kunnskapssnarveiene', () => {
  const report = auditVitenskapUnit1();
  assert.equal(report.gates.peerReviewTruthShortcutBlocked, true);
  assert.equal(report.gates.calibrationTraceabilityShortcutBlocked, true);
  assert.equal(report.gates.reproducibilityReplicationDistinctionPresent, true);
});
