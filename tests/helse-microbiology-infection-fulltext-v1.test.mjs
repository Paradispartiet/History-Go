#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthMicrobiologyInfectionFulltextV1 } from '../scripts/audit-helse-microbiology-infection-fulltext-v1.mjs';

const read=(p)=>JSON.parse(fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));

test('Mikrobiologi og infeksjon fulltext passes scientific and safety audit',()=>{
  const r=auditHealthMicrobiologyInfectionFulltextV1();
  assert.equal(r.status,'pass');
  assert.equal(r.counts.domainsCovered,7);
  assert.equal(r.counts.targetDomains,12);
  assert.equal(r.counts.modules,4);
  assert.equal(r.counts.sections,8);
  assert.equal(r.counts.paragraphs,32);
  assert.equal(r.counts.verifiedClaims,32);
  assert.equal(r.counts.inspectableSources,14);
  assert.equal(r.counts.assessmentQuestions,8);
  assert.equal(r.counts.decisionScenarios,6);
  assert.equal(r.six_part_quality_review.total,29);
  assert.ok(Object.values(r.gates).every(Boolean));
});

test('Mikrobiologi og infeksjon keeps detection, colonization, infection and disease distinct',()=>{
  const r=auditHealthMicrobiologyInfectionFulltextV1();
  assert.equal(r.gates.colonizationNotInfectionDisease,true);
  assert.equal(r.gates.microbeDetectionNotDisease,true);
  assert.equal(r.gates.nucleicAcidDetectionNotAutomaticallyActiveDisease,true);
  assert.equal(r.gates.pathogenicityNotVirulence,true);
});

test('Mikrobiologi og infeksjon keeps transmission, AST and decontamination boundaries explicit',()=>{
  const r=auditHealthMicrobiologyInfectionFulltextV1();
  assert.equal(r.gates.exposureNotTransmissionAndTransmissionNotDisease,true);
  assert.equal(r.gates.inVitroSusceptibilityNotGuaranteedClinicalOutcome,true);
  assert.equal(r.gates.cleaningDisinfectionSterilizationDistinct,true);
});

test('Mikrobiologi og infeksjon genomic evidence does not overclaim direct transmission',()=>{
  const r=auditHealthMicrobiologyInfectionFulltextV1();
  assert.equal(r.gates.genomicSimilarityNotDirectTransmissionProof,true);
  assert.equal(r.gates.amrSurveillanceNotIndividualAntibioticAdvice,true);
});

test('Mikrobiologi og infeksjon has reciprocal one-to-one paragraph claim trace',()=>{
  const id='mikrobiologi-infeksjon-mikrober-smitte-vertrespons-og-resistens';
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

test('Mikrobiologi og infeksjon advances Health to seven of twelve without completion',()=>{
  const registry=read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status=read('data/fagverk/subject_status.json').subjects.find((row)=>row.id==='helse');
  const emne=read('data/fag/helse/emner_helse_canonical_v1.json').find((row)=>row.emne_id==='em_helse_mikrobiologi_infeksjon');
  assert.equal(registry.editorialPlan.registeredChapterCount,7);
  assert.equal(registry.editorialPlan.completedSourceBriefCount,7);
  assert.equal(status.editorialStatus,'chapters_in_progress');
  assert.equal(status.nextGate,'microbiology_infection_full_chapter_complete_next_domain_source_brief');
  assert.equal(emne.status,'materialized');
});
