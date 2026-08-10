import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByArkitekturTypeSkalaPhase4 } from '../scripts/audit-fagverk-by-arkitektur-type-skala-phase4.mjs';

test('Første Arkitektur-kapittel dekker 6/12 eide emner og bevarer Byliv 30/30', async () => {
  const { report, hydrated, bylivHydrated } = await auditByArkitekturTypeSkalaPhase4();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.schemaFamily, 'by_compatibility');
  assert.equal(report.subject.adapter, 'by');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.registeredChapterCount, 14);
  assert.equal(report.chapter.id, 'arkitektur-type-skala-byform');
  assert.deepEqual(report.summary, {
    coveredEmneCount: 6,
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
    coveredBylivEmneCount: 30,
    canonicalArchitectureEmneCount: 12,
    coveredArchitectureEmneCount: 6
  });
  assert.equal(report.coverage.canonicalArchitectureEmneIds.length, 12);
  assert.equal(new Set(report.coverage.emneIds).size, 6);
  assert.equal(hydrated.workedExamples.length, 2);
  assert.equal(hydrated.commonMisconceptions.length, 5);
  assert.equal(hydrated.applicationTasks.length, 4);
  assert.equal(hydrated.relatedPlaces.length, 4);
  assert.equal(bylivHydrated.length, 5);
  assert.ok(bylivHydrated.every((chapter) => chapter.claims.length === 18));
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
