#!/usr/bin/env node
'use strict';
const {execFileSync}=require('node:child_process');
const path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
execFileSync(process.execPath,['scripts/audit-civication-life-position-role-world-readiness.mjs','--write'],{cwd:ROOT,stdio:'pipe'});
const diff=execFileSync('git',['diff','--','data/Civication/lifePositionRoleWorldReadiness.json','reports/civication-life-position-role-world-readiness.md'],{cwd:ROOT,encoding:'utf8'});
throw new Error('GRUNDERDROMMER_READINESS_DIFF\n'+diff);
