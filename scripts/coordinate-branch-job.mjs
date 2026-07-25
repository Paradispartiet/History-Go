import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=process.cwd();
const previous=spawnSync('git',['show','HEAD^^:scripts/coordinate-branch-job.mjs'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024});
if(previous.error||previous.status!==0)throw new Error(`Could not load original gender curation runner\n${previous.stderr||''}`);
const replacements=[
 ["life:{broader:['livsløp'],related:['barndom','ungdom','alderdom'],distinguish:['generasjon']}","life:{broader:['livsløp'],related:['barndom','ungdom','alderdom'],distinguish:['historisk kategori']}"],
 ["sub:['lov','religion','offentlighet','historisk kategori'","sub:['ekteskap','religion','offentlighet','historisk kategori'"]
];
let source=previous.stdout;for(const[before,after]of replacements){if(!source.includes(before))throw new Error(`Expected gender binding not found: ${before}`);source=source.replace(before,after);}const target=path.join('/tmp','history-gender-v5-5-curation-fixed.mjs');fs.writeFileSync(target,source);await import(`file://${target}?v=${Date.now()}`);
