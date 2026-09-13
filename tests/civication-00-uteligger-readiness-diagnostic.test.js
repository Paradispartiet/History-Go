#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const outputPath = path.join(ROOT, 'data/Civication/lifePositionRoleWorldReadiness.json');
const reportPath = path.join(ROOT, 'reports/civication-life-position-role-world-readiness.md');
const beforeText = fs.readFileSync(outputPath, 'utf8');
const beforeReport = fs.readFileSync(reportPath, 'utf8');
const before = JSON.parse(beforeText);
try {
  execFileSync(process.execPath, [
    path.join(ROOT, 'scripts/audit-civication-life-position-role-world-readiness.mjs'),
    '--write'
  ], { cwd: ROOT, encoding: 'utf8' });
  const after = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
  const beforeByKey = new Map((before.positions || []).map((row) => [row.key, row]));
  const changedPositions = (after.positions || [])
    .filter((row) => JSON.stringify(beforeByKey.get(row.key)) !== JSON.stringify(row))
    .map((row) => ({
      key: row.key,
      before: beforeByKey.get(row.key) || null,
      after: row
    }));
  const diag = {
    summary_before: before.summary,
    summary_after: after.summary,
    first_ready_before: before.first_ready,
    first_ready_after: after.first_ready,
    queue_head_before: (before.queue || [])[0] || null,
    queue_head_after: (after.queue || [])[0] || null,
    changed_positions: changedPositions
  };
  throw new Error('UTELIGGER_READINESS_DIAGNOSTIC=' + JSON.stringify(diag));
} finally {
  fs.writeFileSync(outputPath, beforeText);
  fs.writeFileSync(reportPath, beforeReport);
}
console.log('uteligger readiness diagnostic complete');
