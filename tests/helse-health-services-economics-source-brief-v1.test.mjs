#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {auditHealthHealthServicesEconomicsSourceBriefV1} from '../scripts/brief-helse-health-services-economics-sources-v1.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));

test('Helsetjenester/helseøkonomi source brief passes scientific source-first audit',()=>{
  const r=auditHealthHealthServicesEconomicsSourceBriefV1();
  assert.equal(r.report.status,'high_quality_source_brief_ready_for_fulltext_not_scientific_completion');
  assert.equal(r.topics.length,8);assert.equal(r.sources.length,15);assert.equal(r.scenarios.length,6);assert.equal(r.claims.length,32);
  assert.equal(r.report.summary.proposed_module_count,4);assert.equal(r.report.quality_assessment.total,29);
  assert.ok(Object.values(r.gates).every(Boolean));
});

test('Helsetjenester/helseøkonomi preserves system and economic distinctions',()=>{
  const r=auditHealthHealthServicesEconomicsSourceBriefV1();
  assert.equal(r.gates.system_economics_distinctions_locked,true);
  for(const key of ['coverage_is_not_access','access_is_not_quality_or_outcome','utilization_is_not_need','primary_care_is_not_identical_to_primary_health_care','integration_is_not_organizational_merger','quality_is_multidimensional','quality_indicator_is_not_causal_explanation','patient_safety_event_is_not_whole_system_rank','financing_function_is_not_delivery_model','payment_incentive_is_not_deterministic_behavior','pooling_is_not_service_quality','financial_protection_is_not_zero_cost_everywhere','opportunity_cost_requires_foregone_alternative','low_cost_is_not_cost_effectiveness','cost_effectiveness_is_not_budget_impact','economic_model_is_not_automatic_decision_rule','hta_is_decision_support_not_decision_replacement','priority_setting_is_not_cheapest_option','norwegian_priority_criteria_are_contextual_not_universal_law','efficiency_is_not_equity','group_difference_is_not_individual_prediction','benchmark_is_not_causal_counterfactual','more_spending_is_not_guaranteed_better_outcomes'])assert.equal(r.brief.source_policy[key],true,key);
});

test('Helsetjenester/helseøkonomi source brief is source-bound and non-individualizing',()=>{
  const r=auditHealthHealthServicesEconomicsSourceBriefV1();
  assert.equal(r.gates.every_source_used,true);assert.equal(r.gates.every_reference_resolves,true);assert.equal(r.gates.no_claim_overstated_as_verified,true);assert.equal(r.gates.scenarios_non_individualizing_and_source_bound,true);assert.equal(r.gates.clinical_safety_contract_blocking,true);
  assert.ok(r.claims.every(c=>c.status==='planned_requires_fulltext_verification'&&c.source_ids.length>=3));
});

test('Helsetjenester/helseøkonomi source brief does not advance Health beyond 11/12',()=>{
  const r=auditHealthHealthServicesEconomicsSourceBriefV1();
  const registry=read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status=read('data/fagverk/subject_status.json').subjects.find(x=>x.id==='helse');
  assert.equal(registry.editorialPlan.registeredChapterCount,11);assert.equal(r.report.summary.registered_chapter_count_delta,0);assert.equal(status.editorialStatus,'chapters_in_progress');assert.equal(r.gates.future_chapter_remains_unregistered,true);assert.equal(r.gates.release_remains_on_eleven_registered_health_chapters,true);assert.equal(r.gates.strict_completion_not_claimed,true);
});
