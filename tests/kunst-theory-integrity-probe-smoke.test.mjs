import test from 'node:test';
import assert from 'node:assert/strict';
import { probeKunstTheoryIntegrity } from '../tools/probe-kunst-theory-integrity.mjs';

test('Kunst theory integrity probe is read-only and covers six canonical fields', () => {
  const r=probeKunstTheoryIntegrity();
  assert.equal(r.subject_id,'kunst');
  assert.equal(r.mode,'read_only_diagnostic');
  assert.equal(r.completionStatusReadOnly,true);
  assert.equal(r.contentMutation,false);
  assert.equal(r.summary.canonicalMajorFields,6);
  assert.equal(r.fields.length,6);
  assert.equal(r.completeAudit.claims,140);
  assert.equal(r.completeAudit.sources,100);
});
