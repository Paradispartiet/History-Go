import assert from 'node:assert/strict';
import test from 'node:test';
import { generateAndAudit } from '../scripts/brief-sosiologi-antropologi-inequality-class-gender-racialization-sources-v1.mjs';

test('ulikhet, klasse, kjønn og rasialisering er source-first klar uten å telle som materialisert', () => {
  const report = generateAndAudit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.ordinal, 5);
  assert.equal(report.counts.inspectableSources, 13);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.domainsMaterialized, 4);
  assert.ok(report.six_part_quality_review.total >= 27);
});

