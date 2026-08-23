#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {auditHealthRehabilitationFunctionSourceBriefV1} from '../scripts/brief-helse-rehabilitation-function-sources-v1.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));

test('Rehabilitering/funksjon source brief passes scientific source-first audit',()=>{
  const r=auditHealthRehabilitationFunctionSourceBriefV1();
  assert.equal(r.report.status,'high_quality_source_brief_ready_for_fulltext_not_scientific_completion');
  assert.equal(r.topics.length,8);assert.equal(r.sources.length,15);assert.equal(r.scenarios.length,6);assert.equal(r.claims.length,32);
  assert.equal(r.report.summary.proposed_module_count,4);assert.equal(r.report.quality_assessment.total,29);
  assert.ok(Object.values(r.gates).every(Boolean));
});

test('Rehabilitering/funksjon preserves ICF and rehabilitation distinctions',()=>{
  const r=auditHealthRehabilitationFunctionSourceBriefV1();
  for(const key of ['functioning_not_diagnosis','impairment_not_whole_disability','activity_not_participation','capacity_not_performance','environment_not_intrinsic_trait','diagnosis_not_fixed_disability_or_need','rehab_goal_not_cure_or_normalization','habilitation_not_identical_rehabilitation','baseline_severity_not_fixed_potential','assistive_product_not_rehab_failure','body_function_change_not_participation_change','measured_change_not_automatically_meaningful','person_goal_not_guaranteed_outcome','multidisciplinary_not_parallel_silos','coordination_plan_not_clinical_prescription','group_evidence_not_individual_plan_or_dose','access_not_quality_or_outcome','population_function_not_individual_prognosis','equity_includes_environment_and_system_barriers'])assert.equal(r.gates[key],true,key);
});

test('Rehabilitering/funksjon source brief is source-bound and non-individualizing',()=>{
  const r=auditHealthRehabilitationFunctionSourceBriefV1();
  assert.equal(r.gates.every_source_used,true);assert.equal(r.gates.every_reference_resolves,true);assert.equal(r.gates.no_claim_overstated_as_verified,true);assert.equal(r.gates.scenarios_non_individualizing_and_source_bound,true);assert.equal(r.gates.clinical_safety_contract_blocking,true);
  assert.ok(r.claims.every(c=>c.status==='planned_requires_fulltext_verification'&&c.source_ids.length>=3));
});

test('Rehabilitering/funksjon source brief does not advance Health beyond 10/12',()=>{
  const r=auditHealthRehabilitationFunctionSourceBriefV1();
  const registry=read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status=read('data/fagverk/subject_status.json').subjects.find(x=>x.id==='helse');
  assert.equal(registry.editorialPlan.registeredChapterCount,10);assert.equal(r.report.summary.registered_chapter_count_delta,0);assert.equal(status.editorialStatus,'chapters_in_progress');assert.equal(r.gates.future_chapter_remains_unregistered,true);assert.equal(r.gates.release_remains_on_ten_registered_health_chapters,true);assert.equal(r.gates.strict_completion_not_claimed,true);
});
