import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvDocumentaryEvidenceEthicsSourceBriefV1 } from '../scripts/brief-film-tv-documentary-evidence-ethics-sources-v1.mjs';

test('sjette planenhet har komplett og deterministisk kilde- og claimbrief', () => {
  const result = auditFilmTvDocumentaryEvidenceEthicsSourceBriefV1();
  assert.deepEqual(result.report.summary, {
    emne_count: 15,
    source_count: 26,
    case_count: 25,
    planned_claim_count: 54,
    planned_claim_counts_by_emne: [4, 4, 4, 4, 3, 3, 3, 3, 4, 4, 3, 4, 4, 3, 4],
    proposed_module_count: 4,
    registered_chapter_count_delta: 1,
    resolved_claim_count: 54
  });
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('claim- og modulomfanget følger problemgrensene', () => {
  const result = auditFilmTvDocumentaryEvidenceEthicsSourceBriefV1();
  assert.equal(new Set(result.topicBriefs.map((topic) => topic.planned_claims.length)).size, 2);
  assert.equal(new Set(result.brief.proposed_module_order.map((module) => module.emne_ids.length)).size, 2);
  assert.ok(result.topicBriefs.every((topic) => topic.source_ids.length >= 3 && topic.case_ids.length >= 3 && topic.method_ids.length >= 1 && topic.canonical_boundary));
});

test('evidenspåstander skiller opptak, staging, rekonstruksjon, tolkning og etikk', () => {
  const result = auditFilmTvDocumentaryEvidenceEthicsSourceBriefV1();
  assert.equal(result.brief.source_policy.every_truth_claim_separates_recording_staging_reconstruction_interpretation_and_ethics, true);
  assert.equal(result.brief.production_requirements.image_status_must_distinguish_recording_reenactment_model_animation_and_synthetic_generation, true);
  const media = result.brief.case_candidates.map((row) => row.medium).join(' ');
  for (const needle of ['staged', 'reconstruction', 'synthetic', 'news', 'testimony']) assert.match(media, new RegExp(needle));
});

test('deltakeransvar går utover signert samtykke', () => {
  const result = auditFilmTvDocumentaryEvidenceEthicsSourceBriefV1();
  assert.equal(result.brief.source_policy.consent_is_a_process_not_a_complete_ethics_verdict, true);
  assert.equal(result.brief.production_requirements.participant_analysis_must_cover_consent_power_risk_use_change_and_aftereffects, true);
  const roles = result.brief.sources.map((row) => row.evidence_role);
  assert.ok(roles.includes('participant-accountability-framework'));
  assert.ok(roles.includes('regulatory-child-protection'));
  assert.ok(roles.includes('trauma-informed-interview-guidance'));
});

test('alle casekilder er tilgjengelige i emnet som bruker caset', () => {
  const result = auditFilmTvDocumentaryEvidenceEthicsSourceBriefV1();
  const cases = new Map(result.brief.case_candidates.map((row) => [row.id, row]));
  for (const topic of result.topicBriefs) {
    for (const caseId of topic.case_ids) assert.ok(cases.get(caseId).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)));
  }
});

test('kapitlet ble registrert først etter fulltekst- og evidensaudit', () => {
  const result = auditFilmTvDocumentaryEvidenceEthicsSourceBriefV1();
  assert.ok(result.plannedClaims.every((claim) => claim.status === 'resolved_to_verified_claim' && claim.final_claim_id === claim.id));
  assert.equal(result.brief.runtime_registration.registered, true);
  assert.equal(result.brief.runtime_registration.registration_after_full_chapter_gate, true);
  assert.equal(result.registry.subjects.film_tv.chapters.some((chapter) => chapter.id === 'dokumentar-evidens-og-etikk'), true);
  assert.equal(result.status.subjects.find((row) => row.id === 'film_tv').nextGate, 'representation_position_counterimages_full_chapter_complete_next_unit_source_brief');
});

test('naboområdene forblir eksplisitt utenfor enheten', () => {
  const result = auditFilmTvDocumentaryEvidenceEthicsSourceBriefV1();
  assert.equal(result.brief.source_policy.general_representation_identity_and_power_analysis_remains_in_next_unit, true);
  assert.equal(result.brief.source_policy.archive_preservation_access_rights_and_authenticity_remain_outside_this_unit, true);
  assert.equal(result.brief.production_requirements.general_identity_representation_and_counterimage_analysis_remains_outside_scope, true);
  assert.equal(result.brief.production_requirements.archive_preservation_rights_access_and_restoration_remain_outside_scope, true);
});
