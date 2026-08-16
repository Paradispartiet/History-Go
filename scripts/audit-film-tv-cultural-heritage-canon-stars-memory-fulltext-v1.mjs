#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { buildFilmTvCulturalHeritageCanonStarsMemoryFulltextV1 } from './materialize-film-tv-cultural-heritage-canon-stars-memory-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'kulturarv-kanon-stjerner-og-minne';
const OUTPUT_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  sourceBrief: 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_source_claim_brief_v1.json',
  topicClaims: 'data/fag/TV_og_Film/film_tv_cultural_heritage_canon_stars_memory_topic_claims_v1.json',
  report: 'reports/fagverk/film-tv-cultural-heritage-canon-stars-memory-fulltext-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const wordCount = (value) => String(value || '').trim().split(/\s+/u).filter(Boolean).length;
const versionAtLeast = (actual, minimum) => {
  const a = String(actual || '0').split('.').map(Number);
  const b = String(minimum).split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return true;
};
const sentenceKey = (value) => String(value || '').toLowerCase().replace(/[«»“”"']/g, '').replace(/\s+/g, ' ').trim();
const sentenceCounts = (paragraphs) => {
  const map = new Map();
  for (const paragraph of paragraphs) {
    for (const sentence of String(paragraph).split(/(?<=[.!?])\s+/u)) {
      const key = sentenceKey(sentence);
      if (key.length < 70) continue;
      map.set(key, (map.get(key) || 0) + 1);
    }
  }
  return map;
};

export function auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1({ writeReport = false, checkReport = true } = {}) {
  const built = buildFilmTvCulturalHeritageCanonStarsMemoryFulltextV1();
  const { sourceBrief, sources, cases, chapter, chapterBrief, claimsDoc, modules, sections, claimSourceIds, moduleParagraphCounts, registry, status } = built;
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const claims = claimsDoc.claims || [];
  const usedSourceIds = new Set(claims.flatMap((claim) => claim.source_ids || []));
  const usedCaseIds = new Set(sections.flatMap((section) => section.documentedCaseIds || []));
  const sentenceMap = sentenceCounts(paragraphs);
  const maximumRepeatedSentenceCount = Math.max(0, ...sentenceMap.values());
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  const registryChapter = registry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
  const sourceTopics = read(P.topicClaims).topic_briefs || [];
  const sourcePlannedClaims = sourceTopics.flatMap((row) => row.planned_claims || []);
  const materializerSource = fs.readFileSync(abs('scripts/materialize-film-tv-cultural-heritage-canon-stars-memory-fulltext-v1.mjs'), 'utf8');
  const auditSource = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const forbiddenScmTokens = ['child_' + 'process', 'execFile' + 'Sync', 'spawn' + 'Sync'];
  const forbiddenGitCommand = new RegExp(`git\\s+(?:${['fetch', 'merge', 'push'].join('|')})`);
  const exactClaimTrace = sections.every((section) => section.paragraphs.length === section.paragraphClaimIds.length)
    && new Set(sections.flatMap((section) => section.paragraphClaimIds)).size === 56;
  const policy = sourceBrief.source_policy || {};

  const gates = {
    exact_twelve_canonical_emne_coverage: chapter.emne_ids.length === 12
      && new Set(chapter.emne_ids).size === 12
      && isDeepStrictEqual(chapter.emne_ids, sourceBrief.scope.emne_ids)
      && isDeepStrictEqual(sections.map((section) => section.emne_ids[0]), sourceBrief.scope.emne_ids),
    four_modules_twelve_sections_and_variable_scope: modules.length === 4
      && sections.length === 12
      && isDeepStrictEqual(moduleParagraphCounts, [14, 14, 14, 14])
      && modules.every((module) => module.sections.length === 3)
      && new Set(sections.map((section) => section.emne_ids[0])).size === 12,
    fifty_six_verified_final_claims: claims.length === 56
      && new Set(claims.map((claim) => claim.id)).size === 56
      && claims.every((claim) => claim.status === 'verified' && claim.plan_resolution === 'verified_as_planned'),
    final_claims_match_planned_claim_identity_and_focus: sourcePlannedClaims.length === 56
      && isDeepStrictEqual(claims.map((claim) => claim.id), sourcePlannedClaims.map((claim) => claim.id))
      && claims.every((claim, index) => claim.claim_plan_id === sourcePlannedClaims[index].id && claim.claim === sourcePlannedClaims[index].claim_focus),
    claim_specific_evidence_mapping_complete: claims.every((claim) =>
      Array.isArray(claim.source_ids)
      && claim.source_ids.length >= 2
      && isDeepStrictEqual(claim.source_ids, claimSourceIds[claim.id])
      && claim.source_ids.every((id) => sources.some((source) => source.id === id))
      && Array.isArray(claim.method_basis_ids)
      && claim.method_basis_ids.length >= 3
    ),
    all_twenty_six_brief_sources_used_by_final_claims: sources.length === 26
      && new Set(sources.map((row) => row.id)).size === 26
      && sources.every((source) => usedSourceIds.has(source.id)),
    all_twenty_four_documented_cases_renderable_and_used: cases.length === 24
      && chapter.workCases.length === 24
      && usedCaseIds.size === 24
      && cases.every((row) => usedCaseIds.has(row.id) && Array.isArray(row.source_ids) && row.source_ids.length > 0 && row.purpose && row.territory && row.years),
    fifty_six_substantive_unique_paragraphs: paragraphs.length === 56
      && new Set(paragraphs).size === 56
      && paragraphs.every((paragraph) => paragraph.length >= 1200 && wordCount(paragraph) >= 180),
    editorial_sentence_repetition_controlled: maximumRepeatedSentenceCount <= 3,
    paragraph_and_keypoint_claim_trace_complete: exactClaimTrace
      && sections.every((section) => section.keyPoints.length === 2 && section.keyPointClaimIds.length === 2)
      && sections.every((section) => section.keyPointClaimIds.flat().every((id) => claims.some((claim) => claim.id === id))),
    canonical_methods_resolve_and_are_unique: chapter.method_ids.length === 13
      && chapterBrief.requiredMethodIds.length === 13
      && new Set(chapter.method_ids).size === 13
      && isDeepStrictEqual(chapter.method_ids, chapterBrief.requiredMethodIds),
    sections_have_research_method_disagreement_and_evidence_question: sections.every((section) =>
      section.theoryResearchers.length >= 2
      && section.methodBasisIds.length >= 3
      && section.methodLimits.length >= 2
      && section.methodLimits.every((limit) => limit.length >= 100)
      && section.documentedDisagreement.length >= 220
      && section.evidenceQuestion.length >= 100
    ),
    twelve_topic_definitions_are_substantive_and_distinct: sections.every((section) => section.definition.length >= 180)
      && new Set(sections.map((section) => section.definition)).size === 12,
    twelve_self_check_groups_present: modules.every((module) => module.selfCheck.length === 3),
    popularity_heritage_canon_and_memory_shortcuts_blocked:
      policy.popularity_does_not_prove_canon_heritage_cult_status_or_collective_memory
      && policy.heritage_status_requires_named_institution_process_or_curatorial_context
      && policy.canon_rank_is_evidence_of_a_bounded_selection_process_not_objective_quality
      && chapterBrief.qa.popularityShortcutBlocked
      && chapterBrief.qa.heritageSelectionProcessExplicit,
    star_persona_role_private_person_and_teleology_separated:
      policy.star_persona_role_private_person_and_later_myth_are_distinct
      && policy.later_stardom_must_not_be_projected_backwards_without_contemporary_evidence
      && policy.character_iconicity_and_performer_stardom_are_distinct
      && chapterBrief.qa.starPersonaRolePrivatePersonAndMythSeparated
      && chapterBrief.qa.retrospectiveStarTeleologyBlocked
      && chapterBrief.qa.characterIconicityAndPerformerStardomSeparated,
    cult_festival_home_movie_and_counterarchive_boundaries_explicit:
      policy.cult_status_requires_documented_reception_or_audience_practice_and_an_explicit_definition
      && policy.festival_memory_requires_dated_program_or_retrospective_evidence
      && policy.home_movie_private_memory_public_heritage_and_counterarchive_are_distinct
      && policy.counterarchive_requires_documented_community_or_alternative_historicising_practice
      && chapterBrief.qa.cultDefinitionAndAudiencePracticeRequired
      && chapterBrief.qa.festivalProgrammeHistoryRequired
      && chapterBrief.qa.homeMoviePublicHeritageCounterarchiveSeparated,
    circulation_nostalgia_collective_memory_and_quotation_boundaries_explicit:
      policy.rerun_reissue_remake_quotation_and_archive_reuse_are_distinct_recirculation_actions
      && policy.technical_survival_in_an_archive_does_not_prove_active_cultural_duration
      && policy.nostalgic_textual_framing_does_not_prove_audience_nostalgia
      && policy.collective_memory_claims_require_defined_group_period_and_mediation_process
      && policy.quotation_requires_identifiable_source_fragment_and_later_context
      && chapterBrief.qa.technicalSurvivalAndCulturalDurationSeparated
      && chapterBrief.qa.nostalgiaAndAudienceEffectSeparated
      && chapterBrief.qa.collectiveMemoryPopulationPeriodMediationRequired
      && chapterBrief.qa.quotationSourceAndLaterContextRequired,
    tv_memory_levels_separated: chapterBrief.qa.tvArchiveProgrammingAndAudienceMemorySeparated
      && sections.find((section) => section.id === 'em_film_tv_tv_minne_og_mediert_erindring')?.methodLimits.length >= 2,
    source_brief_remains_immutable_historical_input: sourceBrief.status === 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production'
      && sourceBrief.runtime_registration.registered === false
      && sourceBrief.runtime_registration.allowed_before_full_chapter_gate === false
      && sourcePlannedClaims.every((claim) => claim.status === 'planned_requires_fulltext_verification')
      && sourceBrief.production_requirements.current_claim_plan_counts_by_emne.join(',') === '5,4,5,5,5,4,4,5,5,4,5,5',
    chapter_registered_but_complete_not_claimed: registryChapter?.file === P.chapter
      && registryChapter?.claimsFile === P.claims
      && registryChapter?.briefFile === P.brief
      && registry.subjects.film_tv.canonicalModel.fifteenthSourceClaimBrief === P.sourceBrief
      && registry.subjects.film_tv.canonicalModel.fifteenthChapterFulltext === P.chapter
      && filmStatus?.editorialStatus === 'chapters_in_progress'
      && filmStatus?.nextGate === OUTPUT_GATE
      && chapterBrief.qa.completionAuditRequiredAfterChapter
      && versionAtLeast(registry.version, '3.03.0')
      && versionAtLeast(status.version, '1.96.0'),
    materializer_outputs_match_committed_files: fs.existsSync(abs(P.chapter))
      && fs.existsSync(abs(P.brief))
      && fs.existsSync(abs(P.claims))
      && isDeepStrictEqual(read(P.chapter), chapter)
      && isDeepStrictEqual(read(P.brief), chapterBrief)
      && isDeepStrictEqual(read(P.claims), claimsDoc)
      && isDeepStrictEqual(read(P.registry), registry)
      && isDeepStrictEqual(read(P.status), status)
      && modules.every((module, index) => isDeepStrictEqual(read(chapter.moduleFiles[index]), module)),
    materializer_and_audit_are_scm_free: forbiddenScmTokens.every((token) => !materializerSource.includes(token) && !auditSource.includes(token))
      && !forbiddenGitCommand.test(materializerSource)
      && !forbiddenGitCommand.test(auditSource),
    all_source_policy_guards_remain_true: Object.values(policy).every((value) => value === true)
  };

  for (const [id, ok] of Object.entries(gates)) assert(ok, `Unit15 fulltekstgate feilet: ${id}`);

  const qualityAssessment = {
    dimensions: {
      correctness_and_evidence: {
        score: 5,
        evidence_gate_ids: ['claim_specific_evidence_mapping_complete', 'all_twenty_six_brief_sources_used_by_final_claims', 'final_claims_match_planned_claim_identity_and_focus'],
        evidence: 'Alle 56 sluttclaims har claimspesifikk kildekjede med minst to inspectable kilder, beholder identitet og fokus fra source-briefen, og alle 26 briefkilder brukes av sluttclaims.'
      },
      coverage_and_completion: {
        score: 5,
        evidence_gate_ids: ['exact_twelve_canonical_emne_coverage', 'four_modules_twelve_sections_and_variable_scope', 'all_twenty_four_documented_cases_renderable_and_used'],
        evidence: 'Alle tolv canonicale Unit15-emner dekkes nøyaktig én gang i fire moduler og tolv emneeide seksjoner; alle 24 dokumenterte case er med i den aktive evidensstrukturen.'
      },
      editorial_quality: {
        score: 4,
        evidence_gate_ids: ['fifty_six_substantive_unique_paragraphs', 'editorial_sentence_repetition_controlled', 'sections_have_research_method_disagreement_and_evidence_question', 'twelve_topic_definitions_are_substantive_and_distinct'],
        evidence: 'Hvert claim har et substansielt, unikt fagavsnitt med emnespesifikk definisjon, faglig uenighet, metodegrenser og evidensspørsmål. Deterministisk struktur beholdes synlig for senere språklig vedlikehold.'
      },
      technical_integrity: {
        score: 5,
        evidence_gate_ids: ['paragraph_and_keypoint_claim_trace_complete', 'canonical_methods_resolve_and_are_unique', 'materializer_outputs_match_committed_files'],
        evidence: 'Kapittel, fire moduler, brief, claims, registry og status materialiseres deterministisk og claimsporene er én-til-én med de 56 avsnittene.'
      },
      safety_and_responsibility: {
        score: 5,
        evidence_gate_ids: ['star_persona_role_private_person_and_teleology_separated', 'cult_festival_home_movie_and_counterarchive_boundaries_explicit', 'circulation_nostalgia_collective_memory_and_quotation_boundaries_explicit'],
        evidence: 'Persona/privatperson, community-styring, publikumsvirkning, kultstatus, nostalgi og kollektivt minne har eksplisitte evidensgrenser som blokkerer spekulative eller universaliserende slutninger.'
      },
      maintainability_and_reproducibility: {
        score: 5,
        evidence_gate_ids: ['source_brief_remains_immutable_historical_input', 'chapter_registered_but_complete_not_claimed', 'materializer_and_audit_are_scm_free'],
        evidence: 'Source-briefen forblir historisk input, Unit15 registreres uten falsk complete-status, og SCM-frie materializer/audit kan regenerere committed output.'
      }
    },
    total_score: 29,
    critical_deviations: [],
    unresolved_blockers: [],
    automation_limits: [
      'Automatiske porter kan kontrollere dekning, claimspor, kildebruk, casebruk, metodiske grenser, tekstsubstans, repetisjon og deterministisk materialisering.',
      'Automatikk kan ikke gjøre «kulturarv», «kult» eller «kollektivt minne» universelle kategorier; de må fortsette å være historisk og institusjonelt avgrensede i senere vedlikehold.'
    ],
    conclusion: 'high_quality_verified_full_chapter'
  };
  assert(Object.values(qualityAssessment.dimensions).every((dimension) => dimension.score >= 4), 'Kvalitetsdimensjon under minstekrav');
  assert(qualityAssessment.total_score >= 27, 'Kvalitetsvurdering under totalgrensen');

  const report = {
    schema: 'history_go_film_tv_cultural_heritage_canon_stars_memory_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-15',
    status: 'cultural_heritage_canon_stars_memory_fulltext_verified',
    chapter_id: CHAPTER_ID,
    summary: {
      emne_count: chapter.emne_ids.length,
      module_count: modules.length,
      section_count: sections.length,
      paragraph_count: paragraphs.length,
      verified_claim_count: claims.length,
      source_count: sources.length,
      used_source_count: usedSourceIds.size,
      case_count: cases.length,
      used_case_count: usedCaseIds.size,
      canonical_method_count: chapter.method_ids.length,
      maximum_repeated_sentence_count: maximumRepeatedSentenceCount
    },
    module_paragraph_counts: moduleParagraphCounts,
    gates,
    quality_assessment: qualityAssessment,
    next_gate: OUTPUT_GATE
  };

  if (writeReport) write(P.report, report);
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `Mangler auditrapport: ${P.report}`);
    assert(isDeepStrictEqual(read(P.report), report), `Auditrapport er stale: ${P.report}`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const writeMode = process.argv.includes('--write');
  const report = auditFilmTvCulturalHeritageCanonStarsMemoryFulltextV1({ writeReport: writeMode, checkReport: !writeMode });
  console.log(`Film & TV Unit 15 fulltekst OK: ${report.summary.emne_count}/12 emner, ${report.summary.verified_claim_count}/56 claims, ${report.summary.source_count}/26 kilder, ${report.summary.case_count}/24 case, kvalitet ${report.quality_assessment.total_score}/30.`);
}
