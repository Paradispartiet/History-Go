#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const abs=(p)=>path.join(ROOT,p); const json=(p)=>JSON.parse(fs.readFileSync(abs(p),'utf8')); const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const exists=(p)=>fs.existsSync(abs(p)); const unique=(xs)=>new Set(xs).size===xs.length;
const norm=(s)=>String(s||'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9æøå]+/g,' ').trim();
const tokens=(s)=>new Set(norm(s).split(/\s+/).filter((w)=>w.length>3));
const jaccard=(a,b)=>{const A=tokens(a),B=tokens(b);let inter=0;for(const x of A)if(B.has(x))inter++;const union=new Set([...A,...B]).size;return union?inter/union:0;};
const P={registry:'data/fagverk/fagverk_registry.json',status:'data/fagverk/subject_status.json',emner:'data/fag/scenekunst/emner_scenekunst_canonical_v1.json',methods:'data/fag/scenekunst/methods_scenekunst_canonical_v1.json',fagkart:'data/fag/scenekunst/fagkart_scenekunst_canonical_v1.json',readiness:'data/fag/scenekunst/scenekunst_university_readiness_v1.json',quality:'data/fag/scenekunst/scenekunst_holistic_quality_review_v1.json',report:'reports/fagverk/scenekunst-completion-audit.json'};

export function auditScenekunstCompletion({writeReport=false,checkReport=true,contentOnly=false}={}){
 const registry=json(P.registry), status=json(P.status), emners=json(P.emner), methods=json(P.methods), fagkart=json(P.fagkart), readiness=json(P.readiness), quality=json(P.quality);
 const subject=registry.subjects?.scenekunst; assert(subject,'Scenekunst mangler i registry'); const chapters=subject.chapters||[];
 assert(chapters.length===4 && unique(chapters.map(c=>c.id)) && unique(chapters.map(c=>c.file)),'Scenekunst completion krever fire unike registrerte kapitler');
 const canonicalIds=emners.map(e=>e.emne_id), owned=chapters.flatMap(c=>c.emne_ids||[]);
 assert(canonicalIds.length===20&&unique(canonicalIds),'Canonical inventar skal ha 20 unike emner'); assert(owned.length===20&&unique(owned)&&canonicalIds.every(id=>owned.includes(id)),'20/20 canonicale emner skal eies nøyaktig én gang');
 const expectedDomains=Object.fromEntries(fagkart.categories.map(c=>[c.id,c.emne_ids]));
 for(const ch of chapters){assert(expectedDomains[ch.primary_domain_id],`Ukjent domain ${ch.primary_domain_id}`);assert(JSON.stringify(ch.emne_ids)===JSON.stringify(expectedDomains[ch.primary_domain_id]),`Kapittel ${ch.id} følger ikke fagkartets canonicale eierskap`);}
 const methodIds=methods.methods.map(m=>m.method_id); assert(methodIds.length===14&&unique(methodIds)&&methods.methods.every(m=>m.canonical_status==='canonical'),'Metodeinventar er ikke 14 canonicale metoder');
 const usedMethods=new Set(), allClaims=[], allParagraphs=[], allSectionIds=[], allSources=[]; let paragraphCount=0, sectionCount=0;
 for(const ch of chapters){
   assert(exists(ch.file),`Mangler kapittelrot ${ch.file}`); const root=json(ch.file); assert(root.schema==='history_go_fagverk_chapter_v1'&&root.subject_id==='scenekunst'&&root.claimTraceRequired===true,`Ugyldig kapittelkontrakt ${ch.id}`); assert(root.editorialStatus==='chapter_ready',`${ch.id} er ikke chapter_ready`);
   assert(root.moduleFiles?.length>=1&&root.claimsFile&&root.briefFile,`${ch.id} mangler module/claims/brief`); root.method_ids.forEach(id=>usedMethods.add(id));
   assert((root.neighborBoundaries||[]).length>=5,`${ch.id} mangler nabofaggrenser`);
   const claimsDoc=json(root.claimsFile); assert(claimsDoc.schema==='history_go_fagverk_chapter_claims_v1'&&claimsDoc.chapter_id===ch.id,`Claims-kontrakt feil ${ch.id}`);
   const claimMap=new Map(claimsDoc.claims.map(c=>[c.id,c])); const sourceMap=new Map(claimsDoc.sources.map(s=>[s.id,s]));
   assert(unique([...claimMap.keys()]),`Duplikatclaim i ${ch.id}`); assert(unique([...sourceMap.keys()]),`Duplikatkilde i ${ch.id}`);
   for(const s of claimsDoc.sources){assert(/^https:\/\//.test(s.url)&&s.publisher?.length>=3&&s.source_location?.length>=30,`Kilde mangler inspectable locator: ${s.id}`); allSources.push(s);}
   for(const c of claimsDoc.claims){assert(c.status==='verified'&&c.source_ids?.length>=1&&c.source_ids.every(id=>sourceMap.has(id)),`Claim er ikke verifisert/kildebundet: ${c.id}`);assert(c.evidence_note?.length>=80,`Claim mangler evidensnotat: ${c.id}`);allClaims.push(c);}
   for(const modPath of root.moduleFiles){assert(exists(modPath),`Mangler modul ${modPath}`); const mod=json(modPath); assert(mod.chapter_id===ch.id&&Array.isArray(mod.sections),`Modulkontrakt feil ${modPath}`);
     for(const sec of mod.sections){sectionCount++;allSectionIds.push(sec.id);assert(sec.emne_id&&canonicalIds.includes(sec.emne_id),`Seksjon mangler canonical emne ${sec.id}`);assert(sec.paragraphs?.length===3&&sec.paragraphClaimIds?.length===3,`${sec.id} skal ha tre claimsporede fagavsnitt`);assert(new Set(sec.method_ids||[]).size>0&&sec.method_ids.every(id=>methodIds.includes(id)),`${sec.id} har ugyldig metodebruk`);sec.method_ids.forEach(id=>usedMethods.add(id));
       const joined=sec.paragraphs.join(' ');assert(joined.length>=1200,`${sec.emne_id} har for lite substansiell tekst`);
       sec.paragraphs.forEach((p,i)=>{paragraphCount++;allParagraphs.push({section:sec.id,text:p});assert(p.length>=300,`For kort fagavsnitt ${sec.id}#${i+1}`);const ids=sec.paragraphClaimIds[i];assert(Array.isArray(ids)&&ids.length>=1&&ids.every(id=>claimMap.has(id)),`Ufullstendig paragraph→claim i ${sec.id}#${i+1}`);ids.forEach(id=>{const c=claimMap.get(id);assert(c.used_in?.includes(sec.id),`Claim ${id} mangler reciprocal used_in ${sec.id}`);});});
     }
   }
 }
 assert(sectionCount===20&&paragraphCount===60&&unique(allSectionIds),'Completion skal ha 20 unike emneseksjoner og 60 fagavsnitt'); assert(allClaims.length===60&&unique(allClaims.map(c=>c.id)),'Completion skal ha 60 globalt unike claims');
 assert(methodIds.every(id=>usedMethods.has(id)),`Ikke alle canonicale metoder er faglig brukt: ${methodIds.filter(id=>!usedMethods.has(id)).join(', ')}`);
 const paragraphNorms=allParagraphs.map(x=>norm(x.text)); assert(unique(paragraphNorms),'Duplikate fagavsnitt funnet');
 for(let i=0;i<allParagraphs.length;i++)for(let j=i+1;j<allParagraphs.length;j++){const sim=jaccard(allParagraphs[i].text,allParagraphs[j].text);assert(sim<0.72,`For mal-likt avsnitt (${sim.toFixed(2)}): ${allParagraphs[i].section} / ${allParagraphs[j].section}`);}
 const allText=allParagraphs.map(x=>x.text).join('\n');
 for(const phrase of ['opptak erstatter ikke','arkiv','Besøkstall måler oppmøte','kunstnerisk kvalitet','samtykke','universell utforming','representasjon','Film & TV','Musikk']) assert(allText.includes(phrase),`Mangler eksplisitt completion-begrensning/grense: ${phrase}`);
 assert((readiness.neighbor_boundaries||[]).length===5,'Readiness skal bevare fem nabofaggrenser'); for(const nb of readiness.neighbor_boundaries){assert(chapters.some(c=>json(c.file).neighborBoundaries.some(x=>x.neighbor===nb.neighbor)),`Nabofaggrense ikke materialisert: ${nb.neighbor}`);}
 assert(quality.schema==='history_go_fagverk_scenekunst_holistic_quality_review_v1'&&quality.dimensions?.length===6,'Mangler seksdimensjonal kvalitetsreview'); const scores=quality.dimensions.map(d=>d.score); assert(scores.every(s=>s>=4)&&scores.reduce((a,b)=>a+b,0)>=27&&quality.total===scores.reduce((a,b)=>a+b,0),'Kvalitetsreview må være minst 27/30 og ingen dimensjon under 4');
 if(!contentOnly){const se=status.subjects.find(s=>s.id==='scenekunst');assert(se?.navigationStatus==='materialized'&&se?.assessmentStatus==='audited'&&se?.editorialStatus==='complete','Scenekunst kan ikke være complete før holistisk innhold er grønt');assert(se.nextGate==='maintenance_source_refresh_and_place_case_expansion','Complete status har feil neste port');}
 const report={schema:'history_go_fagverk_scenekunst_completion_audit_v1',version:'1.0.0',status:contentOnly?'content_ready_for_status_promotion':'complete',subject:'scenekunst',summary:{domainCount:4,chapterCount:4,canonicalEmneCount:20,ownedEmneCount:20,methodCount:14,usedMethodCount:usedMethods.size,sectionCount,paragraphCount,claimCount:allClaims.length,sourceRegistrationCount:allSources.length,qualityScore:quality.total},domainOwnership:Object.fromEntries(chapters.map(c=>[c.primary_domain_id,c.emne_ids.length])),gates:{exactCanonicalOwnership:true,noDuplicateOwnership:true,allCanonicalMethodsUsed:true,paragraphClaimTraceComplete:true,allClaimsVerified:true,allSourcesInspectable:true,substantialIndependentText:true,noDuplicateOrGenericTemplates:true,neighborBoundariesPreserved:true,archiveStatisticsReceptionLimitsExplicit:true,ethicsRepresentationAccessibilitySubstantive:true,qualityReviewGreen:true,statusComplete:!contentOnly}};
 if(writeReport){fs.mkdirSync(path.dirname(abs(P.report)),{recursive:true});fs.writeFileSync(abs(P.report),`${JSON.stringify(report,null,2)}\n`);} if(checkReport&&!contentOnly){assert(exists(P.report),`${P.report} mangler`);assert(JSON.stringify(json(P.report))===JSON.stringify(report),`${P.report} er utdatert`);} return report;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){const args=new Set(process.argv.slice(2));try{const r=auditScenekunstCompletion({writeReport:args.has('--write-report'),checkReport:!args.has('--no-check-report')&&!args.has('--content-only'),contentOnly:args.has('--content-only')});console.log(`Scenekunst completion OK: ${r.summary.chapterCount} kapitler / ${r.summary.canonicalEmneCount} emner / ${r.summary.paragraphCount} fagavsnitt / ${r.summary.methodCount} metoder.`);}catch(e){console.error(`Scenekunst completion FEIL: ${e.message}`);process.exitCode=1;}}
