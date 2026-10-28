#!/usr/bin/env node
import fs from 'node:fs';
const qPath='data/quiz/historie/viking_planet_oslo_sets.json';
const cPath='data/quizcards/historie/viking_planet_oslo_quizcard_v1.json';
const q=JSON.parse(fs.readFileSync(qPath,'utf8')),c=JSON.parse(fs.readFileSync(cPath,'utf8'));
const questions=q.sets.flatMap(s=>s.questions),byId=new Map(questions.map(x=>[x.id,x]));
if(questions.length!==21||c.cards[0].questions.length!==10)throw Error('wrong card or quiz size');
for(const item of c.cards[0].questions){
 const source=byId.get(item.sourceQuestionId);
 if(!source?.primary_knowledge_unit_id||source.knowledge_link_status!=='linked')throw Error('Missing canonical Knowledge '+item.id);
 for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge'])if(JSON.stringify(item[k])!==JSON.stringify(source[k]))throw Error('Card source mismatch '+k+' '+item.id);
 for(const k of ['primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])item[k]=source[k];
}
c.production_status='knowledge_linked';
fs.writeFileSync(cPath,JSON.stringify(c,null,2)+'\n');
console.log('Viking Planet 10/10 quizcard parity');
