import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvAudiovisualFormSourceBriefV1 } from '../scripts/brief-film-tv-audiovisual-form-sources-v1.mjs';

test('første planenhet har komplett og deterministisk kilde- og claimbrief', () => {
  const result = auditFilmTvAudiovisualFormSourceBriefV1();
  assert.deepEqual(result.report.summary, { emne_count: 10, source_count: 8, case_count: 7, planned_claim_count: 20, proposed_module_count: 3, registered_chapter_count_delta: 1, resolved_claim_count: 20 });
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('alle emner har kilder, case, metoder, grense og to løste claimplaner', () => {
  const result = auditFilmTvAudiovisualFormSourceBriefV1();
  assert.ok(result.topicBriefs.every((topic) => topic.source_ids.length >= 2 && topic.case_ids.length >= 1 && topic.method_ids.length >= 1 && topic.canonical_boundary));
  assert.ok(result.topicBriefs.every((topic) => topic.planned_claims.length === 2));
  assert.ok(result.plannedClaims.every((claim) => claim.status === 'resolved_to_verified_claim' && claim.final_claim_id === claim.id));
  assert.equal(new Set(result.plannedClaims.map((claim) => claim.id)).size, 20);
});

test('kapitlet ble registrert først etter fulltekst-, claim- og kildeporten', () => {
  const result = auditFilmTvAudiovisualFormSourceBriefV1();
  assert.equal(result.brief.runtime_registration.registered, true);
  assert.equal(result.brief.runtime_registration.registration_after_full_chapter_gate, true);
  assert.equal(result.registry.subjects.film_tv.chapters.some((chapter) => chapter.id === 'audiovisuell-form-og-sansing'), true);
  assert.ok(['audiovisual_form_full_chapter_complete_next_unit_source_brief', 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production', 'narrative_viewpoint_genre_full_chapter_complete_next_unit_source_brief', 'seriality_format_adaptation_source_brief_complete_full_chapter_production', 'seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief', 'television_platforms_participation_source_brief_complete_full_chapter_production', 'television_platforms_participation_full_chapter_complete_next_unit_source_brief'].includes(result.status.subjects.find((row) => row.id === 'film_tv').nextGate));
});
