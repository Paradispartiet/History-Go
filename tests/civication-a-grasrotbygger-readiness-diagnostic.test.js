#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const p=path.join(ROOT,'data/Civication/lifePositionRoleWorldReadiness.json');
const before=JSON.parse(fs.readFileSync(p,'utf8'));
execFileSync(process.execPath,[path.join(ROOT,'scripts/audit-civication-life-position-role-world-readiness.mjs'),'--write'],{cwd:ROOT,stdio:['ignore','pipe','pipe']});
const after=JSON.parse(fs.readFileSync(p,'utf8'));
const diffs=[];
function walk(a,b,key){
 if(Array.isArray(a)&&Array.isArray(b)){
  if(a.length!==b.length)diffs.push([key+'.length',a.length,b.length]);
  const n=Math.max(a.length,b.length);for(let i=0;i<n;i++)walk(a[i],b[i],key+'['+i+']');
  return;
 }
 if(a&&b&&typeof a==='object'&&typeof b==='object'){
  for(const k of [...new Set([...Object.keys(a),...Object.keys(b)])].sort())walk(a[k],b[k],key?key+'.'+k:k);
  return;
 }
 if(JSON.stringify(a)!==JSON.stringify(b))diffs.push([key,a,b]);
}
walk(before,after,'');
const compact=diffs.map((d,i)=>i+':'+d[0]+'='+JSON.stringify(d[1])+'->'+JSON.stringify(d[2])).join('\n');
throw new Error('GRASROTBYGGER_DIFF_COUNT='+diffs.length+'\n'+compact.slice(0,12000));
