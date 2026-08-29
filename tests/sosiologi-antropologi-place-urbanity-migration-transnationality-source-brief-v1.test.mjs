import assert from 'node:assert/strict';
import test from 'node:test';
import { generateAndAudit } from '../scripts/brief-sosiologi-antropologi-place-urbanity-migration-transnationality-sources-v1.mjs';

test('sted, by, migrasjon og transnasjonalitet er source-first klar uten å telle som materialisert', () => {
  const report = generateAndAudit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.ordinal, 9);
  assert.equal(report.counts.inspectableSources, 13);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.domainsMaterialized, 8);
  assert.ok(report.six_part_quality_review.total >= 27);
});
