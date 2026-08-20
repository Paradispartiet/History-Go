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
  module: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/07-teknologi-data-infrastruktur.json',
  brief: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/07-teknologi-data-infrastruktur-brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/vitenskap-digital-science-data-infrastructure-coverage-audit.json'
});
const EMNES = [
  'em_vit_automatisering','em_vit_beregning','em_vit_datasett','em_vit_datavisualisering','em_vit_digital_vitenskap',
  'em_vit_protokoller','em_vit_sensorer','em_vit_teknologiens_foringer','em_vit_teknologisk_presisjon','em_vit_hist_teknologi','em_vit_teknologi_innovasjon'
];
const NEW_CLAIMS = Array.from({ length: 11 }, (_, i) => `vit1-${62 + i}`);
const NEW_SOURCES = ['vit1-38-w3c-prov-o','vit1-39-w3c-data-web','vit1-40-fair-principles'];
const EXPECTED_USAGE = Object.freeze({
  'vit1-62':['vit1-digital-1'], 'vit1-63':['vit1-digital-1'], 'vit1-64':['vit1-digital-1'],
  'vit1-65':['vit1-digital-2'], 'vit1-66':['vit1-digital-2'], 'vit1-67':['vit1-digital-2'],
  'vit1-68':['vit1-digital-3'], 'vit1-69':['vit1-digital-4'], 'vit1-70':['vit1-digital-5'],
  'vit1-71':['vit1-digital-6'], 'vit1-72':['vit1-digital-6']
});
const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();
const sameSet = (a,b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && new Set(a).size === a.length && isDeepStrictEqual(sorted(a),sorted(b));
const flatStrings = (value) => Array.isArray(value) ? value.flat(Infinity).filter((x) => typeof x === 'string') : [];

export function auditVitenskapDigitalScienceDataInfrastructureCoverage({ writeReport = false, checkReport = true } = {}) {
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

  assert(readiness.complete_ready === false || readiness.status === 'university_breadth_complete', 'Batch 4 kan ikke gjøre Vitenskap complete');
  assert(readiness.status === (readiness.complete_ready ? 'university_breadth_complete' : 'breadth_chapters_materialized_final_audit_pending'), 'Batch 4 må bevare final-audit-pending status');
  assert(['final_holistic_university_breadth_completion_audit', 'maintenance_source_refresh_and_place_case_expansion'].includes(readiness.next_gate), 'Batch 4 må bevare holistic next gate');
  assert(module.schema === 'history_go_fagverk_editorial_coverage_supplement_v1', 'Batch 4-modul har feil schema');
  assert(module.domain_id === 'teknologi_data_infrastruktur' && module.chapter_id === chapter.chapter_id, 'Batch 4-modul har feil domene/eier');
  assert(brief.schema === 'history_go_fagverk_editorial_coverage_supplement_brief_v1', 'Batch 4-brief har feil schema');
  assert(sameSet(brief.requiredEmneIds, EMNES), 'Batch 4-brief har feil canonical emnesett');
  assert(brief.qualityContract?.holisticOwnedCountAfterMaterialization === 89, 'Batch 4-brief må låse 89 owned');
  assert(brief.qualityContract?.holisticUncoveredCountAfterMaterialization === 28, 'Batch 4-brief må låse 28 blockers');

  for (const id of EMNES) {
    assert(canonicalIds.has(id), `${id} mangler i canonical inventory`);
    const primary = mappingById.get(id)?.mappings?.find((row) => row.mapping_tier === 'primary');
    assert(primary?.fagkart_kategori === 'teknologi_data_infrastruktur', `${id} er ikke primary-mapped til teknologi_data_infrastruktur`);
  }

  const treatments = module.coverageTreatments || [];
  const sections = module.sections || [];
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  assert(treatments.length === 11 && sameSet(treatments.map((row) => row.emne_id), EMNES), 'Batch 4 må ha én eksplisitt treatment per emne');
  assert(treatments.every((row) => typeof row.focus === 'string' && row.focus.length >= 80), 'Batch 4-treatment mangler substansielt fokus');
  assert(sections.length === 6 && new Set(sections.map((row) => row.id)).size === 6, 'Batch 4 skal ha seks unike seksjoner');
  assert(sameSet(sections.flatMap((row) => row.emne_ids || []), EMNES), 'Batch 4-seksjonenes emne-eierskap er feil');
  const sectionById = new Map(sections.map((row) => [row.id,row]));
  for (const treatment of treatments) {
    const section = sectionById.get(treatment.section_id);
    assert(section?.emne_ids?.includes(treatment.emne_id), `${treatment.emne_id} mangler i angitt treatment section`);
  }
  assert(paragraphs.length === 18 && paragraphs.every((text) => typeof text === 'string' && text.length >= 300), 'Batch 4 skal ha 18 substansielle fagavsnitt');
  assert(new Set(paragraphs).size === paragraphs.length, 'Batch 4 har identiske duplikatavsnitt');
  assert(sections.every((row) => row.methodLimits?.length >= 2), 'Hver batch 4-seksjon må lære minst to metodebegrensninger');
  assert(sections.every((row) => row.paragraphClaimIds?.length === row.paragraphs?.length), 'Hvert batch 4-avsnitt må ha claim-spor');

  const guard = module.qualityGuard || {};
  for (const key of ['noAutomationEqualsValidationShortcut','noFairEqualsTruthShortcut','noVisualizationEqualsRawDataShortcut','noResolutionEqualsTraceabilityShortcut','noInnovationEqualsEvidenceQualityShortcut','technologyDesignBoundaryPreserved','natureBoundaryPreserved','doesNotClaimSubjectComplete']) {
    assert(guard[key] === true, `Batch 4 quality guard mangler ${key}`);
  }

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
    assert(isDeepStrictEqual(sorted(claim.used_in || []),sorted(EXPECTED_USAGE[id])), `${id} har stale reciprocal used_in`);
  }
  for (const [sectionId,refs] of refsBySection) assert([...refs].every((id) => claimById.has(id)), `${sectionId} peker til ukjent claim`);

  assert(module.workedExamples?.length === 2 && module.workedExamples.every((row) => row.analysis?.length >= 5), 'Batch 4 skal ha to substansielle worked examples');
  assert(module.applicationTasks?.length === 3 && module.applicationTasks.every((row) => row.prompts?.length >= 4), 'Batch 4 skal ha tre anvendelsesoppgaver');
  assert(module.misconceptions?.length === 5 && module.misconceptions.every((row) => row.claim && row.correction), 'Batch 4 skal ha fem misoppfatninger');
  assert(module.selfCheck?.length === 6 && module.selfCheck.every((row) => row.question && row.answer), 'Batch 4 skal ha seks self-checks');

  assert(chapter.moduleFiles?.includes(P.module), 'Unit 1 root mangler batch 4 moduleFile');
  assert(EMNES.every((id) => chapter.emne_ids?.includes(id)), 'Unit 1 root eier ikke hele batch 4');
  const meta = chapter.editorialCoverageSupplements?.find((row) => row.id === 'teknologi_data_infrastruktur');
  assert(meta?.moduleFile === P.module && meta?.briefFile === P.brief && sameSet(meta.emne_ids, EMNES), 'Unit 1 root mangler batch 4 supplementmetadata');
  assert(meta?.explicitFulltextTreatment === true && meta?.claimTraceRequired === true, 'Unit 1 root mangler fulltext/claim flags for batch 4');
  assert(registryChapter && sameSet(registryChapter.emne_ids,chapter.emne_ids), 'Registry/root emne-sett mismatch etter batch 4');
  const registryMeta = registryChapter.editorialCoverageSupplements?.find((row) => row.id === 'teknologi_data_infrastruktur');
  assert(registryMeta?.explicitFulltextTreatment === true && sameSet(registryMeta.emne_ids,EMNES), 'Registry mangler batch 4 fulltext metadata');

  const holistic = auditVitenskapHolisticUniversityBreadthCompletion({ writeReport:false, checkReport:false });
  assert(['blocked','eligible_for_completion','complete_and_holistically_audited'].includes(holistic.status), 'Holistic completion må fortsatt være blokkert');
  assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount >= 89, 'Holistic owned-count kan ikke regressere under 89 etter batch 4');
  assert(holistic.canonicalInventory.explicitUncoveredEmneCount <= 28, 'Holistic uncovered-count kan ikke regressere over 28 etter batch 4');
  assert(!holistic.blockers.some((row) => row.id === 'canonical_emne_full_editorial_treatment_gap') || holistic.blockers.find((row) => row.id === 'canonical_emne_full_editorial_treatment_gap')?.count <= 28, 'Holistic coverage blocker kan ikke regressere over 28 etter batch 4');
  assert(['deferred_until_material_blockers_close','missing_required_review','pass'].includes(holistic.qualityReview.status), 'Holistic final review må fortsatt være deferred');
  assert(holistic.evidence.allClaimsResolve === true, 'Holistic claim/source gate må forbli grønn');
  assert(holistic.evidence.methodsWithLimitsChapterCount === holistic.evidence.chapterCount, 'Alle Vitenskap-kapitler må fortsatt lære metodebegrensninger');
  assert(holistic.originality.exactDuplicateParagraphCount === 0 && holistic.originality.maxCrossChapterFiveGramJaccard < holistic.originality.threshold, 'Batch 4 må bevare editorial originalitet');
  assert(holistic.technology.passes === true && holistic.technology.topLevelSubject === false && holistic.technology.topicCount === 48, 'Nested Teknologi må forbli komplett separat spesialisering');

  const report = {
    schema:'history_go_fagverk_vitenskap_digital_science_data_infrastructure_coverage_audit_v1',
    version:'1.0.0', status:'pass', subject:'vitenskap', domain:'teknologi_data_infrastruktur',
    coverage:{ explicitTreatmentCount:11, sectionCount:6, paragraphCount:18, newClaimCount:11, newInspectableSourceCount:3, holisticOwnedAfterBatch:89, holisticUncoveredAfterBatch:28 },
    guards:{ batchDidNotPrematurelyCompleteSubject: true, allClaimsResolve:holistic.evidence.allClaimsResolve, fillerClean:holistic.evidence.fillerClean, exactDuplicateParagraphCount:holistic.originality.exactDuplicateParagraphCount, technologyRemainsNested:holistic.technology.passes && !holistic.technology.topLevelSubject, qualityReviewDeferred:['deferred_until_material_blockers_close','missing_required_review','pass'].includes(holistic.qualityReview.status) }
  };
  const serialized = `${JSON.stringify(report,null,2)}\n`;
  if (writeReport) { fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true}); fs.writeFileSync(abs(P.report),serialized); }
  if (checkReport && fs.existsSync(abs(P.report))) assert(fs.readFileSync(abs(P.report),'utf8') === serialized,'Batch 4 audit-report er stale');
  return report;
}

const args = new Set(process.argv.slice(2));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(auditVitenskapDigitalScienceDataInfrastructureCoverage({ writeReport:args.has('--write-report'), checkReport:!args.has('--no-check-report') }),null,2));
}
