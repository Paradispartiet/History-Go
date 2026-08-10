import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByUrbanismeIdealerForbindelserFortettingPhase4 } from '../scripts/audit-fagverk-by-urbanisme-idealer-forbindelser-fortetting-phase4.mjs';

test('Urbanisme fullføres 6/6 uten å svekke tidligere By-domener', async () => {
  const { report, hydrated } = await auditByUrbanismeIdealerForbindelserFortettingPhase4();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.registeredChapterCount, 15);
  assert.equal(report.chapter.id, 'urbanisme-idealer-forbindelser-fortetting');
  assert.equal(report.summary.coveredEmneCount, 6);
  assert.equal(report.summary.canonicalUrbanismEmneCount, 6);
  assert.equal(report.summary.coveredUrbanismEmneCount, 6);
  assert.equal(report.summary.canonicalAdministrationPlanningEmneCount, 3);
  assert.equal(report.summary.coveredAdministrationPlanningEmneCount, 3);
  assert.equal(report.summary.canonicalHousingNeighborhoodEmneCount, 5);
  assert.equal(report.summary.coveredHousingNeighborhoodEmneCount, 5);
  assert.equal(report.summary.canonicalBylivEmneCount, 30);
  assert.equal(report.summary.coveredBylivEmneCount, 30);
  assert.equal(report.summary.canonicalArchitectureEmneCount, 12);
  assert.equal(report.summary.coveredArchitectureEmneCount, 12);
  assert.equal(report.summary.sourceCount, 13);
  assert.equal(report.summary.verifiedClaimCount, 18);
  assert.equal(hydrated.workedExamples.length, 2);
  assert.equal(hydrated.commonMisconceptions.length, 5);
  assert.equal(hydrated.applicationTasks.length, 4);
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
