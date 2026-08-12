import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvHistoryMovementsHistoriographySourceBriefV1 } from '../scripts/brief-film-tv-history-movements-historiography-sources-v1.mjs';

test('fjerde planenhet har komplett og deterministisk kilde- og claimbrief', () => {
  const result = auditFilmTvHistoryMovementsHistoriographySourceBriefV1();
  assert.deepEqual(result.report.summary, {
    emne_count: 10,
    source_count: 20,
    case_count: 18,
    planned_claim_count: 35,
    planned_claim_counts_by_emne: [4, 4, 4, 3, 4, 3, 3, 3, 3, 4],
    proposed_module_count: 4,
    registered_chapter_count_delta: 1,
    resolved_claim_count: 35
  });
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('claim- og modulomfanget følger historiske problemgrenser', () => {
  const result = auditFilmTvHistoryMovementsHistoriographySourceBriefV1();
  assert.equal(new Set(result.topicBriefs.map((topic) => topic.planned_claims.length)).size, 2);
  assert.equal(new Set(result.brief.proposed_module_order.map((module) => module.emne_ids.length)).size, 2);
  assert.ok(result.topicBriefs.every((topic) => topic.source_ids.length >= 3 && topic.case_ids.length >= 2 && topic.method_ids.length >= 1 && topic.canonical_boundary));
});

test('periodiseringen blander objektspor og historiografi uten universell Hollywood-linje', () => {
  const result = auditFilmTvHistoryMovementsHistoriographySourceBriefV1();
  const roles = result.brief.sources.map((row) => row.evidence_role);
  assert.ok(roles.some((role) => /object-record|primary-trace|production-trace/.test(role)));
  assert.ok(roles.some((role) => /historiography/.test(role)));
  assert.equal(result.brief.source_policy.periodization_requires_object_records_and_historiography, true);
  assert.equal(result.brief.production_requirements.hollywood_must_not_be_universal_periodization, true);
});

test('alle casekilder er tilgjengelige i emnet som bruker caset', () => {
  const result = auditFilmTvHistoryMovementsHistoriographySourceBriefV1();
  const cases = new Map(result.brief.case_candidates.map((row) => [row.id, row]));
  for (const topic of result.topicBriefs) {
    for (const caseId of topic.case_ids) {
      assert.ok(cases.get(caseId).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)));
    }
  }
});

test('briefen dokumenterer registrering først etter fulltekst- og evidensaudit', () => {
  const result = auditFilmTvHistoryMovementsHistoriographySourceBriefV1();
  assert.ok(result.plannedClaims.every((claim) => claim.status === 'resolved_to_verified_claim' && claim.final_claim_id === claim.id));
  assert.equal(result.brief.runtime_registration.registered, true);
  assert.equal(result.brief.runtime_registration.registration_after_full_chapter_gate, true);
  assert.equal(result.registry.subjects.film_tv.chapters.some((chapter) => chapter.id === 'filmhistorie-bevegelser-og-historiografi'), true);
  assert.ok(['film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'television_platforms_participation_source_brief_complete_full_chapter_production', 'television_platforms_participation_full_chapter_complete_next_unit_source_brief'].includes(result.status.subjects.find((row) => row.id === 'film_tv').nextGate));
});

test('arkivforvaltning og kulturarvseffekt forblir eksplisitt utenfor enheten', () => {
  const result = auditFilmTvHistoryMovementsHistoriographySourceBriefV1();
  assert.match(result.unit.overlap_boundary, /arkivets bevaringspraksis og kulturarvseffekter eies i sluttfasen/);
  assert.equal(result.brief.source_policy.archive_management_and_preservation_practice_remain_outside_this_unit, true);
  assert.equal(result.brief.production_requirements.archive_preservation_and_cultural_heritage_effects_remain_outside_scope, true);
});
