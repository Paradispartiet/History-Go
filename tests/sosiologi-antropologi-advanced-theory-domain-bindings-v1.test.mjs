import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sosiologi-antropologi-advanced-theory-domain-bindings-v1.mjs';

test('alle 20 avanserte verk og 60 teorienheter er sekundærbundet til eksisterende materialiserte domener', () => {
  const report = audit();
  assert.equal(report.status, 'secondary_bindings_complete_fulltext_refresh_pending');
  assert.equal(report.counts.works, 20);
  assert.equal(report.counts.theories, 60);
  assert.equal(report.counts.materializedDomains, 12);
  assert.ok(report.counts.primaryDomains >= 7);
  assert.ok(report.counts.allReferencedDomains >= 10);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.passed, true);
});
