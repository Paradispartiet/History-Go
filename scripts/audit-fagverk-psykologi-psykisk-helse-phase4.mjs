#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const CHAPTER_ID='psykisk-helse-institusjoner-og-behandling';
const DOMAIN_ID='psykisk_helse_institusjoner_behandling';
const NEXT_GATE='university_matrix_topic_articles_concept_registry_and_methods';
const DIR=`data/fagverk/psykologi/${CHAPTER_ID}`;
const P=Object.freeze({pensum:'data/fag/psykologi/psykologipensum_canonical_v4_5.json',methods:'data/fag/psykologi/methods_psykologi_canonical_v4_5.json',registry:'data/fagverk/fagverk_registry.json',status:'data/fagverk/subject_status.json',chapter:`data/fagverk/psykologi/${CHAPTER_ID}.json`,brief:`${DIR}/brief.json`,claims:`${DIR}/claims.json`,report:'reports/fagverk/psykologi-psykisk-helse-phase4-audit.json'});
const MODULES=[`${DIR}/01-grunnlag.json`,`${DIR}/02-rettigheter-og-praksis.json`,`${DIR}/03-institusjon-sted-og-krise.json`];
const CASES=['Gaustad sykehus','Dikemark sykehus','Psykiatrisk avdeling, Vinderen'];
const REQUIRED_CURRENT_SOURCE_IDS=['src-phvl-2026','src-phvf-2026','src-helsenorge-vern','src-helsenorge-tvang','src-helsedir-kontroll'];
const abs=(f)=>path.join(ROOT,f),read=(f)=>JSON.parse(fs.readFileSync(abs(f),'utf8'));
const assert=(ok,m)=>{if(!ok)throw new Error(m);};
const projection=(r)=>({schema:r.schema,version:r.version,status:r.status,generatedFrom:r.generatedFrom,subject:r.subject,chapter:r.chapter,summary:r.summary,canonicalEmneIds:r.canonicalEmneIds,methodIds:r.methodIds,runtimePlaceIds:r.runtimePlaceIds,institutionCaseNames:r.institutionCaseNames,gates:r.gates});

export function auditPsykologiPsykiskHelsePhase4({writeReport=false,checkReport=true}={}){
  for(const f of [P.pensum,P.methods,P.registry,P.status,P.chapter,P.brief,P.claims,...MODULES])assert(fs.existsSync(abs(f)),`Mangler ${f}`);
  const pensum=read(P.pensum),methodsDoc=read(P.methods),registry=read(P.registry),status=read(P.status),chapter=read(P.chapter),brief=read(P.brief),claimsDoc=read(P.claims),modules=MODULES.map(read);
  const domain=pensum.domains.find((d)=>d.domain_id===DOMAIN_ID);assert(domain,'Mangler canonicalt domene');
  const canonicalEmneIds=[...domain.emne_ids];
  assert(canonicalEmneIds.length===12&&isDeepStrictEqual(chapter.emne_ids,canonicalEmneIds)&&new Set(chapter.emne_ids).size===12,'Kapittelet dekker ikke 12 canonicale emner i eksakt rekkefølge');
  const canonicalMethods=new Set(methodsDoc.methods.map((m)=>m.method_id));
  assert(chapter.method_ids.length===18&&new Set(chapter.method_ids).size===18&&chapter.method_ids.every((id)=>canonicalMethods.has(id)),'Kapittelet bruker ikke 18 unike canonicale metoder');
  assert(chapter.schema==='history_go_fagverk_chapter_v1'&&chapter.subject_id==='psykologi'&&chapter.subject==='psykologi'&&chapter.id===CHAPTER_ID&&chapter.primary_domain_id===DOMAIN_ID,'Feil schema/fag/kapittel/domene');
  assert(chapter.editorialStatus==='chapter_ready'&&chapter.claimTraceRequired===true,'Kapittelet er ikke claimsporet chapter_ready');
  assert(chapter.doNotDiagnosePeople===true&&brief.safety?.doNotDiagnosePeople===true&&claimsDoc.source_policy?.noDiagnosisOfIndividuals===true,'Diagnosevern mangler');
  assert(brief.safety?.noIndividualTreatmentAdvice===true&&claimsDoc.source_policy?.noIndividualTreatmentAdvice===true,'Behandlingsrådvern mangler');
  assert(brief.safety?.noScreeningInterpretation===true,'Screeningvern mangler');
  assert(claimsDoc.source_policy?.legalClaimsRequireCurrentLegalSource===true,'Krav om aktuell rettskilde mangler');
  assert(isDeepStrictEqual(chapter.moduleFiles,MODULES),'Kapittelwrapperen peker til feil modulsett');
  const sections=modules.flatMap((m)=>m.sections||[]),paragraphs=sections.flatMap((s)=>s.paragraphs||[]),traces=sections.flatMap((s)=>s.paragraphClaimIds||[]);
  assert(modules.length===3&&sections.length===9&&paragraphs.length===27,'Kapittelet må være 3/9/27');
  assert(traces.length===27&&traces.every((ids)=>Array.isArray(ids)&&ids.length),'Alle 27 fagavsnitt må ha claimspor');
  assert(paragraphs.every((text)=>typeof text==='string'&&text.length>=180),'Et fagavsnitt er for tynt');
  const coveredEmnes=new Set(sections.flatMap((s)=>s.emne_ids||[])),usedMethods=new Set(sections.flatMap((s)=>s.method_ids||[]));
  assert(coveredEmnes.size===12&&canonicalEmneIds.every((id)=>coveredEmnes.has(id)),'Seksjonene dekker ikke 12/12 emner');
  assert(usedMethods.size===18&&chapter.method_ids.every((id)=>usedMethods.has(id)),'Seksjonene bruker ikke 18/18 metoder');
  const sources=claimsDoc.sources||[],claims=claimsDoc.claims||[],external=sources.filter((s)=>s.type!=='internal_place_record'),sourceIds=new Set(sources.map((s)=>s.id)),claimIds=new Set(claims.map((c)=>c.id));
  assert(sources.length>=20&&external.length>=15&&claims.length>=24,'Kapittelet mangler minimumskrav til kilder eller claims');
  assert(sourceIds.size===sources.length&&claimIds.size===claims.length,'Dupliserte source/claim ID-er');
  assert(sources.every((s)=>s.id&&s.publisher&&s.title&&s.url&&s.source_location&&s.label),'Kilde mangler metadata');
  assert(external.every((s)=>/^https:\/\//.test(s.url)),'Ekstern kilde mangler HTTPS');
  assert(claims.every((c)=>c.source_ids?.length&&c.source_ids.every((id)=>sourceIds.has(id))),'Claim mangler løst kildepeker');
  assert(traces.flat().every((id)=>claimIds.has(id)),'Fagavsnitt peker til ukjent claim');
  assert(REQUIRED_CURRENT_SOURCE_IDS.every((id)=>sourceIds.has(id)),'Gjeldende lov-/rettighetskilde mangler');
  assert(claimsDoc.source_policy?.verified_at==='2026-08-11','Kildeverifiseringsdato er ikke låst');
  const runtimePlaceIds=(chapter.relatedPlaces||[]).map((p)=>p.id);assert(isDeepStrictEqual(runtimePlaceIds,['psykologisk_institutt_uio']),'Kapittelet har ukjent runtime-place-ID');
  const internalPlace=sources.find((s)=>s.id==='src-hg-uio-place');assert(internalPlace?.url==='data/places/psykologi/oslo/places_psykologi/psykologisk_institutt_uio.json'&&fs.existsSync(abs(internalPlace.url)),'UiO-place-kilden peker feil');
  const institutionCaseNames=(chapter.institutionCases||[]).map((item)=>item.name);assert(isDeepStrictEqual(institutionCaseNames,CASES),'Institusjonscasene avviker');
  assert((chapter.institutionCases||[]).every((item)=>item.placeStatus==='documented_case_not_runtime_place'),'Institusjonscase later som runtime-sted');
  const registrySubject=registry.subjects?.psykologi,row=registrySubject?.chapters?.find((item)=>item.id===CHAPTER_ID);assert(row&&row.file===P.chapter&&row.primary_domain_id===DOMAIN_ID,'Registry mangler eller feilregistrerer kapittelet');
  assert(isDeepStrictEqual(row.emne_ids,canonicalEmneIds)&&row.claimsFile===P.claims&&row.briefFile===P.brief,'Registry har feil emner/brief/claims');
  assert(registrySubject.editorialPlan?.targetChapterCount===6,'Psykologi mangler targetChapterCount=6');
  const statusEntry=status.subjects.find((item)=>item.id==='psykologi');assert(statusEntry?.navigationStatus==='materialized'&&statusEntry?.assessmentStatus==='audited','Psykologi mistet structural status');
  const allowed=['chapters_in_progress','complete','expanded_and_audited'];assert(allowed.includes(statusEntry?.editorialStatus),'Psykologi har ugyldig redaksjonell fremdrift');
  if(statusEntry.editorialStatus==='chapters_in_progress')assert(['remaining_domain_chapter_production','full_subject_audit'].includes(statusEntry.nextGate),'Feil nextGate under kapittelproduksjon');
  if(statusEntry.editorialStatus==='complete')assert(statusEntry.nextGate==='maintenance_source_refresh_and_place_case_expansion','Legacy complete har feil nextGate');
  if(statusEntry.editorialStatus==='expanded_and_audited')assert(statusEntry.nextGate===NEXT_GATE,'Expanded Psykologi har feil universitetsport');
  const forbidden=[/du har (?:en|et) [a-zæøå-]+lidelse/i,/du er (?:deprimert|psykotisk|bipolar)/i,/testen viser at du/i,/du bør (?:starte|slutte|øke|redusere) (?:med )?(?:medisin|medikament)/i];
  assert(forbidden.every((p)=>!p.test(JSON.stringify({chapter,brief,modules}))),'Diagnostisk eller individualisert behandlingsspråk funnet');
  const report={schema:'history_go_fagverk_psykologi_psykisk_helse_phase4_audit_v1',version:'1.1.0',status:'psykologi_psykisk_helse_chapter_ready',generatedFrom:P,subject:{id:'psykologi',editorialStatus:statusEntry.editorialStatus,nextGate:statusEntry.nextGate,registeredChapterCount:registrySubject.chapters.length,targetChapterCount:registrySubject.editorialPlan.targetChapterCount},chapter:{id:CHAPTER_ID,primaryDomainId:DOMAIN_ID,editorialStatus:chapter.editorialStatus,doNotDiagnosePeople:chapter.doNotDiagnosePeople},summary:{emneCount:chapter.emne_ids.length,methodCount:chapter.method_ids.length,moduleCount:modules.length,sectionCount:sections.length,paragraphCount:paragraphs.length,claimCount:claims.length,sourceCount:sources.length,externalSourceCount:external.length,runtimePlaceCount:runtimePlaceIds.length,institutionCaseCount:institutionCaseNames.length},canonicalEmneIds,methodIds:chapter.method_ids,runtimePlaceIds,institutionCaseNames,gates:{exactCanonicalEmneCoverage:true,allMethodsCanonicalAndUsed:true,threeModulesNineSectionsTwentySevenParagraphs:true,paragraphClaimTraceComplete:true,minimumExternalSourcesMet:true,allClaimsSourceResolved:true,currentLegalSourcesPresent:true,doNotDiagnosePeopleGuardPresent:true,noIndividualTreatmentAdviceGuardPresent:true,noInventedRuntimePlaces:true,registrySynchronized:true,statusProgressionCompatible:true}};
  if(writeReport){fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true});fs.writeFileSync(abs(P.report),`${JSON.stringify(projection(report),null,2)}\n`);}
  if(checkReport){assert(fs.existsSync(abs(P.report)),`${P.report} mangler. Kjør audit med --write-report`);assert(isDeepStrictEqual(read(P.report),projection(report)),`${P.report} er utdatert`);}
  return {report:projection(report),chapter,brief,claimsDoc,modules};
}
function main(){const args=new Set(process.argv.slice(2));try{const r=auditPsykologiPsykiskHelsePhase4({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')&&!args.has('--write-report')});console.log(`Psykologi Psykisk helse Phase 4 OK: ${r.report.summary.emneCount}/12 emner, ${r.report.summary.methodCount} metoder, ${r.report.summary.paragraphCount} avsnitt, ${r.report.summary.claimCount} claims og ${r.report.summary.externalSourceCount} eksterne kilder.`);}catch(e){console.error(`Psykologi Psykisk helse Phase 4 FEIL: ${e.message}`);process.exitCode=1;}}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
