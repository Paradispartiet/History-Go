#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthMentalHealthFulltextV1 } from '../scripts/audit-helse-mental-health-fulltext-v1.mjs';
const read=p=>JSON.parse(fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));

test('Psykisk helse fulltext passes scientific service recovery and safety audit',()=>{
  const r=auditHealthMentalHealthFulltextV1();
  assert.equal(r.status,'pass');
  assert.equal(r.counts.domainsCovered,10);
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

test('Psykisk helse preserves diagnosis population and evidence boundaries',()=>{
  const r=auditHealthMentalHealthFulltextV1();
  for(const key of ['mentalHealthNotAbsenceOfDisorder','conditionBroaderThanDisorder','symptomNotDiagnosis','screeningNotDiagnosis','diagnosticCategoryNotWholePersonOrFixedEtiology','populationPrevalenceNotIndividualProbability','determinantAssociationNotIndividualCausation','groupEvidenceNotIndividualTreatmentRecommendation']) assert.equal(r.gates[key],true,key);
});

test('Psykisk helse preserves service recovery peer and rights boundaries',()=>{
  const r=auditHealthMentalHealthFulltextV1();
  for(const key of ['serviceAccessNotEffectiveness','communityCareNotAbsenceOfSpecialistCare','steppedMixedCareNotRigidLadder','personalRecoveryNotSymptomRemission','recoveryOrientationNotGuaranteedOutcome','peerSupportNotProfessionalReplacement','outcomesMultidimensional','rightsStandardNotLocalLegalRule','autonomyConsentNotAbsenceOfSafetyResponsibility','stigmaNotDiagnosticValidityQuestion','serviceSystemMetricNotPatientOutcome']) assert.equal(r.gates[key],true,key);
});

test('Psykisk helse preserves Psychology ownership and non-individual safety',()=>{
  const r=auditHealthMentalHealthFulltextV1();
  assert.equal(r.gates.psychologyTheoryOwnershipPreserved,true);
  assert.equal(r.gates.clinicalSafetyContractBlocking,true);
  assert.equal(r.gates.noIndividualDiagnosisRiskTriageTreatmentOrLegalAdvice,true);
});

test('Psykisk helse has reciprocal one-to-one paragraph claim trace',()=>{
  const id='psykisk-helse-lidelse-tjenester-recovery-og-rettigheter';
  const chapter=read(`data/fagverk/helse/${id}.json`),claims=read(`data/fagverk/helse/${id}/claims.json`).claims;
  const sections=chapter.moduleFiles.flatMap(file=>read(file).sections),paragraphIds=sections.flatMap(s=>s.paragraphIds),trace=sections.flatMap(s=>s.paragraphClaimIds);
  assert.equal(paragraphIds.length,32);assert.equal(new Set(paragraphIds).size,32);assert.equal(trace.length,32);assert.ok(trace.every(ids=>ids.length===1));assert.equal(new Set(trace.flat()).size,32);assert.ok(claims.every(c=>paragraphIds.includes(c.paragraph_id)));
});

test('Psykisk helse advances Health to ten of twelve without completion',()=>{
  const registry=read('data/fagverk/fagverk_registry.json').subjects.helse,status=read('data/fagverk/subject_status.json').subjects.find(x=>x.id==='helse'),emne=read('data/fag/helse/emner_helse_canonical_v1.json').find(x=>x.emne_id==='em_helse_psykisk_helse');
  assert.equal(registry.editorialPlan.registeredChapterCount,10);assert.equal(registry.editorialPlan.completedSourceBriefCount,10);assert.equal(status.editorialStatus,'chapters_in_progress');assert.equal(status.nextGate,'mental_health_full_chapter_complete_next_domain_source_brief');assert.equal(emne.status,'materialized');
});
