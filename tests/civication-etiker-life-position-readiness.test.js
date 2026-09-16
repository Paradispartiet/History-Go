#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),'utf8'));
cp.execFileSync(process.execPath,[path.join(ROOT,'scripts/audit-civication-life-position-role-world-readiness.mjs'),'--write'],{cwd:ROOT,stdio:['ignore','pipe','pipe']});
const generatorDiff=cp.execFileSync('git',['diff','--','data/Civication/lifePositionRoleWorldReadiness.json','reports/civication-life-position-role-world-readiness.md'],{cwd:ROOT,encoding:'utf8'});
console.error('ETIKER_GENERATOR_DIFF_START\n'+generatorDiff+'\nETIKER_GENERATOR_DIFF_END');
throw new Error('intentional Etiker generator diagnostic; do not merge this head');
