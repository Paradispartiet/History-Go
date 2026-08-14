import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  auditFilmTvScreenPlacesIdentityCirculationSourceBriefV1,
  buildFilmTvScreenPlacesIdentityCirculationSourceBriefV1,
  isFilmTvUnitTwelveOrLaterGate
} from '../scripts/brief-film-tv-screen-places-identity-circulation-sources-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const rowsFromManifest = (manifestPath, filesKey, rowsKey) =>
  read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);
const versionAtLeast = (actual, minimum) => {
  const a = String(actual).split('.').map(Number);
  const b = String(minimum).split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    if ((a[index] || 0) !== (b[index] || 0)) return (a[index] || 0) > (b[index] || 0);
  }
  return true;
};

test('tolvte planenhets kilde- og claimbrief har eksakt variabel dekning', () => {
  const built = auditFilmTvScreenPlacesIdentityCirculationSourceBriefV1();
  assert.deepEqual(built.report.summary, {
    emne_count: 11,
    source_count: 36,
    case_count: 36,
    planned_claim_count: 49,
    planned_claim_counts_by_emne: [5, 5, 4, 4, 5, 5, 5, 4, 4, 4, 4],
    proposed_module_count: 4,
    registered_chapter_count_delta: 0
  });
  assert.equal(built.report.complete_scope, 'source_and_claim_brief_only');
  assert.equal(Object.values(built.report.gates).every(Boolean), true);
});

test('alle 36 kilder, 36 case og 49 claimplaner er konkrete og resolvable', () => {
  const sources = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_sources_v1.json',
    'source_files',
    'sources'
  );
  const cases = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_cases_v1.json',
    'case_files',
    'cases'
  );
  const topics = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_topic_claims_v1.json',
    'topic_claim_files',
    'topic_briefs'
  );
  const sourceIds = new Set(sources.map((source) => source.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const caseById = new Map(cases.map((row) => [row.id, row]));
  const usedSources = new Set([...topics.flatMap((topic) => topic.source_ids), ...cases.flatMap((row) => row.source_ids)]);
  const usedCases = new Set(topics.flatMap((topic) => topic.case_ids));
  const claims = topics.flatMap((topic) => topic.planned_claims);

  assert.equal(sources.length, 36);
  assert.equal(cases.length, 36);
  assert.equal(claims.length, 49);
  assert.equal(new Set(claims.map((claim) => claim.id)).size, 49);
  assert.equal(sources.every((source) => /^https:\/\//.test(source.url) && source.source_location && source.territory), true);
  assert.equal(sources.every((source) => usedSources.has(source.id)), true);
  assert.equal(cases.every((row) => usedCases.has(row.id)), true);
  assert.equal(topics.every((topic) => topic.source_ids.every((id) => sourceIds.has(id))), true);
  assert.equal(topics.every((topic) => topic.case_ids.every((id) => caseIds.has(id))), true);
  assert.equal(topics.every((topic) =>
    topic.case_ids.every((id) => caseById.get(id).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)))
  ), true);
  assert.equal(claims.every((claim) => claim.status === 'planned_requires_fulltext_verification'), true);
});

test('sted, location, rom, identitet, urfolkskilder og enhet 13 har permanente grenser', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_source_claim_brief_v1.json');
  assert.equal(brief.source_policy.depicted_place_filming_location_fictive_space_and_documented_local_effect_are_distinct, true);
  assert.equal(brief.source_policy.exact_location_match_is_not_proof_of_meaning_identity_belonging_or_local_effect, true);
  assert.equal(brief.source_policy.montage_sound_graphics_route_and_offscreen_space_can_construct_geography, true);
  assert.equal(brief.source_policy.interior_is_built_social_and_property_space_not_neutral_background, true);
  assert.equal(brief.source_policy.landscape_mood_is_relational_not_a_natural_essence_of_place, true);
  assert.equal(brief.source_policy.rural_peripheral_and_arctic_places_are_not_empty_timeless_or_homogeneous, true);
  assert.equal(brief.source_policy.indigenous_land_language_knowledge_and_identity_claims_prioritize_indigenous_or_community_sources, true);
  assert.equal(brief.source_policy.local_tourism_economic_social_environmental_and_consent_effects_require_place_specific_unit_13_evidence, true);
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.runtime_registration.allowed_before_full_chapter_gate, false);
});

test('ikonstatus, stedsmyte og skjermminne krever dokumentert prosess', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_source_claim_brief_v1.json');
  assert.equal(brief.source_policy.iconic_place_status_requires_documented_repetition_circulation_or_institutionalization, true);
  assert.equal(brief.source_policy.audiovisual_place_myth_is_historical_representational_process_not_place_essence, true);
  assert.equal(brief.source_policy.screen_memory_requires_traceable_reuse_revisiting_archive_or_public_practice, true);
  assert.equal(brief.source_policy.preservation_or_curation_is_not_automatic_collective_memory, true);
  assert.equal(brief.source_policy.mobility_travel_transit_migration_diaspora_displacement_and_exile_are_distinct, true);
});

test('seksdelt kvalitetsvurdering består med 29 av 30 for avgrenset briefscope', () => {
  const built = auditFilmTvScreenPlacesIdentityCirculationSourceBriefV1();
  const assessment = built.report.quality_assessment;
  assert.deepEqual(Object.keys(assessment.dimensions), [
    'correctness_and_evidence',
    'coverage_and_completion',
    'editorial_quality',
    'technical_integrity',
    'safety_and_responsibility',
    'maintainability_and_reproducibility'
  ]);
  assert.deepEqual(Object.values(assessment.dimensions).map((dimension) => dimension.score), [5, 5, 4, 5, 5, 5]);
  assert.equal(assessment.total_score, 29);
  assert.equal(assessment.conclusion, 'high_quality_source_claim_brief');
  assert.deepEqual(assessment.critical_deviations, []);
  assert.deepEqual(assessment.unresolved_blockers, []);
  assert.equal(assessment.full_chapter_assessed, false);
  assert.equal(Object.values(assessment.dimensions).every((dimension) =>
    dimension.evidence_gate_ids.length > 0 && dimension.evidence.length > 60
  ), true);
});

test('runtime avanserer monotont til enhet 12 uten å registrere kapitlet for tidlig', () => {
  const { registry, status, brief } = buildFilmTvScreenPlacesIdentityCirculationSourceBriefV1();
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const registered = registry.subjects.film_tv.chapters.find((row) => row.id === 'skjermsteder-identitet-og-sirkulasjon');

  assert.equal(versionAtLeast(registry.version, '2.96.0'), true);
  assert.equal(versionAtLeast(status.version, '1.89.0'), true);
  assert.ok(registry.updatedAt >= '2026-08-14');
  assert.ok(status.updatedAt >= '2026-08-14');
  assert.equal(
    registry.subjects.film_tv.canonicalModel.twelfthSourceClaimBrief,
    'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_source_claim_brief_v1.json'
  );
  assert.equal(isFilmTvUnitTwelveOrLaterGate(film.nextGate), true);
  assert.equal(
    isFilmTvUnitTwelveOrLaterGate('reception_participation_audience_methods_full_chapter_complete_next_unit_source_brief'),
    false
  );
  if (film.nextGate === 'screen_places_identity_circulation_source_brief_complete_full_chapter_production') {
    assert.equal(registered, undefined);
  } else {
    assert.equal(registered.file, 'data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon.json');
  }
  assert.equal(brief.status, 'source_claim_brief_complete_full_chapter_production');
});

test('briefmotoren inneholder ingen SCM-synk eller GitHub-push', () => {
  const source = fs.readFileSync(
    new URL('../scripts/brief-film-tv-screen-places-identity-circulation-sources-v1.mjs', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
});
