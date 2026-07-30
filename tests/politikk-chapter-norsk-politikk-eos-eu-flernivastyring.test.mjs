import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditPolitikkNorskPolitikkEosEuFlernivastyringChapter,
  hasCompleteClaimTrace
} from '../scripts/audit-politikk-chapter-norsk-politikk-eos-eu-flernivastyring.mjs';

test('claimspor krever minst én ikke-tom claim-ID per innholdselement', () => {
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['claim-2', 'claim-3']]), true);
  assert.equal(hasCompleteClaimTrace([['claim-1'], []]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['   ']]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], 'claim-2']), false);
});

test('Norsk politikk, EØS/EU og flernivåstyring oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkNorskPolitikkEosEuFlernivastyringChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 12);
  assert.equal(report.summary.methodCount, 6);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 46);
  assert.equal(report.summary.sourceCount, 34);
  assert.equal(report.summary.tracedClaimCount, 46);
  assert.equal(report.summary.relatedPlaceCount, 5);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});
