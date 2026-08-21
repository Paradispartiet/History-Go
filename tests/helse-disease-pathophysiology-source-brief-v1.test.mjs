import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthDiseasePathophysiologySourceBriefV1 } from '../scripts/brief-helse-disease-pathophysiology-sources-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));

test('sykdom/patofysiologi-briefen er source-first og ikke registrert som fulltekst', () => {
  const { brief, report, registry, status, manifest } = auditHealthDiseasePathophysiologySourceBriefV1();
  assert.equal(brief.scope.primary_domain_id, 'sykdom_patofysiologi');
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(registry.subjects.helse.chapters.length, 2);
  assert.equal(registry.subjects.helse.chapters.some((row) => row.id === brief.future_chapter_id), false);
  assert.deepEqual(manifest.helse.sourceClaimBriefs, [
    'data/fag/helse/medical_ethics_evidence_source_claim_brief_v1.json',
    'data/fag/helse/anatomy_physiology_source_claim_brief_v1.json',
    'data/fag/helse/disease_pathophysiology_source_claim_brief_v1.json'
  ]);
  const health = status.subjects.find((row) => row.id === 'helse');
  assert.deepEqual([health.navigationStatus, health.assessmentStatus, health.editorialStatus], ['materialized', 'audited', 'chapters_in_progress']);
  assert.equal(health.nextGate, 'disease_pathophysiology_source_brief_complete_full_chapter_production');
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('briefen låser mekanisme, kausalitet, biomarkørgrense og klinisk sikkerhet', () => {
  const { brief, report, allClaims } = auditHealthDiseasePathophysiologySourceBriefV1();
  assert.deepEqual([brief.sources.length, brief.topic_briefs.length, brief.decision_scenarios.length, allClaims.length], [14, 8, 6, 32]);
  assert.ok(allClaims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids.length >= 3));
  assert.equal(new Set(allClaims.map((row) => row.id)).size, 32);
  assert.equal(brief.source_policy.biomarker_is_not_mechanism_or_diagnosis_by_itself, true);
  assert.equal(brief.source_policy.genetic_risk_is_not_deterministic_without_appropriate_evidence, true);
  assert.equal(brief.production_requirements.clinical_safety_contract_is_blocking, true);
  assert.equal(report.quality_assessment.total, 29);
  assert.deepEqual([report.summary.completed_health_domains, report.summary.planned_health_domains], [2, 12]);
  assert.equal(report.summary.expanded_fagverk_strictly_proven, 18);
});
