import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/audit-sosiologi-antropologi-anthropological-theory-fulltext-v1.mjs';

test('antropologisk teori er materialisert med fulltekst, claimspor og ærlig 2/12-status', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.domainsMaterialized, 2);
  assert.equal(report.counts.paragraphs, 32);
  assert.equal(report.counts.verifiedClaims, 32);
  assert.ok(report.six_part_quality_review.total >= 27);
});
