#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {auditHealthNutritionMetabolismSourceBriefV1} from '../scripts/brief-helse-nutrition-metabolism-sources-v1.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));

test('Ernæring/metabolisme source brief passes scientific source-first audit',()=>{
  const r=auditHealthNutritionMetabolismSourceBriefV1();
  assert.equal(r.report.status,'high_quality_source_brief_ready_for_fulltext_not_scientific_completion');
  assert.equal(r.topics.length,8);assert.equal(r.sources.length,15);assert.equal(r.scenarios.length,6);assert.equal(r.claims.length,32);
  assert.equal(r.report.summary.proposed_module_count,4);assert.equal(r.report.quality_assessment.total,29);
  assert.ok(Object.values(r.gates).every(Boolean));
});

test('Ernæring/metabolisme preserves core nutrition evidence boundaries',()=>{
  const r=auditHealthNutritionMetabolismSourceBriefV1();
  for(const key of ['energy_requirement_not_personal_calorie_target','energy_balance_is_dynamic','carbohydrate_quantity_quality_boundary','fat_quantity_quality_boundary','replacement_nutrient_explicit','protein_quantity_quality_boundary','content_not_bioavailability','drv_not_individual_prescription','deficiency_risk_not_diagnosis','pattern_association_not_causation','food_pattern_not_supplement_equivalence','population_guideline_not_individual_treatment'])assert.equal(r.gates[key],true,key);
});

test('Ernæring/metabolisme source brief is source-bound and non-individualizing',()=>{
  const r=auditHealthNutritionMetabolismSourceBriefV1();
  assert.equal(r.gates.every_source_used,true);assert.equal(r.gates.every_reference_resolves,true);assert.equal(r.gates.no_claim_overstated_as_verified,true);assert.equal(r.gates.scenarios_non_individualizing_and_source_bound,true);assert.equal(r.gates.clinical_safety_contract_blocking,true);
  assert.ok(r.claims.every(c=>c.status==='planned_requires_fulltext_verification'&&c.source_ids.length>=3));
});

test('Ernæring/metabolisme source brief does not advance Health beyond 8/12',()=>{
  const r=auditHealthNutritionMetabolismSourceBriefV1();
  const registry=read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status=read('data/fagverk/subject_status.json').subjects.find(x=>x.id==='helse');
  assert.equal(registry.editorialPlan.registeredChapterCount,8);assert.equal(r.report.summary.registered_chapter_count_delta,0);assert.equal(status.editorialStatus,'chapters_in_progress');assert.equal(r.gates.future_chapter_remains_unregistered,true);assert.equal(r.gates.release_remains_on_eight_registered_health_chapters,true);assert.equal(r.gates.strict_completion_not_claimed,true);
});
