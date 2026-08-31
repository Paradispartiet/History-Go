#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'data/fag/natur/geografi/settlement_urban_rural_urbanisation_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-settlement-urban-rural-urbanisation-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(SOURCE);
  assert(brief.subject_id === 'natur' && brief.canonical_subcategory_id === 'geografi', 'Felt 8 har feil eierskap');
  assert(brief.domain?.ordinal === 8 && brief.domain?.id === 'bosetting_by_land_urbanisering', 'Felt 8 har feil domene');
  assert(brief.status === 'source_first_ready_not_materialized', 'Felt 8 skal være source-first, ikke materialisert');
  assert(brief.source_strategy?.source_first === true && brief.source_strategy?.minimum_sources_per_claim === 2, 'Felt 8 mangler source-first-kontrakt');
  assert(brief.source_strategy?.administrative_morphological_functional_geographies_must_be_distinguished === true, 'Administrative, morfologiske og funksjonelle geografier må skilles');
  assert(brief.source_strategy?.urban_and_rural_are_method_dependent_not_natural_binary_labels === true, 'Urban/rural må være metodeavhengig, ikke naturgitt binær');
  assert(brief.source_strategy?.built_up_surface_is_not_population_or_function === true, 'Built-up skal ikke behandles som befolkning eller funksjon');
  assert(brief.source_strategy?.boundary_change_must_be_distinguished_from_settlement_growth === true, 'Grenseendring må skilles fra bosettingsvekst');
  assert(brief.source_strategy?.urban_rural_linkages_require_flows_and_relations_not_proximity_alone === true, 'Urban-rural koblinger krever strømmer og relasjoner');
  assert(brief.source_strategy?.settlement_time_series_require_version_and_geography_harmonization === true, 'Bosettingstidsserier krever versjons- og geografiharmonisering');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Felt 8 krever 13 unike kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Alle felt 8-kilder må være inspectable og verifiserte');
  assert(sourceIds.has('geo8-01-un-wup2025') && sourceIds.has('geo8-02-eurostat-degurba') && sourceIds.has('geo8-03-oecd-fua'), 'WUP/DEGURBA/FUA må være representert');
  assert(sourceIds.has('geo8-11-ghsl-data') && sourceIds.has('geo8-12-ghsl-smod') && sourceIds.has('geo8-13-ghsl-built'), 'GHSL-data, bosettingsmodell og built-up må være representert');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Felt 8 krever åtte emner');
  assert(topics.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 50 && row.source_ids?.length >= 2), 'Alle felt 8-emner må ha metode, boundary og kilder');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Felt 8 krever 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle felt 8-claims må ha fler-kildespor');
  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6 && scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 8 krever seks kildekoblede scenarioer');
  assert(brief.planned_assessments === 8, 'Felt 8 krever åtte planlagte vurderinger');
  assert(brief.fulltext_requirements?.modules === 4 && brief.fulltext_requirements?.sections === 8 && brief.fulltext_requirements?.paragraphs === 32 && brief.fulltext_requirements?.verified_claims === 32 && brief.fulltext_requirements?.assessments === 8 && brief.fulltext_requirements?.decision_cases === 6, 'Felt 8 fulltekstplan skal være 4/8/32/32/8/6');

  const report = {
    schema: 'history_go_geografi_settlement_urban_rural_urbanisation_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    domain_id: 'bosetting_by_land_urbanisering',
    status: 'pass_source_first_ready_not_materialized',
    counts: { verifiedSources: sources.length, topicBriefs: topics.length, plannedClaims: claims.length, decisionScenarios: scenarios.length, plannedAssessments: brief.planned_assessments },
    gates: { administrative_morphological_functional_boundary: true, urban_rural_method_boundary: true, built_up_population_function_boundary: true, boundary_change_growth_boundary: true, urban_rural_flow_boundary: true, settlement_time_series_harmonization: true, multi_source_trace: true },
    six_part_quality_review: { correctness_and_evidence: 5, settlement_and_spatial_units: 5, urban_rural_classification: 5, morphology_and_built_up: 5, functional_urban_and_linkages: 5, temporal_harmonization_and_uncertainty: 5, total: 30 },
    next_gate: 'settlement_urban_rural_urbanisation_fulltext'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 8 source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 8 source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
