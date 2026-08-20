#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/vitenskap/vitenskap_university_readiness_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  release: 'data/fagverk/fagverk_release.json',
  chapter: 'data/fagverk/vitenskap/vitenskap-kjemi-fra-atomstruktur-til-materialegenskap.json',
  brief: 'data/fagverk/vitenskap/vitenskap-kjemi-fra-atomstruktur-til-materialegenskap/brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-kjemi-fra-atomstruktur-til-materialegenskap/claims.json'
});
const CHAPTER_ID = 'vitenskap-kjemi-fra-atomstruktur-til-materialegenskap';
const EXPECTED_EMNES = [
  'em_vit_atomstruktur_og_periodesystem','em_vit_kjemiske_bindinger_og_struktur','em_vit_reaksjoner_stokiometri_og_likevekt',
  'em_vit_kjemisk_termodynamikk_og_kinetikk','em_vit_analytisk_kjemi_og_spektroskopi','em_vit_materialkjemi_og_egenskaper'
];
const EXPECTED_METHODS = [
  'met_vit_modellanalyse','met_vit_laboratorieanalyse','met_vit_evidensanalyse','met_vit_materialanalyse',
  'met_vit_maleinstrumentanalyse','met_vit_beregningsanalyse','met_vit_statistisk_analyse','met_vit_kalibreringsanalyse'
];
const EXPECTED_REMAINING_BLOCKERS = ['medicine_biomedicine_public_health'];
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();
const sameSet = (a,b) => Array.isArray(a) && a.length === b.length && new Set(a).size === a.length && a.every((id)=>b.includes(id));
const flatten = (value) => Array.isArray(value) ? value.flat(Infinity).filter((x)=>typeof x === 'string') : [];

export function auditVitenskapChemistryMaterialScienceFulltext() {
  const readiness=json(P.readiness), registry=json(P.registry), release=json(P.release), chapter=json(P.chapter), brief=json(P.brief), claimsDocument=json(P.claims);
  const registrySubject=registry.subjects?.vitenskap, releaseSubject=release.subjects?.vitenskap;
  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Kjemi-kapittelet har feil schema');
  assert(chapter.id===CHAPTER_ID && chapter.chapter_id===CHAPTER_ID, 'Kjemi-kapittelet har feil ID');
  assert(chapter.subject_id==='vitenskap' && chapter.primary_domain_id==='natur_medisin_miljo', 'Kjemi-kapittelet har feil subject/domain');
  assert(chapter.coverage_family_id==='chemistry_material_science', 'Kjemi-kapittelet har feil coverage family');
  assert(chapter.editorialStatus==='chapter_ready' && chapter.claimTraceRequired===true, 'Kjemi-kapittelet er ikke chapter_ready med claim trace');
  assert(sameSet(chapter.emne_ids, EXPECTED_EMNES), 'Kjemi-kapittelet har feil emnesett');
  assert(sameSet(chapter.method_ids, EXPECTED_METHODS), 'Kjemi-kapittelet har feil metodesett');
  assert(chapter.briefFile===P.brief && chapter.claimsFile===P.claims, 'Kjemi-kapittelet peker ikke til canonical brief/claims');
  assert(Array.isArray(chapter.moduleFiles) && chapter.moduleFiles.length===3, 'Kjemi-kapittelet skal ha tre moduler');
  for (const file of [...chapter.moduleFiles,chapter.briefFile,chapter.claimsFile]) assert(fs.existsSync(abs(file)), `Mangler Unit 4-fil ${file}`);
  const guard=chapter.qualityGuard||{};
  for (const key of ['atomicModelVsObservedPropertyExplicit','reactionEquationVsMechanismExplicit','thermodynamicsVsKineticsExplicit','catalysisVsEquilibriumExplicit','sampleSignalCalibrationInferenceChainExplicit','detectionLimitVsAbsenceExplicit','spectralMatchVsIdentificationExplicit','compositionMicrostructurePropertyChainExplicit','materialsVsTechnologyBoundaryExplicit','doesNotClaimSubjectComplete','remainingBreadthEditorialBlockersRequired','technologyRemainsNested']) assert(guard[key]===true, `Kjemi-kapittelet mangler quality guard ${key}`);
  assert(brief.chapter_id===CHAPTER_ID && sameSet(brief.requiredEmneIds,EXPECTED_EMNES) && sameSet(brief.requiredMethodIds,EXPECTED_METHODS), 'Brief og fulltekst er ikke aligned');
  const claims=claimsDocument.claims||[], sources=claimsDocument.sources||[];
  assert(claims.length===20 && sources.length===12, 'Unit 4 må bevare 20 claims og 12 kilder');
  const claimIds=new Set(claims.map((r)=>r.id)), sourceIds=new Set(sources.map((r)=>r.id));
  assert(claimIds.size===20 && sourceIds.size===12, 'Unit 4 har dupliserte claim/source-ID-er');
  assert(claims.every((r)=>r.status==='verified' && r.source_ids?.length && r.source_ids.every((id)=>sourceIds.has(id))), 'Unit 4 har uverifisert eller ukjent kildekoblet claim');
  const modules=chapter.moduleFiles.map(json), sections=modules.flatMap((m)=>m.sections||[]), paragraphs=sections.flatMap((s)=>s.paragraphs||[]);
  assert(sections.length===9 && new Set(sections.map((s)=>s.id)).size===9, 'Unit 4 skal ha 9 unike seksjoner');
  assert(paragraphs.length===27 && paragraphs.every((t)=>typeof t==='string' && t.trim().length>=220), 'Unit 4 skal ha 27 substansielle fagavsnitt');
  assert(new Set(paragraphs).size===27, 'Unit 4 gjenbruker identisk avsnittstekst');
  assert(sections.every((s)=>s.paragraphs?.length===3 && s.paragraphClaimIds?.length===3 && s.keyPoints?.length===2 && s.keyPointClaimIds?.length===2), 'Hver Unit 4-seksjon må ha tre claimsporede avsnitt og to key points');
  const refsBySection=new Map();
  for (const section of sections) {
    const refs=new Set([...flatten(section.paragraphClaimIds),...flatten(section.keyPointClaimIds)]);
    assert([...refs].every((id)=>claimIds.has(id)), `${section.id} peker til ukjent claim`);
    refsBySection.set(section.id,refs);
  }
  const allRefs=new Set([...refsBySection.values()].flatMap((s)=>[...s]));
  assert(claims.every((c)=>allRefs.has(c.id)), 'Unit 4 har orphan claim uten fulltekstbruk');
  for (const claim of claims) {
    const actual=[...refsBySection.entries()].filter(([,refs])=>refs.has(claim.id)).map(([id])=>id);
    assert(isDeepStrictEqual(sorted(actual),sorted(claim.used_in||[])), `${claim.id} har ikke eksakt reciprocal used_in/fulltext-sporing`);
  }
  const worked=modules.flatMap((m)=>m.workedExamples||[]), tasks=modules.flatMap((m)=>m.applicationTasks||[]), self=modules.flatMap((m)=>m.selfCheck||[]), misconceptions=modules.flatMap((m)=>m.misconceptions||[]);
  assert(worked.length===2 && worked.every((r)=>r.analysis?.length>=4 && r.claim_ids?.length>=3), 'Unit 4 skal ha to substansielle worked examples');
  assert(tasks.length===4 && tasks.every((r)=>r.prompts?.length>=4), 'Unit 4 skal ha fire anvendelsesoppgaver');
  assert(self.length===6 && self.every((r)=>r.question&&r.answer), 'Unit 4 skal ha seks self-check-spørsmål');
  assert(misconceptions.length===4 && misconceptions.every((r)=>r.claim&&r.correction), 'Unit 4 skal ha fire misoppfatninger');
  assert(misconceptions.some((r)=>/reaksjonslikning/i.test(r.claim+r.correction) && /mekanisme/i.test(r.claim+r.correction)), 'Unit 4 mangler reaksjonslikning/mekanisme-korreksjon');
  assert(misconceptions.some((r)=>/termodynamisk/i.test(r.claim+r.correction) && /langsom|rask/i.test(r.claim+r.correction)), 'Unit 4 mangler termodynamikk/kinetikk-korreksjon');
  assert(misconceptions.some((r)=>/katalysator/i.test(r.claim+r.correction) && /likevekt/i.test(r.claim+r.correction)), 'Unit 4 mangler katalyse/likevekt-korreksjon');
  assert(misconceptions.some((r)=>/detekter/i.test(r.claim+r.correction) && /fravær|null/i.test(r.claim+r.correction)), 'Unit 4 mangler deteksjonsgrense/fravær-korreksjon');
  assert(readiness.complete_ready===false||readiness.status==='university_breadth_complete', 'Unit 4 kan ikke gjøre Vitenskap complete-ready');
  assert(readiness.current_inventory?.vitenskap?.registered_chapter_count>=4, 'Readiness må bevare minst fire Vitenskap-kapitler');
  const laterBlockers=readiness.editorial_blockers||[]; assert((laterBlockers.length===1&&isDeepStrictEqual(sorted(laterBlockers),sorted(EXPECTED_REMAINING_BLOCKERS)))||laterBlockers.length===0, 'Unit 4 predecessor har uventet senere blocker-state');
  const chemistry=readiness.coverage_families?.find((r)=>r.id==='chemistry_material_science');
  assert(chemistry?.status==='chapter_materialized' && chemistry?.materialized_chapter_id===CHAPTER_ID, 'Kjemifamilien er ikke chapter_materialized');
  assert(readiness.current_inventory?.teknologi?.top_level_subject===false && readiness.current_inventory?.teknologi?.canonical_parent_subject==='vitenskap', 'Teknologi må forbli nested');
  const registryChapter=registrySubject?.chapters?.find((r)=>r.id===CHAPTER_ID);
  assert(registrySubject?.chapters?.length>=4 && registryChapter, 'Vitenskap-registry skal bevare Unit 4');
  assert(registryChapter.file===P.chapter && registryChapter.claimsFile===P.claims && registryChapter.briefFile===P.brief, 'Kjemi-registry peker til feil filer');
  assert(sameSet(registryChapter.emne_ids,EXPECTED_EMNES), 'Kjemi-registry har feil emnesett');
  assert(releaseSubject?.chapter_status==='materialized' && releaseSubject?.chapter_count>=4 && releaseSubject?.missing_chapter_files?.length===0, 'Release må bevare Unit 4 uten manglende filer');
  return {schema:'history_go_fagverk_vitenskap_chemistry_material_science_fulltext_audit_v1',version:'1.0.0',status:'pass',subject:'vitenskap',chapterId:CHAPTER_ID,summary:{emneCount:6,methodCount:8,moduleCount:3,sectionCount:9,paragraphCount:27,sourceCount:12,claimCount:20,misconceptionCount:4,workedExampleCount:2,applicationTaskCount:4,selfCheckCount:6,registeredChapterCount:readiness.current_inventory.vitenskap.registered_chapter_count,remainingEditorialBlockerCount:(readiness.editorial_blockers||[]).length},gates:{structureReactionMeasurementBoundaryLocked:true,thermodynamicsKineticsBoundaryLocked:true,sampleSignalInferenceBoundaryLocked:true,claimTraceReciprocalAndComplete:true,sourceClaimIntegrityPreserved:true,chemistryChapterMaterializedAndRegistered:true,chemistryEditorialBlockerResolved:true,oneBreadthEditorialBlockerRemains:(readiness.editorial_blockers||[]).length===1,prematureCompleteBlocked:true,technologyRemainsNested:true}};
}
if (process.argv[1] && fileURLToPath(import.meta.url)===path.resolve(process.argv[1])) console.log(JSON.stringify(auditVitenskapChemistryMaterialScienceFulltext(),null,2));
