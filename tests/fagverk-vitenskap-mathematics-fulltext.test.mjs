import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapMathematicsFulltext } from '../scripts/audit-fagverk-vitenskap-mathematics-fulltext.mjs';

test('Vitenskap Unit 2 bevarer matematikkfamilien som materialisert predecessor', () => {
  const report = auditVitenskapMathematicsFulltext();
  assert.equal(report.status, 'pass');
  assert.equal(report.subject, 'vitenskap');
  assert.equal(report.chapterId, 'vitenskap-matematisk-bevis-struktur-og-modell');
  assert.equal(report.summary.emneCount, 5);
  assert.equal(report.summary.methodCount, 6);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.sourceCount, 10);
  assert.equal(report.summary.claimCount, 18);
  assert.equal(report.summary.misconceptionCount, 4);
  assert.equal(report.summary.workedExampleCount, 2);
  assert.equal(report.summary.applicationTaskCount, 4);
  assert.equal(report.summary.selfCheckCount, 6);
  assert.ok(report.summary.registeredChapterCount >= 2);
  assert.ok(report.summary.remainingEditorialBlockerCount >= 0 && report.summary.remainingEditorialBlockerCount <= 3);
  assert.equal(report.gates.mathematicsChapterMaterializedAndRegistered, true);
  assert.equal(report.gates.mathematicsEditorialBlockerResolved, true);
  assert.equal(report.gates.remainingBreadthEditorialBlockersConsistent, true);
  assert.equal(report.gates.prematureCompleteBlocked, true);
});

test('Vitenskap Unit 2 fulltekst har reciprocal claim trace og bevarer kildeintegritet', () => {
  const report = auditVitenskapMathematicsFulltext();
  assert.equal(report.gates.claimTraceReciprocalAndComplete, true);
  assert.equal(report.gates.sourceClaimIntegrityPreserved, true);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 18);
  assert.equal(report.summary.sourceCount, 10);
});

test('Vitenskap Unit 2 holder formell gyldighet adskilt fra empirisk validering', () => {
  const report = auditVitenskapMathematicsFulltext();
  assert.equal(report.gates.formalEmpiricalBoundaryLocked, true);
  assert.equal(report.gates.technologyRemainsNested, true);
});
