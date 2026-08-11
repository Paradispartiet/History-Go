import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvNarrativeViewpointGenreSourceBriefV1, buildFilmTvNarrativeViewpointGenreSourceBriefV1 } from '../scripts/brief-film-tv-narrative-viewpoint-genre-sources-v1.mjs';

test('andre planenhet har komplett og deterministisk kilde- og claimbrief', () => {
  const result = auditFilmTvNarrativeViewpointGenreSourceBriefV1();
  assert.deepEqual(buildFilmTvNarrativeViewpointGenreSourceBriefV1().report, result.report);
  assert.deepEqual(result.report.summary, {
    emne_count: 5,
    source_count: 12,
    case_count: 6,
    film_case_count: 5,
    television_case_count: 1,
    planned_claim_count: 13,
    planned_claim_counts_by_emne: [3, 2, 3, 2, 3],
    proposed_module_count: 3,
    registered_chapter_count_delta: 0
  });
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('claim- og modulomfanget følger faglige problemgrenser, ikke likhetskvoter', () => {
  const result = auditFilmTvNarrativeViewpointGenreSourceBriefV1();
  assert.equal(new Set(result.topicBriefs.map((topic) => topic.planned_claims.length)).size, 2);
  assert.equal(new Set(result.brief.proposed_module_order.map((module) => module.emne_ids.length)).size, 2);
  assert.ok(result.topicBriefs.every((topic) => topic.source_ids.length >= 3 && topic.case_ids.length >= 2 && topic.method_ids.length >= 1 && topic.canonical_boundary));
});

test('film og TV er dokumentert, men kapitlet venter på fulltekstporten', () => {
  const result = auditFilmTvNarrativeViewpointGenreSourceBriefV1();
  assert.ok(result.brief.case_candidates.some((row) => row.medium === 'film'));
  assert.ok(result.brief.case_candidates.some((row) => row.medium === 'television-series'));
  assert.ok(result.plannedClaims.every((claim) => claim.status === 'planned_requires_fulltext_verification'));
  assert.equal(result.brief.runtime_registration.registered, false);
  assert.equal(result.brief.runtime_registration.allowed_before_full_chapter_gate, false);
  assert.equal(result.registry.subjects.film_tv.chapters.some((chapter) => chapter.id === 'fortelling-synsvinkel-og-sjanger'), false);
  assert.equal(result.status.subjects.find((row) => row.id === 'film_tv').nextGate, 'narrative_viewpoint_genre_source_brief_complete_full_chapter_production');
});

test('alle casekilder er tilgjengelige i emnet som bruker caset', () => {
  const result = auditFilmTvNarrativeViewpointGenreSourceBriefV1();
  const cases = new Map(result.brief.case_candidates.map((row) => [row.id, row]));
  for (const topic of result.topicBriefs) {
    for (const caseId of topic.case_ids) {
      assert.ok(cases.get(caseId).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)));
    }
  }
});

test('serialitet og format forblir neste planenhets ansvar', () => {
  const result = auditFilmTvNarrativeViewpointGenreSourceBriefV1();
  assert.equal(result.brief.production_requirements.television_case_must_not_expand_into_seriality_or_format_history, true);
  assert.match(result.unit.overlap_boundary, /serie- og formatlogikk behandles i neste enhet/);
  assert.ok(result.unit.emne_ids.every((id) => !/serial|episode|sesong|format/.test(id)));
});
