import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hasCompleteClaimTrace,
  hasRenderableWorkedExampleAnalysis
} from '../scripts/audit-politikk-complete-chapter.mjs';
import { auditPolitikkForvaltningChapter } from '../scripts/audit-politikk-chapter-forvaltning.mjs';

test('den delte sluttkontrakten avviser tomme claimspor og usynlige analysefelt', () => {
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['claim-2']]), true);
  assert.equal(hasCompleteClaimTrace([['claim-1'], []]), false);
  assert.equal(hasRenderableWorkedExampleAnalysis([{ analysis: ['ett', 'to', 'tre'] }]), true);
  assert.equal(hasRenderableWorkedExampleAnalysis([{ analysis: 'ett, to, tre' }]), false);
});

test('Offentlig forvaltning oppfyller full Politikk-kontrakt', () => {
  const report = auditPolitikkForvaltningChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 15);
  assert.equal(report.summary.methodCount, 21);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 36);
  assert.equal(report.summary.sourceCount, 24);
  assert.equal(report.summary.tracedClaimCount, 36);
  assert.equal(report.summary.fullContractChapterCount, 13);
  assert.equal(report.gates.completeEditorialStatus, true);
});
