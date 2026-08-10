#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const P={core:'js/fagverk-subject-core.js',categories:'data/categories/category_contract.json',manifest:'data/fag/fag_manifest.json',portal:'data/fagverk/fagverk_portal.json',inventory:'data/fagverk/subject_inventory.json',status:'data/fagverk/subject_status.json',registry:'data/fagverk/fagverk_registry.json',chapter:'data/fagverk/by/klima-helse-varme-vann-tilgjengelighet.json',brief:'data/fagverk/by/klima-helse-varme-vann-tilgjengelighet/brief.json',claims:'data/fagverk/by/klima-helse-varme-vann-tilgjengelighet/claims.json',report:'reports/fagverk/by-klima-helse-varme-vann-tilgjengelighet-phase4-audit.json'};
const EXPECTED_EMNES=['em_by_klima_blagronn_klimatilpasning','em_by_urban_metabolisme_vann_energi_avfall_mat','em_by_urban_helse_miljo','em_by_tilgjengelighet_universell_utforming'];
const EXPECTED_METHODS=['met_feltobservasjon','met_gaanalyse','met_klimarisikokartlegging','met_tilgjengelighetsaudit','met_vedlikehold_spor','met_dataanalyse'];
const GROUPS={
 byliv:['byliv-offentlige-rom','byliv-sosial-offentlighet','byliv-hendelser-midlertidighet','byliv-stemning-mikrokomfort','byliv-rytmer-miks-konflikt'],
 arkitektur:['arkitektur-type-skala-byform','arkitektur-gatekant-makt-ombruk'],
 bolig:['bolig-nabolag-tilgang-endring'],administrasjon:['administrasjon-plan-kontroll-beredskap'],
 urbanisme:['urbanisme-idealer-forbindelser-fortetting'],arbeid:['arbeid-naering-handel-logistikk'],
 historiske:['historiske-lag-ruiner-minner'],makt:['makt-konflikt-protest-grenser-trygghet']
};
const PLACE_FILES={akerselva:'data/places/by/oslo/places/akerselva.json',vulkan_energisentral:'data/places/by/oslo/places/vulkan_energisentral.json',jernbanetorget:'data/places/by/oslo/places/jernbanetorget.json',deichman_bjorvika:'data/places/by/oslo/places/deichman_bjorvika.json'};
const abs=(p)=>path.join(ROOT,p),read=(p)=>fs.readFileSync(abs(p),'utf8'),json=(p)=>JSON.parse(read(p));
const assert=(c,m)=>{if(!c)throw new Error(m);};
const sameSet=(a,b)=>a.length===b.length&&new Set(a).size===a.length&&a.every((x)=>b.includes(x));
const flatten=(v)=>Array.isArray(v)?v.flat(Infinity).filter((x)=>typeof x==='string'):[];
function loadCore(){const s={console};s.globalThis=s;vm.runInNewContext(read(P.core),s,{filename:P.core});assert(s.HGFagverkSubjectCore,'Fagverk-core ble ikke eksponert');return s.HGFagverkSubjectCore;}
function loadSource(CORE,e){const s={};for(const f of ['pensum','emner','fagkart','methods']){const r=CORE.resolveManifestPointer(e[f]);assert(fs.existsSync(abs(r)),'By mangler '+f);s[f==='emner'?'emners':f]=json(r);}return s;}
function projection(r){return{schema:r.schema,version:r.version,status:r.status,generatedFrom:r.generatedFrom,subject:r.subject,chapter:r.chapter,summary:r.summary,coverage:r.coverage,gates:r.gates};}

export async function auditByKlimaHelseVarmeVannTilgjengelighetPhase4({writeReport=false,checkReport=true}={}){
 const CORE=loadCore(),categories=json(P.categories),manifest=json(P.manifest),portal=json(P.portal),inventory=json(P.inventory),status=json(P.status),registry=json(P.registry),rawChapter=json(P.chapter),brief=json(P.brief),claimsDoc=json(P.claims);
 const portalEntry=portal.categories.find((r)=>r.id==='by'),inventoryEntry=inventory.subjects.find((r)=>r.id==='by'),statusEntry=status.subjects.find((r)=>r.id==='by'),rs=registry.subjects?.by;
 const chapterMeta=rs?.chapters?.find((r)=>r.id==='klima-helse-varme-vann-tilgjengelighet');
 const metas=Object.fromEntries(Object.entries(GROUPS).map(([k,ids])=>[k,ids.map((id)=>rs?.chapters?.find((r)=>r.id===id))]));
 assert(categories.fagSubjects.includes('by'),'By mangler i canonical fagliste');
 assert(portalEntry?.subjectStatus==='materialized'&&inventoryEntry?.schemaFamily==='by_compatibility','By har feil materialisering eller schemafamilie');
 assert(statusEntry?.assessmentStatus==='audited'&&statusEntry?.editorialStatus==='complete'&&statusEntry?.nextGate==='maintenance_source_refresh_and_place_case_expansion','By skal fortsette maintenance_source_refresh_and_place_case_expansion');
 assert(rs&&Array.isArray(rs.chapters)&&rs.chapters.length===17,'Klima og helse-batch skal gi fjorten By-kapitler');
 assert(chapterMeta&&Object.values(metas).flat().every(Boolean),'Klima og helse-kapittel eller tidligere domener mangler');
 assert(chapterMeta.primary_domain_id==='klima_og_helse'&&chapterMeta.file===P.chapter,'Registry har feil Klima og helse-kapittel');
 assert(sameSet(chapterMeta.emne_ids||[],EXPECTED_EMNES),'Registry har feil Klima og helse-emner');
 const source=loadSource(CORE,manifest.by),model=CORE.normalizeSubject({subjectId:'by',categoryLabel:categories.labels.by,categoryDescription:categories.decisions?.by,schemaFamily:inventoryEntry.schemaFamily,manifestEntry:manifest.by,portalEntry,inventoryEntry,statusEntry,registry,badge:{},source});
 assert(model.chapters.length===17,'Normalisert By skal ha fjorten kapitler');
 const em=new Map(model.emners.map((r)=>[r.id,r])),methods=new Map(model.methods.map((r)=>[r.id,r]));
 for(const id of EXPECTED_EMNES){assert(em.has(id),'Ukjent emne '+id);assert(em.get(id).domainId==='klima_og_helse',id+' eies ikke av klima_og_helse');}
 for(const id of EXPECTED_METHODS)assert(methods.has(id),'Ukjent metode '+id);
 const preserve=(domainId,rows,count,label)=>{const canonical=model.emners.filter((r)=>r.domainId===domainId).map((r)=>r.id).sort(),covered=rows.flatMap((r)=>r.emne_ids||[]);assert(canonical.length===count&&covered.length===count&&new Set(covered).size===count&&isDeepStrictEqual([...new Set(covered)].sort(),canonical),label+' '+count+'/'+count+' er ikke bevart');return canonical;};
 preserve('byliv',metas.byliv,30,'Byliv');preserve('arkitektur',metas.arkitektur,12,'Arkitektur');preserve('bolig_og_nabolag',metas.bolig,5,'Bolig og nabolag');preserve('administrasjon_og_plan',metas.administrasjon,3,'Administrasjon og plan');preserve('urbanisme',metas.urbanisme,6,'Urbanisme');preserve('arbeid_og_naering',metas.arbeid,8,'Arbeid og næring');preserve('historiske_lag',metas.historiske,2,'Historiske lag');preserve('makt_og_konflikt',metas.makt,5,'Makt og konflikt');
 const canonical=model.emners.filter((r)=>r.domainId==='klima_og_helse').map((r)=>r.id).sort();
 assert(canonical.length===4&&isDeepStrictEqual([...EXPECTED_EMNES].sort(),canonical),'Kapittelet dekker ikke canonical Klima og helse 4/4');
 assert(rawChapter.schema==='history_go_fagverk_chapter_v1'&&rawChapter.editorialStatus==='chapter_ready'&&rawChapter.claimTraceRequired===true,'Kapittelroot har feil kontrakt');
 assert(sameSet(rawChapter.emne_ids||[],EXPECTED_EMNES)&&sameSet(rawChapter.method_ids||[],EXPECTED_METHODS),'Kapittelroot har feil emne/metodesett');
 for(const f of [...rawChapter.moduleFiles,rawChapter.briefFile,rawChapter.claimsFile])assert(fs.existsSync(abs(f)),'Mangler '+f);
 const q=brief.qa||{};
 for(const gate of ['climateHealthFourOfFourGate','powerConflictFiveOfFivePreserved','historicalLayersTwoOfTwoPreserved','workBusinessEightOfEightPreserved','urbanismSixOfSixPreserved','administrationPlanningThreeOfThreePreserved','housingNeighborhoodFiveOfFivePreserved','architectureTwelveOfTwelvePreserved','bylivThirtyOfThirtyPreserved','scenarioVsForecastGuard','visibleMeasureVsEffectGuard','snapshotVsExposureGuard','associationVsDiagnosisGuard','treatmentVsReducedConsumptionGuard','minimumRuleVsTravelChainGuard','oneBodyVsAllUsersGuard','intentVsMeasuredEffectGuard'])assert(q[gate]===true,'Brief mangler sluttport '+gate);
 const excluded=brief.scope?.excluded||[];
 assert(excluded.some((t)=>t.includes('scenario')&&t.includes('eksakt prognose')),'Scenario/prognose-vakt mangler');
 assert(excluded.some((t)=>t.includes('Synlig vegetasjon')&&t.includes('bevis')),'Synlig tiltak/effekt-vakt mangler');
 assert(excluded.some((t)=>t.includes('måling')&&t.includes('stabil lokal eksponering')),'Snapshot/eksponering-vakt mangler');
 assert(excluded.some((t)=>t.includes('individuell diagnose')),'Sammenheng/diagnose-vakt mangler');
 assert(excluded.some((t)=>t.includes('Gjenvinning')&&t.includes('redusert total ressursbruk')),'Behandling/forbruk-vakt mangler');
 assert(excluded.some((t)=>t.includes('minstekrav')&&t.includes('hele reisekjeden')),'Minstekrav/reisekjede-vakt mangler');
 assert(excluded.some((t)=>t.includes('Én observatørs kropp')&&t.includes('alle brukere')),'Én kropp/alle brukere-vakt mangler');
 assert(excluded.some((t)=>t.includes('intensjon')&&t.includes('målt effekt')),'Intensjon/effekt-vakt mangler');
 const modules=rawChapter.moduleFiles.map(json),sections=modules.flatMap((m)=>m.sections||[]);
 assert(sections.length===9&&sections.every((s)=>s.paragraphs?.length===3),'Kapittelet skal ha 9 seksjoner / 27 avsnitt');
 assert(sections.every((s)=>s.paragraphClaimIds?.length===s.paragraphs.length),'Claimtrace mangler');
 const sources=claimsDoc.sources||[],claims=claimsDoc.claims||[],sourceIds=new Set(sources.map((r)=>r.id)),claimIds=new Set(claims.map((r)=>r.id));
 assert(sources.length===13&&sourceIds.size===13,'Kapittelet skal ha 13 unike kilder');
 assert(claims.length===18&&claimIds.size===18,'Kapittelet skal ha 18 unike claims');
 assert(sources.every((r)=>/^https:\/\//.test(r.url||'')&&r.publisher&&r.source_location),'Alle kilder må være inspectable');
 assert(claims.every((c)=>c.status==='verified'&&c.source_ids?.length&&c.source_ids.every((id)=>sourceIds.has(id))),'Claim mangler kilde/verified');
 const citedSources=new Set(claims.flatMap((c)=>c.source_ids));assert(sources.every((s)=>citedSources.has(s.id)),'Dekorativ kilde');
 const refs=new Map();for(const s of sections){const set=new Set([...flatten(s.paragraphClaimIds),...flatten(s.keyPointClaimIds)]);refs.set(s.id,set);assert([...set].every((id)=>claimIds.has(id)),s.id+' har ukjent claim');}
 const allRefs=new Set([...refs.values()].flatMap((s)=>[...s]));assert(claims.every((c)=>allRefs.has(c.id)),'Orphan claim');
 for(const c of claims){assert(Array.isArray(c.used_in)&&c.used_in.length,c.id+' mangler used_in');for(const sid of c.used_in)assert(refs.get(sid)?.has(c.id),c.id+' er ikke faktisk brukt i '+sid);}
 assert(claims.find((c)=>c.id==='klima-04')?.claim.includes('30 meters')&&claims.find((c)=>c.id==='klima-04')?.claim.includes('1,7 °C'),'Varmeøymodell-claim mangler');
 assert(claims.find((c)=>c.id==='klima-06')?.claim.includes('49')&&claims.find((c)=>c.id==='klima-06')?.claim.includes('18'),'Sårbarhetsprioritering mangler');
 assert(claims.find((c)=>c.id==='klima-11')?.claim.includes('90 prosent'),'Vannforsyningsclaim mangler');
 assert(claims.find((c)=>c.id==='klima-14')?.claim.includes('70 prosent')&&claims.find((c)=>c.id==='klima-14')?.claim.includes('90 prosent'),'Rensegrad-claim mangler');
 assert(claims.find((c)=>c.id==='klima-16')?.claim.includes('1:15')&&claims.find((c)=>c.id==='klima-16')?.claim.includes('1,6'),'Gangatkomstclaim mangler');
 const rawText=JSON.stringify({rawChapter,brief,modules:modules.map(({commonMisconceptions,...rest})=>rest)}).toLowerCase();
 for(const bad of ['kartet forutsier nøyaktig','grønt beviser at tiltaket virker','ett besøk beviser stabil eksponering','området diagnostiserer individet','energigjenvinning beviser sirkularitet','rampen beviser universell utforming'])assert(!rawText.includes(bad),'Forbudt Klima og helse-overclaim: '+bad);
 for(const f of Object.values(PLACE_FILES))assert(fs.existsSync(abs(f)),'Canonical feltcase mangler '+f);
 const fetchFile=async(file)=>json(file),hydrated=await CORE.hydrateChapter(chapterMeta,fetchFile);
 assert(hydrated.sections.length===9&&hydrated.workedExamples.length===2&&hydrated.commonMisconceptions.length===5&&hydrated.applicationTasks.length===4,'Hydrert læringspakke er ufullstendig');
 const selfCheck=modules.flatMap((m)=>m.selfCheck||[]);assert(selfCheck.length===6,'Kapittelet skal ha 6 self-checks');
 assert(hydrated.sources.length===13&&hydrated.claims.length===18,'Claims/kilder ble ikke hydrert');
 const report={"schema":"history_go_fagverk_by_klima_helse_varme_vann_tilgjengelighet_phase4_audit_v1","version":"1.0.0","status":"by_phase_4_klima_og_helse_domain_covered_subject_complete","generatedFrom":{"core":"js/fagverk-subject-core.js","categories":"data/categories/category_contract.json","manifest":"data/fag/fag_manifest.json","portal":"data/fagverk/fagverk_portal.json","inventory":"data/fagverk/subject_inventory.json","status":"data/fagverk/subject_status.json","registry":"data/fagverk/fagverk_registry.json","chapter":"data/fagverk/by/klima-helse-varme-vann-tilgjengelighet.json","brief":"data/fagverk/by/klima-helse-varme-vann-tilgjengelighet/brief.json","claims":"data/fagverk/by/klima-helse-varme-vann-tilgjengelighet/claims.json","report":"reports/fagverk/by-klima-helse-varme-vann-tilgjengelighet-phase4-audit.json"},"subject":{"id":"by","schemaFamily":"by_compatibility","adapter":"by","navigationStatus":"materialized","assessmentStatus":"audited","editorialStatus":"complete","nextGate":"maintenance_source_refresh_and_place_case_expansion","registeredChapterCount":17},"chapter":{"id":"klima-helse-varme-vann-tilgjengelighet","title":"Varme, vann og tilgjengelighet: hvem tåler byen?","primaryDomainId":"klima_og_helse","file":"data/fagverk/by/klima-helse-varme-vann-tilgjengelighet.json","editorialStatus":"chapter_ready"},"summary":{"coveredEmneCount":4,"methodCount":6,"moduleCount":3,"sectionCount":9,"sourceCount":13,"verifiedClaimCount":18,"workedExampleCount":2,"misconceptionCount":5,"applicationTaskCount":4,"selfCheckCount":6,"relatedPlaceCount":4,"canonicalBylivEmneCount":30,"coveredBylivEmneCount":30,"canonicalArchitectureEmneCount":12,"coveredArchitectureEmneCount":12,"canonicalHousingNeighborhoodEmneCount":5,"coveredHousingNeighborhoodEmneCount":5,"canonicalAdministrationPlanningEmneCount":3,"coveredAdministrationPlanningEmneCount":3,"canonicalUrbanismEmneCount":6,"coveredUrbanismEmneCount":6,"canonicalWorkBusinessEmneCount":8,"coveredWorkBusinessEmneCount":8,"canonicalHistoricalLayersEmneCount":2,"coveredHistoricalLayersEmneCount":2,"canonicalPowerConflictEmneCount":5,"coveredPowerConflictEmneCount":5,"canonicalClimateHealthEmneCount":4,"coveredClimateHealthEmneCount":4},"coverage":{"emneIds":["em_by_klima_blagronn_klimatilpasning","em_by_urban_metabolisme_vann_energi_avfall_mat","em_by_urban_helse_miljo","em_by_tilgjengelighet_universell_utforming"],"methodIds":["met_feltobservasjon","met_gaanalyse","met_klimarisikokartlegging","met_tilgjengelighetsaudit","met_vedlikehold_spor","met_dataanalyse"],"relatedPlaceIds":["akerselva","vulkan_energisentral","jernbanetorget","deichman_bjorvika"],"canonicalClimateHealthEmneIds":["em_by_klima_blagronn_klimatilpasning","em_by_tilgjengelighet_universell_utforming","em_by_urban_helse_miljo","em_by_urban_metabolisme_vann_energi_avfall_mat"]},"gates":{"canonicalStatusProgressionPreserved":true,"exactlySeventeenRegisteredByChapters":true,"bylivThirtyOfThirtyPreserved":true,"architectureTwelveOfTwelvePreserved":true,"housingNeighborhoodFiveOfFivePreserved":true,"administrationPlanningThreeOfThreePreserved":true,"urbanismSixOfSixPreserved":true,"workBusinessEightOfEightPreserved":true,"historicalLayersTwoOfTwoPreserved":true,"powerConflictFiveOfFivePreserved":true,"climateHealthFourOfFourCoveredExactlyOnce":true,"chapterHydratesThroughSharedRuntime":true,"fourCanonicalClimateHealthEmnersCovered":true,"sixCanonicalMethodsResolved":true,"threeEditedModulesPresent":true,"paragraphLevelClaimTraceComplete":true,"allClaimsVerifiedAndUsed":true,"everySourceUsedByClaim":true,"allClaimSourcesInspectable":true,"scenarioVsForecastSeparated":true,"visibleMeasureVsDocumentedEffectSeparated":true,"snapshotVsExposureSeparated":true,"associationVsIndividualDiagnosisSeparated":true,"treatmentVsReducedConsumptionSeparated":true,"minimumRuleVsCompleteTravelChainSeparated":true,"oneBodyVsAllUsersSeparated":true,"intentVsMeasuredEffectSeparated":true,"workedExamplesRenderable":true,"misconceptionsRenderable":true,"applicationTasksRenderable":true,"selfCheckRenderable":true,"canonicalFieldPlacesResolved":true,"byEditorialAndSourceContractLocked":true,"climateHealthCompleteWithoutSubjectCompletenessOverclaim":true}};
 if(writeReport)fs.writeFileSync(abs(P.report),JSON.stringify(report,null,2)+'\n');
 if(checkReport){assert(fs.existsSync(abs(P.report)),'Mangler committed rapport '+P.report);assert(isDeepStrictEqual(projection(json(P.report)),projection(report)),'Committed Klima og helse-rapport avviker');}
 return{report,hydrated};
}
if(import.meta.url==='file://'+process.argv[1]){auditByKlimaHelseVarmeVannTilgjengelighetPhase4({writeReport:process.argv.includes('--write-report'),checkReport:!process.argv.includes('--no-check-report')}).then(({report})=>console.log('By Klima og helse Fase 4 OK: '+report.summary.coveredEmneCount+'/4 emner, '+report.summary.sourceCount+' kilder og '+report.summary.verifiedClaimCount+' claims.')).catch((e)=>{console.error('By Klima og helse Fase 4 FEIL: '+e.message);process.exitCode=1;});}
