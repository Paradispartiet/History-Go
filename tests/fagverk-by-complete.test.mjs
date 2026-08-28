import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByComplete } from '../scripts/audit-fagverk-by-complete.mjs';

test('By er komplett først når helhetsauditen dekker canonical struktur, kapitler og evidens', () => {
  const { report } = auditByComplete();
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.deepEqual(report.summary, {
    domainCount: 12,
    chapterCount: 17,
    emneCount: 82,
    activeEmneCount: 74,
    methodCount: 14,
    mappingCount: 82,
    hookCount: 81,
    uniquePlaceCount: 20,
    uniqueSourceUrlCount: 186,
    moduleCount: 51,
    sectionCount: 153,
    paragraphCount: 459,
    sourceCount: 219,
    claimCount: 306,
    workedExampleCount: 34,
    misconceptionCount: 85,
    applicationTaskCount: 68,
    selfCheckCount: 102
  });
  assert.equal(report.canonicalDomainCoverage.length, 12);
  assert.ok(Object.values(report.gates).every(Boolean));
});