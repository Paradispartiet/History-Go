import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByBoligNabolagTilgangEndringPhase4 } from '../scripts/audit-fagverk-by-bolig-nabolag-tilgang-endring-phase4.mjs';

test('Bolig og nabolag fullføres 5/5 uten å svekke Byliv eller Arkitektur', async () => {
  const { report, hydrated } = await auditByBoligNabolagTilgangEndringPhase4();
  assert.equal(report.subject.id, 'by');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.nextGate, 'chapter_production');
  assert.equal(report.subject.registeredChapterCount, 15);
  assert.equal(report.chapter.id, 'bolig-nabolag-tilgang-endring');
  assert.equal(report.summary.coveredEmneCount, 5);
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
