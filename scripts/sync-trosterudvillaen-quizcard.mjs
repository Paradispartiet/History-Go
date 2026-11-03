#!/usr/bin/env node
import fs from 'node:fs';
const id='trosterudvillaen',qp='data/quiz/historie/'+id+'_sets.json',cp='data/quizcards/historie/'+id+'_quizcard_v1.json';
const q=JSON.parse(fs.readFileSync(qp,'utf8')),cards=JSON.parse(fs.readFileSync(cp,'utf8'));
const by=new Map(q.sets.flatMap(x=>x.questions).map(x=>[x.id,x]));
for(const row of cards.cards[0].questions){const s=by.get(row.sourceQuestionId);if(!s?.primary_knowledge_unit_id||s.knowledge_link_status!=='linked')throw Error('Missing Knowledge '+row.id);
for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge'])if(JSON.stringify(row[k])!==JSON.stringify(s[k]))throw Error('QuizCard parity '+k);
for(const k of ['primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])row[k]=s[k];}
cards.production_status='knowledge_linked';fs.writeFileSync(cp,JSON.stringify(cards,null,2)+'\n');
