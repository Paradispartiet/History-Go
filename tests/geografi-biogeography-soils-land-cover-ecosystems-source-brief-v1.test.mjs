import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-geografi-biogeography-soils-land-cover-ecosystems-sources-v1.mjs';

test('Geografi felt 6 source-first låser biogeografi, jord og arealdekke før materialisering', () => {
  const report = audit();
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.equal(report.domain_id, 'biogeografi_jord_arealdekke_okosystem');
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.decisionScenarios, 6);
  assert.equal(report.counts.plannedAssessments, 8);
  assert.equal(report.counts.reuseOwnerChapters, 3);
  assert.equal(report.six_part_quality_review.total, 30);
});
