import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkRegimerChapter } from '../scripts/audit-politikk-chapter-regimer-institusjoner.mjs';

test('Regimer og institusjoner oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkRegimerChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 15);
  assert.equal(report.summary.methodCount, 16);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 29);
  assert.equal(report.summary.sourceCount, 16);
  assert.equal(report.summary.tracedClaimCount, 29);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});
