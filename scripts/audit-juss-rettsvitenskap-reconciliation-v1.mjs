#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'); const read=f=>JSON.parse(fs.readFileSync(path.join(ROOT,f),'utf8')); const assert=(c,m)=>{if(!c)throw new Error(m)};
export function audit(){
 const category=read('data/categories/category_contract.json'), registry=read('data/fag/politikk/juss_rettsvitenskap/production_registry_v1.json'), ci=read('.github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json'), report=read('reports/fagverk/juss-rettsvitenskap-reconciliation-v1.json'), brief=read('data/fag/politikk/juss_rettsvitenskap/legal_method_sources_interpretation_argumentation_source_claim_brief_v1.json');
 const sub=category.canonicalSubcategories?.politikk?.find(r=>r.id==='juss_rettsvitenskap');
 assert(sub?.status==='expansion_planned','Juss skal forbli expansion_planned før strict completion');
 assert(registry.owner_subject_id==='politikk'&&registry.canonical_subcategory_id==='juss_rettsvitenskap','Registry-eierskap er feil');
 assert(registry.progress.materializedDomains===0&&registry.progress.totalDomains===12&&registry.progress.strictCompletionProven===false&&registry.materialized.length===0,'Juss skal starte 0/12 uten materialiserte felt');
 assert(registry.next_gate==='legal_method_sources_interpretation_argumentation_fulltext','Neste gate må være Felt 1 fulltekst');
 assert(ci.subject==='juss_rettsvitenskap'&&ci.ownerSubject==='politikk'&&ci.domains.length===12&&ci.domains.every((r,i)=>r.ordinal===i+1)&&new Set(ci.domains.map(r=>r.domainId)).size===12,'CI-register må dekke 12 unike Juss-felt');
 assert(report.production_plan.materialized===0&&report.production_plan.source_first_ready===1&&report.production_plan.next_domain===ci.domains[0].domainId&&report.production_plan.strict_completion_proven===false,'Reconciliation-fremdrift er feil');
 assert(report.domains.length===12&&report.domains.every((r,i)=>r.ordinal===i+1&&r.domain_id===ci.domains[i].domainId),'Reconciliation og CI-rekkefølge avviker');
 assert(report.domains.filter(r=>r.classification==='reuse_with_expansion').length===1&&report.domains.filter(r=>r.classification==='new_production_required').length===11,'Juss reconciliation skal ha 1 reuse_with_expansion + 11 nyproduksjon');
 assert(report.move_decision?.move_existing_files?.length===0,'Eksisterende Politikk-eierfiler skal ikke flyttes');
 assert(report.findings.some(r=>r.path.includes('rett_lov_rettssikkerhet')&&r.classification==='reuse_with_expansion'),'Eksisterende rett/lov/rettssikkerhet-spor må være eksplisitt gjenbruksbro');
 assert(report.findings.some(r=>r.path.includes('methods_politikk')&&r.classification==='secondary_link'),'Politikk-metoder må være secondary support');
 assert(report.prohibited_actions.some(s=>/lovforslag/u.test(s))&&report.prohibited_actions.some(s=>/juridisk rådgivning/u.test(s)),'Juridiske sikkerhets- og kildegrenser mangler');
 assert(brief.status==='source_first_ready_not_materialized'&&brief.domain.ordinal===1&&brief.domain.id===ci.domains[0].domainId,'Felt 1 source-first-binding er feil');
 return {status:'pass',domains:12,materialized:0,sourceFirstReady:1,strictCompletionProven:false,reuseWithExpansion:1,newProductionRequired:11,moveExisting:0,nextDomain:ci.domains[0].domainId};
}
try{const r=audit();console.log('Juss & rettsvitenskap reconciliation OK: '+r.materialized+'/'+r.domains+' materialisert, '+r.sourceFirstReady+' source-first klar.')}catch(e){console.error('Juss & rettsvitenskap reconciliation FEIL: '+e.message);process.exitCode=1;}
