#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
let implementation = execFileSync('git', ['show', 'HEAD~1:scripts/coordinate-branch-job.mjs'], {
  cwd: root,
  encoding: 'utf8',
});

const oldGate = "execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });";
const diagnosticGate = `try {
  execFileSync('node', ['dist/tools/audit-coordinate-evidence.mjs'], { cwd: root, stdio: 'inherit' });
} catch (error) {
  const report = path.join(root, 'reports/coordinate-evidence-audit.md');
  if (fs.existsSync(report)) console.error('\\n--- coordinate evidence diagnostic ---\\n' + fs.readFileSync(report, 'utf8'));
  throw error;
}`;
if (!implementation.includes(oldGate)) throw new Error('Fant ikke evidence-gaten som skulle instrumenteres');
implementation = implementation.replace(oldGate, diagnosticGate);

const tmp = path.join(root, 'scripts/.coordinate-batch-130-diagnostic.tmp.mjs');
fs.writeFileSync(tmp, implementation);
try {
  await import(pathToFileURL(tmp).href + `?run=${Date.now()}`);
} finally {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}
