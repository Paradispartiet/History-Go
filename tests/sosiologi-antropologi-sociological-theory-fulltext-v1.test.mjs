import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/audit-sosiologi-antropologi-sociological-theory-fulltext-v1.mjs';

test('sosiologisk teori er materialisert med fulltekst, claimspor og ærlig 1/12-status', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.domainsMaterialized, 1);
  assert.equal(report.counts.paragraphs, 32);
  assert.equal(report.counts.verifiedClaims, 32);
  assert.ok(report.six_part_quality_review.total >= 27);
});
