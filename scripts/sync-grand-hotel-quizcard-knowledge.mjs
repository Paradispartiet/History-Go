#!/usr/bin/env node
// QuizCard always reuses canonical fullquiz questions, including Knowledge links.
import fs from "node:fs";
const quizPath = "data/quiz/media/grand_hotel_sets.json";
const cardPath = "data/quizcards/media/grand_hotel_quizcard_v1.json";
const quiz = JSON.parse(fs.readFileSync(quizPath,"utf8"));
const cards = JSON.parse(fs.readFileSync(cardPath,"utf8"));
const questions = quiz.sets.flatMap(set => set.questions);
const byId = new Map(questions.map(q => [q.id,q]));
if(quiz.sets.length!==3 || quiz.sets.some(set=>set.questions.length!==7)) throw Error("Grand Hotel requires 3x7 fullquiz.");
if(questions.some(q=>q.knowledge_link_status!=="linked"||!q.primary_knowledge_unit_id||!q.knowledge_unit_ids?.length))
  throw Error("Grand Hotel fullquiz Knowledge generation not completed.");
const selected=cards.cards.flatMap(card=>card.questions);
if(selected.length!==10)throw Error("Grand Hotel QuizCard requires 10 questions.");
for(const q of selected){
  const source=byId.get(q.sourceQuestionId);
  if(!source)throw Error("Missing source question: "+q.sourceQuestionId);
  for(const [key,value] of Object.entries(source))q[key]=value;
  q.primary_knowledge_unit_id=source.primary_knowledge_unit_id;
  q.knowledge_unit_ids=[...source.knowledge_unit_ids];
  q.knowledge_link_status="linked";
}
cards.production_status="knowledge_linked";
fs.writeFileSync(cardPath,JSON.stringify(cards,null,2)+"\n");
console.log("Grand Hotel: 21/21 fullquiz and 10/10 QuizCard Knowledge linked.");
