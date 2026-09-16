#!/usr/bin/env node
'use strict';
const cp=require('node:child_process');
cp.execFileSync(process.execPath,['scripts/audit-civication-life-position-role-world-readiness.mjs','--write'],{stdio:'inherit'});
const diff=cp.execFileSync('git',['diff','--','data/Civication/lifePositionRoleWorldReadiness.json','reports/civication-life-position-role-world-readiness.md'],{encoding:'utf8'});
console.error('\n=== READINESS GENERATOR DIFF ===\n'+diff+'\n=== END DIFF ===\n');
process.exit(1);
