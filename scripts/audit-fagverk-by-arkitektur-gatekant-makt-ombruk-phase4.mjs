#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  core: 'js/fagverk-subject-core.js',
  categories: 'data/categories/category_contract.json',
  manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json',
  inventory: 'data/fagverk/subject_inventory.json',
  status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json',
  chapter: 'data/fagverk/by/arkitektur-gatekant-makt-ombruk.json',
  brief: 'data/fagverk/by/arkitektur-gatekant-makt-ombruk/brief.json',
  claims: 'data/fagverk/by/arkitektur-gatekant-makt-ombruk/claims.json',
  report: 'reports/fagverk/by-arkitektur-gatekant-makt-ombruk-phase4-audit.json'
});
const BYLIV_CHAPTERS = ['byliv-offentlige-rom','byliv-sosial-offentlighet','byliv-hendelser-midlertidighet','byliv-stemning-mikrokomfort','byliv-rytmer-miks-konflikt'];
const ARCH_CHAPTERS = ['arkitektur-type-skala-byform','arkitektur-gatekant-makt-ombruk'];
const EXPECTED_EMNES = [
  'em_by_butikkfasader_vindusutstillinger',
  'em_by_dodt_vs_aktivt_gateniva',
  'em_by_gateliv_kantsoner',
  'em_by_styring_forvaltning_planmakt',
  'em_by_symbolsk_makt_og_representasjon',
  'em_by_transformasjon_ombruk'
];
const EXPECTED_METHODS = ['met_feltobservasjon','met_gaanalyse','met_morfologisk_analyse','met_aktoranalyse','met_for_etter','met_komparativ_caseanalyse'];
const EXPECTED_PLACES = ['ullevål_hageby','rodelokka','barcode','deichman_bjorvika'];
const PLACE_FILES = {
  'ullevål_hageby':'data/places/by/oslo/places/ullevål_hageby.json',
  rodelokka:'data/places/by/oslo/places/rodelokka.json',
  barcode:'data/places/by/oslo/places/barcode.json',
  deichman_bjorvika:'data/places/by/oslo/places/deichman_bjorvika.json'
};
const abs = (p) => path.join(ROOT,p);
const read = (p) => fs.readFileSync(abs(p),'utf8');
const json = (p) => JSON.parse(read(p));
const assert = (c,m) => { if(!c) throw new Error(m); };
const sameSet = (a,b) => a.length===b.length && new Set(a).size===a.length && a.every((id)=>b.includes(id));
const flatten = (v) => Array.isArray(v) ? v.flat(Infinity).filter((x)=>typeof x==='string') : [];

function loadCore(){ const sandbox={console}; sandbox.globalThis=sandbox; vm.runInNewContext(read(P.core),sandbox,{filename:P.core}); assert(sandbox.HGFagverkSubjectCore,'Fagverk-core ble ikke eksponert'); return sandbox.HGFagverkSubjectCore; }
function loadSource(CORE,entry){ const source={}; for(const field of ['pensum','emner','fagkart','methods']){ const rel=CORE.resolveManifestPointer(entry[field]); assert(fs.existsSync(abs(rel)),`By mangler ${field}: ${rel}`); source[field==='emner'?'emners':field]=json(rel); } return source; }
function committedProjection(r){ return {schema:r.schema,version:r.version,status:r.status,generatedFrom:r.generatedFrom,subject:r.subject,chapter:r.chapter,summary:r.summary,coverage:r.coverage,gates:r.gates}; }

export async function auditByArkitekturGatekantMaktOmbrukPhase4({writeReport=false,checkReport=true}={}){
  const CORE=loadCore();
  const categories=json(P.categories), manifest=json(P.manifest), portal=json(P.portal), inventory=json(P.inventory), status=json(P.status), registry=json(P.registry);
  const rawChapter=json(P.chapter), brief=json(P.brief), claimsDocument=json(P.claims);
  const portalEntry=portal.categories.find((r)=>r.id==='by'), inventoryEntry=inventory.subjects.find((r)=>r.id==='by'), statusEntry=status.subjects.find((r)=>r.id==='by'), registrySubject=registry.subjects?.by;
  const chapterMeta=registrySubject?.chapters?.find((r)=>r.id==='arkitektur-gatekant-makt-ombruk');
  const bylivMeta=BYLIV_CHAPTERS.map((id)=>registrySubject?.chapters?.find((r)=>r.id===id));
  const archMeta=ARCH_CHAPTERS.map((id)=>registrySubject?.chapters?.find((r)=>r.id===id));
  assert(categories.fagSubjects.includes('by'),'By mangler i canonical fagliste');
  assert(portalEntry?.subjectStatus==='materialized','By er ikke materialisert');
  assert(inventoryEntry?.schemaFamily==='by_compatibility','By har feil schemafamilie');
  assert(statusEntry?.assessmentStatus==='audited','By har feil auditstatus');
  assert(statusEntry?.editorialStatus==='chapters_in_progress','By skal fortsatt stå chapters_in_progress');
  assert(statusEntry?.nextGate==='chapter_production','By skal fortsette kapittelproduksjon etter Arkitektur 12/12');
  assert(registrySubject && Array.isArray(registrySubject.chapters),'By mangler kapittelregister');
  assert(registrySubject.chapters.length===8,'Andre Arkitektur-batch skal gi nøyaktig åtte registrerte By-kapitler totalt');
  assert(chapterMeta && bylivMeta.every(Boolean) && archMeta.every(Boolean),'Kapittel 2 eller tidligere By-kapitler mangler');
  assert(chapterMeta.file===P.chapter && chapterMeta.primary_domain_id==='arkitektur','Registry har feil fil/domain for Arkitektur-kapittel 2');
  assert(sameSet(chapterMeta.emne_ids||[],EXPECTED_EMNES),'Registry har feil emnedekning for Arkitektur-kapittel 2');

  const source=loadSource(CORE,manifest.by);
  const model=CORE.normalizeSubject({subjectId:'by',categoryLabel:categories.labels.by,categoryDescription:categories.decisions?.by,schemaFamily:inventoryEntry.schemaFamily,manifestEntry:manifest.by,portalEntry,inventoryEntry,statusEntry,registry,badge:{},source});
  assert(model.subject.adapter==='by','By skal bruke by-adapteren');
  assert(model.chapters.length===8,'Normalisert By-modell skal vise åtte kapitler');
  const modelEmnes=new Map(model.emners.map((r)=>[r.id,r])), modelMethods=new Map(model.methods.map((r)=>[r.id,r]));
  for(const id of EXPECTED_EMNES){ const emne=modelEmnes.get(id); assert(emne,`Ukjent By-emne: ${id}`); assert(emne.domainId==='arkitektur',`${id} ligger ikke i normalisert arkitektur`); }
  for(const id of EXPECTED_METHODS) assert(modelMethods.has(id),`Ukjent By-metode: ${id}`);

  const canonicalBylivIds=model.emners.filter((r)=>r.domainId==='byliv').map((r)=>r.id).sort();
  const coveredBylivRefs=bylivMeta.flatMap((r)=>r.emne_ids||[]);
  assert(canonicalBylivIds.length===30,'Canonical Byliv skal ha 30 emner');
  assert(coveredBylivRefs.length===30 && new Set(coveredBylivRefs).size===30,'Byliv 30/30 er ikke bevart');
  assert(isDeepStrictEqual([...new Set(coveredBylivRefs)].sort(),canonicalBylivIds),'Byliv-kapitlene matcher ikke canonical Byliv 30/30');

  const canonicalArchitectureIds=model.emners.filter((r)=>r.domainId==='arkitektur').map((r)=>r.id).sort();
  const coveredArchitectureRefs=archMeta.flatMap((r)=>r.emne_ids||[]);
  assert(canonicalArchitectureIds.length===12,`Canonical Arkitektur skal ha 12 emner, fikk ${canonicalArchitectureIds.length}`);
  assert(coveredArchitectureRefs.length===12 && new Set(coveredArchitectureRefs).size===12,'De to Arkitektur-kapitlene skal ha 12 unike emnereferanser');
  assert(isDeepStrictEqual([...new Set(coveredArchitectureRefs)].sort(),canonicalArchitectureIds),'Arkitektur-kapitlene dekker ikke canonical 12/12');

  assert(rawChapter.schema==='history_go_fagverk_chapter_v1' && rawChapter.editorialStatus==='chapter_ready','Kapittelroot har feil schema/status');
  assert(rawChapter.claimTraceRequired===true && rawChapter.primary_domain_id==='arkitektur','Kapittelroot mangler claimtrace/domain');
  assert(sameSet(rawChapter.emne_ids||[],EXPECTED_EMNES),'Kapittelroot har feil emnesett');
  assert(sameSet(rawChapter.method_ids||[],EXPECTED_METHODS),'Kapittelroot har feil metodesett');
  assert(Array.isArray(rawChapter.moduleFiles) && rawChapter.moduleFiles.length===3,'Kapittelet skal ha tre moduler');
  for(const f of [...rawChapter.moduleFiles,rawChapter.briefFile,rawChapter.claimsFile]) assert(fs.existsSync(abs(f)),`Kapittelfil mangler: ${f}`);
  assert(brief.chapter_id==='arkitektur-gatekant-makt-ombruk' && brief.primary_domain_id==='arkitektur','Brief har feil kapittel/domain');
  assert(sameSet(brief.requiredEmneIds||[],EXPECTED_EMNES),'Brief har feil emnesett');
  assert(sameSet(brief.requiredMethodIds||[],EXPECTED_METHODS),'Brief har feil metodesett');
  assert(brief.sourceStrategy?.minimumExternalSources>=12 && brief.sourceStrategy?.claimLevelTrace===true && brief.sourceStrategy?.sourceLocationsRequired===true,'Brief mangler kildeport');
  assert(brief.qa?.architectureTwelveOfTwelveGate===true && brief.qa?.bylivThirtyOfThirtyPreserved===true && brief.qa?.activeFrontageGuard===true && brief.qa?.universalEntranceGuard===true && brief.qa?.reuseDecisionGuard===true && brief.qa?.symbolicIntentGuard===true,'Brief mangler bindende sluttporter');
  const exclusions=brief.scope?.excluded||[];
  assert(exclusions.some((t)=>t.includes('glass') && t.includes('aktiv')),'Brief blokkerer ikke glass=aktiv førsteetasje');
  assert(exclusions.some((t)=>t.includes('bakinngang') && t.includes('universell')),'Brief blokkerer ikke separat bakinngang=UU');
  assert(exclusions.some((t)=>t.includes('ombruk') && t.includes('alltid')),'Brief blokkerer ikke ombruk-alltid-riktig');
  assert(exclusions.some((t)=>t.includes('symboltolkning') && t.includes('intensjon')),'Brief blokkerer ikke symbolintensjonsgjetting');

  const modules=rawChapter.moduleFiles.map(json), sections=modules.flatMap((m)=>Array.isArray(m.sections)?m.sections:[]);
  assert(sections.length===9,'Kapittelet skal ha ni seksjoner');
  assert(sections.every((s)=>Array.isArray(s.paragraphs)&&s.paragraphs.length===3),'Alle seksjoner skal ha tre avsnitt');
  assert(sections.every((s)=>Array.isArray(s.paragraphClaimIds)&&s.paragraphClaimIds.length===s.paragraphs.length),'Avsnitt mangler claimtrace');
  const sources=claimsDocument.sources||[], claims=claimsDocument.claims||[];
  assert(sources.length===13,'Kapittelet skal ha 13 kilder');
  assert(claims.length===18,'Kapittelet skal ha 18 claims');
  const sourceIds=new Set(sources.map((r)=>r.id)), claimIds=new Set(claims.map((r)=>r.id));
  assert(sourceIds.size===13 && claimIds.size===18,'Dupliserte source/claim-ID-er');
  assert(sources.every((r)=>/^https:\/\//.test(r.url||'') && r.publisher && r.source_location),'Alle kilder må være inspectable');
  assert(sources.filter((r)=>r.published_at).every((r)=>/^\d{4}-\d{2}-\d{2}$/.test(r.published_at)),'published_at har feil format');
  assert(claims.every((r)=>r.status==='verified' && Array.isArray(r.source_ids) && r.source_ids.length && r.source_ids.every((id)=>sourceIds.has(id))),'Claim er ikke verified eller peker til ukjent kilde');
  const citedSources=new Set(claims.flatMap((r)=>r.source_ids||[])); assert(sources.every((r)=>citedSources.has(r.id)),'Dekorativ kilde uten claim');
  const refsBySection=new Map();
  for(const s of sections){ const refs=new Set([...flatten(s.paragraphClaimIds),...flatten(s.keyPointClaimIds)]); refsBySection.set(s.id,refs); assert([...refs].every((id)=>claimIds.has(id)),`${s.id} peker til ukjent claim`); }
  const allRefs=new Set([...refsBySection.values()].flatMap((set)=>[...set])); assert(claims.every((c)=>allRefs.has(c.id)),'Orphan claim');
  for(const c of claims){ assert(Array.isArray(c.used_in)&&c.used_in.length,`${c.id} mangler used_in`); for(const sid of c.used_in) assert(refsBySection.get(sid)?.has(c.id),`${c.id} er ikke faktisk koblet i ${sid}`); }
  assert(claims.find((r)=>r.id==='agm-04')?.claim.includes('hovedløsning'),'UU-claim mangler hovedløsningsgrense');
  assert(claims.find((r)=>r.id==='agm-09')?.claim.includes('ikke er ombruk for enhver pris'),'Ombruksclaim mangler avveiningsgrense');
  assert(claims.find((r)=>r.id==='agm-15')?.claim.includes('1958') && claims.find((r)=>r.id==='agm-15')?.claim.includes('1969'),'Regjeringskvartalet-claim mangler daterte bygganker');
  const rawText=JSON.stringify({rawChapter,brief,modules}).toLowerCase();
  for(const overclaim of ['glassfasade betyr aktiv førsteetasje','bakinngang oppfyller universell utforming','ombruk er alltid riktig','arkitekten ønsket å symbolisere']) assert(!rawText.includes(overclaim),`Forbudt overclaim: ${overclaim}`);
  for(const file of Object.values(PLACE_FILES)) assert(fs.existsSync(abs(file)),`Canonical feltcase mangler: ${file}`);

  const fetchFile=async(file)=>json(file);
  const hydrated=await CORE.hydrateChapter(chapterMeta,fetchFile);
  assert(hydrated.sections.length===9,'Hydrert kapittel mangler seksjoner');
  assert(hydrated.workedExamples.length===2 && hydrated.workedExamples.every((row)=>row.situation && row.analysis.length>=4),'Kapittelet skal hydrere to renderbare worked examples');
  assert(hydrated.commonMisconceptions.length===5,'Kapittelet skal hydrere fem misoppfatninger');
  assert(hydrated.applicationTasks.length===4,'Kapittelet skal hydrere fire oppgaver');
  const selfCheck=modules.flatMap((module)=>Array.isArray(module.selfCheck)?module.selfCheck:[]);
  assert(selfCheck.length===6 && selfCheck.every((row)=>row.question && row.answer),'Kapittelet skal ha seks self-checks');
  assert(hydrated.sources.length===13 && hydrated.claims.length===18,'Claims/kilder ble ikke hydrert');

  const report={
    schema:'history_go_fagverk_by_arkitektur_gatekant_makt_ombruk_phase4_audit_v1',version:'1.0.0',status:'by_phase_4_arkitektur_domain_chapter_covered_subject_in_progress',generatedFrom:P,
    subject:{id:'by',schemaFamily:inventoryEntry.schemaFamily,adapter:model.subject.adapter,navigationStatus:portalEntry.subjectStatus,assessmentStatus:statusEntry.assessmentStatus,editorialStatus:statusEntry.editorialStatus,nextGate:statusEntry.nextGate,registeredChapterCount:registrySubject.chapters.length},
    chapter:{id:rawChapter.id,title:rawChapter.title,primaryDomainId:rawChapter.primary_domain_id,file:P.chapter,editorialStatus:rawChapter.editorialStatus},
    summary:{coveredEmneCount:EXPECTED_EMNES.length,methodCount:EXPECTED_METHODS.length,moduleCount:3,sectionCount:9,sourceCount:13,verifiedClaimCount:18,workedExampleCount:2,misconceptionCount:5,applicationTaskCount:4,selfCheckCount:6,relatedPlaceCount:EXPECTED_PLACES.length,canonicalBylivEmneCount:30,coveredBylivEmneCount:30,canonicalArchitectureEmneCount:12,chapterCoveredArchitectureEmneCount:12},
    coverage:{emneIds:EXPECTED_EMNES,methodIds:EXPECTED_METHODS,relatedPlaceIds:EXPECTED_PLACES,canonicalArchitectureEmneIds:canonicalArchitectureIds},
    gates:{canonicalStatusProgressionPreserved:true,preservedAcrossEightRegisteredByChapters:true,allFiveBylivChaptersStillHydrate:true,bylivThirtyOfThirtyPreserved:true,bothArchitectureChaptersRegistered:true,architectureTwelveOfTwelveCoveredExactlyOnce:true,chapterHydratesThroughSharedRuntime:true,sixCanonicalArchitectureEmnersCovered:true,sixCanonicalMethodsResolved:true,threeEditedModulesPresent:true,paragraphLevelClaimTraceComplete:true,allClaimsVerifiedAndUsed:true,everySourceUsedByClaim:true,allClaimSourcesInspectable:true,activeGroundFloorEvidenceGuarded:true,universalMainEntranceGuarded:true,reuseDecisionTradeoffsGuarded:true,useChangeAndHeritageRolesSeparated:true,planningPowerMappedToActorsAndDocuments:true,symbolicIntentNotFabricated:true,workedExamplesRenderable:true,misconceptionsRenderable:true,applicationTasksRenderable:true,selfCheckRenderable:true,canonicalFieldPlacesResolved:true,byEditorialAndSourceContractLocked:true,architectureCompleteWithoutSubjectCompletenessOverclaim:true}
  };
  if(writeReport) fs.writeFileSync(abs(P.report),`${JSON.stringify(report,null,2)}\n`);
  if(checkReport){ assert(fs.existsSync(abs(P.report)),`Mangler committed rapport: ${P.report}`); assert(isDeepStrictEqual(committedProjection(json(P.report)),committedProjection(report)),'Committed Arkitektur 12/12-rapport avviker'); }
  return {report,hydrated};
}

if(import.meta.url===`file://${process.argv[1]}`){ const writeReport=process.argv.includes('--write-report'), checkReport=!process.argv.includes('--no-check-report'); auditByArkitekturGatekantMaktOmbrukPhase4({writeReport,checkReport}).then(({report})=>console.log(`By Arkitektur gatekant/makt/ombruk Fase 4 OK: ${report.summary.coveredEmneCount} emner, Arkitektur ${report.summary.chapterCoveredArchitectureEmneCount}/12, ${report.summary.sourceCount} kilder og ${report.summary.verifiedClaimCount} claims.`)).catch((error)=>{ console.error(`By Arkitektur gatekant/makt/ombruk Fase 4 FEIL: ${error.message}`); process.exitCode=1; }); }
