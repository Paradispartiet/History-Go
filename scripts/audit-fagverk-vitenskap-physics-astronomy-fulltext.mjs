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
  chapter: 'data/fagverk/vitenskap/vitenskap-fysikk-fra-bevegelse-til-kosmos.json',
  brief: 'data/fagverk/vitenskap/vitenskap-fysikk-fra-bevegelse-til-kosmos/brief.json',
  claims: 'data/fagverk/vitenskap/vitenskap-fysikk-fra-bevegelse-til-kosmos/claims.json'
});
const CHAPTER_ID = 'vitenskap-fysikk-fra-bevegelse-til-kosmos';
const EXPECTED_EMNES = [
  'em_vit_mekanikk_krefter_bevegelse','em_vit_energi_termodynamikk','em_vit_bolger_og_optikk','em_vit_elektromagnetisme',
  'em_vit_kvantefysikk','em_vit_relativitet','em_vit_atom_og_kjernefysikk','em_vit_astronomi_og_kosmologi'
];
const EXPECTED_METHODS = [
  'met_vit_maleinstrumentanalyse','met_vit_modellanalyse','met_vit_beregningsanalyse','met_vit_eksperimentanalyse',
  'met_vit_systemanalyse','met_vit_sensoranalyse','met_vit_statistisk_analyse','met_vit_observasjonsanalyse'
];
const ALLOWED_LATER_BLOCKERS = ['chemistry_material_science','medicine_biomedicine_public_health'];
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sorted = (values) => [...values].sort();
const sameSet = (a,b) => Array.isArray(a) && a.length === b.length && new Set(a).size === a.length && a.every((id)=>b.includes(id));
const flatten = (value) => Array.isArray(value) ? value.flat(Infinity).filter((x)=>typeof x === 'string') : [];

export function auditVitenskapPhysicsAstronomyFulltext() {
  const readiness=json(P.readiness), registry=json(P.registry), release=json(P.release), chapter=json(P.chapter), brief=json(P.brief), claimsDocument=json(P.claims);
  const registrySubject=registry.subjects?.vitenskap, releaseSubject=release.subjects?.vitenskap;
  assert(chapter.schema === 'history_go_fagverk_chapter_v1', 'Fysikk-kapittelet har feil schema');
  assert(chapter.id===CHAPTER_ID && chapter.chapter_id===CHAPTER_ID, 'Fysikk-kapittelet har feil ID');
  assert(chapter.subject_id==='vitenskap' && chapter.primary_domain_id==='natur_medisin_miljo', 'Fysikk-kapittelet har feil subject/domain');
  assert(chapter.coverage_family_id==='physics_astronomy', 'Fysikk-kapittelet har feil coverage family');
  assert(chapter.editorialStatus==='chapter_ready' && chapter.claimTraceRequired===true, 'Fysikk-kapittelet er ikke chapter_ready med claim trace');
  assert(sameSet(chapter.emne_ids, EXPECTED_EMNES), 'Fysikk-kapittelet har feil emnesett');
  assert(sameSet(chapter.method_ids, EXPECTED_METHODS), 'Fysikk-kapittelet har feil metodesett');
  assert(chapter.briefFile===P.brief && chapter.claimsFile===P.claims, 'Fysikk-kapittelet peker ikke til canonical brief/claims');
  assert(Array.isArray(chapter.moduleFiles) && chapter.moduleFiles.length===3, 'Fysikk-kapittelet skal ha tre moduler');
  for (const file of [...chapter.moduleFiles,chapter.briefFile,chapter.claimsFile]) assert(fs.existsSync(abs(file)), `Mangler Unit 3-fil ${file}`);
  const guard=chapter.qualityGuard||{};
  for (const key of ['measurementVsModelBoundaryExplicit','thermodynamicsVsEverydayMetaphorExplicit','signalInstrumentInterpretationChainExplicit','quantumStateVsMeasurementOutcomeExplicit','classicalVsRelativisticValidityExplicit','spectrumVsEnergyLevelModelExplicit','standardModelGravityBoundaryExplicit','astronomyInstrumentMediationExplicit','multiMessengerEvidenceExplicit','doesNotClaimSubjectComplete','remainingBreadthEditorialBlockersRequired','technologyRemainsNested']) assert(guard[key]===true, `Fysikk-kapittelet mangler quality guard ${key}`);
  assert(brief.chapter_id===CHAPTER_ID && sameSet(brief.requiredEmneIds,EXPECTED_EMNES) && sameSet(brief.requiredMethodIds,EXPECTED_METHODS), 'Brief og fulltekst er ikke aligned');
  const claims=claimsDocument.claims||[], sources=claimsDocument.sources||[];
  assert(claims.length===20 && sources.length===12, 'Unit 3 må bevare 20 claims og 12 kilder');
  const claimIds=new Set(claims.map((r)=>r.id)), sourceIds=new Set(sources.map((r)=>r.id));
  assert(claimIds.size===20 && sourceIds.size===12, 'Unit 3 har dupliserte claim/source-ID-er');
  assert(claims.every((r)=>r.status==='verified' && r.source_ids?.length && r.source_ids.every((id)=>sourceIds.has(id))), 'Unit 3 har uverifisert eller ukjent kildekoblet claim');
  const modules=chapter.moduleFiles.map(json), sections=modules.flatMap((m)=>m.sections||[]), paragraphs=sections.flatMap((s)=>s.paragraphs||[]);
  assert(sections.length===9 && new Set(sections.map((s)=>s.id)).size===9, 'Unit 3 skal ha 9 unike seksjoner');
  assert(paragraphs.length===27 && paragraphs.every((t)=>typeof t==='string' && t.trim().length>=220), 'Unit 3 skal ha 27 substansielle fagavsnitt');
  assert(new Set(paragraphs).size===27, 'Unit 3 gjenbruker identisk avsnittstekst');
  assert(sections.every((s)=>s.paragraphs?.length===3 && s.paragraphClaimIds?.length===3 && s.keyPoints?.length===2 && s.keyPointClaimIds?.length===2), 'Hver Unit 3-seksjon må ha tre claimsporede avsnitt og to key points');
  const refsBySection=new Map();
  for (const section of sections) {
    const refs=new Set([...flatten(section.paragraphClaimIds),...flatten(section.keyPointClaimIds)]);
    assert([...refs].every((id)=>claimIds.has(id)), `${section.id} peker til ukjent claim`);
    refsBySection.set(section.id,refs);
  }
  const allRefs=new Set([...refsBySection.values()].flatMap((s)=>[...s]));
  assert(claims.every((c)=>allRefs.has(c.id)), 'Unit 3 har orphan claim uten fulltekstbruk');
  for (const claim of claims) {
    const actual=[...refsBySection.entries()].filter(([,refs])=>refs.has(claim.id)).map(([id])=>id);
    assert(isDeepStrictEqual(sorted(actual),sorted(claim.used_in||[])), `${claim.id} har ikke eksakt reciprocal used_in/fulltext-sporing`);
  }
  const worked=modules.flatMap((m)=>m.workedExamples||[]), tasks=modules.flatMap((m)=>m.applicationTasks||[]), self=modules.flatMap((m)=>m.selfCheck||[]), misconceptions=modules.flatMap((m)=>m.misconceptions||[]);
  assert(worked.length===2 && worked.every((r)=>r.analysis?.length>=4 && r.claim_ids?.length>=3), 'Unit 3 skal ha to substansielle worked examples');
  assert(tasks.length===4 && tasks.every((r)=>r.prompts?.length>=4), 'Unit 3 skal ha fire anvendelsesoppgaver');
  assert(self.length===6 && self.every((r)=>r.question&&r.answer), 'Unit 3 skal ha seks self-check-spørsmål');
  assert(misconceptions.length===4 && misconceptions.every((r)=>r.claim&&r.correction), 'Unit 3 skal ha fire misoppfatninger');
  assert(misconceptions.some((r)=>/entropi/i.test(r.claim+r.correction)), 'Unit 3 mangler termodynamikk-korreksjon');
  assert(misconceptions.some((r)=>/kvante/i.test(r.claim+r.correction)), 'Unit 3 mangler kvante-korreksjon');
  assert(misconceptions.some((r)=>/Standard Model/i.test(r.claim+r.correction) && /gravitasjon/i.test(r.correction)), 'Unit 3 mangler Standard Model/gravitasjon-korreksjon');
  assert(readiness.complete_ready===false, 'Unit 3 kan ikke gjøre Vitenskap complete-ready');
  assert(readiness.current_inventory?.vitenskap?.registered_chapter_count>=3, 'Readiness må bevare minst tre Vitenskap-kapitler etter Unit 3');
  assert((readiness.editorial_blockers||[]).every((id)=>ALLOWED_LATER_BLOCKERS.includes(id)) && !(readiness.editorial_blockers||[]).includes('physics_astronomy'), 'Senere units kan bare redusere Unit 3 sitt tillatte blocker-sett');
  const physics=readiness.coverage_families?.find((r)=>r.id==='physics_astronomy');
  assert(physics?.status==='chapter_materialized' && physics?.materialized_chapter_id===CHAPTER_ID, 'Fysikkfamilien er ikke chapter_materialized');
  assert(readiness.current_inventory?.teknologi?.top_level_subject===false && readiness.current_inventory?.teknologi?.canonical_parent_subject==='vitenskap', 'Teknologi må forbli nested');
  const registryChapter=registrySubject?.chapters?.find((r)=>r.id===CHAPTER_ID);
  assert(registrySubject?.chapters?.length>=3 && registryChapter, 'Vitenskap-registry må bevare Unit 3');
  assert(registryChapter.file===P.chapter && registryChapter.claimsFile===P.claims && registryChapter.briefFile===P.brief, 'Fysikk-registry peker til feil filer');
  assert(sameSet(registryChapter.emne_ids,EXPECTED_EMNES), 'Fysikk-registry har feil emnesett');
  assert(releaseSubject?.chapter_status==='materialized' && releaseSubject?.chapter_count===registrySubject.chapters.length && releaseSubject?.chapter_count>=3 && releaseSubject?.missing_chapter_files?.length===0, 'Release må bevare Unit 3 og følge registry uten manglende filer');
  return {schema:'history_go_fagverk_vitenskap_physics_astronomy_fulltext_audit_v1',version:'1.0.0',status:'pass',subject:'vitenskap',chapterId:CHAPTER_ID,summary:{emneCount:8,methodCount:8,moduleCount:3,sectionCount:9,paragraphCount:27,sourceCount:12,claimCount:20,misconceptionCount:4,workedExampleCount:2,applicationTaskCount:4,selfCheckCount:6,registeredChapterCount:readiness.current_inventory.vitenskap.registered_chapter_count,remainingEditorialBlockerCount:(readiness.editorial_blockers||[]).length},gates:{measurementModelBoundaryLocked:true,claimTraceReciprocalAndComplete:true,sourceClaimIntegrityPreserved:true,physicsChapterMaterializedAndRegistered:true,physicsEditorialBlockerResolved:true,remainingBreadthEditorialBlockersConsistent:true,prematureCompleteBlocked:true,technologyRemainsNested:true}};
}
if (process.argv[1] && fileURLToPath(import.meta.url)===path.resolve(process.argv[1])) console.log(JSON.stringify(auditVitenskapPhysicsAstronomyFulltext(),null,2));
