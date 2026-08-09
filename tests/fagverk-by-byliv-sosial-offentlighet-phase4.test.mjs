import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByBylivSosialOffentlighetPhase4 } from '../scripts/audit-fagverk-by-byliv-sosial-offentlighet-phase4.mjs';

test('By sosial offentlighet er claimsporet, renderbart og holder By i chapters_in_progress', async () => {
  const { report, hydrated, siblingHydrated } = await auditByBylivSosialOffentlighetPhase4();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.schemaFamily, 'by_compatibility');
  assert.equal(report.subject.adapter, 'by');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.registeredChapterCount, 3);
  assert.equal(report.chapter.id, 'byliv-sosial-offentlighet');
  assert.deepEqual(report.summary, {
    coveredEmneCount: 7,
    methodCount: 3,
    moduleCount: 3,
    sectionCount: 9,
    sourceCount: 12,
    verifiedClaimCount: 18,
    workedExampleCount: 2,
    misconceptionCount: 5,
    applicationTaskCount: 4,
    selfCheckCount: 6,
    relatedPlaceCount: 4
  });
  assert.equal(hydrated.workedExamples.length, 2);
  assert.equal(hydrated.commonMisconceptions.length, 5);
  assert.equal(hydrated.applicationTasks.length, 4);
  assert.equal(hydrated.relatedPlaces.length, 4);
  assert.equal(siblingHydrated.sources.length, 12);
  assert.equal(siblingHydrated.claims.length, 18);
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
