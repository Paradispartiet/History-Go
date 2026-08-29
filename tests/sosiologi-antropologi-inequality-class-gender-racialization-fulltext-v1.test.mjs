import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/audit-sosiologi-antropologi-inequality-class-gender-racialization-fulltext-v1.mjs';

test('ulikhet, klasse, kjønn og rasialisering er materialisert som byte-bevart strict reuse-overlay med ærlig 5/12-status', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.domainsMaterialized, 5);
  assert.equal(report.counts.preservedOwnerClaims, 45);
  assert.equal(report.counts.expansionParagraphs, 32);
  assert.equal(report.counts.expansionVerifiedClaims, 32);
  assert.equal(report.gates.ownerChapterAndClaimsBytePreserved, true);
  assert.ok(report.six_part_quality_review.total >= 27);
});

