#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthPharmacologyFulltextV1 } from '../scripts/audit-helse-pharmacology-fulltext-v1.mjs';

const read=(p)=>JSON.parse(fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8'));

test('Farmakologi fulltext passes scientific and safety audit',()=>{
  const r=auditHealthPharmacologyFulltextV1();
  assert.equal(r.status,'pass');
  assert.equal(r.counts.domainsCovered,8);
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

test('Farmakologi keeps core PD and PK distinctions explicit',()=>{
  const r=auditHealthPharmacologyFulltextV1();
  assert.equal(r.gates.pharmacodynamicsNotPharmacokinetics,true);
  assert.equal(r.gates.affinityNotEfficacy,true);
  assert.equal(r.gates.potencyNotMaximalEffect,true);
  assert.equal(r.gates.doseConcentrationResponseDistinct,true);
  assert.equal(r.gates.bioavailabilityNotAdministeredAmount,true);
  assert.equal(r.gates.clearanceNotEliminatedAmount,true);
  assert.equal(r.gates.halfLifeNotEffectDuration,true);
  assert.equal(r.gates.steadyStateNotInstantOrConstant,true);
});

test('Farmakologi keeps interaction and safety evidence boundaries explicit',()=>{
  const r=auditHealthPharmacologyFulltextV1();
  assert.equal(r.gates.interactionPotentialNotClinicalOutcome,true);
  assert.equal(r.gates.adverseEventNotAutomaticallyAdverseDrugReaction,true);
  assert.equal(r.gates.pharmacovigilanceSignalNotCausality,true);
  assert.equal(r.gates.populationPkPdNotIndividualDosingAdvice,true);
  assert.equal(r.gates.noIndividualMedicationSelectionDosingOrInterpretation,true);
});

test('Farmakologi has reciprocal one-to-one paragraph claim trace',()=>{
  const id='farmakologi-virkning-omsetning-dose-respons-og-legemiddelsikkerhet';
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

test('Farmakologi advances Health to eight of twelve without completion',()=>{
  const registry=read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status=read('data/fagverk/subject_status.json').subjects.find((row)=>row.id==='helse');
  const emne=read('data/fag/helse/emner_helse_canonical_v1.json').find((row)=>row.emne_id==='em_helse_farmakologi');
  assert.equal(registry.editorialPlan.registeredChapterCount,8);
  assert.equal(registry.editorialPlan.completedSourceBriefCount,8);
  assert.equal(status.editorialStatus,'chapters_in_progress');
  assert.equal(status.nextGate,'pharmacology_full_chapter_complete_next_domain_source_brief');
  assert.equal(emne.status,'materialized');
});
