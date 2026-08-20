import test from 'node:test';
import assert from 'node:assert/strict';
import { auditVitenskapTheoryIntegrity } from '../tools/audit-vitenskap-theory-integrity.mjs';

test('Vitenskap strict theory integrity proves every canonical major field (6/6)',()=>{
  const r=auditVitenskapTheoryIntegrity();
  assert.equal(r.subject_id,'vitenskap');
  assert.equal(r.status,'STRICTLY_PROVEN');
  assert.equal(r.proof_scope,'per_canonical_major_field');
  assert.equal(r.profile,'model_evidence');
  assert.equal(r.completion_status_read_only,true);
  assert.equal(r.content_rewrite_required,false);
  assert.equal(r.person_work_binding,'not_applicable_model_evidence_profile');
  assert.equal(r.safety,'verified_population_and_system_evidence_not_individual_medical_advice_or_policy_decision');
  assert.deepEqual(r.summary,{canonicalMajorFields:6,fieldsStrictlyProven:6,modelObjects:12,scholarlySources:12,claimSourceBindings:12,contentRoleBindings:36,actualProseBindings:36,universalCanonicalEmnesValidated:117,substantiveContentGapsProven:0});
  assert.deepEqual(r.lockedBaseline,{domains:6,topics:117,methods:84,mappings:117,theoryHooks:64,registeredChapters:5,sections:87,paragraphs:261,claims:178,sources:103,explicitChapterOwnedEmnes:117,explicitUncoveredEmnes:0,exactDuplicateParagraphs:0,holisticQualityScore:28,nestedTechnologyAreas:12,nestedTechnologyTopics:48});
  assert.equal(r.fields.length,6);
  assert.ok(r.fields.every(field=>field.strictlyProven===true&&field.modelObjectCount===2&&field.scholarlySourceCount===2&&field.claimSourceBindingCount===2&&field.contentRoleBindingCount===6&&field.actualProseBindingCount===6&&field.personWorkBinding==='not_applicable_model_evidence_profile'&&field.universalSubjectGate===true));
});
