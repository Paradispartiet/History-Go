import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaturUniversalCoverage } from '../scripts/audit-natur-universal-coverage.mjs';

test('Natur har komplett og auditert tolvdelsmodell', () => {
  const report = auditNaturUniversalCoverage();
  assert.equal(report.status, 'passed_complete');
  assert.equal(report.summary.canonicalDomainCount, 12);
  assert.equal(report.summary.materializedDomainCount, 12);
  assert.equal(report.summary.partialDomainCount, 0);
  assert.equal(report.summary.requiredGapDomainCount, 0);
  assert.equal(report.summary.materializedEmneCount, 77);
  assert.equal(report.summary.materializedMethodCount, 51);
  assert.equal(report.summary.materializedMappingCount, 77);
  assert.equal(report.summary.registeredChapterCount, 12);
  assert.equal(report.summary.editorialStatus, 'complete');
});
