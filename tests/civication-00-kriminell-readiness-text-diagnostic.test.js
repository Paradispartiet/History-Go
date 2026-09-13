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
try {
  execFileSync(process.execPath, [path.join(ROOT, 'scripts/audit-civication-life-position-role-world-readiness.mjs'), '--write'], { cwd: ROOT, encoding: 'utf8' });
  const afterText = fs.readFileSync(outputPath, 'utf8');
  const b = beforeText.split('\n');
  const a = afterText.split('\n');
  const diffs = [];
  for (let i = 0; i < Math.max(a.length,b.length); i += 1) {
    if (a[i] !== b[i]) diffs.push({ line:i+1, before:b[i] ?? null, after:a[i] ?? null });
    if (diffs.length >= 40) break;
  }
  throw new Error('KRIMINELL_READINESS_TEXT_DIFF=' + JSON.stringify({before_lines:b.length,after_lines:a.length,diffs}));
} finally {
  fs.writeFileSync(outputPath, beforeText);
  fs.writeFileSync(reportPath, beforeReport);
}
