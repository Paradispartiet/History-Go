'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const paths=['data/Civication/lifePositionRoleWorldReadiness.json','reports/civication-life-position-role-world-readiness.md'];
const original=paths.map(p=>fs.readFileSync(path.join(root,p),'utf8'));
let data,report,patches=[];
function delta(a,b,at=[]){
 if(JSON.stringify(a)===JSON.stringify(b))return;
 const ao=a&&typeof a==='object', bo=b&&typeof b==='object';
 if(ao&&bo&&Array.isArray(a)===Array.isArray(b)){
  if(Array.isArray(a)&&a.length!==b.length){patches.push({at,value:b});return;}
  for(const key of Object.keys(b))delta(a[key],b[key],at.concat(Array.isArray(b)?Number(key):key));
  for(const key of Object.keys(a))if(!(key in b))patches.push({at:at.concat(Array.isArray(a)?Number(key):key),delete:true});
  return;
 }
 patches.push({at,value:b});
}
try{
 cp.execFileSync(process.execPath,['scripts/audit-civication-life-position-role-world-readiness.mjs','--write'],{cwd:root,timeout:120000});
 data=fs.readFileSync(path.join(root,paths[0]),'utf8');
 report=fs.readFileSync(path.join(root,paths[1]),'utf8');
 delta(JSON.parse(original[0]),JSON.parse(data));
}finally{paths.forEach((p,i)=>fs.writeFileSync(path.join(root,p),original[i]));}
const preview=JSON.parse(original[0]);
for(const p of patches){let node=preview;for(const k of p.at.slice(0,-1))node=node[k];const last=p.at.at(-1);if(p.delete)delete node[last];else node[last]=p.value;}
assert.equal(JSON.stringify(preview,null,2)+'\n',data,'The delta must round-trip the generator output byte for byte');
console.log('WAVEF_DELTA='+JSON.stringify({patches,report}));
console.log('WAVEF_DELTA_DONE='+patches.length);
