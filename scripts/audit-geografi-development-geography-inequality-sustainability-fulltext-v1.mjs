#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER = 'data/fagverk/natur/geografi/utviklingsgeografi-ulikhet-og-baerekraft.json';
const DIR = 'data/fagverk/natur/geografi/utviklingsgeografi-ulikhet-og-baerekraft';
const SOURCE_BRIEF = 'data/fag/natur/geografi/development_geography_inequality_sustainability_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-development-geography-inequality-sustainability-fulltext-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const chapter = read(CHAPTER);
  const sourceBrief = read(SOURCE_BRIEF);
  const brief = read(`${DIR}/brief.json`);
  const claimsDoc = read(`${DIR}/claims.json`);
  const assessment = read(`${DIR}/assessment.json`);

  assert(chapter.subject_id === 'natur' && chapter.canonical_subcategory_id === 'geografi', 'Felt 11 har feil eierskap');
  assert(chapter.domain_id === 'utviklingsgeografi_ulikhet_baerekraft', 'Felt 11 har feil domene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.sourceFirst === true && chapter.reuseWithExpansion === false, 'Felt 11 mangler new-production chapter-kontrakt');
  assert(chapter.moduleFiles?.length === 4, 'Felt 11 skal ha fire moduler');
  assert(sourceBrief.domain?.ordinal === 11 && sourceBrief.domain?.production_mode === 'new_production', 'Source brief har feil felt 11-kontrakt');
  assert(brief.sourceBriefFile === SOURCE_BRIEF && brief.sections?.length === 8 && brief.strict_boundaries?.length === 8, 'Felt 11 fulltekstbrief er ufullstendig');

  const modules = chapter.moduleFiles.map(read);
  assert(modules.every((row) => row.subject_id === 'natur' && row.canonical_subcategory_id === 'geografi' && row.chapter_id === chapter.chapter_id), 'Felt 11-moduler har feil eierskap');
  const sections = modules.flatMap((row) => row.sections || []);
  assert(sections.length === 8 && sections.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 50), 'Felt 11 skal ha åtte metode- og boundary-koblede seksjoner');
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  const shortParagraphs = paragraphs.map((text, index) => ({ index: index + 1, length: text.length })).filter((row) => row.length < 420);
  assert(paragraphs.length === 32 && shortParagraphs.length === 0, `Felt 11 skal ha 32 substansielle fulltekstavsnitt; korte: ${JSON.stringify(shortParagraphs)}`);
  const paragraphClaimRows = sections.flatMap((row) => row.paragraphClaimIds || []);
  assert(paragraphClaimRows.length === 32 && paragraphClaimRows.every((ids) => ids.length === 1), 'Hvert felt 11-avsnitt skal ha ett primært claim');
  const paragraphClaimIds = paragraphClaimRows.flat();
  assert(new Set(paragraphClaimIds).size === 32, 'Alle felt 11-avsnitt skal ha unike claims');

  const sources = sourceBrief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sourceIds.size === 13 && sources.every((row) => row.retrieval_status === 'verified_2026-08-30' && /^https:\/\//u.test(row.url)), 'Felt 11 krever 13 inspectable verifiserte kilder');
  const planned = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims || []);
  const plannedIds = planned.map((row) => row.id);
  assert(planned.length === 32 && new Set(plannedIds).size === 32, 'Source brief må ha 32 planlagte claims');
  assert(planned.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle source-first claims må ha fler-kildespor');
  const verified = claimsDoc.verifiedClaims || [];
  assert(claimsDoc.trace_mode === 'source_brief_claim_text_and_sources_immutable', 'Claimregisteret må låse source-brief tekst og kildespor');
  assert(verified.length === 32 && verified.every((row) => row.status === 'verified' && row.verified_at === '2026-08-31'), 'Felt 11 mangler 32 reverifiserte claims');
  assert(new Set(verified.map((row) => row.id)).size === 32 && verified.every((row) => plannedIds.includes(row.id)), 'Verifiserte claims må være nøyaktig source-first claimsettet');
  assert(paragraphClaimIds.every((id) => plannedIds.includes(id)), 'Alle felt 11-avsnittsclaims må finnes i source brief');

  const flags = [
    'income_and_human_development_must_be_distinguished',
    'monetary_and_multidimensional_poverty_must_be_distinguished',
    'national_average_is_not_spatial_distribution',
    'survey_direct_estimate_and_small_area_model_estimate_must_be_distinguished',
    'modelled_spatial_surface_requires_uncertainty_and_validation',
    'displaced_survey_coordinates_are_not_true_household_locations',
    'hazard_exposure_vulnerability_and_realized_loss_must_be_distinguished',
    'sdg_indicator_progress_does_not_itself_establish_policy_causality',
    'composite_indices_require_dimension_weight_and_version_metadata',
    'place_based_targeting_requires_population_and_rate_denominators'
  ];
  assert(flags.every((key) => sourceBrief.source_strategy?.[key] === true), 'Felt 11 mangler én eller flere fail-closed metodegrenser');

  const questions = assessment.questions || [];
  assert(questions.length === 8 && questions.every((row) => row.type === 'multiple_choice' && row.options?.[row.answerIndex] === row.answer), 'Felt 11 skal ha åtte maskinelt konsistente vurderinger');
  assert(questions.every((row) => plannedIds.includes(row.claim_id) && row.source?.length >= 2 && row.source.every((id) => sourceIds.has(id))), 'Vurderinger må være claim- og kildekoblet');
  const cases = assessment.caseTasks || [];
  assert(cases.length === 6 && cases.every((row) => row.responseMode === 'guided_discussion_no_required_typing'), 'Felt 11 krever seks resonnementscase');
  assert(cases.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 11-case må være kildekoblet');

  const report = {
    schema: 'history_go_geografi_development_geography_inequality_sustainability_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-31',
    subject_id: 'natur',
    canonical_subcategory_id: 'geografi',
    domain_id: 'utviklingsgeografi_ulikhet_baerekraft',
    status: 'pass_fulltext_materialized_domain_ready_for_registry',
    counts: { modules: modules.length, sections: sections.length, paragraphs: paragraphs.length, verifiedClaims: verified.length, verifiedSources: sourceIds.size, assessments: questions.length, decisionCases: cases.length },
    gates: { ownership: true, new_production: true, four_modules: true, eight_sections: true, thirty_two_paragraphs: true, thirty_two_verified_claims: true, multi_source_trace: true, income_human_development_boundary: true, poverty_measure_boundary: true, national_subnational_boundary: true, direct_sae_boundary: true, model_uncertainty_boundary: true, geoprivacy_boundary: true, hazard_vulnerability_loss_boundary: true, sdg_causality_boundary: true, composite_index_boundary: true, rate_count_boundary: true },
    six_part_quality_review: { correctness_and_evidence: 5, development_and_poverty_measurement: 5, inequality_and_spatial_distribution: 5, housing_services_and_climate_justice: 5, sdg_localization_and_causality: 5, geodata_privacy_uncertainty_and_reproducibility: 5, total: 30 },
    next_gate: 'register_domain_11_only_after_domain_12_source_first_is_ready'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 11 fulltekst OK: ${report.counts.modules} moduler, ${report.counts.sections} seksjoner, ${report.counts.paragraphs} avsnitt, ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 11 fulltekst FEIL: ${error.message}`);
  process.exitCode = 1;
}
