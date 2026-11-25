#!/usr/bin/env node
// Build the sole source-exact Oset QuizCard from the reviewed active fullquiz.
import fs from 'node:fs';
import assert from 'node:assert/strict';

const quizPath='data/quiz/historie/frysjadammen_sets.json';
const cardPath='data/quizcards/historie/oset_slusebru_quizcard_v1.json';
const q=JSON.parse(fs.readFileSync(quizPath,'utf8'));
const questions=q.sets.flatMap(set=>set.questions);
assert.equal(questions.length,28);
const chosen=[0,1,3,5,8,10,14,19,24,27];
const byId=new Set();
const cards=chosen.map((index,i)=>{
 const original=questions[index];
 assert.equal(original.knowledge_link_status,'linked');
 assert.ok(original.knowledge_unit_ids.includes(original.primary_knowledge_unit_id));
 assert.ok(!byId.has(original.quiz_id));byId.add(original.quiz_id);
 return {...original,
  number:i+1,sourceQuestionId:original.id,sourceQuizId:original.quiz_id,
  sourceQuizFile:quizPath,source_refs:[...original.source_urls]
 };
});
const collection={
 collection_id:'oset_slusebru_quizcard_v1_20261117',
 categoryId:'historie',title:'Oset slusebru – vann, industri og byens forsyning',
 cardFormatRule:'single_surface_top10_with_answer_key',
 sourceBasis:'Nøyaktig gjenbruk av 10 kildekontrollerte spørsmål fra aktiv historie-fullquiz (28), inkludert fasiter og Knowledge.',
 production_status:'PR_source_reviewed_pending_V1_release',
 cards:[{
  card_id:'historie_quizkort_oset_slusebru_v1',categoryId:'historie',targetId:'frysjadammen',
  title:'Oset slusebru',subtitle:'Slusen, vannkraften og det nye vannverket',
  order:1,format:'single_surface_top10_with_answer_key',questionCount:10,questions:cards
 }]
};
const next=JSON.stringify(collection,null,2)+'\n';
if(process.argv.includes('--check')){
 assert.equal(fs.readFileSync(cardPath,'utf8'),next,'QuizCard not source-exact');
}else{
 fs.writeFileSync(cardPath,next);
}
console.log('Oset QuizCard: 10 questions and linked Knowledge verified from reviewed 4x7 source.');
