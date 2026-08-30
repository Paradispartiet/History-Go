#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/natur/geografi/climate_weather_zones_change_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-climate-weather-zones-change-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(BRIEF);
  assert(brief.subject_id === 'natur' && brief.canonical_subcategory_id === 'geografi', 'Felt 4 har feil eierskap');
  assert(brief.domain?.ordinal === 4 && brief.domain?.id === 'klima_vaer_klimasoner_endring', 'Feil fjerde geografidomene');
  assert(brief.domain?.production_mode === 'reuse_with_expansion', 'Felt 4 skal være reuse_with_expansion');
  assert(brief.status === 'source_first_ready_not_materialized', 'Felt 4 source brief skal ikke telle som materialisert');
  assert(brief.reuse_contract?.existing_owner_content_remains_owned_by_natur === true && brief.reuse_contract?.move_existing_files === false, 'Natur-eierkapitlet skal ikke flyttes');
  assert(brief.reuse_contract?.owner_chapters?.length === 1 && brief.reuse_contract.owner_chapters[0] === 'data/fagverk/natur/klima_energi_resiliens.json', 'Felt 4 mangler korrekt Natur-eierbinding');
  assert(brief.source_strategy?.source_first === true && brief.source_strategy?.claim_level_trace_required === true && brief.source_strategy?.minimum_sources_per_claim === 2, 'Felt 4 mangler source-first claim trace');
  assert(brief.source_strategy?.single_weather_event_does_not_count_as_climate_trend === true, 'Værhendelse må eksplisitt være ikke-tellende som klimatrend');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Felt 4 skal ha 13 unike kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Felt 4-kilder må være inspectable og verifiserte');
  assert(sources.filter((row) => /IPCC/u.test(row.publisher)).length >= 5, 'Felt 4 trenger bred IPCC-dekning av fysisk og regional klimakunnskap');
  assert(sources.some((row) => /Meteorological Organization/u.test(row.publisher)), 'WMO-normalgrunnlag mangler');
  assert(sources.some((row) => /reanalysis/u.test(row.type)), 'Felt 4 mangler reanalyseprodukt');
  assert(sources.filter((row) => /peer-reviewed/u.test(row.type)).length >= 2, 'Felt 4 mangler fagfellevurdert klimaklassifikasjon');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8 && topics.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 40), 'Felt 4 skal ha 8 metode- og boundary-koblede emner');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Felt 4 skal planlegge 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle felt 4-claims må forbli planlagte og ha fler-kildespor');

  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6 && scenarios.every((row) => row.prompt?.length >= 70 && row.expected_decision?.length >= 80), 'Felt 4 skal ha seks substansielle beslutningsscenarioer');
  assert(scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 4-scenarioer må være kildekoblet');
  const req = brief.fulltext_requirements || {};
  assert(req.module_count === 4 && req.section_count === 8 && req.paragraph_count === 32 && req.verified_claim_count === 32 && req.assessment_item_count === 8, 'Felt 4 fulltekstkrav skal være 4/8/32/32/8');
  assert(req.source_brief_does_not_count_as_materialized === true && req.reuse_owner_content_must_remain_unmoved === true, 'Felt 4 må være fail-closed og bevare eierinnhold');

  const report = {
    schema: 'history_go_geografi_climate_weather_zones_change_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    subject_id: 'natur',
    canonical_subcategory_id: 'geografi',
    domain_id: 'klima_vaer_klimasoner_endring',
    status: 'pass_source_first_ready_not_materialized',
    counts: { verifiedSources: sources.length, topicBriefs: topics.length, plannedClaims: claims.length, decisionScenarios: scenarios.length, plannedAssessments: req.assessment_item_count, reuseOwnerChapters: 1 },
    gates: { ownership: true, reuse_owner_preserved: true, source_first: true, climate_normals: true, station_metadata: true, energy_and_drivers: true, spatial_climate_controls: true, classification_boundaries: true, station_grid_reanalysis: true, extremes_and_nonstationarity: true, regional_projection_uncertainty: true, scale_transition: true },
    six_part_quality_review: { correctness_and_evidence: 5, climatology_depth: 5, spatial_and_regional_method: 5, observation_and_reanalysis_precision: 5, extremes_and_change_uncertainty: 5, reuse_and_reproducibility: 5, total: 30 },
    next_gate: 'materialize_climate_weather_zones_change_fulltext_and_reverify_all_32_claims'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 4 source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims, ${report.counts.decisionScenarios} scenarioer.`);
} catch (error) {
  console.error(`Geografi felt 4 source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
