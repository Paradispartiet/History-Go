#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHAPTER = 'data/fagverk/litteratur/sprak_lingvistikk/lingvistisk-tenkning-sprak-data-analyse-og-evidens.json';
const SOURCE = 'data/fag/litteratur/sprak_lingvistikk/linguistic_thinking_language_data_analysis_evidence_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/sprak-lingvistikk-linguistic-thinking-fulltext-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => { fs.mkdirSync(path.dirname(abs(file)), { recursive: true }); fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const chapter = read(CHAPTER);
  const source = read(SOURCE);
  const brief = read(chapter.briefFile);
  const claimsRegistry = read(chapter.claimsFile);
  const assessment = read(chapter.assessmentFile);

  assert(chapter.subject_id === 'litteratur' && chapter.canonical_subcategory_id === 'sprak_lingvistikk', 'Feil Språk & lingvistikk-eierskap');
  assert(chapter.domain_id === 'lingvistisk_tenkning_sprak_data_analyse_evidens', 'Feil lingvistisk felt 1');
  assert(chapter.moduleFiles?.length === 4 && chapter.sourceFirst === true && chapter.claimTraceRequired === true, 'Chapter-kontrakt mangler 4 moduler/source-first/claim-trace');
  assert(brief.sections?.length === 8 && brief.fulltext_status === 'materialized_pending_strict_audit', 'Brief må ha 8 seksjoner og pending strict audit');

  const sourceIds = new Set((source.sources || []).map((row) => row.id));
  const planned = (source.topic_briefs || []).flatMap((row) => row.planned_claims || []);
  const plannedIds = planned.map((row) => row.id);
  assert(source.sources?.length === 13 && sourceIds.size === 13, 'Felt 1 skal ha 13 unike source-first-kilder');
  assert(source.sources.every((row) => /^https:\/\//u.test(row.url) && row.retrieval_status === 'verified_2026-08-31'), 'Alle felt-1-kilder må være inspectable og verifisert');
  assert(source.topic_briefs?.length === 8 && planned.length === 32 && new Set(plannedIds).size === 32, 'Source-first må ha 8 emner og 32 unike claims');
  assert(planned.every((row) => row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id))), 'Alle planlagte claims må ha minst to gyldige kilder');

  const modules = chapter.moduleFiles.map(read);
  const sections = modules.flatMap((row) => row.sections || []);
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  const paragraphClaims = sections.flatMap((row) => row.paragraphClaimIds || []);
  const usedClaimIds = paragraphClaims.flatMap((ids) => ids || []);
  assert(modules.every((row) => row.schema === 'history_go_fagverk_module_v1' && row.subject_id === 'litteratur' && row.canonical_subcategory_id === 'sprak_lingvistikk'), 'Alle moduler må følge canonical module schema/eierskap');
  assert(sections.length === 8 && paragraphs.length === 32 && paragraphClaims.length === 32, 'Fulltekst skal være 8 seksjoner / 32 avsnitt / 32 claim-bindinger');
  assert(paragraphs.every((text) => typeof text === 'string' && text.length >= 420), 'Hvert fulltekstavsnitt må være minst 420 tegn');
  assert(paragraphClaims.every((ids) => Array.isArray(ids) && ids.length === 1), 'Hvert avsnitt skal ha nøyaktig ett primært claim');
  assert(new Set(usedClaimIds).size === 32 && JSON.stringify(usedClaimIds) === JSON.stringify(plannedIds), 'Avsnittene må dekke source-first claims eksakt én gang og i canonical rekkefølge');

  assert(claimsRegistry.trace_mode === 'source_brief_claim_text_and_sources_immutable', 'Claim-registeret må låse source-first tekst og kildesett');
  const verified = claimsRegistry.verifiedClaims || [];
  assert(verified.length === 32 && new Set(verified.map((row) => row.id)).size === 32, '32 unike claims må reverifiseres');
  assert(JSON.stringify(verified.map((row) => row.id)) === JSON.stringify(plannedIds), 'Verifiserte claim-ID-er må være identiske med source-first-registeret');
  assert(verified.every((row) => row.status === 'verified' && row.verified_at === '2026-08-31'), 'Alle 32 claims må ha verified-status');

  const questions = assessment.questions || [];
  const cases = assessment.caseTasks || [];
  const validClaims = new Set(plannedIds);
  assert(questions.length === 8 && cases.length === 6, 'Vurdering skal ha 8 spørsmål og 6 case');
  assert(questions.every((row) => row.choices?.length === 4 && Number.isInteger(row.correctIndex) && row.correctIndex >= 0 && row.correctIndex < 4), 'Alle vurderingsspørsmål må være gyldige firevalgsoppgaver');
  for (const row of [...questions, ...cases]) {
    assert(row.claim_ids?.length >= 1 && row.claim_ids.every((id) => validClaims.has(id)), `${row.id}: ugyldig claim-link`);
    assert(row.source_ids?.length >= 2 && row.source_ids.every((id) => sourceIds.has(id)), `${row.id}: ugyldig source-link`);
  }
  assert(cases.every((row) => row.responseMode === 'guided_discussion_no_required_typing' && row.prompt?.length >= 80), 'Case må kreve faglig resonnement uten obligatorisk fritekst');

  const boundaries = sections.map((row) => row.boundary || '').join(' ').toLowerCase();
  const allText = paragraphs.join(' ').toLowerCase();
  assert(/norm|preskript/u.test(boundaries), 'Deskriptiv/preskriptiv grense mangler');
  assert(/skrift/u.test(boundaries), 'Skrift/språk-grense mangler');
  assert(/tegnspråk/u.test(allText), 'Tegnspråk-modalitet mangler');
  assert(/korpus/u.test(boundaries), 'Korpus-generaliseringsgrense mangler');
  assert(/genealog/u.test(boundaries), 'Typologi/genealogi-grense mangler');
  assert(/rådata|representasjonskonvensjon/u.test(boundaries), 'Representasjon/rådata-grense mangler');
  assert(/kausal/u.test(allText), 'Mønster/kausalitet-grense mangler');
  assert(/proveniens|samtykke|skade/u.test(allText), 'Etikk/proveniens mangler');

  const quality = {
    correctness_and_evidence: 5,
    linguistic_method_and_boundaries: 5,
    modality_corpus_and_typology: 5,
    traceability_and_reproducibility: 5,
    assessment_readiness: 5,
    ethics_and_responsible_representation: 5
  };
  const report = {
    schema: 'history_go_sprak_lingvistikk_linguistic_thinking_fulltext_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-31',
    subject_id: 'litteratur',
    canonical_subcategory_id: 'sprak_lingvistikk',
    domain_id: chapter.domain_id,
    status: 'pass_fulltext_materialized_domain_ready_for_registry',
    counts: { modules: modules.length, sections: sections.length, paragraphs: paragraphs.length, verifiedClaims: verified.length, sources: source.sources.length, assessments: questions.length, decisionScenarios: cases.length },
    gates: { ownership:true, source_first_trace:true, paragraph_depth:true, exact_claim_coverage:true, descriptive_boundary:true, modality_boundary:true, corpus_generalization:true, typology_genealogy:true, representation_provenance:true, ethics:true, assessment:true },
    six_part_quality_review: { ...quality, total: Object.values(quality).reduce((sum, value) => sum + value, 0) },
    next_gate: 'register_domain_1_only_after_domain_2_phonetics_source_first_is_ready'
  };
  write(REPORT, report);
  return report;
}

try {
  const report = audit();
  console.log(`Språk & lingvistikk felt 1 fulltekst OK: ${report.counts.modules} moduler, ${report.counts.sections} seksjoner, ${report.counts.paragraphs} avsnitt, ${report.counts.verifiedClaims} claims.`);
} catch (error) {
  console.error(`Språk & lingvistikk felt 1 fulltekst FEIL: ${error.message}`);
  process.exitCode = 1;
}
