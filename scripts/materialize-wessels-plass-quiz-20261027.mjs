#!/usr/bin/env node
// One-time canonical production tool for the Wessels plass source-reviewed quiz.
// Executes only on a fresh branch from main; never rewrites Place, media or Fagverk.
import fs from "node:fs";
import path from "node:path";
const root=process.cwd();
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),"utf8"));
const write=(p,data)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(data,null,2)+"\n");};
const target="wessels_plass";
const source=read("reports/place-production/wessels-plass-quiz-reviewed-20261027.json");
const old=read("data/quiz/by/ostbanestasjonen_sets.json");
const oldBrief=read("data/quiz/production_briefs/by/ostbanestasjonen.json");
const oldCard=read("data/quizcards/by/ostbanestasjonen_quizcard_v1.json");
const fagPath="data/fag/fag_manifest.json",quizManifestPath="data/quiz/manifest.json";
const cardManifestPath="data/quizcards/by/manifest.json";
const quizPath="data/quiz/by/wessels_plass_sets.json",briefPath="data/quiz/production_briefs/by/wessels_plass.json";
const contextPath="data/quiz/production_context/by/wessels_plass.json",cardPath="data/quizcards/by/wessels_plass_quizcard_v1.json";
const cardIds=new Set(source.quizcard_source_candidate_ids);
if(source.questions.length!==21||cardIds.size!==10)throw Error("Expected 21 reviewed and 10 selected questions");
if(source.questions.some(q=>q.review_status!=="reviewed"))throw Error("Unreviewed question");
const fg=read(fagPath),mf=read(quizManifestPath),cm=read(cardManifestPath);
if(fg.by.quizProduction.targets[target]||mf.sets.some(s=>s.targetId===target)||cm.collections.includes("wessels_plass_quizcard_v1.json"))throw Error("Existing canonical Wessels quiz: refusing to overwrite");
const exAudit={searched_paths:["data/quiz/manifest.json","data/fag/by/quizProduction.targets","data/quiz/by/wessels_plass_sets.json","reports/place-production/wessels-plass-quiz-reviewed-20261027.json"],active_before:{set_count:0,question_count:0},decisions:["No current target-owned sets in canonical quiz manifest or By production targets; retain unrelated legacy and archival data.","Use 21 reviewed location-specific candidates and ten selected QuizCard questions; do not overwrite Place data."],knowledge_migration:"New target-owned quiz; canonical generator assigns Knowledge links; no fabricated IDs."};
const profile={profile:"narrow",set_count:3,questions_per_set:7,confirmed:true,justification:"Kildene bærer tre distinkte sett: tidligere forsvars-/hageområde og kommunal omforming; navne- og trafikklag; kildegrenser, offentlig rom og Stortingets tunnel. 21 spørsmål uten rene årstallsfasiter."};
const selected={module_ids:["kur_by_04_historiske_lag_og_transformasjon"],emne_ids:["em_by_torg_plasser_som_scene","em_by_historiske_lag_i_hverdagsrom"],topic_hook_ids:[],method_ids:[],thinker_ids:[],works:[]};
const sources={
  oppdag_kvadraturen:{url:"https://www.oppdagkvadraturen.no/stoppesteder/wessels-plass",source_type:"institutional",review_status:"reviewed",reviewed_at:"2026-10-27",review_note:"Oslo kommunes Byantikvaren-formidling: fire gater, Bukkebjerget, huset/hagen, kommunens overtakelse, park og navneendring, trikk og nabobygninger."},
  oslo_byleksikon:{url:"https://oslobyleksikon.no/side/Wessels_plass",source_type:"reputable_secondary",review_status:"reviewed",reviewed_at:"2026-10-27",review_note:"Stedsgrenser, minnesmerke, kollektivtrafikk, 2005 endringer og gangtunnel under plassen kontrollert mot oppslaget."}
};
const phases=["opening","bridge","final"];
const emneAt=i=>(i===2||i===9||i===10||i>=17)?"em_by_historiske_lag_i_hverdagsrom":"em_by_torg_plasser_som_scene";
const sourceAt=q=>q.candidate_id==="wessels_plass_development_13"?["oslo_byleksikon"]:["oppdag_kvadraturen","oslo_byleksikon"];
const claims=source.questions.map((q,i)=>({claim_id:"claim_wessels_plass_quiz_"+String(i+1).padStart(2,"0"),order:i+1,planned_phase:phases[Math.floor(i/7)],family:i>=14?"analysis":i>=7?"context":"fact",statement:q.explanation,source_ids:sourceAt(q),source_origin:"external",emne_id:emneAt(i)}));
const brief={schema_version:"1.0",status:"reviewed",categoryId:"by",targetId:target,reviewed_at:"2026-10-27",source_review_basis:"Direct review of municipality and Oslo Byleksikon sources 2026-10-27; see reports/place-production/wessels-plass-quiz-reviewed-20261027.json",sources,selected_curriculum:selected,existing_quiz_audit:exAudit,profile_decision:profile,held_back_candidates:["Question stems whose correct answer is merely a year, and trivia about neighboring buildings unrelated to the independent Place.","Unsourced exact placements of destroyed Bukkebjerget, old stops or tunnels beyond named source assertions."],claims};
const context={...old.production_context,source_brief:briefPath,context_artifact:contextPath,pensum_module_ids:selected.module_ids,emne_ids:selected.emne_ids,topic_hook_ids:[],method_ids:[],thinker_ids:[],works:[],source_review_status:"reviewed",existing_quiz_audit:exAudit,profile_decision:profile,held_back_candidates:brief.held_back_candidates,profile:"narrow_3x7"};
const sets=Array.from({length:3},(_,s)=>{
 const qs=source.questions.slice(s*7,s*7+7).map((q,j)=>{
 const i=s*7+j,ids=sourceAt(q),claim=claims[i];
 const basicType=i>=14?"analysis":i>=7?"context":"fact";
 return {id:q.candidate_id,quiz_id:"by_wessels_plass_set_"+(s+1)+"_q"+(j+1),categoryId:"by",targetId:target,placeId:target,question_scope:"place",question:q.question,options:q.options,answer:q.options[q.answerIndex],answerIndex:q.answerIndex,knowledge:q.explanation,explanation:q.explanation,difficulty:s+1,question_type:basicType,emne_id:claim.emne_id,source:ids,source_urls:ids.map(id=>sources[id].url),source_origin:"external",claim_id:claim.claim_id,claim_basis:claim.statement,concept_ids:[],term_ids:[],knowledge_contract_version:1,tags:["by",target,"oslo_aav_v1_20261027"]};
 });
 return {set_id:"by_wessels_plass_set_"+(s+1),order:s+1,phase:phases[s],planned_questions:7,questions_per_set:7,claim_ids:qs.map(q=>q.claim_id),level:s+1,title:["Bukkebjerget, Huitfeldts hage og byrommet","Navn, trafikk og offentlige institusjoner","Historiske spor, minne og skjult infrastruktur"][s],questions:qs};
});
const quiz={categoryId:"by",targetId:target,generator_version:"source_review_oslo_aav_20261027",size_class:"narrow",sources:Object.fromEntries(Object.entries(sources).map(([k,v])=>[k,v.url])),production_context:context,sets};
const all=sets.flatMap(s=>s.questions);
const cardQuestions=source.quizcard_source_candidate_ids.map((id,i)=>{
 const q=all.find(x=>x.id===id);if(!q)throw Error("Missing QuizCard source "+id);
 return {...q,number:i+1,sourceQuestionId:q.id,sourceQuizId:q.quiz_id,sourceQuizFile:quizPath};
});
const card={collection_id:"oslo_aav_wessels_plass_v1_20261027",categoryId:"by",title:"Wessels plass – Oslo",cardFormatRule:oldCard.cardFormatRule,sourceBasis:"Kildekontrollerte canonical quizspørsmål fra "+quizPath,cards:[{card_id:"by_quizkort_wessels_plass",categoryId:"by",targetId:target,title:"Wessels plass",subtitle:"Ti spørsmål om plassens historie",order:1,format:oldCard.cards[0].format,questionCount:10,questions:cardQuestions,answerKey:cardQuestions.map((q,i)=>({number:i+1,answer:q.answer,answerIndex:q.answerIndex})),sourceFile:quizPath}]};
fg.by.quizProduction.targets[target]={source_brief:"../quiz/production_briefs/by/wessels_plass.json",context_artifact:"../quiz/production_context/by/wessels_plass.json",quiz_file:"../quiz/by/wessels_plass_sets.json"};
for(let i=1;i<=3;i++)mf.sets.push({targetId:target,file:quizPath,set_id:"by_wessels_plass_set_"+i,order:i});
cm.collections.push("wessels_plass_quizcard_v1.json");
write(briefPath,brief);write(quizPath,quiz);write(cardPath,card);write(fagPath,fg);write(quizManifestPath,mf);write(cardManifestPath,cm);
console.log("Materialized Wessels plass source brief, 3x7 quiz, QuizCard top10, and canonical manifests.");
