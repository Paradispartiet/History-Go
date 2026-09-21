#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const cp=require('node:child_process');
const ROOT=path.resolve(__dirname,'..');
const output=path.join(ROOT,'data/Civication/lifePositionRoleWorldReadiness.json');
const report=path.join(ROOT,'reports/civication-life-position-role-world-readiness.md');
const beforeOutput=fs.readFileSync(output,'utf8');
const beforeReport=fs.readFileSync(report,'utf8');
try {
  cp.execFileSync(process.execPath,['scripts/audit-civication-life-position-role-world-readiness.mjs','--write'],{cwd:ROOT,stdio:'pipe'});
  const generated=JSON.parse(fs.readFileSync(output,'utf8'));
  const tracked=JSON.parse(beforeOutput);
  const streamPath='data/Civication/narratives/leisure/subkultur_gatesmart.json';
  const impacted=generated.positions
    .filter(row=>(row.evidence?.exact_source_refs||[]).includes(streamPath)||(row.evidence?.thematic_source_refs||[]).includes(streamPath))
    .map(row=>({key:row.key,classification:row.classification,priority_score:row.priority_score,authored_depth:row.authored_depth,evidence:row.evidence,role_world_status:row.role_world_status,role_world_path:row.role_world_path}));
  const trackedRow=tracked.positions.find(row=>row.key==='subkultur/gatesmart');
  const generatedRow=generated.positions.find(row=>row.key==='subkultur/gatesmart');
  console.error('GATESMART_DIAGNOSTIC '+JSON.stringify({
    tracked_summary:tracked.summary,
    generated_summary:generated.summary,
    tracked_queue_head:tracked.queue?.[0]||null,
    generated_queue_head:generated.queue?.[0]||null,
    tracked_row:trackedRow,
    generated_row:generatedRow,
    impacted_by_stream:impacted
  },null,2));
} finally {
  fs.writeFileSync(output,beforeOutput,'utf8');
  fs.writeFileSync(report,beforeReport,'utf8');
}
assert.fail('intentional Gatesmart readiness diagnostic');
