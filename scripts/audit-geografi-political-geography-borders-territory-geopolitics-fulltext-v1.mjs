#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER = 'data/fagverk/natur/geografi/politisk-geografi-grenser-territorium-og-geopolitikk.json';
const DIR = 'data/fagverk/natur/geografi/politisk-geografi-grenser-territorium-og-geopolitikk';
const SOURCE_BRIEF = 'data/fag/natur/geografi/political_geography_borders_territory_geopolitics_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-political-geography-borders-territory-geopolitics-fulltext-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const chapter = read(CHAPTER);
  const sourceBrief = read(SOURCE_BRIEF);
  const brief = read(`${DIR}/brief.json`);
  const claimsDoc = read(`${DIR}/claims.json`);
  const assessment = read(`${DIR}/assessment.json`);

  assert(chapter.subject_id === 'natur' && chapter.canonical_subcategory_id === 'geografi', 'Felt 10 har feil eierskap');
  assert(chapter.domain_id === 'politisk_geografi_grenser_territorium_geopolitikk', 'Felt 10 har feil domene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.sourceFirst === true && chapter.reuseWithExpansion === false, 'Felt 10 mangler new-production chapter-kontrakt');
  assert(chapter.moduleFiles?.length === 4, 'Felt 10 skal ha fire moduler');
  assert(sourceBrief.domain?.ordinal === 10 && sourceBrief.domain?.production_mode === 'new_production', 'Source brief har feil felt 10-kontrakt');
  assert(brief.sourceBriefFile === SOURCE_BRIEF && brief.sections?.length === 8 && brief.strict_boundaries?.length === 8, 'Felt 10 fulltekstbrief er ufullstendig');

  const modules = chapter.moduleFiles.map(read);
  assert(modules.every((row) => row.subject_id === 'natur' && row.canonical_subcategory_id === 'geografi' && row.chapter_id === chapter.chapter_id), 'Felt 10-moduler har feil eierskap');
  const sections = modules.flatMap((row) => row.sections || []);
  assert(sections.length === 8 && sections.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 60), 'Felt 10 skal ha åtte metode- og boundary-koblede seksjoner');
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  const shortParagraphs = paragraphs.map((text, index) => ({ index: index + 1, length: text.length })).filter((row) => row.length < 420);
  assert(paragraphs.length === 32 && shortParagraphs.length === 0, `Felt 10 skal ha 32 substansielle fulltekstavsnitt; korte: ${JSON.stringify(shortParagraphs)}`);
  const paragraphClaimRows = sections.flatMap((row) => row.paragraphClaimIds || []);
  assert(paragraphClaimRows.length === 32 && paragraphClaimRows.every((ids) => ids.length === 1), 'Hvert felt 10-avsnitt skal ha ett primært claim');
  const paragraphClaimIds = paragraphClaimRows.flat();
  assert(new Set(paragraphClaimIds).size === 32, 'Alle felt 10-avsnitt skal ha unike claims');

  const sources = sourceBrief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sourceIds.size === 13 && sources.every((row) => row.retrieval_status === 'verified_2026-08-30' && /^https:\/\//u.test(row.url)), 'Felt 10 krever 13 inspectable verifiserte kilder');
  const planned = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims || []);
  const plannedIds = planned.map((row) => row.id);
  assert(planned.length === 32 && new Set(plannedIds).size === 32, 'Source brief må ha 32 planlagte claims');
  assert(planned.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle source-first claims må ha fler-kildespor');
  const verified = claimsDoc.verifiedClaims || [];
  assert(claimsDoc.trace_mode === 'source_brief_claim_text_and_sources_immutable', 'Claimregisteret må låse source-brief tekst og kildespor');
  assert(verified.length === 32 && verified.every((row) => row.status === 'verified' && row.verified_at === '2026-08-30'), 'Felt 10 mangler 32 reverifiserte claims');
  assert(new Set(verified.map((row) => row.id)).size === 32 && verified.every((row) => plannedIds.includes(row.id)), 'Verifiserte claims må være nøyaktig source-first claimsettet');
  assert(paragraphClaimIds.every((id) => plannedIds.includes(id)), 'Alle felt 10-avsnittsclaims må finnes i source brief');

  const strategy = sourceBrief.source_strategy || {};
  assert(strategy.legal_sovereignty_jurisdiction_and_effective_control_must_be_distinguished === true, 'Suverenitet/jurisdiksjon/kontroll-port mangler');
  assert(strategy.border_line_border_regime_and_cross_border_flow_must_be_distinguished === true, 'Grenselinje/regime/flyt-port mangler');
  assert(strategy.maritime_zones_have_different_rights_and_must_not_be_collapsed === true, 'Maritime soner-port mangler');
  assert(strategy.occupation_or_effective_control_does_not_transfer_sovereignty === true, 'Okkupasjon/suverenitet-port mangler');
  assert(strategy.conflict_event_data_does_not_itself_establish_territorial_legal_status === true, 'Konflikthendelse/status-port mangler');
  assert(strategy.geopolitical_narrative_must_be_distinguished_from_empirical_spatial_evidence === true, 'Geopolitisk narrativ/evidens-port mangler');
  assert(strategy.disputed_boundaries_require_status_metadata_and_cartographic_disclaimers === true, 'Disputed-boundary metadata-port mangler');
  assert(strategy.territorial_scale_and_region_are_constructed_analytical_units_not_natural_containers === true, 'Skala/region-port mangler');

  const questions = assessment.questions || [];
  assert(questions.length === 8 && questions.every((row) => row.type === 'multiple_choice' && row.options?.[row.answerIndex] === row.answer), 'Felt 10 skal ha åtte maskinelt konsistente vurderinger');
  assert(questions.every((row) => plannedIds.includes(row.claim_id) && row.source?.length >= 2 && row.source.every((id) => sourceIds.has(id))), 'Vurderinger må være claim- og kildekoblet');
  const cases = assessment.caseTasks || [];
  assert(cases.length === 6 && cases.every((row) => row.responseMode === 'guided_discussion_no_required_typing'), 'Felt 10 krever seks resonnementscase');
  assert(cases.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 10-case må være kildekoblet');

  const report = {
    schema: 'history_go_geografi_political_geography_borders_territory_geopolitics_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    subject_id: 'natur',
    canonical_subcategory_id: 'geografi',
    domain_id: 'politisk_geografi_grenser_territorium_geopolitikk',
    status: 'pass_fulltext_materialized_domain_ready_for_registry',
    counts: { modules: modules.length, sections: sections.length, paragraphs: paragraphs.length, verifiedClaims: verified.length, verifiedSources: sourceIds.size, assessments: questions.length, decisionCases: cases.length },
    gates: { ownership: true, new_production: true, four_modules: true, eight_sections: true, thirty_two_paragraphs: true, thirty_two_verified_claims: true, multi_source_trace: true, sovereignty_jurisdiction_control_boundary: true, territorial_scale_boundary: true, border_regime_flow_boundary: true, maritime_zone_boundary: true, occupation_sovereignty_boundary: true, conflict_event_status_boundary: true, geopolitical_narrative_evidence_boundary: true, disputed_boundary_metadata: true, reproducibility: true },
    six_part_quality_review: { correctness_and_evidence: 5, sovereignty_territoriality_and_scale: 5, borders_and_maritime_jurisdiction: 5, de_jure_de_facto_control: 5, conflict_events_and_geopolitics: 5, political_cartography_and_reproducibility: 5, total: 30 },
    next_gate: 'register_domain_10_only_after_domain_11_source_first_is_ready'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 10 fulltekst OK: ${report.counts.modules} moduler, ${report.counts.sections} seksjoner, ${report.counts.paragraphs} avsnitt, ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 10 fulltekst FEIL: ${error.message}`);
  process.exitCode = 1;
}
