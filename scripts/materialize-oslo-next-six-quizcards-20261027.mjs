// Scoped data integration for the six existing Oslo places. Uses the canonical builders.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {runBuildQuizProductionContext} from './build-quiz-production-context.mjs';
const scope={kontraskjaeret:'historie',palehaven_paleet:'historie',avisen_tiden_radhusgata_10:'historie',egertorget:'by',mustadgarden_kongens_gate_3:'historie',wessels_plass:'by'};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(p,d)=>fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
const manifest=read('data/fag/fag_manifest.json');
const qm=read('data/quiz/manifest.json');
for(const [id,cat] of Object.entries(scope)){
 const file=`data/quiz/${cat}/${id}_sets.json`,quiz=read(file),brief=read(`data/quiz/production_briefs/${cat}/${id}.json`);
 if(quiz.targetId!==id||quiz.categoryId!==cat||brief.status!=='reviewed')throw Error('Unreviewed/mismatched '+id);
 manifest[cat].quizProduction.targets[id]={source_brief:`../quiz/production_briefs/${cat}/${id}.json`,context_artifact:`../quiz/production_context/${cat}/${id}.json`,quiz_file:`../quiz/${cat}/${id}_sets.json`};
 for(const s of quiz.sets){
  const existing=qm.sets.find(e=>e.targetId===id&&e.set_id===s.set_id);
  if(existing&&existing.file!==file)throw Error('Conflicting quiz owner '+id);
  if(!existing)qm.sets.push({targetId:id,file,set_id:s.set_id,order:s.order});
 }
}
write('data/fag/fag_manifest.json',manifest);write('data/quiz/manifest.json',qm);
for(const [id,cat] of Object.entries(scope)){
 const outputPath=`data/quiz/production_context/${cat}/${id}.json`;
 const ctx=await runBuildQuizProductionContext({categoryId:cat,targetId:id,outputPath});
 const file=`data/quiz/${cat}/${id}_sets.json`,quiz=read(file),s=ctx.selected_curriculum;
 quiz.production_context={manifest_category:cat,profile:ctx.profile,standard_version:'3.4',source_brief:`data/quiz/production_briefs/${cat}/${id}.json`,context_artifact:outputPath,resolved_files:Object.fromEntries(Object.entries(ctx.resolved_files).map(([key,v])=>[key,v.path])),required_inputs_loaded:ctx.required_inputs_loaded,pensum_module_ids:s.module_ids,emne_ids:s.emne_ids,topic_hook_ids:s.topic_hook_ids,method_ids:s.method_ids,thinker_ids:s.thinker_ids,works:s.works,source_review_status:ctx.source_review_status,existing_quiz_audit:ctx.existing_quiz_audit,profile_decision:ctx.profile_decision,held_back_candidates:ctx.held_back_candidates,theory_start_phase:'final',method_start_phase:'final'};
 write(file,quiz);
}
execFileSync(process.execPath,['--experimental-strip-types','scripts/knowledge-canonical-data.mts','--write'],{stdio:'inherit'});
const index=read('data/places/places_index.json');
function find(node,id){if(Array.isArray(node)){for(const v of node){const hit=find(v,id);if(hit)return hit;}}else if(node&&typeof node==='object'){if(node.id===id)return node;for(const key of ['places','items','data'])if(node[key]){const hit=find(node[key],id);if(hit)return hit;}}return null;}
for(const [id,cat] of Object.entries(scope)){
 const file=`data/quiz/${cat}/${id}_sets.json`,quiz=read(file),name=find(index,id)?.name||id;
 const facts=quiz.sets.flatMap(s=>s.questions).filter(q=>q.question_type==='fact').slice(0,10);
 if(facts.length!==10)throw Error('Need ten concrete factual card questions '+id);
 const questions=facts.map((q,i)=>({number:i+1,...Object.fromEntries(['question','options','answer','answerIndex','knowledge','difficulty','claim_id','emne_id','knowledge_link_status','primary_knowledge_unit_id','knowledge_unit_ids','concept_ids','term_ids','knowledge_contract_version'].map(k=>[k,q[k]])),sourceQuestionId:q.id,sourceQuizId:q.quiz_id,sourceQuizFile:file,source_urls:q.source,source_refs:q.source}));
 const card={card_id:`${cat}_quizkort_${id}_20261027`,categoryId:cat,targetId:id,title:name,subtitle:'Mennesker, hendelser og spor i byen',order:1,format:'single_surface_top10_with_answer_key',questionCount:10,questions,answerKey:questions.map(q=>({number:q.number,answer:q.answer,answerIndex:q.answerIndex})),sourceFile:file};
 const cardFile=`${id}_quizkort_v1.json`;
 write(`data/quizcards/${cat}/${cardFile}`,{collection_id:`${cat}_${id}_quizcards_20261027`,categoryId:cat,title:name+' – QuizCard',cardFormatRule:'single_surface_top10_with_answer_key',sourceBasis:'Ti kildekontrollerte faktaspørsmål fra stedets fullquiz, med canonical Knowledge-paritet.',production_status:'knowledge_linked_browser_review_pending',cards:[card]});
 const mp=`data/quizcards/${cat}/manifest.json`,m=read(mp);if(!m.collections.includes(cardFile))m.collections.push(cardFile);write(mp,m);
}
console.log('Materialized six fullquiz packages, 18 sets and 60 Knowledge-linked factual QuizCards. Browser QA remains a separate gate.');
