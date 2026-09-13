#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const auditPath = path.join(ROOT, 'data/Civication/lifePositionRoleWorldReadiness.json');
const reportPath = path.join(ROOT, 'reports/civication-life-position-role-world-readiness.md');
const beforeText = fs.readFileSync(auditPath, 'utf8');
const beforeReport = fs.readFileSync(reportPath, 'utf8');
const before = JSON.parse(beforeText);
execFileSync(process.execPath, [
  path.join(ROOT, 'scripts/audit-civication-life-position-role-world-readiness.mjs'),
  '--write'
], { cwd: ROOT, encoding: 'utf8' });
const afterText = fs.readFileSync(auditPath, 'utf8');
const afterReport = fs.readFileSync(reportPath, 'utf8');
const after = JSON.parse(afterText);
const beforeByKey = new Map(before.positions.map((row)=>[row.key,row]));
const positionDiffs = after.positions.filter((row)=>JSON.stringify(row)!==JSON.stringify(beforeByKey.get(row.key))).map((row)=>({
  key: row.key,
  before: beforeByKey.get(row.key),
  after: row
}));
console.log('BOHEM_GENERATOR_DEBUG_BEGIN');
process.stderr.write('BOHEM_DIFF_META='+JSON.stringify({
  same_json: beforeText===afterText,
  same_report: beforeReport===afterReport,
  summary_after: after.summary,
  queue_head_after: after.queue.slice(0,3),
  changed_keys: positionDiffs.map(x=>x.key)
})+'\\n');
for (const {key,before,after} of positionDiffs) {
  process.stderr.write('BOHEM_DIFF_ROW='+JSON.stringify({
    key,
    p:[before?.priority_score,after?.priority_score],
    a:[before?.authored_depth,after?.authored_depth],
    t:[before?.evidence?.thematic_source_refs,after?.evidence?.thematic_source_refs],
    e:[before?.evidence?.exact_source_refs,after?.evidence?.exact_source_refs]
  })+'\\n');
}
console.log('BOHEM_GENERATOR_DEBUG_END');
process.stderr.write('BOHEM_GENERATOR_PROBE_VISIBLE\\n');

const audit = after;
const streamPath = 'data/Civication/narratives/leisure/liv_alternativ_bohem.json';
const stream = readJson(streamPath);
const row = audit.positions.find((item)=>item.key==='liv_alternativ/bohem');
assert.ok(row);
assert.equal(row.id, 'bohem');
assert.equal(row.runtime_source, 'open_choice');
assert.equal(row.kind, 'self_selected_life_path');
assert.equal(stream.storylets.length, 14);
assert.equal(row.classification, 'ready');
assert.equal(row.role_world_status, 'role_world_complete');
assert.equal(row.role_world_path, 'data/Civication/roleWorlds/liv_alternativ/liv_alternativ_bohem.json');
assert.equal(row.authored_depth.max_narrative_depth, 14);
assert.deepEqual(row.evidence.exact_source_refs, [streamPath]);
assert.deepEqual(row.evidence.livelihood_templates, []);
assert.equal(row.evidence.livelihood_ref, null);
assert.ok(!audit.queue.some((item)=>item.key==='liv_alternativ/bohem'));
assert.equal(audit.summary.classifications.ready, 16);
assert.equal(audit.summary.classifications.needs_authored_depth, 143);
assert.equal(audit.summary.completed_life_position_role_worlds, 16);
assert.equal(audit.summary.life_position_role_world_complete, 16);
assert.equal(audit.summary.livelihood_backed_positions, 14);
assert.equal(audit.summary.pending_ready_positions, 0);
assert.equal(audit.first_ready, null);
assert.equal(audit.queue[0].key, 'liv_alternativ/nomade');
console.log('civication Liv alternativ Bohem readiness ok: governed depth 14 / no livelihood invention / no pending-ready');
throw new Error('BOHEM_GENERATOR_PROBE_FAIL');
