#!/usr/bin/env node
// Three-place scoped, source-first quiz + QuizCard materialization.
// Does not rewrite older quiz IDs, alter difficulty policy, or claim v1 completion.
// Usage: node scripts/build-oslo-havnefront06-quizzes.mjs [--cards-only]
import fs from 'node:fs';
const plans=[
 {category:'kunst',id:'astrup_fearnley',label:'Astrup Fearnley Museet',subtitle:'Museum, arkitektur og skulpturpark',pilot:true},
 {category:'naeringsliv',id:'amerikalinjen',label:'Amerikalinjen',subtitle:'Kontor, Amerikabåt og havnekai',pilot:true},
 {category:'natur',id:'akerselva_utlop_bjorvika',label:'Akerselvas utløp',subtitle:'Elv, havn og gjenåpnet byrom',pilot:false}
];
const cardsOnly=process.argv.includes('--cards-only');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,j)=>{fs.mkdirSync(p.slice(0,p.lastIndexOf('/')),{recursive:true});fs.writeFileSync(p,JSON.stringify(j,null,2)+'\n')};
const quizManifestPath='data/quiz/manifest.json';
const quizManifest=read(quizManifestPath);
for(const plan of plans){
 const {category,id,label,subtitle,pilot}=plan;
 const briefPath='data/quiz/production_briefs/'+category+'/'+id+'.json';
 const quizPath='data/quiz/'+category+'/'+id+'_oslo06_sets.json';
 const cardPath='data/quizcards/'+category+'/'+id+'_quizcard_v1.json';
 const cardManifestPath='data/quizcards/'+category+'/manifest.json';
 const brief=read(briefPath);
 if(brief.categoryId!==category||brief.targetId!==id||brief.status!=='reviewed'||brief.claims?.length!==21||brief.candidate_questions?.length!==21)throw Error('SOURCE_BRIEF_INVALID: '+id);
 if(!brief.profile_decision?.confirmed||brief.profile_decision?.profile!=='narrow'||brief.profile_decision.set_count!==3||brief.profile_decision.questions_per_set!==7)throw Error('SOURCE_PROFILE_NOT_READY: '+id);
 const byClaim=new Map(brief.claims.map(c=>[c.claim_id,c]));
 const officialUrls=Object.fromEntries(Object.entries(brief.sources).map(([key,v])=>[key,v.url]));
 if(cardsOnly&&!fs.existsSync(quizPath))throw Error('MISSING_ACTIVATED_QUIZ: '+id);
 if(!cardsOnly&&fs.existsSync(quizPath))throw Error('EXISTING_QUIZ_MUST_NOT_BE_OVERWRITTEN: '+id);
 let artifact=null;
 if(!cardsOnly&&pilot){
   artifact=read('data/quiz/production_context/'+category+'/'+id+'.json');
   if(artifact.profile!=='narrow_3x7'||artifact.claim_bank.length!==21||artifact.set_plan.length!==3)throw Error('UNMATCHED_PRODUCTION_CONTEXT: '+id);
 }
 if(!cardsOnly){
   const sets=Array.from({length:3},(_,si)=>{
     const set_id=category+'_'+id+'_set_'+(si+1);
     const slice=brief.candidate_questions.slice(si*7,si*7+7);
     const phase=['opening','bridge','final'][si];
     const questions=slice.map((item,qi)=>{
       const order=si*7+qi+1;
       const claim=byClaim.get(item.claim_id);
       if(!claim||claim.order!==order||claim.planned_phase!==phase||claim.statement!==item.knowledge||!item.source_ids?.every(s=>claim.source_ids.includes(s)))throw Error('CLAIM_OR_ORDER_MISMATCH: '+id+' '+order);
       const names=[item.answer,...item.distractors];
       if(new Set(names.map(x=>x.toLocaleLowerCase('nb-NO'))).size!==3||names.some(x=>typeof x!=='string'||x.length<2))throw Error('DUPLICATE_OR_BAD_OPTIONS: '+id+'/'+order);
       // Stable rotations, not hand-ordered answer keys. Runtime independently shuffles.
       const shift=(order-1)%3;
       const options=names.map((_,i)=>names[(i+shift)%3]);
       const answerIndex=options.indexOf(item.answer);
       if(answerIndex<0||options[answerIndex]!==item.answer)throw Error('ANSWER_KEY_MISMATCH: '+id+'/'+order);
       return {
         id:id+'_oslo06_quiz_'+String(order).padStart(2,'0'),
         quiz_id:set_id+'_q'+(qi+1),categoryId:category,targetId:id,placeId:id,question_scope:'place',
         question:item.question,options,answer:item.answer,answerIndex,
         knowledge:item.knowledge,explanation:item.knowledge,difficulty:item.difficulty,
         question_type:item.question_type,question_layer:phase,emne_id:claim.emne_id,
         ...(claim.method_id?{method_id:claim.method_id}:{}),
         source:claim.source_ids,source_urls:claim.source_ids.map(s=>officialUrls[s]),
         source_origin:'external',claim_id:claim.claim_id,claim_basis:claim.statement,
         tags:[category,id,'oslo_havnefront06_20261109'],concept_ids:[],term_ids:[],
         knowledge_contract_version:1,knowledge_link_status:'pending_generation'
       };
     });
     return {set_id,level:si+1,order:si+1,phase,planned_questions:7,questions_per_set:7,claim_ids:questions.map(q=>q.claim_id),title:[
       id==='astrup_fearnley'?'Fra Kvadraturen til Tjuvholmen':id==='amerikalinjen'?'Rederiet og rederibygningen':'Elv og havnemunning',
       id==='astrup_fearnley'?'Arkitektur og kunstsamling':id==='amerikalinjen'?'Passasjerens reise fra kontor til kai':'Kulvert og gjenåpnet elverom',
       id==='astrup_fearnley'?'Skulpturpark og kildekritikk':id==='amerikalinjen'?'Endret marked og nye funksjoner':'Elvebredde og vannkvalitet'
     ][si],questions};
   });
   const context=pilot?{
     manifest_category:category,profile:'narrow_3x7',standard_version:'3.4',
     source_brief:briefPath,context_artifact:'data/quiz/production_context/'+category+'/'+id+'.json',
     source_review_status:brief.status,existing_quiz_audit:brief.existing_quiz_audit,
     resolved_files:Object.fromEntries(Object.entries(artifact.resolved_files).map(([k,v])=>[k,v.path])),
     required_inputs_loaded:artifact.required_inputs_loaded,
     pensum_module_ids:artifact.selected_curriculum.module_ids,emne_ids:artifact.selected_curriculum.emne_ids,
     topic_hook_ids:artifact.selected_curriculum.topic_hook_ids,method_ids:artifact.selected_curriculum.method_ids,
     thinker_ids:artifact.selected_curriculum.thinker_ids,works:artifact.selected_curriculum.works,
     profile_decision:brief.profile_decision,held_back_candidates:brief.held_back_candidates
   }:{
     manifest_category:category,profile:'narrow_3x7',standard_version:'3.4',
     source_brief:briefPath,source_review_status:brief.status,
     existing_quiz_audit:brief.existing_quiz_audit,profile_decision:brief.profile_decision,
     held_back_candidates:brief.held_back_candidates,
     note:'Natur subject has no active quizProduction pilot; canonical fact/schema and runtime tests required, no fabricated context build.'
   };
   write(quizPath,{targetId:id,categoryId:category,generator_version:'oslo_havnefront06_source_20261109',size_class:'narrow',sources:officialUrls,production_context:context,sets});
   const existing=quizManifest.sets.filter(row=>row.targetId===id);
   if(existing.length)throw Error('DUPLICATE_QUIZ_MANIFEST_TARGET: '+id);
   for(const set of sets)quizManifest.sets.push({categoryId:category,targetId:id,file:quizPath,set_id:set.set_id,order:set.order});
   console.log('OSLO06_QUIZ_STAGED',id,'3x7');
 }
 const actualQuiz=read(quizPath),allQs=actualQuiz.sets.flatMap(s=>s.questions),selected=brief.quizCard_candidate_source_question_numbers;
 if(!Array.isArray(selected)||selected.length!==10||new Set(selected).size!==10)throw Error('QUIZCARD_SELECTION_INVALID: '+id);
 const cardQuestions=selected.map((number,index)=>{
   const q=allQs[number-1];
   if(!q||q.answer!==q.options[q.answerIndex]||q.claim_id!==brief.claims[number-1].claim_id)throw Error('QUIZCARD_PARITY_BROKEN: '+id);
   return {...q,number:index+1,sourceQuestionId:q.id,sourceQuizId:q.quiz_id,sourceQuizFile:quizPath,source_refs:q.source_urls};
 });
 const existingManifest=read(cardManifestPath);
 if(!cardsOnly && existingManifest.collections.includes(id+'_quizcard_v1.json'))throw Error('DUPLICATE_QUIZCARD_COLLECTION: '+id);
 write(cardPath,{collection_id:category+'_'+id+'_oslo06_v1',categoryId:category,title:label+' – 10 spørsmål',cardFormatRule:'single_surface_top10_with_answer_key',sourceBasis:'21 source-reviewed claims; 10 questions reused verbatim from active fullquiz',production_status:'source_and_knowledge_pending_browser_review',cards:[{card_id:category+'_quizkort_'+id+'_oslo06',categoryId:category,targetId:id,title:label,subtitle,order:1,format:'single_surface_top10_with_answer_key',questionCount:10,questions:cardQuestions}]});
 if(!cardsOnly){
   existingManifest.collections.push(id+'_quizcard_v1.json');
   write(cardManifestPath,existingManifest);
 }
 console.log('OSLO06_QUIZCARD_WRITTEN',id,cardQuestions.length,cardQuestions.every(q=>q.quiz_id===allQs.find(x=>x.id===q.id)?.quiz_id));
}
if(!cardsOnly){write(quizManifestPath,quizManifest);console.log('OSLO06_QUIZ_MANIFEST_ENTRIES_ADDED',9)}
