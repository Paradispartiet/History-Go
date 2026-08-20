import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapBreadthReconciliation } from '../scripts/audit-fagverk-vitenskap-breadth-reconciliation.mjs';

test('Vitenskap v4.6 reconciler 24 universitetsbreddeemner uten nye domener eller metoder', () => {
  const { report } = auditVitenskapBreadthReconciliation();
  assert.deepEqual(report.baseline, { domains: 6, emnes: 93, methods: 84, mappings: 93, hooks: 60 });
  assert.deepEqual(report.reconciled, { domains: 6, emnes: 117, methods: 84, mappings: 117, hooks: 64 });
  assert.deepEqual(report.delta, { domains: 0, emnes: 24, methods: 0, mappings: 24, hooks: 4 });
  assert.equal(report.families.length, 4);
  assert.deepEqual(report.families.map((row) => row.emneCount), [5, 8, 6, 5]);
  assert.equal(report.gates.oldInventoryPreserved, true);
  assert.equal(report.gates.exactTwentyFourTopicDelta, true);
  assert.equal(report.gates.exactFourHookDelta, true);
  assert.equal(report.gates.noNewDomains, true);
  assert.equal(report.gates.noNewMethods, true);
});

test('v4.6 er internt canonical og bruker tiered mapping-schema', () => {
  const { report } = auditVitenskapBreadthReconciliation();
  assert.equal(report.gates.canonicalInternalVersionConsistency, true);
  assert.equal(report.gates.mappingSchemaCanonical, true);
  assert.equal(report.gates.allNewMethodsResolve, true);
  assert.equal(report.gates.newTopicTextIndependentAndSubstantial, true);
  assert.equal(report.gates.manifestAndGeneratorUseV46, true);
});

test('inventory-gapene er reconcilet og terminal completion bevarer breadth-kontrakten', () => {
  const { report } = auditVitenskapBreadthReconciliation();
  assert.ok(['chapters_in_progress', 'complete'].includes(report.subject.editorialStatus));
  assert.equal(report.subject.completeReady, true);
  assert.ok(['final_holistic_university_breadth_completion_audit', 'maintenance_source_refresh_and_place_case_expansion'].includes(report.subject.nextGate));
  assert.equal(report.editorialState.structuralBlockingGapCount, 0);
  assert.equal(report.editorialState.editorialBlockerCount, 0);
  assert.ok(report.editorialState.registeredChapterCount >= 5);
  assert.equal(report.gates.structuralGapsReconciled, true);
  assert.equal(report.gates.editorialBlockersRemainOpen, false);
  assert.equal(report.gates.prematureCompleteBlocked, true);
});

test('Teknologi forblir nested og Unit 1-registeringen bevares', () => {
  const { report } = auditVitenskapBreadthReconciliation();
  assert.equal(report.gates.technologyRemainsNested, true);
  assert.equal(report.gates.unit1RegistrationPreserved, true);
});
