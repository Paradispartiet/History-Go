#!/usr/bin/env node
import fs from "node:fs";
const qp="data/quiz/kunst/vigelandmuseet_sets.json",cp="data/quizcards/kunst/vigelandmuseet_quizcard_v1.json";
const q=JSON.parse(fs.readFileSync(qp,"utf8")),c=JSON.parse(fs.readFileSync(cp,"utf8"));
const all=q.sets.flatMap(s=>s.questions),byId=new Map(all.map(x=>[x.id,x]));
if(q.sets.length!==3||q.sets.some(s=>s.questions.length!==7)||c.cards[0].questions.length!==10)throw Error("Wrong question counts");
for(const cq of c.cards[0].questions){
 const source=byId.get(cq.sourceQuestionId);
 if(!source||!source.primary_knowledge_unit_id||!source.knowledge_unit_ids?.length||source.knowledge_link_status!=="linked")throw Error("Missing Knowledge "+cq.id);
 for(const k of ["question","options","answer","answerIndex","quiz_id","knowledge"])if(JSON.stringify(cq[k])!==JSON.stringify(source[k]))throw Error("QuizCard mismatch "+cq.id+" "+k);
 cq.primary_knowledge_unit_id=source.primary_knowledge_unit_id;cq.knowledge_unit_ids=[...source.knowledge_unit_ids];cq.knowledge_link_status="linked";
}
c.production_status="knowledge_linked";fs.writeFileSync(cp,JSON.stringify(c,null,2)+"\n");
console.log("Vigelandmuseet: 10/10 linked QuizCard questions.");
