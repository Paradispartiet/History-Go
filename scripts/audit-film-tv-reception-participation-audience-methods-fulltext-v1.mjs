#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import {
  buildFilmTvReceptionParticipationAudienceMethodsFulltextV1,
  CLAIM_SOURCE_IDS
} from './materialize-film-tv-reception-participation-audience-methods-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'resepsjon-deltakelse-og-publikumsmetoder';
const OUTPUT_GATE = 'reception_participation_audience_methods_full_chapter_complete_next_unit_source_brief';
const SCREEN_PLACES_SOURCE_GATE = 'screen_places_identity_circulation_source_brief_complete_full_chapter_production';
const SCREEN_PLACES_FULLTEXT_GATE = 'screen_places_identity_circulation_full_chapter_complete_next_unit_source_brief';
const LOCATION_PRODUCTION_SOURCE_GATE = 'location_production_place_ethics_source_brief_complete_full_chapter_production';
const LOCATION_PRODUCTION_FULLTEXT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';
const ARCHIVE_PRESERVATION_SOURCE_GATE = 'archive_preservation_access_authenticity_source_brief_complete_full_chapter_production';
const ARCHIVE_PRESERVATION_FULLTEXT_GATE = 'archive_preservation_access_authenticity_full_chapter_complete_next_unit_source_brief';
const UNIT15_SOURCE_GATE = 'cultural_heritage_canon_stars_memory_source_brief_complete_full_chapter_production';
const UNIT_FIFTEEN_COMPLETION_AUDIT_GATE = 'cultural_heritage_canon_stars_memory_full_chapter_complete_completion_audit';
const UNIT_ELEVEN_OR_LATER_GATES = new Set([OUTPUT_GATE, SCREEN_PLACES_SOURCE_GATE, SCREEN_PLACES_FULLTEXT_GATE, LOCATION_PRODUCTION_SOURCE_GATE, LOCATION_PRODUCTION_FULLTEXT_GATE, ARCHIVE_PRESERVATION_SOURCE_GATE, ARCHIVE_PRESERVATION_FULLTEXT_GATE, UNIT15_SOURCE_GATE, UNIT_FIFTEEN_COMPLETION_AUDIT_GATE]);
const isFilmTvUnitElevenFulltextOrLaterGate = (gate) => UNIT_ELEVEN_OR_LATER_GATES.has(gate);
const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  sourceBrief: 'data/fag/TV_og_Film/film_tv_reception_participation_audience_methods_source_claim_brief_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-reception-participation-audience-methods-fulltext-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const flatten = (value) => (value || []).flat(Infinity);
const wordCount = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length;
const forbiddenScmTokens = ['child_' + 'process', 'execFile' + 'Sync', 'spawn' + 'Sync'];
const forbiddenGitCommand = new RegExp(`git\\s+(?:${['fetch', 'merge', 'push'].join('|')})`);

export function auditFilmTvReceptionParticipationAudienceMethodsFulltextV1({
  writeReport = false,
  checkReport = true
} = {}) {
  const built = buildFilmTvReceptionParticipationAudienceMethodsFulltextV1();
  const chapter = read(P.chapter);
  const brief = read(P.brief);
  const claimsDoc = read(P.claims);
  const sourceBrief = read(P.sourceBrief);
  const registry = read(P.registry);
  const status = read(P.status);
  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const paragraphClaimIds = flatten(sections.flatMap((section) => section.paragraphClaimIds || []));
  const keyPointClaimIds = flatten(sections.flatMap((section) => section.keyPointClaimIds || []));
  const claims = claimsDoc.claims || [];
  const claimIds = new Set(claims.map((claim) => claim.id));
  const sourceIds = new Set(claimsDoc.sources.map((source) => source.id));
  const usedSourceIds = new Set(claims.flatMap((claim) => claim.source_ids));
  const caseIds = new Set(chapter.workCases.map((row) => row.id));
  const sectionRefs = new Map(sections.map((section) => [
    section.id,
    new Set([...flatten(section.paragraphClaimIds), ...flatten(section.keyPointClaimIds)])
  ]));
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  const chapterRecord = registry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
  const combined = [chapter.lead, ...paragraphs, brief.scopeBoundary].join(' ');
  const moduleParagraphCounts = modules.map((module) => module.sections.reduce((sum, section) => sum + section.paragraphs.length, 0));
  const paragraphOpeningKeys = paragraphs.map((text) => text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').split(/\s+/).slice(0, 5).join(' '));

  const gates = {
    exact_twelve_canonical_emne_coverage: chapter.emne_ids.length === 12
      && new Set(chapter.emne_ids).size === 12
      && isDeepStrictEqual(chapter.emne_ids, built.unit.emne_ids),
    four_variable_modules_and_twelve_emne_owned_sections: modules.length === 4
      && sections.length === 12
      && isDeepStrictEqual(moduleParagraphCounts, [17, 14, 13, 10])
      && sections.every((section) => section.emne_ids?.length === 1)
      && new Set(sections.map((section) => section.emne_ids[0])).size === 12,
    fifty_four_substantive_unique_paragraphs: paragraphs.length === 54
      && new Set(paragraphs).size === 54
      && new Set(paragraphOpeningKeys).size === 54
      && paragraphs.every((text) => text.length >= 500 && wordCount(text) >= 65),
    paragraph_and_keypoint_claim_trace_complete: paragraphClaimIds.length === 54
      && new Set(paragraphClaimIds).size === 54
      && paragraphClaimIds.every((id) => claimIds.has(id))
      && sections.every((section) => section.paragraphClaimIds.length === section.paragraphs.length)
      && sections.every((section) => section.paragraphClaimIds.every((ids) => Array.isArray(ids) && ids.length === 1))
      && sections.every((section) => section.keyPoints.length === 2 && section.keyPointClaimIds.length === 2)
      && keyPointClaimIds.every((id) => claimIds.has(id)),
    fifty_four_verified_final_claims: claims.length === 54
      && claimIds.size === 54
      && claims.every((claim) => claim.status === 'verified'
        && claim.plan_resolution === 'verified_as_planned'
        && claim.claim_plan_id === claim.id
        && claim.source_ids.length > 0
        && claim.used_in.length === 1
        && sectionRefs.get(claim.used_in[0])?.has(claim.id)),
    claim_specific_evidence_is_complete_and_resolvable: Object.keys(CLAIM_SOURCE_IDS).length === 54
      && claims.every((claim) => isDeepStrictEqual(claim.source_ids, CLAIM_SOURCE_IDS[claim.id]))
      && claims.every((claim) => claim.source_ids.every((id) => sourceIds.has(id)))
      && claims.some((claim) => claim.source_ids.length === 1),
    all_thirty_six_inspectable_sources_are_used: claimsDoc.sources.length === 36
      && usedSourceIds.size === 36
      && claimsDoc.sources.every((source) => usedSourceIds.has(source.id)
        && /^https:\/\//.test(source.url)
        && source.source_location
        && source.territory),
    thirty_two_documented_cases_are_renderable_and_used: chapter.workCases.length === 32
      && caseIds.size === 32
      && chapter.workCases.every((row) => row.id && row.title && row.year && row.medium && row.territory && row.role && row.source_ids.length)
      && sections.every((section) => section.documentedCaseIds.length >= 2 && section.documentedCaseIds.every((id) => caseIds.has(id))),
    every_section_has_research_method_limits_disagreement_and_questions: sections.every((section) =>
      section.theoryResearchers.length >= 2
      && section.methodLimits.length >= 2
      && section.documentedDisagreement.length >= 100
      && section.keyPoints.length === 2
    ) && modules.flatMap((module) => module.selfCheck || []).length === 13,
    canonical_methods_and_chapter_contract_are_complete: chapter.method_ids.length >= 10
      && isDeepStrictEqual(chapter.method_ids, brief.requiredMethodIds)
      && chapter.editorialStatus === 'chapter_ready'
      && chapter.sourceFirst === true
      && chapter.claimTraceRequired === true
      && chapter.diagnosticQuestions.length === 8
      && chapter.learningObjectives.length === 12,
    actual_reception_is_separated_from_textual_possibility: /Verksanalyse[^.]{0,220}(kan ikke alene|ikke automatisk).{0,240}(publikums|resepsjon|respons)/i.test(combined)
      && brief.qa.actualReceptionSeparatedFromTextualPossibility === true,
    audience_units_and_respondent_roles_are_separate: /husholdning, person, enhet, konto, skjerm og sesjon/i.test(combined)
      && /selvrapport, foreldrerapport, observasjon/i.test(combined)
      && brief.qa.audienceUnitsAndRespondentRolesSeparated === true,
    expectation_and_repeat_constructs_are_separate: /Forventning, fortolkning, evaluering, affekt og handling/i.test(combined)
      && /replay.{0,120}gjensyn.{0,180}viderevisning.{0,220}binge/is.test(combined)
      && /binge.{0,100}vane.{0,100}default.{0,100}ritual/is.test(combined)
      && brief.qa.expectationInterpretationEvaluationAffectAndActionSeparated === true
      && brief.qa.repeatExposureRewatchBingeHabitDefaultAndRitualSeparated === true,
    participation_identity_and_cult_boundaries_are_explicit: /Deltakelse, lurking, medlemskap, tilhørighet, konsensus, representasjon og sikkerhet/i.test(combined)
      && /identitetsarbeid.{0,260}(mennesker|person|fellesskap)/i.test(combined)
      && /Kultstatus er en dokumentert resepsjons- og sirkulasjonsprosess/i.test(combined),
    criticism_archive_and_accessibility_boundaries_are_explicit: /Kritikere og anmeldere er institusjonelt plasserte stemmer/i.test(combined)
      && /Arkiv- og indeksdekning setter en hard grense/i.test(combined)
      && /Tilgjengelig visning er en kjede/i.test(combined)
      && brief.qa.criticismSeparatedFromPopulationReception === true
      && brief.qa.accessibilityProvisionSeparatedFromUserOutcome === true,
    identification_affect_and_experimental_scope_are_explicit: /Identifikasjon, liking, empati, mental state attribution, affekt, arousal og kroppslig fornemmelse/i.test(combined)
      && /Kausalspråket må derfor begrenses/i.test(combined)
      && brief.qa.spectatorConstructsAndMeasuresSeparated === true,
    children_and_digital_research_ethics_are_explicit: /Barn og sårbare deltakere krever/i.test(combined)
      && /AoIRs retningslinjer krever/i.test(combined)
      && /dataminimering, sikker lagring/i.test(combined)
      && brief.qa.methodIntegrationAndEthicsExplicit === true,
    mixed_methods_and_triangulation_report_disagreement: /Mixed methods er mer enn/i.test(combined)
      && /Triangulering brukes til å undersøke samsvar, konflikt og metodeavhengighet/i.test(combined),
    source_brief_remains_immutable_historical_input: sourceBrief.status === 'source_claim_brief_complete_full_chapter_production'
      && sourceBrief.runtime_registration.registered === false
      && sourceBrief.runtime_registration.allowed_before_full_chapter_gate === false,
    chapter_is_registered_and_status_advanced_exactly_once: chapterRecord?.file === P.chapter
      && chapterRecord?.claimsFile === P.claims
      && chapterRecord?.briefFile === P.brief
      && filmStatus?.editorialStatus === 'chapters_in_progress'
      && isFilmTvUnitElevenFulltextOrLaterGate(filmStatus?.nextGate),
    deterministic_generated_state_matches: isDeepStrictEqual(chapter, built.chapter)
      && isDeepStrictEqual(brief, built.chapterBrief)
      && isDeepStrictEqual(claimsDoc, built.claimsDoc)
      && isDeepStrictEqual(registry, built.registry)
      && isDeepStrictEqual(status, built.status),
    materializer_contains_no_scm_sync_or_push: forbiddenScmTokens.every((token) => !fs.readFileSync(
      abs('scripts/materialize-film-tv-reception-participation-audience-methods-fulltext-v1.mjs'),
      'utf8'
    ).includes(token))
      && !forbiddenGitCommand.test(fs.readFileSync(
        abs('scripts/materialize-film-tv-reception-participation-audience-methods-fulltext-v1.mjs'),
        'utf8'
      ))
  };

  const qualityDimensions = {
    correctness_and_evidence: {
      score: 5,
      evidence_gate_ids: [
        'fifty_four_verified_final_claims',
        'claim_specific_evidence_is_complete_and_resolvable',
        'all_thirty_six_inspectable_sources_are_used',
        'actual_reception_is_separated_from_textual_possibility'
      ],
      evidence: '54/54 sluttclaims er claimspesifikt evidensmappet til 36/36 brukte, inspectable kilder; formale tilbud, publikumsdata og kausale effekter holdes metodisk adskilt.'
    },
    coverage_and_completion: {
      score: 5,
      evidence_gate_ids: [
        'exact_twelve_canonical_emne_coverage',
        'four_variable_modules_and_twelve_emne_owned_sections',
        'fifty_four_substantive_unique_paragraphs',
        'thirty_two_documented_cases_are_renderable_and_used'
      ],
      evidence: 'Kapitlet dekker 12/12 canonicale emner i fire variable moduler med 12 emneeide seksjoner, 54 substansielle avsnitt og 32 dokumenterte case uten hull eller overlapp.'
    },
    editorial_quality: {
      score: 4,
      evidence_gate_ids: [
        'every_section_has_research_method_limits_disagreement_and_questions',
        'expectation_and_repeat_constructs_are_separate',
        'participation_identity_and_cult_boundaries_are_explicit',
        'criticism_archive_and_accessibility_boundaries_are_explicit'
      ],
      evidence: 'Alle seksjoner har navngitte forskere eller teoritradisjoner, minst to case, metodebegrensninger, reell faglig uenighet, nøkkelpunkter og kontrollspørsmål. Scoren holdes på 4 fordi automatiske porter ikke alene erstatter framtidig menneskelig stil- og bruksredigering.'
    },
    technical_integrity: {
      score: 5,
      evidence_gate_ids: [
        'paragraph_and_keypoint_claim_trace_complete',
        'canonical_methods_and_chapter_contract_are_complete',
        'chapter_is_registered_and_status_advanced_exactly_once',
        'deterministic_generated_state_matches'
      ],
      evidence: 'Avsnitts- og nøkkelpunkttrace er komplett, canonicale metoder er registrert, runtime-status avanserer eksakt til neste port og alle genererte filer er deterministiske.'
    },
    safety_and_responsibility: {
      score: 5,
      evidence_gate_ids: [
        'audience_units_and_respondent_roles_are_separate',
        'identification_affect_and_experimental_scope_are_explicit',
        'children_and_digital_research_ethics_are_explicit',
        'mixed_methods_and_triangulation_report_disagreement'
      ],
      evidence: 'Barn, sårbare miljøer, digitale spor, identitet, tilgjengelighet og eksperimentelle effekter har eksplisitte respondent-, personvern-, skade-, konstrukt- og generaliseringsgrenser.'
    },
    maintainability_and_reproducibility: {
      score: 5,
      evidence_gate_ids: [
        'source_brief_remains_immutable_historical_input',
        'claim_specific_evidence_is_complete_and_resolvable',
        'deterministic_generated_state_matches',
        'materializer_contains_no_scm_sync_or_push'
      ],
      evidence: 'Den versjonerte source briefen beholdes som uendret historisk input, claimmappingen er eksplisitt, utdataene er deterministiske og materializeren utfører ingen SCM-synk eller GitHub-push.'
    }
  };
  const scores = Object.values(qualityDimensions).map((dimension) => dimension.score);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const qualityGateIds = Object.values(qualityDimensions).flatMap((dimension) => dimension.evidence_gate_ids);
  const qualityPasses = Object.keys(qualityDimensions).length === 6
    && scores.every((score) => Number.isInteger(score) && score >= 4 && score <= 5)
    && totalScore >= 27
    && totalScore <= 30
    && qualityGateIds.every((gateId) => gates[gateId] === true);
  const qualityAssessment = {
    schema: 'history_go_six_dimension_quality_assessment_v1',
    assessment_scope: 'film_tv_unit_11_verified_full_chapter',
    scale: { minimum: 1, maximum: 5 },
    threshold: {
      minimum_dimension_score: 4,
      minimum_total_score: 27,
      maximum_total_score: 30,
      critical_deviations_allowed: 0
    },
    dimensions: qualityDimensions,
    total_score: totalScore,
    critical_deviations: [],
    unresolved_blockers: [],
    automation_limits: [
      'Automatiske porter kontrollerer dekning, sporbarhet, kildebruk, substansielle minimum, kontrakter og eksplisitte metodegrenser.',
      'Framtidige brukerdata og menneskelig redaksjonell gjennomgang kan fortsatt gi grunnlag for språklig eller pedagogisk finjustering uten å endre fulltekststatusen.'
    ],
    conclusion: qualityPasses ? 'high_quality_verified_full_chapter' : 'quality_gate_failed'
  };
  gates.six_dimension_quality_assessment_passes = qualityPasses
    && qualityAssessment.critical_deviations.length === 0
    && qualityAssessment.unresolved_blockers.length === 0
    && qualityAssessment.conclusion === 'high_quality_verified_full_chapter';

  assert(
    Object.values(gates).every(Boolean),
    `Fulltekstporter feiler: ${Object.entries(gates).filter(([, value]) => !value).map(([key]) => key).join(', ')}`
  );

  const report = {
    schema: 'history_go_film_tv_reception_participation_audience_methods_fulltext_v1_audit',
    version: '1.0.0',
    updated_at: '2026-08-14',
    status: 'reception_participation_audience_methods_chapter_verified_registered',
    subject_id: 'film_tv',
    chapter_id: CHAPTER_ID,
    summary: {
      emne_count: chapter.emne_ids.length,
      module_count: modules.length,
      section_count: sections.length,
      paragraph_count: paragraphs.length,
      verified_claim_count: claims.length,
      used_source_count: usedSourceIds.size,
      case_count: chapter.workCases.length,
      method_count: chapter.method_ids.length,
      self_check_count: modules.flatMap((module) => module.selfCheck || []).length,
      minimum_paragraph_word_count: Math.min(...paragraphs.map(wordCount))
    },
    module_paragraph_counts: moduleParagraphCounts,
    quality_assessment: qualityAssessment,
    gates,
    next_gate: OUTPUT_GATE
  };

  if (writeReport) write(P.report, report);
  if (checkReport) {
    assert(fs.existsSync(abs(P.report)), `${P.report} mangler`);
    assert(isDeepStrictEqual(read(P.report), report), `${P.report} er utdatert`);
  }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditFilmTvReceptionParticipationAudienceMethodsFulltextV1({
      writeReport: args.has('--write-report'),
      checkReport: !args.has('--write-report')
    });
    console.log(`Film & TV enhet 11 fulltekst OK: ${report.summary.verified_claim_count} claims, ${report.summary.used_source_count} kilder og ${report.summary.case_count} case.`);
  } catch (error) {
    console.error(`Film & TV enhet 11 fulltekst FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
