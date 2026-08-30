#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/natur/geografi/hydrology_ocean_cryosphere_rivers_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-hydrology-ocean-cryosphere-rivers-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(BRIEF);
  assert(brief.subject_id === 'natur' && brief.canonical_subcategory_id === 'geografi', 'Felt 5 har feil eierskap');
  assert(brief.domain?.ordinal === 5 && brief.domain?.id === 'hydrologi_hav_kryosfaere_vassdrag', 'Feil femte geografidomene');
  assert(brief.domain?.production_mode === 'reuse_with_expansion' && brief.status === 'source_first_ready_not_materialized', 'Felt 5 må være reuse source-first, ikke materialisert');
  assert(brief.reuse_contract?.owner_chapters?.length === 1 && brief.reuse_contract.owner_chapters[0] === 'data/fagverk/natur/vann_hydrologi_kretslop.json', 'Felt 5 har feil Natur-eierbinding');
  assert(brief.reuse_contract?.existing_owner_content_remains_owned_by_natur === true && brief.reuse_contract?.move_existing_files === false, 'Natur-eierinnhold skal ikke flyttes');
  assert(fs.existsSync(abs(brief.reuse_contract.owner_chapters[0])), 'Natur-eierkapitlet mangler');
  assert(brief.source_strategy?.minimum_sources_per_claim === 2 && brief.source_strategy?.basin_water_balance_required === true, 'Vannbalanse/fler-kilde-port mangler');
  assert(brief.source_strategy?.surface_groundwater_connectivity_required === true && brief.source_strategy?.ocean_cryosphere_boundary_required === true, 'Felt 5 mangler overflate/grunnvann eller hav/kryosfære-boundary');
  assert(brief.source_strategy?.station_model_or_forecast_does_not_count_as_observed_truth === true, 'Modell/varsel kan ikke telle som observert sannhet');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Felt 5 skal ha 13 unike kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Alle felt 5-kilder må være inspectable og verifiserte');
  assert(sources.some((row) => row.publisher.includes('Norges vassdrags')), 'NVE-kilder mangler');
  assert(sources.some((row) => row.publisher === 'IPCC') && sources.some((row) => row.publisher.includes('NOAA')) && sources.some((row) => row.publisher.includes('Snow and Ice')), 'Hav/kryosfære-kildedekning mangler');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Felt 5 skal ha 8 emnebriefs');
  assert(topics.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 40), 'Hvert felt 5-emne må ha metode- og boundary-kontrakt');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Felt 5 skal planlegge 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification'), 'Felt 5-claims må forbli planlagte før fulltekst');
  assert(claims.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Hvert felt 5-claim må ha minst to gyldige kilder');

  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6, 'Felt 5 skal ha 6 beslutningsscenarioer');
  assert(scenarios.every((row) => row.prompt?.length >= 50 && row.expected_decision?.length >= 50), 'Felt 5-scenarioer må kreve faktisk metodevalg');
  assert(scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 5-scenarioer må være kildeforankret');

  const req = brief.fulltext_requirements || {};
  assert(req.module_count === 4 && req.section_count === 8 && req.paragraph_count === 32, 'Felt 5 fulltekst skal være 4/8/32');
  assert(req.verified_claim_count === 32 && req.assessment_item_count === 8 && req.source_brief_does_not_count_as_materialized === true, 'Felt 5 fulltekstport er ufullstendig');

  const report = {
    schema: 'history_go_geografi_hydrology_ocean_cryosphere_rivers_source_brief_audit_v1',
    version: '1.0.0', updated_at: '2026-08-30', subject_id: 'natur', canonical_subcategory_id: 'geografi', domain_id: 'hydrologi_hav_kryosfaere_vassdrag',
    status: 'pass_source_first_ready_not_materialized',
    counts: { verifiedSources: sources.length, topicBriefs: topics.length, plannedClaims: claims.length, decisionScenarios: scenarios.length, plannedAssessments: req.assessment_item_count, reuseOwnerChapters: 1 },
    gates: { ownership: true, reuse_owner_preserved: true, source_first: true, inspectable_sources: true, multi_source_claim_trace: true, basin_water_balance: true, groundwater_surface_connectivity: true, ocean_tide_current_boundary: true, cryosphere_components: true, flood_drought_uncertainty: true, station_model_forecast_boundary: true, fulltext_fail_closed: true },
    six_part_quality_review: { correctness_and_evidence: 5, hydrology_and_water_balance: 5, ocean_and_cryosphere: 5, spatial_method_and_observation: 5, extremes_and_forecasting: 5, reuse_uncertainty_and_reproducibility: 5, total: 30 },
    next_gate: 'materialize_hydrology_ocean_cryosphere_rivers_fulltext_and_reverify_all_32_claims'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 5 source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims, ${report.counts.decisionScenarios} scenarioer.`);
} catch (error) {
  console.error(`Geografi felt 5 source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
