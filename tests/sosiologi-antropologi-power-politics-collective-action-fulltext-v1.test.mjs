import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sosiologi-antropologi-power-politics-collective-action-fulltext-v1.mjs';

test('makt, politikk og kollektiv handling er strict reuse-materialisert med byte-bevart eier og ærlig 10/12-status', () => {
  const result = audit();
  assert.equal(result.status, 'pass');
  assert.equal(result.counts.domainsMaterialized, 10);
  assert.equal(result.counts.expansionParagraphs, 32);
  assert.equal(result.gates.ownerChapterAndClaimsBytePreserved, true);
  assert.equal(result.gates.categoryStatusStillExpansionPlanned, true);
  assert.equal(result.six_part_quality_review.total, 29);
});
