import test from 'node:test';
import assert from 'node:assert/strict';
import {
  auditPolitikkPolitiskOkonomiStatMarkedChapter,
  hasCompleteClaimTrace
} from '../scripts/audit-politikk-chapter-politisk-okonomi-stat-marked.mjs';

test('claimspor krever minst én ikke-tom claim-ID per innholdselement', () => {
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['claim-2', 'claim-3']]), true);
  assert.equal(hasCompleteClaimTrace([['claim-1'], []]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['   ']]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], 'claim-2']), false);
});

test('Politisk økonomi, stat og marked oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkPolitiskOkonomiStatMarkedChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 5);
  assert.equal(report.summary.methodCount, 4);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 34);
  assert.equal(report.summary.sourceCount, 25);
  assert.equal(report.summary.tracedClaimCount, 34);
  assert.equal(report.summary.relatedPlaceCount, 5);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});
