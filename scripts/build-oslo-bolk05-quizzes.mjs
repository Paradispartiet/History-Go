#!/usr/bin/env node
// Oslo sentrum bolk 05: scoped, deterministic source-first 3x7 quiz and Top-10 cards.
// Never changes canonical Place text, other Oslo batches, or unrelated quizzes.
import fs from 'node:fs';
import path from 'node:path';

const MODE=process.argv.includes('--write')?'write':process.argv.includes('--sync-cards')?'sync-cards':process.argv.includes('--check')?'check':'';
if(!MODE)throw Error('Use --write, --sync-cards or --check');
const base='reports/place-production/';
const config=[
  {id:'kunstnernes_hus',slug:'kunstnernes-hus',cat:'kunst',title:'Kunstnernes Hus',
   emne:['em_kunst_institusjoner_kanon','em_kunst_institusjoner_kanon','em_kunst_institusjonskritikk_og_representasjon'],method:'Kunstinstitusjonsanalyse'},
  {id:'historisk_museum',slug:'historisk-museum',cat:'historie',title:'Historisk museum',
   emne:['em_his_historiske_lag_i_byrom','em_his_spor_materialitet','em_his_kulturminner_bevaring'],method:'Sporlesning'},
  {id:'ibsen_museum_teater',slug:'ibsen-museum-teater',cat:'litteratur',title:'IBSEN Museum & Teater',
   emne:['em_lit_litteraere_steder_og_bytekst','em_lit_litteraturfelt_institusjoner','em_lit_litteratur_og_offentlig_debatt'],method:'Formidlingsanalyse'},
  {id:'blitzhuset',slug:'blitzhuset',cat:'subkultur',title:'Blitzhuset',
   emne:['em_sub_sted_scene','em_sub_autonomi_motstand','em_sub_rett_til_byen'],method:'Romlig maktanalyse'},
  {id:'kulturkirken_jakob_litteratur',slug:'kulturkirken-jakob-litteratur',cat:'musikk',title:'Kulturkirken Jakob',
   emne:['em_musikk_festival_sceneinfrastruktur','em_musikk_arbeid_bransje_okonomi','em_musikk_identitet_subkultur_tilhorighet'],method:'Scene'}
];
const selections=read(base+'oslo-bolk05-quizcards50-candidates-20261101.json');
const qManifestPath='data/quiz/manifest.json';
const qManifest=read(qManifestPath);
const reportPath=base+'oslo-bolk05-quiz105-production-audit-20261101.json';
const edits=new Map();
const audit=[];
function read(p){return JSON.parse(fs.readFileSync(p,'utf8'));}
function write(p,obj){edits.set(p,JSON.stringify(obj,null,2)+'\n');}
function records(data){return Array.isArray(data)?data:Array.isArray(data?.places)?data.places:[data];}
function collect(value,key,result=[]){
  if(Array.isArray(value)) for(const x of value)collect(x,key,result);
  else if(value&&typeof value==='object'){
    if(typeof value[key]==='string')result.push(value);
    for(const v of Object.values(value)) if(v&&typeof v==='object')collect(v,key,result);
  }
  return result;
}
function validateCandidate(cand,conf){
  if(cand.targetId!==conf.id||cand.categoryId!==conf.cat||
     cand.set_profile!=='3x7'||cand.questions.length!==21)throw Error('Candidate shape '+conf.id);
  const source=read(cand.sourcePlace), place=records(source).find(x=>x.id===conf.id);
  const packet=read(cand.sourcePacket);
  if(!place||!packet||packet.placeId!==conf.id||place.category!==conf.cat)
    throw Error('Canonical place/packet/category conflict '+conf.id);
  const claimIds=new Set(packet.claims.filter(x=>x.status==='verified').map(x=>x.id));
  const F=read('data/fag/'+conf.cat+'/emner_'+conf.cat+'_canonical_v4_5.json');
  const validEmne=new Set(collect(F,'emne_id').map(x=>x.emne_id));
  for(const e of conf.emne)if(!validEmne.has(e))throw Error('Unknown Fagverk emne '+e+' in '+conf.id);
  const M=read('data/fag/'+conf.cat+'/methods_'+conf.cat+'_canonical_v4_5.json');
  const methods=collect(M,'method_id');
  const method=methods.find(x=>(x.title||x.name||'').toLowerCase().includes(conf.method.toLowerCase()));
  if(!method)throw Error('No canonical method matching '+conf.method+' for '+conf.id);
  const sorted=[...cand.questions].sort((a,b)=>a.set-b.set||a.order-b.order);
  const ids=new Set(),questions=new Set();
  for(let index=0;index<sorted.length;index++){
    const q=sorted[index],level=Math.floor(index/7)+1,order=index%7+1;
    if(q.set!==level||q.order!==order)throw Error('3x7 order mismatch '+q.candidate_id);
    if(ids.has(q.candidate_id)||questions.has(q.question))throw Error('Repeated quiz ID/question '+q.candidate_id);
    ids.add(q.candidate_id);questions.add(q.question);
    if(!claimIds.has(q.claim_id))throw Error('Unverified source claim '+q.claim_id+' for '+conf.id);
    if(!Array.isArray(q.options)||q.options.length<3||
       new Set(q.options).size!==q.options.length||
       q.answerIndex<0||q.answerIndex>=q.options.length||
       q.options[q.answerIndex]!==q.answer)throw Error('Answer/options invalid '+q.candidate_id);
    if(!Array.isArray(q.source_urls)||q.source_urls.length===0||
       q.source_urls.some(x=>!/^https:\/\//.test(x)))throw Error('Missing external evidence '+q.candidate_id);
    if(!q.knowledge||q.knowledge.length<20)throw Error('Missing explanation '+q.candidate_id);
  }
  return {sorted,method:method.method_id};
}
function quizPath(conf){return 'data/quiz/'+conf.cat+'/'+conf.id+'_sets.json';}
function cardPath(conf){return 'data/quizcards/'+conf.cat+'/'+conf.id+'_quizkort_v1.json';}
function setId(conf,level){return conf.cat+'_'+conf.id+'_set_'+level;}
function buildQuiz(conf,cand,v){
  const sourceUrls=[...new Set(v.sorted.flatMap(q=>q.source_urls))];
  const levels=[
    {title:'Sted og historisk identitet',phase:'opening'},
    {title:'Bygning, institusjon og historiske skifter',phase:'bridge'},
    {title:'Kilder, tolkning og samfunn',phase:'advanced'}
  ];
  const sets=levels.map((s,i)=>({
    set_id:setId(conf,i+1),title:s.title,level:i+1,order:i+1,phase:s.phase,xp:50,
    questions:v.sorted.slice(i*7,i*7+7).map((q,n)=>({
      id:q.candidate_id,quiz_id:setId(conf,i+1)+'_q'+(n+1),
      categoryId:conf.cat,targetId:conf.id,placeId:conf.id,question_scope:'place',
      question:q.question,options:q.options,answer:q.answer,answerIndex:q.answerIndex,
      knowledge:q.knowledge,explanation:q.knowledge,difficulty:i+1,
      question_type:i===0?'fact':i===1?'context':'interpretation',
      question_layer:i===0?'place_intro':i===1?'bridge':'final',
      emne_id:conf.emne[i],
      ...(i===2?{method_id:v.method}:{}),
      source:q.source_urls,source_urls:q.source_urls,source_origin:'external',
      claim_id:q.claim_id,claim_basis:q.knowledge,
      tags:[conf.id,conf.cat,'oslo_bolk05_20261101'],
      knowledge_contract_version:1
    }))
  }));
  return {targetId:conf.id,categoryId:conf.cat,generator_version:'history_go_source_review_oslo_bolk05_v1',
    size_class:'narrow',sources:sourceUrls,
    production_context:{sourceCandidates:base+'oslo-bolk05-'+conf.slug+'-quiz21-candidates-20261101.json',
      sourcePacket:cand.sourcePacket,categoryId:conf.cat,
      fagverkEmneIds:conf.emne,finalMethodId:v.method,
      review:'source_claims_and_fagverk_validated_browser_qa_pending'},
    sets};
}
function buildCard(conf,quiz,selection){
  const all=quiz.sets.flatMap(x=>x.questions), byId=new Map(all.map(q=>[q.id,q]));
  if(selection.sourceQuestionIds.length!==10||new Set(selection.sourceQuestionIds).size!==10)
    throw Error('Card selection not 10 unique questions '+conf.id);
  const chosen=selection.sourceQuestionIds.map((id,i)=>{
    const q=byId.get(id);
    if(!q)throw Error('QuizCard missing fullquiz question '+id);
    return {...q,number:i+1,sourceQuestionId:q.id,sourceQuizId:q.quiz_id,
      sourceQuizFile:quizPath(conf),source_urls:q.source_urls,source_refs:q.source_urls};
  });
  return {collection_id:'oslo_bolk05_'+conf.id+'_v1_20261101',categoryId:conf.cat,
    title:conf.title+' – ti spørsmål',cardFormatRule:'single_surface_top10_with_answer_key',
    sourceBasis:'Canonical fullquiz og eksplisitte, eksterne kildepåstander',
    production_status:chosen.every(q=>Array.isArray(q.knowledge_unit_ids)&&q.knowledge_unit_ids.length>0)?
      'knowledge_linked_browser_review_pending':'knowledge_generation_and_browser_review_pending',
    cards:[{card_id:conf.cat+'_quizkort_'+conf.id+'_v1',categoryId:conf.cat,targetId:conf.id,
      title:conf.title,subtitle:'Sted, historie og kildeforståelse',order:1,
      format:'single_surface_top10_with_answer_key',questionCount:10,questions:chosen}]};
}
function ensureManifest(conf){
  const entry={targetId:conf.id,categoryId:conf.cat,file:quizPath(conf)};
  if(qManifest.sets.some(x=>x.targetId===conf.id))throw Error('Quiz target already registered '+conf.id);
  const where=qManifest.sets.findIndex(x=>x.targetId.localeCompare(conf.id,'nb')>0);
  if(where===-1)qManifest.sets.push(entry);else qManifest.sets.splice(where,0,entry);
  const p='data/quizcards/'+conf.cat+'/manifest.json',man=read(p);
  const filename=path.basename(cardPath(conf));
  if(man.collections.includes(filename))throw Error('Card already in manifest '+conf.id);
  man.collections.push(filename);
  write(p,man);
}
function checkLinked(question){
  return Array.isArray(question.knowledge_unit_ids)&&question.knowledge_unit_ids.length>0&&
    question.knowledge_link_status==='linked'&&
    question.primary_knowledge_unit_id===question.knowledge_unit_ids[0];
}
for(const conf of config){
  const cand=read(base+'oslo-bolk05-'+conf.slug+'-quiz21-candidates-20261101.json');
  const validation=validateCandidate(cand,conf);
  const selection=selections.collections.find(x=>x.placeId===conf.id&&x.categoryId===conf.cat);
  if(!selection)throw Error('No Top10 selection '+conf.id);
  if(MODE==='write'){
    if(fs.existsSync(quizPath(conf))||fs.existsSync(cardPath(conf)))
      throw Error('Do not overwrite existing active quiz/card '+conf.id);
    const quiz=buildQuiz(conf,cand,validation);
    write(quizPath(conf),quiz);
    write(cardPath(conf),buildCard(conf,quiz,selection));
    ensureManifest(conf);
  }else{
    const quiz=read(quizPath(conf)),card=read(cardPath(conf));
    const qs=quiz.sets.flatMap(x=>x.questions);
    if(quiz.sets.length!==3||qs.length!==21||qs.some(q=>!checkLinked(q)))
      throw Error('Fullquiz not 21 Knowledge-linked questions '+conf.id);
    const rebuilt=buildCard(conf,quiz,selection);
    if(rebuilt.production_status!=='knowledge_linked_browser_review_pending')
      throw Error('QuizCard source Knowledge missing '+conf.id);
    if(MODE==='sync-cards')write(cardPath(conf),rebuilt);
    else if(JSON.stringify(rebuilt)!==JSON.stringify(card))
      throw Error('QuizCard/fullquiz drift '+conf.id);
    const qRefs=qManifest.sets.filter(x=>x.targetId===conf.id);
    const cardMan=read('data/quizcards/'+conf.cat+'/manifest.json');
    if(qRefs.length!==1||qRefs[0].file!==quizPath(conf)||
       !cardMan.collections.includes(path.basename(cardPath(conf))))
       throw Error('Quiz or card not registered '+conf.id);
  }
  audit.push({placeId:conf.id,categoryId:conf.cat,fullQuizQuestions:21,quizCards:10,
    sourceClaimsValidated:true,fagverkEmneIds:conf.emne,methodId:validation.method,
    status:'knowledge_and_manifest_linked_browser_review_pending'});
}
if(MODE==='write'){
  write(qManifestPath,qManifest);
  write(reportPath,{schema:'history_go_oslo_bolk05_quiz105_audit_v1',createdAt:'2026-11-01',
    status:'production_files_created_knowledge_and_browser_check_pending',
    fullQuizTotal:105,quizCardTotal:50,places:audit});
}
for(const [p,c] of edits){fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,c);}
console.log('OSLO_BOLK05_QUIZ',MODE,config.length,'places',105,'fullquiz',50,'QuizCards');
