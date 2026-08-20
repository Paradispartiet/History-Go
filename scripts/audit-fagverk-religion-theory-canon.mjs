#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const exists=p=>fs.existsSync(path.join(ROOT,p));
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const P={canon:'data/fag/religion/theory_objects_religion_canonical_v1.json',readiness:'data/fag/religion/religion_university_readiness_v1.json',registry:'data/fag/religion/kilder_religion_canonical_v1.json',articles:'data/fagverk/religion/emneartikler'};
const SCHOLARLY_TYPE=/(peer_reviewed|scholarly|academic|monograph|book_chapter|edited_volume|research_encyclopedia|critical_edition)/i;
const nonTrivial=s=>typeof s==='string'&&s.trim().length>=140;
export function auditReligionTheoryCanon(){
 const canon=json(P.canon),readiness=json(P.readiness),registry=json(P.registry);const sourceByArea=new Map(),claimsByTopic=new Map();
 for(const file of registry.source_documents){
   const d=json(file);const areaSources=new Map((d.sources||[]).map(s=>[s.id,s]));sourceByArea.set(d.area_id,areaSources);
   for(const c of d.claims||[]){if(!claimsByTopic.has(c.topic_id))claimsByTopic.set(c.topic_id,[]);claimsByTopic.get(c.topic_id).push(c);}
 }
 const areaById=new Map(readiness.university_core_matrix.map(a=>[a.area_id,a]));const allTopics=new Set(readiness.university_core_matrix.flatMap(a=>a.current_anchors));const covered=new Set(),people=new Set(),works=new Set(),workTitleMismatches=[];
 const proseBindingByArea=new Map();const scholarlyTheorySources=new Set(),allTheorySources=new Set(),proseBoundTheorySources=new Set(),proseBoundClaims=new Set();let canonicalArticleCount=0,proseTheoryEntryCount=0,scholarlyCoreObjectCount=0;
 assert(canon.schema==='history_go_religion_theory_objects_v1'&&canon.status==='canonical','Ugyldig Religion theory canon');assert(canon.theory_objects.length===12,'Religion theory canon skal ha ett objekt per 12 universitetsområder');assert(/provenance, ikke trivia/.test(canon.production_rule),'Religion theory canon må blokkere navnetrivia');
 for(const area of readiness.university_core_matrix){
   const areaSources=sourceByArea.get(area.area_id);assert(areaSources,`Mangler source ledger for ${area.area_id}`);const bindings=new Map();
   for(const topicId of area.current_anchors){
     const articlePath=`${P.articles}/${topicId}.json`;assert(exists(articlePath),`Canonical Religion-artikkel mangler: ${articlePath}`);const article=json(articlePath);canonicalArticleCount++;
     assert(article.schema==='history_go_religion_topic_article_v1',`Ugyldig artikkelschema: ${topicId}`);assert(article.subject_id==='religion'&&article.area_id===area.area_id&&article.topic_id===topicId,`Artikkelidentitet mismatch: ${topicId}`);assert(article.article_status==='complete',`Religion-artikkel er ikke complete: ${topicId}`);assert(article.editorial_review?.status==='approved',`Religion-artikkel mangler approved editorial review: ${topicId}`);assert(article.quality_review?.status==='high_quality',`Religion-artikkel mangler high-quality review: ${topicId}`);
     const topicClaims=new Map((claimsByTopic.get(topicId)||[]).map(c=>[c.id,c]));assert(topicClaims.size>0,`Canonical emne mangler claims: ${topicId}`);
     const entries=article.theories_researchers_and_findings||[];assert(entries.length>0,`Canonical artikkel mangler theory prose: ${topicId}`);
     for(const entry of entries){
       proseTheoryEntryCount++;assert(nonTrivial(entry.content),`Theory prose er for kort/metadata-only: ${topicId}/${entry.title||'uten_tittel'}`);assert(entry.claim_ids?.length>0&&entry.source_ids?.length>0,`Theory prose mangler claim/source-binding: ${topicId}/${entry.title||'uten_tittel'}`);
       for(const claimId of entry.claim_ids){assert(topicClaims.has(claimId),`Theory prose peker til ukjent claim: ${topicId}/${claimId}`);}
       let supportedPairs=0;
       for(const sourceId of entry.source_ids){assert(areaSources.has(sourceId),`Theory prose peker til ukjent source: ${topicId}/${sourceId}`);const supporting=entry.claim_ids.filter(claimId=>(topicClaims.get(claimId)?.source_ids||[]).includes(sourceId));if(supporting.length>0){if(!bindings.has(sourceId))bindings.set(sourceId,new Set());for(const claimId of supporting){bindings.get(sourceId).add(claimId);proseBoundClaims.add(claimId);supportedPairs++;}}}
       assert(supportedPairs>0,`Theory prose mangler enhver claim-understøttet source-binding: ${topicId}/${entry.title||'uten_tittel'}`);
     }
   }
   proseBindingByArea.set(area.area_id,bindings);
 }
 assert(canonicalArticleCount===72,'Religion strict prose proof skal dekke 72/72 canonicale artikler');
 for(const t of canon.theory_objects){const area=areaById.get(t.area_id),areaSources=sourceByArea.get(t.area_id),proseBindings=proseBindingByArea.get(t.area_id);assert(area&&areaSources&&proseBindings,`Ukjent/manglende area-ledger ${t.area_id}`);assert(t.scope?.length>=100&&t.core_claim_or_mechanism?.length>=130&&t.evidence_or_observable_basis?.length>=90,`For tynt teoriobjekt ${t.id}`);assert(t.limitations?.length>=2&&t.rival_or_alternative?.length>=140,`Mangler begrensninger/rival ${t.id}`);assert(t.source_ids?.length>=4&&t.source_ids.every(id=>areaSources.has(id)),`Ugyldige area-kilder i ${t.id}`);assert(t.theorists?.length>=4,`For liten forskerbredde i ${t.id}`);assert(t.topic_ids?.length===6&&new Set(t.topic_ids).size===6,`${t.id} skal dekke seks unike emner`);assert(t.topic_ids.every(id=>area.current_anchors.includes(id)),`${t.id} bruker emne utenfor area`);assert(area.current_anchors.every(id=>t.topic_ids.includes(id)),`${t.id} dekker ikke hele area`);
   for(const id of t.topic_ids){covered.add(id);assert((claimsByTopic.get(id)||[]).length>=1,`Canonical emne mangler claims: ${id}`);}
   const areaClaimSources=new Set(t.topic_ids.flatMap(id=>(claimsByTopic.get(id)||[]).flatMap(c=>c.source_ids||[])));assert(t.source_ids.filter(id=>areaClaimSources.has(id)).length>=3,`${t.id} mangler claim-bundne teoriankre`);
   const scholarlyCore=t.source_ids.filter(sid=>SCHOLARLY_TYPE.test(areaSources.get(sid)?.type||''));assert(scholarlyCore.length>=3&&scholarlyCore.length>=Math.ceil(t.source_ids.length/2),`${t.id} mangler scholarly core; supplementer kan ikke være hovedgrunnlag`);scholarlyCoreObjectCount++;
   for(const sid of t.source_ids){const s=areaSources.get(sid);allTheorySources.add(sid);assert(s?.author&&s?.title&&s?.year&&s?.source_location,`Theory source mangler provenance: ${t.area_id}/${sid}`);if(SCHOLARLY_TYPE.test(s.type||''))scholarlyTheorySources.add(sid);assert((proseBindings.get(sid)||new Set()).size>0,`Theory source er ikke brukt i canonical theory prose: ${t.area_id}/${sid}`);proseBoundTheorySources.add(sid);}
   for(const p of t.theorists){assert(p.name&&p.source_ids?.length>=1&&p.works?.length>=1,`Forsker mangler provenance i ${t.id}`);people.add(p.name);for(const sid of p.source_ids){const s=areaSources.get(sid);assert(s,`Ukjent forskerkilde i ${t.area_id}: ${sid}`);assert(areaClaimSources.has(sid),`Forskerkilde er ikke brukt i area-claims: ${sid}`);assert(SCHOLARLY_TYPE.test(s.type||''),`Forskerkilde er ikke eksplisitt scholarly/peer-reviewed: ${t.area_id}/${sid}/${s.type||'uten_type'}`);assert((proseBindings.get(sid)||new Set()).size>0,`Forskerkilde er ikke brukt i canonical theory prose: ${t.area_id}/${p.name}/${sid}`);if(!p.works.includes(s.title))workTitleMismatches.push({area_id:t.area_id,theorist:p.name,source_id:sid,expected_title:s.title,registered_works:p.works});}p.works.forEach(w=>works.add(w));}
 }
 assert(workTitleMismatches.length===0,`Verk/provenance mismatch: ${JSON.stringify(workTitleMismatches)}`);
 assert(areaById.size===12&&sourceByArea.size===12&&allTopics.size===72&&covered.size===72&&[...allTopics].every(id=>covered.has(id)),'Religion theory canon skal dekke 12/12 områder og 72/72 emner');assert(people.size>=35,'Religion theory canon krever bred navngitt forskerkanon');assert(works.size>=35,'Religion theory canon krever bred verkkanon');assert(scholarlyCoreObjectCount===12,'Alle Religion theory objects skal ha scholarly core');assert(proseBoundTheorySources.size===allTheorySources.size,'Alle theory-object sources skal være brukt i canonical theory prose');
 return {status:'strong_theory_canon',areaCount:areaById.size,canonicalTopicCount:allTopics.size,coveredTopicCount:covered.size,theoryObjectCount:canon.theory_objects.length,uniquePeopleCount:people.size,uniqueWorkCount:works.size,canonicalArticleCount,proseTheoryEntryCount,theorySourceCount:allTheorySources.size,scholarlyTheorySourceCount:scholarlyTheorySources.size,supplementalTheorySourceCount:allTheorySources.size-scholarlyTheorySources.size,scholarlyCoreObjectCount,proseBoundTheorySourceCount:proseBoundTheorySources.size,proseBoundClaimCount:proseBoundClaims.size};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(auditReligionTheoryCanon(),null,2));}catch(e){console.error(`Religion theory canon FEIL: ${e.message}`);process.exitCode=1;}}
