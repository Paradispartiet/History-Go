import { promises as fs } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root=process.cwd();
const source='524b40af5c644990e4bdc391e6353e87f8a964d7';
let code=execFileSync('git',['show',`${source}:scripts/coordinate-branch-job.mjs`],{cwd:root,encoding:'utf8'});
const replacements=[
  ["summary:c.story[2],story:c.story[3]","summary:c.story[1],story:c.story[2]"],
  ["arc:{start:c.story[2],middle:c.forna[3]","arc:{start:c.story[1],middle:c.forna[3]"],
  ["popupDesc:c.story[2],wikiText:c.wiki","popupDesc:c.story[1],wikiText:c.wiki"],
  ["one_liner:c.story[2],themes","one_liner:c.story[1],themes"],
  ["why_it_matters:[c.story[2],c.forna[3]]","why_it_matters:[c.story[1],c.forna[3]]"]
];
for(const [from,to] of replacements){if(!code.includes(from))throw new Error(`Missing expected mapping: ${from}`);code=code.replaceAll(from,to);}
const temp=path.join(root,'scripts/.etne-natur-rounds-batch6-fixed.mjs');
await fs.writeFile(temp,code);
try{await import(pathToFileURL(temp).href+`?v=${Date.now()}`);}finally{await fs.rm(temp,{force:true});}
