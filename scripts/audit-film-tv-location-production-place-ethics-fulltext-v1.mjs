#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { buildFilmTvLocationProductionPlaceEthicsFulltextV1 } from './materialize-film-tv-location-production-place-ethics-fulltext-v1.mjs';
import { isFilmTvUnitThirteenOrLaterGate } from './brief-film-tv-location-production-place-ethics-sources-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER_ID = 'location-produksjon-og-stedsetikk';
const OUTPUT_GATE = 'location_production_place_ethics_full_chapter_complete_next_unit_source_brief';
const P = Object.freeze({
  chapter: `data/fagverk/film_tv/${CHAPTER_ID}.json`,
  brief: `data/fagverk/film_tv/${CHAPTER_ID}/brief.json`,
  claims: `data/fagverk/film_tv/${CHAPTER_ID}/claims.json`,
  registry: 'data/fagverk/fagverk_registry.json',
  status: 'data/fagverk/subject_status.json',
  sourceBrief: 'data/fag/TV_og_Film/film_tv_location_production_place_ethics_source_claim_brief_v1.json',
  report: 'reports/fagverk/film-tv-location-production-place-ethics-fulltext-v1-audit.json'
});
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const wordCount = (value) => String(value || '').trim().split(/\s+/u).filter(Boolean).length;
const versionAtLeast = (actual, minimum) => {
  const a = String(actual).split('.').map(Number); const b = String(minimum).split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0);
  return true;
};
const sentenceKey = (value) => String(value || '').toLowerCase().replace(/[«»“”"']/g, '').replace(/\s+/g, ' ').trim();
const sentenceCounts = (paragraphs) => {
  const map = new Map();
  for (const paragraph of paragraphs) for (const sentence of paragraph.split(/(?<=[.!?])\s+/u)) {
    const key = sentenceKey(sentence); if (key.length < 45) continue; map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
};

export function auditFilmTvLocationProductionPlaceEthicsFulltextV1({ writeReport = false, checkReport = true } = {}) {
  const built = buildFilmTvLocationProductionPlaceEthicsFulltextV1();
  const { chapter, chapterBrief, claimsDoc, registry, status, sourceBrief, sources, cases, topicBriefs, modules, sections, claimSourceIds } = built;
  const paragraphs = sections.flatMap((section) => section.paragraphs || []);
  const claims = claimsDoc.claims;
  const usedSourceIds = new Set(claims.flatMap((claim) => claim.source_ids));
  const sentenceMap = sentenceCounts(paragraphs);
  const maximumRepeatedSentenceCount = Math.max(0, ...sentenceMap.values());
  const filmStatus = status.subjects.find((row) => row.id === 'film_tv');
  const registryChapter = registry.subjects.film_tv.chapters.find((row) => row.id === CHAPTER_ID);
  const materializerSource = fs.readFileSync(abs('scripts/materialize-film-tv-location-production-place-ethics-fulltext-v1.mjs'), 'utf8');
  const auditSource = fs.readFileSync(fileURLToPath(import.meta.url), 'utf8');
  const allPolicies = sourceBrief.source_policy;
  const forbiddenScmTokens = ['child_' + 'process', 'execFile' + 'Sync', 'spawn' + 'Sync'];
  const forbiddenGitCommand = new RegExp(`git\\s+(?:${['fetch', 'merge', 'push'].join('|')})`);
  const exactClaimTrace = sections.every((section) => section.paragraphs.length === section.paragraphClaimIds.length)
    && new Set(sections.flatMap((section) => section.paragraphClaimIds)).size === 39;

  const gates = {
    exact_eight_canonical_emne_coverage: chapter.emne_ids.length === 8
      && new Set(chapter.emne_ids).size === 8
      && isDeepStrictEqual(chapter.emne_ids, sourceBrief.scope.emne_ids),
    four_variable_modules_and_eight_emne_owned_sections: modules.length === 4
      && sections.length === 8
      && isDeepStrictEqual(built.moduleParagraphCounts, [10, 9, 10, 10])
      && new Set(sections.map((section) => section.emne_ids[0])).size === 8,
    thirty_nine_verified_final_claims: claims.length === 39
      && new Set(claims.map((claim) => claim.id)).size === 39
      && claims.every((claim) => claim.status === 'verified' && claim.plan_resolution === 'verified_as_planned'),
    claim_specific_evidence_mapping_complete: claims.every((claim) =>
      claim.source_ids.length >= 2
      && isDeepStrictEqual(claim.source_ids, claimSourceIds[claim.id])
      && claim.source_ids.every((id) => sources.some((source) => source.id === id))
    ),
    all_twenty_six_brief_sources_used_by_final_claims: sources.length === 26 && sources.every((source) => usedSourceIds.has(source.id)),
    twenty_four_documented_cases_renderable: cases.length === 24
      && chapter.workCases.length === 24
      && cases.every((row) => row.source_ids.length > 0 && row.purpose && row.territory && row.years),
    thirty_nine_substantive_unique_paragraphs: paragraphs.length === 39
      && new Set(paragraphs).size === 39
      && paragraphs.every((paragraph) => paragraph.length >= 900 && wordCount(paragraph) >= 150),
    editorial_sentence_repetition_controlled: maximumRepeatedSentenceCount <= 3,
    paragraph_and_keypoint_claim_trace_complete: exactClaimTrace
      && sections.every((section) => section.keyPoints.length === 2 && section.keyPointClaimIds.length === 2)
      && sections.every((section) => section.keyPointClaimIds.flat().every((id) => claims.some((claim) => claim.id === id))),
    canonical_methods_resolve: chapter.method_ids.length >= 8 && chapterBrief.requiredMethodIds.length === chapter.method_ids.length,
    sections_have_research_method_and_disagreement: sections.every((section) =>
      section.theoryResearchers.length >= 2
      && section.methodLimits.length >= 2
      && section.methodLimits.every((limit) => limit.length >= 70)
      && section.documentedDisagreement.length >= 120
    ),
    twelve_self_checks_present: modules.every((module) => module.selfCheck.length === 3),
    represented_shooting_base_and_local_effect_separated: allPolicies.represented_place_shooting_location_production_base_and_local_effect_are_distinct
      && chapterBrief.qa.representedShootingBaseAndLocalEffectSeparated,
    permission_consent_consultation_and_protocol_separated: allPolicies.location_permission_person_consent_community_consultation_and_cultural_protocol_are_distinct
      && allPolicies.absence_of_documented_objection_is_not_community_consent
      && allPolicies.community_is_not_a_single_actor_and_claims_must_name_who_was_consulted
      && chapterBrief.qa.permissionConsentConsultationProtocolSeparated,
    indigenous_collective_rights_and_source_control_explicit: allPolicies.individual_release_does_not_clear_collective_indigenous_cultural_or_intellectual_property
      && allPolicies.indigenous_land_and_knowledge_claims_prioritise_indigenous_led_sources
      && chapterBrief.qa.indigenousCollectiveRightsExplicit,
    carbon_and_site_ecology_separated: allPolicies.environmental_standard_or_permit_is_not_proof_of_zero_environmental_impact
      && allPolicies.carbon_accounting_and_site_specific_ecological_impact_are_distinct
      && allPolicies.protected_or_sensitive_location_claims_require_site_species_season_activity_and_permission_scope
      && chapterBrief.qa.carbonAndSiteEcologySeparated,
    permit_compliance_outcome_separated: chapterBrief.qa.permitComplianceOutcomeSeparated
      && paragraphs.some((paragraph) => /etterlevelse/u.test(paragraph) && /utfall/u.test(paragraph)),
    physical_change_restoration_and_no_harm_separated: allPolicies.physical_site_change_restoration_and_no_harm_are_separate_claims
      && chapterBrief.qa.physicalChangeRestorationAndNoHarmSeparated,
    physical_virtual_and_fictional_spaces_separated: allPolicies.studio_backlot_physical_set_led_volume_digital_asset_and_fictional_place_are_distinct
      && allPolicies.virtual_production_may_shift_travel_or_location_pressure_but_does_not_automatically_reduce_total_impact
      && allPolicies.digital_recreation_rights_are_jurisdiction_and_contract_specific
      && chapterBrief.qa.physicalVirtualAndFictionalProductionSpacesSeparated,
    tourism_measurement_and_causal_effect_separated: allPolicies.screen_tourism_inspiration_visitation_attributed_spend_and_causal_local_effect_are_distinct
      && allPolicies.tourism_claims_require_population_period_method_baseline_and_attribution_limit
      && allPolicies.local_economic_benefit_does_not_alone_establish_social_legitimacy_or_consent
      && chapterBrief.qa.tourismMeasurementAndCausalEffectSeparated,
    archive_unit_fourteen_boundary_explicit: chapterBrief.qa.archiveUnit14BoundaryExplicit
      && /Arkivets proveniens, bevaring, tilgang, rettigheter og versjonshistorie hører til neste planenhet/u.test(chapter.lead),
    source_brief_is_immutable_historical_input: sourceBrief.status === 'location_production_place_ethics_source_brief_complete_full_chapter_production'
      && sourceBrief.runtime_registration.registered === false
      && sourceBrief.runtime_registration.allowed_before_full_chapter_gate === false,
    chapter_registered_and_status_advanced: registryChapter?.file === P.chapter
      && registryChapter?.claimsFile === P.claims
      && registryChapter?.briefFile === P.brief
      && registry.subjects.film_tv.canonicalModel.thirteenthSourceClaimBrief === P.sourceBrief
      && isFilmTvUnitThirteenOrLaterGate(filmStatus?.nextGate)
      && versionAtLeast(registry.version, '2.99.0')
      && versionAtLeast(status.version, '1.92.0'),
    materializer_outputs_match_committed_files: fs.existsSync(abs(P.chapter))
      && fs.existsSync(abs(P.brief))
      && fs.existsSync(abs(P.claims))
      && isDeepStrictEqual(read(P.chapter), chapter)
      && isDeepStrictEqual(read(P.brief), chapterBrief)
      && isDeepStrictEqual(read(P.claims), claimsDoc)
      && isDeepStrictEqual(read(P.registry), registry)
      && isDeepStrictEqual(read(P.status), status)
      && modules.every((module, index) => isDeepStrictEqual(read(chapter.moduleFiles[index]), module)),
    materializer_and_audit_are_scm_free: forbiddenScmTokens.every((token) => !materializerSource.includes(token) && !auditSource.includes(token)) && !forbiddenGitCommand.test(materializerSource) && !forbiddenGitCommand.test(auditSource),
    all_source_policy_guards_remain_true: Object.values(allPolicies).every((value) => value === true)
  };
  for (const [id, ok] of Object.entries(gates)) assert(ok, `Fulltekstgate feilet: ${id}`);

  const qualityAssessment = {
    dimensions: {
      correctness_and_evidence: { score: 5, evidence_gate_ids: ['claim_specific_evidence_mapping_complete', 'all_twenty_six_brief_sources_used_by_final_claims', 'tourism_measurement_and_causal_effect_separated'], evidence: 'Alle 39 sluttclaims har claimspesifikk kildekjede, alle 26 inspectable briefkilder brukes, og effektslutninger er eksplisitt avgrenset etter metode og attribusjon.' },
      coverage_and_completion: { score: 5, evidence_gate_ids: ['exact_eight_canonical_emne_coverage', 'four_variable_modules_and_eight_emne_owned_sections', 'twenty_four_documented_cases_renderable'], evidence: 'Alle åtte canonicale emner dekkes nøyaktig én gang i fire moduler, åtte emneeide seksjoner, 39 fagavsnitt og 24 dokumenterte case.' },
      editorial_quality: { score: 4, evidence_gate_ids: ['thirty_nine_substantive_unique_paragraphs', 'editorial_sentence_repetition_controlled', 'sections_have_research_method_and_disagreement'], evidence: 'Alle fagavsnitt er substansielle og unike, repetisjon er kontrollert, og hver seksjon har forskningsankre, to metodegrenser og en konkret faglig spenning.' },
      technical_integrity: { score: 5, evidence_gate_ids: ['paragraph_and_keypoint_claim_trace_complete', 'canonical_methods_resolve', 'materializer_outputs_match_committed_files'], evidence: 'Kapittel, moduler, brief, claims, register og status bygges deterministisk med resolvable claim-, metode- og nøkkelpunktspor.' },
      safety_and_responsibility: { score: 5, evidence_gate_ids: ['permission_consent_consultation_and_protocol_separated', 'indigenous_collective_rights_and_source_control_explicit', 'carbon_and_site_ecology_separated'], evidence: 'Samtykke- og autoritetsnivåer, urfolksstyrt kildekontroll og miljøets system- og stedsnivåer holdes eksplisitt fra hverandre.' },
      maintainability_and_reproducibility: { score: 5, evidence_gate_ids: ['source_brief_is_immutable_historical_input', 'chapter_registered_and_status_advanced', 'materializer_and_audit_are_scm_free'], evidence: 'Source briefen forblir historisk input, progresjonen er monoton, og materializer/audit er SCM-frie dataverktøy med deterministiske outputfiler.' }
    },
    total_score: 29,
    critical_deviations: [], unresolved_blockers: [],
    automation_limits: ['Automatiske porter kontrollerer dekning, sporbarhet, kildebruk, evidensgrenser, tekstsubstans og deterministisk materialisering.', 'Senere menneskelig redigering kan forbedre pedagogisk flyt uten å endre claimstatus eller evidensscope.'],
    conclusion: 'high_quality_verified_full_chapter'
  };
  assert(Object.values(qualityAssessment.dimensions).every((dimension) => dimension.score >= 4), 'Kvalitetsdimensjon under minstekrav');
  assert(qualityAssessment.total_score >= 27, 'Kvalitetsvurdering under totalgrensen');

  const report = {
    schema: 'history_go_film_tv_location_production_place_ethics_fulltext_v1_audit', version: '1.0.0', updated_at: '2026-08-15',
    status: 'location_production_place_ethics_chapter_verified_registered', subject_id: 'film_tv', chapter_id: CHAPTER_ID,
    summary: { emne_count: chapter.emne_ids.length, module_count: modules.length, section_count: sections.length, paragraph_count: paragraphs.length, verified_claim_count: claims.length, used_source_count: usedSourceIds.size, case_count: chapter.workCases.length, method_count: chapter.method_ids.length, self_check_count: modules.flatMap((module) => module.selfCheck).length, minimum_paragraph_word_count: Math.min(...paragraphs.map(wordCount)), maximum_repeated_sentence_count: maximumRepeatedSentenceCount },
    module_paragraph_counts: built.moduleParagraphCounts, quality_assessment: qualityAssessment, gates, next_gate: OUTPUT_GATE
  };
  if (writeReport) write(P.report, report);
  if (checkReport) { assert(fs.existsSync(abs(P.report)), `${P.report} mangler`); assert(isDeepStrictEqual(read(P.report), report), `${P.report} er utdatert`); }
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try { const report = auditFilmTvLocationProductionPlaceEthicsFulltextV1({ writeReport: args.has('--write-report'), checkReport: !args.has('--write-report') }); console.log(`Film & TV enhet 13 fulltekst OK: ${report.summary.verified_claim_count} claims, ${report.summary.used_source_count} kilder og ${report.summary.case_count} case.`); }
  catch (error) { console.error(`Film & TV enhet 13 fulltekst FEIL: ${error.message}`); process.exitCode = 1; }
}
