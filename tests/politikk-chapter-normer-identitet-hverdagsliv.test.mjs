import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditPolitikkNormerIdentitetHverdagslivChapter,
  hasCompleteClaimTrace,
  hasRenderableWorkedExampleAnalysis
} from '../scripts/audit-politikk-chapter-normer-identitet-hverdagsliv.mjs';

test('claimspor krever minst én ikke-tom claim-ID per innholdselement', () => {
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['claim-2', 'claim-3']]), true);
  assert.equal(hasCompleteClaimTrace([['claim-1'], []]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['   ']]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], 'claim-2']), false);
});

test('arbeidseksempelanalysen må være en synlig liste med minst tre trinn', () => {
  assert.equal(hasRenderableWorkedExampleAnalysis([{ analysis: ['ett', 'to', 'tre'] }]), true);
  assert.equal(hasRenderableWorkedExampleAnalysis([{ analysis: 'ett, to, tre' }]), false);
  assert.equal(hasRenderableWorkedExampleAnalysis([{ analysis: ['ett', 'to'] }]), false);
  assert.equal(hasRenderableWorkedExampleAnalysis([{ analysis: ['ett', 'to', '   '] }]), false);
});

test('Normer, identitet og hverdagsliv oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkNormerIdentitetHverdagslivChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 9);
  assert.equal(report.summary.methodCount, 16);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 45);
  assert.equal(report.summary.sourceCount, 30);
  assert.equal(report.summary.tracedClaimCount, 45);
  assert.equal(report.summary.relatedPlaceCount, 6);
  assert.equal(report.gates.renderableWorkedExampleAnalysis, true);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});
