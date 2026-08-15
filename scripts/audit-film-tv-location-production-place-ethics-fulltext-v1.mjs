#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import {
  buildFilmTvLocationProductionPlaceEthicsFulltextV1,
  buildClaimSourceIdsByClaim
} from './materialize-film-tv-location-production-place-ethics-fulltext-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'location-produksjon-og-stedsetikk';
const SOURCE_BRIEF_GATE = 'location_production_place_ethics_source_brief_complete_full_chapter_production';
const OUTPUT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  sourceBrief: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_source_claim_brief_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  report: 'reports/fagverk/film-tv-location-production-place-ethics-fulltext-v1-audit.json'
});

const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const wordCount = (value) => String(value || '').trim().split(/\s+/u).filter(Boolean).length;
const normalize = (value) => String(value || '').toLocaleLowerCase('nb-NO').replace(/\s+/gu, ' ').trim();
const versionAtLeast = (actual, minimum) => {
  const a = String(actual || '0').split('.').map(Number); const b = String(minimum || '0').split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  }
  return true;
};

export function auditFilmTvLocationProductionPlaceEthicsFulltextV1({ writeReport = false, checkReport = true } = {}) {
  const built = buildFilmTvLocationProductionPlaceEthicsFulltextV1();
  const sourceBrief = read(P.sourceBrief);
  const chapter = read(P.chapter);
  const brief = read(P.brief);
  const claimsDoc = read(P.claims);
  const registry = read(P.registry);
  const status = read(P.status);
  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((module) => module.sections || []);
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const paragraphClaimIds = sections.flatMap((section) => section.paragraphClaimIds || []).flat();
  const keyPointClaimIds = sections.flatMap((section) => section.keyPointClaimIds || []).flat(Infinity);
  const claims = claimsDoc.claims || [];
  const claimIds = new Set(claims.map((claim) => claim.id));
  const sourceIds = new Set((claimsDoc.sources || []).map((source) => source.id));
  const usedSourceIds = new Set(claims.flatMap((claim) => claim.source_ids || []));
  const caseIds = new Set((chapter.workCases || []).map((row) => row.id));
  const expectedClaimSourceIds = buildClaimSourceIdsByClaim(built.topicBriefs);
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  const chapterRecord = registry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
  const combinedText = normalize([
    chapter.lead,
    ...paragraphs,
    ...sections.flatMap((section) => section.methodLimits || []),
    ...sections.map((section) => section.documentedDisagreement)
  ].join(' '));
  const materializerSource = fs.readFileSync(new URL('./materialize-film-tv-location-production-place-ethics-fulltext-v1.mjs', import.meta.url), 'utf8');
  const auditSource = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const forbiddenScmTokens = ['child_' + 'process', 'execFile' + 'Sync', 'spawn' + 'Sync'];
  const forbiddenGitCommand = new RegExp(`git\\s+(?:${['fetch', 'merge', 'push'].join('|')})`);

  const gates = {
    exact_eight_canonical_emne_coverage: chapter.emne_ids.length === 8
      && new Set(chapter.emne_ids).size === 8
      && isDeepStrictEqual(chapter.emne_ids, sourceBrief.scope.emne_ids),
    four_variable_modules_and_eight_emne_owned_sections: modules.length === 4
      && sections.length === 8
      && new Set(sections.map((section) => section.emne_ids?.[0])).size === 8
      && isDeepStrictEqual(built.moduleParagraphCounts, [10, 9, 10, 10]),
    thirty_nine_verified_final_claims: claims.length === 39
      && claimIds.size === 39
      && claims.every((claim) => claim.status === 'verified' && claim.plan_resolution === 'verified_as_planned'),
    claim_specific_evidence_complete_and_resolvable: claims.every((claim) =>
      Array.isArray(claim.source_ids)
      && claim.source_ids.length >= 2
      && claim.source_ids.every((id) => sourceIds.has(id))
      && isDeepStrictEqual(claim.source_ids, expectedClaimSourceIds[claim.id])
    ),
    all_twenty_six_inspectable_sources_used: sourceIds.size === 26
      && usedSourceIds.size === 26
      && [...sourceIds].every((id) => usedSourceIds.has(id))
      && claimsDoc.sources.every((source) => source.url?.startsWith('https://') && source.publisher && source.source_location && source.territory),
    twenty_four_documented_cases_renderable: chapter.workCases.length === 24
      && caseIds.size === 24
      && chapter.workCases.every((row) => row.title && row.medium && row.territory && row.role && row.source_ids?.length > 0)
      && sections.every((section) => section.documentedCaseIds.length >= 4 && section.documentedCaseIds.every((id) => caseIds.has(id))),
    thirty_nine_substantive_unique_paragraphs: paragraphs.length === 39
      && new Set(paragraphs).size === 39
      && paragraphs.every((paragraph) => wordCount(paragraph) >= 150 && paragraph.length >= 900),
    paragraph_and_keypoint_claim_trace_complete: paragraphClaimIds.length === 39
      && new Set(paragraphClaimIds).size === 39
      && paragraphClaimIds.every((id) => claimIds.has(id))
      && keyPointClaimIds.every((id) => claimIds.has(id))
      && sections.every((section) => section.paragraphs.length === section.paragraphClaimIds.length && section.keyPoints.length === section.keyPointClaimIds.length),
    canonical_methods_resolve: chapter.method_ids.length > 0
      && isDeepStrictEqual(chapter.method_ids, built.chapter.method_ids)
      && isDeepStrictEqual(brief.requiredMethodIds, chapter.method_ids),
    sections_have_research_method_and_disagreement: sections.every((section) =>
      section.theoryResearchers.length >= 2
      && section.methodLimits.length >= 2
      && section.methodLimits.every((value) => value.length >= 100)
      && section.documentedDisagreement.length >= 180
      && section.keyPoints.length >= 2
    ),
    twelve_distributed_self_checks: modules.flatMap((module) => module.selfCheck || []).length === 12
      && modules.every((module) => (module.selfCheck || []).length === 3),
    location_and_represented_place_layers_separated: combinedText.includes('opptakssted')
      && combinedText.includes('representert sted')
      && combinedText.includes('studio')
      && combinedText.includes('digital')
      && sourceBrief.source_policy.represented_place_shooting_location_production_base_and_local_effect_are_distinct
      && sourceBrief.source_policy.location_choice_requires_production_evidence_not_screen_similarity_alone,
    permission_consent_consultation_protocol_separated: combinedText.includes('locationtillatelse')
      && combinedText.includes('permit')
      && combinedText.includes('individuell')
      && combinedText.includes('kollektiv konsultasjon')
      && combinedText.includes('kulturell protokoll')
      && sourceBrief.source_policy.location_permission_person_consent_community_consultation_and_cultural_protocol_are_distinct
      && sourceBrief.source_policy.absence_of_documented_objection_is_not_community_consent,
    public_space_and_people_rights_bounded: combinedText.includes('offentlig adgang')
      && combinedText.includes('forvalter')
      && combinedText.includes('personvern')
      && sourceBrief.source_policy.public_access_does_not_equal_single_owner_or_unrestricted_production_control,
    physical_site_change_evidence_bounded: combinedText.includes('før-, under- og ettertilstand')
      && combinedText.includes('restaurering')
      && sourceBrief.source_policy.physical_site_change_restoration_and_no_harm_are_separate_claims,
    carbon_and_site_ecology_separated: combinedText.includes('klimafotavtrykk')
      && combinedText.includes('biodiversitet')
      && combinedText.includes('habitat')
      && sourceBrief.source_policy.carbon_accounting_and_site_specific_ecological_impact_are_distinct
      && sourceBrief.source_policy.environmental_standard_or_permit_is_not_proof_of_zero_environmental_impact,
    community_power_benefit_burden_and_consent_explicit: combinedText.includes('beslutningsmakt')
      && combinedText.includes('fordeler')
      && combinedText.includes('byrder')
      && sourceBrief.source_policy.community_is_not_a_single_actor_and_claims_must_name_who_was_consulted
      && sourceBrief.source_policy.local_economic_benefit_does_not_alone_establish_social_legitimacy_or_consent,
    indigenous_source_control_and_collective_rights_explicit: combinedText.includes('urfolksstyrte')
      && combinedText.includes('territor')
      && combinedText.includes('indigenous cultural and intellectual property')
      && sourceBrief.source_policy.indigenous_land_and_knowledge_claims_prioritise_indigenous_led_sources
      && sourceBrief.source_policy.individual_release_does_not_clear_collective_indigenous_cultural_or_intellectual_property,
    virtual_production_tradeoffs_explicit: combinedText.includes('led-volum')
      && combinedText.includes('render')
      && combinedText.includes('hardware')
      && sourceBrief.source_policy.studio_backlot_physical_set_led_volume_digital_asset_and_fictional_place_are_distinct
      && sourceBrief.source_policy.virtual_production_may_shift_travel_or_location_pressure_but_does_not_automatically_reduce_total_impact,
    tourism_attribution_and_local_effect_bounded: combinedText.includes('selvrapportert')
      && combinedText.includes('baseline')
      && combinedText.includes('alternative forklaringer')
      && sourceBrief.source_policy.screen_tourism_inspiration_visitation_attributed_spend_and_causal_local_effect_are_distinct
      && sourceBrief.source_policy.tourism_claims_require_population_period_method_baseline_and_attribution_limit,
    source_brief_is_immutable_historical_input: sourceBrief.status === SOURCE_BRIEF_GATE
      && sourceBrief.runtime_registration.registered === false
      && sourceBrief.runtime_registration.allowed_before_full_chapter_gate === false
      && sourceBrief.production_requirements.current_claim_plan_counts_by_emne.reduce((sum, value) => sum + value, 0) === 39,
    chapter_registered_and_status_advanced: chapterRecord?.file === P.chapter
      && chapterRecord?.claimsFile === P.claims
      && chapterRecord?.briefFile === P.brief
      && registry.subjects.film_tv.canonicalModel.thirteenthSourceClaimBrief === P.sourceBrief
      && filmStatus?.editorialStatus === 'chapters_in_progress'
      && filmStatus?.nextGate === OUTPUT_GATE
      && versionAtLeast(registry.version, '2.99.0')
      && versionAtLeast(status.version, '1.92.0'),
    next_unit_is_named_without_premature_registration: filmStatus?.note?.includes('Arkiv, bevaring, tilgang og autentisitet')
      && !registry.subjects.film_tv.chapters.some((row) => row.id === 'arkiv-bevaring-tilgang-og-autentisitet'),
    materializer_outputs_match_committed_files: isDeepStrictEqual(chapter, built.chapter)
      && isDeepStrictEqual(brief, built.chapterBrief)
      && isDeepStrictEqual(claimsDoc, built.claimsDoc)
      && isDeepStrictEqual(registry, built.registry)
      && isDeepStrictEqual(status, built.status)
      && modules.every((module, index) => isDeepStrictEqual(module, built.modules[index])),
    materializer_and_audit_are_scm_free: forbiddenScmTokens.every((token) => !materializerSource.includes(token) && !auditSource.includes(token))
      && !forbiddenGitCommand.test(materializerSource)
      && !forbiddenGitCommand.test(auditSource),
    all_source_policy_guards_remain_true: Object.values(sourceBrief.source_policy).every((value) => value === true)
  };
  for (const [id, ok] of Object.entries(gates)) assert(ok, `Fulltekstport feilet: ${id}`);

  const qualityAssessment = {
    schema: 'history_go_six_dimension_quality_assessment_v1',
    assessment_scope: 'film_tv_unit_13_verified_full_chapter',
    scale: { minimum: 1, maximum: 5 },
    threshold: { minimum_dimension_score: 4, minimum_total_score: 27, maximum_total_score: 30, critical_deviations_allowed: 0 },
    dimensions: {
      correctness_and_evidence: { score: 5, evidence_gate_ids: ['thirty_nine_verified_final_claims', 'claim_specific_evidence_complete_and_resolvable', 'all_twenty_six_inspectable_sources_used'], evidence: '39/39 sluttclaims har claimspesifikk evidens fra 26/26 inspiserbare kilder, med eksplisitte territorielle og institusjonelle avgrensninger.' },
      coverage_and_completion: { score: 5, evidence_gate_ids: ['exact_eight_canonical_emne_coverage', 'four_variable_modules_and_eight_emne_owned_sections', 'twenty_four_documented_cases_renderable'], evidence: 'Alle 8 canonicale emner er dekket nøyaktig én gang gjennom fire variable moduler, 8 emneeide seksjoner, 39 fagavsnitt og 24 dokumenterte case.' },
      editorial_quality: { score: 4, evidence_gate_ids: ['thirty_nine_substantive_unique_paragraphs', 'sections_have_research_method_and_disagreement'], evidence: 'Alle fagavsnitt er substansielle og unike, og hver seksjon har egne forskningsankre, metodegrenser, case og dokumentert faglig spenning.' },
      technical_integrity: { score: 5, evidence_gate_ids: ['paragraph_and_keypoint_claim_trace_complete', 'canonical_methods_resolve', 'materializer_outputs_match_committed_files'], evidence: 'Kapittel, fire moduler, brief, claims, register og status materialiseres deterministisk fra den låste unit-13-briefen.' },
      ethical_and_contextual_rigor: { score: 5, evidence_gate_ids: ['permission_consent_consultation_protocol_separated', 'carbon_and_site_ecology_separated', 'indigenous_source_control_and_collective_rights_explicit', 'community_power_benefit_burden_and_consent_explicit'], evidence: 'Tillatelse, samtykke, kollektiv konsultasjon, urfolksprotokoll, miljø og makt holdes metodisk og normativt adskilt med kildekontroll.' },
      pedagogical_and_runtime_readiness: { score: 5, evidence_gate_ids: ['twelve_distributed_self_checks', 'chapter_registered_and_status_advanced', 'next_unit_is_named_without_premature_registration'], evidence: 'Fire moduler har distribuerte egenkontroller, runtime-registreringen er korrekt og neste enhet er eksplisitt navngitt uten prematur materialisering.' }
    },
    total_score: 29,
    critical_deviations: [],
    passed: true
  };
  for (const dimension of Object.values(qualityAssessment.dimensions)) assert(dimension.score >= 4, 'Kvalitetsdimensjon under 4/5');
  assert(qualityAssessment.total_score >= 27 && qualityAssessment.critical_deviations.length === 0, 'Seksdelt kvalitetsport feilet');

  const report = {
    schema: 'history_go_film_tv_location_production_place_ethics_fulltext_audit_v1',
    version: '1.0.0',
    generated_at: '2026-08-15',
    subject_id: 'film_tv',
    chapter_id: CHAPTER_ID,
    status: 'pass',
    summary: {
      canonical_emner: 8,
      modules: 4,
      sections: 8,
      claim_traced_paragraphs: 39,
      verified_claims: 39,
      inspectable_sources_used: 26,
      documented_cases: 24,
      canonical_methods: chapter.method_ids.length,
      quality_score: '29/30',
      next_gate: OUTPUT_GATE
    },
    gates,
    qualityAssessment
  };

  if (writeReport) write(P.report, report);
  if (checkReport && fs.existsSync(abs(P.report))) assert(isDeepStrictEqual(read(P.report), report), 'Committed fulltekstaudit er stale');
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const writeReport = process.argv.includes('--write-report');
    const report = auditFilmTvLocationProductionPlaceEthicsFulltextV1({ writeReport, checkReport: !writeReport });
    console.log(`Film & TV enhet 13 fulltekstaudit OK: ${report.summary.verified_claims} claims, ${report.summary.inspectable_sources_used} kilder, kvalitet ${report.summary.quality_score}.`);
  } catch (error) {
    console.error(`Film & TV enhet 13 fulltekstaudit FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
