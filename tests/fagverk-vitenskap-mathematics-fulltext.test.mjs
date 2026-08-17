import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapMathematicsFulltext } from '../scripts/audit-fagverk-vitenskap-mathematics-fulltext.mjs';

test('Vitenskap Unit 2 materialiserer matematikkfamilien som andre kapittel', () => {
  const report = auditVitenskapMathematicsFulltext();
  assert.equal(report.status, 'pass');
  assert.equal(report.subject, 'vitenskap');
  assert.equal(report.chapterId, 'vitenskap-matematisk-bevis-struktur-og-modell');
  assert.deepEqual(report.summary, {
    emneCount: 5,
    methodCount: 6,
    moduleCount: 3,
    sectionCount: 9,
    paragraphCount: 27,
    sourceCount: 10,
    claimCount: 18,
    misconceptionCount: 4,
    workedExampleCount: 2,
    applicationTaskCount: 4,
    selfCheckCount: 6,
    registeredChapterCount: 3,
    remainingEditorialBlockerCount: 2
  });
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
