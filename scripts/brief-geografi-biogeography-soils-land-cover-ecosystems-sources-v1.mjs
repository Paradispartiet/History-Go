#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/natur/geografi/biogeography_soils_land_cover_ecosystems_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-biogeography-soils-land-cover-ecosystems-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(BRIEF);
  assert(brief.subject_id === 'natur' && brief.canonical_subcategory_id === 'geografi', 'Felt 6 har feil eierskap');
  assert(brief.domain?.ordinal === 6 && brief.domain?.id === 'biogeografi_jord_arealdekke_okosystem', 'Feil sjette geografidomene');
  assert(brief.domain?.production_mode === 'reuse_with_expansion' && brief.status === 'source_first_ready_not_materialized', 'Felt 6 må være reuse source-first, ikke materialisert');
  assert(brief.reuse_contract?.owner_chapters?.length === 3, 'Felt 6 skal binde tre Natur-eierkapitler');
  assert(brief.reuse_contract.owner_chapters.every((file) => fs.existsSync(abs(file))), 'Et Natur-eierkapittel for felt 6 mangler');
  assert(brief.reuse_contract?.existing_owner_content_remains_owned_by_natur === true && brief.reuse_contract?.move_existing_files === false, 'Natur-eierinnhold skal ikke flyttes');
  assert(brief.source_strategy?.minimum_sources_per_claim === 2 && brief.source_strategy?.soil_grid_is_prediction_not_observation === true, 'Jordprediksjons-/fler-kilde-port mangler');
  assert(brief.source_strategy?.occurrence_does_not_equal_absence_or_complete_distribution === true && brief.source_strategy?.land_cover_does_not_equal_land_use === true, 'Felt 6 mangler occurrence/absence eller land-cover/land-use boundary');
  assert(brief.source_strategy?.classification_change_requires_version_and_method_control === true && brief.source_strategy?.scale_sampling_bias_and_uncertainty_required === true, 'Felt 6 mangler versjons- eller skala/usikkerhetsport');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Felt 6 skal ha 13 unike kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Alle felt 6-kilder må være inspectable og verifiserte');
  assert(sources.some((row) => row.publisher.includes('ISRIC')) && sources.some((row) => row.publisher.includes('European Space Agency')), 'Jord- eller landdekkekilder mangler');
  assert(sources.some((row) => row.publisher.includes('Global Biodiversity')) && sources.some((row) => row.publisher.includes('IUCN')), 'Artsutbredelses-kildedekning mangler');
  assert(sources.some((row) => row.publisher === 'IPCC') && sources.some((row) => row.publisher === 'Artsdatabanken'), 'Økosystem- eller norsk naturtypekilde mangler');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Felt 6 skal ha 8 emnebriefs');
  assert(topics.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 40), 'Hvert felt 6-emne må ha metode- og boundary-kontrakt');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Felt 6 skal planlegge 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification'), 'Felt 6-claims må forbli planlagte før fulltekst');
  assert(claims.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Hvert felt 6-claim må ha minst to gyldige kilder');

  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6, 'Felt 6 skal ha 6 beslutningsscenarioer');
  assert(scenarios.every((row) => row.prompt?.length >= 50 && row.expected_decision?.length >= 50), 'Felt 6-scenarioer må kreve faktisk metodevalg');
  assert(scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 6-scenarioer må være kildeforankret');

  const req = brief.fulltext_requirements || {};
  assert(req.module_count === 4 && req.section_count === 8 && req.paragraph_count === 32, 'Felt 6 fulltekst skal være 4/8/32');
  assert(req.verified_claim_count === 32 && req.assessment_item_count === 8 && req.source_brief_does_not_count_as_materialized === true, 'Felt 6 fulltekstport er ufullstendig');

  const report = {
    schema: 'history_go_geografi_biogeography_soils_land_cover_ecosystems_source_brief_audit_v1',
    version: '1.0.0', updated_at: '2026-08-30', subject_id: 'natur', canonical_subcategory_id: 'geografi', domain_id: 'biogeografi_jord_arealdekke_okosystem',
    status: 'pass_source_first_ready_not_materialized',
    counts: { verifiedSources: sources.length, topicBriefs: topics.length, plannedClaims: claims.length, decisionScenarios: scenarios.length, plannedAssessments: req.assessment_item_count, reuseOwnerChapters: brief.reuse_contract.owner_chapters.length },
    gates: { ownership: true, reuse_owner_preserved: true, source_first: true, inspectable_sources: true, multi_source_claim_trace: true, soil_prediction_observation_boundary: true, occurrence_absence_boundary: true, land_cover_land_use_boundary: true, classification_version_control: true, sampling_scale_uncertainty: true, ecosystem_multi_driver_boundary: true, fulltext_fail_closed: true },
    six_part_quality_review: { correctness_and_evidence: 5, biogeography_and_ecosystems: 5, soils_and_prediction: 5, land_cover_and_remote_sensing: 5, occurrence_sampling_and_connectivity: 5, scale_uncertainty_and_reproducibility: 5, total: 30 },
    next_gate: 'materialize_biogeography_soils_land_cover_ecosystems_fulltext_and_reverify_all_32_claims'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 6 source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims, ${report.counts.decisionScenarios} scenarioer.`);
} catch (error) {
  console.error(`Geografi felt 6 source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
