import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkTheoryIntegrity } from '../tools/audit-politikk-theory-integrity.mjs';

test('Politikk strict theory integrity proves all thirteen canonical major fields without rewriting content', () => {
  const r=auditPolitikkTheoryIntegrity({checkReport:false});
  assert.equal(r.subject_id,'politikk');
  assert.equal(r.status,'STRICTLY_PROVEN');
  assert.equal(r.proof_scope,'per_canonical_major_field');
  assert.equal(r.completion_status_read_only,true);
  assert.equal(r.content_rewrite_required,false);
  assert.equal(r.summary.canonicalMajorFields,13);
  assert.equal(r.summary.fieldsStrictlyProven,13);
  assert.equal(r.summary.canonicalEmners,123);
  assert.equal(r.summary.canonicalMethods,71);
  assert.equal(r.summary.canonicalHooks,152);
  assert.equal(r.summary.directProofFields,5);
  assert.equal(r.summary.explicitReadOnlySidecarFields,8);
  assert.equal(r.summary.substantiveContentGapsProven,0);
  assert.equal(r.sidecarFields.length,8);
  assert.equal(r.fields.length,13);
  assert.ok(r.fields.every(field=>field.strictlyProven===true));
  assert.ok(r.fields.every(field=>field.verifiedProseBoundClaims>=20));
  assert.ok(r.fields.every(field=>field.academicallyAppropriateUsedSources>=2));
  assert.ok(r.fields.every(field=>field.hookCount>0));
});
