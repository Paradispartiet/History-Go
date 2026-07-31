import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkParlamentarismeChapter } from '../scripts/audit-politikk-chapter-parlamentarisme.mjs';

test('Parlamentarisme, representasjon og offentlighet oppfyller full Politikk-kontrakt', () => {
  const report = auditPolitikkParlamentarismeChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 14);
  assert.equal(report.summary.methodCount, 23);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 36);
  assert.equal(report.summary.sourceCount, 30);
  assert.equal(report.summary.tracedClaimCount, 36);
  assert.equal(report.summary.relatedPlaceCount, 6);
  assert.equal(report.summary.fullContractChapterCount, 13);
  assert.equal(report.gates.allThirteenChaptersOnFullContract, true);
});
