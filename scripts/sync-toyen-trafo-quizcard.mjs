#!/usr/bin/env node
import fs from 'node:fs';
const id='toyen_trafo',qp='data/quiz/naeringsliv/'+id+'_sets.json',cp='data/quizcards/naeringsliv/'+id+'_quizcard_v1.json';
const q=JSON.parse(fs.readFileSync(qp,'utf8')),c=JSON.parse(fs.readFileSync(cp,'utf8'));
const byId=new Map(q.sets.flatMap(s=>s.questions).map(q=>[q.id,q]));
for(const row of c.cards[0].questions){
 const s=byId.get(row.sourceQuestionId);
 if(!s?.primary_knowledge_unit_id||s.knowledge_link_status!=='linked')throw Error('Knowledge link missing '+row.id);
 for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge'])if(JSON.stringify(row[k])!==JSON.stringify(s[k]))throw Error('QuizCard parity '+k+' '+row.id);
 for(const k of ['primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])row[k]=s[k];
}
c.production_status='knowledge_linked';
fs.writeFileSync(cp,JSON.stringify(c,null,2)+'\n');
