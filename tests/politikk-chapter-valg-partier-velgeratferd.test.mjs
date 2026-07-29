import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkValgChapter } from '../scripts/audit-politikk-chapter-valg-partier-velgeratferd.mjs';

test('Valg, partier og velgeratferd oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkValgChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 5);
  assert.equal(report.summary.methodCount, 5);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 33);
  assert.equal(report.summary.sourceCount, 23);
  assert.equal(report.summary.tracedClaimCount, 33);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});
