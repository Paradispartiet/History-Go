#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const jsonPath = path.join(ROOT, 'data/Civication/lifePositionRoleWorldReadiness.json');
const reportPath = path.join(ROOT, 'reports/civication-life-position-role-world-readiness.md');
const beforeJsonText = fs.readFileSync(jsonPath, 'utf8');
const beforeReport = fs.readFileSync(reportPath, 'utf8');
const before = JSON.parse(beforeJsonText);

execFileSync(process.execPath, [
  path.join(ROOT, 'scripts/audit-civication-life-position-role-world-readiness.mjs'),
  '--write'
], { cwd: ROOT, encoding: 'utf8' });

const afterJsonText = fs.readFileSync(jsonPath, 'utf8');
const afterReport = fs.readFileSync(reportPath, 'utf8');
const after = JSON.parse(afterJsonText);

const diffs = [];
function walk(a, b, p) {
  if (diffs.length >= 80) return;
  if (Object.is(a, b)) return;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) diffs.push({ path:p+'.length', before:a.length, after:b.length });
    const n = Math.max(a.length, b.length);
    for (let i=0;i<n;i++) walk(a[i], b[i], p+'['+i+']');
    return;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) walk(a[k], b[k], p ? p+'.'+k : k);
    return;
  }
  diffs.push({ path:p, before:a, after:b });
}
walk(before, after, '');

console.error('READINESS_JSON_DIFF=' + JSON.stringify(diffs));
console.error('READINESS_JSON_BYTES=' + beforeJsonText.length + '->' + afterJsonText.length);
console.error('READINESS_REPORT_CHANGED=' + String(beforeReport !== afterReport));
process.exitCode = 1;
