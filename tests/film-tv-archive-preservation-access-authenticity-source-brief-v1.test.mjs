import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  auditFilmTvArchivePreservationAccessAuthenticitySourceBriefV1,
  isFilmTvUnitFourteenOrLaterGate
} from '../scripts/brief-film-tv-archive-preservation-access-authenticity-sources-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));

test('fjortende planenhets source- og claimbrief har eksakt canonical dekning', () => {
  const report = auditFilmTvArchivePreservationAccessAuthenticitySourceBriefV1();
  assert.deepEqual(report.summary, {
    emne_count: 11,
    module_count: 4,
    planned_claim_count: 53,
    source_count: 30,
    used_source_count: 30,
    case_count: 26,
    used_case_count: 26
  });
  assert.deepEqual(report.claim_counts_by_emne, [5, 5, 5, 5, 5, 5, 5, 5, 4, 5, 4]);
  assert.equal(Object.values(report.gates).every(Boolean), true);
});

test('alle kilder, case og planlagte claims er konkrete, brukte og resolvable', () => {
  const sources = read('data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_sources_v1.json').sources;
  const cases = read('data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_cases_v1.json').cases;
  const topics = read('data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_topic_claims_v1.json').topic_briefs;
  const sourceIds = new Set(sources.map((source) => source.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const usedSources = new Set([...topics.flatMap((topic) => topic.source_ids), ...cases.flatMap((row) => row.source_ids)]);
  const usedCases = new Set(topics.flatMap((topic) => topic.case_ids));
  const claims = topics.flatMap((topic) => topic.planned_claims);

  assert.equal(sources.length, 30);
  assert.equal(cases.length, 26);
  assert.equal(claims.length, 53);
  assert.equal(sources.every((source) => /^https:\/\//.test(source.url) && source.source_location && source.territory), true);
  assert.equal(sources.every((source) => usedSources.has(source.id)), true);
  assert.equal(cases.every((row) => usedCases.has(row.id)), true);
  assert.equal(topics.every((topic) => topic.source_ids.every((id) => sourceIds.has(id))), true);
  assert.equal(topics.every((topic) => topic.case_ids.every((id) => caseIds.has(id))), true);
  assert.equal(claims.every((claim) => claim.status === 'planned_requires_fulltext_verification'), true);
});

test('bevaring, digitalisering, restaurering, rekonstruksjon og tilgang har permanente skilleporter', () => {
  const policy = read('data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_source_claim_brief_v1.json').source_policy;
  for (const key of [
    'preservation_digitization_restoration_reconstruction_and_access_are_distinct_actions',
    'digital_copy_does_not_prove_long_term_preservation',
    'streaming_availability_does_not_equal_archival_preservation_or_permanent_access',
    'restoration_intervention_must_be_documented_and_reversible_where_practicable',
    'restored_version_is_not_automatically_the_original_or_single_authoritative_version',
    'absence_missing_footage_and_destroyed_material_are_not_interchangeable_claims',
    'reconstruction_must_mark_inference_substitution_and_unknown_material'
  ]) assert.equal(policy[key], true, key);
});

test('proveniens, metadata, rettigheter og personvern kan ikke kollapses til én tilgangsstatus', () => {
  const policy = read('data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_source_claim_brief_v1.json').source_policy;
  for (const key of [
    'catalog_entry_does_not_prove_item_survival_completeness_or_viewing_access',
    'archive_object_work_manifestation_item_and_access_copy_are_distinct',
    'provenance_requires_documented_chain_not_filename_or_visual_similarity',
    'metadata_and_cataloguing_are_evidence_infrastructure_not_neutral_description',
    'findability_access_right_to_view_and_right_to_reuse_are_distinct',
    'copyright_permission_privacy_data_protection_contract_and_archive_policy_are_distinct',
    'public_interest_archiving_does_not_remove_data_protection_safeguards'
  ]) assert.equal(policy[key], true, key);
});

test('urfolks- og fellesskapskontroll har egen autoritets- og repatrieringsgrense', () => {
  const policy = read('data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_source_claim_brief_v1.json').source_policy;
  assert.equal(policy.rights_holder_permission_does_not_override_indigenous_collective_cultural_control, true);
  assert.equal(policy.indigenous_and_community_material_requires_community_led_or_authoritative_protocol_sources, true);
  assert.equal(policy.repatriation_digital_return_access_copy_and_transfer_of_custody_are_distinct, true);
});

test('born-digital og streaming har eksplisitt teknisk og tidslig proveniens', () => {
  const policy = read('data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_source_claim_brief_v1.json').source_policy;
  assert.equal(policy.born_digital_preservation_requires_fixity_storage_monitoring_format_strategy_and_documented_events, true);
  assert.equal(policy.format_migration_is_a_preservation_event_not_proof_of_unchanged_identity, true);
  assert.equal(policy.platform_catalog_change_requires_date_territory_account_state_and_collection_method, true);
  assert.equal(policy.streaming_availability_does_not_equal_archival_preservation_or_permanent_access, true);
});

test('seksdelt kvalitetsvurdering består for source-briefscopet uten å late som fulltekst er ferdig', () => {
  const assessment = auditFilmTvArchivePreservationAccessAuthenticitySourceBriefV1().quality_assessment;
  assert.deepEqual(Object.keys(assessment.dimensions), [
    'correctness_and_evidence',
    'coverage_and_completion',
    'editorial_quality',
    'technical_integrity',
    'safety_and_responsibility',
    'maintainability_and_reproducibility'
  ]);
  assert.deepEqual(Object.values(assessment.dimensions).map((dimension) => dimension.score), [5, 5, 5, 5, 5, 5]);
  assert.equal(assessment.total_score, 30);
  assert.equal(assessment.conclusion, 'high_quality_source_brief_ready_for_fulltext');
  assert.deepEqual(assessment.critical_deviations, []);
  assert.deepEqual(assessment.unresolved_blockers, []);
});

test('runtime peker på enhet 14-briefen uten å registrere kapittelet for tidlig', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const film = status.subjects.find((row) => row.id === 'film_tv');
  const brief = read('data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_source_claim_brief_v1.json');

  assert.equal(
    registry.subjects.film_tv.canonicalModel.fourteenthSourceClaimBrief,
    'data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_source_claim_brief_v1.json'
  );
  assert.equal(isFilmTvUnitFourteenOrLaterGate(film.nextGate), true);
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.runtime_registration.allowed_before_full_chapter_gate, false);

  const chapter = registry.subjects.film_tv.chapters.find((row) => row.id === 'arkiv-bevaring-tilgang-og-autentisitet');
  if (film.nextGate === 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production') {
    assert.equal(chapter, undefined);
  }
});

test('enhet 15-grensen for kanonisering og kollektivt minne er eksplisitt låst', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_archive_preservation_access_authenticity_source_claim_brief_v1.json');
  assert.match(brief.scope.overlap_boundary, /Enhet 15/);
  assert.match(brief.scope.overlap_boundary, /kanonisering/);
  assert.match(brief.scope.overlap_boundary, /kollektivt minne/);
  assert.equal(brief.source_policy.production_archive_material_is_not_identical_to_the_released_work, true);
});

test('briefmotoren inneholder ingen SCM-synk eller GitHub-push', () => {
  const source = fs.readFileSync(
    new URL('../scripts/brief-film-tv-archive-preservation-access-authenticity-sources-v1.mjs', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
});
