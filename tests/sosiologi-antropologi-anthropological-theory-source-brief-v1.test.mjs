import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/brief-sosiologi-antropologi-anthropological-theory-sources-v1.mjs';

test('antropologisk teori klargjøres source-first uten å telle som materialisert',()=>{
  const report=audit();
  assert.equal(report.status,'pass');
  assert.equal(report.counts.verifiedSources,13);
  assert.equal(report.counts.plannedClaims,32);
  assert.ok(report.six_part_quality_review.total>=27);
});
