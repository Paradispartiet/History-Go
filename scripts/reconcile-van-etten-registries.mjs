#!/usr/bin/env node
// Restore Van Etten entries after merging latest main without losing unrelated registrations.
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8")),save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n");
const fm="data/fag/fag_manifest.json",reg="data/fagverk/fagverk_registry.json",qm="data/quiz/manifest.json",cm="data/quizcards/kunst/manifest.json";
const a=read(fm);a.kunst.quizProduction.targets.van_etten={source_brief:"../quiz/production_briefs/kunst/van_etten.json",context_artifact:"../quiz/production_context/kunst/van_etten.json",quiz_file:"../quiz/kunst/van_etten_sets.json"};save(fm,a);
const r=read(reg);r.placeLinks.van_etten={sourceFile:"places/kunst/oslo/places_kunst/van_etten.json",field:"fagverk",schema:"history_go_place_fagverk_v2",level:"standard",status:"curated"};
const v=String(r.version||"3.17.0").split(".").map(Number);if(v[0]===3&&v[1]===17&&v[2]<15)r.version="3.17.15";r.updatedAt="2026-10-28";save(reg,r);
const q=read(qm);q.sets=q.sets.filter(x=>x.targetId!=="van_etten");for(let i=1;i<=3;i++)q.sets.push({targetId:"van_etten",file:"data/quiz/kunst/van_etten_sets.json",set_id:"kunst_van_etten_set_"+i,order:i});save(qm,q);
const c=read(cm);if(!c.collections.includes("van_etten_quizcard_v1.json"))c.collections.push("van_etten_quizcard_v1.json");save(cm,c);
console.log("Van Etten registration reconciliation complete.");
