import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditPolitikkStatsvitenskapeligMetodeOgSammenligningChapter,
  hasCompleteClaimTrace
} from '../scripts/audit-politikk-chapter-statsvitenskapelig-metode-og-sammenligning.mjs';

test('claimspor krever minst én ikke-tom claim-ID per innholdselement', () => {
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['claim-2', 'claim-3']]), true);
  assert.equal(hasCompleteClaimTrace([['claim-1'], []]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['   ']]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], 'claim-2']), false);
});

test('Statsvitenskapelig metode og sammenligning oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkStatsvitenskapeligMetodeOgSammenligningChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 5);
  assert.equal(report.summary.methodCount, 5);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 36);
  assert.equal(report.summary.sourceCount, 25);
  assert.equal(report.summary.tracedClaimCount, 36);
  assert.equal(report.summary.relatedPlaceCount, 4);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});
