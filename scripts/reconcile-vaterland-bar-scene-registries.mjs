#!/usr/bin/env node
// Restore Vaterland Bar & Scene entries after merging latest main without losing unrelated registrations.
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8")),save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n");
const fm="data/fag/fag_manifest.json",reg="data/fagverk/fagverk_registry.json",qm="data/quiz/manifest.json",cm="data/quizcards/subkultur/manifest.json";
const a=read(fm);a.subkultur.quizProduction.targets.vaterland_bar_scene={source_brief:"../quiz/production_briefs/subkultur/vaterland_bar_scene.json",context_artifact:"../quiz/production_context/subkultur/vaterland_bar_scene.json",quiz_file:"../quiz/subkultur/vaterland_bar_scene_sets.json"};save(fm,a);
const r=read(reg);r.placeLinks.vaterland_bar_scene={sourceFile:"places/subkultur/oslo/places_subkultur/vaterland_bar_scene.json",field:"fagverk",schema:"history_go_place_fagverk_v2",level:"standard",status:"curated"};
const v=String(r.version||"3.17.0").split(".").map(Number);if(v[0]===3&&v[1]===17&&v[2]<14)r.version="3.17.14";r.updatedAt="2026-10-27";save(reg,r);
const q=read(qm);q.sets=q.sets.filter(x=>x.targetId!=="vaterland_bar_scene");for(let i=1;i<=3;i++)q.sets.push({targetId:"vaterland_bar_scene",file:"data/quiz/subkultur/vaterland_bar_scene_sets.json",set_id:"subkultur_vaterland_bar_scene_set_"+i,order:i});save(qm,q);
const c=read(cm);if(!c.collections.includes("vaterland_bar_scene_quizcard_v1.json"))c.collections.push("vaterland_bar_scene_quizcard_v1.json");save(cm,c);
console.log("Vaterland Bar & Scene registration reconciliation complete.");
