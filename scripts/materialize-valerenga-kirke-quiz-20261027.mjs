#!/usr/bin/env node
// One-use Vålerenga kirke producer. No Place/media/Fagverk writes.
import fs from "node:fs";
import path from "node:path";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const write=(p,o)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(o,null,2)+"\n")};
const target="valerenga_kirke", cat="historie";
const sourcePath="reports/place-production/valerenga-kirke-quiz-reviewed-20261027.json";
const quizPath="data/quiz/historie/valerenga_kirke_sets.json";
const briefPath="data/quiz/production_briefs/historie/valerenga_kirke.json";
const contextPath="data/quiz/production_context/historie/valerenga_kirke.json";
const cardPath="data/quizcards/historie/valerenga_kirke_quizcard_v1.json";
const manifestPath="data/quiz/manifest.json",fagPath="data/fag/fag_manifest.json";
const cardManifestPath="data/quizcards/historie/manifest.json";
const source=read(sourcePath),fg=read(fagPath),mf=read(manifestPath),cm=read(cardManifestPath);
if(source.place_id!==target||source.categoryId!==cat||source.questions.length!==21)throw Error("Review bank mismatch");
if(source.questions.some((q,i)=>q.review_status!=="reviewed"||q.set_order!==Math.floor(i/7)+1||q.options.length!==4||q.options[q.answerIndex]!==q.answer))throw Error("Invalid review candidate");
if(source.quizcard_source_candidate_ids.length!==10||new Set(source.quizcard_source_candidate_ids).size!==10)throw Error("QuizCard selection invalid");
if(fg.historie.quizProduction.targets[target]||mf.sets.some(s=>s.targetId===target)||cm.collections.includes(path.basename(cardPath))||fs.existsSync(quizPath))throw Error("Existing canonical quiz; refusing overwrite");
const selected={
 module_ids:["his_kilder_arkiv_spor","his_minne_kulturarv_historiebruk"],
 emne_ids:["em_his_historiske_lag_i_byrom","em_his_spor_materialitet","em_his_sosialhistorie_hverdagsliv","em_his_kulturminner_bevaring","em_his_restaurering_autentisitet"],
 topic_hook_ids:["his_spor_materialitet","his_bevaring_restaurering_autentisitet"],
 method_ids:["met_sporlesning","met_restaurerings_autentisitetsanalyse"],
 thinker_ids:["carlo_ginzburg","alois_riegl"],
 works:["Clues, Myths, and the Historical Method","The Modern Cult of Monuments"]
};
const exAudit={searched_paths:[manifestPath,"data/fag/fag_manifest.json",quizPath,sourcePath],active_before:{set_count:0,question_count:0},decisions:["No active target-owned quiz in canonical manifest or source category before production.","Keep canonical Place/Fagverk/photos intact and convert reviewed source candidates into the production bank."],knowledge_migration:"Canonical Knowledge generator assigns stable IDs, never construct guessed IDs."};
const profile={profile:"narrow",set_count:3,questions_per_set:7,confirmed:true,justification:"Three distinct source-supported stages: 1902 church, fire and loss, 1984 rebuilding and conservation/interpretation. 21 verified questions, no pure-year answers."};
const srcs={
 valerenga_kirken:{url:"https://www.kirken.no/nb-NO/fellesrad/kirkene-i-gamle-oslo/kirkene-i-gamle-oslo/valerenga/omvaalerengakirke/",source_type:"official_institution",review_status:"reviewed",reviewed_at:"2026-10-27",review_note:"Primary parish history: property, stone, orientation, architects, 1979 fire, re-consecration, art provenance."},
 oslo_byleksikon:{url:"https://oslobyleksikon.no/side/V%C3%A5lerenga_kirke",source_type:"reputable_secondary",review_status:"reviewed",reviewed_at:"2026-10-27",review_note:"Independent local reference; includes co-authored competition design and subsequent executing architect distinction, school fire damage, later interior and art."}
};
const phases=["opening","development","final"];
const claims=source.questions.map((q,i)=>({claim_id:"claim_valerenga_kirke_quiz_"+String(i+1).padStart(2,"0"),order:i+1,planned_phase:phases[Math.floor(i/7)],family:q.question_type==="analysis"?"analysis":q.question_type==="context"?"context":"fact",statement:q.claim_basis||q.explanation,source_ids:q.source_ids,source_origin:"external",emne_id:q.emne_id}));
const brief={schema_version:"1.0",status:"reviewed",categoryId:cat,targetId:target,reviewed_at:"2026-10-27",source_review_basis:"Reviewed Oslo Å–V intake, primary parish source and Oslo byleksikon; "+sourcePath,sources:srcs,selected_curriculum:selected,existing_quiz_audit:exAudit,profile_decision:profile,held_back_candidates:["Pure-year answer questions.","Unsupported exact restoration or organ attribution; two external references disagree about number of organ stops.","Treating Paulus-deposited Vigeland frieze as saved original frescoes.","Conflating shared competition designers with single executing architect."],claims};
const old=read("data/quiz/historie/gamle_aker_kirke_sets.json");
const oldCard=read("data/quizcards/historie/garmanngarden_quizkort_v1.json");
const context={...old.production_context,manifest_category:cat,profile:"narrow_3x7",standard_version:"3.4",source_brief:briefPath,context_artifact:contextPath,pensum_module_ids:selected.module_ids,emne_ids:selected.emne_ids,topic_hook_ids:selected.topic_hook_ids,method_ids:selected.method_ids,thinker_ids:selected.thinker_ids,works:selected.works,source_review_status:"reviewed",existing_quiz_audit:exAudit,profile_decision:profile,held_back_candidates:brief.held_back_candidates};
const enrich=(q,i,j)=>{
 const c=claims[i],srcIds=q.source_ids;
 const item={id:q.candidate_id,quiz_id:"historie_valerenga_kirke_set_"+(Math.floor(i/7)+1)+"_q"+(j+1),categoryId:cat,targetId:target,placeId:target,question_scope:"place",question:q.question,options:q.options,answer:q.answer,answerIndex:q.answerIndex,knowledge:q.explanation,explanation:q.explanation,difficulty:Math.floor(i/7)+1,question_type:q.question_type,emne_id:q.emne_id,source:srcIds,source_urls:q.source_urls,source_origin:"external",claim_id:c.claim_id,claim_basis:c.statement,concept_ids:[],term_ids:[],knowledge_contract_version:1,tags:[cat,target,"oslo_aav_v1_20261027"]};
 if(i===19){Object.assign(item,{method_id:"met_sporlesning",topic_hook_id:"his_spor_materialitet",thinker_id:"carlo_ginzburg",work:"Clues, Myths, and the Historical Method",theory_ref:{topic_hook_id:"his_spor_materialitet",thinker_id:"carlo_ginzburg",work:"Clues, Myths, and the Historical Method",why_it_helps:"A wall is direct physical evidence of surviving masonry, not of the disappeared interior."},guidance_basis:["data/fag/historie/methods_historie_canonical_v4_5.json"]});}
 if(i===20){Object.assign(item,{method_id:"met_restaurerings_autentisitetsanalyse",topic_hook_id:"his_bevaring_restaurering_autentisitet",thinker_id:"alois_riegl",work:"The Modern Cult of Monuments",theory_ref:{topic_hook_id:"his_bevaring_restaurering_autentisitet",thinker_id:"alois_riegl",work:"The Modern Cult of Monuments",why_it_helps:"The distinction between age and use value helps describe an old shell with changed rooms and art."},guidance_basis:["data/fag/historie/methods_historie_canonical_v4_5.json"]});}
 return item;
};
const sets=Array.from({length:3},(_,s)=>{
 const qs=source.questions.slice(s*7,s*7+7).map((q,j)=>enrich(q,s*7+j,j));
 return {set_id:"historie_valerenga_kirke_set_"+(s+1),level:s+1,order:s+1,phase:phases[s],planned_questions:7,questions_per_set:7,claim_ids:qs.map(q=>q.claim_id),title:["Byggingen og kirkens særpreg","Brannen og den tapte kunsten","Gjenreisning, kunst og historiske spor"][s],questions:qs};
});
const quiz={targetId:target,categoryId:cat,generator_version:"source_review_oslo_aav_20261027",size_class:"narrow",sources:Object.fromEntries(Object.entries(srcs).map(([k,v])=>[k,v.url])),production_context:context,sets};
const all=sets.flatMap(s=>s.questions);
const cardQuestions=source.quizcard_source_candidate_ids.map((id,i)=>{
 const q=all.find(q=>q.id===id);if(!q)throw Error("QuizCard candidate missing: "+id);
 return {...q,number:i+1,sourceQuestionId:q.id,sourceQuizId:q.quiz_id,sourceQuizFile:quizPath};
});
const card={collection_id:"oslo_aav_valerenga_kirke_v1_20261027",categoryId:cat,title:"Vålerenga kirke – Oslo",cardFormatRule:oldCard.cardFormatRule||"single_surface_top10_with_answer_key",sourceBasis:"Canonical review: "+quizPath,cards:[{card_id:"historie_quizkort_valerenga_kirke",categoryId:cat,targetId:target,title:"Vålerenga kirke",subtitle:"Ti spørsmål om kirken, brannen og gjenreisningen",order:1,format:oldCard.cards[0].format,questionCount:10,questions:cardQuestions,answerKey:cardQuestions.map((q,i)=>({number:i+1,answer:q.answer,answerIndex:q.answerIndex})),sourceFile:quizPath}]};
fg.historie.quizProduction.targets[target]={source_brief:"../quiz/production_briefs/historie/valerenga_kirke.json",context_artifact:"../quiz/production_context/historie/valerenga_kirke.json",quiz_file:"../quiz/historie/valerenga_kirke_sets.json"};
for(let i=1;i<=3;i++)mf.sets.push({targetId:target,file:quizPath,set_id:"historie_valerenga_kirke_set_"+i,order:i});
cm.collections.push(path.basename(cardPath));
write(quizPath,quiz);write(briefPath,brief);write(cardPath,card);write(fagPath,fg);write(manifestPath,mf);write(cardManifestPath,cm);
console.log("Wrote Vålerenga kirke 3x7 quiz, top10 card, production brief, two manifests; canonical context/Knowledge next.");
