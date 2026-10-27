#!/usr/bin/env node
// Restore Vega Scene entries after merging latest main without losing unrelated registrations.
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8")),save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n");
const fm="data/fag/fag_manifest.json",reg="data/fagverk/fagverk_registry.json",qm="data/quiz/manifest.json",cm="data/quizcards/scenekunst/manifest.json";
const a=read(fm);a.scenekunst.quizProduction.targets.vega_scene={source_brief:"../quiz/production_briefs/scenekunst/vega_scene.json",context_artifact:"../quiz/production_context/scenekunst/vega_scene.json",quiz_file:"../quiz/scenekunst/vega_scene_sets.json"};save(fm,a);
const r=read(reg);r.placeLinks.vega_scene={sourceFile:"places/scenekunst/oslo/vega_scene/vega_scene.json",field:"fagverk",schema:"history_go_place_fagverk_v2",level:"standard",status:"curated"};
const v=String(r.version||"3.17.0").split(".").map(Number);if(v[0]===3&&v[1]===17&&v[2]<13)r.version="3.17.13";r.updatedAt="2026-10-27";save(reg,r);
const q=read(qm);q.sets=q.sets.filter(x=>x.targetId!=="vega_scene");for(let i=1;i<=3;i++)q.sets.push({targetId:"vega_scene",file:"data/quiz/scenekunst/vega_scene_sets.json",set_id:"scenekunst_vega_scene_set_"+i,order:i});save(qm,q);
const c=read(cm);if(!c.collections.includes("vega_scene_quizcard_v1.json"))c.collections.push("vega_scene_quizcard_v1.json");save(cm,c);
console.log("Vega Scene registration reconciliation complete.");
