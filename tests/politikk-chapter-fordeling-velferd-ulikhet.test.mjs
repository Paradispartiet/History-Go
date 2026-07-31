import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  auditPolitikkFordelingVelferdUlikhetChapter,
  hasCompleteClaimTrace
} from '../scripts/audit-politikk-chapter-fordeling-velferd-ulikhet.mjs';

test('claimspor krever minst én ikke-tom claim-ID per innholdselement', () => {
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['claim-2', 'claim-3']]), true);
  assert.equal(hasCompleteClaimTrace([['claim-1'], []]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], ['   ']]), false);
  assert.equal(hasCompleteClaimTrace([['claim-1'], 'claim-2']), false);
});

test('Fordeling, velferd og ulikhet oppfyller Fagverkets kapittelkontrakt', () => {
  const report = auditPolitikkFordelingVelferdUlikhetChapter();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 9);
  assert.equal(report.summary.methodCount, 15);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 45);
  assert.equal(report.summary.sourceCount, 30);
  assert.equal(report.summary.tracedClaimCount, 45);
  assert.equal(report.summary.relatedPlaceCount, 6);
  assert.equal(report.gates.paragraphLevelClaimTrace, true);
  assert.equal(report.gates.registryAndRuntimeSynced, true);
  assert.equal(report.gates.honestEditorialStatus, true);
});

const fordypning = JSON.parse(readFileSync(
  new URL('../data/fagverk/politikk/fordeling-velferd-ulikhet/02-fordypning.json', import.meta.url),
  'utf8'
));

test('arbeidseksemplenes analyser er synlige steg for rendereren', () => {
  assert.equal(fordypning.workedExamples.length, 2);
  for (const example of fordypning.workedExamples) {
    assert.equal(Array.isArray(example.analysis), true);
    assert.ok(example.analysis.length >= 3);
    assert.equal(example.analysis.every((step) => typeof step === 'string' && step.trim().length > 0), true);
  }
});
