import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvSerialityFormatAdaptationSourceBriefV1 } from '../scripts/brief-film-tv-seriality-format-adaptation-sources-v1.mjs';

test('tredje planenhet har komplett og deterministisk kilde- og claimbrief', () => {
  const result = auditFilmTvSerialityFormatAdaptationSourceBriefV1();
  assert.deepEqual(result.report.summary, {
    emne_count: 10,
    source_count: 16,
    case_count: 12,
    planned_claim_count: 28,
    planned_claim_counts_by_emne: [4, 2, 3, 3, 3, 3, 3, 2, 2, 3],
    proposed_module_count: 4,
    registered_chapter_count_delta: 1,
    resolved_claim_count: 28
  });
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('claim- og modulomfanget følger faglige problemgrenser', () => {
  const result = auditFilmTvSerialityFormatAdaptationSourceBriefV1();
  assert.equal(new Set(result.topicBriefs.map((topic) => topic.planned_claims.length)).size, 3);
  assert.equal(new Set(result.brief.proposed_module_order.map((module) => module.emne_ids.length)).size, 2);
  assert.ok(result.topicBriefs.every((topic) => topic.source_ids.length >= 3 && topic.case_ids.length >= 2 && topic.method_ids.length >= 1 && topic.canonical_boundary));
});

test('film, TV, sammenlignbare versjoner og repeterbare formater er dokumentert', () => {
  const result = auditFilmTvSerialityFormatAdaptationSourceBriefV1();
  const media = result.brief.case_candidates.map((row) => row.medium);
  assert.ok(media.some((value) => /film|cinema/.test(value)));
  assert.ok(media.some((value) => /television/.test(value)));
  assert.ok(media.some((value) => /remake|adaptation/.test(value)));
  assert.ok(media.some((value) => /competition-format/.test(value)));
});

test('alle casekilder er tilgjengelige i emnet som bruker caset', () => {
  const result = auditFilmTvSerialityFormatAdaptationSourceBriefV1();
  const cases = new Map(result.brief.case_candidates.map((row) => [row.id, row]));
  for (const topic of result.topicBriefs) {
    for (const caseId of topic.case_ids) {
      assert.ok(cases.get(caseId).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)));
    }
  }
});

test('briefen dokumenterer registrering først etter fulltekst- og evidensaudit', () => {
  const result = auditFilmTvSerialityFormatAdaptationSourceBriefV1();
  assert.ok(result.plannedClaims.every((claim) => claim.status === 'resolved_to_verified_claim' && claim.final_claim_id === claim.id));
  assert.equal(result.brief.runtime_registration.registered, true);
  assert.equal(result.brief.runtime_registration.registration_after_full_chapter_gate, true);
  assert.equal(result.registry.subjects.film_tv.chapters.some((chapter) => chapter.id === 'serialitet-format-og-adaptasjon'), true);
  assert.ok(['seriality_format_adaptation_full_chapter_complete_next_unit_source_brief', 'film_history_movements_historiography_source_brief_complete_full_chapter_production', 'film_history_movements_historiography_full_chapter_complete_next_unit_source_brief'].includes(result.status.subjects.find((row) => row.id === 'film_tv').nextGate));
});

test('industrirettigheter og produksjonsteknikk forblir eksplisitt utenfor enheten', () => {
  const result = auditFilmTvSerialityFormatAdaptationSourceBriefV1();
  assert.match(result.unit.overlap_boundary, /industriell lisensiering og distribusjon eies senere/);
  assert.equal(result.brief.source_policy.franchise_economics_remain_outside_this_unit, true);
  assert.equal(result.brief.production_requirements.rights_licensing_distribution_and_production_technique_remain_outside_scope, true);
});
