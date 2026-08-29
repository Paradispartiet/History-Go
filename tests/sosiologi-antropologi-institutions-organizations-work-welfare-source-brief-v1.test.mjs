import assert from 'node:assert/strict';
import test from 'node:test';
import { generateAndAudit } from '../scripts/brief-sosiologi-antropologi-institutions-organizations-work-welfare-sources-v1.mjs';

test('institusjoner, organisasjoner, arbeid og velferd er source-first klar uten å telle som materialisert', () => {
  const report = generateAndAudit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.ordinal, 7);
  assert.equal(report.counts.inspectableSources, 13);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.domainsMaterialized, 6);
  assert.ok(report.six_part_quality_review.total >= 27);
});

