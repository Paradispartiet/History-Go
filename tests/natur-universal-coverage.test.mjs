import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaturUniversalCoverage } from '../scripts/audit-natur-universal-coverage.mjs';

test('Natur har en ærlig tolvdelsmodell uten falsk complete-status', () => {
  const report = auditNaturUniversalCoverage();
  assert.equal(report.status, 'passed_with_remaining_gaps');
  assert.equal(report.summary.canonicalDomainCount, 12);
  assert.equal(report.summary.materializedDomainCount, 8);
  assert.equal(report.summary.requiredGapDomainCount, 3);
  assert.equal(report.summary.editorialStatus, 'chapters_in_progress');
});
