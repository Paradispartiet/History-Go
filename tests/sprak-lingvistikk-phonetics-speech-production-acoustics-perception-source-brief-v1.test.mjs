import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-sprak-lingvistikk-phonetics-speech-production-acoustics-perception-sources-v1.mjs';

test('Fonetikk klargjøres source-first med artikulasjon, akustikk, tidsmål, persepsjon og reproduserbarhet', () => {
  const report = audit();
  assert.equal(report.subject_id, 'litteratur');
  assert.equal(report.canonical_subcategory_id, 'sprak_lingvistikk');
  assert.equal(report.domain_id, 'fonetikk_taleproduksjon_akustikk_persepsjon');
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.deepEqual(report.counts, { verifiedSources:13, topicBriefs:8, plannedClaims:32, decisionScenarios:6, plannedAssessments:8 });
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 30);
});
