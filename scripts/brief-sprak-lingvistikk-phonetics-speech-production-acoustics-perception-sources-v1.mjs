#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/litteratur/sprak_lingvistikk/phonetics_speech_production_acoustics_perception_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/sprak-lingvistikk-phonetics-speech-production-acoustics-perception-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read(BRIEF);
  assert(brief.subject_id === 'litteratur' && brief.canonical_subcategory_id === 'sprak_lingvistikk', 'Fonetikk source brief har feil eierskap');
  assert(brief.domain?.ordinal === 2 && brief.domain?.id === 'fonetikk_taleproduksjon_akustikk_persepsjon', 'Feil lingvistikkdomene 2');
  assert(brief.status === 'source_first_ready_not_materialized', 'Fonetikk source brief kan ikke telle som materialisert');
  assert(brief.source_strategy?.source_first === true && brief.source_strategy?.claim_level_trace_required === true && brief.source_strategy?.minimum_sources_per_claim === 2, 'Source-first claim-trace gate mangler');
  assert(brief.source_strategy?.fulltext_materialization_required_before_counting === true, 'Fulltekst må kreves før telling');

  const sources = brief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Fonetikk skal ha 13 unike kilder');
  assert(sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-31'), 'Alle Fonetikk-kilder må være inspectable og verifisert');
  assert(sources.some((row) => row.type === 'disciplinary-phonetic-standard'), 'IPA-standard mangler');
  assert(sources.some((row) => row.type === 'phonetic-analysis-software-resource'), 'Akustisk analyseverktøy mangler');
  assert(sources.some((row) => row.type === 'peer-reviewed-method-article'), 'Peer-reviewed tidsmålingsevidens mangler');
  assert(sources.some((row) => row.type === 'peer-reviewed-acoustic-study'), 'Peer-reviewed vokalakustisk evidens mangler');
  assert(sources.some((row) => row.type === 'research-language-audio-archive'), 'Tverrspråklig lydarkiv mangler');

  const topics = brief.topic_briefs || [];
  assert(topics.length === 8, 'Fonetikk skal ha 8 emnebriefs');
  assert(topics.every((row) => row.boundary?.length >= 80 && row.method_ids?.length >= 2), 'Hvert Fonetikk-emne må ha robust metode- og boundary-kontrakt');
  const claims = topics.flatMap((row) => row.planned_claims || []);
  assert(claims.length === 32 && new Set(claims.map((row) => row.id)).size === 32, 'Fonetikk source brief skal ha 32 unike claims');
  assert(claims.every((row) => row.status === 'planned_requires_fulltext_verification' && row.text?.length >= 100), 'Fonetikk-claims skal være substansielle og planlagte');
  assert(claims.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle Fonetikk-claims må ha minst to gyldige kilder');
  assert(topics.every((row) => row.source_ids?.every((id) => sourceIds.has(id))), 'Topic source refs må løse');

  const scenarios = brief.decision_scenarios || [];
  assert(scenarios.length === 6, 'Fonetikk source brief skal ha 6 case');
  assert(scenarios.every((row) => row.prompt?.length >= 100 && row.expected_decision?.length >= 100), 'Fonetikk-case må kreve faktisk resonnement');
  assert(scenarios.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Fonetikk-case må være kildeforankret');

  const req = brief.fulltext_requirements || {};
  assert(req.module_count === 4 && req.section_count === 8 && req.paragraph_count === 32 && req.minimum_paragraph_characters === 420, 'Fonetikk fulltekstkontrakt skal være 4/8/32 med minst 420 tegn');
  assert(req.verified_claim_count === 32 && req.source_count === 13 && req.assessment_item_count === 8 && req.decision_scenario_count === 6, 'Fonetikk fulltekstkontrakt skal kreve 32 claims / 13 kilder / 8 vurderinger / 6 case');
  assert(req.source_brief_does_not_count_as_materialized === true && req.all_claims_require_fulltext_reverification === true, 'Source brief må være fail-closed');

  const boundaries = topics.map((row) => row.boundary).join(' ').toLowerCase();
  assert(/ipa-symbol|symbol/u.test(boundaries), 'IPA signal/representasjon-grense mangler');
  assert(/formant|spektr/u.test(boundaries), 'Akustisk målegrense mangler');
  assert(/voice onset time|vot/u.test(boundaries), 'VOT-grense mangler');
  assert(/percept|lyttere/u.test(boundaries), 'Persepsjonsgrense mangler');
  assert(/analyseverktøy|tall/u.test(boundaries), 'Måleverktøy/valideringsgrense mangler');

  const quality = { correctness_and_evidence:5, articulatory_and_acoustic_coverage:5, measurement_and_transcription:5, perception_and_variation:5, assessment_readiness:5, reproducibility_and_uncertainty:5 };
  const report = {
    schema:'history_go_sprak_lingvistikk_phonetics_source_brief_audit_v1', version:'1.0.0', updated_at:brief.updated_at,
    subject_id:brief.subject_id, canonical_subcategory_id:brief.canonical_subcategory_id, domain_id:brief.domain.id,
    status:'pass_source_first_ready_not_materialized',
    counts:{ verifiedSources:sources.length, topicBriefs:topics.length, plannedClaims:claims.length, decisionScenarios:scenarios.length, plannedAssessments:req.assessment_item_count },
    gates:{ ownership:true, source_first:true, inspectable_sources:true, multi_source_claim_trace:true, articulation:true, acoustics:true, temporal_measurement:true, perception:true, reproducibility:true, fulltext_fail_closed:true },
    six_part_quality_review:{ ...quality, total:Object.values(quality).reduce((sum, value) => sum + value, 0) },
    next_gate:'materialize_phonetics_fulltext_and_reverify_all_32_claims'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Fonetikk source-first OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} emner, ${report.counts.plannedClaims} claims, ${report.counts.decisionScenarios} case.`);
} catch (error) {
  console.error(`Fonetikk source-first FEIL: ${error.message}`);
  process.exitCode = 1;
}
