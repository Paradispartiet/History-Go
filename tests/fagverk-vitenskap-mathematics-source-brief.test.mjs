import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapMathematicsSourceBrief } from '../scripts/audit-fagverk-vitenskap-mathematics-source-brief.mjs';

test('Vitenskap matematikk-source brief låser canonical v4.6-familie uten premature completion', () => {
  const report = auditVitenskapMathematicsSourceBrief();
  assert.equal(report.status, 'pass');
  assert.equal(report.subject, 'vitenskap');
  assert.equal(report.chapterId, 'vitenskap-matematisk-bevis-struktur-og-modell');
  assert.equal(report.coverageFamilyId, 'mathematics_formal_sciences');
  assert.deepEqual(report.summary, {
    emneCount: 5,
    methodCount: 6,
    sourceCount: 10,
    claimCount: 18,
    plannedSectionCount: 9,
    criticalDistinctionCount: 15,
    scenarioCount: 4
  });
  assert.equal(report.gates.canonicalV46MathFamilyLocked, true);
  assert.equal(report.gates.mathematicsEditorialBlockerRemainsOpen, true);
  assert.equal(report.gates.prematureCompleteBlocked, true);
  assert.equal(report.gates.technologyRemainsNested, true);
});

test('Vitenskap matematikk-source brief krever inspectable og faktisk brukte kilder', () => {
  const report = auditVitenskapMathematicsSourceBrief();
  assert.equal(report.summary.sourceCount, 10);
  assert.equal(report.summary.claimCount, 18);
  assert.equal(report.gates.sourcesInspectableAndUsed, true);
  assert.equal(report.gates.claimsVerifiedAndTracePlanned, true);
});

test('Vitenskap matematikk-source brief låser skillet mellom formelt bevis og empirisk validering', () => {
  const report = auditVitenskapMathematicsSourceBrief();
  assert.equal(report.gates.formalEmpiricalBoundaryLocked, true);
  assert.ok(report.summary.criticalDistinctionCount >= 14);
});
