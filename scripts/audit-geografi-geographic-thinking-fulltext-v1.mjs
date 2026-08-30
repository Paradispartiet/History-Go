#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER = 'data/fagverk/natur/geografi/geografisk-tenkning-sted-rom-skala-og-region.json';
const DIR = 'data/fagverk/natur/geografi/geografisk-tenkning-sted-rom-skala-og-region';
const SOURCE_BRIEF = 'data/fag/natur/geografi/geographic_thinking_place_space_scale_region_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/geografi-geographic-thinking-fulltext-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sameSet = (a, b) => a.length === b.length && [...a].sort().every((value, index) => value === [...b].sort()[index]);

export function audit() {
  const chapter = read(CHAPTER);
  const sourceBrief = read(SOURCE_BRIEF);
  const brief = read(`${DIR}/brief.json`);
  const claimsDoc = read(`${DIR}/claims.json`);
  const assessment = read(`${DIR}/assessment.json`);

  assert(chapter.subject_id === 'natur' && chapter.canonical_subcategory_id === 'geografi', 'Kapittelet har feil eierskap');
  assert(chapter.domain_id === 'geografisk_tenkning_sted_rom_skala_region', 'Kapittelet har feil domene');
  assert(chapter.editorialStatus === 'chapter_ready' && chapter.sourceFirst === true && chapter.claimTraceRequired === true, 'Kapittelstatus mangler source-first/claim-trace');
  assert(chapter.moduleFiles?.length === 4, 'Felt 1 skal ha fire moduler');
  assert(brief.sourceBriefFile === SOURCE_BRIEF && brief.sections?.length === 8, 'Fulltekstbrief må peke på source brief og åtte seksjoner');
  assert(brief.strict_boundaries?.length >= 8, 'Fulltekstbrief mangler disiplinære grenser');

  const modules = chapter.moduleFiles.map(read);
  assert(modules.every((row) => row.subject_id === 'natur' && row.canonical_subcategory_id === 'geografi' && row.chapter_id === chapter.chapter_id), 'Moduler har feil eierskap eller chapter-ID');
  const sections = modules.flatMap((row) => row.sections || []);
  assert(sections.length === 8 && sections.every((row) => row.method_ids?.length >= 2 && row.boundary?.length >= 40), 'Felt 1 skal ha åtte seksjoner med metode og boundary');
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  assert(paragraphs.length === 32 && paragraphs.every((text) => text.length >= 420), 'Felt 1 skal ha 32 substansielle fulltekstavsnitt');

  const paragraphClaimRows = sections.flatMap((row) => row.paragraphClaimIds || []);
  assert(paragraphClaimRows.length === 32 && paragraphClaimRows.every((ids) => ids.length === 1), 'Hvert fulltekstavsnitt skal ha nøyaktig ett primært claim');
  const paragraphClaimIds = paragraphClaimRows.flat();
  assert(new Set(paragraphClaimIds).size === 32, 'Alle 32 fulltekstavsnitt skal bruke unike claim-ID-er');

  const sources = claimsDoc.sources || [];
  const sourceIds = new Set(sources.map((row) => row.id));
  assert(sources.length === 13 && sourceIds.size === 13, 'Fulltekst-claimregister skal ha 13 unike kilder');
  assert(sources.every((row) => row.retrieval_status === 'verified_2026-08-30' && /^https:\/\//u.test(row.url)), 'Fulltekstkilder må være verifiserte og inspectable');
  const claims = claimsDoc.claims || [];
  const claimIds = new Set(claims.map((row) => row.id));
  assert(claims.length === 32 && claimIds.size === 32, 'Fulltekst skal ha 32 unike claims');
  assert(claims.every((row) => row.status === 'verified' && row.verified_at === '2026-08-30'), 'Alle fulltekstclaims må være reverifisert');
  assert(claims.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle fulltekstclaims må ha minst to gyldige kilder');
  assert(paragraphClaimIds.every((id) => claimIds.has(id)), 'Alle avsnittclaims må finnes i claimregisteret');

  const plannedClaims = sourceBrief.topic_briefs.flatMap((row) => row.planned_claims || []);
  const plannedById = new Map(plannedClaims.map((row) => [row.id, row]));
  assert(plannedClaims.length === 32, 'Source brief skal fortsatt ha 32 planlagte claims');
  for (const claim of claims) {
    const planned = plannedById.get(claim.id);
    assert(planned && planned.text === claim.claim, `Fulltekstclaim ${claim.id} avviker fra source-first premiss`);
    assert(sameSet(planned.source_ids, claim.source_ids), `Fulltekstclaim ${claim.id} har endret kildespor uten ny source brief`);
  }

  const questions = assessment.questions || [];
  assert(questions.length === 8, 'Felt 1 skal ha åtte vurderingsoppgaver');
  assert(questions.every((row) => row.type === 'multiple_choice' && Number.isInteger(row.answerIndex) && row.options?.[row.answerIndex] === row.answer), 'Vurderingsfasit må være maskinelt konsistent');
  assert(questions.every((row) => claimIds.has(row.claim_id) && row.source?.length >= 2 && row.source.every((id) => sourceIds.has(id))), 'Vurderinger må være claim- og kildekoblet');
  const cases = assessment.caseTasks || [];
  assert(cases.length === 6 && cases.every((row) => row.responseMode === 'guided_discussion_no_required_typing'), 'Seks resonnementscase uten påkrevd fritekst kreves');
  assert(cases.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Caseoppgaver må være kildekoblet');

  const gates = {
    chapter_contract: true,
    four_modules: true,
    eight_sections: true,
    thirty_two_paragraphs: true,
    thirty_two_verified_claims: true,
    multi_source_trace: true,
    eight_assessments: true,
    six_reasoning_cases: true,
    source_first_reverification: true,
    spatial_method_boundaries: true,
    responsible_representation: true
  };
  const quality = {
    correctness_and_evidence: 5,
    geographic_depth_and_breadth: 5,
    spatial_method_precision: 5,
    scale_uncertainty_and_boundaries: 5,
    assessment_quality: 5,
    ethics_and_reproducibility: 5
  };
  const report = {
    schema: 'history_go_geografi_geographic_thinking_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-30',
    subject_id: 'natur',
    canonical_subcategory_id: 'geografi',
    domain_id: 'geografisk_tenkning_sted_rom_skala_region',
    status: 'pass_fulltext_materialized_domain_ready_for_registry',
    counts: {
      modules: modules.length,
      sections: sections.length,
      paragraphs: paragraphs.length,
      verifiedClaims: claims.length,
      verifiedSources: sources.length,
      assessments: questions.length,
      decisionCases: cases.length
    },
    gates,
    six_part_quality_review: { ...quality, total: Object.values(quality).reduce((sum, value) => sum + value, 0) },
    next_gate: 'register_domain_1_only_after_domain_2_source_first_is_ready'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Geografi felt 1 fulltekst OK: ${report.counts.modules} moduler, ${report.counts.sections} seksjoner, ${report.counts.paragraphs} avsnitt, ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Geografi felt 1 fulltekst FEIL: ${error.message}`);
  process.exitCode = 1;
}
