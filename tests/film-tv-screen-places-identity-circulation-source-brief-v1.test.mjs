import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  auditFilmTvScreenPlacesIdentityCirculationSourceBriefV1,
  isFilmTvUnitTwelveOrLaterGate
} from '../scripts/brief-film-tv-screen-places-identity-circulation-sources-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const rowsFromManifest = (manifestPath, filesKey, rowsKey) =>
  read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);

test('tolvte planenhets kilde- og claimbrief har eksakt variabel dekning', () => {
  const built = auditFilmTvScreenPlacesIdentityCirculationSourceBriefV1();
  assert.deepEqual(built.report.summary, {
    emne_count: 11,
    source_count: 36,
    case_count: 33,
    planned_claim_count: 52,
    planned_claim_counts_by_emne: [5, 5, 4, 4, 5, 5, 5, 5, 5, 5, 4],
    proposed_module_count: 4,
    registered_chapter_count_delta: 0
  });
  assert.equal(built.report.complete_scope, 'source_and_claim_brief_only');
  assert.equal(Object.values(built.report.gates).every(Boolean), true);
});

test('alle kilde-, case- og claimreferanser er konkrete, brukte og resolvable', () => {
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
  const usedSources = new Set([...topics.flatMap((topic) => topic.source_ids), ...cases.flatMap((row) => row.source_ids)]);
  const usedCases = new Set(topics.flatMap((topic) => topic.case_ids));
  const claims = topics.flatMap((topic) => topic.planned_claims);

  assert.equal(sources.length, 36);
  assert.equal(cases.length, 33);
  assert.equal(claims.length, 52);
  assert.equal(sources.every((source) => /^https:\/\//.test(source.url) && source.source_location && source.territory), true);
  assert.equal(sources.every((source) => usedSources.has(source.id)), true);
  assert.equal(cases.every((row) => usedCases.has(row.id)), true);
  assert.equal(topics.every((topic) => topic.source_ids.every((id) => sourceIds.has(id))), true);
  assert.equal(topics.every((topic) => topic.case_ids.every((id) => caseIds.has(id))), true);
});

test('vist sted, opptakssted, fiktivt rom og lokal virkning har permanent evidensgrense', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_source_claim_brief_v1.json');
  assert.equal(brief.source_policy.shown_place_actual_shooting_location_fictional_space_and_documented_local_effect_are_distinct, true);
  assert.equal(brief.source_policy.shooting_location_is_not_identical_to_the_place_named_or_shown_in_the_work, true);
  assert.equal(brief.source_policy.fictional_and_composite_geographies_must_be_labelled, true);
  assert.equal(brief.source_policy.represented_place_is_not_automatic_evidence_of_lived_identity_belonging_or_local_effect, true);
  assert.equal(brief.source_policy.landmark_visibility_is_not_proof_of_local_social_or_economic_effect, true);
  assert.equal(brief.source_policy.production_intervention_consent_image_rights_film_tourism_and_local_effects_are_deferred_to_unit_13, true);
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.runtime_registration.allowed_before_full_chapter_gate, false);
});

test('kart, interiør, landskap, urfolk, identitet, myte og minne har distinkte grenser', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_source_claim_brief_v1.json');
  for (const key of [
    'maps_routes_geocoding_and_databases_document_spatial_relations_not_meaning_or_reception_alone',
    'interior_representation_actual_building_studio_set_and_digital_space_are_distinct',
    'landscape_atmosphere_is_an_audiovisual_construction_not_measured_audience_affect',
    'screened_nature_is_not_evidence_of_actual_environmental_condition',
    'rural_peripheral_and_arctic_geographies_are_not_homogeneous_or_empty',
    'indigenous_cases_require_authorship_language_territory_knowledge_position_and_source_control',
    'actual_identity_work_or_belonging_requires_person_or_community_evidence_not_representation_alone',
    'place_myth_is_a_historical_pattern_of_representation_not_a_synonym_for_falsehood',
    'personal_popular_public_archival_and_institutional_memory_are_distinct',
    'archive_absence_claims_require_collection_search_metadata_digitisation_and_gap_reporting'
  ]) {
    assert.equal(brief.source_policy[key], true, key);
  }
});

test('seksdelt kvalitetsvurdering består bare for det avgrensede briefscopet', () => {
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
  assert.equal(assessment.automation_limits.length >= 2, true);
});

test('runtime peker på enhet 12-briefen uten å registrere kapittelet for tidlig', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const film = status.subjects.find((row) => row.id === 'film_tv');
  assert.equal(
    registry.subjects.film_tv.canonicalModel.twelfthSourceClaimBrief,
    'data/fag/TV_og_Film/film_tv_screen_places_identity_circulation_source_claim_brief_v1.json'
  );
  assert.equal(isFilmTvUnitTwelveOrLaterGate(film.nextGate), true);
  const chapter = registry.subjects.film_tv.chapters.find((row) => row.id === 'skjermsteder-identitet-og-sirkulasjon');
  if (film.nextGate === 'screen_places_identity_circulation_source_brief_complete_full_chapter_production') {
    assert.equal(chapter, undefined);
  } else {
    assert.equal(chapter.file, 'data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon.json');
    assert.equal(chapter.claimsFile, 'data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon/claims.json');
    assert.equal(chapter.briefFile, 'data/fagverk/film_tv/skjermsteder-identitet-og-sirkulasjon/brief.json');
  }
});

test('briefmotoren inneholder ingen SCM-synk eller GitHub-push', () => {
  const source = fs.readFileSync(
    new URL('../scripts/brief-film-tv-screen-places-identity-circulation-sources-v1.mjs', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
});
