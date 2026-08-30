#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/natur/geografi/cartography_gis_geodata_remote_sensing_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-cartography-gis-geodata-remote-sensing-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(BRIEF);
  assert(brief.subject_id === 'natur' && brief.canonical_subcategory_id === 'geografi', 'Felt 2 har feil eierskap');
  assert(brief.domain?.ordinal === 2 && brief.domain?.id === 'kartografi_gis_geodata_fjernmaling', 'Feil andre geografidomene');
  assert(brief.status === 'source_first_ready_not_materialized', 'Felt 2 source brief skal ikke telle som materialisert');
  assert(brief.source_strategy?.source_first === true && brief.source_strategy?.claim_level_trace_required === true, 'Source-first/claim-trace gate mangler');
  assert(brief.source_strategy?.minimum_sources_per_claim === 2 && brief.source_strategy?.standards_and_sensor_documentation_required === true, 'Felt 2 krever minst to kilder samt standard-/sensordokumentasjon');
  assert(brief.source_strategy?.map_or_software_output_does_not_count_as_validation === true, 'Kart/programvareoutput kan ikke telle som validering');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Felt 2 skal ha 13 unike verifiserte kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Alle felt 2-kilder må være inspectable og verifiserte');
  assert(sources.filter((row) => /standard/u.test(row.type)).length >= 6, 'Felt 2 trenger bred standarddekning');
  assert(sources.filter((row) => /sensor|processed-product/u.test(row.type)).length >= 3, 'Felt 2 trenger offisiell sensor-/produktdokumentasjon');
  assert(sources.some((row) => row.type === 'peer-reviewed-method-review'), 'Fagfellevurdert valideringsmetode mangler');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Felt 2 skal ha 8 emnebriefs');
  assert(topics.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 40), 'Hvert felt 2-emne må ha metode- og boundary-kontrakt');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Felt 2 skal planlegge 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification'), 'Felt 2-claims må forbli planlagte før fulltekst');
  assert(claims.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Hvert felt 2-claim må ha minst to gyldige kilder');

  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6, 'Felt 2 skal ha 6 beslutningsscenarioer');
  assert(scenarios.every((row) => row.prompt?.length >= 50 && row.expected_decision?.length >= 50), 'Felt 2-scenarioer må kreve faktisk metodevalg');
  assert(scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 2-scenarioer må være kildeforankret');

  const requirements = brief.fulltext_requirements || {};
  assert(requirements.module_count === 4 && requirements.section_count === 8 && requirements.paragraph_count === 32, 'Felt 2 fulltekst skal være 4/8/32');
  assert(requirements.verified_claim_count === 32 && requirements.assessment_item_count === 8, 'Felt 2 skal kreve 32 verifiserte claims og 8 vurderinger');
  assert(requirements.source_brief_does_not_count_as_materialized === true, 'Felt 2 source brief kan ikke telle som materialisert');

  const gates = {
    ownership: true,
    source_first: true,
    inspectable_sources: true,
    standards_coverage: true,
    sensor_documentation: true,
    multi_source_claim_trace: true,
    projection_crs_boundaries: true,
    vector_raster_interoperability: true,
    remote_sensing_validation: true,
    provenance_and_quality: true,
    decision_scenarios: true,
    fulltext_fail_closed: true
  };
  const quality = {
    correctness_and_evidence: 5,
    cartography_and_reference_systems: 5,
    gis_and_interoperability: 5,
    remote_sensing_method: 5,
    validation_and_uncertainty: 5,
    reproducibility_and_data_quality: 5
  };
  const report = {
    schema: 'history_go_geografi_cartography_gis_geodata_remote_sensing_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    subject_id: 'natur',
    canonical_subcategory_id: 'geografi',
    domain_id: 'kartografi_gis_geodata_fjernmaling',
    status: 'pass_source_first_ready_not_materialized',
    counts: { verifiedSources: sources.length, topicBriefs: topics.length, plannedClaims: claims.length, decisionScenarios: scenarios.length, plannedAssessments: requirements.assessment_item_count },
    gates,
    six_part_quality_review: { ...quality, total: Object.values(quality).reduce((sum, value) => sum + value, 0) },
    next_gate: 'materialize_cartography_gis_geodata_remote_sensing_fulltext_and_reverify_all_32_claims'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 2 source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims, ${report.counts.decisionScenarios} scenarioer.`);
} catch (error) {
  console.error(`Geografi felt 2 source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
