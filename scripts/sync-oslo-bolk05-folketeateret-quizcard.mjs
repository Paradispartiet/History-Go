#!/usr/bin/env node
// One scoped Folketeateret quiz-to-QuizCard parity synchronizer.
// Leave quizcards manifest untouched until visual review of the finished card.
import fs from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
const quizFile='data/quiz/scenekunst/folketeateret_sets.json';
const cardFile='data/quizcards/scenekunst/folketeateret_quizkort_v1.json';
const ids=[
  'folketeateret_s1_q1','folketeateret_s1_q2','folketeateret_s1_q3',
  'folketeateret_s2_q1','folketeateret_s2_q5','folketeateret_s2_q7',
  'folketeateret_s3_q1','folketeateret_s3_q2','folketeateret_s3_q4','folketeateret_s3_q6'
];
const quiz=JSON.parse(fs.readFileSync(quizFile,'utf8'));
const document=JSON.parse(fs.readFileSync(cardFile,'utf8'));
if(quiz.targetId!=='folketeateret'||quiz.sets.length!==3||
   quiz.sets.some(set=>set.questions.length!==7)) throw new Error('Fullquiz is not 3 x 7.');
const questions=quiz.sets.flatMap(set=>set.questions);
if(new Set(questions.map(q=>q.id)).size!==21) throw new Error('Duplicate fullquiz IDs.');
if(document.cards.length!==1||document.cards[0].targetId!=='folketeateret')throw new Error('Card target identity changed.');
const original=document.cards[0].questions;
if(original.length!==10||!isDeepStrictEqual(original.map(q=>q.sourceQuestionId),ids))
 throw new Error('QuizCard question selection changed unexpectedly.');
const byId=new Map(questions.map(q=>[q.id,q]));
const rebuilt=ids.map((id,i)=>{
 const q=byId.get(id);
 if(!q||!Array.isArray(q.options)||q.options.length<3||
    q.options[q.answerIndex]!==q.answer)throw new Error('Missing or invalid source quiz: '+id);
 const references=Array.isArray(q.source)?q.source.filter(url=>url.startsWith('https://')):[];
 return {...q,number:i+1,explanation:q.knowledge,
   sourceQuestionId:q.id,sourceQuizId:q.quiz_id,sourceQuizFile:quizFile,
   source_urls:references,source_refs:references};
});
document.cards[0].questions=rebuilt;
document.cards[0].questionCount=rebuilt.length;
document.production_status=rebuilt.every(q=>q.knowledge_link_status==='linked'&&
  Array.isArray(q.knowledge_unit_ids)&&q.knowledge_unit_ids.length>0)
  ? 'knowledge_linked_browser_review_pending':'knowledge_generation_and_browser_review_pending';
const out=JSON.stringify(document,null,2)+'\n';
if(process.argv.includes('--check')) {
 if(fs.readFileSync(cardFile,'utf8')!==out)throw new Error('QuizCard/fullquiz drift; rerun --write.');
 console.log('FOLKETEATERET_QUIZCARD_PARITY_OK',rebuilt.length,document.production_status);
}else if(process.argv.includes('--write')) {
 fs.writeFileSync(cardFile,out);
 console.log('FOLKETEATERET_QUIZCARD_SYNCED',rebuilt.length,document.production_status);
}else throw new Error('Specify --write or --check.');
