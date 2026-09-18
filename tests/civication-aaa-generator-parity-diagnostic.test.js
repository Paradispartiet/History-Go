#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const FILES={
  career:'data/Civication/careerGameplayMatrix.json',
  careerReport:'reports/civication-career-gameplay-matrix.md',
  readiness:'data/Civication/lifePositionRoleWorldReadiness.json',
  readinessReport:'reports/civication-life-position-role-world-readiness.md'
};
const before=Object.fromEntries(Object.values(FILES).map(rel=>[rel,fs.readFileSync(path.join(ROOT,rel),'utf8')]));
const oldCareer=JSON.parse(before[FILES.career]);
const oldReady=JSON.parse(before[FILES.readiness]);
const short=v=>{
  if(Array.isArray(v)) return v.length>12?[...v.slice(0,12),`…+${v.length-12}`]:v;
  if(typeof v==='string'&&v.length>180) return v.slice(0,177)+'…';
  return v;
};
function diffPaths(a,b,p='',out=[]){
  if(JSON.stringify(a)===JSON.stringify(b)) return out;
  if(Array.isArray(a)&&Array.isArray(b)){
    if(a.every(x=>typeof x!=='object')&&b.every(x=>typeof x!=='object')){
      out.push({p,old:short(a),new:short(b)});
      return out;
    }
    if(a.length!==b.length) out.push({p:p+'.length',old:a.length,new:b.length});
    const n=Math.min(a.length,b.length);
    for(let i=0;i<n&&out.length<24;i++) diffPaths(a[i],b[i],`${p}[${i}]`,out);
    return out;
  }
  if(a&&b&&typeof a==='object'&&typeof b==='object'){
    for(const k of [...new Set([...Object.keys(a),...Object.keys(b)])]){
      if(out.length>=24) break;
      diffPaths(a[k],b[k],p?`${p}.${k}`:k,out);
    }
    return out;
  }
  out.push({p,old:short(a),new:short(b)});
  return out;
}
function keyed(oldArr,newArr){
  const a=new Map((oldArr||[]).map(x=>[x.key,x]));
  const b=new Map((newArr||[]).map(x=>[x.key,x]));
  return [...new Set([...a.keys(),...b.keys()])]
    .filter(k=>JSON.stringify(a.get(k))!==JSON.stringify(b.get(k)))
    .map(k=>({key:k,diff:diffPaths(a.get(k),b.get(k)).slice(0,16)}));
}
function lineDiff(a,b){
  const aa=a.split('\n'),bb=b.split('\n'),out=[];
  const n=Math.max(aa.length,bb.length);
  for(let i=0;i<n&&out.length<20;i++) if(aa[i]!==bb[i]) out.push({line:i+1,old:short(aa[i]),new:short(bb[i])});
  return out;
}
let diagnostic;
try{
  execFileSync(process.execPath,['scripts/audit-civication-career-gameplay.mjs','--write'],{cwd:ROOT,stdio:'pipe'});
  execFileSync(process.execPath,['scripts/audit-civication-life-position-role-world-readiness.mjs','--write'],{cwd:ROOT,stdio:'pipe'});
  const newCareer=JSON.parse(fs.readFileSync(path.join(ROOT,FILES.career),'utf8'));
  const newReady=JSON.parse(fs.readFileSync(path.join(ROOT,FILES.readiness),'utf8'));
  const newCareerReport=fs.readFileSync(path.join(ROOT,FILES.careerReport),'utf8');
  const newReadyReport=fs.readFileSync(path.join(ROOT,FILES.readinessReport),'utf8');
  diagnostic={
    career:{
      summaryDiff:diffPaths(oldCareer.summary,newCareer.summary),
      worlds:keyed(oldCareer.worlds,newCareer.worlds),
      noncareer:keyed(oldCareer.noncareer_worlds,newCareer.noncareer_worlds),
      support:keyed(oldCareer.support_worlds,newCareer.support_worlds),
      reportChanged:before[FILES.careerReport]!==newCareerReport,
      reportDiff:lineDiff(before[FILES.careerReport],newCareerReport)
    },
    readiness:{
      summaryDiff:diffPaths(oldReady.summary,newReady.summary),
      positions:keyed(oldReady.positions,newReady.positions),
      oldQueue:(oldReady.queue||[]).map(x=>x.key),
      newQueue:(newReady.queue||[]).map(x=>x.key),
      firstReady:{old:oldReady.first_ready?.key||null,new:newReady.first_ready?.key||null},
      reportChanged:before[FILES.readinessReport]!==newReadyReport,
      reportDiff:lineDiff(before[FILES.readinessReport],newReadyReport)
    }
  };
} finally {
  for(const [rel,text] of Object.entries(before)) fs.writeFileSync(path.join(ROOT,rel),text);
}
throw new Error('GENERATOR_PARITY '+JSON.stringify(diagnostic));
