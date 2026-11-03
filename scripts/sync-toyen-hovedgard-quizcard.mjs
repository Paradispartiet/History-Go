#!/usr/bin/env node
import fs from 'node:fs';
const id='toyen_hovedgard',qp='data/quiz/historie/'+id+'_sets.json',cp='data/quizcards/historie/'+id+'_quizcard_v1.json';
const quiz=JSON.parse(fs.readFileSync(qp,'utf8')),cards=JSON.parse(fs.readFileSync(cp,'utf8'));
const byId=new Map(quiz.sets.flatMap(s=>s.questions).map(q=>[q.id,q]));
for(const question of cards.cards[0].questions){
 const source=byId.get(question.sourceQuestionId);
 if(!source?.primary_knowledge_unit_id||source.knowledge_link_status!=='linked')throw Error('Missing canonical Knowledge '+question.id);
 for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge'])if(JSON.stringify(question[k])!==JSON.stringify(source[k]))throw Error('QuizCard differs: '+k+' '+question.id);
 for(const k of ['primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])question[k]=source[k];
}
cards.production_status='knowledge_linked';
fs.writeFileSync(cp,JSON.stringify(cards,null,2)+'\n');
