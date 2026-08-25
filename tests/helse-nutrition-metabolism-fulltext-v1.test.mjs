#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthNutritionMetabolismFulltextV1 } from '../scripts/audit-helse-nutrition-metabolism-fulltext-v1.mjs';

const read=(p)=>JSON.parse(fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));

test('Ernæring/metabolisme fulltext passes scientific and safety audit',()=>{
  const r=auditHealthNutritionMetabolismFulltextV1();
  assert.equal(r.status,'pass');
  assert.equal(r.counts.domainsCovered,9);
  assert.equal(r.counts.targetDomains,12);
  assert.equal(r.counts.modules,4);
  assert.equal(r.counts.sections,8);
  assert.equal(r.counts.paragraphs,32);
  assert.equal(r.counts.verifiedClaims,32);
  assert.equal(r.counts.inspectableSources,15);
  assert.equal(r.counts.assessmentQuestions,8);
  assert.equal(r.counts.decisionScenarios,6);
  assert.equal(r.six_part_quality_review.total,29);
  assert.ok(Object.values(r.gates).every(Boolean));
});

test('Ernæring/metabolisme keeps core nutrient distinctions explicit',()=>{
  const r=auditHealthNutritionMetabolismFulltextV1();
  assert.equal(r.gates.energyRequirementNotPersonalCalorieTarget,true);
  assert.equal(r.gates.dynamicEnergyBalanceNotSingleMealArithmetic,true);
  assert.equal(r.gates.carbohydrateQuantityNotQuality,true);
  assert.equal(r.gates.totalFatNotFatQuality,true);
  assert.equal(r.gates.replacementNutrientExplicit,true);
  assert.equal(r.gates.proteinQuantityNotProteinQuality,true);
  assert.equal(r.gates.nutrientContentNotBioavailability,true);
});

test('Ernæring/metabolisme keeps evidence and clinical boundaries explicit',()=>{
  const r=auditHealthNutritionMetabolismFulltextV1();
  assert.equal(r.gates.dietaryReferenceValueNotIndividualPrescription,true);
  assert.equal(r.gates.deficiencyRiskNotDiagnosis,true);
  assert.equal(r.gates.dietaryPatternAssociationNotCausality,true);
  assert.equal(r.gates.foodPatternEvidenceNotSupplementEquivalence,true);
  assert.equal(r.gates.populationGuidelineNotMedicalNutritionTherapy,true);
  assert.equal(r.gates.noIndividualDietCalorieSupplementOrDiagnosisAdvice,true);
});

test('Ernæring/metabolisme has reciprocal one-to-one paragraph claim trace',()=>{
  const id='ernaering-metabolisme-energi-naeringsstoffer-regulering-og-kostmonster';
  const chapter=read(`data/fagverk/helse/${id}.json`);
  const claims=read(`data/fagverk/helse/${id}/claims.json`).claims;
  const sections=chapter.moduleFiles.flatMap((file)=>read(file).sections);
  const paragraphIds=sections.flatMap((s)=>s.paragraphIds);
  const trace=sections.flatMap((s)=>s.paragraphClaimIds);
  assert.equal(paragraphIds.length,32);
  assert.equal(new Set(paragraphIds).size,32);
  assert.equal(trace.length,32);
  assert.ok(trace.every((ids)=>ids.length===1));
  assert.equal(new Set(trace.flat()).size,32);
  assert.ok(claims.every((c)=>paragraphIds.includes(c.paragraph_id)));
});

test('Ernæring/metabolisme advances Health to nine of twelve without completion',()=>{
  const registry=read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status=read('data/fagverk/subject_status.json').subjects.find((row)=>row.id==='helse');
  const emne=read('data/fag/helse/emner_helse_canonical_v1.json').find((row)=>row.emne_id==='em_helse_ernaering_metabolisme');
  assert.equal(registry.editorialPlan.registeredChapterCount,9);
  assert.equal(registry.editorialPlan.completedSourceBriefCount,9);
  assert.equal(status.editorialStatus,'chapters_in_progress');
  assert.equal(status.nextGate,'nutrition_metabolism_full_chapter_complete_next_domain_source_brief');
  assert.equal(emne.status,'materialized');
});
