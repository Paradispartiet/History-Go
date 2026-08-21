#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthPublicHealthSourceBriefV1 } from '../scripts/brief-helse-public-health-sources-v1.mjs';

const read = (p) => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));

test('Folkehelse source brief has complete source-first scientific contract', () => {
  const built = auditHealthPublicHealthSourceBriefV1();
  assert.equal(built.report.quality_assessment.total, 29);
  assert.equal(built.sources.length, 14);
  assert.equal(built.topics.length, 8);
  assert.equal(built.scenarios.length, 6);
  assert.equal(built.claims.length, 32);
  assert.ok(Object.values(built.gates).every(Boolean));
  assert.equal(built.brief.runtime_registration.registered, false);
  assert.equal(built.brief.metadata_registration.deferred_until_fulltext, true);
  assert.equal(built.brief.next_gate, 'public_health_source_brief_complete_full_chapter_production');
});

test('Folkehelse planned claims are source-bound and not overstated as verified', () => {
  const built = auditHealthPublicHealthSourceBriefV1();
  const sourceIds = new Set(built.sources.map((row) => row.id));
  for (const claim of built.claims) {
    assert.equal(claim.status, 'planned_requires_fulltext_verification');
    assert.ok(claim.source_ids.length >= 3);
    assert.ok(claim.source_ids.every((id) => sourceIds.has(id)));
  }
});

test('Folkehelse keeps population evidence separate from individual medical inference', () => {
  const built = auditHealthPublicHealthSourceBriefV1();
  const p = built.brief.source_policy;
  assert.equal(p.population_distribution_is_not_individual_prediction, true);
  assert.equal(p.group_gradient_is_not_biological_determinism, true);
  assert.equal(p.health_promotion_is_not_clinical_treatment, true);
  assert.equal(p.population_strategy_is_not_individual_treatment_advice, true);
  assert.equal(p.no_individual_medical_advice, true);
});

test('Folkehelse distinguishes surveillance, survey uncertainty and evaluation', () => {
  const built = auditHealthPublicHealthSourceBriefV1();
  const p = built.brief.source_policy;
  assert.equal(p.surveillance_is_not_causal_proof, true);
  assert.equal(p.survey_estimate_depends_on_sampling_nonresponse_and_measurement, true);
  assert.equal(p.weighting_cannot_remove_unknown_nonresponse_bias, true);
  assert.equal(p.program_evaluation_is_not_identical_to_research_surveillance_or_monitoring, true);
  assert.equal(p.observed_change_is_not_automatically_intervention_effect, true);
});

test('Folkehelse source-first step does not advance global Helse completion', () => {
  const registry = read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'helse');
  const release = read('data/fagverk/fagverk_release.json').subjects.helse;
  const emne = read('data/fag/helse/emner_helse_canonical_v1.json').find((row) => row.emne_id === 'em_helse_folkehelse');
  assert.equal(registry.editorialPlan.registeredChapterCount, 4);
  assert.equal(registry.chapters.length, 4);
  assert.equal(release.chapter_count, 4);
  assert.equal(status.editorialStatus, 'chapters_in_progress');
  assert.equal(emne.status, 'planned');
});
