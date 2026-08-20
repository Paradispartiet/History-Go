import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaeringslivTheoryIntegrity } from '../tools/audit-naeringsliv-theory-integrity.mjs';

test('Næringsliv strict theory integrity proves all six canonical major fields without rewriting content', () => {
  const r=auditNaeringslivTheoryIntegrity({checkReport:false});
  assert.equal(r.subject_id,'naeringsliv');
  assert.equal(r.status,'STRICTLY_PROVEN');
  assert.equal(r.proof_scope,'per_canonical_major_field');
  assert.equal(r.completion_status_read_only,true);
  assert.equal(r.content_rewrite_required,false);
  assert.equal(r.summary.canonicalMajorFields,6);
  assert.equal(r.summary.fieldsStrictlyProven,6);
  assert.equal(r.summary.coreEmners,36);
  assert.ok(r.summary.theoryCards>=24);
  assert.equal(r.summary.substantiveContentGapsProven,0);
  assert.equal(r.fields.length,6);
  assert.ok(r.fields.every(field=>field.strictlyProven===true));
  assert.ok(r.fields.every(field=>field.proseBoundTheoryExtensions===field.emneCount));
  assert.ok(r.fields.every(field=>field.rivalBoundExtensions===field.emneCount));
  assert.ok(r.fields.every(field=>field.limitationBoundExtensions===field.emneCount));
  assert.ok(r.fields.every(field=>field.verifiedProseBoundClaims>=12));
  assert.ok(r.fields.every(field=>field.authoritativeUsedSources>=4));
  assert.ok(r.fields.every(field=>field.hookCount===10));
});
