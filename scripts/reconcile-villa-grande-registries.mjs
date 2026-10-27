#!/usr/bin/env node
// Idempotently retain Villa Grande alongside independently shipped Place/quiz work.
import fs from "node:fs";
const read = path => JSON.parse(fs.readFileSync(path, "utf8"));
const write = (path, value) => fs.writeFileSync(path, JSON.stringify(value, null, 2) + "\n");
const fag = "data/fag/fag_manifest.json";
const registry = "data/fagverk/fagverk_registry.json";
const quiz = "data/quiz/manifest.json";
const card = "data/quizcards/historie/manifest.json";
const f=read(fag);
f.historie.quizProduction.targets.villa_grande={
  source_brief:"../quiz/production_briefs/historie/villa_grande.json",
  context_artifact:"../quiz/production_context/historie/villa_grande.json",
  quiz_file:"../quiz/historie/villa_grande_sets.json"
};
write(fag,f);
const r=read(registry);
r.placeLinks.villa_grande={
  sourceFile:"places/historie/oslo/places_historie/villa_grande.json",
  field:"fagverk",schema:"history_go_place_fagverk_v2",
  level:"standard",status:"curated"
};
write(registry,r);
const q=read(quiz);
const entries=[1,2,3].map(order=>({
  targetId:"villa_grande",file:"data/quiz/historie/villa_grande_sets.json",
  set_id:"historie_villa_grande_set_"+order,order
}));
const oldIndex=q.sets.findIndex(item=>item.targetId==="villa_grande");
q.sets=q.sets.filter(item=>item.targetId!=="villa_grande");
q.sets.splice(oldIndex>=0?oldIndex:q.sets.length,0,...entries);
write(quiz,q);
const c=read(card);
if(!c.collections.includes("villa_grande_quizcard_v1.json")){
  c.collections.push("villa_grande_quizcard_v1.json");
}
write(card,c);
console.log("Villa Grande: shared registries synchronized without touching other target entries.");
