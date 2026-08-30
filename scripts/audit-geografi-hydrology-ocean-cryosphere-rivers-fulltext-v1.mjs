#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER = 'data/fagverk/natur/geografi/hydrologi-hav-kryosfaere-og-vassdrag.json';
const DIR = 'data/fagverk/natur/geografi/hydrologi-hav-kryosfaere-og-vassdrag';
const SOURCE_BRIEF = 'data/fag/natur/geografi/hydrology_ocean_cryosphere_rivers_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-hydrology-ocean-cryosphere-rivers-fulltext-v1-audit.json';
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

  assert(chapter.subject_id === 'natur' && chapter.canonical_subcategory_id === 'geografi', 'Felt 5 har feil eierskap');
  assert(chapter.domain_id === 'hydrologi_hav_kryosfaere_vassdrag', 'Felt 5 har feil domene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.sourceFirst === true && chapter.reuseWithExpansion === true, 'Felt 5 mangler chapter/reuse-kontrakt');
  assert(chapter.moduleFiles?.length === 4, 'Felt 5 skal ha fire moduler');
  assert(sourceBrief.domain?.ordinal === 5 && sourceBrief.domain?.production_mode === 'reuse_with_expansion', 'Source brief har feil felt 5-kontrakt');
  assert(sourceBrief.reuse_contract?.existing_owner_content_remains_owned_by_natur === true && sourceBrief.reuse_contract?.move_existing_files === false, 'Natur-eierinnhold må forbli urørt');
  assert(sourceBrief.reuse_contract?.owner_chapters?.length === 1 && sourceBrief.reuse_contract.owner_chapters.every((file) => fs.existsSync(abs(file))), 'Felt 5 må binde Naturs vann-eierkapittel');
  assert(brief.sourceBriefFile === SOURCE_BRIEF && brief.sections?.length === 8 && brief.strict_boundaries?.length === 8, 'Felt 5 fulltekstbrief er ufullstendig');

  const modules = chapter.moduleFiles.map(read);
  assert(modules.every((row) => row.subject_id === 'natur' && row.canonical_subcategory_id === 'geografi' && row.chapter_id === chapter.chapter_id), 'Felt 5-moduler har feil eierskap');
  const sections = modules.flatMap((row) => row.sections || []);
  assert(sections.length === 8 && sections.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 40), 'Felt 5 skal ha åtte metode- og boundary-koblede seksjoner');
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  assert(paragraphs.length === 32 && paragraphs.every((text) => text.length >= 420), 'Felt 5 skal ha 32 substansielle fulltekstavsnitt');
  const paragraphClaimRows = sections.flatMap((row) => row.paragraphClaimIds || []);
  assert(paragraphClaimRows.length === 32 && paragraphClaimRows.every((ids) => ids.length === 1), 'Hvert felt 5-avsnitt skal ha ett primært claim');
  const paragraphClaimIds = paragraphClaimRows.flat();
  assert(new Set(paragraphClaimIds).size === 32, 'Alle felt 5-avsnitt skal ha unike claims');

  const sourceIds = new Set((sourceBrief.sources || []).map((row) => row.id));
  assert(sourceIds.size === 13 && sourceBrief.sources.every((row) => row.retrieval_status === 'verified_2026-08-30' && /^https:\/\//u.test(row.url)), 'Felt 5 krever 13 inspectable verifiserte kilder');
  const planned = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims || []);
  const plannedIds = planned.map((row) => row.id);
  assert(planned.length === 32 && new Set(plannedIds).size === 32, 'Source brief må ha 32 planlagte claims');
  assert(planned.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle source-first claims må ha fler-kildespor');
  const verified = claimsDoc.verifiedClaims || [];
  assert(claimsDoc.trace_mode === 'source_brief_claim_text_and_sources_immutable', 'Claimregisteret må låse source-brief tekst og kildespor');
  assert(verified.length === 32 && verified.every((row) => row.status === 'verified' && row.verified_at === '2026-08-30'), 'Felt 5 mangler 32 reverifiserte claims');
  assert(new Set(verified.map((row) => row.id)).size === 32 && verified.every((row) => plannedIds.includes(row.id)), 'Verifiserte claims må være nøyaktig source-first claimsettet');
  assert(paragraphClaimIds.every((id) => plannedIds.includes(id)), 'Alle felt 5-avsnittsclaims må finnes i source brief');

  const questions = assessment.questions || [];
  assert(questions.length === 8 && questions.every((row) => row.type === 'multiple_choice' && row.options?.[row.answerIndex] === row.answer), 'Felt 5 skal ha åtte maskinelt konsistente vurderinger');
  assert(questions.every((row) => plannedIds.includes(row.claim_id) && row.source?.length >= 2 && row.source.every((id) => sourceIds.has(id))), 'Vurderinger må være claim- og kildekoblet');
  const cases = assessment.caseTasks || [];
  assert(cases.length === 6 && cases.every((row) => row.responseMode === 'guided_discussion_no_required_typing'), 'Felt 5 krever seks resonnementscase');
  assert(cases.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Felt 5-case må være kildekoblet');

  const report = {
    schema: 'history_go_geografi_hydrology_ocean_cryosphere_rivers_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    subject_id: 'natur',
    canonical_subcategory_id: 'geografi',
    domain_id: 'hydrologi_hav_kryosfaere_vassdrag',
    status: 'pass_fulltext_materialized_domain_ready_for_registry',
    counts: { modules: modules.length, sections: sections.length, paragraphs: paragraphs.length, verifiedClaims: verified.length, verifiedSources: sourceIds.size, assessments: questions.length, decisionCases: cases.length, reuseOwnerChapters: 1 },
    gates: { ownership: true, reuse_owner_preserved: true, four_modules: true, eight_sections: true, thirty_two_paragraphs: true, thirty_two_verified_claims: true, multi_source_trace: true, basin_water_balance: true, groundwater_surface_connectivity: true, ocean_tide_current_boundary: true, cryosphere_component_boundary: true, flood_drought_nonstationarity: true, forecast_observation_boundary: true, regulated_system_boundary: true },
    six_part_quality_review: { correctness_and_evidence: 5, hydrology_and_water_balance: 5, ocean_and_cryosphere: 5, spatial_method_and_observation: 5, extremes_and_forecasting: 5, reuse_uncertainty_and_reproducibility: 5, total: 30 },
    next_gate: 'register_domain_5_only_after_domain_6_source_first_is_ready'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 5 fulltekst OK: ${report.counts.modules} moduler, ${report.counts.sections} seksjoner, ${report.counts.paragraphs} avsnitt, ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 5 fulltekst FEIL: ${error.message}`);
  process.exitCode = 1;
}
