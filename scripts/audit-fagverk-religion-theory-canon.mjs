#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
const assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const P={canon:'data/fag/religion/theory_objects_religion_canonical_v1.json',readiness:'data/fag/religion/religion_university_readiness_v1.json',registry:'data/fag/religion/kilder_religion_canonical_v1.json'};
export function auditReligionTheoryCanon(){
 const canon=json(P.canon),readiness=json(P.readiness),registry=json(P.registry);const sourceById=new Map(),claimsByTopic=new Map();
 for(const file of registry.source_documents){const d=json(file);for(const s of d.sources||[])sourceById.set(s.id,s);for(const c of d.claims||[]){if(!claimsByTopic.has(c.topic_id))claimsByTopic.set(c.topic_id,[]);claimsByTopic.get(c.topic_id).push(c);}}
 const areaById=new Map(readiness.university_core_matrix.map(a=>[a.area_id,a]));const allTopics=new Set(readiness.university_core_matrix.flatMap(a=>a.current_anchors));const covered=new Set(),people=new Set(),works=new Set();
 assert(canon.schema==='history_go_religion_theory_objects_v1'&&canon.status==='canonical','Ugyldig Religion theory canon');assert(canon.theory_objects.length===12,'Religion theory canon skal ha ett objekt per 12 universitetsområder');assert(/provenance, ikke trivia/.test(canon.production_rule),'Religion theory canon må blokkere navnetrivia');
 for(const t of canon.theory_objects){const area=areaById.get(t.area_id);assert(area,`Ukjent area ${t.area_id}`);assert(t.scope?.length>=100&&t.core_claim_or_mechanism?.length>=130&&t.evidence_or_observable_basis?.length>=90,`For tynt teoriobjekt ${t.id}`);assert(t.limitations?.length>=2&&t.rival_or_alternative?.length>=140,`Mangler begrensninger/rival ${t.id}`);assert(t.source_ids?.length>=4&&t.source_ids.every(id=>sourceById.has(id)),`Ugyldige kilder i ${t.id}`);assert(t.theorists?.length>=4,`For liten forskerbredde i ${t.id}`);assert(t.topic_ids?.length===6&&new Set(t.topic_ids).size===6,`${t.id} skal dekke seks unike emner`);assert(t.topic_ids.every(id=>area.current_anchors.includes(id)),`${t.id} bruker emne utenfor area`);assert(area.current_anchors.every(id=>t.topic_ids.includes(id)),`${t.id} dekker ikke hele area`);
   for(const id of t.topic_ids){covered.add(id);assert((claimsByTopic.get(id)||[]).length>=1,`Canonical emne mangler claims: ${id}`);}
   const areaClaimSources=new Set(t.topic_ids.flatMap(id=>(claimsByTopic.get(id)||[]).flatMap(c=>c.source_ids||[])));assert(t.source_ids.filter(id=>areaClaimSources.has(id)).length>=3,`${t.id} mangler claim-bundne teoriankre`);
   for(const p of t.theorists){assert(p.name&&p.source_ids?.length>=1&&p.works?.length>=1,`Forsker mangler provenance i ${t.id}`);people.add(p.name);for(const sid of p.source_ids){const s=sourceById.get(sid);assert(s,`Ukjent forskerkilde ${sid}`);assert(areaClaimSources.has(sid),`Forskerkilde er ikke brukt i area-claims: ${sid}`);assert(p.works.includes(s.title),`Verk matcher ikke kildetittel for ${p.name}: ${s.title}`);}p.works.forEach(w=>works.add(w));}
 }
 assert(areaById.size===12&&allTopics.size===72&&covered.size===72&&[...allTopics].every(id=>covered.has(id)),'Religion theory canon skal dekke 12/12 områder og 72/72 emner');assert(people.size>=35,'Religion theory canon krever bred navngitt forskerkanon');assert(works.size>=35,'Religion theory canon krever bred verkkanon');
 return {status:'strong_theory_canon',areaCount:areaById.size,canonicalTopicCount:allTopics.size,coveredTopicCount:covered.size,theoryObjectCount:canon.theory_objects.length,uniquePeopleCount:people.size,uniqueWorkCount:works.size};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(auditReligionTheoryCanon(),null,2));}catch(e){console.error(`Religion theory canon FEIL: ${e.message}`);process.exitCode=1;}}
