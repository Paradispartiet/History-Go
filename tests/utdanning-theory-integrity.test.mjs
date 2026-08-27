import test from 'node:test';
import assert from 'node:assert/strict';
import { auditUtdanningTheoryIntegrity } from '../tools/audit-utdanning-theory-integrity.mjs';

test('Utdanning har strict theory-integrity per canonicalt hovedfelt', () => {
  const report = auditUtdanningTheoryIntegrity();
  assert.equal(report.status, 'STRICTLY_PROVEN');
  assert.equal(report.summary.fieldsStrictlyProven, 14);
  assert.equal(report.summary.modelObjects, 28);
  assert.equal(report.summary.scholarlySources, 28);
  assert.equal(report.summary.actualProseBindings, 84);
  assert.equal(report.summary.verifiedClaims, 448);
  assert.ok(report.fields.every((field) => field.strictlyProven));
});
