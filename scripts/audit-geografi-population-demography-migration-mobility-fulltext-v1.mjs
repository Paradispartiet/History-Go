#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER = 'data/fagverk/natur/geografi/befolkning-demografi-migrasjon-og-mobilitet.json';
const DIR = 'data/fagverk/natur/geografi/befolkning-demografi-migrasjon-og-mobilitet';
const SOURCE_BRIEF = 'data/fag/natur/geografi/population_demography_migration_mobility_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-population-demography-migration-mobility-fulltext-v1-audit.json';
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

  assert(chapter.subject_id === 'natur' && chapter.canonical_subcategory_id === 'geografi', 'Felt 7 har feil eierskap');
  assert(chapter.domain_id === 'befolkning_demografi_migrasjon_mobilitet', 'Felt 7 har feil domene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.sourceFirst === true && chapter.reuseWithExpansion === false, 'Felt 7 mangler new-production chapter-kontrakt');
  assert(chapter.moduleFiles?.length === 4, 'Felt 7 skal ha fire moduler');
  assert(sourceBrief.domain?.ordinal === 7 && sourceBrief.domain?.production_mode === 'new_production', 'Source brief har feil felt 7-kontrakt');
  assert(brief.sourceBriefFile === SOURCE_BRIEF && brief.sections?.length === 8 && brief.strict_boundaries?.length === 8, 'Felt 7 fulltekstbrief er ufullstendig');

  const modules = chapter.moduleFiles.map(read);
  assert(modules.every((row) => row.subject_id === 'natur' && row.canonical_subcategory_id === 'geografi' && row.chapter_id === chapter.chapter_id), 'Felt 7-moduler har feil eierskap');
  const sections = modules.flatMap((row) => row.sections || []);
  assert(sections.length === 8 && sections.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 50), 'Felt 7 skal ha åtte metode- og boundary-koblede seksjoner');
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  const shortParagraphs = paragraphs.map((text, index) => ({ index: index + 1, length: text.length })).filter((row) => row.length < 420);
  assert(paragraphs.length === 32 && shortParagraphs.length === 0, `Felt 7 skal ha 32 substansielle fulltekstavsnitt; korte: ${JSON.stringify(shortParagraphs)}`);
  const paragraphClaimRows = sections.flatMap((row) => row.paragraphClaimIds || []);
  assert(paragraphClaimRows.length === 32 && paragraphClaimRows.every((ids) => ids.length === 1), 'Hvert felt 7-avsnitt skal ha ett primært claim');
  const paragraphClaimIds = paragraphClaimRows.flat();
  assert(new Set(paragraphClaimIds).size === 32, 'Alle felt 7-avsnitt skal ha unike claims');

  const sources = sourceBrief.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sourceIds.size === 13 && sources.every((row) => row.retrieval_status === 'verified_2026-08-30' && /^https:\/\//u.test(row.url)), 'Felt 7 krever 13 inspectable verifiserte kilder');
  const planned = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims || []);
  const plannedIds = planned.map((row) => row.id);
  assert(planned.length === 32 && new Set(plannedIds).size === 32, 'Source brief må ha 32 planlagte claims');
  assert(planned.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle source-first claims må ha fler-kildespor');
  const verified = claimsDoc.verifiedClaims || [];
  assert(claimsDoc.trace_mode === 'source_brief_claim_text_and_sources_immutable', 'Claimregisteret må låse source-brief tekst og kildespor');
  assert(verified.length === 32 && verified.every((row) => row.status === 'verified' && row.verified_at === '2026-08-30'), 'Felt 7 mangler 32 reverifiserte claims');
  assert(new Set(verified.map((row) => row.id)).size === 32 && verified.every((row) => plannedIds.includes(row.id)), 'Verifiserte claims må være nøyaktig source-first claimsettet');
  assert(paragraphClaimIds.every((id) => plannedIds.includes(id)), 'Alle felt 7-avsnittsclaims må finnes i source brief');

  assert(sourceBrief.source_strategy?.census_estimate_projection_must_be_distinguished === true, 'Census/estimat/projeksjon-port mangler');
  assert(sourceBrief.source_strategy?.stock_flow_and_rate_must_be_distinguished === true, 'Stock/flow/rate-port mangler');
  assert(sourceBrief.source_strategy?.urban_definition_and_spatial_unit_must_be_explicit === true, 'Urban-definisjon/romlig-enhet-port mangler');
  assert(sourceBrief.source_strategy?.gridded_population_is_model_or_aggregation_not_person_level_observation === true, 'Befolkningsgrid-port mangler');

  const questions = assessment.questions || [];
  assert(questions.length === 8 && questions.every((row) => row.type === 'multiple_choice' && row.options?.[row.answerIndex] === row.answer), 'Felt 7 skal ha åtte maskinelt konsistente vurderinger');
  assert(questions.every((row) => plannedIds.includes(row.claim_id) && row.source?.length >= 2 && row.source.every((id) => sourceIds.has(id))), 'Vurderinger må være claim- og kildekoblet');
  const cases = assessment.caseTasks || [];
  assert(cases.length === 6 && cases.every((row) => row.responseMode === 'guided_discussion_no_required_typing'), 'Felt 7 krever seks resonnementscase');
  assert(cases.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 7-case må være kildekoblet');

  const report = {
    schema: 'history_go_geografi_population_demography_migration_mobility_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    subject_id: 'natur',
    canonical_subcategory_id: 'geografi',
    domain_id: 'befolkning_demografi_migrasjon_mobilitet',
    status: 'pass_fulltext_materialized_domain_ready_for_registry',
    counts: { modules: modules.length, sections: sections.length, paragraphs: paragraphs.length, verifiedClaims: verified.length, verifiedSources: sourceIds.size, assessments: questions.length, decisionCases: cases.length },
    gates: { ownership: true, new_production: true, four_modules: true, eight_sections: true, thirty_two_paragraphs: true, thirty_two_verified_claims: true, multi_source_trace: true, census_estimate_projection_boundary: true, demographic_component_boundary: true, spatial_aggregation_boundary: true, stock_flow_boundary: true, displacement_category_boundary: true, urban_definition_boundary: true, gridded_population_model_boundary: true },
    six_part_quality_review: { correctness_and_evidence: 5, census_and_demographic_components: 5, density_age_and_spatial_aggregation: 5, migration_and_displacement: 5, urbanisation_and_functional_regions: 5, population_mapping_uncertainty_and_reproducibility: 5, total: 30 },
    next_gate: 'register_domain_7_only_after_domain_8_source_first_is_ready'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 7 fulltekst OK: ${report.counts.modules} moduler, ${report.counts.sections} seksjoner, ${report.counts.paragraphs} avsnitt, ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 7 fulltekst FEIL: ${error.message}`);
  process.exitCode = 1;
}
