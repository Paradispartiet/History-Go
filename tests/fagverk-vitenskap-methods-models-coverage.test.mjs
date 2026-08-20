import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapMethodsModelsCoverage } from '../scripts/audit-fagverk-vitenskap-methods-models-coverage.mjs';

test('Vitenskap methods/models batch gir eksplisitt fulltekstdekning til 17 canonicale emner', () => {
  const report = auditVitenskapMethodsModelsCoverage();
  assert.equal(report.status, 'pass');
  assert.equal(report.subject, 'vitenskap');
  assert.equal(report.domainId, 'metoder_maling_modeller');
  assert.equal(report.summary.canonicalBatchEmneCount, 17);
  assert.equal(report.summary.coverageTreatmentCount, 17);
  assert.equal(report.summary.sectionCount, 7);
  assert.equal(report.summary.paragraphCount, 21);
  assert.equal(report.gates.canonicalPrimaryMappingResolved, true);
  assert.equal(report.gates.everyEmneHasExplicitTreatment, true);
  assert.equal(report.gates.substantiveParagraphCoverage, true);
  assert.equal(report.gates.methodLimitsTaught, true);
});

test('Vitenskap methods/models batch krever claimsporet evidens og inspeksjonskilder', () => {
  const report = auditVitenskapMethodsModelsCoverage();
  assert.equal(report.summary.newSourceCount, 8);
  assert.equal(report.summary.newClaimCount, 14);
  assert.equal(report.gates.paragraphClaimsResolve, true);
  assert.equal(report.gates.newSourcesInspectable, true);
  assert.equal(report.gates.rootAndRegistryOwnershipMatch, true);
});

test('Vitenskap methods/models batch reduserer holistic blocker 85 til 68 uten completion-flip', () => {
  const report = auditVitenskapMethodsModelsCoverage();
  assert.equal(report.summary.holisticOwnedBeforeBatch, 32);
  assert.equal(report.summary.holisticOwnedAfterBatch, 49);
  assert.equal(report.summary.holisticUncoveredBeforeBatch, 85);
  assert.equal(report.summary.holisticUncoveredAfterBatch, 68);
  assert.equal(report.gates.holisticCoverageReducedByExactly17, true);
  assert.equal(report.gates.batchDidNotPrematurelyCompleteSubject, true);
  assert.equal(report.gates.historicalUnit1ExtendedMonotonically, true);
});
