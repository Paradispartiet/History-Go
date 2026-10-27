#!/usr/bin/env node
// Oslo Å–V: deterministic materialization of the reviewed Østbanestasjonen candidate bank.
// --pre prepares the canonical quiz, manifests and production context.
// The existing Knowledge builder must then run with --write; --post materializes QuizCard
// from the linked quiz questions, never from a separate divergent question bank.
import fs from "node:fs";
import path from "node:path";
import { buildQuizProductionContext } from "./quiz-production-lib.mjs";

const ROOT=process.cwd();
const ID="ostbanestasjonen";
const BRIEF="data/quiz/production_briefs/by/"+ID+".json";
const CANDIDATES="reports/place-production/ostbanestasjonen-quiz-v1-candidates-20261027.json";
const QUIZ="data/quiz/by/"+ID+"_sets.json";
const CONTEXT="data/quiz/production_context/by/"+ID+".json";
const CARD="data/quizcards/by/"+ID+"_quizcard_v1.json";
const FAG="data/fag/fag_manifest.json";
const QUIZ_MANIFEST="data/quiz/manifest.json";
const CARD_MANIFEST="data/quizcards/by/manifest.json";
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const write=(p,v)=>{fs.mkdirSync(path.dirname(path.join(ROOT,p)),{recursive:true});fs.writeFileSync(path.join(ROOT,p),JSON.stringify(v,null,2)+"\n");};
const ensure=(condition,message)=>{if(!condition)throw Error(message)};
const phase=process.argv[2];
ensure(["--pre","--post"].includes(phase),"Provide --pre or --post");

if(phase==="--pre"){
  const draft=read(CANDIDATES);
  const brief=read(BRIEF);
  const candidates=draft.candidates;
  const selected=new Set(draft.quizcard_candidate_ids);
  ensure(brief.targetId===ID && brief.categoryId==="by","Wrong production brief");
  ensure(candidates.length===21 && brief.claims.length===21,"Expected 21 source claims and 21 candidate questions");
  ensure(new Set(candidates.map(q=>q.id)).size===21,"Duplicate question IDs");
  ensure(selected.size===10 && [...selected].every(id=>candidates.some(q=>q.id===id)),"Invalid QuizCard selection");
  ensure(candidates.every(q=>q.options.length===4 && new Set(q.options).size===4 && q.options[q.answerIndex]===q.answer),"Answer/options mismatch");
  ensure(candidates.every(q=>!/^((I|På|Hvilket|Hvilken) år|Når ble .+ (bygget|åpnet|stiftet)\?)/iu.test(q.question)),"Year-only question");
  ensure(candidates.every((q,i)=>q.set===Math.floor(i/7)+1),"Candidate order does not match set plan");
  brief.status="reviewed";
  brief.profile_decision.confirmed=true;
  write(BRIEF,brief);
  const fag=read(FAG);
  const targets=fag.by.quizProduction.targets;
  const targetSpec={
    source_brief:"../quiz/production_briefs/by/"+ID+".json",
    context_artifact:"../quiz/production_context/by/"+ID+".json",
    quiz_file:"../quiz/by/"+ID+"_sets.json"
  };
  if(targets[ID]) ensure(JSON.stringify(targets[ID])===JSON.stringify(targetSpec),"Existing target registration conflicts");
  else targets[ID]=targetSpec;
  write(FAG,fag);
  const built=await buildQuizProductionContext({root:ROOT,categoryId:"by",targetId:ID});
  ensure(built.set_plan.length===3 && built.set_plan.every(x=>x.claim_ids.length===7),"Unexpected canonical set plan");
  const selectedCurr=built.selected_curriculum;
  const qc=candidates.map((q,i)=>{
    const claim=brief.claims[i];
    ensure(claim.order===i+1 && claim.place_production_claim_ids?.includes(q.claim_ids[0]),"Candidate/brief claim mismatch: "+q.id);
    const sources=claim.source_ids;
    ensure(sources.every(x=>brief.sources[x]?.review_status==="reviewed"),"Unreviewed source: "+q.id);
    return {
      id:q.id,
      quiz_id:"by_"+ID+"_set_"+q.set+"_q"+q.order,
      categoryId:"by",targetId:ID,placeId:ID,question_scope:"place",
      question:q.question,options:q.options,answer:q.answer,answerIndex:q.answerIndex,
      knowledge:q.explanation,explanation:q.explanation,
      difficulty:q.set,question_type:"fact",
      emne_id:claim.emne_id,
      source:sources,source_urls:q.source_urls,source_origin:"external",
      claim_id:claim.claim_id,claim_basis:claim.statement,
      concept_ids:[],term_ids:[],
      knowledge_contract_version:1,
      tags:["by",ID,"oslo_aav_v1_20261027"]
    };
  });
  const production_context={
    manifest_category:"by",
    profile:built.profile,
    standard_version:"3.4",
    source_brief:BRIEF,
    context_artifact:CONTEXT,
    resolved_files:Object.fromEntries(Object.entries(built.resolved_files).map(([k,v])=>[k,v.path])),
    required_inputs_loaded:built.required_inputs_loaded,
    pensum_module_ids:selectedCurr.module_ids,
    emne_ids:selectedCurr.emne_ids,
    topic_hook_ids:selectedCurr.topic_hook_ids,
    method_ids:selectedCurr.method_ids,
    thinker_ids:selectedCurr.thinker_ids,
    works:selectedCurr.works,
    source_review_status:brief.status,
    existing_quiz_audit:brief.existing_quiz_audit,
    profile_decision:brief.profile_decision,
    held_back_candidates:brief.held_back_candidates
  };
  const quiz={
    categoryId:"by",targetId:ID,generator_version:"source_review_oslo_aav_20261027",
    size_class:"narrow",sources:Object.fromEntries(Object.entries(brief.sources).map(([k,v])=>[k,v.url])),
    production_context,
    sets:built.set_plan.map((sp,index)=>({
      ...sp,
      level:index+1,
      title:["Fra Hovedbanen til Østfoldbanen","Bystasjon, okkupasjon og vern","Oslo S og Østbanehallens nye liv"][index],
      questions:qc.slice(index*7,(index+1)*7)
    }))
  };
  write(QUIZ,quiz);
  write(CONTEXT,built);
  const manifest=read(QUIZ_MANIFEST);
  const existing=manifest.sets.filter(e=>e.targetId===ID);
  ensure(existing.every(e=>e.file===QUIZ && built.set_plan.some(sp=>sp.set_id===e.set_id)),"Existing target has conflicting manifest registration");
  manifest.sets=manifest.sets.filter(e=>e.targetId!==ID);
  for(const sp of built.set_plan)manifest.sets.push({targetId:ID,file:QUIZ,set_id:sp.set_id,order:sp.order});
  write(QUIZ_MANIFEST,manifest);
  console.log("Prepared canonical 3x7 Østbanestasjonen quiz and production context, 0 standalone year questions.");
}else{
  const draft=read(CANDIDATES),quiz=read(QUIZ);
  const questions=quiz.sets.flatMap(s=>s.questions);
  ensure(questions.length===21 && questions.every(q=>/^ku_by_[a-z0-9_]+$/.test(q.primary_knowledge_unit_id||"") && Array.isArray(q.knowledge_unit_ids) && q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id)),"Knowledge generator has not linked all 21 questions");
  const selected=draft.quizcard_candidate_ids.map((id,index)=>{
    const q=questions.find(q=>q.id===id);
    ensure(q,"Selected QuizCard question not in quiz: "+id);
    return {...q,number:index+1,sourceQuestionId:q.id,sourceQuizId:q.quiz_id,sourceQuizFile:QUIZ};
  });
  ensure(selected.length===10 && new Set(selected.map(q=>q.id)).size===10,"QuizCard parity failed");
  write(CARD,{collection_id:"oslo_aav_ostbanestasjonen_v1_20261027",categoryId:"by",title:"Østbanestasjonen – Oslo",cardFormatRule:"single_surface_top10_with_answer_key",sourceBasis:"Kildekontrollerte canonical quizspørsmål fra "+QUIZ,cards:[{
    card_id:"by_quizkort_ostbanestasjonen",categoryId:"by",targetId:ID,
    title:"Østbanestasjonen",subtitle:"Ti spørsmål om stasjonens historie",order:1,
    format:"single_surface_top10_with_answer_key",questionCount:10,questions:selected,answerKey:selected.map(q=>({number:q.number,answer:q.answer,answerIndex:q.answerIndex})),sourceFile:QUIZ
  }]});
  const manifest=read(CARD_MANIFEST);
  const leaf=path.basename(CARD);
  if(!manifest.collections.includes(leaf))manifest.collections.push(leaf);
  write(CARD_MANIFEST,manifest);
  console.log("QuizCard 10/10 materialized from linked quiz; no duplicate question bank.");
}
