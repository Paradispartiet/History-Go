import test from 'node:test';
import assert from 'node:assert/strict';
import { auditTechnologyTheoryIntegrity, buildTechnologyTheoryIntegrityBindings } from '../tools/audit-teknologi-theory-integrity.mjs';

test('Teknologi er strict-proven i alle 12 canonicale hovedfelt',()=>{
  const r=auditTechnologyTheoryIntegrity();
  assert.equal(r.status,'STRICTLY_PROVEN');
  assert.equal(r.summary.canonical_fields,12);
  assert.equal(r.summary.strictly_proven_fields,12);
  assert.equal(r.summary.canonical_emner,48);
  assert.equal(r.summary.theory_objects,24);
  assert.equal(r.summary.thinkers,60);
  assert.equal(r.summary.scholarly_or_authoritative_sources,37);
  assert.equal(r.field_proof.length,12);
  assert.ok(r.field_proof.every(f=>f.status==='STRICTLY_PROVEN'&&f.theory_count===2&&f.emne_count===4));
});

test('strict-dimensjonene er eksplisitt bevist uten content rewrite',()=>{
  const r=auditTechnologyTheoryIntegrity();
  assert.equal(r.content_rewrite_required,false);
  assert.deepEqual(r.substantive_content_gaps,[]);
  assert.equal(r.completion_status_read_only,true);
  assert.ok(Object.values(r.strict_dimensions).every(v=>v==='verified'));
});

test('read-only sidecar dekker alle felt, teorier, verk, kilder og canonical emne-prosa',()=>{
  const b=buildTechnologyTheoryIntegrityBindings();
  assert.equal(b.status,'read_only_proof_sidecar');
  assert.equal(b.content_mutation,false);
  assert.equal(b.fields.length,12);
  assert.equal(new Set(b.fields.flatMap(f=>f.emne_ids)).size,48);
  assert.equal(new Set(b.fields.flatMap(f=>f.theory_ids)).size,24);
  assert.ok(b.fields.every(f=>f.theory_bindings.length===2));
  assert.ok(b.fields.flatMap(f=>f.theory_bindings).every(t=>t.canonical_emne_ids.length>=1&&t.thinker_work_bindings.length>=2&&t.scholarly_source_ids.length>=1&&t.prose_binding_fields.includes('why_it_matters')&&t.prose_binding_fields.includes('assessment_prompt')));
});
