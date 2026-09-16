#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const jsonPath=path.join(ROOT,'data/Civication/lifePositionRoleWorldReadiness.json');
const reportPath=path.join(ROOT,'reports/civication-life-position-role-world-readiness.md');
const beforeJson=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
const beforeReport=fs.readFileSync(reportPath,'utf8');
cp.execFileSync(process.execPath,[path.join(ROOT,'scripts/audit-civication-life-position-role-world-readiness.mjs'),'--write'],{cwd:ROOT,stdio:['ignore','pipe','pipe']});
const afterJson=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
const afterReport=fs.readFileSync(reportPath,'utf8');
const diffs=[];
function walk(a,b,p){
  if(JSON.stringify(a)===JSON.stringify(b)) return;
  if(Array.isArray(a)||Array.isArray(b)){
    diffs.push({path:p,before:a,after:b}); return;
  }
  if(a&&b&&typeof a==='object'&&typeof b==='object'){
    for(const k of [...new Set([...Object.keys(a),...Object.keys(b)])]) walk(a[k],b[k],p? p+'.'+k:k);
    return;
  }
  diffs.push({path:p,before:a,after:b});
}
walk(beforeJson,afterJson,'');
console.error('ETIKER_STRUCTURED_JSON_DIFF='+JSON.stringify(diffs));
console.error('ETIKER_REPORT_CHANGED='+String(beforeReport!==afterReport));
throw new Error('intentional Etiker structured generator diagnostic; do not merge this head');
