import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-utdanning-professions-teacher-role-fulltext-v1.mjs';

test('Profesjoner og lærerrollen materialiseres 13/14 med komplett claimspor og ansvarlige grenser', () => {
  const report = audit();
  assert.equal(report.counts.domainsCovered, 13);
  assert.equal(report.counts.paragraphs, 32);
  assert.equal(report.counts.verifiedClaims, 32);
  assert.equal(report.counts.inspectableSources, 13);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 29);
});
