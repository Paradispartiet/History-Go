import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaturTheoryIntegrity } from '../tools/audit-natur-theory-integrity.mjs';

test('Natur strict theory integrity proves every canonical major field (12/12)',()=>{
  const r=auditNaturTheoryIntegrity();
  assert.equal(r.subject_id,'natur');
  assert.equal(r.status,'STRICTLY_PROVEN');
  assert.equal(r.proof_scope,'per_canonical_major_field');
  assert.equal(r.profile,'model_evidence');
  assert.equal(r.completion_status_read_only,true);
  assert.equal(r.content_rewrite_required,false);
  assert.equal(r.person_work_binding,'not_applicable_model_evidence_profile');
  assert.deepEqual(r.summary,{canonicalMajorFields:12,fieldsStrictlyProven:12,modelObjects:24,scholarlySources:24,contentRoleBindings:72,actualProseBindings:72,explicitProofBridges:24,substantiveContentGapsProven:0});
  assert.equal(r.fields.length,12);
  assert.ok(r.fields.every(field=>field.strictlyProven===true&&field.modelObjectCount===2&&field.proseBindingCount===6&&field.personWorkBinding==='not_applicable_model_evidence_profile'));
});
