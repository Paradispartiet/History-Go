import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapMedicineBiomedicinePublicHealthSourceBrief } from '../scripts/audit-fagverk-vitenskap-medicine-biomedicine-public-health-source-brief.mjs';

test('Vitenskap medisin/biomedisin/folkehelse-source brief låser canonical v4.6-familien', () => {
  const report = auditVitenskapMedicineBiomedicinePublicHealthSourceBrief();
  assert.equal(report.status, 'pass');
  assert.equal(report.subject, 'vitenskap');
  assert.equal(report.chapterId, 'vitenskap-medisin-fra-mekanisme-til-folkehelse');
  assert.equal(report.coverageFamilyId, 'medicine_biomedicine_public_health');
  assert.deepEqual(report.summary, {
    emneCount: 5,
    methodCount: 9,
    sourceCount: 12,
    claimCount: 20,
    plannedSectionCount: 9,
    criticalDistinctionCount: 25,
    scenarioCount: 4
  });
  assert.equal(report.gates.canonicalV46MedicineFamilyLocked, true);
  assert.equal(report.gates.sourceBriefPhaseConsistentWithReadiness, true);
  assert.equal(report.gates.prematureCompleteBlockedWhileMedicineOpen, true);
  assert.equal(report.gates.technologyRemainsNested, true);
});

test('Vitenskap medisin-source brief krever inspectable og faktisk brukte kilder', () => {
  const report = auditVitenskapMedicineBiomedicinePublicHealthSourceBrief();
  assert.equal(report.summary.sourceCount, 12);
  assert.equal(report.summary.claimCount, 20);
  assert.equal(report.gates.sourcesInspectableAndUsed, true);
  assert.equal(report.gates.claimsVerifiedAndTracePlanned, true);
});

test('Vitenskap medisin-source brief låser translasjon, diagnostikk, trial-effekt og epidemiologisk kausalitet', () => {
  const report = auditVitenskapMedicineBiomedicinePublicHealthSourceBrief();
  assert.equal(report.gates.modelTranslationBoundaryLocked, true);
  assert.equal(report.gates.diagnosticEvidenceBoundaryLocked, true);
  assert.equal(report.gates.trialPrespecificationBoundaryLocked, true);
  assert.equal(report.gates.relativeAbsoluteEffectBoundaryLocked, true);
  assert.equal(report.gates.epidemiologyCausalityBoundaryLocked, true);
  assert.equal(report.gates.noIndividualMedicalAdvice, true);
  assert.ok(report.summary.criticalDistinctionCount >= 24);
});
