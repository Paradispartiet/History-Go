#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const files=[
  'data/Civication/careerGameplayMatrix.json',
  'reports/civication-career-gameplay-matrix.md',
  'data/Civication/lifePositionRoleWorldReadiness.json',
  'reports/civication-life-position-role-world-readiness.md'
];
const before=Object.fromEntries(files.map(rel=>[rel,fs.readFileSync(path.join(ROOT,rel),'utf8')]));
const parse=(rel,text)=>rel.endsWith('.json')?JSON.parse(text):null;
const oldCareer=parse(files[0],before[files[0]]);
const oldReady=parse(files[2],before[files[2]]);
function keyedDiff(oldArr,newArr){
  const a=new Map((oldArr||[]).map(x=>[x.key,JSON.stringify(x)]));
  const b=new Map((newArr||[]).map(x=>[x.key,JSON.stringify(x)]));
  return [...new Set([...a.keys(),...b.keys()])].filter(k=>a.get(k)!==b.get(k));
}
let diagnostic={};
try{
  execFileSync(process.execPath,['scripts/audit-civication-career-gameplay.mjs','--write'],{cwd:ROOT,stdio:'pipe'});
  execFileSync(process.execPath,['scripts/audit-civication-life-position-role-world-readiness.mjs','--write'],{cwd:ROOT,stdio:'pipe'});
  const newCareer=JSON.parse(fs.readFileSync(path.join(ROOT,files[0]),'utf8'));
  const newReady=JSON.parse(fs.readFileSync(path.join(ROOT,files[2]),'utf8'));
  const changedCareerWorlds=keyedDiff(oldCareer.worlds,newCareer.worlds);
  const changedNoncareer=keyedDiff(oldCareer.noncareer_worlds,newCareer.noncareer_worlds);
  const changedSupport=keyedDiff(oldCareer.support_worlds,newCareer.support_worlds);
  diagnostic={
    career:{
      oldSummary:oldCareer.summary,
      newSummary:newCareer.summary,
      changedWorlds:changedCareerWorlds,
      changedNoncareer,
      changedSupport,
      rows:Object.fromEntries([...changedCareerWorlds,...changedNoncareer,...changedSupport].slice(0,30).map(key=>{
        const find=(obj)=>[...(obj.worlds||[]),...(obj.noncareer_worlds||[]),...(obj.support_worlds||[])].find(x=>x.key===key)||null;
        return [key,{old:find(oldCareer),new:find(newCareer)}];
      }))
    },
    readiness:{
      oldSummary:oldReady.summary,
      newSummary:newReady.summary,
      changedPositions:keyedDiff(oldReady.positions,newReady.positions),
      oldQueue:oldReady.queue,
      newQueue:newReady.queue,
      oldFirstReady:oldReady.first_ready,
      newFirstReady:newReady.first_ready,
      rows:Object.fromEntries(keyedDiff(oldReady.positions,newReady.positions).map(key=>[
        key,
        {old:(oldReady.positions||[]).find(x=>x.key===key)||null,new:(newReady.positions||[]).find(x=>x.key===key)||null}
      ]))
    }
  };
} finally {
  for(const [rel,text] of Object.entries(before)) fs.writeFileSync(path.join(ROOT,rel),text);
}
console.log('GENERATOR_PARITY_DIAGNOSTIC');
console.log(JSON.stringify(diagnostic,null,2));
throw new Error('intentional fail-closed generator parity diagnostic; remove before merge');
