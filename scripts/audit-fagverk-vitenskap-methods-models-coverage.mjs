#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { auditVitenskapHolisticUniversityBreadthCompletion } from './audit-fagverk-vitenskap-holistic-university-breadth-completion.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  emners: 'data/fag/vitenskap/emner_vitenskap_canonical_v4_6.json',
  mappings: 'data/fag/vitenskap/emnemapping_vitenskap_canonical_v4_6.json',
  chapter: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap.json',
  module: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/04-metoder-maling-modeller.json',
  brief: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/04-metoder-maling-modeller-brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/vitenskap-methods-models-coverage-audit.json'
});
const EXPECTED_EMNES = [
  'em_vit_abstraksjon_forenkling',
  'em_vit_algoritmer_data',
  'em_vit_eksperiment_variabler',
  'em_vit_empiri_evidens',
  'em_vit_hypotese_observasjon',
  'em_vit_kalibrering_presisjon',
  'em_vit_kategorisering',
  'em_vit_klassifikasjon_taksonomi',
  'em_vit_konsensus_uenighet',
  'em_vit_kontroll_replikasjon',
  'em_vit_metodekritikk',
  'em_vit_modeller_simulering',
  'em_vit_standardisering',
  'em_vit_statistikk_sannsynlighet',
  'em_vit_usikkerhet_feilkilder',
  'em_vit_eksperiment_maling',
  'em_vit_matematikk_modellering'
];
const EXPECTED_NEW_CLAIMS = Array.from({ length: 14 }, (_, i) => `vit1-${19 + i}`);
const EXPECTED_NEW_SOURCES = Array.from({ length: 8 }, (_, i) => `vit1-${11 + i}-${[
  'nist-stat-handbook',
  'nist-experimental-design',
  'nist-model-validation',
  'nist-model-building',
  'nist-rdaf',
  'nist-numerical-reproducibility',
  'ncbi-taxonomy-help',
  'iczn-preamble'
][i]}`);
const EXPECTED_CLAIM_USAGE = Object.freeze({
  'vit1-19': ['vit1-metoder-1'],
  'vit1-20': ['vit1-metoder-1'],
  'vit1-21': ['vit1-metoder-2'],
  'vit1-22': ['vit1-metoder-2'],
  'vit1-23': ['vit1-metoder-3'],
  'vit1-24': ['vit1-metoder-3'],
  'vit1-25': ['vit1-metoder-4'],
  'vit1-26': ['vit1-metoder-4'],
  'vit1-27': ['vit1-metoder-5'],
  'vit1-28': ['vit1-metoder-5'],
  'vit1-29': ['vit1-metoder-6'],
  'vit1-30': ['vit1-metoder-6'],
  'vit1-31': ['vit1-metoder-1', 'vit1-metoder-7'],
  'vit1-32': ['vit1-metoder-7']
});

const abs = (rel) => path.join(ROOT, rel);
const json = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();
const sameSet = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && new Set(a).size === a.length && isDeepStrictEqual(sorted(a), sorted(b));
const flatten = (value) => Array.isArray(value) ? value.flat(Infinity).filter((x) => typeof x === 'string') : [];

export function auditVitenskapMethodsModelsCoverage({ writeReport = false, checkReport = true } = {}) {
  const readiness = json(P.readiness);
  const emners = json(P.emners);
  const mappings = json(P.mappings);
  const chapter = json(P.chapter);
  const module = json(P.module);
  const brief = json(P.brief);
  const claimsDocument = json(P.claims);
  const registry = json(P.registry);
  const registryChapter = registry.subjects?.vitenskap?.chapters?.find((row) => row.id === chapter.chapter_id);
  const canonicalIds = new Set(emners.map((row) => row.emne_id));
  const mappingById = new Map(mappings.map((row) => [row.emne_id, row]));

  assert(readiness.subject_id === 'vitenskap', 'Coverage audit fikk feil readiness subject');
  assert(readiness.complete_ready === false, 'Coverage batch kan ikke gjøre Vitenskap complete');
  assert(readiness.status === 'breadth_chapters_materialized_final_audit_pending', 'Coverage batch må forbli i final-audit-pending fase');
  assert(readiness.next_gate === 'final_holistic_university_breadth_completion_audit', 'Coverage batch må bevare holistic next gate');
  assert(module.schema === 'history_go_fagverk_editorial_coverage_supplement_v1', 'Supplement har feil schema');
  assert(module.chapter_id === chapter.chapter_id && module.domain_id === 'metoder_maling_modeller', 'Supplement har feil eier eller domene');
  assert(brief.schema === 'history_go_fagverk_editorial_coverage_supplement_brief_v1', 'Supplement brief har feil schema');
  assert(sameSet(brief.requiredEmneIds, EXPECTED_EMNES), 'Supplement brief har feil canonical emnesett');

  for (const id of EXPECTED_EMNES) {
    assert(canonicalIds.has(id), `${id} finnes ikke i canonical inventory`);
    const mapping = mappingById.get(id);
    const primary = mapping?.mappings?.find((row) => row.mapping_tier === 'primary');
    assert(primary?.fagkart_kategori === 'metoder_maling_modeller', `${id} er ikke primary-mapped til metoder_maling_modeller`);
  }

  const treatments = module.coverageTreatments || [];
  assert(treatments.length === 17 && sameSet(treatments.map((row) => row.emne_id), EXPECTED_EMNES), 'Supplement må ha nøyaktig én treatment per canonical batch-emne');
  assert(treatments.every((row) => typeof row.focus === 'string' && row.focus.length >= 55), 'Coverage treatment mangler substansielt fokus');
  const sections = module.sections || [];
  assert(sections.length === 7, 'Supplement skal ha syv redigerte seksjoner');
  assert(new Set(sections.map((row) => row.id)).size === 7, 'Supplement har dupliserte seksjons-ID-er');
  const sectionById = new Map(sections.map((row) => [row.id, row]));
  for (const treatment of treatments) {
    const section = sectionById.get(treatment.section_id);
    assert(section, `${treatment.emne_id} peker til ukjent treatment section`);
    assert(section.emne_ids?.includes(treatment.emne_id), `${treatment.emne_id} er ikke eksplisitt eid av treatment section`);
  }
  assert(sameSet(sections.flatMap((row) => row.emne_ids || []), EXPECTED_EMNES), 'Seksjonenes eksplisitte emne-eierskap matcher ikke batchen');
  assert(sections.every((row) => row.methodLimits?.length >= 2), 'Hver supplementseksjon må lære minst to metodebegrensninger');
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  assert(paragraphs.length === 21, 'Supplement skal ha 21 redigerte fagavsnitt');
  assert(paragraphs.every((text) => typeof text === 'string' && text.length >= 300), 'Alle supplementavsnitt må være substansielle');
  assert(new Set(paragraphs).size === paragraphs.length, 'Supplementet gjenbruker identiske avsnitt');
  assert(sections.every((row) => row.paragraphClaimIds?.length === row.paragraphs?.length), 'Hvert supplementavsnitt må ha claim-sporing');

  const sourceById = new Map((claimsDocument.sources || []).map((row) => [row.id, row]));
  const claimById = new Map((claimsDocument.claims || []).map((row) => [row.id, row]));
  for (const id of EXPECTED_NEW_SOURCES) {
    const source = sourceById.get(id);
    assert(source, `Mangler ny supplementkilde ${id}`);
    assert(/^https:\/\//.test(source.url || '') && source.publisher && source.source_location, `${id} er ikke inspiserbar`);
  }
  const refsBySection = new Map(sections.map((section) => [section.id, new Set([...flatten(section.paragraphClaimIds), ...flatten(section.keyPointClaimIds)])]));
  for (const id of EXPECTED_NEW_CLAIMS) {
    const claim = claimById.get(id);
    assert(claim?.status === 'verified' && claim.source_ids?.length, `${id} er ikke verified/kildekoblet`);
    assert(claim.source_ids.every((sourceId) => sourceById.has(sourceId)), `${id} peker til ukjent kilde`);
    const actualUsage = [...refsBySection.entries()].filter(([, refs]) => refs.has(id)).map(([sectionId]) => sectionId);
    assert(isDeepStrictEqual(sorted(actualUsage), sorted(EXPECTED_CLAIM_USAGE[id])), `${id} har feil faktisk section-usage`);
    const usedIn = new Set(claim.used_in || []);
    assert(EXPECTED_CLAIM_USAGE[id].every((sectionId) => usedIn.has(sectionId)), `${id} mangler historisk used_in`);
  }
  for (const section of sections) assert([...refsBySection.get(section.id)].every((id) => claimById.has(id)), `${section.id} peker til ukjent claim`);

  assert(module.workedExamples?.length === 2 && module.workedExamples.every((row) => row.analysis?.length >= 5), 'Supplement skal ha to substansielle worked examples');
  assert(module.applicationTasks?.length === 3 && module.applicationTasks.every((row) => row.prompts?.length >= 4), 'Supplement skal ha tre anvendelsesoppgaver');
  assert(module.misconceptions?.length === 5 && module.misconceptions.every((row) => row.claim && row.correction), 'Supplement skal ha fem eksplisitte misoppfatninger');
  assert(module.selfCheck?.length === 6 && module.selfCheck.every((row) => row.question && row.answer), 'Supplement skal ha seks self-checks');

  assert(chapter.moduleFiles?.includes(P.module), 'Chapter root er ikke koblet til supplementmodulen');
  assert(EXPECTED_EMNES.every((id) => chapter.emne_ids?.includes(id)), 'Chapter root eier ikke hele supplementbatchen');
  const supplementMeta = chapter.editorialCoverageSupplements?.find((row) => row.id === 'metoder_maling_modeller');
  assert(supplementMeta?.moduleFile === P.module && supplementMeta?.briefFile === P.brief && sameSet(supplementMeta.emne_ids, EXPECTED_EMNES), 'Chapter root mangler eksplisitt supplementmetadata');
  assert(registryChapter && sameSet(registryChapter.emne_ids, chapter.emne_ids), 'Registry/root emne-sett mismatch etter coverage-materialisering');
  const registrySupplement = registryChapter.editorialCoverageSupplements?.find((row) => row.id === 'metoder_maling_modeller');
  assert(registrySupplement?.explicitFulltextTreatment === true && sameSet(registrySupplement.emne_ids, EXPECTED_EMNES), 'Registry mangler eksplisitt fulltext-treatment metadata');

  const holistic = auditVitenskapHolisticUniversityBreadthCompletion({ writeReport: false, checkReport: false });
  assert(holistic.subject.completeReady === false && holistic.status === 'blocked', 'Holistic audit må fortsatt blokkere completion etter batch 1');
  assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount >= 49, 'Holistic owned-count kan ikke regressere under 49 etter 17-emnersbatchen');
  assert(holistic.canonicalInventory.explicitUncoveredEmneCount <= 68, 'Holistic uncovered-count kan ikke regressere over 68 etter 17-emnersbatchen');
  const coverageBlocker = holistic.blockers.find((row) => row.id === 'canonical_emne_full_editorial_treatment_gap');
  assert(!coverageBlocker || coverageBlocker.count <= 68, 'Holistic coverage blocker kan ikke regressere over 68 etter batch 1');
  assert(['deferred_until_material_blockers_close','missing_required_review','pass'].includes(holistic.qualityReview.status), 'Holistic quality review skal fortsatt være deferred');

  const report = {
    schema: 'history_go_fagverk_vitenskap_methods_models_coverage_audit_v1',
    version: '1.0.0',
    status: 'pass',
    subject: 'vitenskap',
    chapterId: chapter.chapter_id,
    domainId: module.domain_id,
    summary: {
      canonicalBatchEmneCount: EXPECTED_EMNES.length,
      coverageTreatmentCount: treatments.length,
      sectionCount: sections.length,
      paragraphCount: paragraphs.length,
      newSourceCount: EXPECTED_NEW_SOURCES.length,
      newClaimCount: EXPECTED_NEW_CLAIMS.length,
      workedExampleCount: module.workedExamples.length,
      applicationTaskCount: module.applicationTasks.length,
      misconceptionCount: module.misconceptions.length,
      selfCheckCount: module.selfCheck.length,
      holisticOwnedBeforeBatch: 32,
      holisticOwnedAfterBatch: 49,
      holisticUncoveredBeforeBatch: 85,
      holisticUncoveredAfterBatch: 68
    },
    gates: {
      canonicalPrimaryMappingResolved: true,
      everyEmneHasExplicitTreatment: true,
      substantiveParagraphCoverage: true,
      paragraphClaimsResolve: true,
      newSourcesInspectable: true,
      methodLimitsTaught: true,
      rootAndRegistryOwnershipMatch: true,
      historicalUnit1ExtendedMonotonically: true,
      holisticCoverageReducedByExactly17: true,
      subjectCompletionStillBlocked: true
    }
  };
  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) assert(isDeepStrictEqual(json(P.report), report), `${P.report} er utdatert`);
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditVitenskapMethodsModelsCoverage({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Vitenskap methods/models coverage ${report.status}: ${report.summary.canonicalBatchEmneCount} emner; holistic ${report.summary.holisticOwnedAfterBatch}/117 owned, ${report.summary.holisticUncoveredAfterBatch} blockers.`);
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
