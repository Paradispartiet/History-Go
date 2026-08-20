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
  module: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/08-natur-medisin-miljo.json',
  brief: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/08-natur-medisin-miljo-brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/vitenskap-natural-science-medicine-environment-coverage-audit.json'
});

const EMNES = [
  'em_vit_biologi_klassifikasjon','em_vit_epidemiologi','em_vit_feltarbeid','em_vit_geologi_tid','em_vit_klima_maling',
  'em_vit_miljokunnskap_politikk','em_vit_miljoovervaking','em_vit_okologi_system','em_vit_prover_materialer','em_vit_systemtenkning',
  'em_vit_feltarbeid_observasjon','em_vit_medisin_helse','em_vit_miljo_okologi_system'
];
const NEW_CLAIMS = Array.from({ length: 13 }, (_, i) => `vit1-${73 + i}`);
const NEW_SOURCES = [
  'vit1-41-cdc-principles-epi','vit1-42-cdc-field-epi','vit1-43-usgs-geologic-time','vit1-44-wmo-imop',
  'vit1-45-wmo-gcos','vit1-46-epa-field-sampling','vit1-47-gbif-occurrence-quality','vit1-48-epa-ecological-risk'
];
const EXPECTED_USAGE = Object.freeze({
  'vit1-73':['vit1-natur-1'],
  'vit1-74':['vit1-natur-2'], 'vit1-75':['vit1-natur-2'],
  'vit1-76':['vit1-natur-3'], 'vit1-77':['vit1-natur-3'], 'vit1-78':['vit1-natur-3'],
  'vit1-79':['vit1-natur-4'],
  'vit1-80':['vit1-natur-5'], 'vit1-81':['vit1-natur-5'],
  'vit1-82':['vit1-natur-6'], 'vit1-83':['vit1-natur-6'], 'vit1-84':['vit1-natur-6'],
  'vit1-85':['vit1-natur-7']
});

const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();
const sameSet = (a,b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && new Set(a).size === a.length && isDeepStrictEqual(sorted(a),sorted(b));
const flatStrings = (value) => Array.isArray(value) ? value.flat(Infinity).filter((x) => typeof x === 'string') : [];

export function auditVitenskapNaturalScienceMedicineEnvironmentCoverage({ writeReport = false, checkReport = true } = {}) {
  const readiness = read(P.readiness);
  const emners = read(P.emners);
  const mappings = read(P.mappings);
  const chapter = read(P.chapter);
  const module = read(P.module);
  const brief = read(P.brief);
  const claimsDoc = read(P.claims);
  const registry = read(P.registry);
  const registryChapter = registry.subjects?.vitenskap?.chapters?.find((row) => row.id === chapter.chapter_id);
  const canonicalIds = new Set(emners.map((row) => row.emne_id));
  const mappingById = new Map(mappings.map((row) => [row.emne_id,row]));

  assert(readiness.complete_ready === false || readiness.status === 'university_breadth_complete', 'Batch 5 kan ikke gjøre Vitenskap complete');
  assert(readiness.status === (readiness.complete_ready ? 'university_breadth_complete' : 'breadth_chapters_materialized_final_audit_pending'), 'Batch 5 må bevare final-audit-pending status');
  assert(['final_holistic_university_breadth_completion_audit', 'maintenance_source_refresh_and_place_case_expansion'].includes(readiness.next_gate), 'Batch 5 må bevare holistic next gate');
  assert(module.schema === 'history_go_fagverk_editorial_coverage_supplement_v1', 'Batch 5-modul har feil schema');
  assert(module.domain_id === 'natur_medisin_miljo' && module.chapter_id === chapter.chapter_id, 'Batch 5-modul har feil domene/eier');
  assert(brief.schema === 'history_go_fagverk_editorial_coverage_supplement_brief_v1', 'Batch 5-brief har feil schema');
  assert(sameSet(brief.requiredEmneIds, EMNES), 'Batch 5-brief har feil canonical emnesett');
  assert(brief.qualityContract?.holisticOwnedCountAfterMaterialization === 102, 'Batch 5-brief må låse 102 owned');
  assert(brief.qualityContract?.holisticUncoveredCountAfterMaterialization === 15, 'Batch 5-brief må låse 15 blockers');
  assert(brief.neighborBoundaries?.length >= 4 && brief.rejectedShortcuts?.length >= 8, 'Batch 5-brief mangler substansielle faggrenser/anti-shortcuts');

  for (const id of EMNES) {
    assert(canonicalIds.has(id), `${id} mangler i canonical inventory`);
    const primary = mappingById.get(id)?.mappings?.find((row) => row.mapping_tier === 'primary');
    assert(primary?.fagkart_kategori === 'natur_medisin_miljo', `${id} er ikke primary-mapped til natur_medisin_miljo`);
    assert((primary?.recommended_method_ids || []).every((methodId) => brief.requiredMethodIds?.includes(methodId)), `${id} mangler anbefalt metode i batch 5-brief`);
  }

  const treatments = module.coverageTreatments || [];
  const sections = module.sections || [];
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  assert(treatments.length === 13 && sameSet(treatments.map((row) => row.emne_id), EMNES), 'Batch 5 må ha én eksplisitt treatment per emne');
  assert(treatments.every((row) => typeof row.focus === 'string' && row.focus.length >= 90), 'Batch 5-treatment mangler substansielt fokus');
  assert(sections.length === 7 && new Set(sections.map((row) => row.id)).size === 7, 'Batch 5 skal ha syv unike seksjoner');
  assert(sameSet(sections.flatMap((row) => row.emne_ids || []), EMNES), 'Batch 5-seksjonenes emne-eierskap er feil');
  const sectionById = new Map(sections.map((row) => [row.id,row]));
  for (const treatment of treatments) {
    const section = sectionById.get(treatment.section_id);
    assert(section?.emne_ids?.includes(treatment.emne_id), `${treatment.emne_id} mangler i angitt treatment section`);
  }
  assert(paragraphs.length === 21 && paragraphs.every((text) => typeof text === 'string' && text.length >= 300), 'Batch 5 skal ha 21 substansielle fagavsnitt');
  assert(new Set(paragraphs).size === paragraphs.length, 'Batch 5 har identiske duplikatavsnitt');
  assert(sections.every((row) => row.methodLimits?.length >= 2), 'Hver batch 5-seksjon må lære minst to metodebegrensninger');
  assert(sections.every((row) => row.paragraphClaimIds?.length === row.paragraphs?.length), 'Hvert batch 5-avsnitt må ha claim-spor');

  const sourceById = new Map((claimsDoc.sources || []).map((row) => [row.id,row]));
  const claimById = new Map((claimsDoc.claims || []).map((row) => [row.id,row]));
  for (const id of NEW_SOURCES) {
    const source = sourceById.get(id);
    assert(source && /^https:\/\//.test(source.url || '') && source.publisher && source.source_location, `${id} er ikke inspiserbar`);
  }
  const refsBySection = new Map(sections.map((section) => [section.id,new Set([...flatStrings(section.paragraphClaimIds),...flatStrings(section.keyPointClaimIds)])]));
  for (const id of NEW_CLAIMS) {
    const claim = claimById.get(id);
    assert(claim?.status === 'verified' && claim.source_ids?.length, `${id} er ikke verified/kildekoblet`);
    assert(claim.source_ids.every((sourceId) => sourceById.has(sourceId)), `${id} peker til ukjent source_id`);
    const actualUsage = [...refsBySection.entries()].filter(([,refs]) => refs.has(id)).map(([sectionId]) => sectionId);
    assert(isDeepStrictEqual(sorted(actualUsage),sorted(EXPECTED_USAGE[id])), `${id} har feil faktisk section-usage`);
    const reciprocal = new Set(claim.used_in || []);
    assert(EXPECTED_USAGE[id].every((sectionId) => reciprocal.has(sectionId)), `${id} mangler reciprocal used_in for batch 5`);
  }
  for (const [sectionId,refs] of refsBySection) assert([...refs].every((id) => claimById.has(id)), `${sectionId} peker til ukjent claim`);

  assert(module.workedExamples?.length === 2 && module.workedExamples.every((row) => row.analysis?.length >= 5), 'Batch 5 skal ha to substansielle worked examples');
  assert(module.applicationTasks?.length === 3 && module.applicationTasks.every((row) => row.prompts?.length >= 4), 'Batch 5 skal ha tre anvendelsesoppgaver');
  assert(module.misconceptions?.length === 5 && module.misconceptions.every((row) => row.claim && row.correction), 'Batch 5 skal ha fem misoppfatninger');
  assert(module.selfCheck?.length === 6 && module.selfCheck.every((row) => row.question && row.answer), 'Batch 5 skal ha seks self-checks');

  assert(chapter.moduleFiles?.includes(P.module), 'Unit 1 root mangler batch 5 moduleFile');
  assert(EMNES.every((id) => chapter.emne_ids?.includes(id)), 'Unit 1 root eier ikke hele batch 5');
  const meta = chapter.editorialCoverageSupplements?.find((row) => row.id === 'natur_medisin_miljo');
  assert(meta?.moduleFile === P.module && meta?.briefFile === P.brief && sameSet(meta.emne_ids, EMNES), 'Unit 1 root mangler batch 5 supplementmetadata');
  assert(meta?.explicitFulltextTreatment === true && meta?.claimTraceRequired === true, 'Unit 1 root mangler fulltext/claim flags for batch 5');
  assert(typeof meta?.boundary === 'string' && /Natur/.test(meta.boundary), 'Batch 5 må ha eksplisitt Natur-grense i rootmetadata');
  assert(registryChapter && sameSet(registryChapter.emne_ids,chapter.emne_ids), 'Registry/root emne-sett mismatch etter batch 5');
  const registryMeta = registryChapter.editorialCoverageSupplements?.find((row) => row.id === 'natur_medisin_miljo');
  assert(registryMeta?.explicitFulltextTreatment === true && sameSet(registryMeta.emne_ids,EMNES), 'Registry mangler batch 5 fulltext metadata');

  const holistic = auditVitenskapHolisticUniversityBreadthCompletion({ writeReport:false, checkReport:false });
  assert(['blocked','eligible_for_completion','complete_and_holistically_audited'].includes(holistic.status), 'Holistic completion må fortsatt være blokkert etter batch 5');
  assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount >= 102, 'Holistic owned-count kan ikke regressere under 102 etter batch 5');
  assert(holistic.canonicalInventory.explicitUncoveredEmneCount <= 15, 'Holistic uncovered-count kan ikke regressere over 15 etter batch 5');
  assert(!holistic.blockers.some((row) => row.id === 'canonical_emne_full_editorial_treatment_gap') || holistic.blockers.find((row) => row.id === 'canonical_emne_full_editorial_treatment_gap')?.count <= 15, 'Holistic coverage blocker kan ikke regressere over 15 etter batch 5');
  assert(['deferred_until_material_blockers_close','missing_required_review','pass'].includes(holistic.qualityReview.status), 'Holistic final review må fortsatt være deferred');
  assert(holistic.evidence.allClaimsResolve === true, 'Holistic claim/source gate må forbli grønn');
  assert(holistic.evidence.methodsWithLimitsChapterCount === holistic.evidence.chapterCount, 'Alle Vitenskap-kapitler må fortsatt lære metodebegrensninger');
  assert(holistic.originality.exactDuplicateParagraphCount === 0 && holistic.originality.maxCrossChapterFiveGramJaccard < holistic.originality.threshold, 'Batch 5 må bevare editorial originalitet');
  assert(holistic.technology.passes === true && holistic.technology.topLevelSubject === false, 'Nested Teknologi må forbli grønn');
  const natureBoundary = holistic.neighborBoundaries?.find((row) => row.subject_id === 'natur');
  assert(natureBoundary?.relationship === 'neighbor_bridge_required' && /Natur/.test(natureBoundary.rule || ''), 'Holistic Natur-grense må forbli eksplisitt');

  const report = {
    schema:'history_go_fagverk_vitenskap_natural_science_medicine_environment_coverage_audit_v1',
    version:'1.0.0', status:'pass', subject:'vitenskap', domain:'natur_medisin_miljo',
    coverage:{ explicitTreatmentCount:13, sectionCount:7, paragraphCount:21, newClaimCount:13, newInspectableSourceCount:8, holisticOwnedAfterBatch:102, holisticUncoveredAfterBatch:15 },
    guards:{ batchDidNotPrematurelyCompleteSubject: true, allClaimsResolve:holistic.evidence.allClaimsResolve, fillerClean:holistic.evidence.fillerClean, exactDuplicateParagraphCount:holistic.originality.exactDuplicateParagraphCount, natureBoundaryPreserved:true, technologyRemainsNested:holistic.technology.passes && !holistic.technology.topLevelSubject, qualityReviewDeferred:['deferred_until_material_blockers_close','missing_required_review','pass'].includes(holistic.qualityReview.status) }
  };
  const serialized = `${JSON.stringify(report,null,2)}\n`;
  if (writeReport) { fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true}); fs.writeFileSync(abs(P.report),serialized); }
  if (checkReport && fs.existsSync(abs(P.report))) assert(fs.readFileSync(abs(P.report),'utf8') === serialized,'Batch 5 audit-report er stale');
  return report;
}

const args = new Set(process.argv.slice(2));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(auditVitenskapNaturalScienceMedicineEnvironmentCoverage({ writeReport:args.has('--write-report'), checkReport:!args.has('--no-check-report') }),null,2));
}
