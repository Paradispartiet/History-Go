#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { audit } from '../scripts/audit-helse-epidemiology-fulltext-v1.mjs';

const read = (p) => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const ID = 'epidemiologi-design-mal-bias-confounding-og-kausalitet';
const DIR = `data/fagverk/helse/${ID}`;

test('Epidemiologi fulltekst oppfyller 6/12-kontrakten', () => {
  const r = audit();
  assert.equal(r.status, 'pass');
  assert.equal(r.six_part_quality_review.total, 29);
  assert.deepEqual(r.counts, {domainsCovered:6,targetDomains:12,modules:4,sections:8,paragraphs:32,verifiedClaims:32,inspectableSources:14,assessmentQuestions:8,decisionScenarios:6});
  assert.ok(Object.values(r.gates).every(Boolean));
});

test('Alle Epidemiologi-claims er verifiserte og gjensidig paragraph-sporet', () => {
  const chapter = read(`${DIR}.json`);
  const claimFile = read(`${DIR}/claims.json`);
  const modules = chapter.moduleFiles.map(read);
  const paragraphIds = modules.flatMap(m => m.sections.flatMap(s => s.paragraphIds));
  const traceIds = modules.flatMap(m => m.sections.flatMap(s => s.paragraphClaimIds)).flat();
  assert.equal(claimFile.claims.length, 32);
  assert.equal(new Set(paragraphIds).size, 32);
  assert.equal(new Set(traceIds).size, 32);
  for (const claim of claimFile.claims) {
    assert.equal(claim.status, 'verified');
    assert.ok(paragraphIds.includes(claim.paragraph_id));
    assert.ok(traceIds.includes(claim.id));
    assert.ok(claim.source_ids.length >= 3);
    assert.equal(claim.source_locators.length, claim.source_ids.length);
  }
});

test('Epidemiologi bevarer sentrale metodiske skillelinjer', () => {
  const source = read('data/fag/helse/epidemiology_source_claim_brief_v1.json');
  const p = source.source_policy;
  assert.equal(p.incidence_is_not_prevalence, true);
  assert.equal(p.risk_is_not_rate, true);
  assert.equal(p.odds_ratio_is_not_automatically_risk_ratio, true);
  assert.equal(p.association_is_not_causation, true);
  assert.equal(p.confounder_is_not_mediator, true);
  assert.equal(p.collider_adjustment_can_induce_bias, true);
  assert.equal(p.adjustment_does_not_guarantee_no_residual_or_unmeasured_confounding, true);
  assert.equal(p.statistical_significance_is_not_effect_size_or_importance, true);
  assert.equal(p.target_population_must_be_explicit_for_generalizability, true);
  assert.equal(p.transportability_requires_assumptions_and_overlap, true);
});

test('Epidemiologi fulltekst registreres nøyaktig én gang og Helse står 6/12', () => {
  const registry = read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status = read('data/fagverk/subject_status.json').subjects.find(row => row.id === 'helse');
  const release = read('data/fagverk/fagverk_release.json').subjects.helse;
  const emne = read('data/fag/helse/emner_helse_canonical_v1.json').find(row => row.emne_id === 'em_helse_epidemiologi');
  assert.equal(registry.editorialPlan.registeredChapterCount, 6);
  assert.equal(registry.chapters.filter(row => row.id === ID).length, 1);
  assert.equal(release.chapter_count, 6);
  assert.equal(status.editorialStatus, 'chapters_in_progress');
  assert.equal(status.nextGate, 'epidemiology_full_chapter_complete_next_domain_source_brief');
  assert.equal(emne.status, 'materialized');
});

test('Epidemiologi holder klinisk sikkerhetskontrakt blocking og individtolkning ute', () => {
  const safety = read('data/fag/helse/clinical_safety_contract_helse_v1.json');
  const brief = read(`${DIR}/brief.json`);
  const assessment = read(`${DIR}/assessment.json`);
  assert.equal(safety.status, 'blocking');
  assert.equal(brief.safety.individualDiagnosis, false);
  assert.equal(brief.safety.individualPrognosis, false);
  assert.equal(brief.safety.individualTreatmentAdvice, false);
  assert.equal(brief.safety.individualRiskCalculation, false);
  assert.ok(assessment.questions.every(q => q.safety_mode === 'general_non_individualizing'));
});
