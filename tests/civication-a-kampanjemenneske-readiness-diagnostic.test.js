#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const p=path.join(ROOT,'data/Civication/lifePositionRoleWorldReadiness.json');
const before=JSON.parse(fs.readFileSync(p,'utf8'));
execFileSync(process.execPath,[path.join(ROOT,'scripts/audit-civication-life-position-role-world-readiness.mjs'),'--write'],{cwd:ROOT,stdio:['ignore','pipe','pipe']});
const after=JSON.parse(fs.readFileSync(p,'utf8'));
const changed=[];
for(let i=0;i<Math.max(before.positions.length,after.positions.length);i++){
  const a=before.positions[i],b=after.positions[i];
  if(JSON.stringify(a)!==JSON.stringify(b)){
    changed.push({
      i,
      key:b?.key,
      thematic_count:b?.authored_depth?.thematic_source_ref_count,
      thematic_refs:b?.evidence?.thematic_source_refs
    });
  }
}
throw new Error('KAMPANJEMENNESKE_CHANGED_ROWS='+JSON.stringify(changed));
