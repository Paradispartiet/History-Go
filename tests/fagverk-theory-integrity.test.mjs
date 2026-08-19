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

test('baseline strong blir ikke feilaktig oppgradert til strict proof', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.status,'strict_audit_open_evidence_gaps');
  assert.equal(r.strictCompletionGateReady,false);
  assert.equal(r.summary.strictly_proven,0);
  assert.equal(r.summary.structured_subject_gate_not_strict,4);
  assert.equal(r.summary.partial_strict_evidence,1);
  assert.equal(r.summary.baseline_only_strict_proof_missing,13);
});

test('manglende strict proof blir ikke feiltolket som innholdshull', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.rules.missingProofDoesNotEqualContentGap,true);
  assert.equal(r.summary.substantive_content_gaps_proven,0);
  assert.deepEqual(r.contentRepairQueue,[]);
  assert.ok(r.subjects.every(s=>s.substantiveContentGap===false));
});

test('eksisterende subject-gates beholdes med presise restbevis', () => {
  const r=auditFagverkTheoryIntegrity();
  const byId=new Map(r.subjects.map(s=>[s.id,s]));
  assert.equal(byId.get('film_tv').integrityStatus,'structured_subject_gate_not_strict');
  assert.deepEqual(byId.get('film_tv').missingStrictProof,['actual_prose_binding']);
  assert.equal(byId.get('religion').integrityStatus,'structured_subject_gate_not_strict');
  assert.ok(byId.get('religion').missingStrictProof.includes('actual_prose_binding'));
  assert.equal(byId.get('scenekunst').integrityStatus,'structured_subject_gate_not_strict');
  assert.ok(byId.get('scenekunst').missingStrictProof.includes('canonical_field_coverage'));
  assert.equal(byId.get('subkultur').integrityStatus,'structured_subject_gate_not_strict');
  assert.equal(byId.get('historie').integrityStatus,'partial_strict_evidence');
  assert.ok(byId.get('historie').missingStrictProof.includes('universal_subject_scope'));
});

test('completion-status er read-only i theory integrity programmet', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.rules.completionStatusReadOnly,true);
  assert.equal(r.proofReconciliationQueue.length,18);
});
