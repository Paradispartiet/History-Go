#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const rel = 'data/Civication/lifePositionRoleWorldReadiness.json';
const reportRel = 'reports/civication-life-position-role-world-readiness.md';
const beforeText = fs.readFileSync(path.join(ROOT, rel), 'utf8');
const before = JSON.parse(beforeText);
const beforeReport = fs.readFileSync(path.join(ROOT, reportRel), 'utf8');
execFileSync(process.execPath, [path.join(ROOT, 'scripts/audit-civication-life-position-role-world-readiness.mjs'), '--write'], { cwd: ROOT, stdio: 'pipe' });
const afterText = fs.readFileSync(path.join(ROOT, rel), 'utf8');
const after = JSON.parse(afterText);
const byKey = (rows) => new Map(rows.map((row)=>[row.key,row]));
const a = byKey(before.positions), b = byKey(after.positions);
const positionDiffs=[];
for (const [key,next] of b) {
  const prev=a.get(key);
  if (JSON.stringify(prev)!==JSON.stringify(next)) positionDiffs.push({
    key,
    before: prev ? {classification:prev.classification, role_world_status:prev.role_world_status, authored_depth:prev.authored_depth, evidence:prev.evidence, priority_score:prev.priority_score, next_work:prev.next_work} : null,
    after: {classification:next.classification, role_world_status:next.role_world_status, authored_depth:next.authored_depth, evidence:next.evidence, priority_score:next.priority_score, next_work:next.next_work}
  });
}
console.log('BOHEM_GENERATOR_DEBUG_BEGIN');
console.log(JSON.stringify({
  same_json: beforeText===afterText,
  same_report: beforeReport===fs.readFileSync(path.join(ROOT, reportRel),'utf8'),
  summary_before: before.summary,
  summary_after: after.summary,
  first_ready_before: before.first_ready,
  first_ready_after: after.first_ready,
  queue_head_before: before.queue.slice(0,5),
  queue_head_after: after.queue.slice(0,5),
  position_diffs: positionDiffs
}, null, 2));
console.log('BOHEM_GENERATOR_DEBUG_END');
