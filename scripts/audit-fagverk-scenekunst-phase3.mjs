#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  core: 'js/fagverk-subject-core.js', categories: 'data/categories/category_contract.json', manifest: 'data/fag/fag_manifest.json',
  portal: 'data/fagverk/fagverk_portal.json', inventory: 'data/fagverk/subject_inventory.json', status: 'data/fagverk/subject_status.json',
  registry: 'data/fagverk/fagverk_registry.json', badge: 'data/badges/scenekunst.json', badgePage: 'data/fag/scenekunst/merke_scenekunst.html',
  badgeArchive: 'data/fag/scenekunst/archive/merke_scenekunst_legacy_20260829.html',
  readiness: 'data/fag/scenekunst/scenekunst_university_readiness_v1.json', report: 'reports/fagverk/scenekunst-phase3-audit.json'
});
const BADGE_TARGET = 'fagverk.html?subject=scenekunst#fagverkIaProgresjon';
const RELATIVE_BADGE_TARGET = '../../../fagverk.html?subject=scenekunst#fagverkIaProgresjon';
const DOMAIN_ORDER = ['institusjon_repertoar','verk_utover_form','dans_hybrid_humor','publikum_offentlighet'];
const FOUNDATION_EMNES = ['em_scenekunst_teaterinstitusjon_repertoar','em_scenekunst_dramaturgi_iscenesettelse','em_scenekunst_skuespill_rollefortolkning','em_scenekunst_regi_scenografi','em_scenekunst_dans_koreografi','em_scenekunst_musikal_musikkteater','em_scenekunst_revy_standup_impro','em_scenekunst_publikum_fjerde_vegg'];
const FOUNDATION_METHODS = ['met_scenekunst_forestillingsanalyse','met_scenekunst_dramaturgianalyse','met_scenekunst_rolleanalyse','met_scenekunst_scenografianalyse','met_scenekunst_bevegelsesanalyse','met_scenekunst_produksjonsanalyse','met_scenekunst_resepsjonsanalyse','met_scenekunst_institusjonsanalyse','met_scenekunst_arkivanalyse'];
const abs = (p) => path.join(ROOT,p); const read = (p) => fs.readFileSync(abs(p),'utf8'); const json = (p) => JSON.parse(read(p)); const assert = (c,m) => { if(!c) throw new Error(m); }; const sameList=(a,b)=>JSON.stringify([...a])===JSON.stringify(b);
function loadCore(){ const sandbox={console}; sandbox.globalThis=sandbox; vm.runInNewContext(read(P.core),sandbox,{filename:P.core}); return sandbox.HGFagverkSubjectCore; }
function projection(r){ return {schema:r.schema,version:r.version,status:r.status,generatedFrom:r.generatedFrom,subject:r.subject,summary:r.summary,canonicalDomainOrder:r.canonicalDomainOrder,domainEmneCounts:r.domainEmneCounts,gates:r.gates}; }

export function auditScenekunstPhase3({writeReport=false,checkReport=true}={}){
  const CORE=loadCore(); const categories=json(P.categories); const manifest=json(P.manifest); const portal=json(P.portal); const inventory=json(P.inventory); const status=json(P.status); const registry=json(P.registry); const badge=json(P.badge); const readiness=json(P.readiness);
  const portalEntry=portal.categories.find((r)=>r.id==='scenekunst'); const inventoryEntry=inventory.subjects.find((r)=>r.id==='scenekunst'); const statusEntry=status.subjects.find((r)=>r.id==='scenekunst'); const manifestEntry=manifest.scenekunst;
  assert(categories.fagSubjects.includes('scenekunst'),'Scenekunst mangler i canonical fagliste'); assert(categories.aliases?.teater==='scenekunst','Teater-alias feil');
  assert(portalEntry?.subjectStatus==='materialized','Scenekunst ikke materialized'); assert(portalEntry?.badgePage===BADGE_TARGET,'Scenekunst badgePage skal være integrert Progresjon'); assert(inventoryEntry?.schemaFamily==='foundation_v1','Schemafamilien skal bevare foundation_v1-kompatibilitet');
  assert(statusEntry?.assessmentStatus==='audited','Scenekunst har feil auditstatus'); assert(['structure_ready','chapters_in_progress','complete'].includes(statusEntry?.editorialStatus),'Scenekunst har ugyldig redaksjonell progresjon'); if(statusEntry.editorialStatus==='complete') assert(statusEntry.nextGate==='maintenance_source_refresh_and_place_case_expansion','Complete Scenekunst har feil vedlikeholdsport');
  const source={}; for(const field of ['pensum','emner','fagkart','methods']){ const rp=CORE.resolveManifestPointer(manifestEntry[field]); source[field==='emner'?'emners':field]=json(rp); }
  const model=CORE.normalizeSubject({subjectId:'scenekunst',categoryLabel:categories.labels.scenekunst,categoryDescription:categories.decisions?.scenekunst,schemaFamily:inventoryEntry.schemaFamily,manifestEntry,portalEntry,inventoryEntry,statusEntry,registry,badge,source});
  assert(model.subject.routes.badge===BADGE_TARGET,'Scenekunst-modellen bruker ikke integrert Progresjon som badgerute'); assert(model.subject.routes.badge!==model.subject.routes.subject,'Badge- og fagsiderute må fortsatt ha ulike mål');
  assert(sameList(model.domains.map((d)=>d.id),DOMAIN_ORDER),'Renderer-fagområdene er endret'); assert(model.summary.domainCount===4,'Scenekunst skal ha fire renderer-fagområder');
  assert(model.summary.emneCount===20,'Post-reconciliation Scenekunst skal ha 20 emner'); assert(model.summary.methodCount===14,'Post-reconciliation Scenekunst skal ha 14 metoder'); assert(model.summary.mappingCount===20,'Scenekunst skal ha én normalisert mapping per emne'); assert(model.summary.hookCount===0,'Foundation-adapteren skal fortsatt ikke syntetisere hooks'); assert([0,4].includes(model.chapters.length),'Phase-3-preservation tillater bare null pre-production eller fire completion-kapitler');
  assert(source.pensum.modules.length===5,'Scenekunst skal ha fem progresjonsmoduler etter breadth-reconciliation'); assert(source.emners.every((e)=>e.status==='active'),'Inaktive emner i aktiv pakke'); assert(source.methods.methods.every((m)=>m.canonical_status==='canonical'),'Ikke-canonical metode i aktiv pakke');
  const emneIds=new Set(source.emners.map((r)=>r.emne_id)); const methodIds=new Set(source.methods.methods.map((r)=>r.method_id)); FOUNDATION_EMNES.forEach((id)=>assert(emneIds.has(id),`Foundation-emne mistet: ${id}`)); FOUNDATION_METHODS.forEach((id)=>assert(methodIds.has(id),`Foundation-metode mistet: ${id}`));
  assert(model.emners.every((e)=>e.methodIds.length>=3),'Alle post-reconciliation-emner skal ha minst tre løste metodekoblinger');
  const fg=source.fagkart.categories.flatMap((d)=>d.emne_ids||[]); const course=source.pensum.modules.flatMap((m)=>m.emner||[]); assert(fg.length===20&&new Set(fg).size===20&&fg.every((id)=>emneIds.has(id)),'Fagkartet eier ikke alle emner nøyaktig én gang'); assert(course.length===20&&new Set(course).size===20&&course.every((id)=>emneIds.has(id)),'Pensum dekker ikke alle emner nøyaktig én gang');
  assert(readiness.status==='breadth_inventory_reconciled_chapter_production_pending'&&readiness.complete_ready===false,'Readiness er ikke reconcilet uten falsk completion');
  for(const key of ['source_first','forestilling_or_institution_anchor_required','live_performance_is_primary','cross_domain_links_use_secondary_badges']) assert(source.fagkart.principles?.[key]===true,`Mangler prinsipp ${key}`);

  const compatibility=read(P.badgePage); const archive=read(P.badgeArchive);
  assert(compatibility.includes('location.replace')&&compatibility.includes(RELATIVE_BADGE_TARGET),'Scenekunst compatibility-URL redirecter ikke til Progresjon');
  assert(!/Teater, dans, musikal, revy|scenografi, regi, dramaturgi/i.test(compatibility),'Scenekunst compatibility-wrapperen bærer fortsatt gammel fagtekst');
  assert(archive.includes('../../../fagverk.html?subject=scenekunst')&&archive.includes('../../../fagverk-forside.html'),'Scenekunst-arkivet bevarer ikke den opprinnelige stub-navigasjonen');
  assert(/Teater, dans, musikal, revy, standup, improvisasjon, scenografi, regi, dramaturgi og levende fremføring\./.test(archive),'Scenekunst-arkivet bevarer ikke original stub-beskrivelse');

  const report={schema:'history_go_fagverk_scenekunst_phase3_audit_v1',version:'1.3.0',status:'scenekunst_phase_3_foundation_preserved_through_completion',generatedFrom:P,subject:{id:model.subject.id,title:model.subject.title,schemaFamily:model.subject.schemaFamily,adapter:model.subject.adapter,navigationStatus:model.subject.status.navigation,assessmentStatus:model.subject.status.assessment,editorialStatus:model.subject.status.editorial,nextGate:statusEntry.nextGate,subjectPage:model.subject.routes.subject,badgePage:model.subject.routes.badge},summary:{domainCount:4,emneCount:20,methodCount:14,mappingCount:20,hookCount:0,courseModuleCount:5,registeredChapterCount:model.chapters.length},canonicalDomainOrder:DOMAIN_ORDER,domainEmneCounts:Object.fromEntries(model.domains.map((d)=>[d.id,d.emneIds.length])),gates:{manifestFirstSourcesResolved:true,foundationAdapterExercised:true,foundationIdsPreserved:true,fagkartOwnsRendererDomains:true,courseModulesRemainProgressionOnly:true,allActiveEmnersMapped:true,allCourseModulesCoverCanonicalEmners:true,allMethodReferencesResolved:true,livePerformancePrinciplesLocked:true,badgeAndSubjectRoutesDistinct:true,badgeCompatibilityRedirectAndArchivePreserved:true,assessmentStatusAudited:true,editorialStatusProgressionValid:true,breadthInventoryReconciled:true,chapterClaimsNotOverstated:true}};
  const committed=projection(report); if(writeReport){fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true});fs.writeFileSync(abs(P.report),`${JSON.stringify(committed,null,2)}\n`);} if(checkReport) assert(isDeepStrictEqual(json(P.report),committed),`${P.report} er utdatert`); return {report,model};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{const {report}=auditScenekunstPhase3({writeReport:process.argv.includes('--write-report'),checkReport:!process.argv.includes('--no-check-report')});console.log(`Scenekunst Phase 3 OK: ${report.summary.domainCount} fagområder, ${report.summary.emneCount} emner, ${report.summary.methodCount} metoder.`);}catch(error){console.error(`Scenekunst Fase 3 FEIL: ${error.message}`);process.exitCode=1;}}
