#!/usr/bin/env node
// Re-add the Villa Furulund entries after merging the latest main, retaining other projects.
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const write=(p,j)=>fs.writeFileSync(p,JSON.stringify(j,null,2)+"\n");
const fag="data/fag/fag_manifest.json",fagReg="data/fagverk/fagverk_registry.json";
const quiz="data/quiz/manifest.json",card="data/quizcards/kunst/manifest.json";
const f=read(fag);
f.kunst.quizProduction.targets.villa_furulund={
 source_brief:"../quiz/production_briefs/kunst/villa_furulund.json",
 context_artifact:"../quiz/production_context/kunst/villa_furulund.json",
 quiz_file:"../quiz/kunst/villa_furulund_sets.json"
};
write(fag,f);
const r=read(fagReg);
r.placeLinks.villa_furulund={sourceFile:"places/kunst/oslo/places_kunst_oslo_kultureiendommer_batch_05/villa_furulund.json",field:"fagverk",schema:"history_go_place_fagverk_v2",level:"standard",status:"curated"};
const v=String(r.version||"3.17.0").split(".").map(Number);
if(v[0]===3 && v[1]===17 && v[2]<8)r.version="3.17.8";
r.updatedAt="2026-10-27";write(fagReg,r);
const q=read(quiz);
q.sets=q.sets.filter(x=>x.targetId!=="villa_furulund");
for(let i=1;i<=3;i++)q.sets.push({targetId:"villa_furulund",file:"data/quiz/kunst/villa_furulund_sets.json",set_id:"kunst_villa_furulund_set_"+i,order:i});
write(quiz,q);
const c=read(card);
if(!c.collections.includes("villa_furulund_quizcard_v1.json"))c.collections.push("villa_furulund_quizcard_v1.json");
write(card,c);
console.log("Reconciled Villa Furulund registrations, preserving all other entries.");
