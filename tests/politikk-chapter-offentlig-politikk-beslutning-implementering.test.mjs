import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkOffentligPolitikkChapter } from '../scripts/audit-politikk-chapter-offentlig-politikk-beslutning-implementering.mjs';

test('Offentlig politikk, beslutning og implementering oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkOffentligPolitikkChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 5);
  assert.equal(report.summary.methodCount, 5);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 33);
  assert.equal(report.summary.sourceCount, 21);
  assert.equal(report.summary.tracedClaimCount, 33);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});
