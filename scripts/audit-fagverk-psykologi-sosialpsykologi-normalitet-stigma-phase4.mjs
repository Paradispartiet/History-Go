#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const CHAPTER_ID='sosialpsykologi-normalitet-og-stigma';
const DOMAIN_ID='sosialpsykologi_normalitet_stigma';
const DIR=`data/fagverk/psykologi/${CHAPTER_ID}`;
const P=Object.freeze({pensum:'data/fag/psykologi/psykologipensum_canonical_v4_5.json',methods:'data/fag/psykologi/methods_psykologi_canonical_v4_5.json',registry:'data/fagverk/fagverk_registry.json',status:'data/fagverk/subject_status.json',chapter:`data/fagverk/psykologi/${CHAPTER_ID}.json`,brief:`${DIR}/brief.json`,claims:`${DIR}/claims.json`,internalPlace:'data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json',report:'reports/fagverk/psykologi-sosialpsykologi-normalitet-stigma-phase4-audit.json'});
const MODULES=[`${DIR}/01-grupper-roller-og-pavirkning.json`,`${DIR}/02-kategorier-normalitet-og-diagnose.json`,`${DIR}/03-stigma-offentlighet-og-tilhorighet.json`];
const CASES=['Konformitet, normer og sosial påvirkning','Kategorisering, kontakt og fordommer','Diagnosemerking, stigma og diskriminering','Ensomhet, sosial isolasjon og tilhørighet'];
const abs=(f)=>path.join(ROOT,f),read=(f)=>JSON.parse(fs.readFileSync(abs(f),'utf8'));
const assert=(ok,m)=>{if(!ok)throw new Error(m);};
const projection=(r)=>({schema:r.schema,version:r.version,status:r.status,generatedFrom:r.generatedFrom,subject:r.subject,chapter:r.chapter,summary:r.summary,canonicalEmneIds:r.canonicalEmneIds,methodIds:r.methodIds,runtimePlaceIds:r.runtimePlaceIds,socialCaseNames:r.socialCaseNames,gates:r.gates});

export function auditPsykologiSosialpsykologiNormalitetStigmaPhase4({writeReport=false,checkReport=true}={}){
  for(const f of [P.pensum,P.methods,P.registry,P.status,P.chapter,P.brief,P.claims,P.internalPlace,...MODULES]) assert(fs.existsSync(abs(f)),`Mangler ${f}`);
  const pensum=read(P.pensum),methodsDoc=read(P.methods),registry=read(P.registry),status=read(P.status),chapter=read(P.chapter),brief=read(P.brief),claimsDoc=read(P.claims),modules=MODULES.map(read);
  const domain=pensum.domains.find((d)=>d.domain_id===DOMAIN_ID); assert(domain,'Mangler canonicalt sosialpsykologidomene');
  const canonicalEmneIds=[...domain.emne_ids];
  assert(domain.emne_count===8&&canonicalEmneIds.length===8&&isDeepStrictEqual(chapter.emne_ids,canonicalEmneIds),'Kapittelet dekker ikke 8/8 canonicale emner');
  assert(domain.method_count===15&&domain.method_ids.length===15&&isDeepStrictEqual(chapter.method_ids,domain.method_ids),'Kapittelet dekker ikke 15/15 canonicale metoder');
  const canonicalMethods=new Set(methodsDoc.methods.map((m)=>m.method_id)); assert(chapter.method_ids.every((id)=>canonicalMethods.has(id)),'Ukjent metode');
  assert(chapter.schema==='history_go_fagverk_chapter_v1'&&chapter.subject==='psykologi'&&chapter.subject_id==='psykologi','Feil schema/fag');
  assert(chapter.id===CHAPTER_ID&&chapter.chapter_id===CHAPTER_ID&&chapter.primary_domain_id===DOMAIN_ID,'Feil kapittel/domene');
  assert(chapter.editorialStatus==='chapter_ready'&&chapter.claimTraceRequired===true,'Kapittelet er ikke chapter_ready/claimsporet');
  assert(chapter.doNotDiagnosePeople===true&&brief.safety?.doNotDiagnosePeople===true&&claimsDoc.source_policy?.noDiagnosisOfIndividuals===true,'Diagnosevern mangler');
  assert(brief.safety?.noIndividualTreatmentAdvice===true&&claimsDoc.source_policy?.noIndividualTreatmentAdvice===true,'Behandlingsrådvern mangler');
  assert(brief.safety?.noScreeningInterpretation===true&&claimsDoc.source_policy?.noScreeningInterpretation===true,'Screeningvern mangler');
  assert(brief.safety?.noGroupOrStigmaTypingFromCasualObservation===true&&claimsDoc.source_policy?.noGroupOrStigmaTypingFromCasualObservation===true,'Gruppe-/stigmatypestemplingsvern mangler');
  assert(claimsDoc.source_policy?.verified_at==='2026-08-11','Kildeverifiseringsdato er ikke låst');
  assert(isDeepStrictEqual(chapter.moduleFiles,MODULES),'Feil modulsett');
  const sections=modules.flatMap((m)=>m.sections||[]),paragraphs=sections.flatMap((s)=>s.paragraphs||[]),traces=sections.flatMap((s)=>s.paragraphClaimIds||[]);
  assert(modules.length===3&&sections.length===9&&paragraphs.length===27,'Kapittelet må være 3/9/27');
  assert(paragraphs.every((t)=>typeof t==='string'&&t.length>=180),'Et fagavsnitt er for tynt');
  assert(traces.length===27&&traces.every((ids)=>ids?.length),'Alle avsnitt må ha claimspor');
  const emnes=new Set(sections.flatMap((s)=>s.emne_ids||[])),methods=new Set(sections.flatMap((s)=>s.method_ids||[]));
  assert(emnes.size===8&&canonicalEmneIds.every((id)=>emnes.has(id)),'Seksjonene dekker ikke 8/8 emner');
  assert(methods.size===15&&chapter.method_ids.every((id)=>methods.has(id)),'Seksjonene bruker ikke 15/15 metoder');
  const sources=claimsDoc.sources||[],external=sources.filter((s)=>s.type!=='internal_place_record'),claims=claimsDoc.claims||[],sourceIds=new Set(sources.map((s)=>s.id)),claimIds=new Set(claims.map((c)=>c.id));
  assert(sources.length===21&&external.length===20&&claims.length===27,'Kapittelet skal ha 21 kilder / 20 eksterne / 27 claims');
  assert(sourceIds.size===21&&claimIds.size===27,'Dupliserte kilde- eller claim-ID-er');
  assert(sources.every((s)=>s.id&&s.publisher&&s.title&&s.url&&s.source_location&&s.label),'Kilde mangler metadata');
  assert(external.every((s)=>/^https:\/\//.test(s.url)),'Ekstern kilde mangler HTTPS');
  assert(claims.every((c)=>c.source_ids?.length&&c.source_ids.every((id)=>sourceIds.has(id))),'Claim peker til ukjent kilde');
  assert(traces.flat().every((id)=>claimIds.has(id))&&claims.every((c)=>traces.flat().includes(c.id)),'Claimspor er ufullstendig');
  const runtimePlaceIds=(chapter.relatedPlaces||[]).map((p)=>p.id); assert(isDeepStrictEqual(runtimePlaceIds,['psykologisk_institutt_uio']),'Feil runtime place');
  assert(sources.find((s)=>s.id==='src-hg-uio-place')?.url===P.internalPlace,'UiO-kilden peker feil');
  const socialCaseNames=(chapter.socialCases||[]).map((c)=>c.name); assert(isDeepStrictEqual(socialCaseNames,CASES),'Case-settet avviker');
  assert((chapter.socialCases||[]).every((c)=>c.caseStatus==='documented_case_not_runtime_place'),'Case later som runtime place');
  const registrySubject=registry.subjects?.psykologi;const chapterCount=registrySubject?.chapters?.length;
  assert([5,6].includes(chapterCount),'Psykologi skal stå på 5/6 eller 6/6 registrerte kapitler');
  const row=registrySubject.chapters.find((c)=>c.id===CHAPTER_ID); assert(row&&row.file===P.chapter&&row.primary_domain_id===DOMAIN_ID,'Registry mangler kapittelet');
  assert(isDeepStrictEqual(row.emne_ids,canonicalEmneIds)&&row.claimsFile===P.claims&&row.briefFile===P.brief,'Registry har feil emner/brief/claims');
  assert(registrySubject.editorialPlan?.targetChapterCount===6,'Feil targetChapterCount');
  const statusEntry=status.subjects.find((s)=>s.id==='psykologi'); assert(statusEntry?.navigationStatus==='materialized'&&statusEntry?.assessmentStatus==='audited','Psykologi mistet structural status');
  if(chapterCount===5){assert(registrySubject.editorialPlan?.nextGate==='remaining_domain_chapter_production','Feil 5/6-plan');assert(statusEntry?.editorialStatus==='chapters_in_progress'&&statusEntry?.nextGate==='remaining_domain_chapter_production','Feil 5/6 editorial status');}
  if(chapterCount===6){assert(registrySubject.editorialPlan?.nextGate==='maintenance_source_refresh_and_place_case_expansion','Feil 6/6-plan');assert(['complete','expanded_and_audited'].includes(statusEntry?.editorialStatus)&&statusEntry?.nextGate==='maintenance_source_refresh_and_place_case_expansion','Feil 6/6 editorial status');}
  const forbidden=[/du har (?:en|et) [a-zæøå-]+lidelse/i,/du er (?:fordomsfull|ensom|stigmatisert) fordi/i,/gruppen er slik/i,/diagnosen viser hele personligheten/i,/sitter alene[^.!?]{0,120}(?:derfor|følgelig|betyr at|viser at)[^.!?]{0,80}\bensom\b/i];
  assert(forbidden.every((p)=>!p.test(JSON.stringify({chapter,brief,modules}))),'Diagnostisk eller typestemplende språk funnet');
  const report={schema:'history_go_fagverk_psykologi_sosialpsykologi_normalitet_stigma_phase4_audit_v1',version:'1.1.0',status:'psykologi_sosialpsykologi_normalitet_stigma_chapter_ready',generatedFrom:P,subject:{id:'psykologi',editorialStatus:statusEntry.editorialStatus,nextGate:statusEntry.nextGate,registeredChapterCount:chapterCount,targetChapterCount:registrySubject.editorialPlan.targetChapterCount},chapter:{id:CHAPTER_ID,primaryDomainId:DOMAIN_ID,editorialStatus:chapter.editorialStatus,doNotDiagnosePeople:chapter.doNotDiagnosePeople},summary:{emneCount:8,methodCount:15,moduleCount:3,sectionCount:9,paragraphCount:27,claimCount:27,sourceCount:21,externalSourceCount:20,runtimePlaceCount:runtimePlaceIds.length,socialCaseCount:socialCaseNames.length},canonicalEmneIds,methodIds:chapter.method_ids,runtimePlaceIds,socialCaseNames,gates:{exactCanonicalEmneCoverage:true,exactCanonicalMethodCoverage:true,threeModulesNineSectionsTwentySevenParagraphs:true,paragraphClaimTraceComplete:true,allClaimsUsedAndSourceResolved:true,twentyExternalSourcesPresent:true,sourceLocationsComplete:true,doNotDiagnosePeopleGuardPresent:true,noIndividualTreatmentAdviceGuardPresent:true,noScreeningInterpretationGuardPresent:true,noGroupOrStigmaTypingGuardPresent:true,noInventedRuntimePlaces:true,socialCasesExplicitlyNonRuntime:true,registryProgressConsistentAtFiveOrSix:true,statusProgressConsistentAtFiveOrSix:true}};
  if(writeReport){fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true});fs.writeFileSync(abs(P.report),`${JSON.stringify(projection(report),null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(P.report)),`${P.report} mangler. Kjør --write-report`);assert(isDeepStrictEqual(read(P.report),projection(report)),`${P.report} er utdatert`);}
  return {report:projection(report),chapter,brief,claimsDoc,modules};
}
function main(){const args=new Set(process.argv.slice(2));try{const r=auditPsykologiSosialpsykologiNormalitetStigmaPhase4({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')&&!args.has('--write-report')});console.log(`Psykologi Sosialpsykologi Phase 4 OK: ${r.report.summary.emneCount}/8 emner, ${r.report.summary.methodCount} metoder, ${r.report.summary.paragraphCount} avsnitt, ${r.report.summary.claimCount} claims og ${r.report.summary.externalSourceCount} eksterne kilder. Fremdrift ${r.report.subject.registeredChapterCount}/6.`);}catch(e){console.error(`Psykologi Sosialpsykologi Phase 4 FEIL: ${e.message}`);process.exitCode=1;}}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
