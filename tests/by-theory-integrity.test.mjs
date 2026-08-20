import test from 'node:test';
import assert from 'node:assert/strict';
import { auditByTheoryIntegrity } from '../tools/audit-by-theory-integrity.mjs';

test('By is strictly proven across all 12 canonical major fields', () => {
  const report = auditByTheoryIntegrity({ checkReport: true });
  assert.equal(report.status, 'STRICTLY_PROVEN');
  assert.equal(report.proof_scope, 'per_canonical_major_field');
  assert.equal(report.summary.canonicalMajorFields, 12);
  assert.equal(report.summary.fieldsStrictlyProven, 12);
  assert.equal(report.summary.fieldsUsingExplicitProofBridge, 1);
  assert.equal(report.summary.substantiveContentGapsProven, 0);
  assert.equal(report.completion_status_read_only, true);
  assert.equal(report.content_rewrite_required, false);
  assert.equal(report.fields.filter(field => field.strictlyProven).length, 12);
  assert.deepEqual(report.fields.filter(field => field.bridgeUsed).map(field => field.domainId), ['boligpolitikk_og_velferd']);
});
