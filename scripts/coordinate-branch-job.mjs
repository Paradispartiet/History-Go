import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const source='525266f3cc54b3766a75b2f501b5c97590d3c441';
const files=[
  'data/places/natur/vestland/etneelva.json',
  'data/places/natur/vestland/etne/krokavatnet_etneforkastningen.json',
  'data/places/natur/vestland/etne/terrasselandskapet_etne.json',
  'data/stories/stories_etne_natur_rounds_batch5.json',
  'data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch5.json',
  'tests/etne-natur-rounds-batch5.test.js',
  'reports/etne-natur-rounds-batch5/README.md',
  'reports/etne-natur-rounds-batch5/summary.json'
];
for(const rel of files){
  const content=execFileSync('git',['show',`${source}:${rel}`],{cwd:root,encoding:'utf8'});
  const full=path.join(root,rel); await fs.mkdir(path.dirname(full),{recursive:true}); await fs.writeFile(full,content);
}
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const write=async(p,v)=>fs.writeFile(path.join(root,p),JSON.stringify(v,null,2)+'\n');
const storyFile='data/stories/stories_etne_natur_rounds_batch5.json';
const lexFile='data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch5.json';
const ids=['etneelva','krokavatnet_etneforkastningen','terrasselandskapet_etne'];
const sm=await read('data/stories/stories_manifest.json'); sm.files=sm.files||[];
for(const id of ids){const row={category:'natur',entity_id:id,path:storyFile};if(!sm.files.some(x=>x.category===row.category&&x.entity_id===row.entity_id&&x.path===row.path))sm.files.push(row);} await write('data/stories/stories_manifest.json',sm);
const lm=await read('data/leksikon/manifest.json'); lm.files=[...new Set([...(lm.files||[]),lexFile])]; await write('data/leksikon/manifest.json',lm);
await fs.mkdir(path.join(root,'reports/etne-natur-rounds-batch5/validation'),{recursive:true});
await fs.writeFile(path.join(root,'reports/etne-natur-rounds-batch5/replay-source.txt'),`${source}\nReplayed on current main without stale global coordinate report diffs.\n`);
const out=execFileSync(process.execPath,['tests/etne-natur-rounds-batch5.test.js'],{cwd:root,encoding:'utf8'}); await fs.writeFile(path.join(root,'reports/etne-natur-rounds-batch5/validation/round-content-test.txt'),out); console.log(out.trim());
