#!/usr/bin/env node
import fs from 'node:fs';
const id='universitetets_gamle_hovedbygning';const qPath='data/quiz/vitenskap/'+id+'_sets.json',cPath='data/quizcards/vitenskap/'+id+'_quizcard_v1.json';
const q=JSON.parse(fs.readFileSync(qPath,'utf8')),c=JSON.parse(fs.readFileSync(cPath,'utf8'));
const byId=new Map(q.sets.flatMap(s=>s.questions).map(x=>[x.id,x]));
if(q.sets.flatMap(s=>s.questions).length!==21||c.cards[0].questions.length!==10)throw Error('wrong length');
for(const row of c.cards[0].questions){const src=byId.get(row.sourceQuestionId);if(!src?.primary_knowledge_unit_id||src.knowledge_link_status!=='linked')throw Error('Missing Knowledge: '+row.id);for(const field of ['quiz_id','question','options','answer','answerIndex','knowledge'])if(JSON.stringify(row[field])!==JSON.stringify(src[field]))throw Error('Parity '+field);for(const field of ['primary_knowledge_unit_id','knowledge_unit_ids','knowledge_link_status'])row[field]=src[field];}
c.production_status='knowledge_linked';fs.writeFileSync(cPath,JSON.stringify(c,null,2)+'\n');
