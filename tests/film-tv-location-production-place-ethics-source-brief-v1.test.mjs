import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  auditFilmTvLocationProductionPlaceEthicsSourceBriefV1,
  isFilmTvUnitThirteenOrLaterGate
} from '../scripts/brief-film-tv-location-production-place-ethics-sources-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const rowsFromManifest = (manifestPath, filesKey, rowsKey) =>
  read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);

test('trettende planenhets kilde- og claimbrief har eksakt variabel dekning', () => {
  const built = auditFilmTvLocationProductionPlaceEthicsSourceBriefV1();
  assert.deepEqual(built.report.summary, {
    emne_count: 8,
    source_count: 26,
    case_count: 24,
    planned_claim_count: 39,
    planned_claim_counts_by_emne: [5, 5, 4, 5, 5, 5, 5, 5],
    proposed_module_count: 4,
    registered_chapter_count_delta: 0
  });
  assert.equal(built.report.complete_scope, 'source_and_claim_brief_only');
  assert.equal(Object.values(built.report.gates).every(Boolean), true);
});

test('alle kilde-, case- og claimreferanser er konkrete, brukte og resolvable', () => {
  const sources = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_location_production_place_ethics_sources_v1.json',
    'source_files',
    'sources'
  );
  const cases = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_location_production_place_ethics_cases_v1.json',
    'case_files',
    'cases'
  );
  const topics = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_location_production_place_ethics_topic_claims_v1.json',
    'topic_claim_files',
    'topic_briefs'
  );
  const sourceIds = new Set(sources.map((source) => source.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const usedSources = new Set([...topics.flatMap((topic) => topic.source_ids), ...cases.flatMap((row) => row.source_ids)]);
  const usedCases = new Set(topics.flatMap((topic) => topic.case_ids));
  const claims = topics.flatMap((topic) => topic.planned_claims);

  assert.equal(sources.length, 26);
  assert.equal(cases.length, 24);
  assert.equal(claims.length, 39);
  assert.equal(sources.every((source) => /^https:\/\//.test(source.url) && source.source_location && source.territory), true);
  assert.equal(sources.every((source) => usedSources.has(source.id)), true);
  assert.equal(cases.every((row) => usedCases.has(row.id)), true);
  assert.equal(topics.every((topic) => topic.source_ids.every((id) => sourceIds.has(id))), true);
  assert.equal(topics.every((topic) => topic.case_ids.every((id) => caseIds.has(id))), true);
});

test('tillatelse, samtykke, lokalsamfunn og miljøvirkning har permanente evidensgrenser', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_location_production_place_ethics_source_claim_brief_v1.json');
  for (const key of [
    'public_access_does_not_equal_single_owner_or_unrestricted_production_control',
    'location_permission_person_consent_community_consultation_and_cultural_protocol_are_distinct',
    'absence_of_documented_objection_is_not_community_consent',
    'community_is_not_a_single_actor_and_claims_must_name_who_was_consulted',
    'environmental_standard_or_permit_is_not_proof_of_zero_environmental_impact',
    'carbon_accounting_and_site_specific_ecological_impact_are_distinct',
    'protected_or_sensitive_location_claims_require_site_species_season_activity_and_permission_scope',
    'physical_site_change_restoration_and_no_harm_are_separate_claims'
  ]) assert.equal(brief.source_policy[key], true, key);
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.runtime_registration.allowed_before_full_chapter_gate, false);
});

test('urfolksrett, stedserstatning, virtuelt rom og filmturisme har distinkte grenser', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_location_production_place_ethics_source_claim_brief_v1.json');
  for (const key of [
    'individual_release_does_not_clear_collective_indigenous_cultural_or_intellectual_property',
    'indigenous_land_and_knowledge_claims_prioritise_indigenous_led_sources',
    'studio_backlot_physical_set_led_volume_digital_asset_and_fictional_place_are_distinct',
    'virtual_production_may_shift_travel_or_location_pressure_but_does_not_automatically_reduce_total_impact',
    'digital_recreation_rights_are_jurisdiction_and_contract_specific',
    'screen_tourism_inspiration_visitation_attributed_spend_and_causal_local_effect_are_distinct',
    'tourism_claims_require_population_period_method_baseline_and_attribution_limit',
    'local_economic_benefit_does_not_alone_establish_social_legitimacy_or_consent'
  ]) assert.equal(brief.source_policy[key], true, key);
});

test('seksdelt kvalitetsvurdering består bare for det avgrensede briefscopet', () => {
  const assessment = auditFilmTvLocationProductionPlaceEthicsSourceBriefV1().report.quality_assessment;
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
});

test('runtime peker på enhet 13-briefen uten å registrere kapittelet for tidlig', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const film = status.subjects.find((row) => row.id === 'film_tv');
  assert.equal(
    registry.subjects.film_tv.canonicalModel.thirteenthSourceClaimBrief,
    'data/fag/TV_og_Film/film_tv_location_production_place_ethics_source_claim_brief_v1.json'
  );
  assert.equal(isFilmTvUnitThirteenOrLaterGate(film.nextGate), true);
  const chapter = registry.subjects.film_tv.chapters.find((row) => row.id === 'location-produksjon-og-stedsetikk');
  if (film.nextGate === 'location_production_place_ethics_source_brief_complete_full_chapter_production') {
    assert.equal(chapter, undefined);
  } else {
    assert.equal(chapter.file, 'data/fagverk/film_tv/location-produksjon-og-stedsetikk.json');
    assert.equal(chapter.claimsFile, 'data/fagverk/film_tv/location-produksjon-og-stedsetikk/claims.json');
    assert.equal(chapter.briefFile, 'data/fagverk/film_tv/location-produksjon-og-stedsetikk/brief.json');
  }
});

test('briefmotoren inneholder ingen SCM-synk eller GitHub-push', () => {
  const source = fs.readFileSync(
    new URL('../scripts/brief-film-tv-location-production-place-ethics-sources-v1.mjs', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
});
