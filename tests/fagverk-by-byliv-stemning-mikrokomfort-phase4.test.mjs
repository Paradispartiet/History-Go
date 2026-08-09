import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByBylivStemningMikrokomfortPhase4 } from '../scripts/audit-fagverk-by-byliv-stemning-mikrokomfort-phase4.mjs';

test('By stemning og mikrokomfort er claimsporet og holder evidenslagene adskilt', async () => {
  const { report, hydrated, previousHydrated } = await auditByBylivStemningMikrokomfortPhase4();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.schemaFamily, 'by_compatibility');
  assert.equal(report.subject.adapter, 'by');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.registeredChapterCount, 9);
  assert.equal(report.chapter.id, 'byliv-stemning-mikrokomfort');
  assert.deepEqual(report.summary, {
    coveredEmneCount: 5,
    methodCount: 5,
    moduleCount: 3,
    sectionCount: 9,
    sourceCount: 13,
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
  assert.equal(previousHydrated.length, 3);
  assert.ok(previousHydrated.every((chapter) => chapter.claims.length === 18));
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
