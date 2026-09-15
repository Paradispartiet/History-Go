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
  if(diffs.length>=120)return;
  if(Array.isArray(a)&&Array.isArray(b)){
    if(a.length!==b.length) diffs.push({path:key+'.length',before:a.length,after:b.length});
    const n=Math.max(a.length,b.length);for(let i=0;i<n&&diffs.length<120;i++)walk(a[i],b[i],key+'['+i+']');
    return;
  }
  if(a&&b&&typeof a==='object'&&typeof b==='object'){
    const ks=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
    for(const k of ks){if(diffs.length>=120)break;walk(a[k],b[k],key?key+'.'+k:k);}
    return;
  }
  if(JSON.stringify(a)!==JSON.stringify(b))diffs.push({path:key,before:a,after:b});
}
walk(before,after,'');
throw new Error('FUGLEKIKKER_GENERATOR_DIFF\n'+JSON.stringify(diffs,null,2));
