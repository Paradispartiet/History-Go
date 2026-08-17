import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapPhysicsAstronomyFulltext } from '../scripts/audit-fagverk-vitenskap-physics-astronomy-fulltext.mjs';

test('Vitenskap Unit 3 materialiserer fysikk og astronomi som tredje kapittel', () => {
  const report = auditVitenskapPhysicsAstronomyFulltext();
  assert.equal(report.status, 'pass');
  assert.equal(report.chapterId, 'vitenskap-fysikk-fra-bevegelse-til-kosmos');
  assert.deepEqual(report.summary, {
    emneCount: 8,
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
    registeredChapterCount: 3,
    remainingEditorialBlockerCount: 2
  });
  assert.equal(report.gates.physicsChapterMaterializedAndRegistered, true);
  assert.equal(report.gates.physicsEditorialBlockerResolved, true);
  assert.equal(report.gates.twoBreadthEditorialBlockersRemain, true);
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
