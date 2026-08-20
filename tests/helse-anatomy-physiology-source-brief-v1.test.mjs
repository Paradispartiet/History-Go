import test from 'node:test';
import assert from 'node:assert/strict';
import { auditHealthAnatomyPhysiologySourceBriefV1 } from '../scripts/brief-helse-anatomy-physiology-sources-v1.mjs';

test('anatomi/fysiologi-briefen er source-first og ikke feilregistrert som fulltekst', () => {
  const { brief, report, registry, status, manifest } = auditHealthAnatomyPhysiologySourceBriefV1();
  assert.equal(brief.scope.primary_domain_id, 'anatomi_fysiologi');
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(registry.subjects.helse.chapters.length, 1);
  assert.ok(!registry.subjects.helse.chapters.some((row) => row.id === brief.future_chapter_id));
  assert.deepEqual(manifest.helse.sourceClaimBriefs, [
    'data/fag/helse/medical_ethics_evidence_source_claim_brief_v1.json',
    'data/fag/helse/anatomy_physiology_source_claim_brief_v1.json'
  ]);
  const health = status.subjects.find((row) => row.id === 'helse');
  assert.deepEqual([health.navigationStatus, health.assessmentStatus, health.editorialStatus], ['materialized', 'audited', 'chapters_in_progress']);
  assert.equal(health.nextGate, 'anatomy_physiology_source_brief_complete_full_chapter_production');
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('briefen låser referanseramme, mekanisme, regulering og klinisk grense', () => {
  const { brief, report, allClaims } = auditHealthAnatomyPhysiologySourceBriefV1();
  assert.deepEqual([brief.sources.length, brief.topic_briefs.length, brief.decision_scenarios.length, allClaims.length], [14, 8, 6, 32]);
  assert.ok(allClaims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 3));
  assert.equal(new Set(allClaims.map((row) => row.id)).size, 32);
  assert.equal(brief.source_policy.normal_range_is_not_individual_diagnosis, true);
  assert.equal(brief.production_requirements.clinical_safety_contract_is_blocking, true);
  assert.equal(report.quality_assessment.total, 29);
  assert.equal(report.summary.expanded_fagverk_strictly_proven, 18);
});
