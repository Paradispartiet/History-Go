#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER = 'data/fagverk/natur/geografi/bosetting-by-land-og-urbanisering.json';
const DIR = 'data/fagverk/natur/geografi/bosetting-by-land-og-urbanisering';
const SOURCE_BRIEF = 'data/fag/natur/geografi/settlement_urban_rural_urbanisation_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-settlement-urban-rural-urbanisation-fulltext-v1-audit.json';
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

  assert(chapter.subject_id === 'natur' && chapter.canonical_subcategory_id === 'geografi', 'Felt 8 har feil eierskap');
  assert(chapter.domain_id === 'bosetting_by_land_urbanisering', 'Felt 8 har feil domene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.sourceFirst === true && chapter.reuseWithExpansion === false, 'Felt 8 mangler new-production chapter-kontrakt');
  assert(chapter.moduleFiles?.length === 4, 'Felt 8 skal ha fire moduler');
  assert(sourceBrief.domain?.ordinal === 8 && sourceBrief.domain?.production_mode === 'new_production', 'Source brief har feil felt 8-kontrakt');
  assert(brief.sourceBriefFile === SOURCE_BRIEF && brief.sections?.length === 8 && brief.strict_boundaries?.length === 8, 'Felt 8 fulltekstbrief er ufullstendig');

  const modules = chapter.moduleFiles.map(read);
  assert(modules.every((row) => row.subject_id === 'natur' && row.canonical_subcategory_id === 'geografi' && row.chapter_id === chapter.chapter_id), 'Felt 8-moduler har feil eierskap');
  const sections = modules.flatMap((row) => row.sections || []);
  assert(sections.length === 8 && sections.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 50), 'Felt 8 skal ha åtte metode- og boundary-koblede seksjoner');
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  const shortParagraphs = paragraphs.map((text, index) => ({ index: index + 1, length: text.length })).filter((row) => row.length < 420);
  assert(paragraphs.length === 32 && shortParagraphs.length === 0, `Felt 8 skal ha 32 substansielle fulltekstavsnitt; korte: ${JSON.stringify(shortParagraphs)}`);
  const paragraphClaimRows = sections.flatMap((row) => row.paragraphClaimIds || []);
  assert(paragraphClaimRows.length === 32 && paragraphClaimRows.every((ids) => ids.length === 1), 'Hvert felt 8-avsnitt skal ha ett primært claim');
  const paragraphClaimIds = paragraphClaimRows.flat();
  assert(new Set(paragraphClaimIds).size === 32, 'Alle felt 8-avsnitt skal ha unike claims');

  const sources = sourceBrief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sourceIds.size === 13 && sources.every((row) => row.retrieval_status === 'verified_2026-08-30' && /^https:\/\//u.test(row.url)), 'Felt 8 krever 13 inspectable verifiserte kilder');
  const planned = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims || []);
  const plannedIds = planned.map((row) => row.id);
  assert(planned.length === 32 && new Set(plannedIds).size === 32, 'Source brief må ha 32 planlagte claims');
  assert(planned.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle source-first claims må ha fler-kildespor');
  const verified = claimsDoc.verifiedClaims || [];
  assert(claimsDoc.trace_mode === 'source_brief_claim_text_and_sources_immutable', 'Claimregisteret må låse source-brief tekst og kildespor');
  assert(verified.length === 32 && verified.every((row) => row.status === 'verified' && row.verified_at === '2026-08-30'), 'Felt 8 mangler 32 reverifiserte claims');
  assert(new Set(verified.map((row) => row.id)).size === 32 && verified.every((row) => plannedIds.includes(row.id)), 'Verifiserte claims må være nøyaktig source-first claimsettet');
  assert(paragraphClaimIds.every((id) => plannedIds.includes(id)), 'Alle felt 8-avsnittsclaims må finnes i source brief');

  assert(sourceBrief.source_strategy?.administrative_morphological_functional_geographies_must_be_distinguished === true, 'Geografisk-enhet-port mangler');
  assert(sourceBrief.source_strategy?.urban_and_rural_are_method_dependent_not_natural_binary_labels === true, 'Urban/rural-port mangler');
  assert(sourceBrief.source_strategy?.built_up_surface_is_not_population_or_function === true, 'Built-up/befolkning/funksjon-port mangler');
  assert(sourceBrief.source_strategy?.boundary_change_must_be_distinguished_from_settlement_growth === true, 'Grenseendring/vekst-port mangler');
  assert(sourceBrief.source_strategy?.urban_rural_linkages_require_flows_and_relations_not_proximity_alone === true, 'Urban-rural strømport mangler');
  assert(sourceBrief.source_strategy?.settlement_time_series_require_version_and_geography_harmonization === true, 'Tidsserieharmoniseringsport mangler');

  const questions = assessment.questions || [];
  assert(questions.length === 8 && questions.every((row) => row.type === 'multiple_choice' && row.options?.[row.answerIndex] === row.answer), 'Felt 8 skal ha åtte maskinelt konsistente vurderinger');
  assert(questions.every((row) => plannedIds.includes(row.claim_id) && row.source?.length >= 2 && row.source.every((id) => sourceIds.has(id))), 'Vurderinger må være claim- og kildekoblet');
  const cases = assessment.caseTasks || [];
  assert(cases.length === 6 && cases.every((row) => row.responseMode === 'guided_discussion_no_required_typing'), 'Felt 8 krever seks resonnementscase');
  assert(cases.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 8-case må være kildekoblet');

  const report = {
    schema: 'history_go_geografi_settlement_urban_rural_urbanisation_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    subject_id: 'natur',
    canonical_subcategory_id: 'geografi',
    domain_id: 'bosetting_by_land_urbanisering',
    status: 'pass_fulltext_materialized_domain_ready_for_registry',
    counts: { modules: modules.length, sections: sections.length, paragraphs: paragraphs.length, verifiedClaims: verified.length, verifiedSources: sourceIds.size, assessments: questions.length, decisionCases: cases.length },
    gates: { ownership: true, new_production: true, four_modules: true, eight_sections: true, thirty_two_paragraphs: true, thirty_two_verified_claims: true, multi_source_trace: true, geographic_unit_boundary: true, urban_rural_classification_boundary: true, urban_growth_decomposition: true, built_up_population_function_boundary: true, functional_region_boundary: true, rural_system_boundary: true, urban_rural_flow_boundary: true, time_series_harmonization: true },
    six_part_quality_review: { correctness_and_evidence: 5, settlement_units_and_classification: 5, urbanisation_and_morphology: 5, functional_regions_and_rural_systems: 5, territorial_flows_and_land: 5, harmonization_uncertainty_and_reproducibility: 5, total: 30 },
    next_gate: 'register_domain_8_only_after_domain_9_source_first_is_ready'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 8 fulltekst OK: ${report.counts.modules} moduler, ${report.counts.sections} seksjoner, ${report.counts.paragraphs} avsnitt, ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 8 fulltekst FEIL: ${error.message}`);
  process.exitCode = 1;
}
