#!/usr/bin/env node
// Restore Vestre gravlund entries after merging latest main without losing unrelated registrations.
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8")),save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n");
const fm="data/fag/fag_manifest.json",reg="data/fagverk/fagverk_registry.json",qm="data/quiz/manifest.json",cm="data/quizcards/historie/manifest.json";
const a=read(fm);a.historie.quizProduction.targets.vestre_gravlund={source_brief:"../quiz/production_briefs/historie/vestre_gravlund.json",context_artifact:"../quiz/production_context/historie/vestre_gravlund.json",quiz_file:"../quiz/historie/vestre_gravlund_sets.json"};save(fm,a);
const r=read(reg);r.placeLinks.vestre_gravlund={sourceFile:"places/historie/oslo/places_historie/vestre_gravlund.json",field:"fagverk",schema:"history_go_place_fagverk_v2",level:"standard",status:"curated"};
const v=String(r.version||"3.17.0").split(".").map(Number);if(v[0]===3&&v[1]===17&&v[2]<12)r.version="3.17.12";r.updatedAt="2026-10-27";save(reg,r);
const q=read(qm);q.sets=q.sets.filter(x=>x.targetId!=="vestre_gravlund");for(let i=1;i<=3;i++)q.sets.push({targetId:"vestre_gravlund",file:"data/quiz/historie/vestre_gravlund_sets.json",set_id:"historie_vestre_gravlund_set_"+i,order:i});save(qm,q);
const c=read(cm);if(!c.collections.includes("vestre_gravlund_quizcard_v1.json"))c.collections.push("vestre_gravlund_quizcard_v1.json");save(cm,c);
console.log("Vestre gravlund registration reconciliation complete.");
