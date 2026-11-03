#!/usr/bin/env node
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8")),save=(p,j)=>fs.writeFileSync(p,JSON.stringify(j,null,2)+"\n");
const a=read("data/fag/fag_manifest.json");
a.by.quizProduction.targets.vika_kino={source_brief:"../quiz/production_briefs/by/vika_kino.json",context_artifact:"../quiz/production_context/by/vika_kino.json",quiz_file:"../quiz/by/vika_kino_sets.json"};save("data/fag/fag_manifest.json",a);
const r=read("data/fagverk/fagverk_registry.json");r.placeLinks.vika_kino={sourceFile:"places/film/oslo/places/vika_kino.json",field:"fagverk",schema:"history_go_place_fagverk_v2",level:"standard",status:"curated"};
const v=String(r.version||"3.17.0").split(".").map(Number);
if(v[0]===3&&v[1]===17&&v[2]<10)r.version="3.17.10";r.updatedAt="2026-10-27";save("data/fagverk/fagverk_registry.json",r);
const q=read("data/quiz/manifest.json");q.sets=q.sets.filter(s=>s.targetId!=="vika_kino");for(let i=1;i<=3;i++)q.sets.push({targetId:"vika_kino",file:"data/quiz/by/vika_kino_sets.json",set_id:"by_vika_kino_set_"+i,order:i});save("data/quiz/manifest.json",q);
const c=read("data/quizcards/by/manifest.json");if(!c.collections.includes("vika_kino_quizcard_v1.json"))c.collections.push("vika_kino_quizcard_v1.json");save("data/quizcards/by/manifest.json",c);
console.log("Vika kino registers reconciled.");
