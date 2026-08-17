import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapPhysicsAstronomyFulltext } from '../scripts/audit-fagverk-vitenskap-physics-astronomy-fulltext.mjs';

test('Vitenskap Unit 3 bevarer fysikk og astronomi som materialisert predecessor', () => {
  const report = auditVitenskapPhysicsAstronomyFulltext();
  assert.equal(report.status, 'pass');
  assert.equal(report.chapterId, 'vitenskap-fysikk-fra-bevegelse-til-kosmos');
  assert.equal(report.summary.emneCount, 8);
  assert.equal(report.summary.methodCount, 8);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.sourceCount, 12);
  assert.equal(report.summary.claimCount, 20);
  assert.equal(report.summary.misconceptionCount, 4);
  assert.equal(report.summary.workedExampleCount, 2);
  assert.equal(report.summary.applicationTaskCount, 4);
  assert.equal(report.summary.selfCheckCount, 6);
  assert.ok(report.summary.registeredChapterCount >= 3);
  assert.ok(report.summary.remainingEditorialBlockerCount >= 0 && report.summary.remainingEditorialBlockerCount <= 2);
  assert.equal(report.gates.physicsChapterMaterializedAndRegistered, true);
  assert.equal(report.gates.physicsEditorialBlockerResolved, true);
  assert.equal(report.gates.remainingBreadthEditorialBlockersConsistent, true);
  assert.equal(report.gates.prematureCompleteBlocked, true);
});

test('Vitenskap Unit 3 har reciprocal claim trace og kildeintegritet', () => {
  const report = auditVitenskapPhysicsAstronomyFulltext();
  assert.equal(report.gates.claimTraceReciprocalAndComplete, true);
  assert.equal(report.gates.sourceClaimIntegrityPreserved, true);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 20);
  assert.equal(report.summary.sourceCount, 12);
});

test('Vitenskap Unit 3 holder måling, modell og instrumentmediert observasjon adskilt', () => {
  const report = auditVitenskapPhysicsAstronomyFulltext();
  assert.equal(report.gates.measurementModelBoundaryLocked, true);
  assert.equal(report.gates.technologyRemainsNested, true);
});
