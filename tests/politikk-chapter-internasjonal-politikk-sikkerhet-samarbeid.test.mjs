import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkInternasjonalPolitikkChapter } from '../scripts/audit-politikk-chapter-internasjonal-politikk-sikkerhet-samarbeid.mjs';

test('Internasjonal politikk, sikkerhet og samarbeid oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkInternasjonalPolitikkChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 5);
  assert.equal(report.summary.methodCount, 4);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 34);
  assert.equal(report.summary.sourceCount, 21);
  assert.equal(report.summary.tracedClaimCount, 34);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});
