import { promises as fs } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root=process.cwd();
const source='38d895b3e64aea6f9663abe9b0ef35e183f6ea7f';
let code=execFileSync('git',['show',`${source}:scripts/coordinate-branch-job.mjs`],{cwd:root,encoding:'utf8'});
const needle='for(const [id,c] of Object.entries(C)){';
if(!code.includes(needle)) throw new Error('Batch 7 loop anchor not found');
const badgeCode=`const canonicalRoundBadges={\n  langfoss_etne:['vann_og_vassdrag','foss_og_stryk','naturvern','friluftsliv','berg_og_knaus'],\n  akrafjorden:['kyst_og_fjord','strandsone','vann_og_vassdrag','friluftsliv'],\n  stordalsvatnet_etne:['innsjo','vann_og_vassdrag','naturvern','fisk_og_amfibier','vannfugl']\n};\nfor(const [id,badges] of Object.entries(canonicalRoundBadges)) P[id].underbadge_ids=[...new Set([...(P[id].underbadge_ids||[]),...badges])];\n\n`;
code=code.replace(needle,badgeCode+needle);
const temp=path.join(root,'scripts/.etne-natur-rounds-batch7-fixed.mjs');
await fs.writeFile(temp,code);
try{await import(pathToFileURL(temp).href+`?v=${Date.now()}`);}finally{await fs.rm(temp,{force:true});}
