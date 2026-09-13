#!/usr/bin/env node
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const output=path.join(ROOT,'data/Civication/lifePositionRoleWorldReadiness.json');
const report=path.join(ROOT,'reports/civication-life-position-role-world-readiness.md');
const beforeText=fs.readFileSync(output,'utf8');
const reportText=fs.readFileSync(report,'utf8');
const before=JSON.parse(beforeText);
try{
  execFileSync(process.execPath,[path.join(ROOT,'scripts/audit-civication-life-position-role-world-readiness.mjs'),'--write'],{cwd:ROOT,encoding:'utf8'});
  const after=JSON.parse(fs.readFileSync(output,'utf8'));
  const map=new Map(before.positions.map(x=>[x.key,x]));
  const changed=after.positions.filter(x=>JSON.stringify(map.get(x.key))!==JSON.stringify(x)).map(x=>({key:x.key,before:map.get(x.key)||null,after:x}));
  throw new Error('KRIMINELL_READINESS_DIAGNOSTIC='+JSON.stringify({summary_before:before.summary,summary_after:after.summary,queue_head_before:before.queue[0]||null,queue_head_after:after.queue[0]||null,changed_positions:changed}));
}finally{
  fs.writeFileSync(output,beforeText);
  fs.writeFileSync(report,reportText);
}
