#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const json=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8')), assert=(ok,msg)=>{if(!ok)throw new Error(msg);};
const P={canon:'data/fag/scenekunst/theory_objects_scenekunst_canonical_v1.json',emner:'data/fag/scenekunst/emner_scenekunst_canonical_v1.json',scholarly:'data/fag/scenekunst/scenekunst_scholarly_source_review_v1.json'};
export function auditScenekunstTheoryCanon(){
 const canon=json(P.canon),emner=json(P.emner),sch=json(P.scholarly);const ids=new Set(emner.map(e=>e.emne_id)),sources=new Set(sch.sources.map(s=>s.id)),covered=new Set(),people=new Set(),works=new Set();
 assert(canon.schema==='history_go_fagverk_scenekunst_theory_objects_v1'&&canon.status==='canonical','Ugyldig Scenekunst theory canon');assert(canon.theory_objects.length>=12,'Scenekunst krever minst 12 substansielle teoriobjekter');assert(/aldri en kunnskapstest/.test(canon.production_rule),'Theory canon må blokkere teoretikernavn som løs trivia');
 for(const t of canon.theory_objects){assert(t.id&&t.label&&t.scope?.length>=60&&t.core_claim_or_mechanism?.length>=80&&t.evidence_or_observable_basis?.length>=50,`For tynt teoriobjekt: ${t.id}`);assert(t.limitations?.length>=2&&t.rival_or_alternative?.length>=80,`Mangler begrensning/rival: ${t.id}`);assert(t.thinkers?.length>=1,`Mangler teoretiker/forsker: ${t.id}`);assert(t.scholarly_source_ids?.length>=1&&t.scholarly_source_ids.every(id=>sources.has(id)),`Ugyldig scholarly source i ${t.id}`);assert(t.emne_ids?.length>=1&&t.emne_ids.every(id=>ids.has(id)),`Ugyldig emne-binding i ${t.id}`);t.emne_ids.forEach(id=>covered.add(id));for(const p of t.thinkers){assert(p.name&&p.works?.length>=1,`Teoretiker mangler verk i ${t.id}`);people.add(p.name);p.works.forEach(w=>works.add(w));}}
 assert(ids.size===20&&covered.size===20&&[...ids].every(id=>covered.has(id)),'Theory canon skal dekke 20/20 canonicale Scenekunst-emner');assert(people.size>=12,'Scenekunst theory canon krever bredde av navngitte forskere/teoretikere');assert(works.size>=10,'Scenekunst theory canon krever sentrale verk/bidrag');
 return {status:'strong_theory_canon',theoryObjectCount:canon.theory_objects.length,canonicalEmneCount:ids.size,coveredEmneCount:covered.size,uniquePeopleCount:people.size,uniqueWorkCount:works.size};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{console.log(JSON.stringify(auditScenekunstTheoryCanon(),null,2));}catch(e){console.error(`Scenekunst theory canon FEIL: ${e.message}`);process.exitCode=1;}}
