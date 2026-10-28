#!/usr/bin/env node
import fs from "node:fs";
const qPath="data/quiz/subkultur/vaterland_bar_scene_sets.json",cPath="data/quizcards/subkultur/vaterland_bar_scene_quizcard_v1.json";
const q=JSON.parse(fs.readFileSync(qPath,"utf8")),c=JSON.parse(fs.readFileSync(cPath,"utf8"));
const questions=q.sets.flatMap(s=>s.questions), byId=new Map(questions.map(q=>[q.id,q]));
if(q.sets.length!==3||q.sets.some(s=>s.questions.length!==7))throw Error("21 questions required");
if(c.cards[0].questions.length!==10)throw Error("10 QuizCard questions required");
for(const qc of c.cards[0].questions){
 const orig=byId.get(qc.sourceQuestionId);
 if(!orig||!orig.primary_knowledge_unit_id||!orig.knowledge_unit_ids?.length||orig.knowledge_link_status!=="linked")throw Error("Knowledge missing: "+qc.id);
 for(const f of ["question","answer","answerIndex","options","knowledge","quiz_id"])if(JSON.stringify(qc[f])!==JSON.stringify(orig[f]))throw Error("QuizCard parity "+qc.id+" "+f);
 qc.primary_knowledge_unit_id=orig.primary_knowledge_unit_id;qc.knowledge_unit_ids=[...orig.knowledge_unit_ids];qc.knowledge_link_status="linked";
}
c.production_status="knowledge_linked";fs.writeFileSync(cPath,JSON.stringify(c,null,2)+"\n");
console.log("Vaterland Bar & Scene: 10/10 QuizCard canonical Knowledge bindings synchronized");
