import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFagverkTheoryIntegrity } from '../scripts/audit-fagverk-theory-integrity.mjs';

test('strict theory integrity audit dekker 19 toppfag og Teknologi nested', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.scope.topLevelSubjects,19);
  assert.equal(r.scope.nestedSpecializations,1);
  assert.equal(r.scope.totalAudited,20);
  assert.equal(r.subjects.length,20);
});

test('historisk 18/18 strict utvides med Helse uten å feilmerke Utdanning', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.status,'strict_audit_open_evidence_gaps');
  assert.equal(r.strictCompletionGateReady,false);
  assert.equal(r.summary.strictly_proven,19);
  assert.equal(r.summary.structured_subject_gate_not_strict,0);
  assert.equal(r.summary.partial_strict_evidence,0);
  assert.equal(r.summary.baseline_only_strict_proof_missing,1);
  assert.deepEqual(r.expansionProductionQueue,['utdanning']);
});

test('manglende strict proof blir ikke feiltolket som innholdshull', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.rules.missingProofDoesNotEqualContentGap,true);
  assert.equal(r.summary.substantive_content_gaps_proven,0);
  assert.deepEqual(r.contentRepairQueue,[]);
  assert.ok(r.subjects.every(s=>s.substantiveContentGap===false));
});

test('alle 19 subject-gates, inkludert Helse, Filosofi og nested Teknologi, er field-level strictly proven', () => {
  const r=auditFagverkTheoryIntegrity();
  const byId=new Map(r.subjects.map(s=>[s.id,s]));
  for(const id of ['film_tv','religion','subkultur','scenekunst','historie','by','kunst','media','musikk','litteratur','natur','naeringsliv','psykologi','sport','vitenskap','politikk','filosofi','teknologi','helse']){
    assert.equal(byId.get(id).integrityStatus,'strictly_proven');
    assert.deepEqual(byId.get(id).missingStrictProof,[]);
    assert.equal(byId.get(id).evidenceAdapter,'structured_subject_gate');
  }
});

test('completion-status er read-only og bare Utdanning gjenstår', () => {
  const r=auditFagverkTheoryIntegrity();
  assert.equal(r.rules.completionStatusReadOnly,true);
  assert.deepEqual(r.proofReconciliationQueue,[]);
  assert.deepEqual(r.expansionProductionQueue,['utdanning']);
  for(const id of ['film_tv','religion','subkultur','scenekunst','historie','by','kunst','media','musikk','litteratur','natur','naeringsliv','psykologi','sport','vitenskap','politikk','filosofi','teknologi'])assert.ok(!r.proofReconciliationQueue.includes(id));
});
