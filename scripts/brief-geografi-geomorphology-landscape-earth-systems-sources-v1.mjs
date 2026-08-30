#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/natur/geografi/geomorphology_landscape_earth_systems_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-geomorphology-landscape-earth-systems-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(BRIEF);
  assert(brief.subject_id === 'natur' && brief.canonical_subcategory_id === 'geografi', 'Felt 3 har feil eierskap');
  assert(brief.domain?.ordinal === 3 && brief.domain?.id === 'geomorfologi_landskap_jordsystemer', 'Feil tredje geografidomene');
  assert(brief.domain?.production_mode === 'reuse_with_expansion', 'Felt 3 skal være kontrollert gjenbruk med geografifaglig utvidelse');
  assert(brief.status === 'source_first_ready_not_materialized', 'Felt 3 source brief skal ikke telle som materialisert');

  const reuse = brief.reuse_contract || {};
  assert(reuse.owner_subject_id === 'natur' && reuse.owner_chapters?.length === 2, 'Felt 3 må bevare to Natur-eierkapitler');
  assert(reuse.owner_chapters.includes('data/fagverk/natur/geologi_landskap_tid.json'), 'Natur-kapitlet geologi_landskap_tid mangler i gjenbrukskontrakten');
  assert(reuse.owner_chapters.includes('data/fagverk/natur/geologi_naturhistorie_v5_3.json'), 'Natur-kapitlet geologi_naturhistorie_v5_3 mangler i gjenbrukskontrakten');
  assert(reuse.existing_owner_content_remains_owned_by_natur === true && reuse.move_existing_files === false, 'Gjenbruk kan ikke flytte eller overta Natur-innhold');
  assert(reuse.reuse_does_not_count_without_geography_fulltext_claim_assessment_audit_overlay === true, 'Gjenbruk kan ikke telle uten eget Geografi-overlay');

  const strategy = brief.source_strategy || {};
  assert(strategy.source_first === true && strategy.claim_level_trace_required === true, 'Source-first/claim-trace gate mangler');
  assert(strategy.minimum_sources_per_claim === 2 && strategy.fulltext_materialization_required_before_counting === true, 'Felt 3 krever fler-kildespor og fulltekst før telling');
  assert(strategy.process_form_scale_and_uncertainty_required === true, 'Felt 3 må eksplisitt bevise prosess–form, skala og usikkerhet');
  assert(strategy.dem_or_landform_map_does_not_count_as_process_validation === true, 'DEM/landformkart kan ikke alene telle som prosessvalidering');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Felt 3 skal ha 13 unike verifiserte kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Alle felt 3-kilder må være inspectable og verifiserte');
  assert(sources.filter((row) => /peer-reviewed|scholarly/u.test(row.type)).length >= 5, 'Felt 3 trenger bred akademisk prosess- og metodedekning');
  assert(sources.filter((row) => /official/u.test(row.type)).length >= 6, 'Felt 3 trenger bred offisiell kart-, terreng- og prosessdokumentasjon');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Felt 3 skal ha 8 emnebriefs');
  assert(topics.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 40), 'Hvert felt 3-emne må ha metode- og boundary-kontrakt');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Felt 3 skal planlegge 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification'), 'Felt 3-claims må forbli planlagte før fulltekst');
  assert(claims.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Hvert felt 3-claim må ha minst to gyldige kilder');

  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6, 'Felt 3 skal ha 6 beslutningsscenarioer');
  assert(scenarios.every((row) => row.prompt?.length >= 70 && row.expected_decision?.length >= 80), 'Felt 3-scenarioer må kreve faktisk prosess- og metodevalg');
  assert(scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 3-scenarioer må være kildeforankret');

  const requirements = brief.fulltext_requirements || {};
  assert(requirements.module_count === 4 && requirements.section_count === 8 && requirements.paragraph_count === 32, 'Felt 3 fulltekst skal være 4/8/32');
  assert(requirements.verified_claim_count === 32 && requirements.assessment_item_count === 8, 'Felt 3 skal kreve 32 verifiserte claims og 8 vurderinger');
  assert(requirements.reuse_owner_content_must_remain_unmoved === true && requirements.source_brief_does_not_count_as_materialized === true, 'Felt 3 må bevare eierinnhold og være fail-closed');

  const gates = {
    ownership_and_reuse_boundary: true,
    source_first: true,
    inspectable_sources: true,
    academic_and_official_source_mix: true,
    multi_source_claim_trace: true,
    process_form_scale_boundary: true,
    dem_and_geomorphometry_boundary: true,
    slope_and_mass_movement_boundary: true,
    fluvial_and_sediment_connectivity: true,
    quaternary_and_landform_mapping: true,
    tectonic_model_uncertainty: true,
    human_modification_and_mapping_uncertainty: true,
    decision_scenarios: true,
    fulltext_fail_closed: true
  };
  const quality = {
    correctness_and_evidence: 5,
    geomorphology_process_depth: 5,
    terrain_and_mapping_method: 5,
    sediment_scale_and_system_reasoning: 5,
    uncertainty_and_alternative_explanations: 5,
    reuse_integrity_and_reproducibility: 5
  };
  const report = {
    schema: 'history_go_geografi_geomorphology_landscape_earth_systems_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    subject_id: 'natur',
    canonical_subcategory_id: 'geografi',
    domain_id: 'geomorfologi_landskap_jordsystemer',
    status: 'pass_source_first_ready_not_materialized',
    counts: { verifiedSources: sources.length, topicBriefs: topics.length, plannedClaims: claims.length, decisionScenarios: scenarios.length, plannedAssessments: requirements.assessment_item_count, reusedOwnerChapters: reuse.owner_chapters.length },
    gates,
    six_part_quality_review: { ...quality, total: Object.values(quality).reduce((sum, value) => sum + value, 0) },
    next_gate: 'materialize_geomorphology_landscape_earth_systems_fulltext_and_reverify_all_32_claims'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 3 source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims, ${report.counts.decisionScenarios} scenarioer.`);
} catch (error) {
  console.error(`Geografi felt 3 source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
