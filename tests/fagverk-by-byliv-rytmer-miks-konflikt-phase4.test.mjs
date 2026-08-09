import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByBylivRytmerMiksKonfliktPhase4 } from '../scripts/audit-fagverk-by-byliv-rytmer-miks-konflikt-phase4.mjs';

test('Siste Byliv-kapittel gir eksakt 30/30 canonical Byliv-dekning uten å overdrive hele By-faget', async () => {
  const { report, hydrated, previousHydrated } = await auditByBylivRytmerMiksKonfliktPhase4();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.schemaFamily, 'by_compatibility');
  assert.equal(report.subject.adapter, 'by');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.registeredChapterCount, 9);
  assert.equal(report.chapter.id, 'byliv-rytmer-miks-konflikt');
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
    relatedPlaceCount: 4,
    canonicalBylivEmneCount: 30,
    chapterCoveredBylivEmneCount: 30
  });
  assert.equal(report.coverage.allBylivEmneIds.length, 30);
  assert.equal(new Set(report.coverage.allBylivEmneIds).size, 30);
  assert.equal(hydrated.workedExamples.length, 2);
  assert.equal(hydrated.commonMisconceptions.length, 5);
  assert.equal(hydrated.applicationTasks.length, 4);
  assert.equal(hydrated.relatedPlaces.length, 4);
  assert.equal(previousHydrated.length, 4);
  assert.ok(previousHydrated.every((chapter) => chapter.claims.length === 18));
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
