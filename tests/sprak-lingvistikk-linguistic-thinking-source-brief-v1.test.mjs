import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-sprak-lingvistikk-linguistic-thinking-sources-v1.mjs';

test('Lingvistisk tenkning klargjøres source-first med språkdata, analysenivå, modalitet og etikk', () => {
  const report = audit();
  assert.equal(report.subject_id, 'litteratur');
  assert.equal(report.canonical_subcategory_id, 'sprak_lingvistikk');
  assert.equal(report.domain_id, 'lingvistisk_tenkning_sprak_data_analyse_evidens');
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.decisionScenarios, 6);
  assert.equal(report.counts.plannedAssessments, 8);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 30);
});
