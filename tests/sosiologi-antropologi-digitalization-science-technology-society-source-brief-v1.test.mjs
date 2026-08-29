import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { generate } from '../scripts/brief-sosiologi-antropologi-digitalization-science-technology-society-sources-v1.mjs';

test('digitalisering, vitenskap, teknologi og samfunn er source-first klar uten å telle som materialisert', () => {
  const brief = generate();
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims);
  const used = new Set(claims.flatMap((claim) => claim.source_ids));
  const production = JSON.parse(fs.readFileSync('data/fag/politikk/sosiologi_antropologi/production_registry_v1.json', 'utf8'));
  const report = JSON.parse(fs.readFileSync('reports/fagverk/sosiologi-antropologi-digitalization-science-technology-society-source-brief-v1-audit.json', 'utf8'));
  assert.equal(brief.status, 'source_first_ready_not_materialized');
  assert.equal(brief.domain.ordinal, 11);
  assert.equal(brief.sources.length, 13);
  assert.equal(brief.topic_briefs.length, 8);
  assert.equal(claims.length, 32);
  assert.equal(brief.decision_scenarios.length, 6);
  assert.ok(claims.every((claim) => claim.source_ids.length >= 2));
  assert.ok(brief.sources.every((source) => source.url.startsWith('https://') && used.has(source.id)));
  assert.equal(brief.subcategory_upgrade_registration.registered, false);
  assert.equal(production.progress.materializedDomains, 10);
  assert.equal(production.progress.strictCompletionProven, false);
  assert.equal(report.status, 'pass');
  assert.equal(report.six_part_quality_review.total, 29);
});
