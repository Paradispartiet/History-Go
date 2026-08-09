import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByBylivOffentligeRomPhase4 } from '../scripts/audit-fagverk-by-byliv-offentlige-rom-phase4.mjs';

test('By Byliv-kapittelet er claimsporet, renderbart og fortsatt redaksjonelt ufullført som fag', async () => {
  const { report, hydrated } = await auditByBylivOffentligeRomPhase4();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.schemaFamily, 'by_compatibility');
  assert.equal(report.subject.adapter, 'by');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.registeredChapterCount, 1);
  assert.equal(report.chapter.id, 'byliv-offentlige-rom');
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
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
