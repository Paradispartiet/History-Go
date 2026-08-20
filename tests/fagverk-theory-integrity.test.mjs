import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFagverkTheoryIntegrity } from '../scripts/audit-fagverk-theory-integrity.mjs';

test('strict theory integrity audit dekker 17 toppfag og Teknologi nested', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.scope.topLevelSubjects,17);
  assert.equal(r.scope.nestedSpecializations,1);
  assert.equal(r.scope.totalAudited,18);
  assert.equal(r.subjects.length,18);
  assert.ok(r.subjects.every(s=>s.baseline==='strong_structured_evidence'));
});

test('baseline strong blir ikke feilaktig oppgradert uten strict proof', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.status,'strict_audit_open_evidence_gaps');
  assert.equal(r.strictCompletionGateReady,false);
  assert.equal(r.summary.strictly_proven,5);
  assert.equal(r.summary.structured_subject_gate_not_strict,0);
  assert.equal(r.summary.partial_strict_evidence,0);
  assert.equal(r.summary.baseline_only_strict_proof_missing,13);
});

test('manglende strict proof blir ikke feiltolket som innholdshull', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.rules.missingProofDoesNotEqualContentGap,true);
  assert.equal(r.summary.substantive_content_gaps_proven,0);
  assert.deepEqual(r.contentRepairQueue,[]);
  assert.ok(r.subjects.every(s=>s.substantiveContentGap===false));
});

test('eksisterende subject-gates beholdes og Historie er field-level strictly proven', () => {
  const r=auditFagverkTheoryIntegrity();
  const byId=new Map(r.subjects.map(s=>[s.id,s]));
  for(const id of ['film_tv','religion','subkultur','scenekunst','historie']){
    assert.equal(byId.get(id).integrityStatus,'strictly_proven');
    assert.deepEqual(byId.get(id).missingStrictProof,[]);
    assert.equal(byId.get(id).evidenceAdapter,'structured_subject_gate');
  }
});

test('completion-status er read-only og proof-køen er redusert til 13', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.rules.completionStatusReadOnly,true);
  assert.equal(r.proofReconciliationQueue.length,13);
  for(const id of ['film_tv','religion','subkultur','scenekunst','historie'])assert.ok(!r.proofReconciliationQueue.includes(id));
});
