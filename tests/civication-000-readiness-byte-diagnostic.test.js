#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const jsonPath=path.join(ROOT,'data/Civication/lifePositionRoleWorldReadiness.json');
const reportPath=path.join(ROOT,'reports/civication-life-position-role-world-readiness.md');
const beforeJson=fs.readFileSync(jsonPath,'utf8');
const beforeReport=fs.readFileSync(reportPath,'utf8');
execFileSync(process.execPath,[path.join(ROOT,'scripts/audit-civication-life-position-role-world-readiness.mjs'),'--write'],{cwd:ROOT,stdio:'pipe'});
const afterJson=fs.readFileSync(jsonPath,'utf8');
const afterReport=fs.readFileSync(reportPath,'utf8');
function firstDiff(a,b){const n=Math.min(a.length,b.length);for(let i=0;i<n;i+=1)if(a[i]!==b[i])return i;return a.length===b.length?-1:n;}
function probe(a,b){const i=firstDiff(a,b);return {before_length:a.length,after_length:b.length,first_diff:i,before:i<0?'':a.slice(Math.max(0,i-160),i+360),after:i<0?'':b.slice(Math.max(0,i-160),i+360)};}
console.error('EARLY_READINESS_DIFF '+JSON.stringify({json:probe(beforeJson,afterJson),report:probe(beforeReport,afterReport)}));
throw new Error('diagnostic only; do not merge this head');
