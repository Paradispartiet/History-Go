#!/usr/bin/env node
// Exercise the actual candidate data. Temporary manifest activation is always restored.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const ID='minneparken_gamlebyen';
const paths=['data/quiz/manifest.json','data/quizcards/historie/manifest.json','data/stories/stories_manifest.json','data/stories/stories_episode_v1_manifest.json'];
const runtimeFiles=fs.readdirSync('data/runtime',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith('.json')).map(e=>(e.parentPath||e.path)+'/'+e.name);
const originals=new Map([...paths,...runtimeFiles].map(p=>[p,fs.readFileSync(p,'utf8')]));
const update=(p,f)=>{const x=JSON.parse(fs.readFileSync(p,'utf8'));f(x);fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n')};
try {
 update(paths[0],x=>{if(!x.sets.some(s=>s.targetId===ID))x.sets.push({categoryId:'historie',targetId:ID,file:`data/quiz/historie/${ID}_sets.json`});});
 update(paths[1],x=>{const f=`${ID}_quizcard_v1.json`;if(!x.collections.includes(f))x.collections.push(f);});
 update(paths[2],x=>{const f=`data/stories/stories_${ID}.json`;if(!x.files.some(s=>s.path===f))x.files.push({category:'historie',entity_id:ID,path:f});});
 update(paths[3],x=>{const f=`data/stories/stories_${ID}.json`;if(!x.files.includes(f))x.files.push(f);});
 const build=spawnSync(process.execPath,['scripts/build-place-open-payloads.mjs'],{stdio:'inherit',env:process.env});
 if(build.status!==0)throw new Error('Candidate runtime materialization failed');
 const checks=[['tests/minneparken-readonly-app-browser.test.mjs'],['scripts/verify-minneparken-quizcard-real-browser.mjs'],['scripts/verify-minneparken-collections-browser.mjs',ID],['scripts/verify-minneparken-fullquiz-browser.mjs']];
 for(const args of checks){const r=spawnSync(process.execPath,args,{stdio:'inherit',env:process.env});if(r.status!==0)throw new Error('Minneparken browser check failed: '+args[0]+' (exit '+r.status+')');}
} finally {
 for(const [p,s]of originals)if(fs.readFileSync(p,'utf8')!==s)fs.writeFileSync(p,s);
 const after=fs.readdirSync('data/runtime',{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith('.json')).map(e=>(e.parentPath||e.path)+'/'+e.name);
 for(const p of after)if(!originals.has(p))fs.unlinkSync(p);
}
