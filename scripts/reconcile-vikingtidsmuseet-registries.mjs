#!/usr/bin/env node
// Restore Vikingtidsmuseet entries after merging latest main without losing unrelated registrations.
import fs from "node:fs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8")),save=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2)+"\n");
const fm="data/fag/fag_manifest.json",reg="data/fagverk/fagverk_registry.json",qm="data/quiz/manifest.json",cm="data/quizcards/historie/manifest.json";
const a=read(fm);a.historie.quizProduction.targets.vikingtidsmuseet={source_brief:"../quiz/production_briefs/historie/vikingtidsmuseet.json",context_artifact:"../quiz/production_context/historie/vikingtidsmuseet.json",quiz_file:"../quiz/historie/vikingtidsmuseet_sets.json"};save(fm,a);
const r=read(reg);r.placeLinks.vikingtidsmuseet={sourceFile:"places/historie/oslo/places_historie/vikingtidsmuseet.json",field:"fagverk",schema:"history_go_place_fagverk_v2",level:"standard",status:"curated"};
const v=String(r.version||"3.17.0").split(".").map(Number);if(v[0]===3&&v[1]===17&&v[2]<9)r.version="3.17.9";r.updatedAt="2026-10-27";save(reg,r);
const q=read(qm);q.sets=q.sets.filter(x=>x.targetId!=="vikingtidsmuseet");for(let i=1;i<=3;i++)q.sets.push({targetId:"vikingtidsmuseet",file:"data/quiz/historie/vikingtidsmuseet_sets.json",set_id:"historie_vikingtidsmuseet_set_"+i,order:i});save(qm,q);
const c=read(cm);if(!c.collections.includes("vikingtidsmuseet_quizcard_v1.json"))c.collections.push("vikingtidsmuseet_quizcard_v1.json");save(cm,c);
console.log("Vikingtidsmuseet registration reconciliation complete.");
