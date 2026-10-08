#!/usr/bin/env node
// Registers already-authored quiz packages. No rewriting questions, answers or quiz runtime.
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
const root=process.cwd();
const json=async file=>JSON.parse(await readFile(path.join(root,file),"utf8"));
const load=async file=>{try{return await json(file)}catch{return null}};
const good=s=>typeof s==="string"&&s.trim().length>0;
const as=a=>Array.isArray(a)?a:[];
const posix=s=>s.split(path.sep).join("/");
const ignored=new Set(["arkiv","regler","production_briefs","production_context"]);
const reportPath="reports/quiz-registration-report.json";
async function walk(dir,list=[]){
  for(const v of await readdir(path.join(root,dir),{withFileTypes:true})){
    if(v.name.startsWith("."))continue;
    const p=posix(path.join(dir,v.name));
    if(v.isDirectory()&&!ignored.has(v.name))await walk(p,list);
    else if(v.isFile()&&v.name.endsWith(".json"))list.push(p);
  }
  return list;
}
function collectEntities(value,ids,kind){
  if(Array.isArray(value)){for(const x of value)collectEntities(x,ids,kind);return}
  if(!value||typeof value!=="object")return;
  if(good(value.id) && (kind==="place"
    ? (good(value.name)||Number.isFinite(value.lat)||value.placeScope)
    : (good(value.name)||good(value.fullName)||good(value.title))
  ))ids.add(value.id);
  for(const field of ["items","places","people","data"]){
    if(value[field])collectEntities(value[field],ids,kind);
  }
}
async function entityIds(kind){
  const m=await json(kind==="place"?"data/places/manifest.json":"data/people/manifest.json");
  const ids=new Set();
  for(const f of as(m.files)){
    const data=await load("data/"+f);
    if(data)collectEntities(data,ids,kind);
  }
  return ids;
}
function targetIds(q){return[q.targetId,q.placeId,q.personId].filter(good)}
function checkQuestion(q,target,category){
  if(!good(q?.id)||!good(q?.question)||!good(q?.categoryId)
    ||!good(q?.answer)||!Array.isArray(q?.options)||q.options.length<2)return "missing_question_fields";
  if(!targetIds(q).includes(target))return "question_target_mismatch";
  if(q.categoryId!==category)return "question_category_mismatch";
  const index=Number.isInteger(q.answerIndex)?q.answerIndex:q.options.indexOf(q.answer);
  if(index<0||index>=q.options.length||q.options[index]!==q.answer)return "answer_mismatch";
  return null;
}
function validSingleTargetPackage(data){
  if(!data||!good(data.targetId)||!good(data.categoryId)||!as(data.sets).length)return {ok:false,reason:"not_single_target_set_package"};
  const seen=new Set();
  for(const block of data.sets){
    if(!good(block?.set_id)||seen.has(block.set_id))return{ok:false,reason:"missing_or_duplicate_set_id"};
    seen.add(block.set_id);
    if(!as(block.questions).length)return{ok:false,reason:"empty_set"};
    for(const q of block.questions){
      const error=checkQuestion(q,data.targetId,data.categoryId);
      if(error)return{ok:false,reason:error};
    }
  }
  return{ok:true};
}
const manifest=await json("data/quiz/manifest.json");
const allFiles=await walk("data/quiz");
const active=new Set([...as(manifest.files),...as(manifest.sets).map(e=>e.file)]);
const placeIds=await entityIds("place");
const peopleIds=await entityIds("person");
const activeByTarget=new Map();
for(const entry of as(manifest.sets)){
  const data=await load(entry.file);
  const ids=as(data?.sets).filter(s=>!good(entry.set_id)||s.set_id===entry.set_id).map(s=>s.set_id);
  if(!activeByTarget.has(entry.targetId))activeByTarget.set(entry.targetId,new Set());
  for(const id of ids)activeByTarget.get(entry.targetId).add(id);
}
const legacyQuestionIds=new Set();
for(const file of as(manifest.files)){
  const data=await load(file);
  for(const q of as(data))if(good(q?.id))legacyQuestionIds.add(q.id);
}
const registered=[],skipped=[],registeredLegacy=[];
for(const file of allFiles.sort()){
  if(active.has(file)||file==="data/quiz/manifest.json")continue;
  const data=await load(file);
  if(!data){skipped.push({file,reason:"unreadable_json"});continue}
  // Literature has a canonical assessment pathway: retired legacy banks must stay inactive.
  if (file === "data/quiz/quiz_litteratur_from_populaerkultur.json") {
    skipped.push({file,reason:"retired_literature_legacy_bank"});
    continue;
  }
  // Standalone legacy banks only when no ID conflicts and every question is playable.
  if(Array.isArray(data)&&data.length&&data.every(q=>good(q?.question)&&Array.isArray(q.options))){
    const ids=new Set();let failure=null;
    for(const q of data){
      const target=q.targetId||q.personId||q.placeId;
      if(!good(target)||(!placeIds.has(target)&&!peopleIds.has(target))) {failure="unknown_legacy_target";break}
      failure=checkQuestion(q,target,q.categoryId);
      if(failure)break;
      if(ids.has(q.id)||legacyQuestionIds.has(q.id)){failure="duplicate_legacy_question_id";break}
      ids.add(q.id);
    }
    if(failure)skipped.push({file,reason:failure});
    else{
      manifest.files.push(file);
      for(const id of ids)legacyQuestionIds.add(id);
      registeredLegacy.push({file,questions:data.length});
    }
    continue;
  }
  if(!data||!Array.isArray(data.sets)||!data.sets.length)continue;
  const checked=validSingleTargetPackage(data);
  if(!checked.ok){skipped.push({file,targetId:data.targetId||null,reason:checked.reason});continue}
  const targetId=data.targetId;
  if(!placeIds.has(targetId)&&!peopleIds.has(targetId)){skipped.push({file,targetId,reason:"not_in_canonical_place_or_people"});continue}
  const already=activeByTarget.get(targetId)||new Set();
  const newBlocks=data.sets.filter(s=>!already.has(s.set_id));
  if(!newBlocks.length){skipped.push({file,targetId,reason:"all_set_ids_already_registered"});continue}
  // Explicit entries preserve existing set order/identity if a target has more than one file.
  for(const block of newBlocks){
    manifest.sets.push({targetId,file,set_id:block.set_id,order:Number.isFinite(block.order)?block.order:0});
    already.add(block.set_id);
  }
  activeByTarget.set(targetId,already);
  registered.push({file,targetId,categoryId:data.categoryId,sets:newBlocks.length,questions:newBlocks.reduce((sum,s)=>sum+s.questions.length,0)});
}
const output={
  schema:"history_go_quiz_registration_v1",
  registeredSetFiles:registered.length,
  registeredSets:registered.reduce((n,e)=>n+e.sets,0),
  registeredLegacyFiles:registeredLegacy.length,
  skippedCandidates:skipped.length,
  registered,
  registeredLegacy,
  skipped
};
if(process.argv.includes("--write")){
  await writeFile(path.join(root,"data/quiz/manifest.json"),JSON.stringify(manifest,null,2)+"\n");
  await mkdir(path.join(root,"reports"),{recursive:true});
  await writeFile(path.join(root,reportPath),JSON.stringify(output,null,2)+"\n");
}
console.log(JSON.stringify({registeredSetFiles:output.registeredSetFiles,registeredSets:output.registeredSets,registeredLegacyFiles:output.registeredLegacyFiles,skippedCandidates:output.skippedCandidates,reasons:Object.fromEntries([...new Set(skipped.map(x=>x.reason))].map(r=>[r,skipped.filter(s=>s.reason===r).length]))},null,2));
