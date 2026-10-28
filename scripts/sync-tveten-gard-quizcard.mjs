#!/usr/bin/env node
import fs from 'node:fs';
const id='tveten_gard',qp='data/quiz/historie/'+id+'_sets.json',cp='data/quizcards/historie/'+id+'_quizcard_v1.json';
const quiz=JSON.parse(fs.readFileSync(qp,'utf8')),c=JSON.parse(fs.readFileSync(cp,'utf8'));
const by=new Map(quiz.sets.flatMap(s=>s.questions).map(q=>[q.id,q]));
for(const q of c.cards[0].questions){const source=by.get(q.sourceQuestionId);if(!source?.primary_knowledge_unit_id||source.knowledge_link_status!=='linked')throw Error('No Knowledge '+q.id);
for(const key of ['quiz_id','question','options','answer','answerIndex','knowledge'])if(JSON.stringify(q[key])!==JSON.stringify(source[key]))throw Error('QuizCard mismatch '+key);
for(const key of ['primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])q[key]=source[key];}
c.production_status='knowledge_linked';fs.writeFileSync(cp,JSON.stringify(c,null,2)+'\n');
