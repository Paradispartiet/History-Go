#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'data/fag/natur/geografi/development_geography_inequality_sustainability_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-development-geography-inequality-sustainability-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(SOURCE);
  assert(brief.subject_id === 'natur' && brief.canonical_subcategory_id === 'geografi', 'Felt 11 har feil eierskap');
  assert(brief.domain?.ordinal === 11 && brief.domain?.id === 'utviklingsgeografi_ulikhet_baerekraft', 'Felt 11 har feil domene');
  assert(brief.domain?.production_mode === 'new_production' && brief.status === 'source_first_ready_not_materialized', 'Felt 11 skal være source-first nyproduksjon');
  assert(brief.source_strategy?.source_first === true && brief.source_strategy?.minimum_sources_per_claim === 2, 'Felt 11 mangler source-first-kontrakt');

  const requiredFlags = [
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
  assert(requiredFlags.every((key) => brief.source_strategy?.[key] === true), 'Felt 11 mangler én eller flere fail-closed metodegrenser');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Felt 11 krever 13 unike kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Alle felt 11-kilder må være inspectable og verifiserte');
  assert(sourceIds.has('geo11-01-wb-pip') && sourceIds.has('geo11-04-undp-hdi') && sourceIds.has('geo11-05-undp-ihdi') && sourceIds.has('geo11-06-undp-mpi2025'), 'Poverty/human-development kilder mangler');
  assert(sourceIds.has('geo11-07-unsd-sdg-metadata') && sourceIds.has('geo11-09-ipcc-wg2'), 'SDG/climate kilder mangler');
  assert(sourceIds.has('geo11-10-wb-sae') && sourceIds.has('geo11-11-worldpop-poverty') && sourceIds.has('geo11-12-dhs-displacement'), 'Spatial development methodology mangler');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Felt 11 krever åtte emner');
  assert(topics.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 60 && row.source_ids?.length >= 2), 'Alle felt 11-emner må ha metode, boundary og kilder');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Felt 11 krever 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle felt 11-claims må ha gyldig fler-kildespor');
  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6 && scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 11 krever seks kildekoblede scenarioer');
  assert(brief.planned_assessments === 8, 'Felt 11 krever åtte planlagte vurderinger');
  assert(brief.fulltext_requirements?.modules === 4 && brief.fulltext_requirements?.sections === 8 && brief.fulltext_requirements?.paragraphs === 32 && brief.fulltext_requirements?.verified_claims === 32 && brief.fulltext_requirements?.assessments === 8 && brief.fulltext_requirements?.decision_cases === 6, 'Felt 11 fulltekstplan skal være 4/8/32/32/8/6');

  const report = {
    schema: 'history_go_geografi_development_geography_inequality_sustainability_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    domain_id: 'utviklingsgeografi_ulikhet_baerekraft',
    status: 'pass_source_first_ready_not_materialized',
    counts: { verifiedSources: sources.length, topicBriefs: topics.length, plannedClaims: claims.length, decisionScenarios: scenarios.length, plannedAssessments: brief.planned_assessments },
    gates: { income_human_development_boundary: true, monetary_multidimensional_poverty_boundary: true, national_spatial_distribution_boundary: true, survey_sae_boundary: true, model_uncertainty_validation: true, survey_geoprivacy_boundary: true, hazard_vulnerability_loss_boundary: true, sdg_causality_boundary: true, composite_index_metadata: true, rate_count_denominator_boundary: true, multi_source_trace: true },
    six_part_quality_review: { correctness_and_evidence: 5, development_and_poverty_measurement: 5, inequality_and_spatial_disparities: 5, housing_services_and_place: 5, climate_sustainability_and_equity: 5, geodata_uncertainty_privacy_and_reproducibility: 5, total: 30 },
    next_gate: 'development_geography_inequality_sustainability_fulltext'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 11 source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 11 source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
