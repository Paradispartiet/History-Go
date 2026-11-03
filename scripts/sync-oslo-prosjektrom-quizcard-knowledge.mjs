#!/usr/bin/env node
// Keep the 10 QuizCard questions identical to the canonical fullquiz after Knowledge generation.
import fs from "node:fs";
const qp="data/quiz/kunst/oslo_prosjektrom_sets.json";
const cp="data/quizcards/kunst/oslo_prosjektrom_quizcard_v1.json";
const quiz=JSON.parse(fs.readFileSync(qp,"utf8"));
const cardData=JSON.parse(fs.readFileSync(cp,"utf8"));
const questions=quiz.sets.flatMap(set=>set.questions);
if(quiz.sets.length!==3||quiz.sets.some(set=>set.questions.length!==7)||questions.length!==21)
  throw Error("Oslo Prosjektrom requires 21 fullquiz questions (3 × 7).");
if(questions.some(q=>q.knowledge_link_status!=="linked"||!q.primary_knowledge_unit_id||!q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id)))
  throw Error("Oslo Prosjektrom fullquiz Knowledge is not fully linked.");
const cardQuestions=cardData.cards.flatMap(card=>card.questions);
if(cardQuestions.length!==10)throw Error("Oslo Prosjektrom QuizCard requires exactly 10 questions.");
const byId=new Map(questions.map(q=>[q.id,q]));
for(const cardQ of cardQuestions){
  const source=byId.get(cardQ.sourceQuestionId);
  if(!source||source.quiz_id!==cardQ.sourceQuizId)throw Error("Missing canonical source for "+cardQ.id);
  for(const key of ["id","quiz_id","question","options","answer","answerIndex","knowledge","explanation"]){
    if(JSON.stringify(cardQ[key])!==JSON.stringify(source[key]))throw Error("QuizCard mismatch: "+cardQ.id+" "+key);
  }
  for(const key of ["primary_knowledge_unit_id","knowledge_unit_ids","knowledge_link_status","knowledge_link_evidence","emne_ids","concept_ids","term_ids","story_ids"]){
    if(Object.hasOwn(source,key))cardQ[key]=source[key];
  }
}
cardData.production_status="knowledge_linked";
fs.writeFileSync(cp,JSON.stringify(cardData,null,2)+"\n");
console.log("Oslo Prosjektrom: 21/21 fullquiz and 10/10 QuizCard Knowledge links validated.");
