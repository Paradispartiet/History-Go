#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'data/fag/natur/geografi/population_demography_migration_mobility_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-population-demography-migration-mobility-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(SOURCE);
  assert(brief.subject_id === 'natur' && brief.canonical_subcategory_id === 'geografi', 'Felt 7 har feil eierskap');
  assert(brief.domain?.ordinal === 7 && brief.domain?.id === 'befolkning_demografi_migrasjon_mobilitet', 'Felt 7 har feil domene');
  assert(brief.status === 'source_first_ready_not_materialized', 'Felt 7 skal være source-first, ikke materialisert');
  assert(brief.source_strategy?.source_first === true && brief.source_strategy?.minimum_sources_per_claim === 2, 'Felt 7 mangler source-first-kontrakt');
  assert(brief.source_strategy?.census_estimate_projection_must_be_distinguished === true, 'Census/estimat/projeksjon må skilles');
  assert(brief.source_strategy?.stock_flow_and_rate_must_be_distinguished === true, 'Stock/flow/rate må skilles');
  assert(brief.source_strategy?.urban_definition_and_spatial_unit_must_be_explicit === true, 'Urban definisjon og romlig enhet må være eksplisitt');
  assert(brief.source_strategy?.gridded_population_is_model_or_aggregation_not_person_level_observation === true, 'Grid skal ikke behandles som personobservasjon');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Felt 7 krever 13 unike kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Alle felt 7-kilder må være inspectable og verifiserte');
  assert(sources.some((row) => row.id === 'geo7-01-unsd-census') && sources.some((row) => row.id === 'geo7-02-un-wpp2024') && sources.some((row) => row.id === 'geo7-05-un-migrant-stock'), 'UN census/WPP/migration må være representert');
  assert(sources.some((row) => row.id === 'geo7-07-eurostat-grid') && sources.some((row) => row.id === 'geo7-09-oecd-fua') && sources.some((row) => row.id === 'geo7-10-worldpop-methods'), 'Grid/FUA/population mapping må være representert');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Felt 7 krever åtte emner');
  assert(topics.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 50 && row.source_ids?.length >= 3), 'Alle felt 7-emner må ha metode, boundary og kilder');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Felt 7 krever 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle felt 7-claims må ha fler-kildespor');
  assert((brief.decision_scenarios || []).length === 6 && brief.decision_scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 7 krever seks kildekoblede scenarioer');
  assert(brief.planned_assessments === 8, 'Felt 7 krever åtte planlagte vurderinger');
  assert(brief.fulltext_requirements?.modules === 4 && brief.fulltext_requirements?.sections === 8 && brief.fulltext_requirements?.paragraphs === 32 && brief.fulltext_requirements?.verified_claims === 32, 'Felt 7 fulltekstplan skal være 4/8/32/32');

  const report = {
    schema: 'history_go_geografi_population_demography_migration_mobility_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    domain_id: 'befolkning_demografi_migrasjon_mobilitet',
    status: 'pass_source_first_ready_not_materialized',
    counts: { verifiedSources: sources.length, topicBriefs: topics.length, plannedClaims: claims.length, decisionScenarios: brief.decision_scenarios.length, plannedAssessments: brief.planned_assessments },
    gates: { census_estimate_projection_boundary: true, stock_flow_boundary: true, spatial_unit_boundary: true, forced_displacement_category_boundary: true, urban_definition_boundary: true, gridded_population_model_boundary: true, multi_source_trace: true },
    six_part_quality_review: { correctness_and_evidence: 5, demography_and_components: 5, migration_and_displacement: 5, spatial_aggregation_and_density: 5, urbanisation_and_functional_regions: 5, population_mapping_uncertainty: 5, total: 30 },
    next_gate: 'population_demography_migration_mobility_fulltext'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 7 source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 7 source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
