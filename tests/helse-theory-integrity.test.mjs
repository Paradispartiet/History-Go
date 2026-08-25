import test from 'node:test';
import assert from 'node:assert/strict';
import { auditHelseTheoryIntegrity } from '../tools/audit-helse-theory-integrity.mjs';

test('Helse strict theory integrity proves every canonical major field (12/12)', () => {
  const result = auditHelseTheoryIntegrity();
  assert.equal(result.subject_id, 'helse');
  assert.equal(result.status, 'STRICTLY_PROVEN');
  assert.equal(result.proof_scope, 'per_canonical_major_field');
  assert.equal(result.profile, 'hybrid');
  assert.equal(result.completion_status_read_only, true);
  assert.equal(result.content_rewrite_required, false);
  assert.equal(result.person_work_binding, 'not_applicable_hybrid_without_named_person_provenance');
  assert.deepEqual(result.summary, {
    canonicalMajorFields: 12,
    fieldsStrictlyProven: 12,
    modelObjects: 24,
    scholarlySources: 24,
    contentRoleBindings: 72,
    actualProseBindings: 72,
    explicitProofBridges: 24,
    verifiedClaims: 384,
    registeredChapters: 12,
    substantiveContentGapsProven: 0,
  });
  assert.equal(result.fields.length, 12);
  assert.ok(result.fields.every((field) =>
    field.strictlyProven === true &&
    field.modelObjectCount === 2 &&
    field.scholarlySourceCount === 2 &&
    field.proseBindingCount === 6 &&
    field.explicitProofBridgeCount === 2 &&
    field.healthSafetyGuard === true
  ));
});
