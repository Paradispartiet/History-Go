import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditHealthMedicalEthicsEvidenceSourceBriefV1 } from '../scripts/brief-helse-medical-ethics-evidence-sources-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));

test('første Helse-source brief bevarer historisk planstatus etter kontrollert fulltekstregistrering', () => {
  const result = auditHealthMedicalEthicsEvidenceSourceBriefV1();
  const { brief, report, manifest, inventory } = result;

  assert.equal(brief.subject_id, 'helse');
  assert.equal(brief.scope.primary_domain_id, 'medisinsk_etikk_evidens');
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(read('data/fagverk/fagverk_registry.json').subjects.helse.chapters.length, 2);
  assert.equal(report.summary.registered_chapter_count_delta, 0);
  assert.equal(report.summary.expanded_fagverk_strictly_proven, 18);
  assert.equal(report.summary.expanded_fagverk_target, 20);
  assert.ok(Object.values(report.gates).every(Boolean));

  const healthStatus = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'helse');
  assert.deepEqual(
    [healthStatus.navigationStatus, healthStatus.assessmentStatus, healthStatus.editorialStatus],
    ['materialized', 'audited', 'chapters_in_progress']
  );
  assert.equal(healthStatus.nextGate, 'anatomy_physiology_full_chapter_complete_next_domain_source_brief');
  assert.ok(manifest.helse.sourceClaimBriefs.includes('data/fag/helse/medical_ethics_evidence_source_claim_brief_v1.json'));
  assert.ok(inventory.subjects.find((row) => row.id === 'helse').optionalManifestFields.includes('sourceClaimBriefs'));
});

test('briefen skiller autoritetstyper, planlagte claims og medisinske sikkerhetsgrenser', () => {
  const { brief, report, allPlannedClaims } = auditHealthMedicalEthicsEvidenceSourceBriefV1();
  assert.equal(brief.sources.length, 14);
  assert.equal(brief.topic_briefs.length, 8);
  assert.equal(brief.decision_scenarios.length, 6);
  assert.equal(allPlannedClaims.length, 32);
  assert.ok(allPlannedClaims.every((row) => row.status === 'planned_requires_fulltext_verification'));
  assert.equal(new Set(allPlannedClaims.map((row) => row.id)).size, 32);
  assert.equal(brief.source_policy.no_individual_medical_or_legal_advice, true);
  assert.equal(brief.production_requirements.clinical_safety_contract_is_blocking, true);
  assert.equal(brief.production_requirements.chapter_registration_only_after_fulltext_claim_source_audit, true);
  assert.equal(report.quality_assessment.total, 29);
  assert.equal(report.quality_assessment.conclusion, 'high_quality_source_brief_ready_for_fulltext_not_scientific_completion');
});
