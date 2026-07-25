import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root=process.cwd();
const previous=spawnSync('git',['show','HEAD^:scripts/coordinate-branch-job.mjs'],{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024});
if(previous.error||previous.status!==0)throw new Error(`Could not load science curation runner\n${previous.stderr||''}`);
const replacements=[
 ["['digitalisering','energi','arbeid','makt','brukere','vedlikehold','kunnskap','autoritet']","['digitalisering','energi','arbeid','makt','kommunikasjon','infrastruktur','kunnskap','autoritet']"],
 ["['kjønn','profesjon','standardisering','teknologi','infrastruktur','finansiering','datamakt','befolkning']","['kjønn','profesjon','standardisering','teknologi','infrastruktur','makt','datamakt','befolkning']"],
 ["['finansiering','hemmelighold','standardisering','teknologisk system','kunnskapsinstitusjoner','autoritet','makt','kommunikasjon']","['industri','informasjonsregime','standardisering','teknologisk system','kunnskapsinstitusjoner','autoritet','makt','kommunikasjon']"]
];
let source=previous.stdout;for(const[before,after]of replacements){if(!source.includes(before))throw new Error(`Expected science binding not found: ${before}`);source=source.replace(before,after);}const target=path.join('/tmp','history-science-v5-5-curation-fixed.mjs');fs.writeFileSync(target,source);await import(`file://${target}?v=${Date.now()}`);
