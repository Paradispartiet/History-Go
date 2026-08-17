import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapUnit1 } from '../scripts/audit-fagverk-vitenskap-unit1.mjs';

test('Vitenskap Unit 1 materialiserer readiness-låst første kapittel uten premature complete', () => {
  const report = auditVitenskapUnit1();
  assert.equal(report.status, 'pass');
  assert.equal(report.subject, 'vitenskap');
  assert.equal(report.chapterId, 'vitenskap-fra-observasjon-til-etterprovbar-kunnskap');
  assert.deepEqual(report.summary, {
    emneCount: 8,
    methodCount: 5,
    moduleCount: 3,
    sectionCount: 9,
    paragraphCount: 27,
    sourceCount: 10,
    claimCount: 18,
    workedExampleCount: 2,
    applicationTaskCount: 4,
    selfCheckCount: 6
  });
  assert.equal(report.gates.readinessUnitMatched, true);
  assert.equal(report.gates.canonicalEmnersAndMethodsResolved, true);
  assert.equal(report.gates.blockingCoverageGapsRemainOpen, true);
  assert.equal(report.gates.prematureCompleteBlocked, true);
  assert.equal(report.gates.technologyRemainsNested, true);
});

test('Vitenskap Unit 1 krever claimsporet og inspectable evidens', () => {
  const report = auditVitenskapUnit1();
  assert.equal(report.gates.paragraphClaimsResolved, true);
  assert.equal(report.gates.sourceLocatorsInspectable, true);
  assert.equal(report.summary.sourceCount, 10);
  assert.equal(report.summary.claimCount, 18);
});

test('Vitenskap Unit 1 blokkerer de tre sentrale kunnskapssnarveiene', () => {
  const report = auditVitenskapUnit1();
  assert.equal(report.gates.peerReviewTruthShortcutBlocked, true);
  assert.equal(report.gates.calibrationTraceabilityShortcutBlocked, true);
  assert.equal(report.gates.reproducibilityReplicationDistinctionPresent, true);
});
