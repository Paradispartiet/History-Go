import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditNaeringslivArbeidProduksjonVerdiskapingChapter,
  hasCompleteClaimTrace
} from '../scripts/audit-naeringsliv-chapter-arbeid-produksjon-verdiskaping.mjs';

test('Arbeid, produksjon og verdiskaping dekker canonicalt domene med redigert og sporbart lærestoff', () => {
  const report = auditNaeringslivArbeidProduksjonVerdiskapingChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 9);
  assert.equal(report.summary.methodCount, 19);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.paragraphTraceCount, 27);
  assert.equal(report.summary.workedExampleCount, 2);
  assert.equal(report.summary.misconceptionCount, 5);
  assert.equal(report.summary.applicationTaskCount, 3);
  assert.equal(report.summary.selfCheckCount, 8);
  assert.equal(report.summary.relatedPlaceCount, 6);
  assert.equal(report.summary.sourceCount, 20);
  assert.equal(report.summary.claimCount, 40);
  assert.equal(report.summary.tracedClaimCount, 40);
});

test('claimspor krever minst én claim per tekstledd', () => {
  assert.equal(hasCompleteClaimTrace([['arbeid-01'], ['arbeid-02', 'arbeid-03']]), true);
  assert.equal(hasCompleteClaimTrace([['arbeid-01'], []]), false);
  assert.equal(hasCompleteClaimTrace([]), true);
});
