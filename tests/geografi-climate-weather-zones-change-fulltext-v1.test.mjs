import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-geografi-climate-weather-zones-change-fulltext-v1.mjs';

test('Geografi felt 4 fulltekst er source-first, reuse-safe og 4/8/32-komplett', () => {
  const report = audit();
  assert.equal(report.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.equal(report.domain_id, 'klima_vaer_klimasoner_endring');
  assert.equal(report.counts.modules, 4);
  assert.equal(report.counts.sections, 8);
  assert.equal(report.counts.paragraphs, 32);
  assert.equal(report.counts.verifiedClaims, 32);
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.assessments, 8);
  assert.equal(report.counts.decisionCases, 6);
  assert.equal(report.counts.reuseOwnerChapters, 1);
  assert.equal(report.six_part_quality_review.total, 30);
});
