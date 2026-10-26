'use strict';
// Temporary diagnostic: emits canonical generator output without modifying checked-in fixtures.
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.join(__dirname,'..');
const files=['data/Civication/lifePositionRoleWorldReadiness.json','reports/civication-life-position-role-world-readiness.md'];
const originals=files.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
let output;
try{
  cp.execFileSync(process.execPath,['scripts/audit-civication-life-position-role-world-readiness.mjs','--write'],{cwd:root,stdio:'pipe',timeout:60000});
  output=JSON.stringify(Object.fromEntries(files.map(p=>[p,fs.readFileSync(path.join(root,p),'utf8')])));
}finally{
  files.forEach((p,i)=>fs.writeFileSync(path.join(root,p),originals[i]));
}
const chunk=20000, n=Math.ceil(output.length/chunk);
for(let i=0;i<n;i++)console.log('WAVEF_GENERATED_'+String(i+1).padStart(2,'0')+'_'+String(n).padStart(2,'0')+'='+output.slice(i*chunk,(i+1)*chunk));
process.exitCode=1; // The diagnostic never certifies CI success; remove after applying generated artifacts.
