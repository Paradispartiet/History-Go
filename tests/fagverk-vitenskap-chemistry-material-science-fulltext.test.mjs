import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapChemistryMaterialScienceFulltext } from '../scripts/audit-fagverk-vitenskap-chemistry-material-science-fulltext.mjs';

test('Vitenskap Unit 4 materialiserer kjemi og materialvitenskap som fjerde kapittel', () => {
  const report = auditVitenskapChemistryMaterialScienceFulltext();
  assert.equal(report.status, 'pass');
  assert.equal(report.chapterId, 'vitenskap-kjemi-fra-atomstruktur-til-materialegenskap');
  assert.deepEqual(report.summary, {
    emneCount: 6,
    methodCount: 8,
    moduleCount: 3,
    sectionCount: 9,
    paragraphCount: 27,
    sourceCount: 12,
    claimCount: 20,
    misconceptionCount: 4,
    workedExampleCount: 2,
    applicationTaskCount: 4,
    selfCheckCount: 6,
    registeredChapterCount: 5,
    remainingEditorialBlockerCount: 0
  });
  assert.equal(report.gates.chemistryChapterMaterializedAndRegistered, true);
  assert.equal(report.gates.chemistryEditorialBlockerResolved, true);
  assert.equal(report.gates.oneBreadthEditorialBlockerRemains, false);
  assert.equal(report.gates.prematureCompleteBlocked, true);
});

test('Vitenskap Unit 4 har reciprocal claim trace og bevart kildeintegritet', () => {
  const report = auditVitenskapChemistryMaterialScienceFulltext();
  assert.equal(report.gates.claimTraceReciprocalAndComplete, true);
  assert.equal(report.gates.sourceClaimIntegrityPreserved, true);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 20);
  assert.equal(report.summary.sourceCount, 12);
});

test('Vitenskap Unit 4 holder termodynamikk, analytisk evidens og materialgrense eksplisitt adskilt', () => {
  const report = auditVitenskapChemistryMaterialScienceFulltext();
  assert.equal(report.gates.structureReactionMeasurementBoundaryLocked, true);
  assert.equal(report.gates.thermodynamicsKineticsBoundaryLocked, true);
  assert.equal(report.gates.sampleSignalInferenceBoundaryLocked, true);
  assert.equal(report.gates.technologyRemainsNested, true);
});
