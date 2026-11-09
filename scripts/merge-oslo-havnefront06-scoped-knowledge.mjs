#!/usr/bin/env node
// Scoped canonical Knowledge release. Canonical generator runs first, then this
// extracts ONLY the 63 new source-grounded units and restores incidental global
// backfill changes. Existing quiz content and player progress IDs stay unchanged.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const run=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:64*1024*1024});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const targetFiles=[
'data/quiz/kunst/astrup_fearnley_oslo06_sets.json',
'data/quiz/naeringsliv/amerikalinjen_oslo06_sets.json',
'data/quiz/natur/akerselva_utlop_bjorvika_oslo06_sets.json'
];
const registryPath='data/knowledge/knowledge_units.generated.json';
const reportPath='reports/place-production/oslo-havnefront06-knowledge-handoff.json';
const expectedIds=new Set();
for(const file of targetFiles){
 const questions=read(file).sets.flatMap(s=>s.questions);
 if(questions.length!==21)throw Error('SCOPE_QUESTION_COUNT: '+file);
 for(const q of questions){
  if(q.knowledge_link_status!=='linked'||!q.primary_knowledge_unit_id?.startsWith('ku_')||!q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id))throw Error('UNLINKED_NEW_QUESTION: '+q.quiz_id);
  expectedIds.add(q.primary_knowledge_unit_id);
 }
}
if(expectedIds.size!==63)throw Error('SCOPE_CANONICAL_KU_COUNT_'+expectedIds.size);
const generated=read(registryPath),base=JSON.parse(run('show','HEAD:'+registryPath));
if(!Array.isArray(generated.units)||!Array.isArray(base.units))throw Error('REGISTRY_FORMAT_NOT_ARRAY');
const emitted=new Map(generated.units.map(x=>[x.knowledge_unit_id,x]));
const existing=new Map(base.units.map(x=>[x.knowledge_unit_id,x]));
const created=[];
for(const id of expectedIds){
 const u=emitted.get(id);
 if(!u)throw Error('CANONICAL_GENERATOR_MISSING_NEW_KU: '+id);
 if(existing.has(id))throw Error('CANONICAL_ID_COLLISION_IN_EXISTING_REGISTRY: '+id);
 if(!u.quiz_refs?.length||!u.sources?.length||!u.emne_ids?.length)throw Error('NEW_KU_INCOMPLETE: '+id);
 created.push(u);
}
const merged={...base,units:[...base.units,...created].sort((a,b)=>a.knowledge_unit_id.localeCompare(b.knowledge_unit_id,'en'))};
const manifest=read('data/quiz/manifest.json');
for(const file of targetFiles)if(!manifest.sets.some(x=>x.file===file))throw Error('MISSING_ACTIVE_QUIZ: '+file);
fs.writeFileSync(registryPath,JSON.stringify(merged)+'\n');
// Do not retain incidental global backfill edits to previously published quizzes.
// Only changed TRACKED files are addressed; new scoped files remain untouched.
const keep=new Set([registryPath,'data/quiz/manifest.json',...targetFiles]);
const changed=run('diff','--name-only').trim().split('\n').filter(Boolean);
const restored=[];
for(const file of changed){
 if(keep.has(file))continue;
 if(file.startsWith('data/quiz/')||file.startsWith('data/knowledge/')||file.startsWith('reports/knowledge-')){
   run('restore','--',file);
   restored.push(file);
 }else throw Error('UNEXPECTED_GLOBAL_GENERATOR_CHANGE: '+file);
}
fs.mkdirSync('reports/place-production',{recursive:true});
fs.writeFileSync(reportPath,JSON.stringify({schema:'oslo_havnefront06_scoped_knowledge_v1',verifiedAt:'2026-11-09',registryPath,unchangedExistingUnits:base.units.length,newUnits:created.length,newIds:[...expectedIds].sort(),restoredIncidentalFiles:restored,sourceQuizFiles:targetFiles,policy:'No changes to old quiz data, old Knowledge IDs or quiz progression'},null,2)+'\n');
console.log('OSLO06_KNOWLEDGE_INCREMENTAL_PASS',created.length,'new KUs; preserved',base.units.length,'older KUs; restored',restored.length,'unrelated files');
