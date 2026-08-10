import test from 'node:test';
import assert from 'node:assert/strict';
import { auditKunstComplete } from '../scripts/audit-fagverk-kunst-complete.mjs';

test('Kunst er komplett først når helhetsauditen dekker canonical struktur, kapitler og evidens', () => {
  const { report } = auditKunstComplete();
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.deepEqual(report.summary, {
    domainCount: 6, chapterCount: 6, emneCount: 21, methodCount: 21,
    mappingCount: 21, hookCount: 60, uniquePlaceCount: 11, uniqueSourceUrlCount: 95,
    moduleCount: 18, sectionCount: 54, paragraphCount: 162, sourceCount: 100,
    claimCount: 140, workedExampleCount: 18, misconceptionCount: 29,
    applicationTaskCount: 29, selfCheckCount: 41
  });
  assert.equal(report.canonicalDomainCoverage.length, 6);
  assert.ok(Object.values(report.gates).every(Boolean));
});
