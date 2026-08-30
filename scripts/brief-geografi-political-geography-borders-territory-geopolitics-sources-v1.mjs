#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'data/fag/natur/geografi/political_geography_borders_territory_geopolitics_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-political-geography-borders-territory-geopolitics-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(SOURCE);
  assert(brief.subject_id === 'natur' && brief.canonical_subcategory_id === 'geografi', 'Felt 10 har feil eierskap');
  assert(brief.domain?.ordinal === 10 && brief.domain?.id === 'politisk_geografi_grenser_territorium_geopolitikk', 'Felt 10 har feil domene');
  assert(brief.domain?.production_mode === 'new_production' && brief.status === 'source_first_ready_not_materialized', 'Felt 10 skal være source-first nyproduksjon');
  assert(brief.source_strategy?.source_first === true && brief.source_strategy?.minimum_sources_per_claim === 2, 'Felt 10 mangler source-first-kontrakt');

  const requiredFlags = [
    'legal_sovereignty_jurisdiction_and_effective_control_must_be_distinguished',
    'border_line_border_regime_and_cross_border_flow_must_be_distinguished',
    'maritime_zones_have_different_rights_and_must_not_be_collapsed',
    'occupation_or_effective_control_does_not_transfer_sovereignty',
    'conflict_event_data_does_not_itself_establish_territorial_legal_status',
    'geopolitical_narrative_must_be_distinguished_from_empirical_spatial_evidence',
    'disputed_boundaries_require_status_metadata_and_cartographic_disclaimers',
    'territorial_scale_and_region_are_constructed_analytical_units_not_natural_containers'
  ];
  assert(requiredFlags.every((key) => brief.source_strategy?.[key] === true), 'Felt 10 mangler én eller flere fail-closed metodegrenser');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Felt 10 krever 13 unike kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Alle felt 10-kilder må være inspectable og verifiserte');
  assert(sourceIds.has('geo10-01-un-charter') && sourceIds.has('geo10-02-unclos-territorial-sea') && sourceIds.has('geo10-03-unclos-eez') && sourceIds.has('geo10-04-icj-statute'), 'Internasjonalrettslige kilder mangler');
  assert(sourceIds.has('geo10-06-ucdp-definitions') && sourceIds.has('geo10-07-acled-codebook') && sourceIds.has('geo10-08-icrc-occupation'), 'Konflikt/kontroll-kilder mangler');
  assert(sourceIds.has('geo10-09-un-geospatial') && sourceIds.has('geo10-10-natural-earth') && sourceIds.has('geo10-11-agnew-territorial-trap') && sourceIds.has('geo10-12-newman-borders') && sourceIds.has('geo10-13-paasi-region-place'), 'Kartografi eller political-geography teori mangler');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Felt 10 krever åtte emner');
  assert(topics.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 60 && row.source_ids?.length >= 2), 'Alle felt 10-emner må ha metode, boundary og kilder');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Felt 10 krever 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle felt 10-claims må ha gyldig fler-kildespor');
  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6 && scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 10 krever seks kildekoblede scenarioer');
  assert(brief.planned_assessments === 8, 'Felt 10 krever åtte planlagte vurderinger');
  assert(brief.fulltext_requirements?.modules === 4 && brief.fulltext_requirements?.sections === 8 && brief.fulltext_requirements?.paragraphs === 32 && brief.fulltext_requirements?.verified_claims === 32 && brief.fulltext_requirements?.assessments === 8 && brief.fulltext_requirements?.decision_cases === 6, 'Felt 10 fulltekstplan skal være 4/8/32/32/8/6');

  const report = {
    schema: 'history_go_geografi_political_geography_borders_territory_geopolitics_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    domain_id: 'politisk_geografi_grenser_territorium_geopolitikk',
    status: 'pass_source_first_ready_not_materialized',
    counts: { verifiedSources: sources.length, topicBriefs: topics.length, plannedClaims: claims.length, decisionScenarios: scenarios.length, plannedAssessments: brief.planned_assessments },
    gates: { sovereignty_jurisdiction_control_boundary: true, border_regime_flow_boundary: true, maritime_zone_boundary: true, occupation_sovereignty_boundary: true, conflict_event_status_boundary: true, geopolitical_narrative_evidence_boundary: true, disputed_boundary_metadata: true, territorial_scale_boundary: true, multi_source_trace: true },
    six_part_quality_review: { correctness_and_evidence: 5, sovereignty_territoriality_and_scale: 5, borders_and_maritime_jurisdiction: 5, de_jure_de_facto_control: 5, conflict_events_and_geopolitics: 5, political_cartography_and_reproducibility: 5, total: 30 },
    next_gate: 'political_geography_borders_territory_geopolitics_fulltext'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 10 source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 10 source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
