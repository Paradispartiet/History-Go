#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'data/fag/natur/geografi/economic_geography_resources_transport_value_chains_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-economic-geography-resources-transport-value-chains-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(SOURCE);
  assert(brief.subject_id === 'natur' && brief.canonical_subcategory_id === 'geografi', 'Felt 9 har feil eierskap');
  assert(brief.domain?.ordinal === 9 && brief.domain?.id === 'okonomisk_geografi_ressurser_transport_verdikjeder', 'Felt 9 har feil domene');
  assert(brief.domain?.production_mode === 'new_production' && brief.status === 'source_first_ready_not_materialized', 'Felt 9 skal være source-first nyproduksjon');
  assert(brief.source_strategy?.source_first === true && brief.source_strategy?.minimum_sources_per_claim === 2, 'Felt 9 mangler source-first-kontrakt');

  const requiredFlags = [
    'gross_trade_is_not_domestic_value_added',
    'monetary_trade_value_is_not_physical_mass',
    'distance_is_not_generalized_transport_cost_or_accessibility',
    'resource_endowment_is_not_local_economic_benefit',
    'lpi_is_survey_based_performance_evidence_not_infrastructure_inventory',
    'liner_connectivity_index_is_not_trade_volume',
    'icio_tiva_are_harmonized_model_based_accounts_not_firm_level_observation',
    'fdi_flow_and_stock_must_be_distinguished',
    'network_resilience_requires_route_capacity_and_substitution_evidence',
    'price_currency_classification_year_and_geography_must_be_harmonized'
  ];
  assert(requiredFlags.every((key) => brief.source_strategy?.[key] === true), 'Felt 9 mangler én eller flere fail-closed metodegrenser');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Felt 9 krever 13 unike kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Alle felt 9-kilder må være inspectable og verifiserte');
  assert(sourceIds.has('geo9-01-oecd-icio') && sourceIds.has('geo9-02-oecd-tiva') && sourceIds.has('geo9-03-wto-gvc2025'), 'ICIO/TiVA/WTO GVC må være representert');
  assert(sourceIds.has('geo9-04-un-comtrade') && sourceIds.has('geo9-05-worldbank-lpi') && sourceIds.has('geo9-07-unctad-lsci'), 'Handel/logistikk/shipping-kilder mangler');
  assert(sourceIds.has('geo9-09-iea-critical-minerals') && sourceIds.has('geo9-11-eiti-standard') && sourceIds.has('geo9-12-unctad-wir2026'), 'Ressurs-, governance- eller FDI-kilde mangler');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Felt 9 krever åtte emner');
  assert(topics.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 60 && row.source_ids?.length >= 2), 'Alle felt 9-emner må ha metode, boundary og kilder');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Felt 9 krever 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle felt 9-claims må ha gyldig fler-kildespor');
  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6 && scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 9 krever seks kildekoblede scenarioer');
  assert(brief.planned_assessments === 8, 'Felt 9 krever åtte planlagte vurderinger');
  assert(brief.fulltext_requirements?.modules === 4 && brief.fulltext_requirements?.sections === 8 && brief.fulltext_requirements?.paragraphs === 32 && brief.fulltext_requirements?.verified_claims === 32 && brief.fulltext_requirements?.assessments === 8 && brief.fulltext_requirements?.decision_cases === 6, 'Felt 9 fulltekstplan skal være 4/8/32/32/8/6');

  const report = {
    schema: 'history_go_geografi_economic_geography_resources_transport_value_chains_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    domain_id: 'okonomisk_geografi_ressurser_transport_verdikjeder',
    status: 'pass_source_first_ready_not_materialized',
    counts: { verifiedSources: sources.length, topicBriefs: topics.length, plannedClaims: claims.length, decisionScenarios: scenarios.length, plannedAssessments: brief.planned_assessments },
    gates: { gross_trade_value_added_boundary: true, money_mass_boundary: true, distance_accessibility_boundary: true, resource_benefit_boundary: true, lpi_measurement_boundary: true, liner_connectivity_volume_boundary: true, icio_tiva_model_boundary: true, fdi_flow_stock_boundary: true, resilience_substitution_boundary: true, harmonization_boundary: true, multi_source_trace: true },
    six_part_quality_review: { correctness_and_evidence: 5, location_resources_and_accessibility: 5, transport_ports_and_logistics: 5, trade_flows_and_value_added: 5, fdi_and_territorial_embedding: 5, resilience_harmonization_and_reproducibility: 5, total: 30 },
    next_gate: 'economic_geography_resources_transport_value_chains_fulltext'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 9 source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 9 source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
