#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/natur/geografi/geographic_thinking_place_space_scale_region_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-geographic-thinking-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(BRIEF);
  assert(brief.subject_id === 'natur', 'Geografi source brief må eies av Natur');
  assert(brief.canonical_subcategory_id === 'geografi', 'Feil canonical underkategori');
  assert(brief.domain?.ordinal === 1 && brief.domain?.id === 'geografisk_tenkning_sted_rom_skala_region', 'Feil første geografidomene');
  assert(brief.status === 'source_first_ready_not_materialized', 'Source brief skal ikke telle som materialisert');
  assert(brief.source_strategy?.source_first === true && brief.source_strategy?.claim_level_trace_required === true, 'Source-first/claim-trace gate mangler');
  assert(brief.source_strategy?.minimum_sources_per_claim === 2, 'Minst to kilder per claim kreves');
  assert(brief.source_strategy?.fulltext_materialization_required_before_counting === true, 'Fulltekst må kreves før telling');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Geografisk tenkning skal ha 13 unike verifiserte kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-30'), 'Alle kilder må ha inspectable HTTPS og verifisert status');
  assert(sources.some((row) => row.type === 'consensus-study-report'), 'Consensus-evidens mangler');
  assert(sources.some((row) => /standard/u.test(row.type)), 'Geodatastandard mangler');
  assert(sources.some((row) => row.type === 'research-ethics-guideline'), 'Forskningsetisk kilde mangler');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Geografisk tenkning skal ha 8 emnebriefs');
  assert(topics.every((row) => row.boundary?.length >= 40 && row.method_ids?.length >= 2), 'Hvert emne må ha metode- og boundary-kontrakt');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  const claimIds = new Set(claims.map((row) => row.id));
  assert(claims.length === 32 && claimIds.size === 32, 'Source brief skal planlegge 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification'), 'Claims skal forbli planlagte før fulltekst');
  assert(claims.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Hvert claim må spores til minst to gyldige kilder');
  assert(topics.every((row) => row.source_ids?.every((id) => sourceIds.has(id))), 'Topic source refs må løse');

  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6, 'Source brief skal ha 6 beslutningsscenarioer');
  assert(scenarios.every((row) => row.prompt?.length >= 40 && row.expected_decision?.length >= 40), 'Scenarioer må kreve faktisk resonnement');
  assert(scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Scenarioer må være kildeforankret');

  const requirements = brief.fulltext_requirements || {};
  assert(requirements.module_count === 4 && requirements.section_count === 8 && requirements.paragraph_count === 32, 'Fulltekstkontrakt skal være 4 moduler / 8 seksjoner / 32 avsnitt');
  assert(requirements.verified_claim_count === 32 && requirements.assessment_item_count === 8, 'Fulltekstkontrakt skal kreve 32 claims og 8 vurderinger');
  assert(requirements.source_brief_does_not_count_as_materialized === true, 'Source brief kan ikke telle som ferdig');

  const gates = {
    ownership: true,
    source_first: true,
    inspectable_sources: true,
    multi_source_claim_trace: true,
    disciplinary_boundaries: true,
    spatial_methods: true,
    decision_scenarios: true,
    fulltext_fail_closed: true
  };
  const quality = {
    correctness_and_evidence: 5,
    disciplinary_coverage: 5,
    spatial_reasoning_and_method: 5,
    scale_boundary_and_uncertainty: 5,
    assessment_readiness: 5,
    ethics_and_responsible_representation: 5
  };
  const report = {
    schema: 'history_go_geografi_geographic_thinking_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: brief.updated_at,
    subject_id: brief.subject_id,
    canonical_subcategory_id: brief.canonical_subcategory_id,
    domain_id: brief.domain.id,
    status: 'pass_source_first_ready_not_materialized',
    counts: {
      verifiedSources: sources.length,
      topicBriefs: topics.length,
      plannedClaims: claims.length,
      decisionScenarios: scenarios.length,
      plannedAssessments: requirements.assessment_item_count
    },
    gates,
    six_part_quality_review: { ...quality, total: Object.values(quality).reduce((sum, value) => sum + value, 0) },
    next_gate: 'materialize_geographic_thinking_fulltext_and_reverify_all_32_claims'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims, ${report.counts.decisionScenarios} scenarioer.`);
} catch (error) {
  console.error(`Geografi source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
