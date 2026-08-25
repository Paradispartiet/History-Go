#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthMentalHealthSourceBriefV1 } from '../scripts/brief-helse-mental-health-sources-v1.mjs';
const read = (p) => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));

test('Psykisk helse source brief passes scientific source-first audit', () => {
  const r = auditHealthMentalHealthSourceBriefV1();
  assert.equal(r.report.status, 'high_quality_source_brief_ready_for_fulltext_not_scientific_completion');
  assert.equal(r.topics.length, 8);
  assert.equal(r.sources.length, 15);
  assert.equal(r.scenarios.length, 6);
  assert.equal(r.claims.length, 32);
  assert.equal(r.report.summary.proposed_module_count, 4);
  assert.equal(r.report.quality_assessment.total, 29);
  assert.ok(Object.values(r.gates).every(Boolean));
});

test('Psykisk helse preserves diagnostic and population evidence boundaries', () => {
  const r = auditHealthMentalHealthSourceBriefV1();
  for (const key of [
    'mental_health_not_absence_of_disorder',
    'condition_broader_than_disorder',
    'symptom_and_screening_not_diagnosis',
    'diagnostic_category_not_whole_person_or_fixed_cause',
    'population_prevalence_not_individual_probability',
    'determinant_or_association_not_individual_causation',
    'group_evidence_not_individual_recommendation',
  ]) assert.equal(r.gates[key], true, key);
});

test('Psykisk helse preserves service, recovery and rights boundaries', () => {
  const r = auditHealthMentalHealthSourceBriefV1();
  for (const key of [
    'access_not_effectiveness',
    'community_care_not_no_specialist_care',
    'stepped_mixed_care_not_rigid_ladder',
    'personal_recovery_not_symptom_remission',
    'recovery_oriented_care_not_guarantee',
    'peer_support_not_professional_replacement',
    'outcomes_are_multidimensional',
    'rights_standard_not_local_legal_rule',
    'autonomy_does_not_erase_safety_responsibility',
    'stigma_not_diagnostic_validity_question',
    'system_metric_not_patient_outcome',
  ]) assert.equal(r.gates[key], true, key);
});

test('Psykisk helse preserves Psychology ownership and clinical safety', () => {
  const r = auditHealthMentalHealthSourceBriefV1();
  assert.equal(r.gates.psychology_theory_ownership_preserved, true);
  assert.equal(r.gates.clinical_safety_contract_blocking, true);
  assert.equal(r.gates.scenarios_non_individualizing_and_source_bound, true);
  assert.ok(r.claims.every((c) => c.status === 'planned_requires_fulltext_verification' && c.source_ids.length >= 3));
});

test('Psykisk helse source brief does not advance Health beyond 9/12', () => {
  const r = auditHealthMentalHealthSourceBriefV1();
  const registry = read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status = read('data/fagverk/subject_status.json').subjects.find((x) => x.id === 'helse');
  assert.equal(registry.editorialPlan.registeredChapterCount, 9);
  assert.equal(r.report.summary.registered_chapter_count_delta, 0);
  assert.equal(status.editorialStatus, 'chapters_in_progress');
  assert.equal(r.gates.future_chapter_remains_unregistered, true);
  assert.equal(r.gates.release_remains_on_nine_registered_health_chapters, true);
  assert.equal(r.gates.strict_completion_not_claimed, true);
});
