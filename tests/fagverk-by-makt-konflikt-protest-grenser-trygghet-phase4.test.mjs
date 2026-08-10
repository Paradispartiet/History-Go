import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByMaktKonfliktProtestGrenserTrygghetPhase4 } from '../scripts/audit-fagverk-by-makt-konflikt-protest-grenser-trygghet-phase4.mjs';

test('Makt og konflikt fullføres 5/5 uten å svekke tidligere By-domener', async () => {
  const { report, hydrated } = await auditByMaktKonfliktProtestGrenserTrygghetPhase4();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.registeredChapterCount, 13);
  assert.equal(report.chapter.id, 'makt-konflikt-protest-grenser-trygghet');
  assert.equal(report.summary.coveredEmneCount, 5);
  assert.equal(report.summary.canonicalPowerConflictEmneCount, 5);
  assert.equal(report.summary.coveredPowerConflictEmneCount, 5);
  assert.equal(report.summary.canonicalHistoricalLayersEmneCount, 2);
  assert.equal(report.summary.coveredHistoricalLayersEmneCount, 2);
  assert.equal(report.summary.sourceCount, 13);
  assert.equal(report.summary.verifiedClaimCount, 18);
  assert.equal(hydrated.workedExamples.length, 2);
  assert.equal(hydrated.commonMisconceptions.length, 5);
  assert.equal(hydrated.applicationTasks.length, 4);
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
