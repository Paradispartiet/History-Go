import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthDiseasePathophysiologySourceBriefV1 } from '../scripts/brief-helse-disease-pathophysiology-sources-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));

test('sykdom/patofysiologi-briefen er source-first og global status forblir 2/12', () => {
  const { brief, report, gates } = auditHealthDiseasePathophysiologySourceBriefV1();
  const registry = read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'helse');
  const release = read('data/fagverk/fagverk_release.json').subjects.helse;

  assert.equal(brief.scope.primary_domain_id, 'sykdom_patofysiologi');
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.metadata_registration.deferred_until_fulltext, true);
  assert.equal(registry.chapters.length, 2);
  assert.equal(registry.chapters.some((row) => row.id === brief.future_chapter_id), false);
  assert.deepEqual(
    [status.navigationStatus, status.assessmentStatus, status.editorialStatus],
    ['materialized', 'audited', 'chapters_in_progress']
  );
  assert.equal(registry.editorialPlan.targetDomainCount, 12);
  assert.equal(registry.editorialPlan.registeredChapterCount, 2);
  assert.equal(release.chapter_count, 2);
  assert.ok(Object.values(gates).every(Boolean));
  assert.equal(report.summary.expanded_fagverk_strictly_proven, 18);
});

test('briefen låser mekanisme, kausalitet, biomarkørgrense og klinisk sikkerhet', () => {
  const { brief, report, claims, sources, topics, scenarios } =
    auditHealthDiseasePathophysiologySourceBriefV1();

  assert.deepEqual([sources.length, topics.length, scenarios.length, claims.length], [14, 8, 6, 32]);
  assert.equal(brief.common_topic_contract.claim_sources_inherit_topic_source_ids, true);
  assert.deepEqual(
    brief.common_topic_contract.method_ids,
    ['met_helse_mekanisme_modell', 'met_helse_kausal_vurdering']
  );
  for (const topic of topics) {
    const effectiveMethods = topic.method_ids || brief.common_topic_contract.method_ids;
    const effectiveBoundary = topic.boundary || brief.common_topic_contract.boundary;
    assert.deepEqual(effectiveMethods, ['met_helse_mekanisme_modell', 'met_helse_kausal_vurdering']);
    assert.ok(effectiveBoundary);
    for (const claim of topic.planned_claims) {
      assert.equal(claim.status || 'planned_requires_fulltext_verification', 'planned_requires_fulltext_verification');
      assert.ok((claim.source_ids || topic.source_ids).length >= 3);
    }
  }
  assert.equal(new Set(claims.map((row) => row.id)).size, 32);
  assert.equal(brief.source_policy.association_is_not_causal_mechanism, true);
  assert.equal(brief.source_policy.biomarker_is_not_mechanism_or_diagnosis, true);
  assert.equal(brief.source_policy.genetic_risk_is_not_deterministic_without_evidence, true);
  assert.equal(brief.production_requirements.clinical_safety_contract_is_blocking, true);
  assert.equal(report.quality_assessment.total, 29);
  assert.deepEqual(
    [report.summary.completed_health_domains, report.summary.planned_health_domains],
    [2, 12]
  );
});
