import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapChemistryMaterialScienceSourceBrief } from '../scripts/audit-fagverk-vitenskap-chemistry-material-science-source-brief.mjs';

test('Vitenskap kjemi/materialvitenskap-source brief låser canonical v4.6-familien', () => {
  const report = auditVitenskapChemistryMaterialScienceSourceBrief();
  assert.equal(report.status, 'pass');
  assert.equal(report.subject, 'vitenskap');
  assert.equal(report.chapterId, 'vitenskap-kjemi-fra-atomstruktur-til-materialegenskap');
  assert.equal(report.coverageFamilyId, 'chemistry_material_science');
  assert.deepEqual(report.summary, {
    emneCount: 6,
    methodCount: 8,
    sourceCount: 12,
    claimCount: 20,
    plannedSectionCount: 9,
    criticalDistinctionCount: 22,
    scenarioCount: 4
  });
  assert.equal(report.gates.canonicalV46ChemistryFamilyLocked, true);
  assert.equal(report.gates.sourceBriefPhaseConsistentWithReadiness, true);
  assert.equal(report.gates.prematureCompleteBlocked, true);
  assert.equal(report.gates.technologyRemainsNested, true);
});

test('Vitenskap kjemi/materialvitenskap-source brief krever inspectable og faktisk brukte kilder', () => {
  const report = auditVitenskapChemistryMaterialScienceSourceBrief();
  assert.equal(report.summary.sourceCount, 12);
  assert.equal(report.summary.claimCount, 20);
  assert.equal(report.gates.sourcesInspectableAndUsed, true);
  assert.equal(report.gates.claimsVerifiedAndTracePlanned, true);
});

test('Vitenskap kjemi/materialvitenskap-source brief låser termodynamikk, analyse og materialgrense', () => {
  const report = auditVitenskapChemistryMaterialScienceSourceBrief();
  assert.equal(report.gates.thermodynamicsKineticsBoundaryLocked, true);
  assert.equal(report.gates.sampleSignalInferenceBoundaryLocked, true);
  assert.equal(report.gates.materialScienceTechnologyBoundaryLocked, true);
  assert.ok(report.summary.criticalDistinctionCount >= 20);
});
