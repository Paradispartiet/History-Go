import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditFilmTvCulturalHeritageCanonStarsMemorySourceBriefV1 } from '../scripts/brief-film-tv-cultural-heritage-canon-stars-memory-sources-v1.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (relative) => JSON.parse(fs.readFileSync(new URL(relative, ROOT), 'utf8'));

test('enhet 15 source- og claimbrief har eksakt canonical dekning', () => {
  const report = auditFilmTvCulturalHeritageCanonStarsMemorySourceBriefV1();
  assert.deepEqual(report.summary, {
    emne_count: 12,
    module_count: 4,
    method_count: 14,
    planned_claim_count: 56,
    source_count: 26,
    used_source_count: 26,
    case_count: 24,
    used_case_count: 24
  });
  assert.deepEqual(report.claim_counts_by_emne, [5,4,5,5,5,4,4,5,5,4,5,5]);
  assert.equal(Object.values(report.gates).every(Boolean), true);
  assert.equal(report.status, 'cultural_heritage_canon_stars_memory_source_brief_verified');
});

test('alle kilder, case, metoder og claims er resolvable og faktisk brukt', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json');
  const sources = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_sources_v1.json').sources;
  const cases = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_cases_v1.json').cases;
  const topics = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_topic_claims_v1.json').topic_briefs;
  const sourceIds = new Set(sources.map((row) => row.id));
  const caseIds = new Set(cases.map((row) => row.id));
  const methodIds = new Set(brief.method_basis.map((row) => row.id));
  const usedSources = new Set([...topics.flatMap((row) => row.source_ids), ...cases.flatMap((row) => row.source_ids)]);
  const usedCases = new Set(topics.flatMap((row) => row.case_ids));
  const usedMethods = new Set(topics.flatMap((row) => row.method_basis_ids));
  const claims = topics.flatMap((row) => row.planned_claims);

  assert.equal(sources.every((row) => /^https:\/\//.test(row.url) && row.source_location && row.territory), true);
  assert.equal(sources.every((row) => usedSources.has(row.id)), true);
  assert.equal(cases.every((row) => usedCases.has(row.id)), true);
  assert.equal([...usedSources].every((id) => sourceIds.has(id)), true);
  assert.equal([...usedCases].every((id) => caseIds.has(id)), true);
  assert.equal([...usedMethods].every((id) => methodIds.has(id)), true);
  assert.equal([...methodIds].every((id) => usedMethods.has(id)), true);
  assert.equal(claims.every((row) => row.status === 'planned_requires_fulltext_verification'), true);
});

test('popularitet kan ikke kortslutte kulturarv, kanon, kultstatus eller kollektivt minne', () => {
  const policy = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json').source_policy;
  assert.equal(policy.popularity_does_not_prove_canon_heritage_cult_status_or_collective_memory, true);
  assert.equal(policy.heritage_status_requires_named_institution_process_or_curatorial_context, true);
  assert.equal(policy.cult_status_requires_documented_reception_or_audience_practice_and_an_explicit_definition, true);
  assert.equal(policy.collective_memory_claims_require_defined_group_period_and_mediation_process, true);
});

test('stjernepersona, rollefigur, privatperson og senere myte holdes adskilt', () => {
  const policy = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json').source_policy;
  assert.equal(policy.star_persona_role_private_person_and_later_myth_are_distinct, true);
  assert.equal(policy.later_stardom_must_not_be_projected_backwards_without_contemporary_evidence, true);
  assert.equal(policy.character_iconicity_and_performer_stardom_are_distinct, true);
});

test('minne, nostalgi, reprise og ombruk har permanente evidensgrenser', () => {
  const policy = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json').source_policy;
  assert.equal(policy.technical_survival_in_an_archive_does_not_prove_active_cultural_duration, true);
  assert.equal(policy.nostalgic_textual_framing_does_not_prove_audience_nostalgia, true);
  assert.equal(policy.rerun_reissue_remake_quotation_and_archive_reuse_are_distinct_recirculation_actions, true);
  assert.equal(policy.quotation_requires_identifiable_source_fragment_and_later_context, true);
});

test('familiefilm og motarkiv har egen community- og proveniensgrense', () => {
  const policy = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json').source_policy;
  assert.equal(policy.home_movie_private_memory_public_heritage_and_counterarchive_are_distinct, true);
  assert.equal(policy.counterarchive_requires_documented_community_or_alternative_historicising_practice, true);
});

test('fulltekst registreres ikke fra source-briefen alene', () => {
  const brief = read('data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json');
  assert.equal(brief.runtime_registration.registered, false);
  assert.equal(brief.runtime_registration.allowed_before_full_chapter_gate, false);
  assert.equal(brief.production_requirements.chapter_registration_only_after_fulltext_claim_and_evidence_audit, true);
  assert.equal(brief.next_gate, 'produce_full_chapter_claims_and_inspectable_sources_for_cultural_heritage_canon_stars_memory');
});

test('seksdelt kvalitetsvurdering består uten å late som fulltekst er ferdig', () => {
  const assessment = auditFilmTvCulturalHeritageCanonStarsMemorySourceBriefV1().quality_assessment;
  assert.deepEqual(Object.values(assessment.dimensions).map((row) => row.score), [5,5,5,5,5,5]);
  assert.equal(assessment.total_score, 30);
  assert.equal(assessment.conclusion, 'high_quality_source_brief_ready_for_fulltext');
  assert.deepEqual(assessment.critical_deviations, []);
  assert.deepEqual(assessment.unresolved_blockers, []);
});

test('briefmotoren inneholder ingen SCM-synk eller GitHub-push', () => {
  const source = fs.readFileSync(new URL('../scripts/brief-film-tv-cultural-heritage-canon-stars-memory-sources-v1.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /child_process|git\s+(fetch|merge|push)|execFileSync|spawnSync/);
});
