#!/usr/bin/env node
import fs from "node:fs";
const quizPath="data/quiz/kunst/villa_furulund_sets.json";
const cardPath="data/quizcards/kunst/villa_furulund_quizcard_v1.json";
const quiz=JSON.parse(fs.readFileSync(quizPath,"utf8"));
const card=JSON.parse(fs.readFileSync(cardPath,"utf8"));
const all=quiz.sets.flatMap(s=>s.questions);
if(quiz.sets.length!==3||quiz.sets.some(s=>s.questions.length!==7))throw new Error("Expected 21 quiz questions");
const byId=new Map(all.map(q=>[q.id,q]));
const chosen=card.cards.flatMap(c=>c.questions);
if(chosen.length!==10)throw new Error("Expected ten QuizCard questions");
for(const q of chosen){
 const source=byId.get(q.sourceQuestionId);
 if(!source||!source.primary_knowledge_unit_id||!source.knowledge_unit_ids?.length||source.knowledge_link_status!=="linked")throw new Error("Missing linked source "+q.sourceQuestionId);
 for(const key of ["question","answer","answerIndex","options","knowledge","quiz_id"])if(JSON.stringify(source[key])!==JSON.stringify(q[key]))throw new Error("QuizCard parity mismatch "+q.sourceQuestionId+" "+key);
 q.primary_knowledge_unit_id=source.primary_knowledge_unit_id;
 q.knowledge_unit_ids=[...source.knowledge_unit_ids];
 q.knowledge_link_status="linked";
}
card.production_status="knowledge_linked";
fs.writeFileSync(cardPath,JSON.stringify(card,null,2)+"\n");
console.log("Villa Furulund: synced canonical Knowledge for ten QuizCard questions.");
