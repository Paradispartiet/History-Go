import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFagverkTheoryReconciliation } from '../scripts/audit-fagverk-theory-reconciliation.mjs';

test('generic scanner findings cannot be promoted directly to content repair', () => {
  const report = auditFagverkTheoryReconciliation();
  assert.equal(report.rules.genericScannerFailureIsNotContentGap, true);
  assert.equal(report.rules.contentRepairRequiresSubstantiveGapProof, true);
  assert.equal(report.rules.completionStatusChangesAllowed, false);
  assert.deepEqual(report.contentRepairQueue, []);
});

test('the four post-baseline subject gates remain authoritative and pass', () => {
  const report = auditFagverkTheoryReconciliation();
  assert.deepEqual(report.strictSubjectGateFailures, []);
  for (const id of ['film_tv','religion','scenekunst','subkultur']) {
    assert.equal(report.strictSubjectGates[id]?.status, 'pass', `${id} strict theory gate failed`);
  }
});

test('Film & TV is the first strict field-integrity validated subject', () => {
  const report = auditFagverkTheoryReconciliation();
  const film = report.subjects.find((subject) => subject.id === 'film_tv');
  assert.equal(film?.genericDiagnosticStatus, 'green');
  assert.equal(film?.strictGate?.status, 'pass');
  assert.equal(film?.reconciliationClass, 'strict_integrity_validated');
  assert.equal(film?.substantiveGapProven, false);
});

test('Religion, Scenekunst and Subkultur are reconciliation work, not proven content gaps', () => {
  const report = auditFagverkTheoryReconciliation();
  const byId = new Map(report.subjects.map((subject) => [subject.id, subject]));
  assert.equal(byId.get('religion')?.reconciliationClass, 'field_inventory_and_evidence_adapter_required');
  assert.equal(byId.get('scenekunst')?.reconciliationClass, 'prose_binding_reconciliation_required');
  assert.equal(byId.get('subkultur')?.reconciliationClass, 'schema_and_prose_binding_reconciliation_required');
  for (const id of ['religion','scenekunst','subkultur']) assert.equal(byId.get(id)?.substantiveGapProven, false);
});
