import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMusikkTheoryIntegrity } from '../tools/audit-musikk-theory-integrity.mjs';

test('Musikk strict theory integrity proves every canonical major field (8/8)', () => {
  const r=auditMusikkTheoryIntegrity();
  assert.equal(r.subject_id,'musikk');
  assert.equal(r.status,'STRICTLY_PROVEN');
  assert.equal(r.proof_scope,'per_canonical_major_field');
  assert.equal(r.completion_status_read_only,true);
  assert.equal(r.content_rewrite_required,false);
  assert.equal(r.summary.canonicalMajorFields,8);
  assert.equal(r.summary.fieldsStrictlyProven,8);
  assert.equal(r.summary.theoryObjects,16);
  assert.equal(r.summary.scholarlySources,16);
  assert.equal(r.summary.personWorkBindings,16);
  assert.equal(r.summary.claimBindings,16);
  assert.equal(r.summary.actualProseBindings,16);
  assert.equal(r.summary.explicitProofBridges,16);
  assert.equal(r.summary.substantiveContentGapsProven,0);
  assert.equal(r.fields.length,8);
  assert.ok(r.fields.every(field=>field.strictlyProven===true&&field.theoryObjectCount===2&&field.proseBindingCount===2));
});
