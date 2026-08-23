#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthMicrobiologyInfectionSourceBriefV1 } from '../scripts/brief-helse-microbiology-infection-sources-v1.mjs';

const read = (p) => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));

test('Mikrobiologi og infeksjon source brief has complete source-first scientific contract', () => {
  const built = auditHealthMicrobiologyInfectionSourceBriefV1();
  assert.equal(built.report.quality_assessment.total, 29);
  assert.equal(built.sources.length, 14);
  assert.equal(built.topics.length, 8);
  assert.equal(built.scenarios.length, 6);
  assert.equal(built.claims.length, 32);
  assert.ok(Object.values(built.gates).every(Boolean));
  assert.equal(built.brief.runtime_registration.registered, false);
  assert.equal(built.brief.metadata_registration.deferred_until_fulltext, true);
  assert.equal(built.brief.next_gate, 'microbiology_infection_source_brief_complete_full_chapter_production');
});

test('Mikrobiologi og infeksjon planned claims remain source-bound and unverified until fulltext', () => {
  const built = auditHealthMicrobiologyInfectionSourceBriefV1();
  const sourceIds = new Set(built.sources.map((row) => row.id));
  for (const claim of built.claims) {
    assert.equal(claim.status, 'planned_requires_fulltext_verification');
    assert.ok(claim.source_ids.length >= 3);
    assert.ok(claim.source_ids.every((id) => sourceIds.has(id)));
  }
});

test('Mikrobiologi og infeksjon keeps colonization, infection and disease distinct', () => {
  const p = auditHealthMicrobiologyInfectionSourceBriefV1().brief.source_policy;
  assert.equal(p.colonization_is_not_infection, true);
  assert.equal(p.microbe_detection_is_not_disease, true);
  assert.equal(p.nucleic_acid_detection_is_not_automatically_active_disease, true);
  assert.equal(p.pathogenicity_is_not_virulence, true);
});

test('Mikrobiologi og infeksjon keeps transmission and laboratory interpretation bounded', () => {
  const p = auditHealthMicrobiologyInfectionSourceBriefV1().brief.source_policy;
  assert.equal(p.exposure_is_not_transmission, true);
  assert.equal(p.transmission_is_not_disease, true);
  assert.equal(p.in_vitro_susceptibility_is_not_guaranteed_clinical_outcome, true);
  assert.equal(p.disinfection_is_not_sterilization, true);
});

test('Mikrobiologi og infeksjon keeps genomic similarity below direct-transmission proof', () => {
  const p = auditHealthMicrobiologyInfectionSourceBriefV1().brief.source_policy;
  assert.equal(p.genomic_similarity_is_not_proof_of_direct_transmission, true);
  assert.equal(p.amr_surveillance_is_population_level_not_individual_advice, true);
  assert.equal(p.no_individual_medical_advice, true);
});

test('Mikrobiologi og infeksjon source-first step does not advance global Helse completion', () => {
  const registry = read('data/fagverk/fagverk_registry.json').subjects.helse;
  const status = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'helse');
  const release = read('data/fagverk/fagverk_release.json').subjects.helse;
  const emne = read('data/fag/helse/emner_helse_canonical_v1.json').find((row) => row.emne_id === 'em_helse_mikrobiologi_infeksjon');
  assert.equal(registry.editorialPlan.registeredChapterCount, 6);
  assert.equal(registry.chapters.length, 6);
  assert.equal(release.chapter_count, 6);
  assert.equal(status.editorialStatus, 'chapters_in_progress');
  assert.equal(emne.status, 'planned');
});
