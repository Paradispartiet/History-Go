import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiTheoryIntegrity } from '../tools/audit-psykologi-theory-integrity.mjs';

test('Psykologi strict theory integrity proves every canonical major field (6/6)',()=>{
  const r=auditPsykologiTheoryIntegrity();
  assert.equal(r.subject_id,'psykologi');
  assert.equal(r.status,'STRICTLY_PROVEN');
  assert.equal(r.proof_scope,'per_canonical_major_field');
  assert.equal(r.profile,'hybrid');
  assert.equal(r.completion_status_read_only,true);
  assert.equal(r.content_rewrite_required,false);
  assert.equal(r.diagnosis_safety,'verified_no_individual_diagnosis_or_treatment_advice');
  assert.deepEqual(r.summary,{canonicalMajorFields:6,fieldsStrictlyProven:6,theoryObjects:12,scholarlySources:12,personWorkBindings:12,claimBindings:12,actualProseBindings:12,explicitProofBridges:12,substantiveContentGapsProven:0});
  assert.deepEqual(r.lockedBaseline,{topics:58,methods:58,theoryHooks:60,registeredChapters:6,modules:18,sections:54,paragraphs:162,claims:162,sources:127,externalSources:120});
  assert.equal(r.fields.length,6);
  assert.ok(r.fields.every(field=>field.strictlyProven===true&&field.theoryObjectCount===2&&field.personWorkBindingCount===2&&field.proseBindingCount===2&&field.diagnosisSafetyGuard===true));
});
