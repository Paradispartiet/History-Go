import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const source='3118435a16eaaccc8883051b05d5ad3b2c17c3cb';
const files=[
  'data/places/natur/vestland/langfoss_etne.json',
  'data/places/natur/vestland/akrafjorden.json',
  'data/places/natur/vestland/stordalsvatnet_etne.json',
  'data/stories/stories_etne_natur_rounds_batch7.json',
  'data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch7.json',
  'tests/etne-natur-rounds-batch7.test.js',
  'reports/etne-natur-rounds-batch7/README.md',
  'reports/etne-natur-rounds-batch7/summary.json'
];
for(const rel of files){const content=execFileSync('git',['show',`${source}:${rel}`],{cwd:root,encoding:'utf8'});const full=path.join(root,rel);await fs.mkdir(path.dirname(full),{recursive:true});await fs.writeFile(full,content);}
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const write=async(p,v)=>fs.writeFile(path.join(root,p),JSON.stringify(v,null,2)+'\n');
const storyFile='data/stories/stories_etne_natur_rounds_batch7.json';
const lexFile='data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch7.json';
const ids=['langfoss_etne','akrafjorden','stordalsvatnet_etne'];
const sm=await read('data/stories/stories_manifest.json');sm.files=sm.files||[];for(const id of ids){const row={category:'natur',entity_id:id,path:storyFile};if(!sm.files.some(x=>x.category===row.category&&x.entity_id===row.entity_id&&x.path===row.path))sm.files.push(row);}await write('data/stories/stories_manifest.json',sm);
const lm=await read('data/leksikon/manifest.json');lm.files=[...new Set([...(lm.files||[]),lexFile])];await write('data/leksikon/manifest.json',lm);
await fs.mkdir(path.join(root,'reports/etne-natur-rounds-batch7/validation'),{recursive:true});
await fs.writeFile(path.join(root,'reports/etne-natur-rounds-batch7/replay-source.txt'),`${source}\nReplayed after Kunstnerforbundet coordinate production so shared index and reports include both states.\n`);
const out=execFileSync(process.execPath,['tests/etne-natur-rounds-batch7.test.js'],{cwd:root,encoding:'utf8'});await fs.writeFile(path.join(root,'reports/etne-natur-rounds-batch7/validation/round-content-test.txt'),out);console.log(out.trim());
