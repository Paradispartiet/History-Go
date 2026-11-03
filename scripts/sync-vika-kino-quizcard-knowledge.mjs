#!/usr/bin/env node
import fs from "node:fs";
const qp="data/quiz/by/vika_kino_sets.json",cp="data/quizcards/by/vika_kino_quizcard_v1.json";
const q=JSON.parse(fs.readFileSync(qp,"utf8")),c=JSON.parse(fs.readFileSync(cp,"utf8"));
const all=q.sets.flatMap(s=>s.questions),byId=new Map(all.map(q=>[q.id,q]));
if(q.sets.length!==3||q.sets.some(s=>s.questions.length!==7))throw Error("21 fullquiz questions required");
if(c.cards[0].questions.length!==10)throw Error("10 QuizCard questions required");
for(const cq of c.cards[0].questions){
 const source=byId.get(cq.sourceQuestionId);
 if(!source?.primary_knowledge_unit_id||!source.knowledge_unit_ids?.length||source.knowledge_link_status!=="linked")throw Error("Unlinked "+cq.sourceQuestionId);
 for(const k of ["question","options","answer","answerIndex","quiz_id","knowledge"])if(JSON.stringify(source[k])!==JSON.stringify(cq[k]))throw Error("QuizCard mismatch "+k+" "+cq.id);
 cq.primary_knowledge_unit_id=source.primary_knowledge_unit_id;cq.knowledge_unit_ids=[...source.knowledge_unit_ids];cq.knowledge_link_status="linked";
}
c.production_status="knowledge_linked";fs.writeFileSync(cp,JSON.stringify(c,null,2)+"\n");
console.log("Vika kino: 10 canonical QuizCard Knowledge links ready.");
