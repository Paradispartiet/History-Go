#!/usr/bin/env node
import fs from 'node:fs';
const id='universitetets_gamle_kjemi';const qPath='data/quiz/vitenskap/'+id+'_sets.json',cPath='data/quizcards/vitenskap/'+id+'_quizcard_v1.json';
const q=JSON.parse(fs.readFileSync(qPath,'utf8')),c=JSON.parse(fs.readFileSync(cPath,'utf8'));const byId=new Map(q.sets.flatMap(s=>s.questions).map(x=>[x.id,x]));
for(const item of c.cards[0].questions){const src=byId.get(item.sourceQuestionId);if(!src?.primary_knowledge_unit_id||src.knowledge_link_status!=='linked')throw Error('No canonical Knowledge '+item.id);for(const k of ['quiz_id','question','options','answer','answerIndex','knowledge'])if(JSON.stringify(item[k])!==JSON.stringify(src[k]))throw Error('Parity '+k);for(const k of ['primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])item[k]=src[k];}
c.production_status='knowledge_linked';fs.writeFileSync(cPath,JSON.stringify(c,null,2)+'\n');