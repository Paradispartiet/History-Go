#!/usr/bin/env node
'use strict';
const cp=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const target='data/Civication/lifePositionRoleWorldReadiness.json';
const before=fs.readFileSync(path.join(ROOT,target),'utf8');
cp.execFileSync(process.execPath,[path.join(ROOT,'scripts/audit-civication-life-position-role-world-readiness.mjs'),'--write'],{cwd:ROOT,stdio:['ignore','ignore','inherit']});
const after=fs.readFileSync(path.join(ROOT,target),'utf8');
if(before!==after){
  fs.writeFileSync(path.join(ROOT,'/tmp-unused'),'');
  const diff=cp.execFileSync('git',['diff','--no-ext-diff','--',target,'reports/civication-life-position-role-world-readiness.md'],{cwd:ROOT,encoding:'utf8'});
  console.error('SMALLPRESS_READINESS_DIFF_BEGIN\n'+diff+'SMALLPRESS_READINESS_DIFF_END');
  process.exit(1);
}
console.log('Småforlagsnerd readiness generator parity exact');
