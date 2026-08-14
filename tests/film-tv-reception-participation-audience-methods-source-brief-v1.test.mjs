import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  auditFilmTvReceptionParticipationAudienceMethodsSourceBriefV1,
  isFilmTvUnitElevenOrLaterGate
} from '../scripts/brief-film-tv-reception-participation-audience-methods-sources-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));
const rowsFromManifest = (manifestPath, filesKey, rowsKey) =>
  read(manifestPath)[filesKey].flatMap((file) => read(file)[rowsKey]);

test('ellevte planenhets kilde- og claimbrief har eksakt variabel dekning', () => {
  const built = auditFilmTvReceptionParticipationAudienceMethodsSourceBriefV1();
  assert.deepEqual(built.report.summary, {
    emne_count: 12,
    source_count: 36,
    case_count: 32,
    planned_claim_count: 54,
    planned_claim_counts_by_emne: [5, 5, 4, 4, 4, 4, 4, 4, 6, 4, 5, 5],
    proposed_module_count: 4,
    registered_chapter_count_delta: 0
  });
  assert.equal(built.report.complete_scope, 'source_and_claim_brief_only');
  assert.equal(Object.values(built.report.gates).every(Boolean), true);
});

test('alle kilde-, case- og claimreferanser er konkrete og resolvable', () => {
  const sources = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_sources_v1.json',
    'source_files',
    'sources'
  );
  const cases = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_cases_v1.json',
    'case_files',
    'cases'
  );
  const topics = rowsFromManifest(
    'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_topic_claims_v1.json',
    'topic_claim_files',
    'topic_briefs'
  );
  const sourceIds = new Set(sources.map((source) => source.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const usedSources = new Set([...topics.flatMap((topic) => topic.source_ids), ...cases.flatMap((row) => row.source_ids)]);
  const usedCases = new Set(topics.flatMap((topic) => topic.case_ids));
  assert.equal(sources.length, 36);
  assert.equal(cases.length, 32);
  assert.equal(sources.every((source) => /^https:\/\//.test(source.url) && source.source_location && source.territory), true);
  assert.equal(sources.every((source) => usedSources.has(source.id)), true);
  assert.equal(cases.every((row) => usedCases.has(row.id)), true);
  assert.equal(topics.every((topic) => topic.source_ids.every((id) => sourceIds.has(id))), true);
  assert.equal(topics.every((topic) => topic.case_ids.every((id) => caseIds.has(id))), true);
});

test('resepsjon, identitet, tilgjengelighet og metode har permanente evidensgrenser', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_source_claim_brief_v1.json');
  assert.equal(brief.source_policy.actual_reception_requires_audience_material_or_transparent_audience_method, true);
  assert.equal(brief.source_policy.textual_analysis_alone_cannot_prove_actual_reception_identity_affect_or_use, true);
  assert.equal(brief.source_policy.identity_work_requires_person_or_community_evidence_not_representation_alone, true);
  assert.equal(brief.source_policy.legal_or_technical_accessibility_provision_is_not_proof_of_discoverability_quality_usability_or_attendance, true);
  assert.equal(brief.source_policy.interview_ethnography_survey_panel_trace_experiment_and_archive_have_distinct_evidence_roles, true);
  assert.equal(brief.source_policy.publicly_accessible_digital_material_is_not_automatically_ethically_free_research_data, true);
  assert.equal(brief.source_policy.identification_liking_empathy_affect_arousal_and_embodiment_are_distinct, true);
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.runtime_registration.allowed_before_full_chapter_gate, false);
});

test('seksdelt kvalitetsvurdering består bare for det avgrensede briefscopet', () => {
  const built = auditFilmTvReceptionParticipationAudienceMethodsSourceBriefV1();
  const assessment = built.report.quality_assessment;
  const expectedDimensions = [
    'correctness_and_evidence',
    'coverage_and_completion',
    'editorial_quality',
    'technical_integrity',
    'safety_and_responsibility',
    'maintainability_and_reproducibility'
  ];
  assert.deepEqual(Object.keys(assessment.dimensions), expectedDimensions);
  assert.deepEqual(Object.values(assessment.dimensions).map((dimension) => dimension.score), [5, 5, 4, 5, 5, 5]);
  assert.equal(assessment.total_score, 29);
  assert.equal(assessment.conclusion, 'high_quality_source_claim_brief');
  assert.deepEqual(assessment.critical_deviations, []);
  assert.deepEqual(assessment.unresolved_blockers, []);
  assert.equal(assessment.full_chapter_assessed, false);
  assert.equal(assessment.automation_limits.length >= 2, true);
  assert.equal(Object.values(assessment.dimensions).every((dimension) =>
    dimension.evidence_gate_ids.length > 0 && dimension.evidence.length > 40
  ), true);
});

test('runtime peker på enhet 11-briefen og godtar ikke tidligere Film og TV-porter', () => {
  const registry = read('data/fagverk/fagverk_registry.json');
  const status = read('data/fagverk/subject_status.json');
  const film = status.subjects.find((row) => row.id === 'film_tv');
  assert.equal(
    registry.subjects.film_tv.canonicalModel.eleventhSourceClaimBrief,
    'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_source_claim_brief_v1.json'
  );
  assert.equal(isFilmTvUnitElevenOrLaterGate(film.nextGate), true);
  assert.equal(
    isFilmTvUnitElevenOrLaterGate('creative_work_technology_responsibility_full_chapter_complete_next_unit_source_brief'),
    false
  );
  assert.equal(
    isFilmTvUnitElevenOrLaterGate('industry_regulation_distribution_full_chapter_complete_next_unit_source_brief'),
    false
  );
  assert.equal(
    registry.subjects.film_tv.chapters.some((row) => row.id === 'resepsjon-deltakelse-og-publikumsmetoder'),
    false
  );
});

test('briefmotoren inneholder ingen SCM-synk eller GitHub-push', () => {
  const source = fs.readFileSync(
    new URL('../scripts/brief-film-tv-reception-participation-audience-methods-sources-v1.mjs', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
});
