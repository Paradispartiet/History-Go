import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaeringslivHandelForbrukMarkedChapter } from '../scripts/audit-naeringsliv-chapter-handel-forbruk-marked.mjs';

test('Handel, forbruk og marked dekker canonicalt domene med redigert og sporbart lærestoff', () => {
  const report = auditNaeringslivHandelForbrukMarkedChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 5);
  assert.equal(report.summary.methodCount, 11);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.paragraphTraceCount, 27);
  assert.equal(report.summary.workedExampleCount, 2);
  assert.equal(report.summary.misconceptionCount, 5);
  assert.equal(report.summary.applicationTaskCount, 3);
  assert.equal(report.summary.selfCheckCount, 8);
  assert.equal(report.summary.relatedPlaceCount, 6);
  assert.equal(report.summary.sourceCount, 25);
  assert.equal(report.summary.claimCount, 54);
  assert.equal(report.summary.tracedClaimCount, 54);
});
