import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByKlimaHelseVarmeVannTilgjengelighetPhase4 } from '../scripts/audit-fagverk-by-klima-helse-varme-vann-tilgjengelighet-phase4.mjs';

test('Klima og helse fullføres 4/4 uten å svekke tidligere By-domener', async () => {
  const { report, hydrated } = await auditByKlimaHelseVarmeVannTilgjengelighetPhase4();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.registeredChapterCount, 17);
  assert.equal(report.chapter.id, 'klima-helse-varme-vann-tilgjengelighet');
  assert.equal(report.summary.coveredEmneCount, 4);
  assert.equal(report.summary.canonicalClimateHealthEmneCount, 4);
  assert.equal(report.summary.coveredClimateHealthEmneCount, 4);
  assert.equal(report.summary.canonicalPowerConflictEmneCount, 5);
  assert.equal(report.summary.coveredPowerConflictEmneCount, 5);
  assert.equal(report.summary.sourceCount, 13);
  assert.equal(report.summary.verifiedClaimCount, 18);
  assert.equal(hydrated.workedExamples.length, 2);
  assert.equal(hydrated.commonMisconceptions.length, 5);
  assert.equal(hydrated.applicationTasks.length, 4);
  for (const gate of Object.values(report.gates)) assert.equal(gate, true);
});
