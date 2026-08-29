import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/audit-sosiologi-antropologi-culture-religion-ritual-materiality-fulltext-v1.mjs';

test('kultur, religion, ritual og materialitet er materialisert med fulltekst, claimspor og ærlig 8/12-status', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.domainsMaterialized, 8);
  assert.equal(report.counts.paragraphs, 32);
  assert.equal(report.counts.verifiedClaims, 32);
  assert.ok(report.six_part_quality_review.total >= 27);
});
