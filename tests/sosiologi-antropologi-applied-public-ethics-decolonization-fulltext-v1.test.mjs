import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sosiologi-antropologi-applied-public-ethics-decolonization-fulltext-v1.mjs';

test('felt 12 materialiserer anvendt og offentlig sosiologi, etikk og avkolonisering og beviser strict 12/12', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.domainsMaterialized, 12);
  assert.equal(report.counts.paragraphs, 32);
  assert.equal(report.counts.verifiedClaims, 32);
  assert.equal(report.gates.strictCompletionProven, true);
  assert.ok(report.six_part_quality_review.total >= 27);
});
