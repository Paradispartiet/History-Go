#!/usr/bin/env node
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8")),save=(p,j)=>fs.writeFileSync(p,JSON.stringify(j,null,2)+"\n");
const f=read("data/fag/fag_manifest.json");f.kunst.quizProduction.targets.vigelandmuseet={source_brief:"../quiz/production_briefs/kunst/vigelandmuseet.json",context_artifact:"../quiz/production_context/kunst/vigelandmuseet.json",quiz_file:"../quiz/kunst/vigelandmuseet_sets.json"};save("data/fag/fag_manifest.json",f);
const r=read("data/fagverk/fagverk_registry.json");r.placeLinks.vigelandmuseet={sourceFile:"places/kunst/oslo/places_kunst/vigelandmuseet.json",field:"fagverk",schema:"history_go_place_fagverk_v2",level:"standard",status:"curated"};
const v=String(r.version||"3.17.0").split(".").map(Number);if(v[0]===3&&v[1]===17&&v[2]<11)r.version="3.17.11";r.updatedAt="2026-10-27";save("data/fagverk/fagverk_registry.json",r);
const q=read("data/quiz/manifest.json");q.sets=q.sets.filter(e=>e.targetId!=="vigelandmuseet");for(let i=1;i<=3;i++)q.sets.push({targetId:"vigelandmuseet",file:"data/quiz/kunst/vigelandmuseet_sets.json",set_id:"kunst_vigelandmuseet_set_"+i,order:i});save("data/quiz/manifest.json",q);
const c=read("data/quizcards/kunst/manifest.json");if(!c.collections.includes("vigelandmuseet_quizcard_v1.json"))c.collections.push("vigelandmuseet_quizcard_v1.json");save("data/quizcards/kunst/manifest.json",c);
