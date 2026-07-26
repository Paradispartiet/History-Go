#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root=process.cwd();
const reportDir=path.join(root,'reports/historie-v5');
fs.mkdirSync(reportDir,{recursive:true});
const run=(name,cmd,args)=>{const r=spawnSync(cmd,args,{cwd:root,encoding:'utf8'});fs.writeFileSync(path.join(reportDir,name),`$ ${cmd} ${args.join(' ')}\n${r.stdout||''}${r.stderr||''}`);if(r.status!==0)throw new Error(`${cmd} ${args.join(' ')} failed with ${r.status}`);};
run('historie-v5-5-quality-depth-write.log',process.execPath,['tools/audit-historie-v5-5-quality-depth.mjs','--write-freeze','--reason=Completed individual curation of all 20 V5.5 domains and established permanent depth and hash regression gates.']);
run('historie-v5-5-quality-depth-verify.log',process.execPath,['tools/audit-historie-v5-5-quality-depth.mjs']);
run('historie-v5-5-permanent-validator.log',process.execPath,['tools/validate-historie-v5.mjs']);
run('historie-v5-5-knowledge-check.log','npm',['run','knowledge:canonical:check']);
run('historie-v5-5-quiz-context-audit.log','npm',['run','audit:quiz-production-context']);
run('historie-v5-5-quiz-theory-audit.log','npm',['run','audit:quiz-theory-binding']);
