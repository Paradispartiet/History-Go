import test from 'node:test';
import assert from 'node:assert/strict';
import { auditKunstTheoryIntegrity } from '../tools/audit-kunst-theory-integrity.mjs';

test('Kunst strict theory integrity proves every canonical major field (6/6)', () => {
  const r=auditKunstTheoryIntegrity();
  assert.equal(r.subject_id,'kunst');
  assert.equal(r.status,'STRICTLY_PROVEN');
  assert.equal(r.proof_scope,'per_canonical_major_field');
  assert.equal(r.completion_status_read_only,true);
  assert.equal(r.content_rewrite_required,false);
  assert.equal(r.summary.canonicalMajorFields,6);
  assert.equal(r.summary.fieldsStrictlyProven,6);
  assert.equal(r.summary.explicitProofBridges,0);
  assert.equal(r.summary.substantiveContentGapsProven,0);
  assert.equal(r.fields.length,6);
  assert.ok(r.fields.every(field=>field.strictlyProven===true));
});
