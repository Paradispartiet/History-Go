#!/usr/bin/env node
import fs from "node:fs";
const quizPath = "data/quiz/historie/oslo_domkirke_sets.json";
const cardPath = "data/quizcards/historie/oslo_domkirke_quizkort_v1.json";
const quiz = JSON.parse(fs.readFileSync(quizPath,"utf8"));
const cards = JSON.parse(fs.readFileSync(cardPath,"utf8"));
const qs = quiz.sets.flatMap(set => set.questions);
const byId = new Map(qs.map(q => [q.id,q]));
const selected = cards.cards.flatMap(card => card.questions);
if(quiz.sets.length !== 3 || quiz.sets.some(s => s.questions.length !== 7))
 throw Error("Oslo domkirke requires 3 sets of 7 fullquiz questions");
if(selected.length !== 10)
 throw Error("Oslo domkirke requires ten QuizCard questions");
if(qs.some(q => q.knowledge_link_status !== "linked" || !q.primary_knowledge_unit_id || !q.knowledge_unit_ids?.length))
 throw Error("Fullquiz Knowledge is not fully generated");
for(const q of selected){
 const original=byId.get(q.sourceQuestionId);
 if(!original)throw Error("Missing QuizCard source "+q.sourceQuestionId);
 for(const [key,value] of Object.entries(original))q[key]=value;
 q.primary_knowledge_unit_id=original.primary_knowledge_unit_id;
 q.knowledge_unit_ids=[...original.knowledge_unit_ids];
 q.knowledge_link_status="linked";
}
cards.production_status="knowledge_linked_browser_review_pending";
fs.writeFileSync(cardPath,JSON.stringify(cards,null,2)+"\n");
console.log("Oslo domkirke: 21 fullquiz and 10 QuizCard questions share canonical Knowledge.");
