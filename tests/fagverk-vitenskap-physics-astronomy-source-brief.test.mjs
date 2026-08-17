import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapPhysicsAstronomySourceBrief } from '../scripts/audit-fagverk-vitenskap-physics-astronomy-source-brief.mjs';

test('Vitenskap fysikk/astronomi-source brief låser canonical v4.6-familien', () => {
  const report = auditVitenskapPhysicsAstronomySourceBrief();
  assert.equal(report.status, 'pass');
  assert.equal(report.subject, 'vitenskap');
  assert.equal(report.chapterId, 'vitenskap-fysikk-fra-bevegelse-til-kosmos');
  assert.equal(report.coverageFamilyId, 'physics_astronomy');
  assert.deepEqual(report.summary, {
    emneCount: 8,
    methodCount: 8,
    sourceCount: 12,
    claimCount: 20,
    plannedSectionCount: 9,
    criticalDistinctionCount: 22,
    scenarioCount: 4
  });
  assert.equal(report.gates.canonicalV46PhysicsFamilyLocked, true);
  assert.equal(report.gates.sourceBriefPhaseConsistentWithReadiness, true);
  assert.equal(report.gates.prematureCompleteBlocked, true);
  assert.equal(report.gates.technologyRemainsNested, true);
});

test('Vitenskap fysikk/astronomi-source brief krever inspectable og faktisk brukte kilder', () => {
  const report = auditVitenskapPhysicsAstronomySourceBrief();
  assert.equal(report.summary.sourceCount, 12);
  assert.equal(report.summary.claimCount, 20);
  assert.equal(report.gates.sourcesInspectableAndUsed, true);
  assert.equal(report.gates.claimsVerifiedAndTracePlanned, true);
});

test('Vitenskap fysikk/astronomi-source brief låser måling, modell, instrument og observasjon som separate ledd', () => {
  const report = auditVitenskapPhysicsAstronomySourceBrief();
  assert.equal(report.gates.measurementModelObservationBoundaryLocked, true);
  assert.ok(report.summary.criticalDistinctionCount >= 20);
});
