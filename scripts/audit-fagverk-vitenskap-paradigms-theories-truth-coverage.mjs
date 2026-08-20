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
  module: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/09-paradigmer-teorier-sannhet.json',
  brief: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/09-paradigmer-teorier-sannhet-brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-fra-observasjon-til-etterprovbar-kunnskap/claims.json',
  registry: 'data/fagverk/fagverk_registry.json',
  qualityReview: 'data/fag/vitenskap/vitenskap_holistic_quality_review_v1.json',
  report: 'reports/fagverk/vitenskap-paradigms-theories-truth-coverage-audit.json'
});
const EMNES = [
  'em_vit_doxa_maling','em_vit_faglig_konflikt','em_vit_forklaring_arsak','em_vit_ikke_malbare_fenomener','em_vit_kausalitet',
  'em_vit_kunnskapens_grenser','em_vit_kunnskapssosiologi','em_vit_objektivitet','em_vit_paradigmeskifte','em_vit_perspektiv_blindsoner',
  'em_vit_sannhetsproduksjon','em_vit_teori_modell','em_vit_vitenskapelige_revolusjoner','em_vit_vitenskapsfilosofi','em_vit_sannhet_maling_modeller'
];
const RECOMMENDED = Object.freeze({
  em_vit_doxa_maling:['met_vit_doxaanalyse','met_vit_metodekritisk_analyse'],
  em_vit_faglig_konflikt:['met_vit_konsensusanalyse','met_vit_konfliktanalyse'],
  em_vit_forklaring_arsak:['met_vit_kausalitetsanalyse','met_vit_forklaringsanalyse'],
  em_vit_ikke_malbare_fenomener:['met_vit_blindsoneanalyse','met_vit_kritisk_epistemologisk_analyse'],
  em_vit_kausalitet:['met_vit_kausalitetsanalyse','met_vit_forklaringsanalyse'],
  em_vit_kunnskapens_grenser:['met_vit_vitenskapsfilosofisk_analyse','met_vit_epistemologisk_analyse'],
  em_vit_kunnskapssosiologi:['met_vit_sannhetsproduksjonsanalyse','met_vit_kunnskapssosiologisk_analyse'],
  em_vit_objektivitet:['met_vit_objektivitetsanalyse','met_vit_standpunktanalyse'],
  em_vit_paradigmeskifte:['met_vit_paradigmeanalyse','met_vit_vitenskapshistorisk_analyse'],
  em_vit_perspektiv_blindsoner:['met_vit_objektivitetsanalyse','met_vit_standpunktanalyse'],
  em_vit_sannhetsproduksjon:['met_vit_sannhetsproduksjonsanalyse','met_vit_kunnskapssosiologisk_analyse'],
  em_vit_teori_modell:['met_vit_teorianalyse','met_vit_modellanalyse'],
  em_vit_vitenskapelige_revolusjoner:['met_vit_paradigmeanalyse','met_vit_vitenskapshistorisk_analyse'],
  em_vit_vitenskapsfilosofi:['met_vit_vitenskapsfilosofisk_analyse','met_vit_epistemologisk_analyse'],
  em_vit_sannhet_maling_modeller:['met_vit_evidensanalyse','met_vit_modellanalyse']
});
const NEW_CLAIMS = Array.from({ length: 15 }, (_, i) => `vit1-${86 + i}`);
const NEW_SOURCES = Array.from({ length: 9 }, (_, i) => `vit1-${49 + i}-${[
  'sep-models-science','sep-scientific-explanation','sep-causation-manipulability','sep-scientific-objectivity','sep-theory-observation','sep-thomas-kuhn','sep-scientific-revolutions','sep-social-dimensions','sep-scientific-progress'
][i]}`);
const EXPECTED_USAGE = Object.freeze({
  'vit1-86':['vit1-paradigme-1'],'vit1-87':['vit1-paradigme-1'],
  'vit1-88':['vit1-paradigme-2'],'vit1-89':['vit1-paradigme-2'],
  'vit1-90':['vit1-paradigme-3'],'vit1-91':['vit1-paradigme-3'],
  'vit1-92':['vit1-paradigme-4'],'vit1-93':['vit1-paradigme-4'],
  'vit1-94':['vit1-paradigme-5'],'vit1-95':['vit1-paradigme-5'],
  'vit1-96':['vit1-paradigme-6'],'vit1-97':['vit1-paradigme-6'],
  'vit1-98':['vit1-paradigme-7'],'vit1-99':['vit1-paradigme-7'],
  'vit1-100':['vit1-paradigme-8']
});
const abs = (rel) => path.join(ROOT, rel);
const read = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();
const sameSet = (a,b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && new Set(a).size === a.length && isDeepStrictEqual(sorted(a),sorted(b));
const flatStrings = (value) => Array.isArray(value) ? value.flat(Infinity).filter((x) => typeof x === 'string') : [];

export function auditVitenskapParadigmsTheoriesTruthCoverage({ writeReport = false, checkReport = true } = {}) {
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

  assert(readiness.complete_ready === false || readiness.status === 'university_breadth_complete', 'Batch 6 coverage-PR kan ikke gjøre Vitenskap complete');
  assert(readiness.status === (readiness.complete_ready ? 'university_breadth_complete' : 'breadth_chapters_materialized_final_audit_pending'), 'Batch 6 må bevare final-audit-pending status');
  assert(['final_holistic_university_breadth_completion_audit', 'maintenance_source_refresh_and_place_case_expansion'].includes(readiness.next_gate), 'Batch 6 må bevare holistic next gate');
  assert(!fs.existsSync(abs(P.qualityReview)) || JSON.parse(fs.readFileSync(abs(P.qualityReview), 'utf8')).subject_id === 'vitenskap', 'Quality review må enten mangle i coverage-fasen eller være canonical Vitenskap-review i senere fase');
  assert(module.schema === 'history_go_fagverk_editorial_coverage_supplement_v1', 'Batch 6-modul har feil schema');
  assert(module.domain_id === 'paradigmer_teorier_sannhet' && module.chapter_id === chapter.chapter_id, 'Batch 6-modul har feil domene/eier');
  assert(brief.schema === 'history_go_fagverk_editorial_coverage_supplement_brief_v1', 'Batch 6-brief har feil schema');
  assert(sameSet(brief.requiredEmneIds, EMNES), 'Batch 6-brief har feil canonical emnesett');
  assert(brief.qualityContract?.holisticOwnedCountAfterMaterialization === 117 && brief.qualityContract?.holisticUncoveredCountAfterMaterialization === 0, 'Batch 6-brief må låse 117/0');
  assert(brief.qualityContract?.postMaterializationQualityReviewStatus === 'missing_required_review', 'Batch 6 må eksplisitt vente på quality review');

  for (const id of EMNES) {
    assert(canonicalIds.has(id), `${id} mangler i canonical inventory`);
    const primary = mappingById.get(id)?.mappings?.find((row) => row.mapping_tier === 'primary');
    assert(primary?.fagkart_kategori === 'paradigmer_teorier_sannhet', `${id} er ikke primary-mapped til paradigmer_teorier_sannhet`);
    assert(sameSet(primary?.recommended_method_ids || [], RECOMMENDED[id]), `${id} har endret primary recommended methods`);
    assert(RECOMMENDED[id].every((methodId) => brief.requiredMethodIds?.includes(methodId)), `${id} mangler recommended method i brief`);
  }

  const treatments = module.coverageTreatments || [];
  const sections = module.sections || [];
  const paragraphs = sections.flatMap((row) => row.paragraphs || []);
  assert(treatments.length === 15 && sameSet(treatments.map((row) => row.emne_id), EMNES), 'Batch 6 må ha én eksplisitt treatment per emne');
  assert(treatments.every((row) => typeof row.focus === 'string' && row.focus.length >= 100), 'Batch 6-treatment mangler substansielt fokus');
  assert(sections.length === 8 && new Set(sections.map((row) => row.id)).size === 8, 'Batch 6 skal ha åtte unike seksjoner');
  assert(sameSet(sections.flatMap((row) => row.emne_ids || []), EMNES), 'Batch 6-seksjonenes emne-eierskap er feil');
  const sectionById = new Map(sections.map((row) => [row.id,row]));
  for (const treatment of treatments) assert(sectionById.get(treatment.section_id)?.emne_ids?.includes(treatment.emne_id), `${treatment.emne_id} mangler i angitt treatment section`);
  assert(paragraphs.length === 24 && paragraphs.every((text) => typeof text === 'string' && text.length >= 300), 'Batch 6 skal ha 24 substansielle fagavsnitt');
  assert(new Set(paragraphs).size === paragraphs.length, 'Batch 6 har identiske duplikatavsnitt');
  assert(sections.every((row) => row.methodLimits?.length >= 2), 'Hver batch 6-seksjon må lære minst to metodebegrensninger');
  assert(sections.every((row) => row.paragraphClaimIds?.length === row.paragraphs?.length), 'Hvert batch 6-avsnitt må ha claim-spor');

  const guard = module.qualityGuard || {};
  for (const key of ['philosophyNeighborBoundaryPreserved','noTheoryEqualsGuessShortcut','noModelEqualsLiteralTruthShortcut','noTheoryLadennessEqualsArbitrarinessShortcut','noObjectivityEqualsViewFromNowhereShortcut','noDisagreementEqualsParadigmCrisisShortcut','noSociologyEqualsTruthRelativismShortcut','noUnmeasurableEqualsUnscientificShortcut','qualityReviewMustRemainMissingUntilCoverageCloses','doesNotClaimSubjectComplete']) assert(guard[key] === true, `Batch 6 quality guard mangler ${key}`);

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
    assert(EXPECTED_USAGE[id].every((sectionId) => reciprocal.has(sectionId)), `${id} mangler reciprocal used_in`);
  }
  for (const [sectionId,refs] of refsBySection) assert([...refs].every((id) => claimById.has(id)), `${sectionId} peker til ukjent claim`);

  assert(module.workedExamples?.length === 2 && module.workedExamples.every((row) => row.analysis?.length >= 5), 'Batch 6 skal ha to substansielle worked examples');
  assert(module.applicationTasks?.length === 3 && module.applicationTasks.every((row) => row.prompts?.length >= 4), 'Batch 6 skal ha tre anvendelsesoppgaver');
  assert(module.misconceptions?.length === 5 && module.misconceptions.every((row) => row.claim && row.correction), 'Batch 6 skal ha fem misoppfatninger');
  assert(module.selfCheck?.length === 6 && module.selfCheck.every((row) => row.question && row.answer), 'Batch 6 skal ha seks self-checks');

  assert(chapter.moduleFiles?.includes(P.module), 'Unit 1 root mangler batch 6 moduleFile');
  assert(EMNES.every((id) => chapter.emne_ids?.includes(id)), 'Unit 1 root eier ikke hele batch 6');
  const meta = chapter.editorialCoverageSupplements?.find((row) => row.id === 'paradigmer_teorier_sannhet');
  assert(meta?.moduleFile === P.module && meta?.briefFile === P.brief && sameSet(meta.emne_ids,EMNES), 'Unit 1 root mangler batch 6 supplementmetadata');
  assert(meta?.explicitFulltextTreatment === true && meta?.claimTraceRequired === true, 'Unit 1 root mangler fulltext/claim flags for batch 6');
  assert(typeof meta?.boundary === 'string' && /Filosofi/.test(meta.boundary), 'Batch 6 må ha eksplisitt Filosofi-grense i rootmetadata');
  assert(registryChapter && sameSet(registryChapter.emne_ids,chapter.emne_ids), 'Registry/root emne-sett mismatch etter batch 6');
  const registryMeta = registryChapter.editorialCoverageSupplements?.find((row) => row.id === 'paradigmer_teorier_sannhet');
  assert(registryMeta?.explicitFulltextTreatment === true && sameSet(registryMeta.emne_ids,EMNES), 'Registry mangler batch 6 fulltext metadata');

  const holistic = auditVitenskapHolisticUniversityBreadthCompletion({ writeReport:false, checkReport:false });
  assert(['blocked','eligible_for_completion','complete_and_holistically_audited'].includes(holistic.status), 'Coverage-PR skal være blokkert bare fram til separat quality review');
  assert(holistic.canonicalInventory.explicitChapterOwnedEmneCount === 117, 'Holistic owned-count skal være 117 etter batch 6');
  assert(holistic.canonicalInventory.explicitUncoveredEmneCount === 0, 'Holistic uncovered-count skal være 0 etter batch 6');
  assert(!holistic.blockers.some((row) => row.id === 'canonical_emne_full_editorial_treatment_gap'), 'Coverage blocker skal være borte etter batch 6');
  assert(['missing_required_review','pass'].includes(holistic.qualityReview.status) && holistic.qualityReview.passes === (holistic.qualityReview.status === 'pass'), 'Quality review må være missing i coverage-fasen eller pass i separat reviewfase');
  assert(holistic.qualityReview.status === 'pass' ? !holistic.blockers.some((row) => row.id === 'full_subject_quality_review_missing') : holistic.blockers.some((row) => row.id === 'full_subject_quality_review_missing'), 'Quality-review blocker må følge reviewfasen');
  assert(holistic.gates?.eligibleForCompletion === (holistic.qualityReview.status === 'pass'), 'Eligibility må følge eksplisitt quality-review pass');
  assert(holistic.evidence.allClaimsResolve === true, 'Holistic claim/source gate må være grønn');
  assert(holistic.evidence.methodsWithLimitsChapterCount === holistic.evidence.chapterCount, 'Alle Vitenskap-kapitler må lære metodebegrensninger');
  assert(holistic.originality.exactDuplicateParagraphCount === 0 && holistic.originality.maxCrossChapterFiveGramJaccard < holistic.originality.threshold, 'Batch 6 må bevare editorial originalitet');
  const philosophyBoundary = holistic.neighborBoundaries?.find((row) => row.subject_id === 'filosofi');
  assert(philosophyBoundary?.relationship === 'neighbor_bridge_required' && /Filosofi/.test(philosophyBoundary.rule || ''), 'Holistic Filosofi-grense må forbli eksplisitt');

  const report = {
    schema:'history_go_fagverk_vitenskap_paradigms_theories_truth_coverage_audit_v1',
    version:'1.0.0', status:'pass', subject:'vitenskap', domain:'paradigmer_teorier_sannhet',
    coverage:{ explicitTreatmentCount:15, sectionCount:8, paragraphCount:24, newClaimCount:15, newInspectableSourceCount:9, holisticOwnedAfterBatch:117, holisticUncoveredAfterBatch:0 },
    transition:{ completeReady:false, holisticStatus:'blocked', qualityReviewStatus:'missing_required_review', nextRequiredAction:'separate_explicit_six_dimension_holistic_quality_review' },
    guards:{ allClaimsResolve:holistic.evidence.allClaimsResolve, fillerClean:holistic.evidence.fillerClean, exactDuplicateParagraphCount:holistic.originality.exactDuplicateParagraphCount, philosophyBoundaryPreserved:true, qualityReviewNotPreScored:true, subjectCompletionNotFlipped:true }
  };
  const serialized = `${JSON.stringify(report,null,2)}\n`;
  if (writeReport) { fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true}); fs.writeFileSync(abs(P.report),serialized); }
  if (checkReport && fs.existsSync(abs(P.report))) assert(fs.readFileSync(abs(P.report),'utf8') === serialized,'Batch 6 audit-report er stale');
  return report;
}

const args = new Set(process.argv.slice(2));
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(auditVitenskapParadigmsTheoriesTruthCoverage({ writeReport:args.has('--write-report'), checkReport:!args.has('--no-check-report') }),null,2));
