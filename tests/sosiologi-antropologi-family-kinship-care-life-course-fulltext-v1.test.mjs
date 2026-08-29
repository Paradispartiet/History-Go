import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/audit-sosiologi-antropologi-family-kinship-care-life-course-fulltext-v1.mjs';

test('familie, slektskap, omsorg og livsløp er materialisert med fulltekst, claimspor og ærlig 6/12-status', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.domainsMaterialized, 6);
  assert.equal(report.counts.paragraphs, 32);
  assert.equal(report.counts.verifiedClaims, 32);
  assert.ok(report.six_part_quality_review.total >= 27);
});

