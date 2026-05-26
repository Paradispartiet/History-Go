import fs from 'fs';import path from 'path';const root=process.cwd();
function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.json')?[path.join(d,e.name)]:[])}
const map=new Map();for(const f of walk(path.join(root,'data/leksikon/places'))){const rows=JSON.parse(fs.readFileSync(f,'utf8'));if(!Array.isArray(rows))continue;rows.forEach((r,i)=>{const id=String(r?.id||'').trim();if(!id)return;const a=map.get(id)||[];a.push(`${path.relative(root,f)}#${i+1} (${r?.place_id||''})`);map.set(id,a);});}
let bad=0;for(const [id,locs] of map){if(locs.length>1){bad++;console.error(`duplicate leksikon id ${id}`);locs.forEach(l=>console.error(`  - ${l}`));}}
if(bad) process.exit(1);console.log('OK: no duplicate leksikon article IDs.');
