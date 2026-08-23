#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthEpidemiologySourceBriefV1 } from '../scripts/brief-helse-epidemiology-sources-v1.mjs';

const read = (p) => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));

test('Epidemiologi source brief has complete source-first scientific contract', () => {
  const built = auditHealthEpidemiologySourceBriefV1();
  assert.equal(built.report.quality_assessment.total, 29);
  assert.equal(built.sources.length, 14);
  assert.equal(built.topics.length, 8);
  assert.equal(built.scenarios.length, 6);
  assert.equal(built.claims.length, 32);
  assert.ok(Object.values(built.gates).every(Boolean));
  assert.equal(built.brief.runtime_registration.registered, false);
  assert.equal(built.brief.metadata_registration.deferred_until_fulltext, true);
  assert.equal(built.brief.next_gate, 'epidemiology_source_brief_complete_full_chapter_production');
});

test('Epidemiologi planned claims are source-bound and not overstated as verified', () => {
  const built = auditHealthEpidemiologySourceBriefV1();
  const sourceIds = new Set(built.sources.map((row) => row.id));
  for (const claim of built.claims) {
    assert.equal(claim.status, 'planned_requires_fulltext_verification');
    assert.ok(claim.source_ids.length >= 3);
    assert.ok(claim.source_ids.every((id) => sourceIds.has(id)));
  }
});

test('Epidemiologi keeps frequency and association measures distinct', () => {
  const p = auditHealthEpidemiologySourceBriefV1().brief.source_policy;
  assert.equal(p.incidence_is_not_prevalence, true);
  assert.equal(p.risk_is_not_rate, true);
  assert.equal(p.odds_ratio_is_not_automatically_risk_ratio, true);
  assert.equal(p.association_is_not_causation, true);
});

test('Epidemiologi keeps confounding, mediation and collider structure distinct', () => {
  const p = auditHealthEpidemiologySourceBriefV1().brief.source_policy;
  assert.equal(p.confounder_is_not_mediator, true);
  assert.equal(p.collider_adjustment_can_induce_bias, true);
  assert.equal(p.adjustment_does_not_guarantee_no_residual_or_unmeasured_confounding, true);
  assert.equal(p.systematic_bias_is_not_random_error, true);
});

test('Epidemiologi separates statistical precision from importance and transportability', () => {
  const p = auditHealthEpidemiologySourceBriefV1().brief.source_policy;
  assert.equal(p.statistical_significance_is_not_effect_size_or_importance, true);
  assert.equal(p.target_population_must_be_explicit_for_generalizability, true);
  assert.equal(p.transportability_requires_assumptions_and_overlap, true);
  assert.equal(p.no_individual_medical_advice, true);
});

test('Epidemiologi source-first step does not advance global Helse completion', () => {
  const registry = read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'helse');
  const release = read('data/fagverk/fagverk_release.json').subjects.helse;
  const emne = read('data/fag/helse/emner_helse_canonical_v1.json').find((row) => row.emne_id === 'em_helse_epidemiologi');
  assert.equal(registry.editorialPlan.registeredChapterCount, 5);
  assert.equal(registry.chapters.length, 5);
  assert.equal(release.chapter_count, 5);
  assert.equal(status.editorialStatus, 'chapters_in_progress');
  assert.equal(emne.status, 'planned');
});
