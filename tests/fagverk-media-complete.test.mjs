import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMediaComplete } from '../scripts/audit-fagverk-media-complete.mjs';

test('Media er komplett først når helhetsauditen dekker canonical struktur, kapitler og evidens', () => {
  const { report } = auditMediaComplete();
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  assert.deepEqual(report.summary, {
    domainCount: 6, chapterCount: 6, emneCount: 120, methodCount: 115,
    mappingCount: 120, hookCount: 60, nestedPopularCultureEmneCount: 56,
    uniquePlaceCount: 15, uniqueSourceUrlCount: 117,
    moduleCount: 18, sectionCount: 54, paragraphCount: 162, sourceCount: 126,
    claimCount: 160, workedExampleCount: 18, misconceptionCount: 30,
    applicationTaskCount: 30, selfCheckCount: 42
  });
  assert.equal(report.canonicalDomainCoverage.length, 6);
  assert.ok(Object.values(report.gates).every(Boolean));
});
