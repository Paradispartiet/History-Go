import { promises as fs } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root=process.cwd();
const source='09a7f74ad04d849d4a163f02a38312b8332bb5cc';
const files=[
  'data/places/natur/vestland/etne/vannes_geologiske_omrade.json',
  'data/places/natur/vestland/etne/flateskar_stordalen.json',
  'data/places/natur/vestland/etne/moreneryggen_skanevik.json',
  'data/stories/stories_etne_natur_rounds_batch6.json',
  'data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch6.json',
  'tests/etne-natur-rounds-batch6.test.js',
  'reports/etne-natur-rounds-batch6/README.md',
  'reports/etne-natur-rounds-batch6/summary.json'
];
for(const rel of files){
  const content=execFileSync('git',['show',`${source}:${rel}`],{cwd:root,encoding:'utf8'});
  const full=path.join(root,rel);await fs.mkdir(path.dirname(full),{recursive:true});await fs.writeFile(full,content);
}
const read=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const write=async(p,v)=>fs.writeFile(path.join(root,p),JSON.stringify(v,null,2)+'\n');
const storyFile='data/stories/stories_etne_natur_rounds_batch6.json';
const lexFile='data/leksikon/places/vestland/etne/natur/leksikon_etne_natur_rounds_batch6.json';
const ids=['vannes_geologiske_omrade','flateskar_stordalen','moreneryggen_skanevik'];
const sm=await read('data/stories/stories_manifest.json');sm.files=sm.files||[];
for(const id of ids){const row={category:'natur',entity_id:id,path:storyFile};if(!sm.files.some(x=>x.category===row.category&&x.entity_id===row.entity_id&&x.path===row.path))sm.files.push(row);}await write('data/stories/stories_manifest.json',sm);
const lm=await read('data/leksikon/manifest.json');lm.files=[...new Set([...(lm.files||[]),lexFile])];await write('data/leksikon/manifest.json',lm);
await fs.mkdir(path.join(root,'reports/etne-natur-rounds-batch6/validation'),{recursive:true});
await fs.writeFile(path.join(root,'reports/etne-natur-rounds-batch6/replay-source.txt'),`${source}\nReplayed on current main without stale global coordinate/index report diffs.\n`);
const out=execFileSync(process.execPath,['tests/etne-natur-rounds-batch6.test.js'],{cwd:root,encoding:'utf8'});await fs.writeFile(path.join(root,'reports/etne-natur-rounds-batch6/validation/round-content-test.txt'),out);console.log(out.trim());
