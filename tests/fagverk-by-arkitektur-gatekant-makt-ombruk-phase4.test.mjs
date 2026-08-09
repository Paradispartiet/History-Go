import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByArkitekturGatekantMaktOmbrukPhase4 } from '../scripts/audit-fagverk-by-arkitektur-gatekant-makt-ombruk-phase4.mjs';

test('Andre Arkitektur-kapittel fullfører canonical Arkitektur 12/12 og bevarer Byliv 30/30', async () => {
  const { report, hydrated } = await auditByArkitekturGatekantMaktOmbrukPhase4();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.schemaFamily, 'by_compatibility');
  assert.equal(report.subject.adapter, 'by');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.registeredChapterCount, 10);
  assert.equal(report.chapter.id, 'arkitektur-gatekant-makt-ombruk');
  assert.deepEqual(report.summary, {
    coveredEmneCount: 6,
    methodCount: 6,
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
    chapterCoveredArchitectureEmneCount: 12
  });
  assert.equal(report.coverage.canonicalArchitectureEmneIds.length, 12);
  assert.equal(new Set(report.coverage.emneIds).size, 6);
  assert.equal(hydrated.workedExamples.length, 2);
  assert.equal(hydrated.commonMisconceptions.length, 5);
  assert.equal(hydrated.applicationTasks.length, 4);
  assert.equal(hydrated.selfCheck.length, 6);
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
